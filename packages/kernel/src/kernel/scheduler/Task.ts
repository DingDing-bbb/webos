/**
 * @fileoverview Task - Unit of Execution
 * @module @kernel/kernel/scheduler/Task
 */

import type { TaskPriority, TaskState } from '../types';
import type { Task as ITask, TaskEntry, TaskCreateOptions } from './types';

let nextTaskId = 1;

/**
 * Task represents a unit of execution in the system.
 */
export class Task implements ITask {
  id: number;
  name: string;
  priority: TaskPriority;
  state: TaskState;
  entry: TaskEntry;
  parentId?: number;
  childIds: number[];
  createdAt: Date;
  cpuTime: number = 0;
  result?: unknown;
  error?: Error;
  
  private resolvePromise?: (value: unknown) => void;
  private rejectPromise?: (error: Error) => void;
  private completionPromise?: Promise<unknown>;
  
  constructor(entry: TaskEntry, options: TaskCreateOptions = {}) {
    this.id = nextTaskId++;
    this.name = options.name ?? `task-${this.id}`;
    this.priority = options.priority ?? 'normal';
    this.state = 'ready';
    this.entry = entry;
    this.parentId = options.parentId;
    this.childIds = [];
    this.createdAt = new Date();
  }
  
  /**
   * Get a promise that resolves when the task completes
   */
  onComplete(): Promise<unknown> {
    if (!this.completionPromise) {
      this.completionPromise = new Promise((resolve, reject) => {
        this.resolvePromise = resolve;
        this.rejectPromise = reject;
      });
    }
    return this.completionPromise;
  }
  
  /**
   * Mark task as running
   */
  start(): void {
    this.state = 'running';
  }
  
  /**
   * Mark task as completed with result
   */
  complete(result?: unknown): void {
    this.state = 'terminated';
    this.result = result;
    if (this.resolvePromise) {
      this.resolvePromise(result);
    }
  }
  
  /**
   * Mark task as failed with error
   */
  fail(error: Error): void {
    this.state = 'terminated';
    this.error = error;
    if (this.rejectPromise) {
      this.rejectPromise(error);
    }
  }
  
  /**
   * Block the task
   */
  block(): void {
    this.state = 'blocked';
  }
  
  /**
   * Unblock the task
   */
  unblock(): void {
    if (this.state === 'blocked') {
      this.state = 'ready';
    }
  }
  
  /**
   * Add CPU time
   */
  addCpuTime(ms: number): void {
    this.cpuTime += ms;
  }
  
  /**
   * Add a child task
   */
  addChild(childId: number): void {
    this.childIds.push(childId);
  }
  
  /**
   * Remove a child task
   */
  removeChild(childId: number): void {
    const index = this.childIds.indexOf(childId);
    if (index !== -1) {
      this.childIds.splice(index, 1);
    }
  }
  
  /**
   * Check if task is still running or ready
   */
  isActive(): boolean {
    return this.state === 'running' || this.state === 'ready' || this.state === 'blocked';
  }
}
