/**
 * 内存管理类型定义
 */

// 内存页大小（4KB）
export const PAGE_SIZE = 4096;

// 物理帧号类型
export type FrameNumber = number;

// 虚拟地址类型
export type VirtualAddress = number;

// 物理地址类型
export type PhysicalAddress = number;

// 页表项标志位
export enum PageTableEntryFlags {
  PRESENT = 1 << 0,      // 页存在于内存中
  WRITABLE = 1 << 1,     // 可写
  USER = 1 << 2,         // 用户模式可访问
  WRITE_THROUGH = 1 << 3, // 写直达
  CACHE_DISABLED = 1 << 4, // 禁用缓存
  ACCESSED = 1 << 5,     // 已访问
  DIRTY = 1 << 6,        // 已修改
  HUGE_PAGE = 1 << 7,    // 大页（2MB或1GB）
  GLOBAL = 1 << 8,       // 全局页（TLB不刷新）
  NO_EXECUTE = 1 << 63,  // 禁止执行（NX位）
}

// 页表项
export interface PageTableEntry {
  frameNumber: FrameNumber;      // 物理帧号
  flags: number;                 // 标志位
}

// 内存保护标志
export enum ProtectionFlags {
  NONE = 0,
  READ = 1 << 0,
  WRITE = 1 << 1,
  EXECUTE = 1 << 2,
  USER = 1 << 3,
}

// 内存区域类型
export enum MemoryRegionType {
  FREE = 'free',         // 空闲区域
  RESERVED = 'reserved', // 保留区域（硬件、BIOS等）
  KERNEL = 'kernel',     // 内核代码/数据
  USER = 'user',         // 用户空间
  HEAP = 'heap',         // 堆
  STACK = 'stack',       // 栈
  MMIO = 'mmio',         // 内存映射IO
  MODULE = 'module',     // 内核模块
}

// 内存区域描述符
export interface MemoryRegion {
  base: VirtualAddress;          // 虚拟地址基址
  size: number;                  // 区域大小（字节）
  type: MemoryRegionType;        // 区域类型
  protection: ProtectionFlags;   // 保护标志
  mappedFrames?: FrameNumber[];  // 映射的物理帧（如果已映射）
}

// 虚拟内存空间
export interface VirtualMemorySpace {
  pid: number;                   // 所属进程ID（0表示内核）
  pageTable: Map<number, PageTableEntry>; // 页表（虚拟页号 -> 页表项）
  regions: MemoryRegion[];       // 内存区域列表
  heapPointer: VirtualAddress;   // 堆指针
  stackPointer: VirtualAddress;  // 栈指针
}

// 内存分配统计
export interface MemoryStats {
  totalPhysicalFrames: number;   // 总物理帧数
  allocatedFrames: number;       // 已分配帧数
  freeFrames: number;            // 空闲帧数
  kernelFrames: number;          // 内核使用的帧数
  userFrames: number;            // 用户进程使用的帧数
  pageFaults: number;            // 页错误次数
  swaps: number;                 // 交换次数
}

// 页错误原因
export enum PageFaultReason {
  NOT_PRESENT = 'not_present',   // 页不存在
  PROTECTION_VIOLATION = 'protection_violation', // 保护违规
  RESERVED_BIT = 'reserved_bit', // 保留位设置
}

// 页错误信息
export interface PageFaultInfo {
  virtualAddress: VirtualAddress; // 出错的虚拟地址
  reason: PageFaultReason;       // 错误原因
  instructionPointer?: number;    // 指令指针（如果可用）
  writeOperation?: boolean;       // 是否为写操作
  userMode?: boolean;            // 是否在用户模式
}

// 内存映射选项
export interface MemoryMapOptions {
  virtualAddress?: VirtualAddress; // 指定虚拟地址（0表示自动分配）
  size: number;                   // 映射大小
  protection: ProtectionFlags;    // 保护标志
  type: MemoryRegionType;         // 区域类型
  shared?: boolean;               // 是否共享内存
  fixed?: boolean;                // 是否固定地址
}

// 物理帧分配器统计
export interface FrameAllocatorStats {
  totalFrames: number;           // 总帧数
  freeFrames: number;            // 空闲帧数
  allocatedFrames: number;       // 已分配帧数
  largestFreeBlock: number;      // 最大连续空闲块
  fragmentation: number;         // 碎片化程度（0-1）
}

// 位图分配器配置
export interface BitmapAllocatorConfig {
  totalFrames: number;           // 总帧数
  reservedFrames: number;        // 保留帧数（从开始预留）
  frameSize: number;             // 帧大小（默认PAGE_SIZE）
}