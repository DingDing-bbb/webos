/**
 * 触摸交互处理器
 * 基于 Windows 触控交互 - 应用开发指南
 */

import { gestureDetector } from './gestures';
import type { GestureEvent } from './gestures';

export interface TouchTargetConfig {
  minSize: number;
  minSpacing: number;
  padding: number;
}

export interface WindowTouchConfig {
  enableDrag: boolean;
  enableResize: boolean;
  enableSwipeToClose: boolean;
  enableSplitView: boolean;
  dragThreshold: number;
  resizeHandleSize: number;
}

const touchTargetDefaults: TouchTargetConfig = {
  minSize: 44,
  minSpacing: 8,
  padding: 12
};

const windowTouchDefaults: WindowTouchConfig = {
  enableDrag: true,
  enableResize: true,
  enableSwipeToClose: true,
  enableSplitView: true,
  dragThreshold: 5,
  resizeHandleSize: 12
};

class TouchHandler {
  private touchTargetConfig: TouchTargetConfig;
  private windowConfig: WindowTouchConfig;
  private activeWindows: Map<HTMLElement, () => void> = new Map();
  private activeDrag: {
    window: HTMLElement;
    startX: number;
    startY: number;
    windowStartX: number;
    windowStartY: number;
  } | null = null;

  constructor(
    touchTargetConfig: Partial<TouchTargetConfig> = {},
    windowConfig: Partial<WindowTouchConfig> = {}
  ) {
    this.touchTargetConfig = { ...touchTargetDefaults, ...touchTargetConfig };
    this.windowConfig = { ...windowTouchDefaults, ...windowConfig };
  }

  enableTouchForWindow(windowEl: HTMLElement): void {
    if (this.activeWindows.has(windowEl)) return;

    const cleanupFns: (() => void)[] = [];
    const header = windowEl.querySelector('.os-window-header') as HTMLElement;

    if (header) {
      if (this.windowConfig.enableDrag) {
        cleanupFns.push(this.setupWindowDrag(windowEl, header));
      }
      cleanupFns.push(this.setupDoubleTapMaximize(windowEl, header));
    }

    if (this.windowConfig.enableResize) {
      cleanupFns.push(this.setupWindowResize(windowEl));
    }

    this.activeWindows.set(windowEl, () => cleanupFns.forEach(fn => fn()));
  }

  disableTouchForWindow(windowEl: HTMLElement): void {
    const cleanup = this.activeWindows.get(windowEl);
    if (cleanup) {
      cleanup();
      this.activeWindows.delete(windowEl);
    }
  }

