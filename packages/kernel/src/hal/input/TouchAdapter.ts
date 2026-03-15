/**
 * @fileoverview Touch Input Adapter
 * @module @kernel/hal/input/TouchAdapter
 */

import { InputAdapter } from './InputAdapter';
import type { InputEvent, TouchEventData, TouchPoint } from './types';

export class TouchAdapter extends InputAdapter {
  readonly name = 'touch';
  
  constructor() {
    super();
    this.setupListeners();
  }
  
  private setupListeners(): void {
    window.addEventListener('touchstart', this.handleTouch);
    window.addEventListener('touchmove', this.handleTouch);
    window.addEventListener('touchend', this.handleTouch);
    window.addEventListener('touchcancel', this.handleTouch);
  }
  
  private handleTouch = (e: globalThis.TouchEvent): void => {
    const touches = this.mapTouches(e.touches);
    const changedTouches = this.mapTouches(e.changedTouches);
    
    const data: TouchEventData = {
      type: e.type.replace('touch', '') as 'start' | 'move' | 'end' | 'cancel',
      touches,
      changedTouches,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    };
    
    this.emit({
      type: 'touch',
      timestamp: Date.now(),
      target: e.target as EventTarget,
      data,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation(),
    });
  };
  
  private mapTouches(touchList: globalThis.TouchList): TouchPoint[] {
    const points: TouchPoint[] = [];
    for (let i = 0; i < touchList.length; i++) {
      const touch = touchList[i];
      points.push({
        identifier: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        pageX: touch.pageX,
        pageY: touch.pageY,
        force: touch.force,
      });
    }
    return points;
  }
  
  getMousePosition(): { x: number; y: number } {
    return { x: 0, y: 0 }; // Touch adapter doesn't track mouse
  }
  
  isKeyDown(key: string): boolean {
    return false; // Touch adapter doesn't handle keyboard
  }
  
  destroy(): void {
    window.removeEventListener('touchstart', this.handleTouch);
    window.removeEventListener('touchmove', this.handleTouch);
    window.removeEventListener('touchend', this.handleTouch);
    window.removeEventListener('touchcancel', this.handleTouch);
  }
}
