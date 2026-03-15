/**
 * @fileoverview Task Types
 * @module @kernel/kernel/scheduler/types
 */

import type { TaskPriority, TaskState } from '../types';

/**
 * Task execution function
 */
export type TaskEntry = () => Promise<void> | void;

/**
 * Task representation
 */
export interface Task {
  /** Unique task ID */
  id: number;
  /** Task name */
  name: string;
  /** Priority level */
  priority: TaskPriority;
  /** Current state */
  state: TaskState;
  /** Entry point function */
  entry: TaskEntry;
  /** Parent task ID */
  parentId?: number;
  /** Child task IDs */
  childIds: number[];
  /** Creation time */
  createdAt: Date;
  /** CPU time used (ms) */
  cpuTime: number;
  /** Result (if completed) */
  result?: unknown;
  /** Error (if failed) */
  error?: Error;
}

/**
 * Task creation options
 */
export interface TaskCreateOptions {
  /** Task name */
  name?: string;
  /** Priority level (default: 'normal') */
  priority?: TaskPriority;
  /** Parent task ID */
  parentId?: number;
  /** Arguments to pass to entry */
  args?: unknown[];
}

/**
 * Priority weights for scheduling
 */
export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  realtime: 0,
  high: 1,
  normal: 2,
  low: 3,
  idle: 4,
};

/**
 * Compare two tasks by priority
 */
export function comparePriority(a: Task, b: Task): number {
  return PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority];
}
