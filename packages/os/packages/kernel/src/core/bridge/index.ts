/**
 * Rust 内核桥接模块
 *
 * 将现有 UI 层的 API 调用转发到 Rust 内核 WASM 处理。
 * 窗口管理、文件系统操作等通过此桥接层与 Rust 内核通信。
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

  /**
   * 设置内核实例（由 Bootloader 调用）
   */
  setKernelInstance(instance: any): void {
    this.kernel = instance?.exports as unknown as KernelExports;
  }

  /**
   * 获取内核实例
   */
  getKernel(): KernelExports | null {
    return this.kernel;
  }

  /**
   * 内核是否已初始化
   */
  isReady(): boolean {
    return this.kernel !== null;
  }

  // ===========================================================================
  // 进程管理
  // ===========================================================================

  /**
   * 在 Rust 内核中创建新进程
   */
  spawnProcess(name: string, parentPid: number = 0): number {
    if (!this.kernel) return 0;

    const nameBytes = new TextEncoder().encode(name);
    const mem = new Uint8Array(this.kernel.memory.buffer);

    // 在 WASM 内存中分配空间写入进程名
    const namePtr = this.writeToKernelMemory(nameBytes);
    if (namePtr === 0) return 0;

    try {
      return this.kernel.kernel_spawn_process(namePtr, nameBytes.length, parentPid);
    } finally {
      // 不需要特别释放，WASM 内存由内核管理
    }
  }

  /**
   * 终止进程
   */
  killProcess(pid: number, signal: number = 9): boolean {
    if (!this.kernel) return false;
    return this.kernel.kernel_kill_process(pid, signal) !== 0;
  }

  /**
   * 获取当前 PID
   */
  getCurrentPid(): number {
    if (!this.kernel) return 0;
    return this.kernel.kernel_get_current_pid();
  }

  /**
   * 获取进程数量
   */
  getProcessCount(): number {
    if (!this.kernel) return 0;
    return this.kernel.kernel_get_process_count();
  }

  // ===========================================================================
  // 系统调用
  // ===========================================================================

  /**
   * 执行系统调用
   */
  syscall(pid: number, syscallNum: number, arg0: number, arg1: number, arg2: number, arg3: number): bigint {
    if (!this.kernel) return BigInt(0);
    return this.kernel.kernel_syscall(pid, syscallNum, arg0, arg1, arg2, arg3);
  }

  /**
   * 文件系统读（通过 syscall）
   */
  fsRead(pid: number, path: string, buf: Uint8Array): number {
    if (!this.kernel) return -1;

    const pathBytes = new TextEncoder().encode(path);
    const pathPtr = this.writeToKernelMemory(pathBytes);
    const bufPtr = this.writeToKernelMemory(buf);

    try {
      const result = this.kernel.kernel_syscall(pid, 0x0100, pathPtr, pathBytes.length, bufPtr, buf.length);
      const errCode = Number(result >> 32n);
      if (errCode !== 0) return -errCode;

      // 从内核内存复制数据到 buf
      const readLen = Number(result & 0xFFFFFFFFn);
      const kernelMem = new Uint8Array(this.kernel.memory.buffer);
      buf.set(kernelMem.slice(bufPtr, bufPtr + readLen));

      return readLen;
    } finally {
      // 释放临时内存
    }
  }

  /**
   * 文件系统写（通过 syscall）
   */
  fsWrite(pid: number, path: string, data: string): number {
    if (!this.kernel) return -1;

    const pathBytes = new TextEncoder().encode(path);
    const dataBytes = new TextEncoder().encode(data);
    const pathPtr = this.writeToKernelMemory(pathBytes);
    const dataPtr = this.writeToKernelMemory(dataBytes);

    try {
      const result = this.kernel.kernel_syscall(pid, 0x0101, pathPtr, pathBytes.length, dataPtr, dataBytes.length);
      const errCode = Number(result >> 32n);
      if (errCode !== 0) return -errCode;
      return Number(result & 0xFFFFFFFFn);
    } finally {
      // 释放临时内存
    }
  }

  // ===========================================================================
  // IPC 消息
  // ===========================================================================

  /**
   * IPC 发送消息
   */
  ipcSend(srcPid: number, dstPid: number, msgType: number, data: Uint8Array): boolean {
    if (!this.kernel) return false;
    const dataPtr = this.writeToKernelMemory(data);
    return this.kernel.kernel_ipc_send(srcPid, dstPid, msgType, dataPtr, data.length) !== 0;
  }

  /**
   * IPC 发送字符串消息
   */
  ipcSendString(srcPid: number, dstPid: number, msgType: number, data: string): boolean {
    const bytes = new TextEncoder().encode(data);
    return this.ipcSend(srcPid, dstPid, msgType, bytes);
  }

  /**
   * IPC 接收消息
   */
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

  // ===========================================================================
  // 内存管理
  // ===========================================================================

  /**
   * 获取内存统计
   */
  getMemoryStats(): { totalFrames: number; usedFrames: number; freeFrames: number } {
    if (!this.kernel) return { totalFrames: 0, usedFrames: 0, freeFrames: 0 };

    const stats = this.kernel.kernel_get_memory_stats();
    const totalFrames = Number(stats >> 32n);
    const usedFrames = Number(stats & 0xFFFFFFFFn);

    return {
      totalFrames,
      usedFrames,
      freeFrames: totalFrames - usedFrames,
    };
  }

  // ===========================================================================
  // 调度器
  // ===========================================================================

  /**
   * 触发调度器 tick
   */
  tick(): void {
    if (!this.kernel) return;
    this.kernel.kernel_tick();
  }

  // ===========================================================================
  // 辅助方法
  // ===========================================================================

  /**
   * 将字节数据写入内核 WASM 内存
   * 返回写入的偏移量，0 表示失败
   */
  private writeToKernelMemory(data: Uint8Array | number[]): number {
    if (!this.kernel) return 0;

    const mem = new Uint8Array(this.kernel.memory.buffer);
    const offset = mem.length - data.length - 1; // 使用内存末尾

    if (offset < 0) return 0;

    mem.set(data, offset);
    return offset;
  }

  /**
   * 从内核 WASM 内存读取字符串
   */
  private readStringFromKernel(ptr: number, len: number): string {
    if (!this.kernel || ptr === 0 || len === 0) return '';

    const mem = new Uint8Array(this.kernel.memory.buffer);
    return new TextDecoder().decode(mem.slice(ptr, ptr + len));
  }

  /**
   * 关闭内核
   */
  shutdown(): void {
    if (this.kernel) {
      try {
        this.kernel.kernel_shutdown();
      } catch (e) {
        // 忽略
      }
      this.kernel = null;
    }
  }
}

// 全局单例
export const kernelBridge = new KernelBridge();

/**
 * 获取内核桥接器
 */
export function getKernelBridge(): KernelBridge {
  return kernelBridge;
}
