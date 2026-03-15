/**
 * @fileoverview Input Adapter Base Class
 * @module @kernel/hal/input/InputAdapter
 */

import type { IInputAdapter, InputEvent } from './types';

export abstract class InputAdapter implements IInputAdapter {
  abstract readonly name: string;
  
  protected listeners: Set<(event: InputEvent) => void> = new Set();
  
  subscribe(handler: (event: InputEvent) => void): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }
  
  protected emit(event: InputEvent): void {
    this.listeners.forEach(h => { try { h(event); } catch { } });
  }
  
  abstract getMousePosition(): { x: number; y: number };
  abstract isKeyDown(key: string): boolean;
}
