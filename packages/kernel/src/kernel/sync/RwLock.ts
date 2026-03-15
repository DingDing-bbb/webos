/**
 * @fileoverview Read-Write Lock
 * @module @kernel/kernel/sync/RwLock
 */

import type { IRwLock } from '../types';
import { Mutex } from './Mutex';

/**
 * RwLock allows multiple readers or a single writer.
 * Useful for read-heavy workloads.
 */
export class RwLock implements IRwLock {
  private readers = 0;
  private writer = false;
  private writeWaiters = 0;
  private readQueue: Array<() => void> = [];
  private writeQueue: Array<() => void> = [];
  private mutex = new Mutex();
  
  /**
   * Acquire a read lock
   * Multiple readers can hold the lock simultaneously
   */
  async readLock(): Promise<void> {
    await this.mutex.lock();
    
    // If no writer and no waiting writers, allow read
    if (!this.writer && this.writeWaiters === 0) {
      this.readers++;
      this.mutex.unlock();
      return;
    }
    
    // Otherwise, wait
    return new Promise<void>(resolve => {
      this.readQueue.push(() => {
        this.readers++;
        resolve();
      });
      this.mutex.unlock();
    });
  }
  
  /**
   * Try to acquire read lock without waiting
   */
  tryReadLock(): boolean {
    if (!this.mutex.tryLock()) return false;
    
    if (!this.writer && this.writeWaiters === 0) {
      this.readers++;
      this.mutex.unlock();
      return true;
    }
    
    this.mutex.unlock();
    return false;
  }
  
  /**
   * Release a read lock
   */
  readUnlock(): void {
    this.mutex.lock();
    this.readers--;
    
    // If no more readers, wake a writer
    if (this.readers === 0 && this.writeQueue.length > 0) {
      const next = this.writeQueue.shift();
      this.mutex.unlock();
      if (next) next();
      return;
    }
    
    this.mutex.unlock();
  }
  
  /**
   * Acquire a write lock
   * Only one writer can hold the lock
   */
  async writeLock(): Promise<void> {
    await this.mutex.lock();
    
    // If no readers and no writer, allow write
    if (this.readers === 0 && !this.writer) {
      this.writer = true;
      this.mutex.unlock();
      return;
    }
    
    // Otherwise, wait
    this.writeWaiters++;
    return new Promise<void>(resolve => {
      this.writeQueue.push(() => {
        this.writer = true;
        this.writeWaiters--;
        resolve();
      });
      this.mutex.unlock();
    });
  }
  
  /**
   * Try to acquire write lock without waiting
   */
  tryWriteLock(): boolean {
    if (!this.mutex.tryLock()) return false;
    
    if (this.readers === 0 && !this.writer) {
      this.writer = true;
      this.mutex.unlock();
      return true;
    }
    
    this.mutex.unlock();
    return false;
  }
  
  /**
   * Release a write lock
   */
  writeUnlock(): void {
    this.mutex.lock();
    this.writer = false;
    
    // Prefer waking all readers if no waiting writers
    if (this.writeWaiters === 0 && this.readQueue.length > 0) {
      const waiters = [...this.readQueue];
      this.readQueue = [];
      this.mutex.unlock();
      waiters.forEach(w => w());
      return;
    }
    
    // Otherwise, wake a writer
    if (this.writeQueue.length > 0) {
      const next = this.writeQueue.shift();
      this.mutex.unlock();
      if (next) next();
      return;
    }
    
    this.mutex.unlock();
  }
  
  /**
   * Check if write lock is held
   */
  isWriteLocked(): boolean {
    return this.writer;
  }
  
  /**
   * Get current reader count
   */
  getReaderCount(): number {
    return this.readers;
  }
  
  /**
   * Execute a function with read lock
   */
  async withRead<T>(fn: () => Promise<T>): Promise<T> {
    await this.readLock();
    try {
      return await fn();
    } finally {
      this.readUnlock();
    }
  }
  
  /**
   * Execute a function with write lock
   */
  async withWrite<T>(fn: () => Promise<T>): Promise<T> {
    await this.writeLock();
    try {
      return await fn();
    } finally {
      this.writeUnlock();
    }
  }
}
