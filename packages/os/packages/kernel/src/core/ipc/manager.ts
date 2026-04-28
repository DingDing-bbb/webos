/**
 * ProcessManager - 进程管理器
 * 
 * 维护进程表，提供进程创建、销毁、调度等功能
 * 实现简单的时间片轮转调度（用 setInterval 模拟时钟中断）
 */

import { Process } from './process';
import { SyscallHandler } from './syscall';
import { 
  ProcessDescriptor, 
  ProcessConfig, 
  ProcessState,
  IPCMessage,
  SyscallNumber,
} from './types';

export class ProcessManager {
  private processes: Map<number, Process> = new Map();
  private nextPid: number = 1; // PID从1开始，0保留给内核
  private schedulerInterval?: NodeJS.Timeout;
  private schedulerIntervalMs: number = 100; // 时间片长度（毫秒）
  private currentPid: number = 0; // 当前运行的进程PID
  private readyQueue: number[] = []; // 就绪队列（FIFO）
  private blockedProcesses: Set<number> = new Set(); // 阻塞的进程
  private syscallHandler: SyscallHandler;
  private messageHandlers: Map<string, (message: IPCMessage) => void> = new Map();
  private lastSchedulerRun: number = Date.now();

  constructor(syscallHandler?: SyscallHandler) {
    this.syscallHandler = syscallHandler || new SyscallHandler();
    this.startScheduler();
  }

  /**
   * 创建新进程
   */
  spawn(config: ProcessConfig): { pid: number; success: boolean; error?: string } {
    try {
      const pid = this.nextPid++;
      
      // 创建进程实例
      const process = new Process(pid, config);
      
      // 设置进程回调
      process.setOnStateChange((state) => {
        this.handleProcessStateChange(pid, state);
      });
      
      process.setOnMessage((message) => {
        this.handleProcessMessage(pid, message);
      });
      
      // 添加到进程表
      this.processes.set(pid, process);
      
      // 添加到就绪队列
      this.readyQueue.push(pid);
      
      console.log(`[ProcessManager] Spawned process ${pid}: ${config.name}`);
      
      return { pid, success: true };
    } catch (error: any) {
      console.error(`[ProcessManager] Failed to spawn process:`, error);
      return { pid: -1, success: false, error: error.message };
    }
  }

  /**
   * 终止进程
   */
  kill(pid: number, signal: number = 15): boolean { // 默认SIGTERM
    const process = this.processes.get(pid);
    
    if (!process) {
      console.warn(`[ProcessManager] Cannot kill non-existent process ${pid}`);
      return false;
    }
    
    if (!process.isAlive()) {
      console.warn(`[ProcessManager] Process ${pid} is already dead`);
      return false;
    }
    
    console.log(`[ProcessManager] Killing process ${pid} with signal ${signal}`);
    
    // 发送终止信号
    const killMessage: IPCMessage = {
      id: crypto.randomUUID(),
      sourcePid: 0, // 内核
      targetPid: pid,
      type: 'signal',
      data: { signal, timestamp: Date.now() },
      timestamp: Date.now(),
      priority: 10,
    };
    
    process.sendMessage(killMessage);
    
    // 如果是强制终止，立即调用exit
    if (signal === 9) { // SIGKILL
      process.kill();
    } else {
      // 给进程一些时间正常退出
      setTimeout(() => {
        if (process.isAlive()) {
          console.log(`[ProcessManager] Process ${pid} didn't respond to signal ${signal}, forcing kill`);
          process.kill();
        }
      }, 1000);
    }
    
    return true;
  }

