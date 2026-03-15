/**
 * @fileoverview Semaphore - Counting Semaphore
 * @module @kernel/kernel/sync/Semaphore
 */

import type { ISemaphore } from '../types';

/**
 * Semaphore allows a fixed number of concurrent accesses.
 * Useful for resource pools and rate limiting.
 */
export class Semaphore implements ISemaphore {
  private count: number;
  private readonly maxCount: number;
  private queue: Array<() => void> = [];
  
  /**
   * Create a semaphore
   * @param count Initial count (available resources)
   * @param maxCount Maximum count
   */
  constructor(count: number = 1, maxCount?: number) {
    this.count = count;
    this.maxCount = maxCount ?? count;
    
    if (this.count < 0) {
      throw new Error('Initial count cannot be negative');
    }
    if (this.maxCount < this.count) {
      throw new Error('Max count cannot be less than initial count');
    }
  }
  
  /**
   * Acquire a permit
   * Waits until a permit is available
   */
  async acquire(): Promise<void> {
    if (this.count > 0) {
      this.count--;
      return;
    }
    
    return new Promise<void>(resolve => {
      this.queue.push(() => {
        this.count--;
        resolve();
      });
    });
  }
  
  /**
   * Try to acquire a permit without waiting
   * @returns true if acquired, false otherwise
   */
  tryAcquire(): boolean {
    if (this.count > 0) {
      this.count--;
      return true;
    }
    return false;
  }
  
  /**
   * Release a permit
   */
  release(): void {
    if (this.count >= this.maxCount) {
      console.warn('[Semaphore] Released more than max count');
      return;
    }
    
    this.count++;
    
    // Wake up next waiter if count available
    if (this.count > 0 && this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        this.count--; // Will be decremented in the callback
        next();
      }
    }
  }
  
  /**
   * Get current available count
   */
  getCount(): number {
    return this.count;
  }
  
  /**
   * Get maximum count
   */
  getMaxCount(): number {
    return this.maxCount;
  }
  
  /**
   * Get number of waiters
   */
  getQueueLength(): number {
    return this.queue.length;
  }
  
  /**
   * Execute a function with a permit
   */
  async withPermit<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}
