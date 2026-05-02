/**
 * WebOS Kernel Bridge 入口
 *
 * Rust + WASM 微内核架构：
 * - 内核逻辑由 Rust 编写，编译为 WASM
 * - 此模块提供 JS 侧的桥接 API
 * - 内核 WASM 由 drivers/ 加载和实例化
 */

// 类型定义（供 UI 层使用）
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

// IPC 类型（与 Rust 内核通信）
export * from './core/ipc/types';

// 内核桥接
export {
  KernelBridge,
  kernelBridge,
  getKernelBridge,
  type MemoryStats,
  type ProcessInfo,
} from './core/bridge';

// SyscallNumber / ProcessState 直接导出
export { SyscallNumber, ProcessState } from './core/ipc/types';
export type { IPCMessage, SyscallParams, SyscallResult, ProcessDescriptor, ProcessConfig } from './core/ipc/types';
