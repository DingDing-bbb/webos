/**
 * @fileoverview Mouse Input Adapter
 * @module @kernel/hal/input/MouseAdapter
 */

import { InputAdapter } from './InputAdapter';
import type { InputEvent, MouseEventData } from './types';

export class MouseAdapter extends InputAdapter {
  readonly name = 'mouse';
  
  private position = { x: 0, y: 0 };
  private buttonsDown = new Set<number>();
  
  constructor() {
    super();
    this.setupListeners();
  }
  
  private setupListeners(): void {
    window.addEventListener('mousemove', this.handleMove);
    window.addEventListener('mousedown', this.handleDown);
    window.addEventListener('mouseup', this.handleUp);
    window.addEventListener('click', this.handleClick);
    window.addEventListener('dblclick', this.handleDblClick);
    window.addEventListener('wheel', this.handleWheel);
    window.addEventListener('contextmenu', this.handleContextMenu);
  }
  
  private handleMove = (e: globalThis.MouseEvent): void => {
    this.position = { x: e.clientX, y: e.clientY };
    this.emitMouseEvent('move', e);
  };
  
  private handleDown = (e: globalThis.MouseEvent): void => {
    this.buttonsDown.add(e.button);
    this.emitMouseEvent('down', e);
  };
  
  private handleUp = (e: globalThis.MouseEvent): void => {
    this.buttonsDown.delete(e.button);
    this.emitMouseEvent('up', e);
  };
  
  private handleClick = (e: globalThis.MouseEvent): void => {
    this.emitMouseEvent('click', e);
  };
  
  private handleDblClick = (e: globalThis.MouseEvent): void => {
    this.emitMouseEvent('dblclick', e);
  };
  
  private handleWheel = (e: globalThis.WheelEvent): void => {
    const data: MouseEventData = {
      type: 'wheel',
      x: e.clientX,
      y: e.clientY,
      button: -1,
      buttons: this.getButtonsState(),
      deltaX: e.deltaX,
      deltaY: e.deltaY,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    };
    
    this.emit({
      type: 'mouse',
      timestamp: Date.now(),
      target: e.target as EventTarget,
      data,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation(),
    });
  };
  
  private handleContextMenu = (e: globalThis.MouseEvent): void => {
    this.emitMouseEvent('contextmenu', e);
  };
  
  private emitMouseEvent(type: MouseEventData['type'], e: globalThis.MouseEvent): void {
    const data: MouseEventData = {
      type,
      x: e.clientX,
      y: e.clientY,
      button: e.button,
      buttons: this.getButtonsState(),
      deltaX: 0,
      deltaY: 0,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    };
    
    this.emit({
      type: 'mouse',
      timestamp: Date.now(),
      target: e.target as EventTarget,
      data,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation(),
    });
  }
  
  private getButtonsState(): number {
    let state = 0;
    if (this.buttonsDown.has(0)) state |= 1;  // Left
    if (this.buttonsDown.has(2)) state |= 2;  // Right
    if (this.buttonsDown.has(1)) state |= 4;  // Middle
    return state;
  }
  
  getMousePosition(): { x: number; y: number } {
    return { ...this.position };
  }
  
  isKeyDown(key: string): boolean {
    return false; // Mouse adapter doesn't handle keyboard
  }
  
  isMouseButtonDown(button: number): boolean {
    return this.buttonsDown.has(button);
  }
  
  destroy(): void {
    window.removeEventListener('mousemove', this.handleMove);
    window.removeEventListener('mousedown', this.handleDown);
    window.removeEventListener('mouseup', this.handleUp);
    window.removeEventListener('click', this.handleClick);
    window.removeEventListener('dblclick', this.handleDblClick);
    window.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('contextmenu', this.handleContextMenu);
  }
}
