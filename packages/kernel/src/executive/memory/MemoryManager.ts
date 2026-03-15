/**
 * @fileoverview Memory Manager - Heap Allocation
 * @module @kernel/executive/memory/MemoryManager
 */

import type { MemoryRegion, MemoryRegionType, MemoryProtection } from '../types';

/**
 * Memory Manager handles heap allocation and memory regions.
 */
export class MemoryManager {
  private regions = new Map<number, MemoryRegion>();
  private nextRegionId = 1;
  private totalAllocated = 0;
  private readonly maxMemory: number;
  
  constructor(maxMemory: number = 1024 * 1024 * 1024) { // 1GB default
    this.maxMemory = maxMemory;
  }
  
  /**
   * Allocate memory region
   */
  allocate(size: number, type: MemoryRegionType, protection: MemoryProtection = 'rw'): number {
    if (this.totalAllocated + size > this.maxMemory) {
      throw new Error('Out of memory');
    }
    
    const regionId = this.nextRegionId++;
    const region: MemoryRegion = {
      start: regionId * 0x10000, // Simplified addressing
      end: regionId * 0x10000 + size,
      size,
      type,
      protection,
    };
    
    this.regions.set(regionId, region);
    this.totalAllocated += size;
    
    return regionId;
  }
  
  /**
   * Free memory region
   */
  free(regionId: number): boolean {
    const region = this.regions.get(regionId);
    if (!region) return false;
    
    this.totalAllocated -= region.size;
    this.regions.delete(regionId);
    
    return true;
  }
  
  /**
   * Get region by ID
   */
  getRegion(regionId: number): MemoryRegion | null {
    return this.regions.get(regionId) ?? null;
  }
  
  /**
   * Get all regions
   */
  getAllRegions(): MemoryRegion[] {
    return Array.from(this.regions.values());
  }
  
  /**
   * Get regions by type
   */
  getRegionsByType(type: MemoryRegionType): MemoryRegion[] {
    return this.getAllRegions().filter(r => r.type === type);
  }
  
  /**
   * Get total allocated memory
   */
  getTotalAllocated(): number {
    return this.totalAllocated;
  }
  
  /**
   * Get available memory
   */
  getAvailable(): number {
    return this.maxMemory - this.totalAllocated;
  }
  
  /**
   * Get memory statistics
   */
  getStats(): {
    total: number;
    allocated: number;
    available: number;
    regionCount: number;
  } {
    return {
      total: this.maxMemory,
      allocated: this.totalAllocated,
      available: this.getAvailable(),
      regionCount: this.regions.size,
    };
  }
  
  /**
   * Protect memory region
   */
  protect(regionId: number, protection: MemoryProtection): boolean {
    const region = this.regions.get(regionId);
    if (!region) return false;
    
    region.protection = protection;
    return true;
  }
  
  /**
   * Resize memory region
   */
  resize(regionId: number, newSize: number): boolean {
    const region = this.regions.get(regionId);
    if (!region) return false;
    
    const sizeDiff = newSize - region.size;
    if (this.totalAllocated + sizeDiff > this.maxMemory) {
      return false;
    }
    
    region.size = newSize;
    region.end = region.start + newSize;
    this.totalAllocated += sizeDiff;
    
    return true;
  }
  
  /**
   * Clear all regions
   */
  clear(): void {
    this.regions.clear();
    this.totalAllocated = 0;
    this.nextRegionId = 1;
  }
}

// Singleton instance
export const memoryManager = new MemoryManager();
