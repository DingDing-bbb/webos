/**
 * 物理帧分配器 - 基于位图
 * 
 * 管理物理内存帧的分配和释放
 * 预留前256帧给内核（如果总帧数足够）
 */

import { 
  FrameNumber, 
  PAGE_SIZE, 
  FrameAllocatorStats,
  BitmapAllocatorConfig,
} from './types';

export class FrameAllocator {
  private bitmap: Uint8Array;          // 位图（0=空闲，1=已分配）
  private totalFrames: number;         // 总帧数
  private reservedFrames: number;      // 保留帧数
  private frameSize: number;           // 帧大小（字节）
  private allocatedFrames: Set<FrameNumber> = new Set(); // 已分配帧集合（用于快速查找）

  constructor(config: BitmapAllocatorConfig) {
    this.totalFrames = config.totalFrames;
    this.reservedFrames = config.reservedFrames;
    this.frameSize = config.frameSize || PAGE_SIZE;

    // 计算位图大小（每个字节8位，每位表示一个帧）
    const bitmapSize = Math.ceil(this.totalFrames / 8);
    this.bitmap = new Uint8Array(bitmapSize);

    // 标记保留帧为已分配
    this.markReservedFrames();
    
    console.log(`[FrameAllocator] Initialized with ${this.totalFrames} frames (${this.totalFrames * this.frameSize / (1024*1024)}MB)`);
    console.log(`[FrameAllocator] Reserved ${this.reservedFrames} frames for kernel`);
  }

  /**
   * 标记保留帧
   */
  private markReservedFrames(): void {
    for (let i = 0; i < this.reservedFrames && i < this.totalFrames; i++) {
      this.setBit(i, true);
      this.allocatedFrames.add(i);
    }
  }

  /**
   * 设置位图位
   */
  private setBit(frameNumber: FrameNumber, allocated: boolean): void {
    const byteIndex = Math.floor(frameNumber / 8);
    const bitIndex = frameNumber % 8;
    
    if (allocated) {
      this.bitmap[byteIndex] |= (1 << bitIndex);
    } else {
      this.bitmap[byteIndex] &= ~(1 << bitIndex);
    }
  }

  /**
   * 检查位图位
   */
  private isBitSet(frameNumber: FrameNumber): boolean {
    const byteIndex = Math.floor(frameNumber / 8);
    const bitIndex = frameNumber % 8;
    
    if (byteIndex >= this.bitmap.length) {
      throw new Error(`Frame number ${frameNumber} out of range`);
    }
    
    return (this.bitmap[byteIndex] & (1 << bitIndex)) !== 0;
  }

  /**
   * 分配一个物理帧
   */
  allocFrame(): FrameNumber | null {
    // 查找第一个空闲帧
    for (let frame = this.reservedFrames; frame < this.totalFrames; frame++) {
      if (!this.isBitSet(frame) && !this.allocatedFrames.has(frame)) {
        this.setBit(frame, true);
        this.allocatedFrames.add(frame);
        
        console.log(`[FrameAllocator] Allocated frame ${frame}`);
        return frame;
      }
    }
    
    // 如果没有找到空闲帧，尝试紧凑分配（检查保留帧之后的所有帧）
    for (let frame = 0; frame < this.totalFrames; frame++) {
      if (!this.isBitSet(frame) && !this.allocatedFrames.has(frame)) {
        this.setBit(frame, true);
        this.allocatedFrames.add(frame);
        
        console.warn(`[FrameAllocator] Allocated frame ${frame} (fallback after compaction)`);
        return frame;
      }
    }
    
    console.error('[FrameAllocator] No free frames available');
    return null;
  }

  /**
   * 分配连续物理帧
   */
  allocFrames(count: number): FrameNumber[] | null {
    if (count <= 0) {
      return [];
    }
    
    if (count === 1) {
      const frame = this.allocFrame();
      return frame !== null ? [frame] : null;
    }
    
    // 查找连续空闲帧
    for (let startFrame = this.reservedFrames; startFrame <= this.totalFrames - count; startFrame++) {
      let found = true;
      
      // 检查是否连续空闲
      for (let i = 0; i < count; i++) {
        if (this.isBitSet(startFrame + i) || this.allocatedFrames.has(startFrame + i)) {
          found = false;
          break;
        }
      }
      
      if (found) {
        const frames: FrameNumber[] = [];
        for (let i = 0; i < count; i++) {
          const frame = startFrame + i;
          this.setBit(frame, true);
          this.allocatedFrames.add(frame);
          frames.push(frame);
        }
        
        console.log(`[FrameAllocator] Allocated ${count} contiguous frames starting at ${startFrame}`);
        return frames;
      }
    }
    
    console.error(`[FrameAllocator] Failed to allocate ${count} contiguous frames`);
    return null;
  }

