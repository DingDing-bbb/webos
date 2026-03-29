/**
 * 手势识别模块
 * 基于 Windows 触控手势指南
 */

export type GestureType =
  | 'tap'
  | 'doubleTap'
  | 'longPress'
  | 'pressAndHold'
  | 'swipe'
  | 'pinch'
  | 'stretch'
  | 'pan'
  | 'rotate';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export type EdgePosition = 'left' | 'right' | 'top' | 'bottom' | null;

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
  scale: number;
  rotation: number;
  direction: SwipeDirection | null;
  edge: EdgePosition;
  duration: number;
  fingerCount: number;
  timestamp: number;
}

export interface GestureConfig {
  tapThreshold: number;
  tapTimeout: number;
  doubleTapTimeout: number;
  longPressTimeout: number;
  pressAndHoldTimeout: number;
  swipeThreshold: number;
  swipeVelocity: number;
  pinchThreshold: number;
  rotateThreshold: number;
  edgeThreshold: number;
}

const defaultConfig: GestureConfig = {
  tapThreshold: 10,
  tapTimeout: 200,
  doubleTapTimeout: 300,
  longPressTimeout: 800,
  pressAndHoldTimeout: 300,
  swipeThreshold: 50,
  swipeVelocity: 0.3,
  pinchThreshold: 10,
  rotateThreshold: 5,
  edgeThreshold: 20,
};

type GestureCallbacks = {
  onTap?: (e: GestureEvent) => void;
  onDoubleTap?: (e: GestureEvent) => void;
  onLongPress?: (e: GestureEvent) => void;
  onPressAndHold?: (e: GestureEvent) => void;
  onSwipe?: (e: GestureEvent) => void;
  onPinch?: (e: GestureEvent) => void;
  onStretch?: (e: GestureEvent) => void;
  onRotate?: (e: GestureEvent) => void;
  onPan?: (e: GestureEvent) => void;
  onPanStart?: (e: GestureEvent) => void;
  onPanEnd?: (e: GestureEvent) => void;
  onEdgeSwipe?: (e: GestureEvent) => void;
};

class GestureDetector {
  private config: GestureConfig;

  constructor(config: Partial<GestureConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  createRecognizer(element: HTMLElement, callbacks: GestureCallbacks): () => void {
    let touchStart: { x: number; y: number; time: number } | null = null;
    let lastTap: { x: number; y: number; time: number } | null = null;
    let longPressTimer: number | null = null;
    let pressAndHoldTimer: number | null = null;
    let isPanning = false;
    let initialDistance = 0;
    let initialAngle = 0;
    let currentScale = 1;
    let currentRotation = 0;

    const getTouch = (e: TouchEvent): Touch | null => {
      return e.touches[0] || e.changedTouches[0] || null;
    };

    const getEdgePosition = (x: number, y: number): EdgePosition => {
      const threshold = this.config.edgeThreshold;
      if (x <= threshold) return 'left';
      if (x >= window.innerWidth - threshold) return 'right';
      if (y <= threshold) return 'top';
      if (y >= window.innerHeight - threshold) return 'bottom';
      return null;
    };

    const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    const getAngle = (x1: number, y1: number, x2: number, y2: number): number => {
      return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    };

    const createEvent = (
      type: GestureType,
      originalEvent: TouchEvent,
      overrides: Partial<GestureEvent> = {}
    ): GestureEvent => {
      const touch = getTouch(originalEvent);
      const x = touch?.clientX ?? 0;
      const y = touch?.clientY ?? 0;
      const startTime = touchStart?.time ?? Date.now();

      return {
        type,
        target: originalEvent.target,
        startX: touchStart?.x ?? x,
        startY: touchStart?.y ?? y,
        currentX: x,
        currentY: y,
        deltaX: touchStart ? x - touchStart.x : 0,
        deltaY: touchStart ? y - touchStart.y : 0,
        velocity: 0,
        scale: currentScale,
        rotation: currentRotation,
        direction: null,
        edge: getEdgePosition(touchStart?.x ?? x, touchStart?.y ?? y),
        duration: Date.now() - startTime,
        fingerCount: originalEvent.touches.length || originalEvent.changedTouches.length,
        timestamp: Date.now(),
        ...overrides,
      };
    };

    const getSwipeDirection = (deltaX: number, deltaY: number): SwipeDirection => {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left';
      }
      return deltaY > 0 ? 'down' : 'up';
    };

    const clearTimers = (): void => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (pressAndHoldTimer) {
        clearTimeout(pressAndHoldTimer);
        pressAndHoldTimer = null;
      }
    };

