/**
 * 平板模式管理器
 * 基于 Windows 11 触控优化和二合一设备交互规范
 * 禁用iOS干扰操作：橡皮筋效果、双击缩放、长按选择等
 */

import { deviceDetector } from './deviceDetector';
import { gestureDetector } from './gestures';
import { touchHandler } from './touchHandler';
import type { DeviceInfo } from './deviceDetector';
import type { GestureEvent } from './gestures';

export interface TabletModeConfig {
  autoDetect: boolean;
  forceTabletMode: boolean;
  largerTouchTargets: boolean;
  disableHoverStates: boolean;
  enableEdgeGestures: boolean;
  enableTouchFeedback: boolean;
  autoShowKeyboard: boolean;
  taskbarAutoHide: boolean;
  disableIOSRubberBand: boolean;
  disableDoubleTapZoom: boolean;
  disableLongPress: boolean;
}

export interface EdgeGestureConfig {
  leftSwipeAction: 'startMenu' | 'back' | 'none';
  rightSwipeAction: 'actionCenter' | 'notifications' | 'none';
  topSwipeAction: 'fullscreen' | 'none';
  bottomSwipeAction: 'taskbar' | 'none';
}

const defaultConfig: TabletModeConfig = {
  autoDetect: false,  // 默认不自动检测，避免误判
  forceTabletMode: false,
  largerTouchTargets: true,
  disableHoverStates: true,
  enableEdgeGestures: true,
  enableTouchFeedback: true,
  autoShowKeyboard: true,
  taskbarAutoHide: false,  // 默认不自动隐藏任务栏
  disableIOSRubberBand: true,
  disableDoubleTapZoom: true,
  disableLongPress: true
};

const defaultEdgeConfig: EdgeGestureConfig = {
  leftSwipeAction: 'startMenu',
  rightSwipeAction: 'actionCenter',
  topSwipeAction: 'fullscreen',
  bottomSwipeAction: 'taskbar'
};

type TabletModeListener = (isTabletMode: boolean) => void;
type ModeChangeReason = 'auto' | 'manual' | 'sensor';

class TabletModeManager {
  private config: TabletModeConfig;
  private edgeConfig: EdgeGestureConfig;
  private isTabletMode = false;
  private listeners: Set<TabletModeListener> = new Set();
  private cleanupFns: (() => void)[] = [];
  private modeChangeReason: ModeChangeReason = 'auto';

  constructor(
    config: Partial<TabletModeConfig> = {},
    edgeConfig: Partial<EdgeGestureConfig> = {}
  ) {
    this.config = { ...defaultConfig, ...config };
    this.edgeConfig = { ...defaultEdgeConfig, ...edgeConfig };

    if (this.config.autoDetect) {
      this.setupAutoDetect();
    }
  }

  private setupAutoDetect(): void {
    this.updateMode(deviceDetector.getInfo(), 'auto');

    const unsubscribe = deviceDetector.onChange((info) => {
      this.updateMode(info, 'auto');
    });
    this.cleanupFns.push(unsubscribe);

    this.setupModeSwitchDetection();
  }

  private setupModeSwitchDetection(): void {
    const checkMode = () => {
      const info = deviceDetector.getInfo();
      if (info.isConvertible) {
        this.updateMode(info, 'sensor');
      }
    };

    if ('screen' in window && 'orientation' in screen) {
      (screen.orientation as unknown as { addEventListener?: (type: string, handler: () => void) => void }).addEventListener?.('change', checkMode);
    }

    window.addEventListener('orientationchange', () => {
      setTimeout(checkMode, 100);
    });

    const mediaQuery = window.matchMedia('(pointer: coarse)');
    mediaQuery.addEventListener('change', checkMode);
  }

  private updateMode(info: DeviceInfo, reason: ModeChangeReason): void {
    const shouldBeTablet = this.config.forceTabletMode || info.isTabletMode;

    if (shouldBeTablet !== this.isTabletMode) {
      this.isTabletMode = shouldBeTablet;
      this.modeChangeReason = reason;
      this.applyMode();
      this.notifyListeners();
    }
  }

