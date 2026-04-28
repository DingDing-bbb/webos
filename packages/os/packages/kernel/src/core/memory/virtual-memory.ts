/**
 * 虚拟内存管理器
 * 
 * 管理进程的虚拟地址空间，包括页表、内存映射、页错误处理等
 */

import { 
  VirtualAddress, 
  PhysicalAddress, 
  FrameNumber,
  PAGE_SIZE,
  PageTableEntry,
  PageTableEntryFlags,
  MemoryRegion,
  MemoryRegionType,
  ProtectionFlags,
  MemoryMapOptions,
  VirtualMemorySpace,
  PageFaultInfo,
  PageFaultReason,
  MemoryStats,
} from './types';
import { FrameAllocator } from './frame-allocator';

export class VirtualMemoryManager {
  private frameAllocator: FrameAllocator;
  private memorySpaces: Map<number, VirtualMemorySpace> = new Map(); // pid -> 虚拟内存空间
  private kernelSpace: VirtualMemorySpace; // 内核虚拟地址空间
  private stats: MemoryStats;
  private pageFaultHandlers: Map<number, (info: PageFaultInfo) => boolean> = new Map();

  constructor(frameAllocator: FrameAllocator) {
    this.frameAllocator = frameAllocator;
    this.stats = this.createEmptyStats();
    
    // 初始化内核虚拟地址空间
    this.kernelSpace = this.createKernelSpace();
    this.memorySpaces.set(0, this.kernelSpace);
    
    console.log('[VirtualMemoryManager] Initialized');
  }

  /**
   * 创建空统计信息
   */
  private createEmptyStats(): MemoryStats {
    return {
      totalPhysicalFrames: this.frameAllocator.getTotalFrames(),
      allocatedFrames: 0,
      freeFrames: this.frameAllocator.getFreeFrames(),
      kernelFrames: 0,
      userFrames: 0,
      pageFaults: 0,
      swaps: 0,
    };
  }

  /**
   * 创建内核虚拟地址空间
   */
  private createKernelSpace(): VirtualMemorySpace {
    // 内核空间映射关系：
    // 0x00000000 - 0x3FFFFFFF: 内核代码/数据（1GB）
    // 0xC0000000 - 0xFFFFFFFF: 内核高位映射（1GB）
    
    const kernelSpace: VirtualMemorySpace = {
      pid: 0,
      pageTable: new Map(),
      regions: [],
      heapPointer: 0x40000000, // 1GB处开始堆
      stackPointer: 0xC0000000 - PAGE_SIZE, // 内核栈在高位内存底部
    };

    // 映射前256帧到内核空间低位（0-1MB）
    this.mapKernelLowMemory(kernelSpace);
    
    // 映射内核代码/数据区域
    this.mapKernelRegions(kernelSpace);
    
    return kernelSpace;
  }

  /**
   * 映射内核低位内存（0-1MB）
   */
  private mapKernelLowMemory(space: VirtualMemorySpace): void {
    // 映射前256帧（1MB）到虚拟地址0x00000000开始
    const framesToMap = Math.min(256, this.frameAllocator.getTotalFrames());
    
    for (let i = 0; i < framesToMap; i++) {
      const virtualPage = i;
      const frameNumber = i;
      
      // 创建页表项
      const entry: PageTableEntry = {
        frameNumber,
        flags: PageTableEntryFlags.PRESENT | 
               PageTableEntryFlags.WRITABLE | 
               PageTableEntryFlags.GLOBAL,
      };
      
      space.pageTable.set(virtualPage, entry);
      
      // 更新统计
      this.stats.kernelFrames++;
      this.stats.allocatedFrames++;
    }
    
    // 添加内存区域描述
    space.regions.push({
      base: 0x00000000,
      size: framesToMap * PAGE_SIZE,
      type: MemoryRegionType.KERNEL,
      protection: ProtectionFlags.READ | ProtectionFlags.WRITE | ProtectionFlags.EXECUTE,
      mappedFrames: Array.from({ length: framesToMap }, (_, i) => i),
    });
    
    console.log(`[VirtualMemoryManager] Mapped ${framesToMap} frames to kernel low memory (0x0-0x${(framesToMap * PAGE_SIZE).toString(16)})`);
  }

