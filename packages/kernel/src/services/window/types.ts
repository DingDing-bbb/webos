/**
 * @fileoverview Window Types
 * @module @kernel/services/window/types
 */

/**
 * Window creation options
 */
export interface WindowCreateOptions {
  title?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  modal?: boolean;
  appId?: string;
}

/**
 * Window event types
 */
export type WindowEventType = 
  | 'open'
  | 'close'
  | 'focus'
  | 'blur'
  | 'minimize'
  | 'maximize'
  | 'restore'
  | 'move'
  | 'resize';

/**
 * Window event
 */
export interface WindowEvent {
  type: WindowEventType;
  windowId: string;
  data?: Partial<WindowState>;
  timestamp: Date;
}
