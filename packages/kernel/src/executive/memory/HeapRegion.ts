/**
 * @fileoverview Heap Region Management
 * 
 * Manages memory regions within a process heap. Provides allocation,
 * deallocation, and tracking of memory blocks within a contiguous
 * address space region.
 * 
 * @module executive/memory/HeapRegion
 * @version 1.0.0
 */

import type { PID } from '../types';
import {
  MemoryProtection,
  MemoryRegionType,
  MemoryState,
  type MemoryRegionInfo,
  type HeapAllocation,
  type HeapStats,
} from './types';

/**
 * Memory block header stored at the beginning of each allocation
 */
interface BlockHeader {
  /** Size of the block including header */
  size: number;
  /** Whether the block is free */
  isFree: boolean;
  /** Previous block offset (for coalescing) */
  prevOffset: number;
  /** Magic number for integrity checking */
  magic: number;
}

/**
 * Free block entry (stored in free list)
 */
interface FreeBlock extends BlockHeader {
  /** Next free block in list */
  nextFree: number;
  /** Previous free block in list */
  prevFree: number;
}

/**
 * Heap Region
 * 
 * Represents a contiguous region of memory used for heap allocation.
 * Implements a simple boundary-tag allocator with free list management.
 */
export class HeapRegion {
  /** Region base address */
  public readonly baseAddress: number;

  /** Region size in bytes */
  public readonly size: number;

  /** Process that owns this region */
  public readonly pid: PID;

  /** Memory protection flags */
  public protection: MemoryProtection;

  /** Region type */
  public readonly regionType: MemoryRegionType;

  /** The simulated memory buffer */
  private _buffer: Uint8Array;

  /** Free list head offset */
  private _freeListHead: number = 0;

  /** Statistics */
  private _stats: HeapStats;

  /** Block header size */
  private readonly HEADER_SIZE = 32;

  /** Magic number for integrity */
  private readonly MAGIC = 0x48454150; // 'HEAP'

  /** Minimum allocation size */
  private readonly MIN_ALLOC_SIZE = 16;

  /**
   * Create a new heap region
   */
  constructor(
    baseAddress: number,
    size: number,
    pid: PID,
    protection: MemoryProtection = MemoryProtection.READ_WRITE
  ) {
    this.baseAddress = baseAddress;
    this.size = size;
    this.pid = pid;
    this.protection = protection;
    this.regionType = MemoryRegionType.HEAP;

    // Create simulated memory buffer
    this._buffer = new Uint8Array(size);

    // Initialize statistics
    this._stats = {
      totalSize: size,
      allocatedBytes: 0,
      freeBytes: size - this.HEADER_SIZE,
      allocationCount: 0,
      freeBlockCount: 1,
      largestFreeBlock: size - this.HEADER_SIZE,
      smallestFreeBlock: size - this.HEADER_SIZE,
      peakAllocated: 0,
      totalAllocations: 0,
      totalDeallocations: 0,
      allocationFailures: 0,
    };

    // Initialize with a single free block
    this.initializeFreeBlock();
  }

  /**
   * Initialize the initial free block
   */
  private initializeFreeBlock(): void {
    const offset = 0;
    const freeBlock: FreeBlock = {
      size: this.size,
      isFree: true,
      prevOffset: 0,
      magic: this.MAGIC,
      nextFree: 0,
      prevFree: 0,
    };

    this.writeBlockHeader(offset, freeBlock);
    this._freeListHead = offset;
  }

  /**
   * Read block header at offset
   */
  private readBlockHeader(offset: number): BlockHeader {
    const view = new DataView(this._buffer.buffer, offset);
    return {
      size: view.getUint32(0, true),
      isFree: view.getUint8(4) !== 0,
      prevOffset: view.getUint32(8, true),
      magic: view.getUint32(12, true),
    };
  }

  /**
   * Write block header at offset
   */
  private writeBlockHeader(offset: number, header: Partial<BlockHeader>): void {
    const view = new DataView(this._buffer.buffer, offset);
    
    if (header.size !== undefined) {
      view.setUint32(0, header.size, true);
    }
    if (header.isFree !== undefined) {
      view.setUint8(4, header.isFree ? 1 : 0);
    }
    if (header.prevOffset !== undefined) {
      view.setUint32(8, header.prevOffset, true);
    }
    if (header.magic !== undefined) {
      view.setUint32(12, header.magic, true);
    }
  }

