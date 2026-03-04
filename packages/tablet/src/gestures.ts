// 触摸手势处理模块

export type GestureType = 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pinch' | 'pan';

export interface GestureEvent {
  type: GestureType;
  target: EventTarget | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  scale?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration: number;
}

export interface GestureOptions {
  tapThreshold?: number;      // 点击判定距离阈值
  tapTimeout?: number;        // 点击判定时间阈值
  doubleTapTimeout?: number;  // 双击间隔时间
  longPressTimeout?: number;  // 长按判定时间
  swipeThreshold?: number;    // 滑动判定距离
  swipeVelocity?: number;     // 滑动最小速度
}

const defaultOptions: GestureOptions = {
  tapThreshold: 10,
  tapTimeout: 250,
  doubleTapTimeout: 300,
  longPressTimeout: 500,
  swipeThreshold: 50,
  swipeVelocity: 0.3
};

class GestureDetector {
  private options: GestureOptions;
  private touchStart: { x: number; y: number; time: number } | null = null;
  private lastTap: { x: number; y: number; time: number } | null = null;
  private longPressTimer: number | null = null;
  private isPanning = false;
  private initialDistance = 0;
  private currentScale = 1;

  constructor(options: Partial<GestureOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  // 创建手势识别器
  createRecognizer(element: HTMLElement, callbacks: {
    onTap?: (e: GestureEvent) => void;
    onDoubleTap?: (e: GestureEvent) => void;
    onLongPress?: (e: GestureEvent) => void;
    onSwipe?: (e: GestureEvent) => void;
    onPinch?: (e: GestureEvent) => void;
    onPan?: (e: GestureEvent) => void;
    onPanStart?: (e: GestureEvent) => void;
    onPanEnd?: (e: GestureEvent) => void;
  }): () => void {
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      this.touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      
      this.isPanning = false;
      this.currentScale = 1;

      // 多指触摸 - 捏合手势
      if (e.touches.length === 2) {
        this.initialDistance = this.getDistance(
          e.touches[0].clientX, e.touches[0].clientY,
          e.touches[1].clientX, e.touches[1].clientY
        );
      }

      // 长按检测
      this.longPressTimer = window.setTimeout(() => {
        if (this.touchStart && !this.isPanning) {
          const event = this.createGestureEvent('longPress', e);
          callbacks.onLongPress?.(event);
        }
      }, this.options.longPressTimeout);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!this.touchStart) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - this.touchStart.x;
      const deltaY = touch.clientY - this.touchStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 取消长按
      if (distance > (this.options.tapThreshold || 10) && this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }

      // 开始拖动
      if (!this.isPanning && distance > (this.options.tapThreshold || 10)) {
        this.isPanning = true;
        const startEvent = this.createGestureEvent('pan', e);
        callbacks.onPanStart?.(startEvent);
      }

      // 拖动中
      if (this.isPanning) {
        const event = this.createGestureEvent('pan', e);
        callbacks.onPan?.(event);
      }

      // 捏合手势
      if (e.touches.length === 2 && this.initialDistance > 0) {
        const currentDistance = this.getDistance(
          e.touches[0].clientX, e.touches[0].clientY,
          e.touches[1].clientX, e.touches[1].clientY
        );
        this.currentScale = currentDistance / this.initialDistance;
        
        const event = this.createGestureEvent('pinch', e);
        event.scale = this.currentScale;
        callbacks.onPinch?.(event);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }

      if (!this.touchStart) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStart.x;
      const deltaY = touch.clientY - this.touchStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = Date.now() - this.touchStart.time;
      const velocity = distance / duration;

      // 拖动结束
      if (this.isPanning) {
        const event = this.createGestureEvent('pan', e);
        callbacks.onPanEnd?.(event);
      }
      // 滑动手势
      else if (distance > (this.options.swipeThreshold || 50) || velocity > (this.options.swipeVelocity || 0.3)) {
        const event = this.createGestureEvent('swipe', e);
        event.direction = this.getSwipeDirection(deltaX, deltaY);
        event.velocity = velocity;
        callbacks.onSwipe?.(event);
      }
      // 点击手势
      else if (distance < (this.options.tapThreshold || 10) && duration < (this.options.tapTimeout || 250)) {
        const now = Date.now();
        
        // 双击检测
        if (this.lastTap && 
            now - this.lastTap.time < (this.options.doubleTapTimeout || 300) &&
            Math.abs(touch.clientX - this.lastTap.x) < 30 &&
            Math.abs(touch.clientY - this.lastTap.y) < 30) {
          const event = this.createGestureEvent('doubleTap', e);
          callbacks.onDoubleTap?.(event);
          this.lastTap = null;
        } else {
          this.lastTap = { x: touch.clientX, y: touch.clientY, time: now };
          const event = this.createGestureEvent('tap', e);
          callbacks.onTap?.(event);
        }
      }

      this.touchStart = null;
      this.isPanning = false;
      this.initialDistance = 0;
    };

    // 绑定事件
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    // 返回清理函数
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }

  private createGestureEvent(type: GestureType, originalEvent: TouchEvent): GestureEvent {
    const touch = originalEvent.changedTouches[0] || originalEvent.touches[0];
    return {
      type,
      target: originalEvent.target,
      startX: this.touchStart?.x || touch.clientX,
      startY: this.touchStart?.y || touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: this.touchStart ? touch.clientX - this.touchStart.x : 0,
      deltaY: this.touchStart ? touch.clientY - this.touchStart.y : 0,
      velocity: 0,
      duration: this.touchStart ? Date.now() - this.touchStart.time : 0
    };
  }

  private getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  private getSwipeDirection(deltaX: number, deltaY: number): 'left' | 'right' | 'up' | 'down' {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    }
    return deltaY > 0 ? 'down' : 'up';
  }
}

export const gestureDetector = new GestureDetector();
