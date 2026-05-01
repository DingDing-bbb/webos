/**
 * Bootloader - 系统引导加载器
 *
 * 重构后：加载 Rust + WebAssembly 微内核
 * 1. 引导检测（硬件探测、WASM 支持）
 * 2. 加载 Rust 内核 WASM 并实例化
 * 3. 初始化内核（调用 kernel_init）
 * 4. 挂载文件系统
 * 5. 启动用户态进程
 * 6. 桌面准备
 */

// ============================================================================
// 从单独文件导入（避免循环依赖）
// ============================================================================

// 控制器
import { BootController } from './controller';
export { BootController } from './controller';
export type { BootTask, ProgressCallback, BootResult } from './controller';

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

export interface BootloaderPlugin {
  id: string;
  name: string;
  version: string;
  installedAt?: string;
  permissions: string[];
}

// ============================================================================
// 轻量级 OOBE 状态检查（内核加载前使用）
// ============================================================================

const OOBE_STORAGE_KEY = 'webos-oobe-complete';
const BOOT_STORAGE_KEY = 'webos-boot';

function isOOBECompletePreKernel(): boolean {
  try {
    const backup = localStorage.getItem(OOBE_STORAGE_KEY);
    return backup === 'true';
  } catch (e) {
    console.error('[Bootloader] Failed to check OOBE state:', e);
    return false;
  }
}

function markOOBECompletePreKernel(): void {
  try {
    localStorage.setItem(OOBE_STORAGE_KEY, 'true');
    localStorage.setItem(BOOT_STORAGE_KEY, JSON.stringify({ oobeComplete: true }));
  } catch (e) {
    console.error('[Bootloader] Failed to save OOBE state:', e);
  }
}

function resetOOBEStatePreKernel(): void {
  try {
    localStorage.removeItem(OOBE_STORAGE_KEY);
    localStorage.removeItem(BOOT_STORAGE_KEY);
  } catch (e) {
    console.error('[Bootloader] Failed to reset OOBE state:', e);
  }
}

// ============================================================================
// Bootloader - 主类
// ============================================================================

const PLUGINS_STORAGE_KEY = 'webos-bootloader-plugins';

class Bootloader {
  private status: BootStatus = {
    stage: 'idle',
    progress: 0,
    message: '',
    errors: [],
    canRecover: false,
  };

  private listeners: Set<(status: BootStatus) => void> = new Set();
  private recoveryMode = false;
  private plugins: Map<string, BootloaderPlugin> = new Map();
  private kernelController?: BootController;

  constructor() {
    this.loadPlugins();
    this.checkInstallParameter();
  }

  // ==================== 插件管理 ====================

