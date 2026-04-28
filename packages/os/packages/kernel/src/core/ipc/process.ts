/**
 * Process - 进程类
 * 
 * 封装 Worker 或 WebAssembly 实例，管理独立的线性内存和进程状态
 */

import { ProcessState, ProcessDescriptor, ProcessConfig, WorkerType, IPCMessage } from './types';

export class Process {
  // 进程元数据
  private pid: number;
  private parentPid: number;
  private name: string;
  private state: ProcessState = ProcessState.NEW;
  private priority: number;
  private memorySize: number;
  private startTime: number;
  private cpuTime: number = 0;
  private exitCode?: number;

  // Worker 实例
  private worker?: Worker;
  private wasmInstance?: WebAssembly.Instance;
  private iframe?: HTMLIFrameElement;
  private workerType: WorkerType;

  // 内存管理
  private memory?: WebAssembly.Memory;
  private heapPtr: number = 0;

  // IPC 消息队列
  private inbox: IPCMessage[] = [];
  private outbox: IPCMessage[] = [];

  // 回调函数
  private onStateChange?: (state: ProcessState) => void;
  private onMessage?: (message: IPCMessage) => void;

  constructor(pid: number, config: ProcessConfig) {
    this.pid = pid;
    this.parentPid = config.parentPid || 0;
    this.name = config.name;
    this.priority = config.priority || 5;
    this.memorySize = config.memorySize || 65536; // 64KB 默认内存
    this.startTime = Date.now();
    this.workerType = config.workerType;

    // 根据类型初始化
    this.initializeWorker(config);
  }

  /**
   * 根据配置初始化Worker
   */
  private initializeWorker(config: ProcessConfig): void {
    try {
      switch (config.workerType) {
        case 'web-worker':
          if (config.scriptUrl) {
            this.worker = new Worker(config.scriptUrl);
            this.setupWorkerMessageHandlers();
          } else {
            throw new Error('Web Worker requires scriptUrl');
          }
          break;

        case 'wasm-worker':
          this.initializeWasmWorker(config);
          break;

        case 'iframe-worker':
          this.initializeIframeWorker(config);
          break;

        default:
          throw new Error(`Unsupported worker type: ${config.workerType}`);
      }

      this.state = ProcessState.READY;
      this.notifyStateChange();
    } catch (error) {
      console.error(`[Process ${this.pid}] Failed to initialize worker:`, error);
      this.state = ProcessState.DEAD;
      this.exitCode = -1;
    }
  }

  /**
   * 初始化Wasm Worker
   */
  private async initializeWasmWorker(config: ProcessConfig): Promise<void> {
    if (!config.wasmModule) {
      throw new Error('Wasm Worker requires wasmModule');
    }

    // 创建内存实例
    this.memory = new WebAssembly.Memory({
      initial: Math.ceil(this.memorySize / 65536), // 以64KB页为单位
      maximum: 1024, // 最大1GB
    });

    // 实例化Wasm模块
    const importObject = {
      env: {
        memory: this.memory,
        abort: (msg: number, file: number, line: number, col: number) => {
          console.error(`[Process ${this.pid}] Wasm abort:`, { msg, file, line, col });
          this.exit(-1);
        },
      },
      // 系统调用接口
      syscall: this.createSyscallInterface(),
    };

    this.wasmInstance = await WebAssembly.instantiate(config.wasmModule, importObject);
    
    // 如果有_start函数，执行它
    if (this.wasmInstance.exports._start) {
      (this.wasmInstance.exports._start as Function)();
    }

    this.heapPtr = this.memorySize - 1024; // 从内存末尾开始分配堆
  }

  /**
   * 初始化Iframe Worker
   */
  private initializeIframeWorker(config: ProcessConfig): void {
    this.iframe = document.createElement('iframe');
    this.iframe.style.cssText = `
      position: absolute;
      width: 0;
      height: 0;
      border: 0;
      visibility: hidden;
    `;
    this.iframe.sandbox.add('allow-scripts', 'allow-same-origin');
    
    if (config.scriptUrl) {
      this.iframe.src = config.scriptUrl;
    }
    
    document.body.appendChild(this.iframe);
    
    // 监听消息
    window.addEventListener('message', (event) => {
      if (event.source === this.iframe?.contentWindow) {
        this.handleIncomingMessage(event.data);
      }
    });
  }

  /**
   * 设置Worker消息处理器
   */
  private setupWorkerMessageHandlers(): void {
    if (!this.worker) return;

    this.worker.onmessage = (event) => {
      this.handleIncomingMessage(event.data);
    };

    this.worker.onerror = (error) => {
      console.error(`[Process ${this.pid}] Worker error:`, error);
      this.exit(-1);
    };

    this.worker.onmessageerror = (error) => {
      console.error(`[Process ${this.pid}] Worker message error:`, error);
    };
  }

