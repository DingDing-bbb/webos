/**
 * @fileoverview Process Table
 * 
 * The Process Table is the central registry for all processes in the system.
 * It maintains a mapping from PID to Process objects and provides efficient
 * lookup, iteration, and management operations.
 * 
 * @module executive/process/ProcessTable
 * @version 1.0.0
 */

import type { PID } from '../types';
import { ProcessState, ExitReason, type ProcessInfo } from './types';
import { Process } from './Process';

/**
 * Process Table
 * 
 * Manages the system-wide process registry. The table provides:
 * - O(1) PID lookup
 * - PID allocation
 * - Process iteration
 * - Statistics tracking
 */
export class ProcessTable {
  /** Map from PID to Process */
  private _processes: Map<PID, Process> = new Map();

  /** Map from process name to PID (for quick name lookup) */
  private _nameIndex: Map<string, Set<PID>> = new Map();

  /** Next available PID */
  private _nextPid: PID = 1;

  /** Maximum PID value */
  private readonly MAX_PID = 32768;

  /** Statistics */
  private _stats = {
    totalCreated: 0,
    totalTerminated: 0,
    contextSwitches: 0,
  };

  /**
   * Allocate a new PID
   * @returns A unique PID, or null if allocation failed
   */
  public allocatePid(): PID | null {
    // Find an unused PID
    const startPid = this._nextPid;
    
    do {
      if (!this._processes.has(this._nextPid)) {
        const allocated = this._nextPid;
        
        // Move to next PID for future allocations
        this._nextPid = (this._nextPid % this.MAX_PID) + 1;
        
        return allocated;
      }
      
      this._nextPid = (this._nextPid % this.MAX_PID) + 1;
    } while (this._nextPid !== startPid);

    // No available PIDs
    return null;
  }

  /**
   * Add a process to the table
   * @param process The process to add
   * @returns true if added successfully
   */
  public add(process: Process): boolean {
    if (this._processes.has(process.pid)) {
      return false;
    }

    this._processes.set(process.pid, process);

    // Update name index
    const name = process.name;
    if (!this._nameIndex.has(name)) {
      this._nameIndex.set(name, new Set());
    }
    this._nameIndex.get(name)!.add(process.pid);

    // Update statistics
    this._stats.totalCreated++;

    return true;
  }

  /**
   * Remove a process from the table
   * @param pid The PID to remove
   * @returns The removed process, or undefined if not found
   */
  public remove(pid: PID): Process | undefined {
    const process = this._processes.get(pid);
    
    if (!process) {
      return undefined;
    }

    // Remove from main table
    this._processes.delete(pid);

    // Update name index
    const nameSet = this._nameIndex.get(process.name);
    if (nameSet) {
      nameSet.delete(pid);
      if (nameSet.size === 0) {
        this._nameIndex.delete(process.name);
      }
    }

    // Update statistics
    this._stats.totalTerminated++;

    return process;
  }

  /**
   * Get a process by PID
   * @param pid The PID to look up
   * @returns The process, or undefined if not found
   */
  public get(pid: PID): Process | undefined {
    return this._processes.get(pid);
  }

  /**
   * Check if a PID exists
   * @param pid The PID to check
   */
  public has(pid: PID): boolean {
    return this._processes.has(pid);
  }

  /**
   * Find processes by name
   * @param name The process name to search for
   * @returns Array of matching processes
   */
  public findByName(name: string): Process[] {
    const pids = this._nameIndex.get(name);
    if (!pids) {
      return [];
    }

    const processes: Process[] = [];
    for (const pid of pids) {
      const process = this._processes.get(pid);
      if (process) {
        processes.push(process);
      }
    }

    return processes;
  }

  /**
   * Find processes by user ID
   * @param uid The user ID to search for
   * @returns Array of matching processes
   */
  public findByUid(uid: string): Process[] {
    const processes: Process[] = [];
    for (const process of this._processes.values()) {
      if (process.uid === uid) {
        processes.push(process);
      }
    }
    return processes;
  }

  /**
   * Get all processes
   * @returns Array of all processes
   */
  public getAll(): Process[] {
    return Array.from(this._processes.values());
  }

  /**
   * Get process count
   */
  public get count(): number {
    return this._processes.size;
  }

  /**
   * Get processes in a specific state
   * @param state The state to filter by
   */
  public getByState(state: ProcessState): Process[] {
    const processes: Process[] = [];
    for (const process of this._processes.values()) {
      if (process.state === state) {
        processes.push(process);
      }
    }
    return processes;
  }