  private applyMode(): void {
    const html = document.documentElement;

    if (this.isTabletMode) {
      html.classList.add('os-tablet-mode');
      html.classList.remove('os-desktop-mode');
      html.setAttribute('data-input-mode', 'touch');

      if (this.config.largerTouchTargets) {
        html.classList.add('os-large-touch-targets');
        this.applyLargeTouchTargets();
      }

      if (this.config.disableHoverStates) {
        html.classList.add('os-no-hover');
      }

      if (this.config.enableTouchFeedback) {
        html.classList.add('os-touch-feedback');
        this.setupTouchFeedback();
      }

      if (this.config.enableEdgeGestures) {
        this.setupEdgeGestures();
      }

      if (this.config.taskbarAutoHide) {
        html.classList.add('os-taskbar-autohide');
      }

      // iOS 干扰操作禁用
      this.disableIOSInterferences();

      this.setupKeyboardHandling();
    } else {
      html.classList.remove('os-tablet-mode');
      html.classList.add('os-desktop-mode');
      html.setAttribute('data-input-mode', 'mouse');
      html.classList.remove('os-large-touch-targets');
      html.classList.remove('os-no-hover');
      html.classList.remove('os-touch-feedback');
      html.classList.remove('os-taskbar-autohide');
      
      // 恢复iOS默认行为
      this.enableIOSInterferences();
    }
  }

  /**
   * 禁用iOS干扰操作
   */
  private disableIOSInterferences(): void {
    // 禁用双击缩放
    if (this.config.disableDoubleTapZoom) {
      this.disableDoubleTapZoomGlobal();
    }

    // 禁用iOS橡皮筋效果
    if (this.config.disableIOSRubberBand) {
      this.disableRubberBandEffect();
    }

    // 禁用长按选择和上下文菜单
    if (this.config.disableLongPress) {
      this.disableLongPressGlobal();
    }
  }

  /**
   * 恢复iOS默认行为
   */
  private enableIOSInterferences(): void {
    // 恢复双击缩放
    const dblZoomStyle = document.getElementById('os-disable-dblzoom');
    dblZoomStyle?.remove();

    // 恢复长按
    const longPressStyle = document.getElementById('os-disable-longpress');
    longPressStyle?.remove();
  }