  /**
   * Allocate memory from this region
   */
  public allocate(size: number, alignment: number = 8): HeapAllocation | null {
    // Adjust size for header and alignment
    const alignedSize = this.alignUp(size + this.HEADER_SIZE, alignment);
    const minSize = Math.max(alignedSize, this.MIN_ALLOC_SIZE + this.HEADER_SIZE);

    // Find a suitable free block (first-fit)
    const blockOffset = this.findFreeBlock(minSize);
    
    if (blockOffset < 0) {
      this._stats.allocationFailures++;
      return null;
    }

    const block = this.readBlockHeader(blockOffset);
    const remainingSize = block.size - minSize;

    // Split block if there's enough space left
    if (remainingSize >= this.MIN_ALLOC_SIZE + this.HEADER_SIZE) {
      this.splitBlock(blockOffset, minSize);
    } else {
      // Use the whole block
      this.removeFromFreeList(blockOffset);
      this.writeBlockHeader(blockOffset, { isFree: false });
    }

    // Update statistics
    const allocatedSize = this.readBlockHeader(blockOffset).size;
    this._stats.allocatedBytes += allocatedSize - this.HEADER_SIZE;
    this._stats.freeBytes -= allocatedSize;
    this._stats.allocationCount++;
    this._stats.totalAllocations++;
    
    if (this._stats.allocatedBytes > this._stats.peakAllocated) {
      this._stats.peakAllocated = this._stats.allocatedBytes;
    }

    this.updateFreeBlockStats();

    return {
      address: this.baseAddress + blockOffset + this.HEADER_SIZE,
      size: allocatedSize - this.HEADER_SIZE,
      pid: this.pid,
      createdAt: new Date(),
    };
  }

  /**
   * Free memory at the given address
   */
  public free(address: number): boolean {
    // Calculate block offset
    const offset = address - this.baseAddress - this.HEADER_SIZE;
    
    if (offset < 0 || offset >= this.size) {
      return false;
    }

    const block = this.readBlockHeader(offset);
    
    // Validate block
    if (block.magic !== this.MAGIC || block.isFree) {
      return false;
    }

    const freedSize = block.size;

    // Mark as free
    this.writeBlockHeader(offset, { isFree: true });
    this._stats.allocatedBytes -= freedSize - this.HEADER_SIZE;
    this._stats.freeBytes += freedSize;
    this._stats.allocationCount--;
    this._stats.totalDeallocations++;

    // Add to free list
    this.addToFreeList(offset);

    // Coalesce with adjacent free blocks
    this.coalesceFreeBlocks(offset);

    this.updateFreeBlockStats();

    return true;
  }

  /**
   * Find a free block of at least the given size
   */
  private findFreeBlock(size: number): number {
    let offset = this._freeListHead;
    let iterations = 0;
    const maxIterations = this._stats.freeBlockCount + 1;

    while (offset !== 0 && iterations < maxIterations) {
      const block = this.readBlockHeader(offset);
      
      if (block.isFree && block.size >= size) {
        return offset;
      }

      // Get next free block
      const view = new DataView(this._buffer.buffer, offset);
      offset = view.getUint32(16, true); // nextFree
      iterations++;
    }

    return -1;
  }

  /**
   * Split a block into two
   */
  private splitBlock(offset: number, size: number): void {
    const block = this.readBlockHeader(offset);
    const remainingOffset = offset + size;
    const remainingSize = block.size - size;

    // Update current block
    this.writeBlockHeader(offset, { size, isFree: false });

    // Create new free block
    const newBlock: BlockHeader = {
      size: remainingSize,
      isFree: true,
      prevOffset: offset,
      magic: this.MAGIC,
    };
    this.writeBlockHeader(remainingOffset, newBlock);

    // Update next block's prev offset
    const nextOffset = offset + block.size;
    if (nextOffset < this.size) {
      const nextBlock = this.readBlockHeader(nextOffset);
      this.writeBlockHeader(nextOffset, { prevOffset: remainingOffset });
    }

    // Update free list
    this.removeFromFreeList(offset);
    this.addToFreeList(remainingOffset);
  }

  /**
   * Remove block from free list
   */
  private removeFromFreeList(offset: number): void {
    const view = new DataView(this._buffer.buffer, offset);
    const nextFree = view.getUint32(16, true);
    const prevFree = view.getUint32(20, true);

    if (prevFree !== 0) {
      const prevView = new DataView(this._buffer.buffer, prevFree);
      prevView.setUint32(16, nextFree, true);
    } else {
      this._freeListHead = nextFree;
    }

    if (nextFree !== 0) {
      const nextView = new DataView(this._buffer.buffer, nextFree);
      nextView.setUint32(20, prevFree, true);
    }

    this._stats.freeBlockCount--;
  }

  /**
   * Add block to free list
   */
  private addToFreeList(offset: number): void {
    const view = new DataView(this._buffer.buffer, offset);
    
    // Insert at head
    view.setUint32(16, this._freeListHead, true); // nextFree
    view.setUint32(20, 0, true); // prevFree

    if (this._freeListHead !== 0) {
      const headView = new DataView(this._buffer.buffer, this._freeListHead);
      headView.setUint32(20, offset, true);
    }

    this._freeListHead = offset;
    this._stats.freeBlockCount++;
  }

