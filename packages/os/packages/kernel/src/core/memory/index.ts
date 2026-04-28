/**
 * 内存管理模块导出
 */

// 导入并导出类型
import type { 
  FrameAllocatorStats, 
  BitmapAllocatorConfig,
  MemoryStats, 
  MemoryRegion, 
  MemoryMapOptions, 
  VirtualMemorySpace,
  PageFaultInfo,
  MemoryRegionType,
  ProtectionFlags as PF,
} from './types';

export * from './types';

// 导入并导出实现类
import { FrameAllocator } from './frame-allocator';
import { VirtualMemoryManager } from './virtual-memory';

export { FrameAllocator, VirtualMemoryManager };

// 导出内存管理器（高层接口）
export class MemoryManager {
  private frameAllocator: FrameAllocator;
  private virtualMemoryManager: VirtualMemoryManager;

  constructor(config?: {
    totalFrames?: number;
    reservedFrames?: number;
    frameSize?: number;
  }) {
    // 默认配置：假设有1GB物理内存（262144帧）
    const totalFrames = config?.totalFrames || 262144; // 1GB / 4KB
    const reservedFrames = config?.reservedFrames || 256; // 前1MB保留给内核
    const frameSize = config?.frameSize || 4096; // 4KB

    this.frameAllocator = new FrameAllocator({
      totalFrames,
      reservedFrames,
      frameSize,
    });

    this.virtualMemoryManager = new VirtualMemoryManager(this.frameAllocator);
    
    console.log('[MemoryManager] Initialized');
  }

  /**
   * 获取帧分配器
   */
  getFrameAllocator(): FrameAllocator {
    return this.frameAllocator;
  }

  /**
   * 获取虚拟内存管理器
   */
  getVirtualMemoryManager(): VirtualMemoryManager {
    return this.virtualMemoryManager;
  }

  /**
   * 为进程创建地址空间
   */
  createProcessAddressSpace(pid: number) {
    return this.virtualMemoryManager.createAddressSpace(pid);
  }

  /**
   * 销毁进程地址空间
   */
  destroyProcessAddressSpace(pid: number): boolean {
    return this.virtualMemoryManager.destroyAddressSpace(pid);
  }

  /**
   * 分配内存
   */
  alloc(size: number, pid: number = 0, options?: Partial<MemoryMapOptions>): number | null {
    const mapOptions: MemoryMapOptions = {
      size,
      protection: ProtectionFlags.READ | ProtectionFlags.WRITE,
      type: pid === 0 ? MemoryRegionType.KERNEL : MemoryRegionType.USER,
      ...options,
    };

    if (pid === 0) {
      mapOptions.protection |= ProtectionFlags.EXECUTE;
    } else {
      mapOptions.protection |= ProtectionFlags.USER;
    }

    return this.virtualMemoryManager.mapMemory(pid, mapOptions);
  }

  /**
   * 释放内存
   */
  free(virtualAddress: number, size: number, pid: number = 0): boolean {
    return this.virtualMemoryManager.unmapMemory(pid, virtualAddress, size);
  }

  /**
   * 获取内存统计
   */
  getStats() {
    return this.virtualMemoryManager.getStats();
  }

  /**
   * 转储内存信息
   */
  dumpInfo(): void {
    console.log('=== Memory Manager Info ===');
    this.virtualMemoryManager.dumpMemoryInfo();
    console.log('\n=== Frame Allocator Info ===');
    this.frameAllocator.dumpState();
  }

  /**
   * 处理页错误
   */
  handlePageFault(pid: number, virtualAddress: number, isWrite: boolean, isUser: boolean): boolean {
    return this.virtualMemoryManager.handlePageFault(pid, virtualAddress, isWrite, isUser);
  }

  /**
   * 地址转换
   */
  translate(pid: number, virtualAddress: number): number | null {
    return this.virtualMemoryManager.translateAddress(pid, virtualAddress);
  }
}

// 重新导出保护标志常量（方便使用）
import { ProtectionFlags as PF } from './types';
export const ProtectionFlags = PF;