  /**
   * 释放物理帧
   */
  freeFrame(frameNumber: FrameNumber): boolean {
    if (frameNumber < 0 || frameNumber >= this.totalFrames) {
      console.error(`[FrameAllocator] Invalid frame number: ${frameNumber}`);
      return false;
    }
    
    if (frameNumber < this.reservedFrames) {
      console.warn(`[FrameAllocator] Cannot free reserved frame ${frameNumber}`);
      return false;
    }
    
    if (!this.isBitSet(frameNumber) && !this.allocatedFrames.has(frameNumber)) {
      console.warn(`[FrameAllocator] Frame ${frameNumber} was not allocated`);
      return false;
    }
    
    this.setBit(frameNumber, false);
    this.allocatedFrames.delete(frameNumber);
    
    console.log(`[FrameAllocator] Freed frame ${frameNumber}`);
    return true;
  }

  /**
   * 释放连续物理帧
   */
  freeFrames(frames: FrameNumber[]): boolean {
    if (frames.length === 0) {
      return true;
    }
    
    let allFreed = true;
    for (const frame of frames) {
      if (!this.freeFrame(frame)) {
        allFreed = false;
      }
    }
    
    return allFreed;
  }

  /**
   * 检查帧是否已分配
   */
  isFrameAllocated(frameNumber: FrameNumber): boolean {
    if (frameNumber < 0 || frameNumber >= this.totalFrames) {
      return false;
    }
    
    return this.isBitSet(frameNumber) || this.allocatedFrames.has(frameNumber);
  }

  /**
   * 获取分配器统计信息
   */
  getStats(): FrameAllocatorStats {
    let freeFrames = 0;
    let allocatedFrames = 0;
    let largestFreeBlock = 0;
    let currentBlock = 0;
    
    // 计算统计信息
    for (let frame = 0; frame < this.totalFrames; frame++) {
      const allocated = this.isFrameAllocated(frame);
      
      if (allocated) {
        allocatedFrames++;
        if (currentBlock > largestFreeBlock) {
          largestFreeBlock = currentBlock;
        }
        currentBlock = 0;
      } else {
        freeFrames++;
        currentBlock++;
      }
    }
    
    // 检查最后的空闲块
    if (currentBlock > largestFreeBlock) {
      largestFreeBlock = currentBlock;
    }
    
    // 计算碎片化程度（0 = 完全连续，1 = 高度碎片化）
    // 简单实现：已分配帧之间的平均间隙
    const fragmentation = allocatedFrames > 0 
      ? (this.totalFrames - largestFreeBlock - allocatedFrames) / (this.totalFrames - allocatedFrames)
      : 0;
    
    return {
      totalFrames: this.totalFrames,
      freeFrames,
      allocatedFrames,
      largestFreeBlock,
      fragmentation: Math.max(0, Math.min(1, fragmentation)),
    };
  }

  /**
   * 获取帧物理地址
   */
  frameToPhysical(frameNumber: FrameNumber): number {
    if (frameNumber < 0 || frameNumber >= this.totalFrames) {
      throw new Error(`Invalid frame number: ${frameNumber}`);
    }
    
    return frameNumber * this.frameSize;
  }

  /**
   * 物理地址转帧号
   */
  physicalToFrame(physicalAddress: number): FrameNumber {
    const frameNumber = Math.floor(physicalAddress / this.frameSize);
    
    if (frameNumber < 0 || frameNumber >= this.totalFrames) {
      throw new Error(`Physical address 0x${physicalAddress.toString(16)} out of range`);
    }
    
    return frameNumber;
  }

  /**
   * 获取帧大小
   */
  getFrameSize(): number {
    return this.frameSize;
  }

  /**
   * 获取总帧数
   */
  getTotalFrames(): number {
    return this.totalFrames;
  }

  /**
   * 获取空闲帧数
   */
  getFreeFrames(): number {
    const stats = this.getStats();
    return stats.freeFrames;
  }

  /**
   * 获取已分配帧数
   */
  getAllocatedFrames(): number {
    const stats = this.getStats();
    return stats.allocatedFrames;
  }

  /**
   * 重置分配器（仅用于测试）
   */
  reset(): void {
    this.bitmap.fill(0);
    this.allocatedFrames.clear();
    this.markReservedFrames();
    
    console.log('[FrameAllocator] Reset complete');
  }

  /**
   * 转储分配器状态（调试用）
   */
  dumpState(): void {
    const stats = this.getStats();
    
    console.log('=== Frame Allocator State ===');
    console.log(`Total frames: ${stats.totalFrames}`);
    console.log(`Free frames: ${stats.freeFrames}`);
    console.log(`Allocated frames: ${stats.allocatedFrames}`);
    console.log(`Largest free block: ${stats.largestFreeBlock} frames`);
    console.log(`Fragmentation: ${(stats.fragmentation * 100).toFixed(2)}%`);
    console.log(`Frame size: ${this.frameSize} bytes (${this.frameSize/1024}KB)`);
    
    // 显示前128帧的状态
    console.log('\nFirst 128 frames:');
    let line = '';
    for (let i = 0; i < Math.min(128, this.totalFrames); i++) {
      if (i > 0 && i % 64 === 0) {
        console.log(line);
        line = '';
      }
      line += this.isFrameAllocated(i) ? 'X' : '.';
    }
    if (line) {
      console.log(line);
    }
  }
}