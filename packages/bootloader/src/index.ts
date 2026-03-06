// Bootloader - 轻量级引导加载器
// 负责错误检测和恢复模式触发

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

  async resetSystem(): Promise<void> {
    this.updateStatus({ message: 'Resetting system...' });

    // 1. 清除所有 localStorage（WebOS 相关）
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('webos-') || key.startsWith('webos_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    // 也清除其他可能的键
    localStorage.clear();

    // 2. 清除 sessionStorage
    sessionStorage.clear();

    // 3. 清除所有 Cache API 缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // 4. 清除 IndexedDB（如果使用了）
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            if (db.name) {
              return new Promise<void>((resolve, reject) => {
                const request = indexedDB.deleteDatabase(db.name!);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
                request.onblocked = () => resolve(); // 忽略阻塞
              });
            }
            return Promise.resolve();
          })
        );
      } catch {
        // 某些浏览器不支持 indexedDB.databases()
      }
    }

    // 5. 注销 Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      } catch {
        // 忽略错误
      }
    }

    // 6. 清除所有 cookies（同源）
    try {
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });
    } catch {
      // 忽略错误
    }

    // 7. 重新加载页面
    window.location.reload();
  }

  isRecoveryMode(): boolean {
    return this.recoveryMode;
  }
}

export const bootloader = new Bootloader();

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

export default bootloader;
