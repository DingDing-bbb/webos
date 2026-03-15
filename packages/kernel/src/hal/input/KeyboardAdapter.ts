/**
 * @fileoverview Keyboard Input Adapter
 * @module @kernel/hal/input/KeyboardAdapter
 */

import { InputAdapter } from './InputAdapter';
import type { InputEvent, KeyboardEventData } from './types';

export class KeyboardAdapter extends InputAdapter {
  readonly name = 'keyboard';
  
  private keysDown = new Set<string>();
  private mousePos = { x: 0, y: 0 };
  
  constructor() {
    super();
    this.setupListeners();
  }
  
  private setupListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }
  
  private handleKeyDown = (e: globalThis.KeyboardEvent): void => {
    this.keysDown.add(e.key);
    
    const data: KeyboardEventData = {
      type: 'down',
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
      repeat: e.repeat,
    };
    
    this.emit({
      type: 'keyboard',
      timestamp: Date.now(),
      target: e.target as EventTarget,
      data,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation(),
    });
  };
  
  private handleKeyUp = (e: globalThis.KeyboardEvent): void => {
    this.keysDown.delete(e.key);
    
    const data: KeyboardEventData = {
      type: 'up',
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
      repeat: false,
    };
    
    this.emit({
      type: 'keyboard',
      timestamp: Date.now(),
      target: e.target as EventTarget,
      data,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation(),
    });
  };
  
  getMousePosition(): { x: number; y: number } {
    return { ...this.mousePos };
  }
  
  isKeyDown(key: string): boolean {
    return this.keysDown.has(key);
  }
  
  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
