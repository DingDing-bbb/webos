/**
 * @fileoverview Memory Types
 * @module @kernel/executive/memory/types
 */

import type { MemoryRegionType, MemoryProtection } from '../types';

export type { MemoryRegionType, MemoryProtection } from '../types';

/**
 * Memory statistics
 */
export interface MemoryStats {
  total: number;
  used: number;
  free: number;
  regionCount: number;
}
