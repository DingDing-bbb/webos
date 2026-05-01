/**
 * WebOS API 构建器 - 从 Rust 内核桥接层构建 UI API
 *
 * 保留现有 UI 接口（WebOSAPI），但底层实现通过 IPC 转发到 Rust 内核。
 * 窗口管理由 JS 侧直接管理（DOM 操作），文件系统/进程管理等通过 Rust 内核处理。
 */

import type {
  WebOSAPI,
  WindowOptions,
  WindowState,
  NotifyOptions,
  UserRole,
  Permission,
  FileSystemNode,
  AppInfo,
  AppCategory,
  AppEventListener,
  LocaleConfig,
} from '../../types';
import { kernelBridge } from './bridge';

// 窗口管理器 - 保留在 JS 侧（DOM 操作）
// 延迟导入，避免循环依赖
let windowManagerModule: any = null;

async function getWindowManager() {
  if (!windowManagerModule) {
    // 窗口管理器现在在 UI 包中
    // 如果不可用，使用简化版本
  }
  return windowManagerModule;
}

// 文件系统 - 通过 Rust 内核 syscall 实现
class RustFileSystem {
  private pid: number = 0; // 使用内核 PID 0（特权进程）

  read(path: string): string | null {
    const kernel = kernelBridge.getKernel();
    if (!kernel) return null;

    const pathBytes = new TextEncoder().encode(path);
    const mem = new Uint8Array(kernel.memory.buffer);
    const pathPtr = kernel.memory.buffer.byteLength - pathBytes.length - 256;
    if (pathPtr < 0) return null;

    mem.set(pathBytes, pathPtr);

    const bufPtr = pathPtr - 4096;
    if (bufPtr < 0) return null;

    const result = kernel.kernel_syscall(this.pid, 0x0100, pathPtr, pathBytes.length, bufPtr, 4096);
    const errCode = Number(result >> 32n);
    if (errCode !== 0) return null;

    const readLen = Number(result & 0xFFFFFFFFn);
    if (readLen === 0) return null;

    const content = new TextDecoder().decode(mem.slice(bufPtr, bufPtr + readLen));
    return content;
  }

  write(path: string, content: string): boolean {
    const kernel = kernelBridge.getKernel();
    if (!kernel) return false;

    const pathBytes = new TextEncoder().encode(path);
    const dataBytes = new TextEncoder().encode(content);
    const mem = new Uint8Array(kernel.memory.buffer);

    const dataPtr = kernel.memory.buffer.byteLength - dataBytes.length - 1;
    const pathPtr = dataPtr - pathBytes.length - 1;

    if (pathPtr < 0) return false;

    mem.set(pathBytes, pathPtr);
    mem.set(dataBytes, dataPtr);

    const result = kernel.kernel_syscall(this.pid, 0x0101, pathPtr, pathBytes.length, dataPtr, dataBytes.length);
    const errCode = Number(result >> 32n);
    return errCode === 0 && (Number(result & 0xFFFFFFFFn) > 0);
  }

  exists(path: string): boolean {
    return this.read(path) !== null;
  }

  list(path: string): FileSystemNode[] {
    // 简化实现：通过 IPC 查询
    return [];
  }

  mkdir(path: string, recursive?: boolean): boolean {
    const kernel = kernelBridge.getKernel();
    if (!kernel) return false;

    const pathBytes = new TextEncoder().encode(path);
    const mem = new Uint8Array(kernel.memory.buffer);
    const pathPtr = kernel.memory.buffer.byteLength - pathBytes.length - 1;
    if (pathPtr < 0) return false;

    mem.set(pathBytes, pathPtr);

    const result = kernel.kernel_syscall(this.pid, 0x0107, pathPtr, pathBytes.length, recursive ? 1 : 0, 0);
    return Number(result & 0xFFFFFFFFn) !== 0;
  }

  delete(path: string): boolean {
    const kernel = kernelBridge.getKernel();
    if (!kernel) return false;

    const pathBytes = new TextEncoder().encode(path);
    const mem = new Uint8Array(kernel.memory.buffer);
    const pathPtr = kernel.memory.buffer.byteLength - pathBytes.length - 1;
    if (pathPtr < 0) return false;

    mem.set(pathBytes, pathPtr);

    const result = kernel.kernel_syscall(this.pid, 0x0106, pathPtr, pathBytes.length, 0, 0);
    return Number(result & 0xFFFFFFFFn) !== 0;
  }

  remove(path: string): boolean {
    return this.delete(path);
  }

  readdir(path: string): { name: string; type: 'file' | 'directory'; permissions: string; owner: string; size: number; modifiedAt: Date }[] {
    return [];
  }

  stat(path: string): FileSystemNode | null {
    return null;
  }

  chmod(path: string, mode: string): boolean {
    return false;
  }

  getPermissions(path: string): string {
    return 'rwxr-xr-x';
  }

  setPermissions(path: string, permissions: string, requireAuth?: boolean): boolean {
    if (requireAuth) return false;
    return this.chmod(path, permissions);
  }

  getNode(path: string): FileSystemNode | null {
    return null;
  }

  watch(path: string, listener: (event: { type: string; path: string; timestamp: Date }) => void): () => void {
    // IPC 监听文件变化
    return () => {};
  }

  resolve(...paths: string[]): string {
    return paths.join('/').replace(/\/+/g, '/');
  }

