/**
 * Rust 内核桥接模块
 *
 * 将现有 UI 层的 API 调用转发到 Rust 内核 WASM 处理。
 * 窗口管理由 JS 侧直接管理（DOM 操作），文件系统/进程管理等通过 Rust 内核处理。
 */

// 内核实例类型
interface KernelExports {
  kernel_init: () => number;
  kernel_tick: () => void;
  kernel_spawn_process: (namePtr: number, nameLen: number, parentPid: number) => number;
  kernel_kill_process: (pid: number, signal: number) => number;
  kernel_get_current_pid: () => number;
  kernel_syscall: (pid: number, syscallNum: number, arg0: number, arg1: number, arg2: number, arg3: number) => bigint;
  kernel_ipc_send: (srcPid: number, dstPid: number, msgType: number, dataPtr: number, dataLen: number) => number;
  kernel_ipc_receive: (pid: number, bufPtr: number, bufLen: number) => number;
  kernel_alloc_frame: () => number;
  kernel_free_frame: (frameIdx: number) => number;
  kernel_get_memory_stats: () => bigint;
  kernel_get_process_count: () => number;
  kernel_get_process_info: (pid: number, bufPtr: number, bufLen: number) => number;
  kernel_shutdown: () => void;
  memory: WebAssembly.Memory;
}

/**
 * 内核桥接器 - 封装所有与 Rust 内核的交互
 */
export class KernelBridge {
  private kernel: KernelExports | null = null;

  setKernelInstance(instance: any): void {
    this.kernel = instance?.exports as unknown as KernelExports;
  }

  getKernel(): KernelExports | null {
    return this.kernel;
  }

  isReady(): boolean {
    return this.kernel !== null;
  }

  // 进程管理
  spawnProcess(name: string, parentPid: number = 0): number {
    if (!this.kernel) return 0;
    const nameBytes = new TextEncoder().encode(name);
    const namePtr = this.writeToKernelMemory(nameBytes);
    if (namePtr === 0) return 0;
    return this.kernel.kernel_spawn_process(namePtr, nameBytes.length, parentPid);
  }

  killProcess(pid: number, signal: number = 9): boolean {
    if (!this.kernel) return false;
    return this.kernel.kernel_kill_process(pid, signal) !== 0;
  }

  getCurrentPid(): number {
    if (!this.kernel) return 0;
    return this.kernel.kernel_get_current_pid();
  }

  getProcessCount(): number {
    if (!this.kernel) return 0;
    return this.kernel.kernel_get_process_count();
  }

  // 系统调用
  syscall(pid: number, syscallNum: number, arg0: number, arg1: number, arg2: number, arg3: number): bigint {
    if (!this.kernel) return BigInt(0);
    return this.kernel.kernel_syscall(pid, syscallNum, arg0, arg1, arg2, arg3);
  }

  // IPC
  ipcSend(srcPid: number, dstPid: number, msgType: number, data: Uint8Array): boolean {
    if (!this.kernel) return false;
    const dataPtr = this.writeToKernelMemory(data);
    return this.kernel.kernel_ipc_send(srcPid, dstPid, msgType, dataPtr, data.length) !== 0;
  }

  ipcSendString(srcPid: number, dstPid: number, msgType: number, data: string): boolean {
    const bytes = new TextEncoder().encode(data);
    return this.ipcSend(srcPid, dstPid, msgType, bytes);
  }

  ipcReceive(pid: number, buf: Uint8Array): number {
    if (!this.kernel) return 0;
    const bufPtr = this.writeToKernelMemory(buf);
    const len = this.kernel.kernel_ipc_receive(pid, bufPtr, buf.length);
    if (len > 0) {
      const kernelMem = new Uint8Array(this.kernel.memory.buffer);
      buf.set(kernelMem.slice(bufPtr, bufPtr + len));
    }
    return len;
  }

