/**
 * @fileoverview Scheduler - Cooperative Task Scheduler
 * @module @kernel/kernel/scheduler/Scheduler
 */

import { Task, TaskCreateOptions } from './Task';
import { TaskQueue } from './TaskQueue';
import type { TaskPriority, TaskState } from '../types';

/**
 * Scheduler statistics
 */
export interface SchedulerStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  queueSize: number;
}

/**
 * Scheduler manages task execution using cooperative multitasking.
 * Tasks are scheduled based on priority and executed one at a time.
 */
export class Scheduler {
  private taskQueue = new TaskQueue();
  private tasks = new Map<number, Task>();
  private currentTask: Task | null = null;
  private taskIdCounter = 0;
  private stats: SchedulerStats = {
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    queueSize: 0,
  };
  private running = false;
  private yieldRequested = false;
  private listeners: Set<() => void> = new Set();
  
  /**
   * Create a new task
   */
  createTask(entry: () => Promise<void> | void, options: TaskCreateOptions = {}): number {
    const task = new Task(entry, options);
    
    // Add to parent's children if specified
    if (options.parentId !== undefined) {
      const parent = this.tasks.get(options.parentId);
      if (parent) {
        parent.addChild(task.id);
      }
    }
    
    this.tasks.set(task.id, task);
    this.taskQueue.enqueue(task);
    this.stats.totalTasks++;
    this.stats.activeTasks++;
    this.stats.queueSize = this.taskQueue.getSize();
    
    return task.id;
  }
  
  /**
   * Terminate a task
   */
  terminateTask(id: number): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    
    // Remove from queue if pending
    this.taskQueue.remove(id);
    
    // Mark as terminated
    task.state = 'terminated';
    
    // Update stats
    this.stats.activeTasks--;
    this.stats.queueSize = this.taskQueue.getSize();
    
    // Notify listeners
    this.notifyListeners();
    
    return true;
  }
  
  /**
   * Run the scheduler loop
   */
  async run(): Promise<void> {
    if (this.running) return;
    this.running = true;
    
    while (this.running && !this.taskQueue.isEmpty()) {
      await this.tick();
    }
    
    this.running = false;
  }
  
  /**
   * Execute one task tick
   */
  async tick(): Promise<void> {
    const task = this.taskQueue.dequeue();
    if (!task) return;
    
    this.currentTask = task;
    task.start();
    
    const startTime = performance.now();
    
    try {
      // Execute task
      const result = await Promise.resolve(task.entry());
      task.complete(result);
      this.stats.completedTasks++;
    } catch (error) {
      task.fail(error instanceof Error ? error : new Error(String(error)));
      this.stats.failedTasks++;
    } finally {
      const elapsed = performance.now() - startTime;
      task.addCpuTime(elapsed);
      
      this.stats.activeTasks--;
      this.stats.queueSize = this.taskQueue.getSize();
      this.currentTask = null;
      
      this.notifyListeners();
    }
  }
  
  /**
   * Stop the scheduler
   */
  stop(): void {
    this.running = false;
  }
  
  /**
   * Request a yield (cooperative multitasking)
   */
  yield(): Promise<void> {
    this.yieldRequested = true;
    return Promise.resolve();
  }
  
  /**
   * Sleep for specified milliseconds
   */
  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get current task
   */
  getCurrentTask(): Task | null {
    return this.currentTask;
  }
  
  /**
   * Get task by ID
   */
  getTask(id: number): Task | null {
    return this.tasks.get(id) ?? null;
  }
  
  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get tasks by state
   */
  getTasksByState(state: TaskState): Task[] {
    return this.getAllTasks().filter(t => t.state === state);
  }
  
  /**
   * Get statistics
   */
  getStats(): SchedulerStats {
    return { ...this.stats };
  }
  
  /**
   * Subscribe to scheduler events
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (e) {
        console.error('[Scheduler] Listener error:', e);
      }
    });
  }
  
  /**
   * Check if scheduler is running
   */
  isRunning(): boolean {
    return this.running;
  }
  
  /**
   * Check if yield was requested
   */
  isYieldRequested(): boolean {
    return this.yieldRequested;
  }
  
  /**
   * Clear yield request
   */
  clearYieldRequest(): void {
    this.yieldRequested = false;
  }
  
  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.taskQueue.getSize();
  }
}

// Singleton instance
export const scheduler = new Scheduler();