    const handleTouchStart = (e: TouchEvent): void => {
      const touch = getTouch(e);
      if (!touch) return;

      touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      isPanning = false;
      currentScale = 1;
      currentRotation = 0;

      if (e.touches.length === 2) {
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        if (t0 && t1) {
          initialDistance = getDistance(t0.clientX, t0.clientY, t1.clientX, t1.clientY);
          initialAngle = getAngle(t0.clientX, t0.clientY, t1.clientX, t1.clientY);
        }
      }

      longPressTimer = window.setTimeout(() => {
        if (touchStart && !isPanning) {
          callbacks.onLongPress?.(createEvent('longPress', e));
        }
      }, this.config.longPressTimeout);

      pressAndHoldTimer = window.setTimeout(() => {
        if (touchStart && !isPanning) {
          callbacks.onPressAndHold?.(createEvent('pressAndHold', e));
        }
      }, this.config.pressAndHoldTimeout);
    };

    const handleTouchMove = (e: TouchEvent): void => {
      if (!touchStart) return;

      const touch = getTouch(e);
      if (!touch) return;

      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > this.config.tapThreshold) {
        clearTimers();
      }

      if (!isPanning && distance > this.config.tapThreshold) {
        isPanning = true;
        callbacks.onPanStart?.(createEvent('pan', e));
      }

      if (isPanning) {
        callbacks.onPan?.(createEvent('pan', e));
      }

      if (e.touches.length === 2 && initialDistance > 0) {
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        if (t0 && t1) {
          const currentDistance = getDistance(t0.clientX, t0.clientY, t1.clientX, t1.clientY);
          const currentAngle = getAngle(t0.clientX, t0.clientY, t1.clientX, t1.clientY);

          currentScale = currentDistance / initialDistance;
          currentRotation = currentAngle - initialAngle;

          if (Math.abs(currentScale - 1) > this.config.pinchThreshold / 100) {
            if (currentScale > 1) {
              callbacks.onStretch?.(createEvent('stretch', e, { scale: currentScale }));
            } else {
              callbacks.onPinch?.(createEvent('pinch', e, { scale: currentScale }));
            }
          }

          if (Math.abs(currentRotation) > this.config.rotateThreshold) {
            callbacks.onRotate?.(createEvent('rotate', e, { rotation: currentRotation }));
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent): void => {
      clearTimers();

      if (!touchStart) return;

      const touch = getTouch(e);
      if (!touch) return;

      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = Date.now() - touchStart.time;
      const velocity = distance / duration;

      if (isPanning) {
        callbacks.onPanEnd?.(createEvent('pan', e));

        if (distance > this.config.swipeThreshold || velocity > this.config.swipeVelocity) {
          const direction = getSwipeDirection(deltaX, deltaY);
          const event = createEvent('swipe', e, {
            direction,
            velocity,
            edge: getEdgePosition(touchStart.x, touchStart.y),
          });
          callbacks.onSwipe?.(event);

          if (event.edge) {
            callbacks.onEdgeSwipe?.(event);
          }
        }
      } else if (distance < this.config.tapThreshold && duration < this.config.tapTimeout) {
        const now = Date.now();

        if (
          lastTap &&
          now - lastTap.time < this.config.doubleTapTimeout &&
          Math.abs(touch.clientX - lastTap.x) < 30 &&
          Math.abs(touch.clientY - lastTap.y) < 30
        ) {
          callbacks.onDoubleTap?.(createEvent('doubleTap', e));
          lastTap = null;
        } else {
          lastTap = { x: touch.clientX, y: touch.clientY, time: now };
          callbacks.onTap?.(createEvent('tap', e));
        }
      }

      touchStart = null;
      isPanning = false;
      initialDistance = 0;
      initialAngle = 0;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      clearTimers();
    };
  }
}

export const gestureDetector = new GestureDetector();