  /**
   * Get running processes
   */
  public getRunning(): Process[] {
    return this.getByState(ProcessState.RUNNING);
  }

  /**
   * Get zombie processes
   */
  public getZombies(): Process[] {
    return this.getByState(ProcessState.ZOMBIE);
  }

  /**
   * Get all child processes of a given parent
   * @param ppid The parent PID
   */
  public getChildren(ppid: PID): Process[] {
    const children: Process[] = [];
    for (const process of this._processes.values()) {
      if (process.ppid === ppid) {
        children.push(process);
      }
    }
    return children;
  }

  /**
   * Get process tree starting from a root PID
   * @param rootPid The root PID
   * @returns Map from PID to children PIDs
   */
  public getProcessTree(rootPid: PID = 1): Map<PID, PID[]> {
    const tree = new Map<PID, PID[]>();
    
    // Initialize tree with all PIDs
    for (const process of this._processes.values()) {
      tree.set(process.pid, []);
    }

    // Build parent-child relationships
    for (const process of this._processes.values()) {
      if (process.ppid !== 0 && tree.has(process.ppid)) {
        tree.get(process.ppid)!.push(process.pid);
      }
    }

    return tree;
  }

  /**
   * Get process info for all processes
   */
  public getAllInfo(): ProcessInfo[] {
    return this.getAll().map((p) => p.getInfo());
  }

  /**
   * Reap zombie processes
   * Removes terminated processes whose parents have already reaped them
   * @returns Number of processes reaped
   */
  public reapZombies(): number {
    let reaped = 0;
    const zombies = this.getZombies();

    for (const zombie of zombies) {
      // Check if parent is still alive
      const parent = this._processes.get(zombie.ppid);
      
      if (!parent || parent.state === ProcessState.TERMINATED) {
        // Parent is dead, adopt to init (PID 1) or reap
        if (zombie.ppid !== 1 && this._processes.has(1)) {
          // Re-parent to init
          zombie.ppid = 1;
        } else {
          // Remove the zombie
          this.remove(zombie.pid);
          reaped++;
        }
      }
    }

    return reaped;
  }

  /**
   * Terminate all processes (for shutdown)
   */
  public terminateAll(): void {
    // Send termination signal to all processes
    for (const process of this._processes.values()) {
      if (process.state !== ProcessState.TERMINATED) {
        process.terminate(0, ExitReason.SYSTEM);
      }
    }

    // Clear the table
    this._processes.clear();
    this._nameIndex.clear();
  }

  /**
   * Record a context switch
   */
  public recordContextSwitch(): void {
    this._stats.contextSwitches++;
  }

  /**
   * Get process statistics
   */
  public getStats(): {
    totalCreated: number;
    totalTerminated: number;
    currentCount: number;
    currentRunning: number;
    currentBlocked: number;
    currentZombies: number;
    contextSwitches: number;
  } {
    return {
      ...this._stats,
      currentCount: this._processes.size,
      currentRunning: this.getByState(ProcessState.RUNNING).length,
      currentBlocked: this.getByState(ProcessState.BLOCKED).length,
      currentZombies: this.getZombies().length,
      contextSwitches: this._stats.contextSwitches,
    };
  }

  /**
   * Iterate over all processes
   */
  public [Symbol.iterator](): Iterator<Process> {
    return this._processes.values()[Symbol.iterator]();
  }

  /**
   * ForEach implementation
   */
  public forEach(callback: (process: Process, pid: PID) => void): void {
    this._processes.forEach((process, pid) => {
      callback(process, pid);
    });
  }

  /**
   * Filter processes
   */
  public filter(predicate: (process: Process) => boolean): Process[] {
    const result: Process[] = [];
    for (const process of this._processes.values()) {
      if (predicate(process)) {
        result.push(process);
      }
    }
    return result;
  }

  /**
   * Find a process by predicate
   */
  public find(predicate: (process: Process) => boolean): Process | undefined {
    for (const process of this._processes.values()) {
      if (predicate(process)) {
        return process;
      }
    }
    return undefined;
  }

  /**
   * Clear all processes (for testing)
   */
  public clear(): void {
    this._processes.clear();
    this._nameIndex.clear();
    this._nextPid = 1;
    this._stats = {
      totalCreated: 0,
      totalTerminated: 0,
      contextSwitches: 0,
    };
  }
}

export default ProcessTable;