  // 内存
  getMemoryStats(): { totalFrames: number; usedFrames: number; freeFrames: number } {
    if (!this.kernel) return { totalFrames: 0, usedFrames: 0, freeFrames: 0 };
    const stats = this.kernel.kernel_get_memory_stats();
    const totalFrames = Number(stats >> 32n);
    const usedFrames = Number(stats & 0xFFFFFFFFn);
    return { totalFrames, usedFrames, freeFrames: totalFrames - usedFrames };
  }

  // 调度器
  tick(): void {
    if (!this.kernel) return;
    this.kernel.kernel_tick();
  }

  // 辅助
  private writeToKernelMemory(data: Uint8Array | number[]): number {
    if (!this.kernel) return 0;
    const mem = new Uint8Array(this.kernel.memory.buffer);
    const offset = mem.length - data.length - 1;
    if (offset < 0) return 0;
    mem.set(data, offset);
    return offset;
  }

  shutdown(): void {
    if (this.kernel) {
      try { this.kernel.kernel_shutdown(); } catch (e) {}
      this.kernel = null;
    }
  }
}

// 全局单例
export const kernelBridge = new KernelBridge();

export function getKernelBridge(): KernelBridge {
  return kernelBridge;
}

// ============================================================================
// WebOS API 构建
// ============================================================================

import type {
  WebOSAPI,
  WindowOptions,
  WindowState,
  NotifyOptions,
  UserRole,
  Permission,
  FileSystemNode,
  LocaleConfig,
} from '../../types';

/**
 * 文件系统 - 通过 Rust 内核 syscall 实现
 */
class RustFileSystem {
  private pid: number = 0;

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
    return new TextDecoder().decode(mem.slice(bufPtr, bufPtr + readLen));
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
    return Number(result >> 32n) === 0 && (Number(result & 0xFFFFFFFFn) > 0);
  }

  exists(path: string): boolean { return this.read(path) !== null; }
  list(path: string): FileSystemNode[] { return []; }
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
  remove(path: string): boolean { return this.delete(path); }
  readdir(path: string): any[] { return []; }
  stat(path: string): FileSystemNode | null { return null; }
  chmod(path: string, mode: string): boolean { return false; }
  getPermissions(path: string): string { return 'rwxr-xr-x'; }
  setPermissions(path: string, permissions: string, requireAuth?: boolean): boolean {
    if (requireAuth) return false;
    return this.chmod(path, permissions);
  }
  getNode(path: string): FileSystemNode | null { return null; }
  watch(path: string, listener: any): () => void { return () => {}; }
  resolve(...paths: string[]): string { return paths.join('/').replace(/\/+/g, '/'); }
  dirname(path: string): string { return path.split('/').slice(0, -1).join('/') || '/'; }
  basename(path: string): string { return path.split('/').pop() || ''; }
  extname(path: string): string { const idx = path.lastIndexOf('.'); return idx > 0 ? path.substring(idx) : ''; }
}

const rustFs = new RustFileSystem();

/**
 * 从 Rust 内核创建 WebOS API
 */
