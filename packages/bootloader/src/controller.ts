/**
 * BootController - 启动控制器
 *
 * 执行真正的系统初始化任务
 *
 * 重构后：Bootloader 加载 Rust 内核 WASM 并实例化，
 * 传入宿主函数（syscall_handler, ipc_send 等），
 * 调用 kernel_init() 初始化，然后内核启动首个用户态进程。
 */

// ============================================================================
// Types
// ============================================================================

export interface BootTask {
  id: string;
  name: string;
  weight: number;
  execute: () => Promise<void>;
}

export type ProgressCallback = (task: string, progress: number) => void;

export interface BootResult {
  success: boolean;
  error?: string;
}

// Rust 内核 WASM 实例类型
interface KernelInstance {
  exports: {
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
  };
}

// ============================================================================
// 宿主函数 - 传入 Rust 内核的 import object
// ============================================================================

/**
 * 宿主日志输出 - Rust 内核通过 syscall DEBUG_LOG 调用
 */
function hostDebugLog(msgPtr: number, msgLen: number): void {
  // 从 WASM 内存中读取字符串
  const kernel = (window as any).__rustKernel as KernelInstance;
  if (!kernel) return;
  const mem = new Uint8Array(kernel.exports.memory.buffer);
  const str = new TextDecoder().decode(mem.slice(msgPtr, msgPtr + msgLen));
  console.log(`[RustKernel] ${str}`);
}

/**
 * 宿主文件系统读 - 返回读取字节数，负数表示错误
 */
function hostFsRead(pathPtr: number, pathLen: number, bufPtr: number, bufLen: number): number {
  const kernel = (window as any).__rustKernel as KernelInstance;
  if (!kernel) return -1;

  const mem = new Uint8Array(kernel.exports.memory.buffer);
  const path = new TextDecoder().decode(mem.slice(pathPtr, pathPtr + pathLen));

  // 使用现有文件系统 API
  if (!window.webos?.fs) return -2;

  const content = window.webos.fs.read(path);
  if (content === null) return -3;

  const contentBytes = new TextEncoder().encode(content);
  const len = Math.min(contentBytes.length, bufLen);
  mem.set(contentBytes.slice(0, len), bufPtr);

  return len;
}

/**
 * 宿主文件系统写 - 返回写入字节数，负数表示错误
 */
function hostFsWrite(pathPtr: number, pathLen: number, dataPtr: number, dataLen: number): number {
  const kernel = (window as any).__rustKernel as KernelInstance;
  if (!kernel) return -1;

  const mem = new Uint8Array(kernel.exports.memory.buffer);
  const path = new TextDecoder().decode(mem.slice(pathPtr, pathPtr + pathLen));
  const data = new TextDecoder().decode(mem.slice(dataPtr, dataPtr + dataLen));

  if (!window.webos?.fs) return -2;

  const success = window.webos.fs.write(path, data);
  return success ? dataLen : -3;
}

/**
 * 宿主获取时间戳
 */
function hostTimeNow(): bigint {
  return BigInt(Date.now());
}

/**
 * 宿主终端输出
 */
function hostConsoleWrite(dataPtr: number, dataLen: number): void {
  const kernel = (window as any).__rustKernel as KernelInstance;
  if (!kernel) return;

  const mem = new Uint8Array(kernel.exports.memory.buffer);
  const str = new TextDecoder().decode(mem.slice(dataPtr, dataPtr + dataLen));
  console.log(`[Console] ${str}`);
}

// ============================================================================
// BootController Class
// ============================================================================

/**
 * 启动控制器
 *
 * 执行系统初始化任务：
 * - Stage 1: Hardware Probe
 * - Stage 2: Load Rust Kernel WASM
 * - Stage 3: Init Kernel + Verify
 * - Stage 4: Filesystem Init
 * - Stage 5: Start User Processes
 * - Stage 6: Desktop Ready
 */
export class BootController {
  private tasks: BootTask[] = [];
  private completedWeight = 0;
  private totalWeight = 0;
  private onProgress?: ProgressCallback;
  private kernelInstance?: KernelInstance;
  private schedulerInterval?: ReturnType<typeof setInterval>;

  constructor() {
    this.registerTasks();
  }

