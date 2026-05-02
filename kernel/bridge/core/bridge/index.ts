/**
 * Kernel Bridge - Rust WASM 内核与 JS UI 的桥接层
 *
 * 只做一件事：封装 Rust 内核的 WASM exports 为 JS 可调用的 API。
 * 不做任何 UI 逻辑、不做任何文件系统模拟。
 */

import type { SyscallNumber, ProcessState, IPCMessage, SyscallResult, ProcessDescriptor, ProcessConfig } from './core/ipc/types';

export type { SyscallNumber, ProcessState, IPCMessage, SyscallResult, ProcessDescriptor, ProcessConfig };

// Rust 内核 WASM 导出接口
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

export interface MemoryStats {
  totalFrames: number;
  usedFrames: number;
  freeFrames: number;
  totalMemory: number;
  usedMemory: number;
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

/**
 * 内核桥接器
 */
export class KernelBridge {
  private kernel: KernelExports | null = null;
  private schedulerInterval: ReturnType<typeof setInterval> | null = null;

  setKernelInstance(instance: any): void {
    this.kernel = instance?.exports as unknown as KernelExports;
  }

  getKernel(): KernelExports | null {
    return this.kernel;
  }

  isReady(): boolean {
    return this.kernel !== null;
  }

  /** 初始化内核，启动调度器 */
  init(tickIntervalMs: number = 10): number {
    if (!this.kernel) return -1;
    const result = this.kernel.kernel_init();
    if (result === 0) {
      this.schedulerInterval = setInterval(() => {
        try { this.kernel!.kernel_tick(); } catch {}
      }, tickIntervalMs);
    }
    return result;
  }

  /** 关闭内核 */
  shutdown(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    if (this.kernel) {
      try { this.kernel.kernel_shutdown(); } catch {}
      this.kernel = null;
    }
  }

  // --- 进程管理 ---

  spawnProcess(name: string, parentPid: number = 0): number {
    if (!this.kernel) return 0;
    const bytes = new TextEncoder().encode(name);
    const ptr = this.writeMemory(bytes);
    if (ptr === 0) return 0;
    return this.kernel.kernel_spawn_process(ptr, bytes.length, parentPid);
  }

  killProcess(pid: number, signal: number = 9): boolean {
    if (!this.kernel) return false;
    return this.kernel.kernel_kill_process(pid, signal) !== 0;
  }

  getCurrentPid(): number {
    return this.kernel?.kernel_get_current_pid() ?? 0;
  }

  getProcessCount(): number {
    return this.kernel?.kernel_get_process_count() ?? 0;
  }

  // --- 系统调用 ---

  syscall(pid: number, num: number, a0: number, a1: number, a2: number, a3: number): bigint {
    if (!this.kernel) return 0n;
    return this.kernel.kernel_syscall(pid, num, a0, a1, a2, a3);
  }

  // --- IPC ---

  ipcSend(srcPid: number, dstPid: number, msgType: number, data: Uint8Array): boolean {
    if (!this.kernel) return false;
    const ptr = this.writeMemory(data);
    return this.kernel.kernel_ipc_send(srcPid, dstPid, msgType, ptr, data.length) !== 0;
  }

  ipcSendString(srcPid: number, dstPid: number, msgType: number, data: string): boolean {
    return this.ipcSend(srcPid, dstPid, msgType, new TextEncoder().encode(data));
  }

  ipcReceive(pid: number): Uint8Array | null {
    if (!this.kernel) return null;
    const buf = new Uint8Array(4096);
    const ptr = this.writeMemory(buf);
    const len = this.kernel.kernel_ipc_receive(pid, ptr, buf.length);
    if (len <= 0) return null;
    const mem = new Uint8Array(this.kernel.memory.buffer);
    return mem.slice(ptr, ptr + len);
  }

  // --- 内存 ---

  getMemoryStats(): MemoryStats {
    if (!this.kernel) return { totalFrames: 0, usedFrames: 0, freeFrames: 0, totalMemory: 0, usedMemory: 0 };
    const stats = this.kernel.kernel_get_memory_stats();
    const total = Number(stats >> 32n);
    const used = Number(stats & 0xFFFFFFFFn);
    return {
      totalFrames: total, usedFrames: used, freeFrames: total - used,
      totalMemory: total * 4096, usedMemory: used * 4096,
    };
  }

  allocFrame(): number {
    return this.kernel?.kernel_alloc_frame() ?? -1;
  }

  freeFrame(idx: number): boolean {
    return this.kernel?.kernel_free_frame(idx) !== 0;
  }

  // --- 内部辅助 ---

  private writeMemory(data: Uint8Array): number {
    if (!this.kernel) return 0;
    const mem = new Uint8Array(this.kernel.memory.buffer);
    const offset = mem.length - data.length - 1;
    if (offset < 0) return 0;
    mem.set(data, offset);
    return offset;
  }
}

// 全局单例
export const kernelBridge = new KernelBridge();
export function getKernelBridge(): KernelBridge { return kernelBridge; }