  dirname(path: string): string {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/') || '/';
  }

  basename(path: string): string {
    return path.split('/').pop() || '';
  }

  extname(path: string): string {
    const idx = path.lastIndexOf('.');
    return idx > 0 ? path.substring(idx) : '';
  }
}

const rustFs = new RustFileSystem();

/**
 * 从 Rust 内核创建 WebOS API
 * 保留现有 UI 接口，底层通过 IPC 与 Rust 内核通信
 */
export function createWebOSAPIFromKernel(): WebOSAPI {
  const api: WebOSAPI = {
    t: (key: string, params?: Record<string, string>) => key,

    setWindowContainer: (element: HTMLDivElement) => {
      (window as any).__windowContainer = element;
    },

    window: {
      open: (appId: string, options?: WindowOptions) => {
        // 窗口管理保留在 JS 侧
        console.log(`[WebOS API] window.open: ${appId}`);
        return `window-${Date.now()}`;
      },
      close: (id: string) => {},
      minimize: (id: string) => {},
      maximize: (id: string) => {},
      restore: (id: string) => {},
      focus: (id: string) => {},
      getAll: () => [] as WindowState[],
    },

    notify: {
      show: (title: string, message: string, options?: Partial<NotifyOptions>) => {
        console.log(`[Notify] ${title}: ${message}`);
        // 通过 IPC 通知 Rust 内核
        kernelBridge.ipcSendString(0, 0, 0x0900, JSON.stringify({ title, message }));
      },
    },

    time: {
      getCurrent: () => new Date(),
      setAlarm: (date: Date, callback: () => void) => {
        const delay = date.getTime() - Date.now();
        if (delay > 0) {
          setTimeout(callback, delay);
        }
        return `alarm-${Date.now()}`;
      },
      clearAlarm: (id: string) => {},
      getAlarms: () => [],
    },

    fs: {
      read: (path: string) => rustFs.read(path),
      write: (path: string, content: string, requireAuth?: boolean) => {
        if (requireAuth) return false;
        return rustFs.write(path, content);
      },
      exists: (path: string) => rustFs.exists(path),
      list: (path: string) => rustFs.list(path),
      mkdir: (path: string, recursive?: boolean) => rustFs.mkdir(path, recursive),
      remove: (path: string) => rustFs.remove(path),
      delete: (path: string) => rustFs.delete(path),
      readdir: (path: string) => rustFs.readdir(path),
      stat: (path: string) => rustFs.stat(path),
      chmod: (path: string, mode: string) => rustFs.chmod(path, mode),
      getPermissions: (path: string) => rustFs.getPermissions(path),
      setPermissions: (path: string, permissions: string, requireAuth?: boolean) =>
        rustFs.setPermissions(path, permissions, requireAuth),
      getNode: (path: string) => rustFs.getNode(path),
      watch: (path, listener) => rustFs.watch(path, listener),
      resolve: (...paths) => rustFs.resolve(...paths),
      dirname: (path) => rustFs.dirname(path),
      basename: (path) => rustFs.basename(path),
      extname: (path) => rustFs.extname(path),
    },

    user: {
      getCurrentUser: () => null,
      getAllUsers: () => [],
      getRealUsers: () => [],
      hasUsers: () => false,
      createUser: () => ({ success: false, error: 'Use Rust kernel' }),
      login: () => ({ success: false, error: 'Use Rust kernel' }),
      logout: () => {},
      isLoggedIn: () => false,
      isRoot: () => false,
      isAdmin: () => false,
      hasPermission: () => false,
      authenticate: () => false,
      requestPrivilege: async () => false,
      createTemporaryUser: () => ({
        username: 'guest',
        password: '',
        role: 'guest' as UserRole,
        isRoot: false,
        homeDir: '/home/guest',
        permissions: [] as Permission[],
      }),
      hasTemporaryUser: () => false,
      getTemporaryUserInfo: () => null,
      clearTemporaryUser: () => {},
      isTemporarySession: () => false,
      tryAutoLogin: () => ({ success: false }),
      subscribe: () => () => {},
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
        getCurrentUser: () => null,
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
        subscribe: () => () => {},
      },
    },

    i18n: {
      getCurrentLocale: () => 'en',
      setLocale: (locale: string) => {},
      t: (key: string) => key,
      getAvailableLocales: () => [] as LocaleConfig[],
      onLocaleChange: () => () => {},
    },

    config: {
      get: <T>(key: string) => undefined as T | undefined,
      set: <T>(key: string, value: T) => {},
      getSystemName: () => 'WebOS',
      setSystemName: (name: string) => {},
    },

    boot: {
      isComplete: () => true,
      isOOBEComplete: () => true,
      completeOOBE: () => {},
      reset: () => {},
    },

    apps: {
      register: () => {},
      unregister: () => false,
      get: () => undefined,
      getAll: () => [] as AppInfo[],
      getByCategory: () => [] as AppInfo[],
      search: () => [] as AppInfo[],
      isRegistered: () => false,
      isRunning: () => false,
      getInstances: () => [],
      launch: () => null,
      close: () => false,
      getCategories: () => [],
      subscribe: () => () => {},
    },
  };

  return api;
}

/**
 * 初始化 WebOS - 从 Rust 内核
 */
export function initWebOSFromKernel(): void {
  if ((window as any).webos) {
    return;
  }

  const api = createWebOSAPIFromKernel();
  (window as any).webos = api;
}
