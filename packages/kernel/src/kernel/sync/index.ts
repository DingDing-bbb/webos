/**
 * @fileoverview Synchronization Module Exports
 * @module @kernel/kernel/sync
 */

export { Mutex } from './Mutex';
export { Semaphore } from './Semaphore';
export { KernelEvent, AutoResetEvent, ManualResetEvent } from './Event';
export { RwLock } from './RwLock';

export type { IMutex, ISemaphore, IKernelEvent, IRwLock } from '../types';