  /**
   * 映射内核区域
   */
  private mapKernelRegions(space: VirtualMemorySpace): void {
    // 内核代码区域（0x100000-0x200000，1MB）
    space.regions.push({
      base: 0x00100000,
      size: 0x00100000, // 1MB
      type: MemoryRegionType.KERNEL,
      protection: ProtectionFlags.READ | ProtectionFlags.EXECUTE,
    });
    
    // 内核数据区域（0x200000-0x400000，2MB）
    space.regions.push({
      base: 0x00200000,
      size: 0x00200000, // 2MB
      type: MemoryRegionType.KERNEL,
      protection: ProtectionFlags.READ | ProtectionFlags.WRITE,
    });
    
    // 内核堆区域（0x40000000开始，256MB）
    space.regions.push({
      base: 0x40000000,
      size: 0x10000000, // 256MB
      type: MemoryRegionType.HEAP,
      protection: ProtectionFlags.READ | ProtectionFlags.WRITE,
    });
    
    // 内核栈区域（0xC0000000-0xC0100000，1MB）
    space.regions.push({
      base: 0xC0000000,
      size: 0x00100000, // 1MB
      type: MemoryRegionType.STACK,
      protection: ProtectionFlags.READ | ProtectionFlags.WRITE,
    });
  }

  /**
   * 为进程创建虚拟地址空间
   */
  createAddressSpace(pid: number): VirtualMemorySpace {
    if (this.memorySpaces.has(pid)) {
      throw new Error(`Address space already exists for PID ${pid}`);
    }
    
    // 用户空间布局：
    // 0x00000000 - 0x7FFFFFFF: 用户空间（2GB）
    // 0x80000000 - 0xBFFFFFFF: 共享库/映射区域（1GB）
    
    const userSpace: VirtualMemorySpace = {
      pid,
      pageTable: new Map(),
      regions: [],
      heapPointer: 0x00400000, // 程序加载后开始堆（4MB）
      stackPointer: 0xBFFFFFFF - PAGE_SIZE, // 用户栈在用户空间顶部
    };
    
    // 添加基本的用户区域
    userSpace.regions.push({
      base: 0x00000000,
      size: 0x00400000, // 4MB（程序代码/数据）
      type: MemoryRegionType.USER,
      protection: ProtectionFlags.READ | ProtectionFlags.EXECUTE | ProtectionFlags.USER,
    });
    
    userSpace.regions.push({
      base: 0x00400000,
      size: 0x10000000, // 256MB（用户堆）
      type: MemoryRegionType.HEAP,
      protection: ProtectionFlags.READ | ProtectionFlags.WRITE | ProtectionFlags.USER,
    });
    
    userSpace.regions.push({
      base: 0xB0000000,
      size: 0x0FFFFFFF, // 256MB（用户栈区域）
      type: MemoryRegionType.STACK,
      protection: ProtectionFlags.READ | ProtectionFlags.WRITE | ProtectionFlags.USER,
    });
    
    this.memorySpaces.set(pid, userSpace);
    
    console.log(`[VirtualMemoryManager] Created address space for PID ${pid}`);
    return userSpace;
  }

  /**
   * 销毁进程虚拟地址空间
   */
  destroyAddressSpace(pid: number): boolean {
    const space = this.memorySpaces.get(pid);
    
    if (!space) {
      console.warn(`[VirtualMemoryManager] Address space not found for PID ${pid}`);
      return false;
    }
    
    // 释放所有已映射的物理帧
    for (const region of space.regions) {
      if (region.mappedFrames) {
        this.frameAllocator.freeFrames(region.mappedFrames);
        
        // 更新统计
        this.stats.userFrames -= region.mappedFrames.length;
        this.stats.allocatedFrames -= region.mappedFrames.length;
      }
    }
    
    // 移除内存空间
    this.memorySpaces.delete(pid);
    
    console.log(`[VirtualMemoryManager] Destroyed address space for PID ${pid}`);
    return true;
  }

