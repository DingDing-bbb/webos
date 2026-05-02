/**
 * Drivers - 系统启动和硬件驱动
 *
 * 负责：
 * 1. 启动 Rust 微内核（加载 WASM、实例化、初始化）
 * 2. 提供宿主函数（host functions）给内核调用
 * 3. 启动界面
 */

export { BootController } from './controller';
export type { BootResult, ProgressCallback } from './controller';
export { BootUI } from './ui';
export type { BootUIProps } from './ui';
export { BootScreen } from './screen';
export type { BootScreenProps } from './screen';

// ============================================================================
// Bootloader 主类 - 管理启动流程
// ============================================================================

export interface BootStatus {
  stage: 'idle' | 'booting' | 'success' | 'error';
  progress: number;
  message: string;
}

class Bootloader {
  private status: BootStatus = { stage: 'idle', progress: 0, message: '' };
  private listeners: Set<(s: BootStatus) => void> = new Set();
  private controller?: BootController;

  getStatus(): BootStatus { return { ...this.status }; }

  subscribe(cb: (s: BootStatus) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private update(updates: Partial<BootStatus>): void {
    this.status = { ...this.status, ...updates };
    this.listeners.forEach(l => l(this.status));
  }

  isOOBEComplete(): boolean {
    try { return localStorage.getItem('webos-oobe-complete') === 'true'; } catch { return false; }
  }

  completeOOBE(): void {
    try { localStorage.setItem('webos-oobe-complete', 'true'); } catch {}
  }

  async boot(): Promise<boolean> {
    this.update({ stage: 'booting', progress: 0, message: 'Starting...' });

    // 初始化 window.webos API（内核加载前先给 UI 用）
    this.initWebOSAPI();

    // 启动 Rust 内核
    this.controller = new BootController();
    this.controller.setProgressHandler((stage, progress) => {
      this.update({ progress, message: stage });
    });

    const result = await this.controller.run();

    if (result.success) {
      this.update({ stage: 'success', progress: 100, message: 'Boot complete' });
      return true;
    } else {
      this.update({ stage: 'error', progress: 0, message: result.error || 'Boot failed' });
      return false;
    }
  }

  /**
   * 初始化 window.webos API
   * 提供窗口管理、文件系统等 UI 层需要的基础接口
   */
  private initWebOSAPI(): void {
    if ((window as any).webos) return;

    (window as any).webos = {
      t: (key: string) => key,
      setWindowContainer: (el: HTMLDivElement) => { (window as any).__windowContainer = el; },
      window: {
        open: (appId: string, opts?: any) => `win-${Date.now()}`,
        close: () => {},
        minimize: () => {},
        maximize: () => {},
        restore: () => {},
        focus: () => {},
        getAll: () => [],
      },
      notify: { show: (title: string, msg: string) => console.log(`[notify] ${title}: ${msg}`) },
      time: {
        getCurrent: () => new Date(),
        setAlarm: () => '', clearAlarm: () => {}, getAlarms: () => [],
      },
      fs: {
        read: (path: string) => { try { return localStorage.getItem(`webos-fs:${path}`); } catch { return null; } },
        write: (path: string, content: string) => { try { localStorage.setItem(`webos-fs:${path}`, content); return true; } catch { return false; } },
        exists: (path: string) => localStorage.getItem(`webos-fs:${path}`) !== null,
        list: (path: string) => [],
        mkdir: () => true,
        remove: (path: string) => { try { localStorage.removeItem(`webos-fs:${path}`); return true; } catch { return false; } },
        delete: (path: string) => { try { localStorage.removeItem(`webos-fs:${path}`); return true; } catch { return false; } },
        readdir: () => [], stat: () => null, chmod: () => false,
        getPermissions: () => 'rwxr-xr-x', setPermissions: () => false,
        getNode: () => null, watch: () => (() => {}),
        resolve: (...p: string[]) => p.join('/').replace(/\/+/g, '/'),
        dirname: (p: string) => p.split('/').slice(0, -1).join('/') || '/',
        basename: (p: string) => p.split('/').pop() || '',
        extname: (p: string) => { const i = p.lastIndexOf('.'); return i > 0 ? p.substring(i) : ''; },
      },
      user: {
        getCurrentUser: () => null, getAllUsers: () => [], getRealUsers: () => [],
        hasUsers: () => false, createUser: () => ({ success: false }),
        login: () => ({ success: true }), logout: () => {},
        isLoggedIn: () => true, isRoot: () => false, isAdmin: () => false,
        hasPermission: () => false, authenticate: () => true,
        requestPrivilege: async () => true,
        createTemporaryUser: () => ({ username: 'guest', password: '', role: 'guest', isRoot: false, homeDir: '/home/guest', permissions: [] }),
        hasTemporaryUser: () => false, getTemporaryUserInfo: () => null,
        clearTemporaryUser: () => {}, isTemporarySession: () => false,
        tryAutoLogin: () => ({ success: true }), subscribe: () => (() => {}),
        secure: {
          isReady: () => false, isInitialized: async () => false, isLocked: () => false,
          getState: () => ({ isInitialized: false, isLocked: false, hasUsers: false, currentUser: null }),
          createFirstUser: async () => ({ success: true }), login: async () => ({ success: true }),
          logout: async () => {}, lock: () => {}, unlock: async () => ({ success: true }),
          getCurrentUser: () => null, getUserList: async () => [], getTotalUserCount: async () => 0,
          changePassword: async () => ({ success: false }), updateDisplayName: async () => ({ success: false }),
          isAdmin: () => false, isRoot: () => false, hasPermission: () => false,
          saveEncryptedData: async () => ({ success: false }), getEncryptedData: async () => null,
          resetSystem: async () => ({ success: false }), resetAndReinit: async () => {},
          subscribe: () => (() => {}),
        },
      },
      i18n: {
        getCurrentLocale: () => 'en', setLocale: () => {}, t: (k: string) => k,
        getAvailableLocales: () => [], onLocaleChange: () => (() => {}),
      },
      config: {
        get: <T>() => undefined as T | undefined, set: () => {},
        getSystemName: () => 'WebOS', setSystemName: () => {},
      },
      boot: {
        isComplete: () => this.status.stage === 'success',
        isOOBEComplete: () => this.isOOBEComplete(),
        completeOOBE: () => this.completeOOBE(),
        reset: () => { try { localStorage.removeItem('webos-oobe-complete'); } catch {} },
      },
      apps: {
        register: () => {}, unregister: () => false, get: () => undefined,
        getAll: () => [], getByCategory: () => [], search: () => [],
        isRegistered: () => false, isRunning: () => false, getInstances: () => [],
        launch: () => null, close: () => false, getCategories: () => [],
        subscribe: () => (() => {}),
      },
    };
  }
}

export const bootloader = new Bootloader();

// 全局错误处理
export function setupGlobalErrorHandler(): void {
  window.onerror = (msg, src, line, col, err) => {
    console.error(`[WebOS Error] ${msg}`, { src, line, col });
    return false;
  };
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[WebOS Error] Unhandled rejection:', e.reason);
  });
}

// 全局类型扩展
declare global {
  interface Window {
    webos?: any;
    __rustKernel?: any;
    __windowContainer?: HTMLDivElement;
  }
}
