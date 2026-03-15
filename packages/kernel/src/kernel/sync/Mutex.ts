/**
 * @fileoverview Mutex - Mutual Exclusion Lock
 * @module @kernel/kernel/sync/Mutex
 */

import type { IMutex } from '../types';

/**
 * Mutex provides mutual exclusion for critical sections.
 * Only one task can hold the lock at a time.
 */
export class Mutex implements IMutex {
  private locked = false;
  private queue: Array<() => void> = [];
  private owner: number | null = null;
  
  /**
   * Acquire the mutex lock
   * Waits until the lock is available
   */
  async lock(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      this.owner = this.getCurrentTaskId();
      return;
    }
    
    return new Promise<void>(resolve => {
      this.queue.push(() => {
        this.locked = true;
        this.owner = this.getCurrentTaskId();
        resolve();
      });
    });
  }
  
  /**
   * Try to acquire the lock without waiting
   * @returns true if lock acquired, false otherwise
   */
  tryLock(): boolean {
    if (!this.locked) {
      this.locked = true;
      this.owner = this.getCurrentTaskId();
      return true;
    }
    return false;
  }
  
  /**
   * Release the mutex lock
   */
  unlock(): void {
    if (!this.locked) {
      console.warn('[Mutex] Attempted to unlock an unlocked mutex');
      return;
    }
    
    this.locked = false;
    this.owner = null;
    
    // Wake up next waiter
    const next = this.queue.shift();
    if (next) {
      next();
    }
  }
  
  /**
   * Check if mutex is currently locked
   */
  isLocked(): boolean {
    return this.locked;
  }
  
  /**
   * Get current task ID (placeholder for actual implementation)
   */
  private getCurrentTaskId(): number | null {
    // In real implementation, this would get the current task ID
    return null;
  }
  
  /**
   * Execute a function with the mutex held
   */
  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    await this.lock();
    try {
      return await fn();
    } finally {
      this.unlock();
    }
  }
  
  /**
   * Execute a synchronous function with the mutex held
   */
  withLockSync<T>(fn: () => T): T {
    if (!this.tryLock()) {
      throw new Error('Mutex is locked');
    }
    try {
      return fn();
    } finally {
      this.unlock();
    }
  }
}
