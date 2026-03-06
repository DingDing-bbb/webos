/**
 * 更新管理器
 * 管理自动更新、版本检查和离线访问
 * 主要根据构建时间判断是否需要更新（版本号很少变）
 */

export interface UpdateConfig {
  autoUpdate: boolean;
  lastCheckTime: number | null;
  lastBuildTime: string | null;  // 上次构建时间
}

export interface UpdateStatus {
  hasUpdate: boolean;
  currentVersion: string;
  currentBuildTime: string;
  latestBuildTime: string | null;
  lastCheckTime: number | null;
  isChecking: boolean;
  isUpdating: boolean;
}

const STORAGE_KEY = 'webos-update-config';

class UpdateManager {
  private config: UpdateConfig;
  private listeners: Set<(status: UpdateStatus) => void> = new Set();
  private status: UpdateStatus = {
    hasUpdate: false,
    currentVersion: __OS_VERSION__,
    currentBuildTime: __BUILD_TIME__,
    latestBuildTime: null,
    lastCheckTime: null,
    isChecking: false,
    isUpdating: false
  };

  constructor() {
    this.config = this.loadConfig();
    this.status.currentVersion = __OS_VERSION__;
    this.status.currentBuildTime = __BUILD_TIME__;
    this.status.lastCheckTime = this.config.lastCheckTime;
  }

  private loadConfig(): UpdateConfig {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      autoUpdate: true,
      lastCheckTime: null,
      lastBuildTime: null
    };
  }

  private saveConfig(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
  }

  getConfig(): UpdateConfig {
    return { ...this.config };
  }

  setAutoUpdate(enabled: boolean): void {
    this.config.autoUpdate = enabled;
    this.saveConfig();
  }

  getStatus(): UpdateStatus {
    return { ...this.status };
  }

  subscribe(listener: (status: UpdateStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.getStatus()));
  }

  /**
   * 检查更新（主要根据构建时间）
   */
  async checkForUpdate(): Promise<boolean> {
    if (this.status.isChecking) return false;

    this.status.isChecking = true;
    this.notify();

    try {
      // 使用时间戳防止缓存
      const timestamp = Date.now();
      const response = await fetch(`/version.json?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch version');
      }

      const data = await response.json();
      const latestBuildTime = data.buildTime;

      this.config.lastCheckTime = Date.now();
      this.config.lastBuildTime = latestBuildTime;
      this.saveConfig();

      // 根据构建时间判断是否有更新（构建时间不同 = 有更新）
      const hasUpdate = latestBuildTime !== __BUILD_TIME__;

      this.status = {
        ...this.status,
        hasUpdate,
        latestBuildTime,
        lastCheckTime: this.config.lastCheckTime,
        isChecking: false
      };

      this.notify();

      // 自动更新（仅生产环境，__DEV__ 此时已确保为 false）
      if (hasUpdate && this.config.autoUpdate) {
        this.applyUpdate();
      }

      return hasUpdate;
    } catch (error) {
      console.error('Check update failed:', error);
      this.status.isChecking = false;
      this.notify();
      return false;
    }
  }

  /**
   * 应用更新
   */
  async applyUpdate(): Promise<void> {
    if (this.status.isUpdating) return;

    this.status.isUpdating = true;
    this.notify();

    try {
      // 通知 Service Worker 跳过等待
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          // 发送消息让等待中的 SW 激活
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          // 等待一小段时间让 SW 激活
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // 刷新页面应用更新
      window.location.reload();
    } catch (error) {
      console.error('Apply update failed:', error);
      this.status.isUpdating = false;
      this.notify();
    }
  }

  /**
   * 跳过此版本更新
   */
  skipUpdate(): void {
    // 记录当前构建时间，下次不再提示
    this.config.lastBuildTime = __BUILD_TIME__;
    this.saveConfig();
    this.status.hasUpdate = false;
    this.notify();
  }

  /**
   * 初始化 - 启动时检查更新
   */
  async init(): Promise<void> {
    // 开发模式不启用更新功能
    if (__DEV__) {
      console.log('[UpdateManager] Development mode - update system disabled');
      
      // 清理可能存在的旧 Service Worker
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
          }
        } catch {
          // 忽略错误
        }
      }
      return;
    }

    // 生产模式：注册 Service Worker 并检查更新
    await this.registerServiceWorker();

    setTimeout(() => {
      this.checkForUpdate();
    }, 5000);
  }

  /**
   * 注册 Service Worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (__DEV__) return;

    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[UpdateManager] Service Worker registered');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              if (this.config.autoUpdate) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              } else {
                this.status.hasUpdate = true;
                this.notify();
              }
            }
          });
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

export const updateManager = new UpdateManager();
