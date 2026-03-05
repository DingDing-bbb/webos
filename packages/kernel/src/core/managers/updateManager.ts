/**
 * 更新管理器
 * 管理自动更新、版本检查和离线访问
 */

export interface UpdateConfig {
  autoUpdate: boolean;
  lastCheckTime: number | null;
  currentVersion: string;
  lastVersion: string | null;
}

export interface UpdateStatus {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string | null;
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
    latestVersion: null,
    lastCheckTime: null,
    isChecking: false,
    isUpdating: false
  };

  constructor() {
    this.config = this.loadConfig();
    this.status.currentVersion = __OS_VERSION__;
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
      currentVersion: __OS_VERSION__,
      lastVersion: null
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
   * 检查更新
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
      const latestVersion = data.version;
      const buildTime = data.buildTime;

      this.config.lastCheckTime = Date.now();
      this.config.lastVersion = latestVersion;
      this.saveConfig();

      const hasUpdate = this.compareVersions(latestVersion, __OS_VERSION__) > 0;

      this.status = {
        ...this.status,
        hasUpdate,
        latestVersion,
        lastCheckTime: this.config.lastCheckTime,
        isChecking: false
      };

      this.notify();

      // 如果有更新且开启了自动更新，自动更新
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
   * 比较版本号
   * 返回: 1 = a > b, -1 = a < b, 0 = a == b
   */
  private compareVersions(a: string, b: string): number {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const partA = partsA[i] || 0;
      const partB = partsB[i] || 0;

      if (partA > partB) return 1;
      if (partA < partB) return -1;
    }

    return 0;
  }

  /**
   * 应用更新
   */
  async applyUpdate(): Promise<void> {
    if (this.status.isUpdating) return;

    this.status.isUpdating = true;
    this.notify();

    try {
      // 清除所有缓存
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // 注销旧的 Service Worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.unregister();
        }
      }

      // 强制重新加载
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
    if (this.status.latestVersion) {
      this.config.lastVersion = this.status.latestVersion;
      this.saveConfig();
      this.status.hasUpdate = false;
      this.notify();
    }
  }

  /**
   * 初始化 - 启动时检查更新
   */
  async init(): Promise<void> {
    // 注册 Service Worker
    await this.registerServiceWorker();

    // 检查是否需要检查更新（启动后延迟检查）
    setTimeout(() => {
      this.checkForUpdate();
    }, 3000);
  }

  /**
   * 注册 Service Worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 有新版本可用
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

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

export const updateManager = new UpdateManager();
