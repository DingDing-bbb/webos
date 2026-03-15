// 触摸交互处理器

import { gestureDetector } from './gestures';
import type { GestureEvent } from './gestures';

export interface TouchWindowConfig {
  enableDrag: boolean;
  enableResize: boolean;
  enableSwipeToClose: boolean;
  dragThreshold: number;
}

const defaultConfig: TouchWindowConfig = {
  enableDrag: true,
  enableResize: true,
  enableSwipeToClose: true,
  dragThreshold: 5
};

class TouchHandler {
  private config: TouchWindowConfig;
  private activeWindow: HTMLElement | null = null;
  private cleanupFns: Map<HTMLElement, () => void> = new Map();

  constructor(config: Partial<TouchWindowConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // 为窗口添加触摸支持
  enableTouchForWindow(windowEl: HTMLElement): void {
    if (this.cleanupFns.has(windowEl)) return;

    const header = windowEl.querySelector('.os-window-header') as HTMLElement;
    if (!header) return;

    const cleanupFns: (() => void)[] = [];

    // 窗口拖动
    if (this.config.enableDrag) {
      cleanupFns.push(this.setupWindowDrag(windowEl, header));
    }

    // 窗口缩放
    if (this.config.enableResize) {
      cleanupFns.push(this.setupWindowResize(windowEl));
    }

    // 双击最大化
    cleanupFns.push(this.setupDoubleTapMaximize(windowEl, header));

    // 合并清理函数
    this.cleanupFns.set(windowEl, () => cleanupFns.forEach(fn => fn()));
  }

  // 移除窗口触摸支持
  disableTouchForWindow(windowEl: HTMLElement): void {
    const cleanup = this.cleanupFns.get(windowEl);
    if (cleanup) {
      cleanup();
      this.cleanupFns.delete(windowEl);
    }
  }

  // 窗口拖动
  private setupWindowDrag(windowEl: HTMLElement, header: HTMLElement): () => void {
    let startPos = { x: 0, y: 0 };
    let windowStartPos = { x: 0, y: 0 };

    const handleStart = (e: GestureEvent) => {
      if ((e.target as HTMLElement).closest('.os-window-controls')) return;
      
      startPos = { x: e.startX, y: e.startY };
      windowStartPos = {
        x: windowEl.offsetLeft,
        y: windowEl.offsetTop
      };
      
      windowEl.classList.add('os-window-dragging');
      this.activeWindow = windowEl;
    };

    const handleMove = (e: GestureEvent) => {
      if (this.activeWindow !== windowEl) return;
      
      const newX = windowStartPos.x + e.currentX - startPos.x;
      const newY = windowStartPos.y + e.currentY - startPos.y;
      
      // 边界限制
      const maxX = window.innerWidth - 50;
      const maxY = window.innerHeight - 50;
      
      windowEl.style.left = Math.max(-windowEl.offsetWidth + 100, Math.min(newX, maxX)) + 'px';
      windowEl.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    };

    const handleEnd = () => {
      windowEl.classList.remove('os-window-dragging');
      this.activeWindow = null;
    };

    const recognizer = gestureDetector.createRecognizer(header, {
      onPanStart: handleStart,
      onPan: handleMove,
      onPanEnd: handleEnd
    });

    return () => {
      recognizer();
      windowEl.classList.remove('os-window-dragging');
    };
  }

  // 窗口缩放
  private setupWindowResize(windowEl: HTMLElement): () => void {
    const corners = ['se', 'sw', 'ne', 'nw'];
    const edges = ['n', 's', 'e', 'w'];
    const handles: HTMLElement[] = [];
    const cleanupFns: (() => void)[] = [];

    // 创建角落缩放手柄
    corners.forEach(corner => {
      const handle = this.createResizeHandle(windowEl, corner, true);
      handles.push(handle);
      cleanupFns.push(this.setupResizeGesture(windowEl, handle, corner));
    });

    // 创建边缘缩放手柄
    edges.forEach(edge => {
      const handle = this.createResizeHandle(windowEl, edge, false);
      handles.push(handle);
      cleanupFns.push(this.setupResizeGesture(windowEl, handle, edge));
    });

    return () => {
      handles.forEach(h => h.remove());
      cleanupFns.forEach(fn => fn());
    };
  }

  // 创建缩放手柄
  private createResizeHandle(windowEl: HTMLElement, position: string, isCorner: boolean): HTMLElement {
    const handle = document.createElement('div');
    handle.className = `os-window-touch-resize-handle os-window-touch-resize-${position}`;
    handle.style.cssText = `
      position: absolute;
      ${isCorner ? 'width: 32px; height: 32px;' : ''}
      ${position.includes('n') ? 'top: 0;' : ''}
      ${position.includes('s') ? 'bottom: 0;' : ''}
      ${position.includes('e') ? 'right: 0;' : ''}
      ${position.includes('w') ? 'left: 0;' : ''}
      ${position === 'n' || position === 's' ? 'left: 32px; right: 32px; height: 16px;' : ''}
      ${position === 'e' || position === 'w' ? 'top: 32px; bottom: 32px; width: 16px;' : ''}
      z-index: 10;
      touch-action: none;
    `;
    windowEl.appendChild(handle);
    return handle;
  }

  // 设置缩放手势
  private setupResizeGesture(windowEl: HTMLElement, handle: HTMLElement, position: string): () => void {
    let startPos = { x: 0, y: 0 };
    let startSize = { width: 0, height: 0 };
    let startOffset = { x: 0, y: 0 };

    const handleStart = (e: GestureEvent) => {
      startPos = { x: e.startX, y: e.startY };
      startSize = {
        width: windowEl.offsetWidth,
        height: windowEl.offsetHeight
      };
      startOffset = {
        x: windowEl.offsetLeft,
        y: windowEl.offsetTop
      };
    };

    const handleMove = (e: GestureEvent) => {
      const deltaX = e.currentX - startPos.x;
      const deltaY = e.currentY - startPos.y;
      const minWidth = 200;
      const minHeight = 150;

      let newWidth = startSize.width;
      let newHeight = startSize.height;
      let newX = startOffset.x;
      let newY = startOffset.y;

      // 水平调整
      if (position.includes('e')) {
        newWidth = Math.max(minWidth, startSize.width + deltaX);
      }
      if (position.includes('w')) {
        newWidth = Math.max(minWidth, startSize.width - deltaX);
        newX = startOffset.x + startSize.width - newWidth;
      }

      // 垂直调整
      if (position.includes('s')) {
        newHeight = Math.max(minHeight, startSize.height + deltaY);
      }
      if (position.includes('n')) {
        newHeight = Math.max(minHeight, startSize.height - deltaY);
        newY = startOffset.y + startSize.height - newHeight;
      }

      windowEl.style.width = newWidth + 'px';
      windowEl.style.height = newHeight + 'px';
      windowEl.style.left = newX + 'px';
      windowEl.style.top = newY + 'px';
    };

    return gestureDetector.createRecognizer(handle, {
      onPanStart: handleStart,
      onPan: handleMove
    });
  }

  // 双击最大化
  private setupDoubleTapMaximize(windowEl: HTMLElement, header: HTMLElement): () => void {
    const handleDoubleTap = () => {
      if (windowEl.classList.contains('os-window.maximized')) {
        window.webos?.window.restore(windowEl.id);
      } else {
        window.webos?.window.maximize(windowEl.id);
      }
    };

    return gestureDetector.createRecognizer(header, {
      onDoubleTap: handleDoubleTap
    });
  }
}

export const touchHandler = new TouchHandler();