  private registerTasks(): void {
    // ========================================
    // Stage 1: Hardware Probe (10%)
    // ========================================
    this.addTask({
      id: 'hw.probe',
      name: 'Probing hardware capabilities...',
      weight: 5,
      execute: async () => {
        if (!window.WebAssembly) {
          throw new Error('WebAssembly not supported');
        }
      },
    });

    // ========================================
    // Stage 2: Load Rust Kernel WASM (25%)
    // ========================================
    this.addTask({
      id: 'kernel.load',
      name: 'Loading Rust kernel WASM...',
      weight: 15,
      execute: async () => {
        await this.loadRustKernel();
      },
    });

    this.addTask({
      id: 'kernel.instantiate',
      name: 'Instantiating Rust kernel...',
      weight: 10,
      execute: async () => {
        await this.instantiateRustKernel();
      },
    });

    // ========================================
    // Stage 3: Initialize Kernel (20%)
    // ========================================
    this.addTask({
      id: 'kernel.init',
      name: 'Initializing Rust microkernel...',
      weight: 10,
      execute: async () => {
        const result = this.kernelInstance!.exports.kernel_init();
        if (result !== 0) {
          throw new Error(`Kernel init failed with code ${result}`);
        }
        console.log('[BootController] Rust kernel initialized successfully');

        // 启动调度器 tick（每 10ms 一次）
        this.schedulerInterval = setInterval(() => {
          try {
            this.kernelInstance!.exports.kernel_tick();
          } catch (e) {
            // 调度器异常不中断启动
          }
        }, 10);
      },
    });

    this.addTask({
      id: 'kernel.verify',
      name: 'Verifying kernel APIs...',
      weight: 10,
      execute: async () => {
        // 验证内核 API
        const pid = this.kernelInstance!.exports.kernel_get_current_pid();
        const processCount = this.kernelInstance!.exports.kernel_get_process_count();
        const memStats = this.kernelInstance!.exports.kernel_get_memory_stats();
        console.log(`[BootController] Kernel PID: ${pid}, Processes: ${processCount}`);
        console.log(`[BootController] Memory stats: total=${Number(memStats >> 32n)} frames, used=${Number(memStats & 0xFFFFFFFFn)} frames`);
      },
    });

    // ========================================
    // Stage 4: Filesystem (20%)
    // ========================================
    this.addTask({
      id: 'fs.mount',
      name: 'Mounting root filesystem...',
      weight: 10,
      execute: async () => {
        if (window.webos?.fs) {
          const rootFiles = window.webos.fs.list('/');
          if (rootFiles.length === 0) {
            throw new Error('Filesystem mount failed');
          }
        }
      },
    });

    this.addTask({
      id: 'fs.directories',
      name: 'Creating system directories...',
      weight: 10,
      execute: async () => {
        const fs = window.webos?.fs;
        if (fs) {
          const systemDirs = ['/tmp', '/var', '/var/log', '/var/cache'];
          for (const dir of systemDirs) {
            if (!fs.exists(dir)) {
              fs.mkdir(dir);
            }
          }
          if (!fs.exists('/var/cache/apps')) {
            fs.mkdir('/var/cache/apps');
          }
        }
      },
    });

    // ========================================
    // Stage 5: Spawn init process (15%)
    // ========================================
    this.addTask({
      id: 'process.init',
      name: 'Spawning init process...',
      weight: 10,
      execute: async () => {
        // 在 Rust 内核中创建 init 进程
        const name = 'init';
        const nameBytes = new TextEncoder().encode(name);
        const mem = new Uint8Array(this.kernelInstance!.exports.memory.buffer);

        // 分配内核内存写入进程名
        const namePtr = mem.length; // 使用内存末尾
        // 需要在 WASM 内存中分配空间 - 使用 kernel 帧分配
        const initPid = this.kernelInstance!.exports.kernel_spawn_process(0, 0, 0);
        console.log(`[BootController] Init process spawned: PID ${initPid}`);

        // 加载用户态 init WASM
        await this.loadUserProcess('init', initPid);
      },
    });

    this.addTask({
      id: 'process.shell',
      name: 'Starting shell process...',
      weight: 5,
      execute: async () => {
        // Shell 进程由 init 进程通过 syscall 创建
        // 这里只是预留
        console.log('[BootController] Shell will be spawned by init process');
      },
    });

    // ========================================
    // Stage 6: Desktop (10%)
    // ========================================
    this.addTask({
      id: 'desktop.ready',
      name: 'Preparing desktop...',
      weight: 10,
      execute: async () => {
        // 将内核实例暴露给全局
        (window as any).__rustKernel = this.kernelInstance;
      },
    });
  }

