/**
 * @fileoverview Interrupt Types
 * @module @kernel/kernel/interrupt/types
 */

/**
 * Interrupt priority levels
 */
export type InterruptPriority = 'high' | 'normal' | 'low';

/**
 * Interrupt vector number
 */
export type InterruptVector = number;

/**
 * Interrupt handler function
 */
export type InterruptHandlerFn = (vector: InterruptVector, data?: unknown) => void | Promise<void>;

/**
 * Interrupt registration options
 */
export interface InterruptOptions {
  /** Priority level for this handler */
  priority?: InterruptPriority;
  /** Call only once then unregister */
  once?: boolean;
}

/**
 * Registered interrupt handler
 */
export interface RegisteredHandler {
  id: number;
  vector: InterruptVector;
  handler: InterruptHandlerFn;
  priority: InterruptPriority;
  once: boolean;
}

/**
 * Predefined interrupt vectors
 */
export const InterruptVectors = {
  // Hardware interrupts
  TIMER: 0x00,
  KEYBOARD: 0x01,
  MOUSE: 0x02,
  DISK: 0x03,
  NETWORK: 0x04,
  
  // Software interrupts
  SYSTEM_CALL: 0x80,
  IPC: 0x81,
  SIGNAL: 0x82,
  
  // Exception vectors
  PAGE_FAULT: 0x0E,
  GENERAL_PROTECTION: 0x0D,
  INVALID_OPCODE: 0x06,
  
  // Custom vectors (0x40-0x7F available)
  CUSTOM_START: 0x40,
  CUSTOM_END: 0x7F,
} as const;

/**
 * Signal types (POSIX-like)
 */
export type SignalType = 
  | 'SIGINT'   // Interrupt (Ctrl+C)
  | 'SIGTERM'  // Termination request
  | 'SIGKILL'  // Kill (cannot be caught)
  | 'SIGHUP'   // Hangup
  | 'SIGUSR1'  // User-defined 1
  | 'SIGUSR2'  // User-defined 2
  | 'SIGALRM'  // Alarm clock
  | 'SIGCHLD'  // Child process status change
  | 'SIGWINCH' // Window size change
  | 'SIGSEGV'  // Segmentation fault
  | 'SIGFPE'   // Floating point exception
  | 'SIGBUS'   // Bus error
  ;

/**
 * Signal handler function
 */
export type SignalHandlerFn = (signal: SignalType, data?: unknown) => void | Promise<void>;

/**
 * Signal disposition
 */
export type SignalDisposition = 'default' | 'ignore' | 'handler';

/**
 * Signal action configuration
 */
export interface SignalAction {
  disposition: SignalDisposition;
  handler?: SignalHandlerFn;
  flags?: {
    saRestart?: boolean;
    saNoChildWait?: boolean;
  };
}
