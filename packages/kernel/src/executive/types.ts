/**
 * @fileoverview Executive Layer Types
 * @module @kernel/executive/types
 */

// ============================================================================
// Process Types
// ============================================================================

/**
 * Process ID type
 */
export type PID = number;

/**
 * Process states
 */
export type ProcessState = 
  | 'created'
  | 'running' 
  | 'sleeping'
  | 'stopped'
  | 'zombie'
  | 'terminated';

/**
 * Process priority
 */
export type ProcessPriority = 'realtime' | 'high' | 'normal' | 'low' | 'idle';

/**
 * Process information
 */
export interface ProcessInfo {
  pid: PID;
  name: string;
  path: string;
  args: string[];
  env: Record<string, string>;
  cwd: string;
  uid: string;
  gid: string;
  state: ProcessState;
  priority: ProcessPriority;
  parentPid?: PID;
  childPids: PID[];
  startTime: Date;
  cpuTime: number;
  memoryUsage: number;
}

/**
 * Process creation options
 */
export interface ProcessCreateOptions {
  name?: string;
  path?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  uid?: string;
  gid?: string;
  priority?: ProcessPriority;
  parentPid?: PID;
}

// ============================================================================
// Memory Types
// ============================================================================

/**
 * Memory region types
 */
export type MemoryRegionType = 
  | 'code' 
  | 'data' 
  | 'heap' 
  | 'stack' 
  | 'shared'
  | 'mapped';

/**
 * Memory protection flags
 */
export type MemoryProtection = 'r' | 'w' | 'x' | 'rw' | 'rx' | 'wx' | 'rwx';

/**
 * Memory region info
 */
export interface MemoryRegion {
  start: number;
  end: number;
  size: number;
  type: MemoryRegionType;
  protection: MemoryProtection;
  name?: string;
}

// ============================================================================
// Security Types
// ============================================================================

/**
 * User role
 */
export type UserRole = 'root' | 'admin' | 'user' | 'guest';

/**
 * Security token
 */
export interface SecurityToken {
  tokenId: string;
  userId: string;
  userName: string;
  displayName: string;
  role: UserRole;
  groups: string[];
  privileges: string[];
  sessionId: string;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Permission
 */
export type Permission = 
  | 'read:files'
  | 'write:files'
  | 'delete:files'
  | 'read:settings'
  | 'write:settings'
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'execute:commands'
  | 'admin:system';

/**
 * Access control entry
 */
export interface ACE {
  type: 'allow' | 'deny';
  principal: string;
  permissions: Permission[];
  flags?: {
    inherit?: boolean;
    propagate?: boolean;
  };
}

/**
 * Access control list
 */
export interface ACL {
  owner: string;
  group: string;
  mode: string; // Unix-style rwx
  aces: ACE[];
}

// ============================================================================
// Object Types
// ============================================================================

/**
 * Kernel object types
 */
export type KernelObjectType = 
  | 'process'
  | 'thread'
  | 'file'
  | 'device'
  | 'event'
  | 'mutex'
  | 'semaphore'
  | 'section'
  | 'port';

/**
 * Handle
 */
export type Handle = number;

/**
 * Kernel object base
 */
export interface KernelObject {
  type: KernelObjectType;
  refCount: number;
  createdAt: Date;
  name?: string;
}