export function createWebOSAPIFromKernel(): WebOSAPI {
  const api: WebOSAPI = {
    t: (key: string) => key,
    setWindowContainer: (element: HTMLDivElement) => { (window as any).__windowContainer = element; },
    window: {
      open: (appId: string, options?: WindowOptions) => `window-${Date.now()}`,
      close: () => {},
      minimize: () => {},
      maximize: () => {},
      restore: () => {},
      focus: () => {},
      getAll: () => [] as WindowState[],
    },
    notify: {
      show: (title: string, message: string) => {
        kernelBridge.ipcSendString(0, 0, 0x0900, JSON.stringify({ title, message }));
      },
    },
    time: {
      getCurrent: () => new Date(),
      setAlarm: (date: Date, callback: () => void) => {
        const delay = date.getTime() - Date.now();
        if (delay > 0) setTimeout(callback, delay);
        return `alarm-${Date.now()}`;
      },
      clearAlarm: () => {},
      getAlarms: () => [],
    },
    fs: {
      read: (path) => rustFs.read(path),
      write: (path, content, requireAuth?) => { if (requireAuth) return false; return rustFs.write(path, content); },
      exists: (path) => rustFs.exists(path),
      list: (path) => rustFs.list(path),
      mkdir: (path, recursive?) => rustFs.mkdir(path, recursive),
      remove: (path) => rustFs.remove(path),
      delete: (path) => rustFs.delete(path),
      readdir: (path) => rustFs.readdir(path),
      stat: (path) => rustFs.stat(path),
      chmod: (path, mode) => rustFs.chmod(path, mode),
      getPermissions: (path) => rustFs.getPermissions(path),
      setPermissions: (path, perms, requireAuth?) => rustFs.setPermissions(path, perms, requireAuth),
      getNode: (path) => rustFs.getNode(path),
      watch: (path, listener) => rustFs.watch(path, listener),
      resolve: (...paths) => rustFs.resolve(...paths),
      dirname: (path) => rustFs.dirname(path),
      basename: (path) => rustFs.basename(path),
      extname: (path) => rustFs.extname(path),
    },
    user: {
      getCurrentUser: () => null, getAllUsers: () => [], getRealUsers: () => [],
      hasUsers: () => false,
      createUser: () => ({ success: false, error: 'Use Rust kernel' }),
      login: () => ({ success: false, error: 'Use Rust kernel' }),
      logout: () => {}, isLoggedIn: () => false, isRoot: () => false,
      isAdmin: () => false, hasPermission: () => false, authenticate: () => false,
      requestPrivilege: async () => false,
      createTemporaryUser: () => ({ username: 'guest', password: '', role: 'guest' as UserRole, isRoot: false, homeDir: '/home/guest', permissions: [] as Permission[] }),
      hasTemporaryUser: () => false, getTemporaryUserInfo: () => null,
      clearTemporaryUser: () => {}, isTemporarySession: () => false,
      tryAutoLogin: () => ({ success: false }), subscribe: () => () => {},
      secure: {
        isReady: () => false, isInitialized: async () => false, isLocked: () => true,
        getState: () => ({ isInitialized: false, isLocked: true, hasUsers: false, currentUser: null }),
        createFirstUser: async () => ({ success: false, error: 'Use Rust kernel' }),
        login: async () => ({ success: false, error: 'Use Rust kernel' }),
        logout: async () => {}, lock: () => {},
        unlock: async () => ({ success: false, error: 'Use Rust kernel' }),
        getCurrentUser: () => null, getUserList: async () => [],
        getTotalUserCount: async () => 0, changePassword: async () => ({ success: false }),
        updateDisplayName: async () => ({ success: false }),
        isAdmin: () => false, isRoot: () => false, hasPermission: () => false,
        saveEncryptedData: async () => ({ success: false }), getEncryptedData: async () => null,
        resetSystem: async () => ({ success: false }), resetAndReinit: async () => {},
        subscribe: () => () => {},
      },
    },
    i18n: {
      getCurrentLocale: () => 'en', setLocale: () => {}, t: (key) => key,
      getAvailableLocales: () => [] as LocaleConfig[], onLocaleChange: () => () => {},
    },
    config: {
      get: <T>() => undefined as T | undefined, set: () => {},
      getSystemName: () => 'WebOS', setSystemName: () => {},
    },
    boot: { isComplete: () => true, isOOBEComplete: () => true, completeOOBE: () => {}, reset: () => {} },
    apps: {
      register: () => {}, unregister: () => false, get: () => undefined,
      getAll: () => [], getByCategory: () => [], search: () => [],
      isRegistered: () => false, isRunning: () => false, getInstances: () => [],
      launch: () => null, close: () => false, getCategories: () => [],
      subscribe: () => () => {},
    },
  };
  return api;
}

export function initWebOSFromKernel(): void {
  if ((window as any).webos) return;
  const api = createWebOSAPIFromKernel();
  (window as any).webos = api;
}
