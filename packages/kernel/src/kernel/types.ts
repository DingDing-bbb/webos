/**
 * @fileoverview Kernel Layer Types
 * @module @kernel/kernel/types
 */

// ============================================================================
// Task Types
// ============================================================================

/**
 * Task priority levels (lower number = higher priority)
 */
export type TaskPriority = 'realtime' | 'high' | 'normal' | 'low' | 'idle';

/**
 * Task states
 */
export type TaskState = 'ready' | 'running' | 'blocked' | 'terminated';

/**
 * Task information
 */
export interface TaskInfo {
  /** Task ID */
  id: number;
  /** Task name */
  name: string;
  /** Priority level */
  priority: TaskPriority;
  /** Current state */
  state: TaskState;
  /** Parent task ID */
  parentId?: number;
  /** Child task IDs */
  childIds: number[];
  /** Creation time */
  createdAt: Date;
  /** CPU time used (ms) */
  cpuTime: number;
}

/**
 * Task options
 */
export interface TaskOptions {
  name?: string;
  priority?: TaskPriority;
  parent?: number;
}

// ============================================================================
// Sync Types
// ============================================================================

/**
 * Mutex interface
 */
export interface IMutex {
  lock(): Promise<void>;
  tryLock(): boolean;
  unlock(): void;
  isLocked(): boolean;
}

/**
 * Semaphore interface
 */
export interface ISemaphore {
  acquire(): Promise<void>;
  tryAcquire(): boolean;
  release(): void;
  getCount(): number;
  getMaxCount(): number;
}

/**
 * Event/Condition variable interface
 */
export interface IKernelEvent {
  wait(): Promise<void>;
  waitTimeout(ms: number): Promise<boolean>;
  signal(): void;
  broadcast(): void;
  isSet(): boolean;
  reset(): void;
}

/**
 * Read-write lock interface
 */
export interface IRwLock {
  readLock(): Promise<void>;
  tryReadLock(): boolean;
  readUnlock(): void;
  writeLock(): Promise<void>;
  tryWriteLock(): boolean;
  writeUnlock(): void;
  isWriteLocked(): boolean;
  getReaderCount(): number;
}

// ============================================================================
// Interrupt Types
// ============================================================================

/**
 * Interrupt priority levels
 */
export type InterruptPriority = 'high' | 'normal' | 'low';

/**
 * Interrupt handler function
 */
export type InterruptHandler = (data: unknown) => void | Promise<void>;

/**
 * Interrupt registration options
 */
export interface InterruptOptions {
  priority?: InterruptPriority;
  once?: boolean;
}

/**
 * Signal types (POSIX-like)
 */
export type SignalType = 
  | 'SIGINT'   // Interrupt (Ctrl+C)
  | 'SIGTERM'  // Termination request
  | 'SIGKILL'  // Kill (cannot be caught)
  | 'SIGHUP'   // Hangup
  | 'SIGUSR1'  // User-defined 1
  | 'SIGUSR2'  // User-defined 2
  | 'SIGALRM'  // Alarm clock
  | 'SIGCHLD'  // Child process status change
  | 'SIGWINCH' // Window size change
  ;

/**
 * Signal handler function
 */
export type SignalHandler = (signal: SignalType, data?: unknown) => void | Promise<void>;

// ============================================================================
// Trap (System Call) Types
// ============================================================================

/**
 * System call number
 */
export type SysCallNumber = number;

/**
 * System call handler function
 */
export type SysCallHandler = (args: unknown[]) => Promise<unknown>;

/**
 * System call registration
 */
export interface SysCallDefinition {
  number: SysCallNumber;
  name: string;
  handler: SysCallHandler;
  requiresAuth?: boolean;
}
