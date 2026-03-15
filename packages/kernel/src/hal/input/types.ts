/**
 * @fileoverview Input Adapter Types
 * @module @kernel/hal/input/types
 */

import type { InputEvent } from '../types';

/**
 * Input adapter interface
 */
export interface IInputAdapter {
  readonly name: string;
  
  subscribe(handler: (event: InputEvent) => void): () => void;
  getMousePosition(): { x: number; y: number };
  isKeyDown(key: string): boolean;
}

export type { InputEvent } from '../types';
