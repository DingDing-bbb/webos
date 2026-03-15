/**
 * @fileoverview Synchronization primitive types for WebOS kernel
 * @description Defines interfaces for mutex, semaphore, events, and rwlock
 * @module kernel/sync/types
 */

import type { TaskId, KernelResult } from '../types';

/**
 * Lock acquisition options
 */
export interface LockOptions {
  /** Timeout in milliseconds (undefined = wait forever) */
  timeout?: number;
  /** Whether to throw on failure */
  throwOnTimeout?: boolean;
}

/**
 * Result of a lock operation
 */
export interface LockResult {
  /** Whether the lock was acquired */
  acquired: boolean;
  /** Time waited in milliseconds */
  waitedMs: number;
}

/**
 * Base interface for all lock types
 */
export interface Lock {
  /** Whether the lock is currently held */
  readonly isLocked: boolean;
  /** Number of waiters */
  readonly waiterCount: number;
  /** Acquire the lock */
  acquire(options?: LockOptions): Promise<KernelResult<LockResult>>;
  /** Try to acquire without blocking */
  tryAcquire(): boolean;
  /** Release the lock */
  release(): KernelResult<boolean>;
}

/**
 * Mutex (mutual exclusion) lock interface
 * @description A mutex can only be held by one task at a time
 */
export interface Mutex extends Lock {
  /** Unique identifier for this mutex */
  readonly id: number;
  /** Current holder's task ID (if locked) */
  readonly holder: TaskId | null;
  /** Lock count for recursive mutex */
  readonly lockCount: number;
}

/**
 * Semaphore interface
 * @description A counting semaphore allows N tasks to acquire simultaneously
 */
export interface Semaphore {
  /** Unique identifier for this semaphore */
  readonly id: number;
  /** Current count (available permits) */
  readonly count: number;
  /** Maximum count */
  readonly maxCount: number;
  /** Number of waiting tasks */
  readonly waiterCount: number;
  /** Acquire a permit */
  acquire(options?: LockOptions): Promise<KernelResult<LockResult>>;
  /** Try to acquire without blocking */
  tryAcquire(): boolean;
  /** Release a permit */
  release(): KernelResult<boolean>;
  /** Release multiple permits */
  releaseN(n: number): KernelResult<boolean>;
}

/**
 * Event (condition variable) interface
 * @description Events allow tasks to wait for a signal
 */
export interface KernelEvent {
  /** Unique identifier for this event */
  readonly id: number;
  /** Whether the event is currently set */
  readonly isSet: boolean;
  /** Whether this is an auto-reset event */
  readonly autoReset: boolean;
  /** Number of waiting tasks */
  readonly waiterCount: number;
  /** Wait for the event to be signaled */
  wait(options?: LockOptions): Promise<KernelResult<boolean>>;
  /** Signal the event (wake one waiter) */
  signal(): void;
  /** Broadcast to all waiters */
  broadcast(): void;
  /** Reset the event to unsignaled state */
  reset(): void;
}

/**
 * Read-write lock interface
 * @description Allows multiple readers or one exclusive writer
 */
export interface RwLock {
  /** Unique identifier for this rwlock */
  readonly id: number;
  /** Number of active readers */
  readonly readerCount: number;
  /** Whether a writer holds the lock */
  readonly hasWriter: boolean;
  /** Current writer's task ID (if any) */
  readonly writer: TaskId | null;
  /** Number of waiting readers */
  readonly waitingReaders: number;
  /** Number of waiting writers */
  readonly waitingWriters: number;
  /** Acquire a read lock */
  readLock(options?: LockOptions): Promise<KernelResult<LockResult>>;
  /** Acquire a write lock */
  writeLock(options?: LockOptions): Promise<KernelResult<LockResult>>;
  /** Try to acquire a read lock without blocking */
  tryReadLock(): boolean;
  /** Try to acquire a write lock without blocking */
  tryWriteLock(): boolean;
  /** Release the current lock (read or write) */
  unlock(): KernelResult<boolean>;
  /** Downgrade from write to read lock */
  downgrade(): KernelResult<boolean>;
}

/**
 * Condition variable interface
 * @description Allows tasks to wait for a condition to become true
 */
export interface ConditionVariable {
  /** Unique identifier for this condition */
  readonly id: number;
  /** Number of waiting tasks */
  readonly waiterCount: number;
  /** Wait for signal (must hold associated mutex) */
  wait(mutex: Mutex, options?: LockOptions): Promise<KernelResult<boolean>>;
  /** Wait with predicate */
  waitWhile(predicate: () => boolean, mutex: Mutex, options?: LockOptions): Promise<KernelResult<boolean>>;
  /** Wait until predicate is true */
  waitUntil(predicate: () => boolean, mutex: Mutex, options?: LockOptions): Promise<KernelResult<boolean>>;
  /** Signal one waiting task */
  signal(): void;
  /** Signal all waiting tasks */
  broadcast(): void;
}

/**
 * Barrier interface
 * @description Synchronizes multiple tasks at a rendezvous point
 */
export interface Barrier {
  /** Unique identifier for this barrier */
  readonly id: number;
  /** Number of tasks required */
  readonly parties: number;
  /** Number of tasks currently waiting */
  readonly waiting: number;
  /** Whether the barrier is broken */
  readonly isBroken: boolean;
  /** Wait for all parties to arrive */
  await(options?: LockOptions): Promise<KernelResult<boolean>>;
  /** Reset the barrier */
  reset(): void;
}

/**
 * Countdown latch interface
 * @description One-time barrier that releases after N counts
 */
export interface CountdownLatch {
  /** Unique identifier for this latch */
  readonly id: number;
  /** Current count */
  readonly count: number;
  /** Initial count */
  readonly initialCount: number;
  /** Number of waiting tasks */
  readonly waiterCount: number;
  /** Decrement the count */
  countDown(): void;
  /** Wait for count to reach zero */
  await(options?: LockOptions): Promise<KernelResult<boolean>>;
  /** Get current count */
  getCount(): number;
}

/**
 * Spin lock interface (for very short critical sections)
 * @description Busy-wait lock, use with caution
 */
export interface SpinLock {
  /** Whether the lock is held */
  readonly isLocked: boolean;
  /** Acquire the lock (spins until available) */
  acquire(): void;
  /** Try to acquire without spinning */
  tryAcquire(): boolean;
  /** Release the lock */
  release(): void;
}

/**
 * Lock acquisition mode
 */
export type LockMode = 'read' | 'write' | 'exclusive';

/**
 * Synchronization statistics
 */
export interface SyncStats {
  /** Number of active mutexes */
  mutexCount: number;
  /** Number of active semaphores */
  semaphoreCount: number;
  /** Number of active events */
  eventCount: number;
  /** Number of active rwlocks */
  rwlockCount: number;
  /** Total acquisitions */
  totalAcquisitions: number;
  /** Total releases */
  totalReleases: number;
  /** Total timeouts */
  totalTimeouts: number;
  /** Total deadlocks detected */
  deadlocksDetected: number;
}

/**
 * Deadlock detection result
 */
export interface DeadlockInfo {
  /** Tasks involved in deadlock */
  tasks: TaskId[];
  /** Resources involved */
  resources: number[];
  /** Detection timestamp */
  timestamp: number;
}

/**
 * Callback type for lock events
 */
export type LockEventCallback = (event: LockEvent) => void;

/**
 * Lock event types
 */
export interface LockEvent {
  type: 'acquired' | 'released' | 'timeout' | 'deadlock';
  lockId: number;
  taskId: TaskId;
  timestamp: number;
}