  /**
   * 禁用双击缩放（iOS Safari）
   */
  private disableDoubleTapZoomGlobal(): void {
    let style = document.getElementById('os-disable-dblzoom');
    if (!style) {
      style = document.createElement('style');
      style.id = 'os-disable-dblzoom';
      style.textContent = `
        .os-tablet-mode,
        .os-tablet-mode * {
          touch-action: manipulation;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * 禁用橡皮筋效果
   */
  private disableRubberBandEffect(): void {
    const preventRubberBand = (e: TouchEvent) => {
      // 允许滚动元素内部滚动
      const target = e.target as HTMLElement;
      const scrollable = target.closest('.os-scrollable, [data-scrollable], .os-window-content');
      
      if (scrollable) {
        const el = scrollable as HTMLElement;
        const { scrollTop, scrollHeight, clientHeight } = el;
        
        // 如果内容可以滚动，允许
        if (scrollHeight > clientHeight) {
          // 检查是否在顶部或底部边界
          const atTop = scrollTop === 0;
          const atBottom = scrollTop + clientHeight >= scrollHeight;
          
          if ((atTop && e.touches[0].clientY > 0) || atBottom) {
            // 允许内部滚动
            return;
          }
        }
      }
      
      // 防止页面级别的橡皮筋效果
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        // 只在边缘区域阻止
        if (touch.clientY < 10 || touch.clientY > window.innerHeight - 10) {
          e.preventDefault();
        }
      }
    };

    // 使用 passive: false 以便调用 preventDefault
    document.addEventListener('touchmove', preventRubberBand, { passive: false });
    
    this.cleanupFns.push(() => {
      document.removeEventListener('touchmove', preventRubberBand);
    });
  }

  /**
   * 禁用长按选择和上下文菜单
   */
  private disableLongPressGlobal(): void {
    let style = document.getElementById('os-disable-longpress');
    if (!style) {
      style = document.createElement('style');
      style.id = 'os-disable-longpress';
      style.textContent = `
        .os-tablet-mode {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        .os-tablet-mode input,
        .os-tablet-mode textarea,
        .os-tablet-mode [contenteditable="true"] {
          -webkit-user-select: text;
          user-select: text;
          -webkit-touch-callout: default;
        }
      `;
      document.head.appendChild(style);
    }

    // 禁用上下文菜单
    const preventContextMenu = (e: Event) => {
      const target = e.target as HTMLElement;
      // 允许输入框的上下文菜单
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      e.preventDefault();
    };

    document.addEventListener('contextmenu', preventContextMenu);
    this.cleanupFns.push(() => {
      document.removeEventListener('contextmenu', preventContextMenu);
    });
  }

  private applyLargeTouchTargets(): void {
    const style = document.createElement('style');
    style.id = 'os-tablet-touch-targets';
    style.textContent = `
      .os-tablet-mode .os-large-touch-targets button,
      .os-tablet-mode .os-large-touch-targets a,
      .os-tablet-mode .os-large-touch-targets [role="button"],
      .os-tablet-mode .os-large-touch-targets input,
      .os-tablet-mode .os-large-touch-targets select,
      .os-tablet-mode .os-large-touch-targets textarea {
        min-height: 44px;
        min-width: 44px;
        padding: 12px;
        font-size: 16px;
      }
      .os-tablet-mode .os-large-touch-targets .os-icon-btn {
        min-width: 44px;
        min-height: 44px;
      }
      .os-tablet-mode .os-large-touch-targets .os-menu-item {
        min-height: 48px;
        padding: 12px 16px;
      }
      .os-tablet-mode .os-large-touch-targets .os-list-item {
        min-height: 48px;
      }
    `;

    const existing = document.getElementById('os-tablet-touch-targets');
    if (existing) existing.remove();
    document.head.appendChild(style);
  }

  private setupTouchFeedback(): void {
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target && !target.closest('input, textarea, [contenteditable]')) {
        target.classList.add('os-touch-active');
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        setTimeout(() => target.classList.remove('os-touch-active'), 100);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    this.cleanupFns.push(() => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    });
  }

  private setupEdgeGestures(): void {
    const cleanup = gestureDetector.createRecognizer(document.body, {
      onEdgeSwipe: (e: GestureEvent) => {
        if (!e.edge || !e.direction) return;

        const { edge, direction } = e;

        switch (edge) {
          case 'left':
            if (direction === 'right') {
              this.handleEdgeAction(this.edgeConfig.leftSwipeAction);
            }
            break;
          case 'right':
            if (direction === 'left') {
              this.handleEdgeAction(this.edgeConfig.rightSwipeAction);
            }
            break;
          case 'top':
            if (direction === 'down') {
              this.handleEdgeAction(this.edgeConfig.topSwipeAction);
            }
            break;
          case 'bottom':
            if (direction === 'up') {
              this.handleEdgeAction(this.edgeConfig.bottomSwipeAction);
            }
            break;
        }
      }
    });

    this.cleanupFns.push(cleanup);
  }

  private handleEdgeAction(action: string): void {
    switch (action) {
      case 'startMenu':
        window.dispatchEvent(new CustomEvent('tablet:openStartMenu'));
        break;
      case 'actionCenter':
        window.dispatchEvent(new CustomEvent('tablet:openActionCenter'));
        break;
      case 'notifications':
        window.dispatchEvent(new CustomEvent('tablet:showNotifications'));
        break;
      case 'taskbar':
        window.dispatchEvent(new CustomEvent('tablet:showTaskbar'));
        break;
      case 'back':
        window.dispatchEvent(new CustomEvent('tablet:navigateBack'));
        break;
      case 'fullscreen':
        window.dispatchEvent(new CustomEvent('tablet:toggleFullscreen'));
        break;
    }
  }

  private setupKeyboardHandling(): void {
    if (!this.config.autoShowKeyboard) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        window.dispatchEvent(new CustomEvent('tablet:showKeyboard'));
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        window.dispatchEvent(new CustomEvent('tablet:hideKeyboard'));
      }
    };

    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    this.cleanupFns.push(() => {
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
    });
  }

  isEnabled(): boolean {
    return this.isTabletMode;
  }

  getModeChangeReason(): ModeChangeReason {
    return this.modeChangeReason;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isTabletMode));
  }

  enable(): void {
    this.config.forceTabletMode = true;
    this.updateMode(deviceDetector.getInfo(), 'manual');
  }

  disable(): void {
    this.config.forceTabletMode = false;
    this.updateMode(deviceDetector.getInfo(), 'manual');
  }

  toggle(): void {
    if (this.isTabletMode) {
      this.disable();
    } else {
      this.enable();
    }
  }

  setConfig(config: Partial<TabletModeConfig>): void {
    this.config = { ...this.config, ...config };
    this.updateMode(deviceDetector.getInfo(), this.modeChangeReason);
  }

  setEdgeConfig(config: Partial<EdgeGestureConfig>): void {
    this.edgeConfig = { ...defaultEdgeConfig, ...edgeConfig, ...config };
  }

  onChange(callback: TabletModeListener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  enableWindowTouch(windowEl: HTMLElement): void {
    touchHandler.enableTouchForWindow(windowEl);
  }

  disableWindowTouch(windowEl: HTMLElement): void {
    touchHandler.disableTouchForWindow(windowEl);
  }

  optimizeTouchTargets(container: HTMLElement): void {
    touchHandler.optimizeAllTouchTargets(container);
  }

  destroy(): void {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    this.listeners.clear();
  }
}

export const tabletModeManager = new TabletModeManager();