  /**
   * 创建系统调用接口
   */
  private createSyscallInterface(): any {
    return {
      // 内存分配
      malloc: (size: number): number => {
        const ptr = this.heapPtr;
        this.heapPtr += size;
        // 检查内存边界
        if (this.heapPtr >= this.memorySize) {
          throw new Error('Out of memory');
        }
        return ptr;
      },
      free: (ptr: number): void => {
        // 简单实现：不实际回收内存
        console.log(`[Process ${this.pid}] free called for ptr ${ptr}`);
      },
      // 简单的系统调用
      debug_log: (ptr: number, len: number): void => {
        if (this.memory) {
          const bytes = new Uint8Array(this.memory.buffer, ptr, len);
          const text = new TextDecoder().decode(bytes);
          console.log(`[Process ${this.pid}] ${text}`);
        }
      },
    };
  }

  /**
   * 处理传入消息
   */
  private handleIncomingMessage(data: any): void {
    const message: IPCMessage = {
      id: crypto.randomUUID(),
      sourcePid: this.pid,
      targetPid: 0, // 发送到内核
      type: data.type || 'message',
      data: data.data,
      timestamp: Date.now(),
      priority: data.priority || 5,
    };

    this.inbox.push(message);
    
    if (this.onMessage) {
      this.onMessage(message);
    }
  }

  /**
   * 发送消息到进程
   */
  sendMessage(message: IPCMessage): boolean {
    try {
      this.outbox.push(message);
      
      // 根据Worker类型发送消息
      switch (this.workerType) {
        case 'web-worker':
          if (this.worker) {
            this.worker.postMessage(message);
            return true;
          }
          break;

        case 'iframe-worker':
          if (this.iframe?.contentWindow) {
            this.iframe.contentWindow.postMessage(message, '*');
            return true;
          }
          break;

        case 'wasm-worker':
          // Wasm进程需要通过共享内存通信
          if (this.memory && message.data) {
            // 简化实现：直接调用Wasm导出函数
            if (this.wasmInstance?.exports.on_message) {
              (this.wasmInstance.exports.on_message as Function)(message);
              return true;
            }
          }
          break;
      }
      
      return false;
    } catch (error) {
      console.error(`[Process ${this.pid}] Failed to send message:`, error);
      return false;
    }
  }

  /**
   * 接收消息
   */
  receiveMessage(): IPCMessage | null {
    return this.inbox.shift() || null;
  }

  /**
   * 获取待发送消息
   */
  getPendingMessages(): IPCMessage[] {
    const messages = [...this.outbox];
    this.outbox = [];
    return messages;
  }

  /**
   * 开始执行进程
   */
  start(): boolean {
    if (this.state !== ProcessState.READY) {
      return false;
    }

    this.state = ProcessState.RUNNING;
    this.notifyStateChange();
    
    // 发送启动消息
    const startupMessage: IPCMessage = {
      id: crypto.randomUUID(),
      sourcePid: 0, // 内核
      targetPid: this.pid,
      type: 'startup',
      data: { pid: this.pid, parentPid: this.parentPid },
      timestamp: Date.now(),
      priority: 10,
    };
    
    return this.sendMessage(startupMessage);
  }

  /**
   * 终止进程
   */
  exit(code: number = 0): void {
    if (this.state === ProcessState.DEAD || this.state === ProcessState.ZOMBIE) {
      return;
    }

    this.exitCode = code;
    this.state = ProcessState.ZOMBIE;
    this.notifyStateChange();

    // 清理资源
    switch (this.workerType) {
      case 'web-worker':
        if (this.worker) {
          this.worker.terminate();
          this.worker = undefined;
        }
        break;

      case 'iframe-worker':
        if (this.iframe) {
          this.iframe.remove();
          this.iframe = undefined;
        }
        break;

      case 'wasm-worker':
        // Wasm实例不需要特殊清理
        this.wasmInstance = undefined;
        this.memory = undefined;
        break;
    }

    // 延迟清理，等待父进程读取退出码
    setTimeout(() => {
      if (this.state === ProcessState.ZOMBIE) {
        this.state = ProcessState.DEAD;
        this.notifyStateChange();
      }
    }, 5000);
  }

  /**
   * 强制终止进程
   */
  kill(): void {
    this.exit(-9); // SIGKILL
  }

  /**
   * 获取进程描述符
   */
  getDescriptor(): ProcessDescriptor {
    return {
      pid: this.pid,
      parentPid: this.parentPid,
      name: this.name,
      state: this.state,
      priority: this.priority,
      memorySize: this.memorySize,
      startTime: this.startTime,
      cpuTime: this.cpuTime,
      exitCode: this.exitCode,
    };
  }

  /**
   * 更新CPU时间
   */
  updateCpuTime(time: number): void {
    this.cpuTime += time;
  }

  /**
   * 设置状态变化回调
   */
  setOnStateChange(callback: (state: ProcessState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * 设置消息回调
   */
  setOnMessage(callback: (message: IPCMessage) => void): void {
    this.onMessage = callback;
  }

  /**
   * 获取进程ID
   */
  getPid(): number {
    return this.pid;
  }

  /**
   * 获取进程状态
   */
  getState(): ProcessState {
    return this.state;
  }

  /**
   * 获取退出码
   */
  getExitCode(): number | undefined {
    return this.exitCode;
  }

  /**
   * 检查进程是否存活
   */
  isAlive(): boolean {
    return this.state !== ProcessState.DEAD && this.state !== ProcessState.ZOMBIE;
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): number {
    return this.memorySize;
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }
}