  private loadPlugins(): void {
    try {
      const stored = localStorage.getItem(PLUGINS_STORAGE_KEY);
      if (stored) {
        const pluginIds = JSON.parse(stored) as string[];
        pluginIds.forEach((id) => {
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
      permissions: ['system:reset', 'system:debug', 'system:recovery'],
    };

    this.plugins.set(plugin.id, plugin);
    localStorage.setItem(`webos-plugin-${plugin.id}`, JSON.stringify(plugin));
    this.savePlugins();

    window.dispatchEvent(
      new CustomEvent('bootloader:plugin-installed', {
        detail: { plugin },
      })
    );

    return { success: true };
  }

  installDevPlugin(requireAuth: boolean = true): {
    success: boolean;
    error?: string;
    requiresAuth?: boolean;
  } {
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

    window.dispatchEvent(
      new CustomEvent('bootloader:plugin-uninstalled', {
        detail: { pluginId: 'com.webos.dev-plugin' },
      })
    );

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

  // ==================== OOBE 状态管理 ====================

  isOOBEComplete(): boolean {
    return isOOBECompletePreKernel();
  }

  completeOOBE(): void {
    markOOBECompletePreKernel();
    if (window.webos?.boot?.completeOOBE) {
      window.webos.boot.completeOOBE();
    }
  }

  resetOOBE(): void {
    resetOOBEStatePreKernel();
    if (window.webos?.boot?.reset) {
      window.webos.boot.reset();
    }
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
    this.listeners.forEach((l) => l(this.status));
  }

  addError(error: Partial<BootError>) {
    const bootError: BootError = {
      type: error.type || 'unknown',
      message: error.message || 'Unknown error',
      file: error.file,
      line: error.line,
      column: error.column,
      stack: error.stack,
      timestamp: new Date(),
    };

    this.status.errors.push(bootError);
    this.status.canRecover = this.checkRecoverability(bootError);
    this.listeners.forEach((l) => l(this.status));

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
      message: 'Entering recovery mode...',
    });

    window.dispatchEvent(
      new CustomEvent('bootloader:recovery', {
        detail: { errors: this.status.errors },
      })
    );
  }

  async boot(): Promise<boolean> {
    this.updateStatus({ stage: 'checking', progress: 0, message: 'Initializing bootloader...' });

    try {
      // Stage 1: Hardware Probe (0-20%)
      this.updateStatus({ progress: 10, message: 'Probing hardware capabilities...' });
      const hwCaps = await this.hardwareProbe();
      (window as any).__HW_CAPS = hwCaps;

      if (!hwCaps.canvas2d || !hwCaps.indexedDB || !hwCaps.webAssembly || !hwCaps.localStorage) {
        throw new Error('Essential hardware capability missing');
      }

      // Stage 2: Initialize JS kernel API for UI services (20-40%)
      this.updateStatus({ progress: 20, message: 'Initializing UI services...' });
      await this.initUIServices();

      // Stage 3: Load Rust Kernel WASM + Init (40-90%)
      this.updateStatus({ progress: 40, message: 'Loading Rust microkernel...' });
      const controller = new BootController();
      this.kernelController = controller;

      controller.setProgressHandler((taskName, progress) => {
        const overallProgress = 40 + Math.round(progress * 0.5);
        this.updateStatus({
          progress: overallProgress,
          message: taskName,
        });
      });

      const result = await controller.run();
      if (!result.success) {
        throw new Error(`Kernel initialization failed: ${result.error}`);
      }

      // Stage 4: Desktop Ready (90-100%)
      this.updateStatus({ progress: 90, message: 'Preparing desktop...' });
      await this.delay(100);

      this.updateStatus({
        stage: 'success',
        progress: 100,
        message: 'Boot complete! Rust microkernel running.',
      });

      return true;
    } catch (error: unknown) {
      const err = error as Error;
      this.addError({
        type: 'runtime',
        message: err.message,
        stack: err.stack,
      });
      return false;
    }
  }

  private async hardwareProbe(): Promise<{
    canvas2d: boolean;
    indexedDB: boolean;
    webAssembly: boolean;
    localStorage: boolean;
  }> {
    return {
      canvas2d: !!(document.createElement('canvas').getContext('2d')),
      indexedDB: 'indexedDB' in window,
      webAssembly: 'WebAssembly' in window,
      localStorage: 'localStorage' in window,
    };
  }

  /**
   * 初始化 UI 服务层 - JS 侧的窗口管理、文件系统等
   * 这些服务保留在 JS 侧，通过 IPC 与 Rust 内核通信
   */
  private async initUIServices(): Promise<void> {
    try {
      // 动态导入内核模块（现在仅包含 IPC 类型和服务桥接）
      const kernelModule = await import('@kernel');

      // 创建 WebOS API - UI 服务层
      // 这些服务在 JS 侧提供 UI 功能，但核心逻辑转发到 Rust 内核
      if (kernelModule.createWebOSAPIFromKernel) {
        const api = kernelModule.createWebOSAPIFromKernel();
        (window as any).webos = api;
      } else {
        // 如果没有新的桥接 API，使用简化版本
        this.createMinimalWebOSAPI();
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.warn('[Bootloader] Kernel module load failed, using minimal API:', err.message);
      this.createMinimalWebOSAPI();
    }
  }

  /**
   * 创建最小化 WebOS API（不依赖 JS 内核模块）
   * 窗口管理等功能由 UI 包提供，文件系统等通过 Rust 内核处理
   */
  private createMinimalWebOSAPI(): void {
    if ((window as any).webos) return;

    // 延迟加载 UI 服务的窗口管理器等
    const api = {
      t: (key: string) => key,
      setWindowContainer: (el: HTMLDivElement) => {
        (window as any).__windowContainer = el;
      },
      window: {
        open: (appId: string, options?: any) => {
          console.log(`[WebOS API] window.open: ${appId}`);
          return `window-${Date.now()}`;
        },
        close: (id: string) => console.log(`[WebOS API] window.close: ${id}`),
        minimize: (id: string) => console.log(`[WebOS API] window.minimize: ${id}`),
        maximize: (id: string) => console.log(`[WebOS API] window.maximize: ${id}`),
        restore: (id: string) => console.log(`[WebOS API] window.restore: ${id}`),
        focus: (id: string) => console.log(`[WebOS API] window.focus: ${id}`),
        getAll: () => [] as any[],
      },
      notify: {
        show: (title: string, message: string) => console.log(`[Notify] ${title}: ${message}`),
      },
      time: {
        getCurrent: () => new Date(),
        setAlarm: () => '',
        clearAlarm: () => {},
        getAlarms: () => [],
      },
      fs: {
        read: (path: string) => null as string | null,
        write: (path: string, content: string) => false,
        exists: (path: string) => false,
        list: (path: string) => [] as any[],
        mkdir: (path: string) => false,
        remove: (path: string) => false,
        delete: (path: string) => false,
        readdir: (path: string) => [] as any[],
        stat: (path: string) => null as any,
        chmod: (path: string, mode: string) => false,
        getPermissions: (path: string) => 'rwxr-xr-x',
        setPermissions: (path: string, perms: string) => false,
        getNode: (path: string) => null as any,
        watch: () => (() => {}) as any,
        resolve: (...paths: string[]) => paths.join('/'),
        dirname: (path: string) => path.split('/').slice(0, -1).join('/') || '/',
        basename: (path: string) => path.split('/').pop() || '',
        extname: (path: string) => {
          const idx = path.lastIndexOf('.');
          return idx > 0 ? path.substring(idx) : '';
        },
      },
      user: {
        getCurrentUser: () => null as any,
        getAllUsers: () => [] as any[],
        getRealUsers: () => [] as any[],
        hasUsers: () => false,
        createUser: () => ({ success: false, error: 'Use Rust kernel user management' }),
        login: () => ({ success: false, error: 'Use Rust kernel user management' }),
        logout: () => {},
        isLoggedIn: () => false,
        isRoot: () => false,
        isAdmin: () => false,
        hasPermission: () => false,
        authenticate: () => false,
        requestPrivilege: async () => false,
        createTemporaryUser: () => ({ username: 'guest', password: '', role: 'guest', isRoot: false, homeDir: '/home/guest', permissions: [] }) as any,
        hasTemporaryUser: () => false,
        getTemporaryUserInfo: () => null as any,
        clearTemporaryUser: () => {},
        isTemporarySession: () => false,
        tryAutoLogin: () => ({ success: false }),
        subscribe: () => (() => {}) as any,
        secure: {
          isReady: () => false,
          isInitialized: async () => false,
          isLocked: () => true,
          getState: () => ({ isInitialized: false, isLocked: true, hasUsers: false, currentUser: null }),
          createFirstUser: async () => ({ success: false, error: 'Use Rust kernel' }),
          login: async () => ({ success: false, error: 'Use Rust kernel' }),
          logout: async () => {},
          lock: () => {},
          unlock: async () => ({ success: false, error: 'Use Rust kernel' }),
          getCurrentUser: () => null as any,
          getUserList: async () => [],
          getTotalUserCount: async () => 0,
          changePassword: async () => ({ success: false }),
          updateDisplayName: async () => ({ success: false }),
          isAdmin: () => false,
          isRoot: () => false,
          hasPermission: () => false,
          saveEncryptedData: async () => ({ success: false }),
          getEncryptedData: async () => null,
          resetSystem: async () => ({ success: false }),
          resetAndReinit: async () => {},
          subscribe: () => (() => {}) as any,
        },
      },
      i18n: {
        getCurrentLocale: () => 'en',
        setLocale: (locale: string) => {},
        t: (key: string) => key,
        getAvailableLocales: () => [] as any[],
        onLocaleChange: () => (() => {}) as any,
      },
      config: {
        get: <T>(key: string) => undefined as T | undefined,
        set: <T>(key: string, value: T) => {},
        getSystemName: () => 'WebOS',
        setSystemName: (name: string) => {},
      },
      boot: {
        isComplete: () => true,
        isOOBEComplete: () => isOOBECompletePreKernel(),
        completeOOBE: () => markOOBECompletePreKernel(),
        reset: () => resetOOBEStatePreKernel(),
      },
      apps: {
        register: () => {},
        unregister: () => false,
        get: () => undefined as any,
        getAll: () => [] as any[],
        getByCategory: () => [] as any[],
        search: () => [] as any[],
        isRegistered: () => false,
        isRunning: () => false,
        getInstances: () => [] as any[],
        launch: () => null as string | null,
        close: () => false,
        getCategories: () => [] as any[],
        subscribe: () => (() => {}) as any,
      },
    };

    (window as any).webos = api;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

    // 关闭 Rust 内核
    if (this.kernelController) {
      this.kernelController.destroy();
    }

    localStorage.clear();
    sessionStorage.clear();

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
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

    window.dispatchEvent(
      new CustomEvent('bootloader:system-reset', {
        detail: { timestamp: new Date().toISOString() },
      })
    );

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
      stack: error?.stack,
    });

    return false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || 'Unhandled Promise rejection';

    bootloader.addError({
      type: 'runtime',
      message,
      stack: event.reason?.stack,
    });
  });

  window.addEventListener(
    'error',
    (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement;
        const src =
          ('src' in target ? (target as HTMLImageElement | HTMLScriptElement).src : undefined) ||
          ('href' in target ? (target as HTMLLinkElement).href : undefined) ||
          'unknown';
        const message = `Failed to load: ${src}`;

        bootloader.addError({
          type: 'network',
          message,
          file: src,
        });
      }
    },
    true
  );
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
    __rustKernel?: any;
  }
}

if (typeof window !== 'undefined') {
  window.webosInstallDevPlugin = () => bootloader.installDevPlugin(true);
  window.webosUninstallDevPlugin = () => bootloader.uninstallDevPlugin();
  window.webosResetSystem = () => bootloader.resetSystem();
  window.webosCanResetSystem = () => bootloader.canResetSystem();
}

export default bootloader;
