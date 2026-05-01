// WebOS Kernel 入口 - Rust + WebAssembly 微内核架构
//
// 旧的 JS 内核模拟代码已移除，核心逻辑由 Rust 编写编译为 WASM 在浏览器运行。
// 此文件仅保留 IPC 类型定义（供 UI 层通信使用）和桥接层。
//
// 内核 WASM 模块由 Bootloader 加载，通过宿主函数桥接与 JS UI 通信。

// 保留原有类型定义（供 UI 层使用）
export type {
  User,
  UserSession,
  UserRole,
  Permission,
  FileSystemNode,
  WindowOptions,
  WindowState,
  NotifyOptions,
  Alarm,
  LocaleConfig,
  SystemConfig,
  WebOSAPI,
} from './types';

// IPC 和进程管理类型（保留，与 Rust 内核通信需要）
export * from './core/ipc/types';

// Rust 内核桥接 API
// 这些函数由 Rust 内核 WASM 导出，通过宿主环境提供给 JS
export interface RustKernelBridge {
  // 内核生命周期
  init(): void;
  shutdown(): void;

  // 进程管理
  spawnProcess(name: string, wasmModule: Uint8Array, parentPid: number): number;
  killProcess(pid: number, signal: number): boolean;
  getProcessList(): ProcessInfo[];
  getCurrentPid(): number;

  // 系统调用转发
  syscall(pid: number, syscallNum: number, args: number[]): SyscallResult;

  // IPC 消息
  ipcSend(sourcePid: number, targetPid: number, type: string, data: ArrayBuffer): boolean;
  ipcReceive(pid: number): ArrayBuffer | null;

  // 内存管理
  allocFrame(): number;
  freeFrame(frameIdx: number): boolean;
  getMemoryStats(): MemoryStats;

  // 调度器
  tick(): void;
  setSchedulerInterval(ms: number): void;
}

export interface ProcessInfo {
  pid: number;
  parentPid: number;
  name: string;
  state: string;
  priority: number;
  memorySize: number;
  startTime: number;
  cpuTime: number;
}

export interface MemoryStats {
  totalFrames: number;
  usedFrames: number;
  freeFrames: number;
  totalMemory: number;
  usedMemory: number;
}

// 重新导出 IPC 类型（兼容性）
export { SyscallNumber, ProcessState } from './core/ipc/types';
export type { IPCMessage, SyscallParams, SyscallResult, ProcessDescriptor, ProcessConfig } from './core/ipc/types';