  private setupWindowDrag(windowEl: HTMLElement, header: HTMLElement): () => void {
    return gestureDetector.createRecognizer(header, {
      onPanStart: (e: GestureEvent) => {
        if ((e.target as HTMLElement).closest('.os-window-controls')) return;

        this.activeDrag = {
          window: windowEl,
          startX: e.currentX,
          startY: e.currentY,
          windowStartX: windowEl.offsetLeft,
          windowStartY: windowEl.offsetTop
        };

        windowEl.classList.add('os-window-dragging');
      },
      onPan: (e: GestureEvent) => {
        if (!this.activeDrag || this.activeDrag.window !== windowEl) return;

        const newX = this.activeDrag.windowStartX + e.deltaX;
        const newY = this.activeDrag.windowStartY + e.deltaY;

        const maxX = window.innerWidth - 50;
        const maxY = window.innerHeight - 50;
        const clampedX = Math.max(-windowEl.offsetWidth + 100, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));

        windowEl.style.left = `${clampedX}px`;
        windowEl.style.top = `${clampedY}px`;
      },
      onPanEnd: () => {
        windowEl.classList.remove('os-window-dragging');
        this.activeDrag = null;
      }
    });
  }

  private setupWindowResize(windowEl: HTMLElement): () => void {
    const positions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    const handles: HTMLElement[] = [];
    const cleanupFns: (() => void)[] = [];

    positions.forEach(pos => {
      const handle = this.createResizeHandle(pos);
      windowEl.appendChild(handle);
      handles.push(handle);
      cleanupFns.push(this.setupResizeGesture(windowEl, handle, pos));
    });

    return () => {
      handles.forEach(h => h.remove());
      cleanupFns.forEach(fn => fn());
    };
  }

  private createResizeHandle(position: string): HTMLElement {
    const handle = document.createElement('div');
    handle.className = `os-touch-resize-handle os-touch-resize-${position}`;
    handle.dataset.resizeHandle = position;

    const isCorner = position.length === 2;
    const size = `${this.windowConfig.resizeHandleSize}px`;

    Object.assign(handle.style, {
      position: 'absolute',
      zIndex: '10',
      touchAction: 'none',
      display: 'block'
    });

    if (isCorner) {
      Object.assign(handle.style, {
        width: size,
        height: size
      });
    } else {
      if (position === 'n' || position === 's') {
        Object.assign(handle.style, {
          left: size,
          right: size,
          height: size
        });
      } else {
        Object.assign(handle.style, {
          top: size,
          bottom: size,
          width: size
        });
      }
    }

    if (position.includes('n')) handle.style.top = '0';
    if (position.includes('s')) handle.style.bottom = '0';
    if (position.includes('e')) handle.style.right = '0';
    if (position.includes('w')) handle.style.left = '0';

    return handle;
  }

  private setupResizeGesture(
    windowEl: HTMLElement,
    handle: HTMLElement,
    position: string
  ): () => void {
    let startSize = { width: 0, height: 0 };
    let startPos = { x: 0, y: 0 };
    let startOffset = { x: 0, y: 0 };

    return gestureDetector.createRecognizer(handle, {
      onPanStart: (e: GestureEvent) => {
        startSize = {
          width: windowEl.offsetWidth,
          height: windowEl.offsetHeight
        };
        startPos = { x: e.currentX, y: e.currentY };
        startOffset = {
          x: windowEl.offsetLeft,
          y: windowEl.offsetTop
        };
        windowEl.classList.add('os-window-resizing');
      },
      onPan: (e: GestureEvent) => {
        const deltaX = e.currentX - startPos.x;
        const deltaY = e.currentY - startPos.y;
        const minSize = this.touchTargetConfig.minSize * 3;

        let newWidth = startSize.width;
        let newHeight = startSize.height;
        let newX = startOffset.x;
        let newY = startOffset.y;

        if (position.includes('e')) {
          newWidth = Math.max(minSize, startSize.width + deltaX);
        }
        if (position.includes('w')) {
          newWidth = Math.max(minSize, startSize.width - deltaX);
          newX = startOffset.x + startSize.width - newWidth;
        }
        if (position.includes('s')) {
          newHeight = Math.max(minSize, startSize.height + deltaY);
        }
        if (position.includes('n')) {
          newHeight = Math.max(minSize, startSize.height - deltaY);
          newY = startOffset.y + startSize.height - newHeight;
        }

        windowEl.style.width = `${newWidth}px`;
        windowEl.style.height = `${newHeight}px`;
        windowEl.style.left = `${newX}px`;
        windowEl.style.top = `${newY}px`;
      },
      onPanEnd: () => {
        windowEl.classList.remove('os-window-resizing');
      }
    });
  }

  private setupDoubleTapMaximize(windowEl: HTMLElement, header: HTMLElement): () => void {
    return gestureDetector.createRecognizer(header, {
      onDoubleTap: () => {
        const isMaximized = windowEl.classList.contains('os-window-maximized');
        if (isMaximized) {
          window.webos?.window.restore(windowEl.id);
        } else {
          window.webos?.window.maximize(windowEl.id);
        }
      }
    });
  }

  optimizeTouchTarget(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const minSize = this.touchTargetConfig.minSize;

    if (rect.width < minSize || rect.height < minSize) {
      const paddingH = Math.max(0, (minSize - rect.width) / 2);
      const paddingV = Math.max(0, (minSize - rect.height) / 2);

      element.style.padding = `${paddingV}px ${paddingH}px`;
      element.style.boxSizing = 'border-box';
    }
  }

  optimizeAllTouchTargets(container: HTMLElement): void {
    const interactiveElements = container.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [tabindex]'
    );

    interactiveElements.forEach(el => {
      if (el instanceof HTMLElement) {
        this.optimizeTouchTarget(el);
      }
    });
  }

  getTouchTargetConfig(): TouchTargetConfig {
    return { ...this.touchTargetConfig };
  }

  destroy(): void {
    this.activeWindows.forEach(cleanup => cleanup());
    this.activeWindows.clear();
  }
}

export const touchHandler = new TouchHandler();
