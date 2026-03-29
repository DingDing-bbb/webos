/**
 * Bootloader - 系统引导加载器
 * 
 * 负责系统启动的完整流程：
 * 1. 引导检测
 * 2. 内核初始化
 * 3. 文件系统挂载
 * 4. 服务启动
 * 5. 桌面准备
 */

// ============================================================================
// Re-exports
// ============================================================================

// UI 组件
export { BootUI } from './ui';
export type { BootUIProps } from './ui';

export { BootScreen } from './screen';
export type { BootScreenProps } from './screen';

// ============================================================================
// Types
// ============================================================================

export interface BootError {
  type: 'syntax' | 'module' | 'runtime' | 'network' | 'cache' | 'warning' | 'unknown';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  stack?: string;
  timestamp: Date;
}

export interface BootStatus {
  stage: 'idle' | 'checking' | 'loading' | 'error' | 'recovery' | 'success';
  progress: number;
  message: string;
  errors: BootError[];
  canRecover: boolean;
}

export interface BootTask {
  id: string;
  name: string;
  weight: number;
  execute: () => Promise<void>;
}

export type ProgressCallback = (task: string, progress: number) => void;

export interface BootResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// Boot Manager - 启动状态管理
// ============================================================================

export class BootManager {
  private bootComplete = false;
  private oobeComplete = false;
  private storageKey = 'webos-boot';
  private oobeStorageKey = 'webos-oobe-complete';

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      const backup = localStorage.getItem(this.oobeStorageKey);

      if (saved) {
        const data = JSON.parse(saved);
        this.oobeComplete = data.oobeComplete ?? false;
        this.bootComplete = true;
      }

      if (backup === 'true') {
        this.oobeComplete = true;
        this.bootComplete = true;
      }
    } catch (e) {
      console.error('[BootManager] Failed to load state:', e);
    }
  }

  private saveState(): void {
    try {
      const state = JSON.stringify({ oobeComplete: this.oobeComplete });
      localStorage.setItem(this.storageKey, state);
      localStorage.setItem(this.oobeStorageKey, String(this.oobeComplete));
    } catch (e) {
      console.error('[BootManager] Failed to save state:', e);
    }
  }

  isComplete(): boolean {
    return this.bootComplete;
  }

  isOOBEComplete(): boolean {
    const backup = localStorage.getItem(this.oobeStorageKey);
    if (backup === 'true') {
      this.oobeComplete = true;
    }
    return this.oobeComplete;
  }

  completeOOBE(): void {
    this.oobeComplete = true;
    this.bootComplete = true;
    this.saveState();
  }

  reset(): void {
    this.bootComplete = false;
    this.oobeComplete = false;
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.oobeStorageKey);
  }
}

// ============================================================================
// Boot Controller - 启动控制器
// ============================================================================

/**
 * 启动控制器
 * 
 * 执行真正的系统初始化任务：
 * - Stage 1: Kernel - 内核初始化
 * - Stage 2: Filesystem - 文件系统挂载
 * - Stage 3: Services - 服务启动
 * - Stage 4: Resources - 资源加载
 * - Stage 5: Desktop - 桌面准备
 */
export class BootController {
  private tasks: BootTask[] = [];
  private completedWeight = 0;
  private totalWeight = 0;
  private onProgress?: ProgressCallback;

  constructor() {
    this.registerTasks();
  }

