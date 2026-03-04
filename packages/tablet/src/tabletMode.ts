// 平板模式管理器

import { deviceDetector } from './deviceDetector';
import { touchHandler } from './touchHandler';
import type { DeviceInfo } from './deviceDetector';

export interface TabletModeConfig {
  autoDetect: boolean;
  forceTabletMode: boolean;
  largerTouchTargets: boolean;
  disableHoverStates: boolean;
  enableSwipeGestures: boolean;
}

const defaultConfig: TabletModeConfig = {
  autoDetect: true,
  forceTabletMode: false,
  largerTouchTargets: true,
  disableHoverStates: true,
  enableSwipeGestures: true
};

class TabletModeManager {
  private config: TabletModeConfig;
  private isTabletMode = false;
  private listeners: Set<(isTablet: boolean) => void> = new Set();
  private cleanupFns: (() => void)[] = [];

  constructor(config: Partial<TabletModeConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    
    if (this.config.autoDetect) {
      this.setupAutoDetect();
    }
  }

  private setupAutoDetect(): void {
    // 初始检测
    this.updateMode(deviceDetector.getInfo());

    // 监听设备变化
    const unsubscribe = deviceDetector.onChange((info) => {
      this.updateMode(info);
    });
    this.cleanupFns.push(unsubscribe);
  }

  private updateMode(info: DeviceInfo): void {
    const shouldBeTablet = this.config.forceTabletMode || info.isTablet || info.isTouch;
    
    if (shouldBeTablet !== this.isTabletMode) {
      this.isTabletMode = shouldBeTablet;
      this.applyMode();
      this.notifyListeners();
    }
  }

  private applyMode(): void {
    const html = document.documentElement;

    if (this.isTabletMode) {
      html.classList.add('os-tablet-mode');
      html.classList.remove('os-desktop-mode');
      
      // 增大触摸目标
      if (this.config.largerTouchTargets) {
        html.classList.add('os-large-touch-targets');
      }
      
      // 禁用悬停状态（防止触摸设备上的"粘滞"悬停效果）
      if (this.config.disableHoverStates) {
        html.classList.add('os-no-hover');
      }
      
      // 启用滑动手势
      if (this.config.enableSwipeGestures) {
        this.setupSwipeGestures();
      }
    } else {
      html.classList.remove('os-tablet-mode');
      html.classList.add('os-desktop-mode');
      html.classList.remove('os-large-touch-targets');
      html.classList.remove('os-no-hover');
      this.cleanupSwipeGestures();
    }
  }

  private setupSwipeGestures(): void {
    // 从屏幕边缘滑动打开开始菜单
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // 从左边缘向右滑动 - 打开开始菜单
      if (startX < 20 && deltaX > 100 && Math.abs(deltaY) < 50) {
        window.dispatchEvent(new CustomEvent('tablet:openStartMenu'));
      }

      // 从顶部向下滑动 - 显示通知
      if (startY < 20 && deltaY > 100 && Math.abs(deltaX) < 50) {
        window.dispatchEvent(new CustomEvent('tablet:showNotifications'));
      }

      // 从底部向上滑动 - 显示任务栏（如果隐藏）
      if (startY > window.innerHeight - 20 && deltaY < -100 && Math.abs(deltaX) < 50) {
        window.dispatchEvent(new CustomEvent('tablet:showTaskbar'));
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    this.cleanupFns.push(() => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    });
  }

  private cleanupSwipeGestures(): void {
    // 手势清理已由 cleanupFns 处理
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isTabletMode));
  }

  // 公共 API
  isEnabled(): boolean {
    return this.isTabletMode;
  }

  enable(): void {
    this.config.forceTabletMode = true;
    this.updateMode(deviceDetector.getInfo());
  }

  disable(): void {
    this.config.forceTabletMode = false;
    this.updateMode(deviceDetector.getInfo());
  }

  toggle(): void {
    if (this.isTabletMode) {
      this.disable();
    } else {
      this.enable();
    }
  }

  onChange(callback: (isTablet: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // 为窗口启用触摸支持
  enableWindowTouch(windowEl: HTMLElement): void {
    touchHandler.enableTouchForWindow(windowEl);
  }

  // 移除窗口触摸支持
  disableWindowTouch(windowEl: HTMLElement): void {
    touchHandler.disableTouchForWindow(windowEl);
  }

  // 清理
  destroy(): void {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    this.listeners.clear();
  }
}

export const tabletModeManager = new TabletModeManager();