  /**
   * 映射虚拟内存区域
   */
  mapMemory(pid: number, options: MemoryMapOptions): VirtualAddress | null {
    const space = this.memorySpaces.get(pid);
    
    if (!space) {
      console.error(`[VirtualMemoryManager] Address space not found for PID ${pid}`);
      return null;
    }
    
    // 计算需要的帧数
    const framesNeeded = Math.ceil(options.size / PAGE_SIZE);
    
    // 分配物理帧
    const frames = this.frameAllocator.allocFrames(framesNeeded);
    if (!frames) {
      console.error(`[VirtualMemoryManager] Failed to allocate ${framesNeeded} frames`);
      return null;
    }
    
    // 确定虚拟地址
    let virtualAddress = options.virtualAddress || 0;
    if (virtualAddress === 0) {
      // 自动分配地址
      virtualAddress = this.findFreeVirtualAddress(space, options.size);
      if (virtualAddress === 0) {
        this.frameAllocator.freeFrames(frames);
        console.error(`[VirtualMemoryManager] No free virtual address space for size ${options.size}`);
        return null;
      }
    }
    
    // 映射每一帧
    for (let i = 0; i < framesNeeded; i++) {
      const virtualPage = Math.floor(virtualAddress / PAGE_SIZE) + i;
      const frameNumber = frames[i];
      
      // 创建页表项
      let flags = this.protectionToPageFlags(options.protection);
      if (pid === 0) {
        flags |= PageTableEntryFlags.GLOBAL;
      }
      
      const entry: PageTableEntry = {
        frameNumber,
        flags,
      };
      
      space.pageTable.set(virtualPage, entry);
    }
    
    // 创建内存区域描述
    const region: MemoryRegion = {
      base: virtualAddress,
      size: options.size,
      type: options.type,
      protection: options.protection,
      mappedFrames: frames,
    };
    
    space.regions.push(region);
    
    // 更新统计
    if (pid === 0) {
      this.stats.kernelFrames += frames.length;
    } else {
      this.stats.userFrames += frames.length;
    }
    this.stats.allocatedFrames += frames.length;
    
    console.log(`[VirtualMemoryManager] Mapped ${options.size} bytes at 0x${virtualAddress.toString(16)} for PID ${pid}`);
    return virtualAddress;
  }

  /**
   * 取消映射虚拟内存区域
   */
  unmapMemory(pid: number, virtualAddress: VirtualAddress, size: number): boolean {
    const space = this.memorySpaces.get(pid);
    
    if (!space) {
      console.error(`[VirtualMemoryManager] Address space not found for PID ${pid}`);
      return false;
    }
    
    // 查找包含该地址的区域
    const regionIndex = space.regions.findIndex(r => 
      virtualAddress >= r.base && virtualAddress < r.base + r.size
    );
    
    if (regionIndex === -1) {
      console.error(`[VirtualMemoryManager] No region found at 0x${virtualAddress.toString(16)}`);
      return false;
    }
    
    const region = space.regions[regionIndex];
    
    // 检查是否完全匹配整个区域
    if (virtualAddress !== region.base || size !== region.size) {
      console.error(`[VirtualMemoryManager] Partial unmapping not supported yet`);
      return false;
    }
    
    // 释放物理帧
    if (region.mappedFrames) {
      this.frameAllocator.freeFrames(region.mappedFrames);
      
      // 更新统计
      if (pid === 0) {
        this.stats.kernelFrames -= region.mappedFrames.length;
      } else {
        this.stats.userFrames -= region.mappedFrames.length;
      }
      this.stats.allocatedFrames -= region.mappedFrames.length;
    }
    
    // 从页表中移除映射
    const startPage = Math.floor(virtualAddress / PAGE_SIZE);
    const endPage = Math.floor((virtualAddress + size - 1) / PAGE_SIZE);
    
    for (let page = startPage; page <= endPage; page++) {
      space.pageTable.delete(page);
    }
    
    // 移除区域
    space.regions.splice(regionIndex, 1);
    
    console.log(`[VirtualMemoryManager] Unmapped ${size} bytes at 0x${virtualAddress.toString(16)} for PID ${pid}`);
    return true;
  }

