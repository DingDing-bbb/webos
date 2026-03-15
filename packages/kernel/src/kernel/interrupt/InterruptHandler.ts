/**
 * @fileoverview Interrupt Handler - Event Routing
 * @module @kernel/kernel/interrupt/InterruptHandler
 */

import type { 
  InterruptVector, 
  InterruptHandlerFn, 
  InterruptPriority,
  RegisteredHandler,
  InterruptOptions 
} from './types';

/**
 * InterruptHandler manages interrupt routing and dispatching.
 * Similar to hardware interrupt controllers, but for software events.
 */
export class InterruptHandler {
  private handlers = new Map<InterruptVector, RegisteredHandler[]>();
  private handlerIdCounter = 0;
  private enabled = true;
  
  /**
   * Register an interrupt handler
   */
  register(
    vector: InterruptVector, 
    handler: InterruptHandlerFn,
    options: InterruptOptions = {}
  ): number {
    const id = ++this.handlerIdCounter;
    const registered: RegisteredHandler = {
      id,
      vector,
      handler,
      priority: options.priority ?? 'normal',
      once: options.once ?? false,
    };
    
    if (!this.handlers.has(vector)) {
      this.handlers.set(vector, []);
    }
    
    const handlers = this.handlers.get(vector)!;
    handlers.push(registered);
    
    // Sort by priority (high first)
    handlers.sort((a, b) => {
      const priorityOrder: Record<InterruptPriority, number> = {
        high: 0,
        normal: 1,
        low: 2,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    return id;
  }
  
  /**
   * Unregister a handler by ID
   */
  unregister(handlerId: number): boolean {
    for (const [vector, handlers] of this.handlers) {
      const index = handlers.findIndex(h => h.id === handlerId);
      if (index !== -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          this.handlers.delete(vector);
        }
        return true;
      }
    }
    return false;
  }
  
  /**
   * Trigger an interrupt
   */
  async trigger(vector: InterruptVector, data?: unknown): Promise<void> {
    if (!this.enabled) return;
    
    const handlers = this.handlers.get(vector);
    if (!handlers || handlers.length === 0) return;
    
    const toRemove: number[] = [];
    
    for (const registered of handlers) {
      try {
        await registered.handler(vector, data);
        
        if (registered.once) {
          toRemove.push(registered.id);
        }
      } catch (error) {
        console.error(`[InterruptHandler] Handler error for vector ${vector}:`, error);
      }
    }
    
    // Remove one-time handlers
    toRemove.forEach(id => this.unregister(id));
  }
  
  /**
   * Check if handlers exist for a vector
   */
  hasHandlers(vector: InterruptVector): boolean {
    const handlers = this.handlers.get(vector);
    return handlers !== undefined && handlers.length > 0;
  }
  
  /**
   * Get handler count for a vector
   */
  getHandlerCount(vector: InterruptVector): number {
    return this.handlers.get(vector)?.length ?? 0;
  }
  
  /**
   * Enable/disable interrupt handling
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Check if interrupt handling is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
  
  /**
   * Clear all handlers for a vector
   */
  clearVector(vector: InterruptVector): void {
    this.handlers.delete(vector);
  }
  
  /**
   * Clear all handlers
   */
  clearAll(): void {
    this.handlers.clear();
  }
}

// Singleton instance
export const interruptHandler = new InterruptHandler();