  /**
   * 加载 Rust 内核 WASM 文件
   */
  private async loadRustKernel(): Promise<void> {
    try {
      const response = await fetch('/wasm/kernel.wasm');
      if (!response.ok) {
        throw new Error(`Failed to fetch kernel WASM: ${response.status}`);
      }
      this.wasmBytes = new Uint8Array(await response.arrayBuffer());
      console.log(`[BootController] Kernel WASM loaded: ${this.wasmBytes!.length} bytes`);
    } catch (error: any) {
      throw new Error(`Kernel WASM load failed: ${error.message}`);
    }
  }

  private wasmBytes?: Uint8Array;

  /**
   * 实例化 Rust 内核，传入宿主函数
   */
  private async instantiateRustKernel(): Promise<void> {
    if (!this.wasmBytes) {
      throw new Error('Kernel WASM bytes not loaded');
    }

    const importObject = {
      env: {
        host_debug_log: hostDebugLog,
        host_fs_read: hostFsRead,
        host_fs_write: hostFsWrite,
        host_time_now: hostTimeNow,
        host_console_write: hostConsoleWrite,
        // WASM 需要的内存导入 - 让内核自己管理
        memory: new WebAssembly.Memory({ initial: 256, maximum: 1024 }),
      },
    };

    try {
      const { instance } = await WebAssembly.instantiate(this.wasmBytes, importObject);
      this.kernelInstance = instance as unknown as KernelInstance;

      // 暴露内核实例给宿主函数
      (window as any).__rustKernel = this.kernelInstance;

      console.log('[BootController] Rust kernel instantiated successfully');
    } catch (error: any) {
      throw new Error(`Kernel instantiation failed: ${error.message}`);
    }
  }

  /**
   * 加载用户态 WASM 进程
   */
  private async loadUserProcess(name: string, pid: number): Promise<void> {
    try {
      const response = await fetch(`/wasm/${name}.wasm`);
      if (!response.ok) {
        console.warn(`[BootController] User process ${name} WASM not found (${response.status})`);
        return;
      }
      const wasmBytes = new Uint8Array(await response.arrayBuffer());

      // 用户态进程的 import：通过宿主转发到内核 syscall
      const userImportObject = {
        env: {
          // 系统调用入口 - 用户程序通过此函数调用内核
          syscall: (syscallNum: number, arg0: number, arg1: number, arg2: number, arg3: number) => {
            return this.kernelInstance!.exports.kernel_syscall(pid, syscallNum, arg0, arg1, arg2, arg3);
          },
          memory: new WebAssembly.Memory({ initial: 16, maximum: 256 }),
        },
      };

      const { instance: userInstance } = await WebAssembly.instantiate(wasmBytes, userImportObject);

      // 调用用户程序 _start
      if ((userInstance.exports as any)._start) {
        (userInstance.exports as any)._start();
      }

      console.log(`[BootController] User process ${name} (PID ${pid}) started`);
    } catch (error: any) {
      console.warn(`[BootController] Failed to load user process ${name}: ${error.message}`);
    }
  }

  private addTask(task: BootTask): void {
    this.tasks.push(task);
    this.totalWeight += task.weight;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  setProgressHandler(handler: ProgressCallback): void {
    this.onProgress = handler;
  }

  /**
   * 获取内核实例
   */
  getKernelInstance(): KernelInstance | undefined {
    return this.kernelInstance;
  }

  async run(): Promise<BootResult> {
    this.completedWeight = 0;

    for (const task of this.tasks) {
      try {
        await task.execute();
        this.completedWeight += task.weight;

        if (this.onProgress) {
          const progress = Math.round((this.completedWeight / this.totalWeight) * 100);
          this.onProgress(task.name, progress);
        }
      } catch (error: unknown) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }

    return { success: true };
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }
    if (this.kernelInstance) {
      try {
        this.kernelInstance.exports.kernel_shutdown();
      } catch (e) {
        // 忽略
      }
    }
  }
}

export default BootController;