  /**
   * 查找空闲虚拟地址
   */
  private findFreeVirtualAddress(space: VirtualMemorySpace, size: number): VirtualAddress {
    // 简化实现：在用户堆区域之后查找
    // 实际系统需要更复杂的空闲空间管理
    
    const regions = space.regions.sort((a, b) => a.base - b.base);
    
    // 对于内核空间，从0x40000000（1GB）开始搜索
    // 对于用户空间，从0x80000000（2GB）开始搜索
    const searchStart = space.pid === 0 ? 0x40000000 : 0x80000000;
    
    // 在现有区域之间查找空隙
    for (let i = 0; i < regions.length - 1; i++) {
      const current = regions[i];
      const next = regions[i + 1];
      const gapStart = current.base + current.size;
      const gapSize = next.base - gapStart;
      
      if (gapSize >= size && gapStart >= searchStart) {
        // 对齐到页边界
        return Math.ceil(gapStart / PAGE_SIZE) * PAGE_SIZE;
      }
    }
    
    // 如果现有区域之后有空间，使用最后一个区域之后
    if (regions.length > 0) {
      const lastRegion = regions[regions.length - 1];
      const candidate = lastRegion.base + lastRegion.size;
      if (candidate >= searchStart) {
        // 对齐到页边界
        return Math.ceil(candidate / PAGE_SIZE) * PAGE_SIZE;
      }
    }
    
    // 如果还没有区域，使用搜索起点
    return Math.ceil(searchStart / PAGE_SIZE) * PAGE_SIZE;
  }

  /**
   * 保护标志转换为页标志
   */
  private protectionToPageFlags(protection: ProtectionFlags): number {
    let flags = PageTableEntryFlags.PRESENT;
    
    if (protection & ProtectionFlags.WRITE) {
      flags |= PageTableEntryFlags.WRITABLE;
    }
    
    if (protection & ProtectionFlags.USER) {
      flags |= PageTableEntryFlags.USER;
    }
    
    // NX位（如果支持且没有EXECUTE权限）
    if (!(protection & ProtectionFlags.EXECUTE)) {
      flags |= PageTableEntryFlags.NO_EXECUTE;
    }
    
    return flags;
  }

  /**
   * 处理页错误
   */
  handlePageFault(pid: number, virtualAddress: VirtualAddress, isWrite: boolean, isUser: boolean): boolean {
    this.stats.pageFaults++;
    
    const space = this.memorySpaces.get(pid);
    if (!space) {
      console.error(`[VirtualMemoryManager] Page fault in non-existent address space PID ${pid}`);
      return false;
    }
    
    const pageNumber = Math.floor(virtualAddress / PAGE_SIZE);
    
    // 检查页是否已在页表中
    if (space.pageTable.has(pageNumber)) {
      const entry = space.pageTable.get(pageNumber)!;
      
      // 检查保护违规
      if (isWrite && !(entry.flags & PageTableEntryFlags.WRITABLE)) {
        console.error(`[VirtualMemoryManager] Page protection violation: write to read-only page 0x${virtualAddress.toString(16)}`);
        return false;
      }
      
      if (isUser && !(entry.flags & PageTableEntryFlags.USER)) {
        console.error(`[VirtualMemoryManager] Page protection violation: user access to kernel page 0x${virtualAddress.toString(16)}`);
        return false;
      }
      
      // 页存在但被标记为不存在？重新设置PRESENT标志
      if (!(entry.flags & PageTableEntryFlags.PRESENT)) {
        entry.flags |= PageTableEntryFlags.PRESENT;
        console.log(`[VirtualMemoryManager] Page 0x${virtualAddress.toString(16)} marked present`);
        return true;
      }
      
      console.error(`[VirtualMemoryManager] Unexpected page fault for already mapped page 0x${virtualAddress.toString(16)}`);
      return false;
    }
    
    // 页不在页表中，需要分配新页
    const frame = this.frameAllocator.allocFrame();
    if (!frame) {
      console.error(`[VirtualMemoryManager] No free frames for page fault at 0x${virtualAddress.toString(16)}`);
      return false;
    }
    
    // 确定保护标志
    let protection = ProtectionFlags.READ;
    if (isWrite) protection |= ProtectionFlags.WRITE;
    if (isUser) protection |= ProtectionFlags.USER;
    
    let flags = this.protectionToPageFlags(protection);
    if (pid === 0) {
      flags |= PageTableEntryFlags.GLOBAL;
    }
    
    // 创建页表项
    const entry: PageTableEntry = {
      frameNumber: frame,
      flags,
    };
    
    space.pageTable.set(pageNumber, entry);
    
    // 更新统计
    this.stats.allocatedFrames++;
    if (pid === 0) {
      this.stats.kernelFrames++;
    } else {
      this.stats.userFrames++;
    }
    
    console.log(`[VirtualMemoryManager] Page fault handled: allocated frame ${frame} for page 0x${virtualAddress.toString(16)}`);
    return true;
  }

