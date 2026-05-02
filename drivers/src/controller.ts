/**
 * Boot Controller - 系统启动控制器
 *
 * 职责：
 * 1. 加载 Rust 内核 WASM 并实例化
 * 2. 初始化内核
 * 3. 启动 init 进程
 *
 * 不做文件系统挂载、不做 API 验证、不做多余步骤。
 * 启动就是：加载 → 实例化 → init → 完成。
 */

import { setKernelRef } from './host';
import { kernelBridge } from '@webos/kernel/core/bridge';

export interface BootResult {
  success: boolean;
  error?: string;
  stage?: string;
}

export type ProgressCallback = (stage: string, progress: number) => void;

export class BootController {
  private onProgress?: ProgressCallback;

  setProgressHandler(cb: ProgressCallback): void {
    this.onProgress = cb;
  }

  private progress(stage: string, pct: number): void {
    this.onProgress?.(stage, pct);
  }

  async run(): Promise<BootResult> {
    try {
      // === Stage 1: 加载内核 WASM (0-40%) ===
      this.progress('Loading kernel...', 10);
      const wasmBytes = await this.fetchWasm('/wasm/kernel.wasm');
      this.progress('Kernel loaded', 40);

      // === Stage 2: 实例化内核 (40-70%) ===
      this.progress('Instantiating kernel...', 50);
      const instance = await this.instantiateKernel(wasmBytes);
      kernelBridge.setKernelInstance(instance);
      setKernelRef({ exports: instance.exports as any });
      (window as any).__rustKernel = instance;
      this.progress('Kernel instantiated', 70);

      // === Stage 3: 初始化内核 (70-90%) ===
      this.progress('Initializing kernel...', 75);
      const initResult = kernelBridge.init(10);
      if (initResult !== 0) {
        return { success: false, error: `Kernel init failed: ${initResult}`, stage: 'init' };
      }
      this.progress('Kernel initialized', 90);

      // === Stage 4: 启动 init 进程 (90-100%) ===
      this.progress('Starting init...', 95);
      const initPid = kernelBridge.spawnProcess('init', 0);
      if (initPid > 0) {
        try {
          await this.loadUserProcess('init', initPid);
        } catch (e: any) {
          console.warn(`[Boot] init process load failed: ${e.message}`);
        }
      }
      this.progress('Boot complete', 100);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message, stage: 'unknown' };
    }
  }

  shutdown(): void {
    kernelBridge.shutdown();
    (window as any).__rustKernel = undefined;
  }

  // --- 内部方法 ---

  private async fetchWasm(path: string): Promise<Uint8Array> {
    const resp = await fetch(path);
    if (!resp.ok) throw new Error(`Failed to fetch ${path}: ${resp.status}`);
    return new Uint8Array(await resp.arrayBuffer());
  }

  private async instantiateKernel(wasmBytes: Uint8Array): Promise<WebAssembly.Instance> {
    const { hostDebugLog, hostFsRead, hostFsWrite, hostTimeNow, hostConsoleWrite } = await import('./host');

    const importObject = {
      env: {
        host_debug_log: hostDebugLog,
        host_fs_read: hostFsRead,
        host_fs_write: hostFsWrite,
        host_time_now: hostTimeNow,
        host_console_write: hostConsoleWrite,
        memory: new WebAssembly.Memory({ initial: 256, maximum: 1024 }),
      },
    };

    const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);
    return instance;
  }

  private async loadUserProcess(name: string, pid: number): Promise<void> {
    const wasmBytes = await this.fetchWasm(`/wasm/${name}.wasm`);

    const importObject = {
      env: {
        syscall: (num: number, a0: number, a1: number, a2: number, a3: number) => {
          return kernelBridge.syscall(pid, num, a0, a1, a2, a3);
        },
        memory: new WebAssembly.Memory({ initial: 16, maximum: 256 }),
      },
    };

    const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);
    if ((instance.exports as any)._start) {
      (instance.exports as any)._start();
    }
  }
}