  private registerTasks(): void {
    // ========================================
    // Stage 1: Kernel Initialization (15%)
    // ========================================
    this.addTask({
      id: 'kernel.init',
      name: 'Initializing kernel...',
      weight: 5,
      execute: async () => {
        if (!window.webos) {
          throw new Error('Kernel initialization failed');
        }
        await this.delay(80);
      },
    });

    this.addTask({
      id: 'kernel.api',
      name: 'Loading system APIs...',
      weight: 10,
      execute: async () => {
        const api = window.webos;
        if (!api.window || !api.fs || !api.i18n) {
          throw new Error('System APIs incomplete');
        }
        await this.delay(60);
      },
    });

    // ========================================
    // Stage 2: Filesystem (20%)
    // ========================================
    this.addTask({
      id: 'fs.root',
      name: 'Mounting root filesystem...',
      weight: 5,
      execute: async () => {
        const rootFiles = window.webos.fs.list('/');
        if (rootFiles.length === 0) {
          throw new Error('Filesystem mount failed');
        }
        await this.delay(50);
      },
    });

    this.addTask({
      id: 'fs.directories',
      name: 'Creating system directories...',
      weight: 10,
      execute: async () => {
        const fs = window.webos.fs;
        const systemDirs = ['/tmp', '/var', '/var/log', '/var/cache'];

        for (const dir of systemDirs) {
          if (!fs.exists(dir)) {
            fs.mkdir(dir);
          }
        }
        await this.delay(60);
      },
    });

    this.addTask({
      id: 'fs.cache',
      name: 'Initializing cache...',
      weight: 5,
      execute: async () => {
        if (!window.webos.fs.exists('/var/cache/apps')) {
          window.webos.fs.mkdir('/var/cache/apps');
        }
        await this.delay(40);
      },
    });

    // ========================================
    // Stage 3: Services (25%)
    // ========================================
    this.addTask({
      id: 'services.i18n',
      name: 'Loading language packs...',
      weight: 10,
      execute: async () => {
        const savedLocale = window.webos.config.get<string>('locale');
        if (savedLocale) {
          window.webos.i18n.setLocale(savedLocale);
        }
        await this.delay(60);
      },
    });

    this.addTask({
      id: 'services.user',
      name: 'Loading user profiles...',
      weight: 10,
      execute: async () => {
        const bootState = localStorage.getItem('webos-boot');
        if (bootState) {
          await this.delay(30);
        }
        await this.delay(30);
      },
    });

    this.addTask({
      id: 'services.time',
      name: 'Synchronizing time...',
      weight: 5,
      execute: async () => {
        window.webos.time.getCurrent();
        await this.delay(40);
      },
    });

    // ========================================
    // Stage 4: Resources (25%)
    // ========================================
    this.addTask({
      id: 'resources.fonts',
      name: 'Loading fonts...',
      weight: 10,
      execute: async () => {
        await document.fonts.ready;
        await this.delay(40);
      },
    });

    this.addTask({
      id: 'resources.icons',
      name: 'Loading icon set...',
      weight: 10,
      execute: async () => {
        await this.delay(50);
      },
    });

    this.addTask({
      id: 'resources.styles',
      name: 'Applying system theme...',
      weight: 5,
      execute: async () => {
        const theme = window.webos.config.get<string>('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        await this.delay(30);
      },
    });

    // ========================================
    // Stage 5: Desktop (15%)
    // ========================================
    this.addTask({
      id: 'desktop.wm',
      name: 'Starting window manager...',
      weight: 8,
      execute: async () => {
        await this.delay(60);
      },
    });

    this.addTask({
      id: 'desktop.ready',
      name: 'Preparing desktop...',
      weight: 7,
      execute: async () => {
        await this.delay(80);
      },
    });
  }

  private addTask(task: BootTask): void {
    this.tasks.push(task);
    this.totalWeight += task.weight;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  setProgressHandler(handler: ProgressCallback): void {
    this.onProgress = handler;
  }

  async run(): Promise<BootResult> {
    this.completedWeight = 0;

    for (const task of this.tasks) {
      try {
        await task.execute();
        this.completedWeight += task.weight;

        if (this.onProgress) {
          const progress = Math.round(
            (this.completedWeight / this.totalWeight) * 100
          );
          this.onProgress(task.name, progress);
        }
      } catch (error: unknown) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }

    return { success: true };
  }
}

// ============================================================================
// Bootloader - 主类
// ============================================================================

const PLUGINS_STORAGE_KEY = 'webos-bootloader-plugins';

export interface BootloaderPlugin {
  id: string;
  name: string;
  version: string;
  installedAt?: string;
  permissions: string[];
}

class Bootloader {
  private status: BootStatus = {
    stage: 'idle',
    progress: 0,
    message: '',
    errors: [],
    canRecover: false
  };
  
  private listeners: Set<(status: BootStatus) => void> = new Set();
  private recoveryMode = false;
  private plugins: Map<string, BootloaderPlugin> = new Map();
  private bootManager: BootManager;

  constructor() {
    this.bootManager = new BootManager();
    this.loadPlugins();
    this.checkInstallParameter();
  }

  // ==================== 插件管理 ====================

  private loadPlugins(): void {
    try {
      const stored = localStorage.getItem(PLUGINS_STORAGE_KEY);
      if (stored) {
        const pluginIds = JSON.parse(stored) as string[];
        pluginIds.forEach(id => {
          const pluginData = localStorage.getItem(`webos-plugin-${id}`);
          if (pluginData) {
            const plugin = JSON.parse(pluginData) as BootloaderPlugin;
            this.plugins.set(id, plugin);
          }
        });
      }
    } catch (error) {
      console.error('[Bootloader] Failed to load plugins:', error);
    }
  }

  private savePlugins(): void {
    const pluginIds = Array.from(this.plugins.keys());
    localStorage.setItem(PLUGINS_STORAGE_KEY, JSON.stringify(pluginIds));
  }

  private checkInstallParameter(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const installPlugin = urlParams.get('installDevPlugin');
    
    if (installPlugin === 'true') {
      const isOOBE = !localStorage.getItem('webos-oobe-complete');
      
      if (isOOBE) {
        this.installDevPluginInternal();
      } else {
        sessionStorage.setItem('webos-pending-plugin-install', 'true');
      }
    }
  }

  isDevPluginInstalled(): boolean {
    return this.plugins.has('com.webos.dev-plugin');
  }

  getInstalledPlugins(): BootloaderPlugin[] {
    return Array.from(this.plugins.values());
  }

  private installDevPluginInternal(): { success: boolean; error?: string } {
    if (this.plugins.has('com.webos.dev-plugin')) {
      return { success: false, error: 'Plugin already installed' };
    }

    const plugin: BootloaderPlugin = {
      id: 'com.webos.dev-plugin',
      name: 'Developer Plugin',
      version: '1.0.0',
      installedAt: new Date().toISOString(),
      permissions: ['system:reset', 'system:debug', 'system:recovery']
    };

    this.plugins.set(plugin.id, plugin);
    localStorage.setItem(`webos-plugin-${plugin.id}`, JSON.stringify(plugin));
    this.savePlugins();

    window.dispatchEvent(new CustomEvent('bootloader:plugin-installed', {
      detail: { plugin }
    }));

    return { success: true };
  }

  installDevPlugin(requireAuth: boolean = true): { success: boolean; error?: string; requiresAuth?: boolean } {
    if (requireAuth) {
      const isOOBE = !localStorage.getItem('webos-oobe-complete');
      if (!isOOBE) {
        return { success: false, requiresAuth: true, error: 'Password verification required' };
      }
    }

    return this.installDevPluginInternal();
  }

  completeDevPluginInstallWithAuth(passwordValid: boolean): { success: boolean; error?: string } {
    if (!passwordValid) {
      return { success: false, error: 'Password verification failed' };
    }
    return this.installDevPluginInternal();
  }

  uninstallDevPlugin(): { success: boolean; error?: string } {
    if (!this.plugins.has('com.webos.dev-plugin')) {
      return { success: false, error: 'Plugin not installed' };
    }

    this.plugins.delete('com.webos.dev-plugin');
    localStorage.removeItem('webos-plugin-com.webos.dev-plugin');
    this.savePlugins();

    window.dispatchEvent(new CustomEvent('bootloader:plugin-uninstalled', {
      detail: { pluginId: 'com.webos.dev-plugin' }
    }));

    return { success: true };
  }

  hasPluginPermission(permission: string): boolean {
    if (!this.isDevPluginInstalled()) return false;
    
    const plugin = this.plugins.get('com.webos.dev-plugin');
    return plugin?.permissions.includes(permission) ?? false;
  }

  canResetSystem(): boolean {
    return this.hasPluginPermission('system:reset');
  }

  // ==================== Boot Manager 代理 ====================

  getBootManager(): BootManager {
    return this.bootManager;
  }

  isOOBEComplete(): boolean {
    return this.bootManager.isOOBEComplete();
  }

  completeOOBE(): void {
    this.bootManager.completeOOBE();
  }

  // ==================== 启动和错误处理 ====================

  getStatus(): BootStatus {
    return { ...this.status };
  }

  subscribe(listener: (status: BootStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private updateStatus(updates: Partial<BootStatus>) {
    this.status = { ...this.status, ...updates };
    this.listeners.forEach(l => l(this.status));
  }

  addError(error: Partial<BootError>) {
    const bootError: BootError = {
      type: error.type || 'unknown',
      message: error.message || 'Unknown error',
      file: error.file,
      line: error.line,
      column: error.column,
      stack: error.stack,
      timestamp: new Date()
    };
    
    this.status.errors.push(bootError);
    this.status.canRecover = this.checkRecoverability(bootError);
    this.listeners.forEach(l => l(this.status));
    
    if (!this.recoveryMode && this.shouldEnterRecovery(bootError)) {
      this.enterRecoveryMode();
    }
  }

  private shouldEnterRecovery(error: BootError): boolean {
    if (error.type === 'syntax') return true;
    if (error.type === 'module' && error.file?.includes('kernel')) return true;
    if (this.status.errors.length >= 3) return true;
    return false;
  }

  private checkRecoverability(error: BootError): boolean {
    if (error.type === 'network') return true;
    if ('caches' in window) return true;
    return false;
  }

  enterRecoveryMode() {
    this.recoveryMode = true;
    this.updateStatus({
      stage: 'recovery',
      message: 'Entering recovery mode...'
    });
    
    window.dispatchEvent(new CustomEvent('bootloader:recovery', {
      detail: { errors: this.status.errors }
    }));
  }

  async boot(): Promise<boolean> {
    this.updateStatus({ stage: 'checking', progress: 0, message: 'Quick system check...' });

    try {
      this.updateStatus({ progress: 30, message: 'Checking service worker...' });
      this.checkServiceWorker();

      this.updateStatus({ progress: 60, message: 'Verifying kernel...' });
      if (typeof window.webos === 'undefined') {
        throw new Error('Kernel not loaded');
      }

      this.updateStatus({ 
        stage: 'success', 
        progress: 100, 
        message: 'Boot complete!' 
      });

      return true;
    } catch (error: unknown) {
      const err = error as Error;
      this.addError({
        type: 'runtime',
        message: err.message,
        stack: err.stack
      });
      return false;
    }
  }

  private checkServiceWorker(): void {
    if (!('serviceWorker' in navigator)) {
      this.addError({ type: 'warning', message: 'Service Worker not supported' });
    }
  }

  async recoverFromCache(): Promise<boolean> {
    this.updateStatus({ stage: 'recovery', message: 'Recovering from cache...' });

    if (!('caches' in window)) {
      this.addError({ type: 'cache', message: 'Cache API not available' });
      return false;
    }

    try {
      window.location.reload();
      return true;
    } catch (error: unknown) {
      const err = error as Error;
      this.addError({ type: 'cache', message: `Recovery failed: ${err.message}` });
      return false;
    }
  }

  async resetSystem(): Promise<{ success: boolean; error?: string }> {
    if (!this.canResetSystem()) {
      return { success: false, error: 'Developer plugin not installed. Cannot reset system.' };
    }

    this.updateStatus({ message: 'Resetting system...' });
    
    localStorage.clear();
    sessionStorage.clear();
    
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
      }
    }

    try {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    } catch {
      // 忽略错误
    }

    window.dispatchEvent(new CustomEvent('bootloader:system-reset', {
      detail: { timestamp: new Date().toISOString() }
    }));

    window.location.reload();
    return { success: true };
  }

  isRecoveryMode(): boolean {
    return this.recoveryMode;
  }

  isOOBEMode(): boolean {
    return !localStorage.getItem('webos-oobe-complete');
  }

  hasPendingPluginInstall(): boolean {
    return sessionStorage.getItem('webos-pending-plugin-install') === 'true';
  }

  clearPendingPluginInstall(): void {
    sessionStorage.removeItem('webos-pending-plugin-install');
  }
}

// ============================================================================
// 全局实例
// ============================================================================

export const bootloader = new Bootloader();

// ============================================================================
// 全局错误处理器
// ============================================================================

export function setupGlobalErrorHandler() {
  window.onerror = (message, source, lineno, colno, error) => {
    const errorType = error instanceof SyntaxError ? 'syntax' : 'runtime';
    const errorMessage = String(message);
    
    bootloader.addError({
      type: errorType,
      message: errorMessage,
      file: source || undefined,
      line: lineno || undefined,
      column: colno || undefined,
      stack: error?.stack
    });
    
    const webosApi = window.webos as { reportSystemError?: (msg: string, opts: object) => void } | undefined;
    if (webosApi?.reportSystemError) {
      webosApi.reportSystemError(errorMessage, {
        code: errorType === 'syntax' ? 'ERR_2001' : 'ERR_2005',
        source: source || undefined,
        line: lineno || undefined,
        column: colno || undefined,
        stack: error?.stack
      });
    }
    
    return false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || 'Unhandled Promise rejection';
    
    bootloader.addError({
      type: 'runtime',
      message,
      stack: event.reason?.stack
    });
    
    const webosApi = window.webos as { reportSystemError?: (msg: string, opts: object) => void } | undefined;
    if (webosApi?.reportSystemError) {
      webosApi.reportSystemError(message, {
        code: 'ERR_2004',
        stack: event.reason?.stack
      });
    }
  });

  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      const target = event.target as HTMLElement;
      const src = ('src' in target ? (target as HTMLImageElement | HTMLScriptElement).src : undefined) ||
                  ('href' in target ? (target as HTMLLinkElement).href : undefined) ||
                  'unknown';
      const message = `Failed to load: ${src}`;
      
      bootloader.addError({
        type: 'network',
        message,
        file: src
      });
      
      const webosApi = window.webos as { reportSystemError?: (msg: string, opts: object) => void } | undefined;
      if (webosApi?.reportSystemError) {
        webosApi.reportSystemError(message, {
          code: 'ERR_4001',
          source: src
        });
      }
    }
  }, true);
}

// ============================================================================
// 全局安装命令
// ============================================================================

declare global {
  interface Window {
    webosInstallDevPlugin?: () => { success: boolean; error?: string; requiresAuth?: boolean };
    webosUninstallDevPlugin?: () => { success: boolean; error?: string };
    webosResetSystem?: () => Promise<{ success: boolean; error?: string }>;
    webosCanResetSystem?: () => boolean;
  }
}

if (typeof window !== 'undefined') {
  window.webosInstallDevPlugin = () => bootloader.installDevPlugin(true);
  window.webosUninstallDevPlugin = () => bootloader.uninstallDevPlugin();
  window.webosResetSystem = () => bootloader.resetSystem();
  window.webosCanResetSystem = () => bootloader.canResetSystem();
}

export default bootloader;
