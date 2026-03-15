/**
 * @fileoverview Kernel Event - Condition Variable
 * @module @kernel/kernel/sync/Event
 */

import type { IKernelEvent } from '../types';

/**
 * KernelEvent is a synchronization primitive that allows
 * tasks to wait for a signal from another task.
 */
export class KernelEvent implements IKernelEvent {
  private signaled = false;
  private autoReset: boolean;
  private queue: Array<(success: boolean) => void> = [];
  
  /**
   * Create a kernel event
   * @param autoReset If true, automatically reset after wait
   */
  constructor(autoReset: boolean = false) {
    this.autoReset = autoReset;
  }
  
  /**
   * Wait for the event to be signaled
   */
  async wait(): Promise<void> {
    if (this.signaled) {
      if (this.autoReset) {
        this.signaled = false;
      }
      return;
    }
    
    return new Promise<void>(resolve => {
      this.queue.push(() => {
        if (this.autoReset) {
          this.signaled = false;
        }
        resolve();
      });
    });
  }
  
  /**
   * Wait with timeout
   * @param ms Timeout in milliseconds
   * @returns true if signaled, false if timeout
   */
  async waitTimeout(ms: number): Promise<boolean> {
    if (this.signaled) {
      if (this.autoReset) {
        this.signaled = false;
      }
      return true;
    }
    
    return new Promise<boolean>(resolve => {
      const timeoutId = setTimeout(() => {
        // Remove from queue
        const index = this.queue.indexOf(callback);
        if (index !== -1) {
          this.queue.splice(index, 1);
        }
        resolve(false);
      }, ms);
      
      const callback = () => {
        clearTimeout(timeoutId);
        if (this.autoReset) {
          this.signaled = false;
        }
        resolve(true);
      };
      
      this.queue.push(callback);
    });
  }
  
  /**
   * Signal one waiting task
   */
  signal(): void {
    if (this.autoReset) {
      const next = this.queue.shift();
      if (next) {
        next(true);
      } else {
        this.signaled = true;
      }
    } else {
      this.signaled = true;
      // Wake all waiters
      const waiters = [...this.queue];
      this.queue = [];
      waiters.forEach(w => w(true));
    }
  }
  
  /**
   * Signal all waiting tasks
   */
  broadcast(): void {
    this.signaled = true;
    const waiters = [...this.queue];
    this.queue = [];
    waiters.forEach(w => w(true));
  }
  
  /**
   * Check if event is signaled
   */
  isSet(): boolean {
    return this.signaled;
  }
  
  /**
   * Reset the event to unsignaled state
   */
  reset(): void {
    this.signaled = false;
  }
  
  /**
   * Get number of waiting tasks
   */
  getWaitCount(): number {
    return this.queue.length;
  }
}

/**
 * AutoResetEvent - Event that automatically resets after releasing one waiter
 */
export class AutoResetEvent extends KernelEvent {
  constructor() {
    super(true);
  }
}

/**
 * ManualResetEvent - Event that must be manually reset
 */
export class ManualResetEvent extends KernelEvent {
  constructor(initialState: boolean = false) {
    super(false);
    if (initialState) {
      this.signal();
    }
  }
}