  /**
   * 获取页表项
   */
  getPageTableEntry(pid: number, virtualAddress: VirtualAddress): PageTableEntry | null {
    const space = this.memorySpaces.get(pid);
    if (!space) {
      return null;
    }
    
    const pageNumber = Math.floor(virtualAddress / PAGE_SIZE);
    return space.pageTable.get(pageNumber) || null;
  }

  /**
   * 虚拟地址转换为物理地址
   */
  translateAddress(pid: number, virtualAddress: VirtualAddress): PhysicalAddress | null {
    const entry = this.getPageTableEntry(pid, virtualAddress);
    
    if (!entry || !(entry.flags & PageTableEntryFlags.PRESENT)) {
      return null;
    }
    
    const offset = virtualAddress % PAGE_SIZE;
    return (entry.frameNumber * PAGE_SIZE) + offset;
  }

  /**
   * 获取内存统计信息
   */
  getStats(): MemoryStats {
    // 更新空闲帧数
    this.stats.freeFrames = this.frameAllocator.getFreeFrames();
    this.stats.totalPhysicalFrames = this.frameAllocator.getTotalFrames();
    
    return { ...this.stats };
  }

  /**
   * 获取进程内存空间
   */
  getAddressSpace(pid: number): VirtualMemorySpace | null {
    return this.memorySpaces.get(pid) || null;
  }

  /**
   * 转储内存信息（调试用）
   */
  dumpMemoryInfo(): void {
    console.log('=== Virtual Memory Manager Info ===');
    
    const stats = this.getStats();
    console.log(`Total physical frames: ${stats.totalPhysicalFrames} (${(stats.totalPhysicalFrames * PAGE_SIZE / (1024*1024)).toFixed(2)}MB)`);
    console.log(`Allocated frames: ${stats.allocatedFrames} (${(stats.allocatedFrames * PAGE_SIZE / (1024*1024)).toFixed(2)}MB)`);
    console.log(`Free frames: ${stats.freeFrames} (${(stats.freeFrames * PAGE_SIZE / (1024*1024)).toFixed(2)}MB)`);
    console.log(`Kernel frames: ${stats.kernelFrames}`);
    console.log(`User frames: ${stats.userFrames}`);
    console.log(`Page faults: ${stats.pageFaults}`);
    console.log(`Swaps: ${stats.swaps}`);
    
    console.log('\nAddress spaces:');
    this.memorySpaces.forEach((space, pid) => {
      console.log(`  PID ${pid}: ${space.regions.length} regions, ${space.pageTable.size} page table entries`);
      
      if (process.env.NODE_ENV === 'development') {
        // 显示区域详情
        space.regions.forEach(region => {
          console.log(`    Region at 0x${region.base.toString(16)}-0x${(region.base + region.size - 1).toString(16)}: ${region.type} (${region.mappedFrames?.length || 0} frames)`);
        });
      }
    });
  }
}