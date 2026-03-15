/**
 * @fileoverview Process - Execution Context
 * @module @kernel/executive/process/Process
 */

import type { PID, ProcessState, ProcessPriority } from '../types';
import type { ProcessCreateOptions, ProcessInfoExtended } from './types';

let nextPid: PID = 1;

/**
 * Process represents an execution context in the system.
 */
export class Process {
  readonly pid: PID;
  readonly name: string;
  readonly path: string;
  readonly args: string[];
  readonly env: Record<string, string>;
  readonly cwd: string;
  readonly uid: string;
  readonly gid: string;
  readonly startTime: Date;
  readonly parentPid?: PID;
  
  state: ProcessState;
  priority: ProcessPriority;
  childPids: PID[];
  cpuTime: number = 0;
  memoryUsage: number = 0;
  exitCode?: number;
  signal?: string;
  
  private entry?: () => Promise<number> | number;
  private listeners: Set<() => void> = new Set();
  
  constructor(options: ProcessCreateOptions) {
    this.pid = nextPid++;
    this.name = options.name ?? `process-${this.pid}`;
    this.path = options.path ?? '/';
    this.args = options.args ?? [];
    this.env = options.env ?? {};
    this.cwd = options.cwd ?? '/';
    this.uid = options.uid ?? 'nobody';
    this.gid = options.gid ?? 'nobody';
    this.priority = options.priority ?? 'normal';
    this.parentPid = options.parentPid;
    this.state = 'created';
    this.childPids = [];
    this.startTime = new Date();
    this.entry = options.entry;
  }
  
  /**
   * Start the process
   */
  async start(): Promise<number> {
    if (this.state !== 'created') {
      throw new Error(`Cannot start process in state: ${this.state}`);
    }
    
    this.state = 'running';
    
    try {
      if (this.entry) {
        this.exitCode = await Promise.resolve(this.entry());
      } else {
        this.exitCode = 0;
      }
      this.state = 'terminated';
    } catch (error) {
      this.exitCode = 1;
      this.signal = error instanceof Error ? error.message : String(error);
      this.state = 'terminated';
    }
    
    this.notifyListeners();
    return this.exitCode;
  }
  
  /**
   * Stop the process
   */
  stop(signal?: string): void {
    if (this.state === 'terminated' || this.state === 'zombie') {
      return;
    }
    
    this.state = 'stopped';
    this.signal = signal;
    this.notifyListeners();
  }
  
  /**
   * Resume a stopped process
   */
  resume(): void {
    if (this.state === 'stopped') {
      this.state = 'running';
      this.signal = undefined;
      this.notifyListeners();
    }
  }
  
  /**
   * Kill the process
   */
  kill(signal?: string): void {
    if (this.state === 'terminated' || this.state === 'zombie') {
      return;
    }
    
    this.state = 'terminated';
    this.exitCode = signal ? 128 + 1 : 1; // Signal number offset
    this.signal = signal;
    this.notifyListeners();
  }
  
  /**
   * Wait for process to complete
   */
  async wait(): Promise<number> {
    if (this.state === 'terminated') {
      return this.exitCode ?? 0;
    }
    
    return new Promise(resolve => {
      const listener = () => {
        this.listeners.delete(listener);
        resolve(this.exitCode ?? 0);
      };
      this.listeners.add(listener);
    });
  }
  
  /**
   * Get process info
   */
  getInfo(): ProcessInfoExtended {
    return {
      pid: this.pid,
      name: this.name,
      path: this.path,
      args: this.args,
      env: this.env,
      cwd: this.cwd,
      uid: this.uid,
      gid: this.gid,
      state: this.state,
      priority: this.priority,
      parentPid: this.parentPid,
      childPids: this.childPids,
      startTime: this.startTime,
      cpuTime: this.cpuTime,
      memoryUsage: this.memoryUsage,
      exitCode: this.exitCode,
      signal: this.signal,
    };
  }
  
  /**
   * Add a child process
   */
  addChild(pid: PID): void {
    this.childPids.push(pid);
  }
  
  /**
   * Remove a child process
   */
  removeChild(pid: PID): void {
    const index = this.childPids.indexOf(pid);
    if (index !== -1) {
      this.childPids.splice(index, 1);
    }
  }
  
  /**
   * Notify listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('[Process] Listener error:', e);
      }
    });
  }
}