  /**
   * Coalesce adjacent free blocks
   */
  private coalesceFreeBlocks(offset: number): void {
    const block = this.readBlockHeader(offset);

    // Try to coalesce with next block
    const nextOffset = offset + block.size;
    if (nextOffset < this.size) {
      const nextBlock = this.readBlockHeader(nextOffset);
      if (nextBlock.isFree) {
        this.mergeBlocks(offset, nextOffset);
      }
    }

    // Try to coalesce with previous block
    if (block.prevOffset !== 0 && block.prevOffset !== offset) {
      const prevBlock = this.readBlockHeader(block.prevOffset);
      if (prevBlock.isFree) {
        this.mergeBlocks(block.prevOffset, offset);
      }
    }
  }

  /**
   * Merge two adjacent blocks
   */
  private mergeBlocks(first: number, second: number): void {
    const firstBlock = this.readBlockHeader(first);
    const secondBlock = this.readBlockHeader(second);

    // Remove second from free list
    this.removeFromFreeList(second);

    // Extend first block
    this.writeBlockHeader(first, { size: firstBlock.size + secondBlock.size });

    // Update next block's prev offset
    const nextOffset = first + firstBlock.size + secondBlock.size;
    if (nextOffset < this.size) {
      this.writeBlockHeader(nextOffset, { prevOffset: first });
    }
  }

  /**
   * Update free block statistics
   */
  private updateFreeBlockStats(): void {
    let largest = 0;
    let smallest = this.size;
    let count = 0;

    let offset = this._freeListHead;
    while (offset !== 0 && count < this._stats.freeBlockCount + 10) {
      const block = this.readBlockHeader(offset);
      if (block.isFree) {
        const freeSize = block.size - this.HEADER_SIZE;
        if (freeSize > largest) largest = freeSize;
        if (freeSize < smallest) smallest = freeSize;
      }

      const view = new DataView(this._buffer.buffer, offset);
      offset = view.getUint32(16, true);
      count++;
    }

    this._stats.largestFreeBlock = largest;
    this._stats.smallestFreeBlock = count > 0 ? smallest : 0;
  }

  /**
   * Align value up to alignment
   */
  private alignUp(value: number, alignment: number): number {
    return Math.ceil(value / alignment) * alignment;
  }

  /**
   * Get region information
   */
  public getRegionInfo(): MemoryRegionInfo {
    return {
      baseAddress: this.baseAddress,
      allocationBase: this.baseAddress,
      regionSize: this.size,
      allocationProtect: this.protection,
      state: MemoryState.COMMITTED,
      protect: this.protection,
      type: this.regionType,
      pid: this.pid,
    };
  }

  /**
   * Get heap statistics
   */
  public getStats(): HeapStats {
    return { ...this._stats };
  }

  /**
   * Check if address is within this region
   */
  public contains(address: number): boolean {
    return address >= this.baseAddress && address < this.baseAddress + this.size;
  }

  /**
   * Get the allocation at an address
   */
  public getAllocation(address: number): HeapAllocation | null {
    if (!this.contains(address)) {
      return null;
    }

    const offset = address - this.baseAddress - this.HEADER_SIZE;
    if (offset < 0) {
      return null;
    }

    const block = this.readBlockHeader(offset);
    if (block.magic !== this.MAGIC || block.isFree) {
      return null;
    }

    return {
      address: this.baseAddress + offset + this.HEADER_SIZE,
      size: block.size - this.HEADER_SIZE,
      pid: this.pid,
      createdAt: new Date(), // Would store actual time in real implementation
    };
  }

  /**
   * Validate heap integrity
   */
  public validate(): boolean {
    let offset = 0;
    while (offset < this.size) {
      const block = this.readBlockHeader(offset);
      
      if (block.magic !== this.MAGIC) {
        return false;
      }

      if (block.size === 0 || offset + block.size > this.size) {
        return false;
      }

      offset += block.size;
    }

    return true;
  }

  /**
   * Read data from allocation
   */
  public read(address: number, size: number): Uint8Array | null {
    const offset = address - this.baseAddress;
    
    if (offset < this.HEADER_SIZE || offset + size > this.size) {
      return null;
    }

    return this._buffer.slice(offset, offset + size);
  }

  /**
   * Write data to allocation
   */
  public write(address: number, data: Uint8Array): boolean {
    const offset = address - this.baseAddress;
    
    if (offset < this.HEADER_SIZE || offset + data.length > this.size) {
      return false;
    }

    this._buffer.set(data, offset);
    return true;
  }
}

export default HeapRegion;
