/**
 * @fileoverview Trap Handler - System Call Dispatcher
 * @module @kernel/kernel/trap/TrapHandler
 */

import type { SysCallNumber, SysCallHandler, SysCallDefinition } from './types';

/**
 * TrapHandler dispatches system calls to appropriate handlers
 */
export class TrapHandler {
  private syscalls = new Map<SysCallNumber, SysCallDefinition>();
  private syscallsByName = new Map<string, SysCallDefinition>();
  
  /**
   * Register a system call
   */
  register(def: SysCallDefinition): void {
    this.syscalls.set(def.number, def);
    if (def.name) {
      this.syscallsByName.set(def.name, def);
    }
  }
  
  /**
   * Unregister a system call
   */
  unregister(number: SysCallNumber): boolean {
    const def = this.syscalls.get(number);
    if (!def) return false;
    
    this.syscalls.delete(number);
    if (def.name) {
      this.syscallsByName.delete(def.name);
    }
    
    return true;
  }
  
  /**
   * Dispatch a system call
   */
  async dispatch(number: SysCallNumber, args: unknown[]): Promise<unknown> {
    const def = this.syscalls.get(number);
    
    if (!def) {
      throw new Error(`Unknown system call: ${number}`);
    }
    
    // TODO: Add security check if requiresAuth is true
    // if (def.requiresAuth && !isAuthenticated()) {
    //   throw new Error('Permission denied');
    // }
    
    try {
      return await def.handler(args);
    } catch (error) {
      console.error(`[TrapHandler] Syscall ${number} failed:`, error);
      throw error;
    }
  }
  
  /**
   * Dispatch by name
   */
  async dispatchByName(name: string, args: unknown[]): Promise<unknown> {
    const def = this.syscallsByName.get(name);
    
    if (!def) {
      throw new Error(`Unknown system call: ${name}`);
    }
    
    return this.dispatch(def.number, args);
  }
  
  /**
   * Get syscall definition
   */
  get(number: SysCallNumber): SysCallDefinition | null {
    return this.syscalls.get(number) ?? null;
  }
  
  /**
   * Get syscall by name
   */
  getByName(name: string): SysCallDefinition | null {
    return this.syscallsByName.get(name) ?? null;
  }
  
  /**
   * Get all registered syscalls
   */
  getAll(): SysCallDefinition[] {
    return Array.from(this.syscalls.values());
  }
  
  /**
   * Get syscall count
   */
  getCount(): number {
    return this.syscalls.size;
  }
}

// Singleton instance
export const trapHandler = new TrapHandler();