  /**
   * 等待进程结束
   */
  async wait(pid: number, timeout: number = 30000): Promise<{ success: boolean; exitCode?: number; error?: string }> {
    const process = this.processes.get(pid);
    
    if (!process) {
      return { success: false, error: `Process ${pid} not found` };
    }
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkInterval = setInterval(() => {
        const process = this.processes.get(pid);
        
        if (!process) {
          clearInterval(checkInterval);
          resolve({ success: false, error: `Process ${pid} removed` });
          return;
        }
        
        const state = process.getState();
        
        if (state === ProcessState.DEAD || state === ProcessState.ZOMBIE) {
          clearInterval(checkInterval);
          resolve({ 
            success: true, 
            exitCode: process.getExitCode() 
          });
          return;
        }
        
        // 检查超时
        if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          resolve({ 
            success: false, 
            error: `Timeout waiting for process ${pid}` 
          });
        }
      }, 100);
    });
  }

  /**
   * 获取进程信息
   */
  getProcessInfo(pid: number): ProcessDescriptor | null {
    const process = this.processes.get(pid);
    return process ? process.getDescriptor() : null;
  }

  /**
   * 获取所有进程信息
   */
  getAllProcesses(): ProcessDescriptor[] {
    const descriptors: ProcessDescriptor[] = [];
    
    this.processes.forEach((process) => {
      descriptors.push(process.getDescriptor());
    });
    
    return descriptors.sort((a, b) => a.pid - b.pid);
  }

  /**
   * 发送IPC消息
   */
  sendMessage(message: IPCMessage): boolean {
    const { targetPid } = message;
    
    if (targetPid === 0) {
      // 发送给内核的消息，直接处理
      this.handleKernelMessage(message);
      return true;
    }
    
    const process = this.processes.get(targetPid);
    
    if (!process) {
      console.warn(`[ProcessManager] Cannot send message to non-existent process ${targetPid}`);
      return false;
    }
    
    if (!process.isAlive()) {
      console.warn(`[ProcessManager] Cannot send message to dead process ${targetPid}`);
      return false;
    }
    
    return process.sendMessage(message);
  }

  /**
   * 接收来自特定进程的消息
   */
  receiveMessage(sourcePid?: number): IPCMessage | null {
    if (sourcePid !== undefined) {
      const process = this.processes.get(sourcePid);
      return process ? process.receiveMessage() : null;
    }
    
    // 检查所有进程的消息
    for (const [pid, process] of this.processes) {
      const message = process.receiveMessage();
      if (message) {
        return message;
      }
    }
    
    return null;
  }

  /**
   * 注册消息处理器
   */
  registerMessageHandler(type: string, handler: (message: IPCMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * 获取系统调用处理器
   */
  getSyscallHandler(): SyscallHandler {
    return this.syscallHandler;
  }

  /**
   * 开始调度器
   */
  private startScheduler(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }
    
    this.schedulerInterval = setInterval(() => {
      this.schedule();
    }, this.schedulerIntervalMs);
    
    console.log(`[ProcessManager] Scheduler started with ${this.schedulerIntervalMs}ms intervals`);
  }

  /**
   * 停止调度器
   */
  stopScheduler(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = undefined;
      console.log('[ProcessManager] Scheduler stopped');
    }
  }

  /**
   * 调度算法（简单时间片轮转）
   */
  private schedule(): void {
    const now = Date.now();
    const delta = now - this.lastSchedulerRun;
    this.lastSchedulerRun = now;
    
    // 更新当前进程的CPU时间
    if (this.currentPid !== 0) {
      const currentProcess = this.processes.get(this.currentPid);
      if (currentProcess) {
        currentProcess.updateCpuTime(delta);
      }
    }
    
    // 清理死亡进程
    this.cleanupDeadProcesses();
    
    // 更新就绪队列
    this.updateReadyQueue();
    
    // 如果没有就绪进程，选择空转（PID 0）
    if (this.readyQueue.length === 0) {
      this.currentPid = 0;
      return;
    }
    
    // 选择下一个进程（FIFO）
    const nextPid = this.readyQueue.shift()!;
    
    // 如果下一个进程和当前进程相同，放回队列并选择另一个
    if (nextPid === this.currentPid && this.readyQueue.length > 0) {
      this.readyQueue.push(nextPid);
      this.currentPid = this.readyQueue.shift()!;
    } else {
      this.currentPid = nextPid;
    }
    
    // 将当前进程放回队列末尾（时间片轮转）
    this.readyQueue.push(this.currentPid);
    
    // 启动当前进程（如果还没运行）
    const currentProcess = this.processes.get(this.currentPid);
    if (currentProcess && currentProcess.getState() === ProcessState.READY) {
      currentProcess.start();
    }
    
    // 记录调度决策（调试用）
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[ProcessManager] Scheduled process ${this.currentPid} to run`);
    }
  }

  /**
   * 清理死亡进程
   */
  private cleanupDeadProcesses(): void {
    const deadPids: number[] = [];
    
    this.processes.forEach((process, pid) => {
      if (process.getState() === ProcessState.DEAD) {
        deadPids.push(pid);
      }
    });
    
    deadPids.forEach((pid) => {
      this.processes.delete(pid);
      
      // 从就绪队列中移除
      const index = this.readyQueue.indexOf(pid);
      if (index !== -1) {
        this.readyQueue.splice(index, 1);
      }
      
      // 从阻塞集合中移除
      this.blockedProcesses.delete(pid);
      
      console.log(`[ProcessManager] Cleaned up dead process ${pid}`);
    });
  }

  /**
   * 更新就绪队列
   */
  private updateReadyQueue(): void {
    // 遍历所有进程，将就绪状态的进程加入队列（如果不在队列中）
    this.processes.forEach((process, pid) => {
      if (process.getState() === ProcessState.READY && 
          !this.readyQueue.includes(pid) && 
          !this.blockedProcesses.has(pid)) {
        this.readyQueue.push(pid);
      }
    });
    
    // 从队列中移除阻塞或死亡的进程
    this.readyQueue = this.readyQueue.filter((pid) => {
      const process = this.processes.get(pid);
      return process && 
             process.isAlive() && 
             process.getState() === ProcessState.READY &&
             !this.blockedProcesses.has(pid);
    });
  }

  /**
   * 处理进程状态变化
   */
  private handleProcessStateChange(pid: number, state: ProcessState): void {
    console.log(`[ProcessManager] Process ${pid} state changed to ${state}`);
    
    switch (state) {
      case ProcessState.READY:
        // 确保进程在就绪队列中
        if (!this.readyQueue.includes(pid) && !this.blockedProcesses.has(pid)) {
          this.readyQueue.push(pid);
        }
        break;
        
      case ProcessState.BLOCKED:
        this.blockedProcesses.add(pid);
        // 从就绪队列中移除
        const index = this.readyQueue.indexOf(pid);
        if (index !== -1) {
          this.readyQueue.splice(index, 1);
        }
        break;
        
      case ProcessState.ZOMBIE:
        // 通知父进程
        const process = this.processes.get(pid);
        if (process) {
          const parentPid = process.getDescriptor().parentPid;
          if (parentPid > 0) {
            const message: IPCMessage = {
              id: crypto.randomUUID(),
              sourcePid: pid,
              targetPid: parentPid,
              type: 'child_exit',
              data: { 
                childPid: pid, 
                exitCode: process.getExitCode() 
              },
              timestamp: Date.now(),
              priority: 5,
            };
            this.sendMessage(message);
          }
        }
        break;
        
      case ProcessState.DEAD:
        this.blockedProcesses.delete(pid);
        // 进程将在下一次cleanup中被移除
        break;
    }
  }

  /**
   * 处理进程消息
   */
  private handleProcessMessage(pid: number, message: IPCMessage): void {
    // 检查是否有注册的消息处理器
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
      return;
    }
    
    // 默认处理：如果消息目标是其他进程，转发它
    if (message.targetPid !== 0 && message.targetPid !== pid) {
      this.sendMessage(message);
      return;
    }
    
    // 如果是发送给内核的消息
    if (message.targetPid === 0) {
      this.handleKernelMessage(message);
      return;
    }
    
    // 未知消息类型，记录日志
    console.log(`[ProcessManager] Unhandled message from process ${pid}:`, message);
  }

  /**
   * 处理内核消息
   */
  private handleKernelMessage(message: IPCMessage): void {
    const { type, data, sourcePid } = message;
    
    console.log(`[ProcessManager] Kernel message from process ${sourcePid}: ${type}`, data);
    
    // 处理系统调用请求
    if (type === 'syscall') {
      this.handleSyscallRequest(sourcePid, data);
      return;
    }
    
    // 其他内核消息类型
    switch (type) {
      case 'ready':
        // 进程准备好运行
        const process = this.processes.get(sourcePid);
        if (process && process.getState() === ProcessState.NEW) {
          process.start();
        }
        break;
        
      case 'block':
        // 进程请求阻塞
        this.blockedProcesses.add(sourcePid);
        const idx = this.readyQueue.indexOf(sourcePid);
        if (idx !== -1) {
          this.readyQueue.splice(idx, 1);
        }
        break;
        
      case 'unblock':
        // 进程请求解除阻塞
        this.blockedProcesses.delete(sourcePid);
        if (!this.readyQueue.includes(sourcePid)) {
          this.readyQueue.push(sourcePid);
        }
        break;
        
      case 'exit':
        // 进程请求退出
        const exitCode = data?.exitCode || 0;
        const proc = this.processes.get(sourcePid);
        if (proc) {
          proc.exit(exitCode);
        }
        break;
    }
  }

  /**
   * 处理系统调用请求
   */
  private async handleSyscallRequest(pid: number, data: any): Promise<void> {
    const { syscall, params, callId } = data;
    
    if (syscall === undefined || callId === undefined) {
      console.error(`[ProcessManager] Invalid syscall request from process ${pid}:`, data);
      return;
    }
    
    try {
      // 执行系统调用
      const result = await this.syscallHandler.handle(syscall, params);
      
      // 发送响应
      const response: IPCMessage = {
        id: crypto.randomUUID(),
        sourcePid: 0,
        targetPid: pid,
        type: 'syscall_response',
        data: { callId, result },
        timestamp: Date.now(),
        priority: 5,
      };
      
      const process = this.processes.get(pid);
      if (process) {
        process.sendMessage(response);
      }
    } catch (error: any) {
      console.error(`[ProcessManager] Syscall handling error for process ${pid}:`, error);
      
      // 发送错误响应
      const errorResponse: IPCMessage = {
        id: crypto.randomUUID(),
        sourcePid: 0,
        targetPid: pid,
        type: 'syscall_response',
        data: { 
          callId, 
          result: { 
            success: false, 
            error: error.message || 'Unknown error' 
          } 
        },
        timestamp: Date.now(),
        priority: 5,
      };
      
      const process = this.processes.get(pid);
      if (process) {
        process.sendMessage(errorResponse);
      }
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.stopScheduler();
    
    // 终止所有进程
    this.processes.forEach((process, pid) => {
      process.kill();
    });
    
    this.processes.clear();
    this.readyQueue = [];
    this.blockedProcesses.clear();
    this.messageHandlers.clear();
    
    console.log('[ProcessManager] Destroyed');
  }
}