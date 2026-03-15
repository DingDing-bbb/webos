/**
 * @fileoverview Task Queue - Priority Queue for Tasks
 * @module @kernel/kernel/scheduler/TaskQueue
 */

import type { TaskPriority } from '../types';
import { Task, comparePriority } from './Task';

/**
 * TaskQueue is a priority queue for scheduling tasks.
 */
export class TaskQueue {
  private queues: Map<TaskPriority, Task[]> = new Map();
  private size = 0;
  
  constructor() {
    // Initialize queues for each priority level
    const priorities: TaskPriority[] = ['realtime', 'high', 'normal', 'low', 'idle'];
    priorities.forEach(p => this.queues.set(p, []));
  }
  
  /**
   * Add a task to the queue
   */
  enqueue(task: Task): void {
    const queue = this.queues.get(task.priority);
    if (queue) {
      queue.push(task);
      this.size++;
    }
  }
  
  /**
   * Remove and return the highest priority task
   */
  dequeue(): Task | undefined {
    const priorities: TaskPriority[] = ['realtime', 'high', 'normal', 'low', 'idle'];
    
    for (const priority of priorities) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        const task = queue.shift();
        if (task) {
          this.size--;
          return task;
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Peek at the highest priority task without removing
   */
  peek(): Task | undefined {
    const priorities: TaskPriority[] = ['realtime', 'high', 'normal', 'low', 'idle'];
    
    for (const priority of priorities) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        return queue[0];
      }
    }
    
    return undefined;
  }
  
  /**
   * Get the number of tasks in the queue
   */
  getSize(): number {
    return this.size;
  }
  
  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.size === 0;
  }
  
  /**
   * Get count by priority
   */
  getCountByPriority(priority: TaskPriority): number {
    return this.queues.get(priority)?.length ?? 0;
  }
  
  /**
   * Remove a specific task
   */
  remove(taskId: number): Task | undefined {
    for (const [, queue] of this.queues) {
      const index = queue.findIndex(t => t.id === taskId);
      if (index !== -1) {
        const [task] = queue.splice(index, 1);
        if (task) {
          this.size--;
          return task;
        }
      }
    }
    return undefined;
  }
  
  /**
   * Clear all tasks
   */
  clear(): void {
    this.queues.forEach(queue => queue.length = 0);
    this.size = 0;
  }
  
  /**
   * Get all tasks (sorted by priority)
   */
  getAll(): Task[] {
    const all: Task[] = [];
    const priorities: TaskPriority[] = ['realtime', 'high', 'normal', 'low', 'idle'];
    
    for (const priority of priorities) {
      const queue = this.queues.get(priority);
      if (queue) {
        all.push(...queue);
      }
    }
    
    return all;
  }
}
