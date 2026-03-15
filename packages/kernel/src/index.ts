/**
 * @fileoverview WebOS Kernel Entry Point
 * @module @kernel
 * 
 * NT-inspired layered architecture:
 * - HAL: Hardware Abstraction Layer
 * - Kernel: Scheduler, Sync, Interrupts
 * - Executive: Process, Memory, Object, IO, Security
 * - Services: Auth, FS, Window, Config, etc.
 */

// ============================================================================
// Types
// ============================================================================

export * from './types';

// ============================================================================
// HAL Layer (Hardware Abstraction)
// ============================================================================

export * from './hal';
export type { 
  IStorageAdapter, 
  INetworkAdapter, 
  IInputAdapter,
  IDisplayAdapter,
  IAudioAdapter,
  IHAL 
} from './hal/types';

// ============================================================================
// Kernel Layer (Core Primitives)
// ============================================================================

export * from './kernel';
export type {
  TaskPriority,
  TaskState,
  TaskInfo,
  IMutex,
  ISemaphore,
  IKernelEvent,
  IRwLock,
  InterruptPriority,
  InterruptHandler,
  SignalType,
  SysCallNumber,
} from './kernel/types';

// ============================================================================
// Executive Layer (System Managers)
// ============================================================================

export * from './executive';
export type {
  PID,
  ProcessState,
  ProcessPriority,
  ProcessInfo,
  SecurityToken,
  UserRole,
  Permission,
  ACL,
  KernelObjectType,
  Handle,
} from './executive/types';

// ============================================================================
// Services Layer (High-level APIs)
// ============================================================================

export * from './services';
export type { IService, ServiceStatus, ServiceInfo } from './services/types';

// ============================================================================
// Legacy API (for backward compatibility)
// ============================================================================

// Re-export old core modules for transition period
export * from './core/api';
export { secureUserManager } from './core/secureUserManager';
export { userManager } from './core/userManager';
export { windowManager } from './core/windowManager';
