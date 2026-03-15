/**
 * @fileoverview Signal Handler - POSIX-like Signal Handling
 * @module @kernel/kernel/interrupt/SignalHandler
 */

import type { SignalType, SignalHandlerFn, SignalDisposition, SignalAction } from './types';

/**
 * SignalHandler manages signal delivery to processes
 */
export class SignalHandler {
  private signalActions = new Map<SignalType, SignalAction>();
  private pendingSignals = new Map<number, SignalType[]>();
  private nextSigId = 1;
  
  constructor() {
    this.initDefaultHandlers();
  }
  
  private initDefaultHandlers(): void {
    // Set default dispositions
    const defaultTerminate: SignalType[] = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGUSR1', 'SIGUSR2'];
    const defaultIgnore: SignalType[] = ['SIGCHLD', 'SIGWINCH'];
    const defaultCore: SignalType[] = ['SIGSEGV', 'SIGFPE', 'SIGBUS'];
    
    defaultTerminate.forEach(sig => {
      this.signalActions.set(sig, { disposition: 'default' });
    });
    
    defaultIgnore.forEach(sig => {
      this.signalActions.set(sig, { disposition: 'ignore' });
    });
    
    defaultCore.forEach(sig => {
      this.signalActions.set(sig, { disposition: 'default' });
    });
  }
  
  /**
   * Set signal handler
   */
  signal(sig: SignalType, handler: SignalHandlerFn | 'default' | 'ignore'): void {
    const action: SignalAction = {
      disposition: typeof handler === 'function' ? 'handler' : handler,
      handler: typeof handler === 'function' ? handler : undefined,
    };
    
    this.signalActions.set(sig, action);
  }
  
  /**
   * Send signal to process
   */
  kill(pid: number, sig: SignalType): boolean {
    const action = this.signalActions.get(sig);
    
    if (!action) {
      console.warn(`[SignalHandler] Unknown signal: ${sig}`);
      return false;
    }
    
    // Add to pending signals
    if (!this.pendingSignals.has(pid)) {
      this.pendingSignals.set(pid, []);
    }
    this.pendingSignals.get(pid)!.push(sig);
    
    return true;
  }
  
  /**
   * Deliver pending signals
   */
  async deliver(pid: number): Promise<void> {
    const pending = this.pendingSignals.get(pid);
    if (!pending || pending.length === 0) return;
    
    while (pending.length > 0) {
      const sig = pending.shift()!;
      await this.deliverSignal(sig);
    }
  }
  
  /**
   * Deliver a signal
   */
  private async deliverSignal(sig: SignalType): Promise<void> {
    const action = this.signalActions.get(sig);
    
    if (!action) return;
    
    switch (action.disposition) {
      case 'ignore':
        break;
        
      case 'default':
        await this.defaultAction(sig);
        break;
        
      case 'handler':
        if (action.handler) {
          try {
            await action.handler(sig);
          } catch (e) {
            console.error(`[SignalHandler] Handler error for ${sig}:`, e);
          }
        }
        break;
    }
  }
  
  /**
   * Default signal action
   */
  private async defaultAction(sig: SignalType): Promise<void> {
    switch (sig) {
      case 'SIGINT':
      case 'SIGTERM':
      case 'SIGHUP':
      case 'SIGUSR1':
      case 'SIGUSR2':
      case 'SIGSEGV':
      case 'SIGFPE':
      case 'SIGBUS':
        // Terminate process
        console.log(`[SignalHandler] Process terminated by signal ${sig}`);
        break;
        
      case 'SIGALRM':
        // Alarm clock - wake up blocked syscall
        break;
        
      case 'SIGCHLD':
        // Child process status change - ignored by default
        break;
        
      case 'SIGWINCH':
        // Window size change - ignored by default
        break;
    }
  }
  
  /**
   * Get pending signals for a process
   */
  getPending(pid: number): SignalType[] {
    return this.pendingSignals.get(pid) ?? [];
  }
  
  /**
   * Clear pending signals
   */
  clearPending(pid: number): void {
    this.pendingSignals.delete(pid);
  }
  
  /**
   * Block signals (sigsuspend)
   */
  block(signals: SignalType[]): void {
    // Implementation for signal blocking
    // In browser environment, this is simplified
  }
  
  /**
   * Unblock signals
   */
  unblock(signals: SignalType[]): void {
    // Implementation for signal unblocking
  }
}

// Singleton instance
export const signalHandler = new SignalHandler();
