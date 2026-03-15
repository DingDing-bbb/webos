/**
 * @fileoverview Process Manager
 * @module @kernel/executive/process/ProcessManager
 */

import { Process } from './Process';
import type { PID, ProcessState, ProcessPriority } from '../types';
import type { ProcessCreateOptions, ProcessInfoExtended } from './types';

/**
 * ProcessManager manages all processes in the system.
 */
export class ProcessManager {
  private processes = new Map<PID, Process>();
  private currentPid: PID = 0;
  
  /**
   * Create a new process
   */
  create(options: ProcessCreateOptions): PID {
    const process = new Process(options);
    
    // Add as child of parent
    if (options.parentPid !== undefined) {
      const parent = this.processes.get(options.parentPid);
      if (parent) {
        parent.addChild(process.pid);
      }
    }
    
    this.processes.set(process.pid, process);
    return process.pid;
  }
  
  /**
   * Fork current process
   */
  fork(): PID | null {
    if (this.currentPid === 0) return null;
    
    const parent = this.processes.get(this.currentPid);
    if (!parent) return null;
    
    return this.create({
      name: `${parent.name}-fork`,
      path: parent.path,
      args: parent.args,
      env: parent.env,
      cwd: parent.cwd,
      uid: parent.uid,
      gid: parent.gid,
      parentPid: parent.pid,
    });
  }
  
  /**
   * Execute a new process
   */
  async exec(pid: PID): Promise<number> {
    const process = this.processes.get(pid);
    if (!process) return -1;
    
    this.currentPid = pid;
    return process.start();
  }
  
  /**
   * Spawn a new process
   */
  async spawn(options: ProcessCreateOptions): Promise<PID> {
    const pid = this.create(options);
    const process = this.processes.get(pid);
    
    if (process) {
      await process.start();
    }
    
    return pid;
  }
  
  /**
   * Get process by PID
   */
  get(pid: PID): Process | null {
    return this.processes.get(pid) ?? null;
  }
  
  /**
   * Get process info
   */
  getInfo(pid: PID): ProcessInfoExtended | null {
    const process = this.processes.get(pid);
    return process?.getInfo() ?? null;
  }
  
  /**
   * Get all processes
   */
  getAll(): Process[] {
    return Array.from(this.processes.values());
  }
  
  /**
   * Get all process infos
   */
  getAllInfos(): ProcessInfoExtended[] {
    return this.getAll().map(p => p.getInfo());
  }
  
  /**
   * Get processes by state
   */
  getByState(state: ProcessState): Process[] {
    return this.getAll().filter(p => p.state === state);
  }
  
  /**
   * Get current process
   */
  getCurrent(): Process | null {
    return this.processes.get(this.currentPid) ?? null;
  }
  
  /**
   * Get current PID
   */
  getpid(): PID {
    return this.currentPid;
  }
  
  /**
   * Get parent PID
   */
  getppid(): PID | null {
    const current = this.getCurrent();
    return current?.parentPid ?? null;
  }
  
  /**
   * Kill a process
   */
  kill(pid: PID, signal?: string): boolean {
    const process = this.processes.get(pid);
    if (!process) return false;
    
    process.kill(signal);
    
    // If killing current process, find new current
    if (pid === this.currentPid) {
      this.currentPid = 0;
    }
    
    return true;
  }
  
  /**
   * Wait for process to complete
   */
  async wait(pid: PID): Promise<number> {
    const process = this.processes.get(pid);
    if (!process) return -1;
    
    return process.wait();
  }
  
  /**
   * Clean up terminated processes
   */
  reap(): PID[] {
    const reaped: PID[] = [];
    
    for (const [pid, process] of this.processes) {
      if (process.state === 'terminated' || process.state === 'zombie') {
        // Remove from parent's children
        if (process.parentPid !== undefined) {
          const parent = this.processes.get(process.parentPid);
          if (parent) {
            parent.removeChild(pid);
          }
        }
        
        this.processes.delete(pid);
        reaped.push(pid);
      }
    }
    
    return reaped;
  }
  
  /**
   * Get process count
   */
  getCount(): number {
    return this.processes.size;
  }
}

// Singleton instance
export const processManager = new ProcessManager();
