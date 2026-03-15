/**
 * @fileoverview Process Types
 * @module @kernel/executive/process/types
 */

import type { PID, ProcessState, ProcessPriority } from '../types';

/**
 * Process execution function
 */
export type ProcessEntry = () => Promise<number> | number;

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
  entry?: ProcessEntry;
}

/**
 * Process information (extended)
 */
export interface ProcessInfoExtended {
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
  exitCode?: number;
  signal?: string;
}
