// Bootloader - 轻量级引导加载器
// 负责错误检测、恢复模式触发和插件管理

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

// 插件接口
export interface BootloaderPlugin {
  id: string;
  name: string;
  version: string;
  installedAt?: string;
  permissions: string[];
}

// 插件存储键
const PLUGINS_STORAGE_KEY = 'webos-bootloader-plugins';

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
        pluginIds.forEach(id => {
          // 加载每个插件的详细信息
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
      // 检查是否在OOBE阶段 - 使用与 bootManager 相同的键
      const bootState = localStorage.getItem('webos-boot');
      const isOOBE = !bootState || !JSON.parse(bootState).oobeComplete;
      
      if (isOOBE) {
        // OOBE阶段：直接安装
        console.log('[Bootloader] OOBE mode: Installing dev plugin without password');
        this.installDevPluginInternal();
      } else {
        // 非OOBE阶段：需要密码验证
        console.log('[Bootloader] Non-OOBE mode: Dev plugin install requires password verification');
        // 设置标志，等待密码验证
        sessionStorage.setItem('webos-pending-plugin-install', 'true');
      }
    }
  }

  /**
   * 检查开发者插件是否已安装
   */
  isDevPluginInstalled(): boolean {
    return this.plugins.has('com.webos.dev-plugin');
  }

  /**
   * 获取已安装的插件列表
   */
  getInstalledPlugins(): BootloaderPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 安装开发者插件（内部方法）
   */
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

    // 触发事件
    window.dispatchEvent(new CustomEvent('bootloader:plugin-installed', {
      detail: { plugin }
    }));

    console.log('[Bootloader] Developer plugin installed');
    return { success: true };
  }

  /**
   * 安装开发者插件（需要权限检查）
   */
  installDevPlugin(requireAuth: boolean = true): { success: boolean; error?: string; requiresAuth?: boolean } {
    // 如果需要认证且不在OOBE阶段
    if (requireAuth) {
      // 使用与 bootManager 相同的键
      const bootState = localStorage.getItem('webos-boot');
      const isOOBE = !bootState || !JSON.parse(bootState).oobeComplete;
      if (!isOOBE) {
        return { success: false, requiresAuth: true, error: 'Password verification required' };
      }
    }

    return this.installDevPluginInternal();
  }

  /**
   * 完成带密码验证的插件安装
   */
  completeDevPluginInstallWithAuth(passwordValid: boolean): { success: boolean; error?: string } {
    if (!passwordValid) {
      return { success: false, error: 'Password verification failed' };
    }
    return this.installDevPluginInternal();
  }

  /**
   * 卸载开发者插件
   */
  uninstallDevPlugin(): { success: boolean; error?: string } {
    if (!this.plugins.has('com.webos.dev-plugin')) {
      return { success: false, error: 'Plugin not installed' };
    }

    this.plugins.delete('com.webos.dev-plugin');
    localStorage.removeItem('webos-plugin-com.webos.dev-plugin');
    this.savePlugins();

    // 触发事件
    window.dispatchEvent(new CustomEvent('bootloader:plugin-uninstalled', {
      detail: { pluginId: 'com.webos.dev-plugin' }
    }));

    console.log('[Bootloader] Developer plugin uninstalled');
    return { success: true };
  }

  /**
   * 检查是否有特定权限
   */
  hasPluginPermission(permission: string): boolean {
    if (!this.isDevPluginInstalled()) return false;
    
    const plugin = this.plugins.get('com.webos.dev-plugin');
    return plugin?.permissions.includes(permission) ?? false;
  }

  /**
   * 检查是否可以重置系统
   */
  canResetSystem(): boolean {
    return this.hasPluginPermission('system:reset');
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

  // 快速引导检查（不阻塞UI）
  async boot(): Promise<boolean> {
    this.updateStatus({ stage: 'checking', progress: 0, message: 'Quick system check...' });

    try {
      // 快速检查 Service Worker（非阻塞）
      this.updateStatus({ progress: 30, message: 'Checking service worker...' });
      this.checkServiceWorker();

      // 验证内核 API
      this.updateStatus({ progress: 60, message: 'Verifying kernel...' });
      if (typeof window.webos === 'undefined') {
        throw new Error('Kernel not loaded');
      }

      // 完成
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

  /**
   * 重置系统（需要开发者插件）
   */
  async resetSystem(): Promise<{ success: boolean; error?: string }> {
    // 检查是否有权限
    if (!this.canResetSystem()) {
      return { success: false, error: 'Developer plugin not installed. Cannot reset system.' };
    }

    this.updateStatus({ message: 'Resetting system...' });
    
    // 清除所有存储
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

    // 清除 IndexedDB
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

    // 触发重置事件
    window.dispatchEvent(new CustomEvent('bootloader:system-reset', {
      detail: { timestamp: new Date().toISOString() }
    }));

    window.location.reload();
    return { success: true };
  }

  isRecoveryMode(): boolean {
    return this.recoveryMode;
  }

  /**
   * 检查是否在OOBE阶段
   */
  isOOBEMode(): boolean {
    // 使用与 bootManager 相同的键
    const bootState = localStorage.getItem('webos-boot');
    return !bootState || !JSON.parse(bootState).oobeComplete;
  }

  /**
   * 检查是否有待处理的插件安装请求
   */
  hasPendingPluginInstall(): boolean {
    return sessionStorage.getItem('webos-pending-plugin-install') === 'true';
  }

  /**
   * 清除待处理的插件安装请求
   */
  clearPendingPluginInstall(): void {
    sessionStorage.removeItem('webos-pending-plugin-install');
  }
}

export { Bootloader };
export const bootloader = new Bootloader();
export type BootloaderType = typeof bootloader;

// 全局错误处理器
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
    
    // 同时报告到系统错误处理器（如果已初始化）
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
    
    // 同时报告到系统错误处理器
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
      
      // 同时报告到系统错误处理器
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

// 全局安装命令（供F12控制台使用）
declare global {
  interface Window {
    webosInstallDevPlugin?: () => { success: boolean; error?: string; requiresAuth?: boolean };
    webosUninstallDevPlugin?: () => { success: boolean; error?: string };
    webosResetSystem?: () => Promise<{ success: boolean; error?: string }>;
    webosCanResetSystem?: () => boolean;
  }
}

// 暴露全局命令
if (typeof window !== 'undefined') {
  window.webosInstallDevPlugin = () => bootloader.installDevPlugin(true);
  window.webosUninstallDevPlugin = () => bootloader.uninstallDevPlugin();
  window.webosResetSystem = () => bootloader.resetSystem();
  window.webosCanResetSystem = () => bootloader.canResetSystem();
}

export default bootloader;
