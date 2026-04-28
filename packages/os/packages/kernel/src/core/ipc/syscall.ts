/**
 * SyscallHandler - 系统调用处理器
 * 
 * 注册和处理系统调用，对接现有虚拟文件系统和其他系统服务
 */

import { SyscallNumber, SyscallParams, SyscallResult, SyscallHandler as SyscallHandlerType } from './types';

export class SyscallHandler {
  private handlers: Map<SyscallNumber, SyscallHandlerType> = new Map();
  private fileSystem: any; // 对接现有的虚拟文件系统
  private timeManager: any; // 时间管理器
  private debugEnabled: boolean = true;

  constructor(options?: {
    fileSystem?: any;
    timeManager?: any;
    debugEnabled?: boolean;
  }) {
    this.fileSystem = options?.fileSystem;
    this.timeManager = options?.timeManager;
    this.debugEnabled = options?.debugEnabled ?? true;
    
    this.registerDefaultHandlers();
  }

  /**
   * 注册默认的系统调用处理器
   */
  private registerDefaultHandlers(): void {
    // 文件系统调用
    this.register(SyscallNumber.FS_READ, this.handleFsRead.bind(this));
    this.register(SyscallNumber.FS_WRITE, this.handleFsWrite.bind(this));
    this.register(SyscallNumber.FS_OPEN, this.handleFsOpen.bind(this));
    this.register(SyscallNumber.FS_CLOSE, this.handleFsClose.bind(this));
    this.register(SyscallNumber.FS_STAT, this.handleFsStat.bind(this));
    this.register(SyscallNumber.FS_UNLINK, this.handleFsUnlink.bind(this));
    this.register(SyscallNumber.FS_MKDIR, this.handleFsMkdir.bind(this));
    this.register(SyscallNumber.FS_RMDIR, this.handleFsRmdir.bind(this));

    // 时间调用
    this.register(SyscallNumber.TIME_NOW, this.handleTimeNow.bind(this));
    this.register(SyscallNumber.TIME_SLEEP, this.handleTimeSleep.bind(this));
    this.register(SyscallNumber.TIME_ALARM, this.handleTimeAlarm.bind(this));

    // 调试调用
    this.register(SyscallNumber.DEBUG_LOG, this.handleDebugLog.bind(this));
    this.register(SyscallNumber.DEBUG_BREAK, this.handleDebugBreak.bind(this));

    // 占位处理器（暂未实现）
    this.registerPlaceholder(SyscallNumber.PROCESS_FORK, 'process.fork');
    this.registerPlaceholder(SyscallNumber.PROCESS_EXEC, 'process.exec');
    this.registerPlaceholder(SyscallNumber.PROCESS_EXIT, 'process.exit');
    this.registerPlaceholder(SyscallNumber.PROCESS_WAIT, 'process.wait');
    this.registerPlaceholder(SyscallNumber.PROCESS_KILL, 'process.kill');
    
    this.registerPlaceholder(SyscallNumber.MEMORY_ALLOC, 'memory.alloc');
    this.registerPlaceholder(SyscallNumber.MEMORY_FREE, 'memory.free');
    this.registerPlaceholder(SyscallNumber.MEMORY_PROTECT, 'memory.protect');
    
    this.registerPlaceholder(SyscallNumber.IO_READ, 'io.read');
    this.registerPlaceholder(SyscallNumber.IO_WRITE, 'io.write');
    
    this.registerPlaceholder(SyscallNumber.NET_SOCKET, 'net.socket');
    this.registerPlaceholder(SyscallNumber.NET_CONNECT, 'net.connect');
    
    this.registerPlaceholder(SyscallNumber.IPC_SEND, 'ipc.send');
    this.registerPlaceholder(SyscallNumber.IPC_RECEIVE, 'ipc.receive');
  }

  /**
   * 注册系统调用处理器
   */
  register(syscall: SyscallNumber, handler: SyscallHandlerType): void {
    this.handlers.set(syscall, handler);
    if (this.debugEnabled) {
      console.log(`[SyscallHandler] Registered syscall 0x${syscall.toString(16)}`);
    }
  }

  /**
   * 注册占位处理器（返回未实现错误）
   */
  private registerPlaceholder(syscall: SyscallNumber, name: string): void {
    this.register(syscall, async () => ({
      success: false,
      error: `System call '${name}' not implemented yet`,
    }));
  }

  /**
   * 处理系统调用
   */
  async handle(syscall: SyscallNumber, params: SyscallParams = {}): Promise<SyscallResult> {
    const handler = this.handlers.get(syscall);
    
    if (!handler) {
      return {
        success: false,
        error: `Unknown system call: 0x${syscall.toString(16)}`,
      };
    }

    try {
      if (this.debugEnabled) {
        console.log(`[SyscallHandler] Handling syscall 0x${syscall.toString(16)}:`, params);
      }
      
      const result = await handler(params);
      
      if (this.debugEnabled) {
        console.log(`[SyscallHandler] Syscall result:`, result);
      }
      
      return result;
    } catch (error: any) {
      console.error(`[SyscallHandler] Error handling syscall 0x${syscall.toString(16)}:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * 获取所有注册的系统调用
   */
  getRegisteredSyscalls(): { syscall: SyscallNumber; name: string }[] {
    const syscalls: { syscall: SyscallNumber; name: string }[] = [];
    
    this.handlers.forEach((_, syscall) => {
      const name = this.getSyscallName(syscall);
      syscalls.push({ syscall, name });
    });
    
    return syscalls.sort((a, b) => a.syscall - b.syscall);
  }

  /**
   * 获取系统调用名称
   */
  private getSyscallName(syscall: SyscallNumber): string {
    const name = SyscallNumber[syscall];
    return name || `0x${syscall.toString(16)}`;
  }

  // ============================================================================
  // 文件系统调用处理器
  // ============================================================================

  private async handleFsRead(params: SyscallParams): Promise<SyscallResult> {
    const { path, offset = 0, length } = params;
    
    if (!path || typeof path !== 'string') {
      return { success: false, error: 'Invalid path parameter' };
    }
    
    if (!this.fileSystem) {
      return { success: false, error: 'File system not available' };
    }
    
    try {
      if (!this.fileSystem.read) {
        return { success: false, error: 'File system read method not available' };
      }
      
      const content = this.fileSystem.read(path);
      
      if (content === null || content === undefined) {
        return { success: false, error: 'File not found or cannot be read' };
      }
      
      // 处理偏移量和长度
      const data = typeof content === 'string' ? content : String(content);
      const start = Math.min(offset, data.length);
      const end = length ? Math.min(start + length, data.length) : data.length;
      
      return {
        success: true,
        data: data.substring(start, end),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async handleFsWrite(params: SyscallParams): Promise<SyscallResult> {
    const { path, data, append = false } = params;
    
    if (!path || typeof path !== 'string') {
      return { success: false, error: 'Invalid path parameter' };
    }
    
    if (data === undefined) {
      return { success: false, error: 'No data to write' };
    }
    
    if (!this.fileSystem) {
      return { success: false, error: 'File system not available' };
    }
    
    try {
      if (!this.fileSystem.write) {
        return { success: false, error: 'File system write method not available' };
      }
      
      const content = typeof data === 'string' ? data : String(data);
      const result = this.fileSystem.write(path, content, append);
      
      return {
        success: result === true,
        data: result,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async handleFsOpen(params: SyscallParams): Promise<SyscallResult> {
    const { path, mode = 'r' } = params;
    
    if (!path || typeof path !== 'string') {
      return { success: false, error: 'Invalid path parameter' };
    }
    
    if (!this.fileSystem) {
      return { success: false, error: 'File system not available' };
    }
    
    try {
      // 简单实现：检查文件是否存在
      const exists = this.fileSystem.exists ? this.fileSystem.exists(path) : false;
      
      if (!exists && mode.includes('r')) {
        return { success: false, error: 'File not found' };
      }
      
      // 返回一个文件描述符（简化实现）
      const fd = `fd_${Date.now()}_${Math.random().toString(36).substr(2)}`;
      
      return {
        success: true,
        data: { fd, path, mode },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async handleFsClose(params: SyscallParams): Promise<SyscallResult> {
    const { fd } = params;
    
    if (!fd || typeof fd !== 'string') {
      return { success: false, error: 'Invalid file descriptor' };
    }
    
    // 简化实现：总是成功
    return { success: true };
  }

  private async handleFsStat(params: SyscallParams): Promise<SyscallResult> {
    const { path } = params;
    
    if (!path || typeof path !== 'string') {
      return { success: false, error: 'Invalid path parameter' };
    }
    
    if (!this.fileSystem) {
      return { success: false, error: 'File system not available' };
    }
    
    try {
      let stat: any = {};
      
      if (this.fileSystem.stat) {
        stat = this.fileSystem.stat(path) || {};
      }
      
      // 确保有基本的stat信息
      const now = Date.now();
      stat = {
        exists: this.fileSystem.exists ? this.fileSystem.exists(path) : false,
        isFile: true, // 简化假设
        isDirectory: false,
        size: 0,
        createdAt: now,
        modifiedAt: now,
        ...stat,
      };
      
      return {
        success: true,
        data: stat,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async handleFsUnlink(params: SyscallParams): Promise<SyscallResult> {
    const { path } = params;
    
    if (!path || typeof path !== 'string') {
      return { success: false, error: 'Invalid path parameter' };
    }
    
    if (!this.fileSystem) {
      return { success: false, error: 'File system not available' };
    }
    
    try {
      if (!this.fileSystem.delete && !this.fileSystem.remove) {
        return { success: false, error: 'File system delete method not available' };
      }
      
      const result = this.fileSystem.delete 
        ? this.fileSystem.delete(path)
        : this.fileSystem.remove(path);
      
      return {
        success: result === true,
        data: result,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async handleFsMkdir(params: SyscallParams): Promise<SyscallResult> {
    const { path, recursive = false } = params;
    
    if (!path || typeof path !== 'string') {
      return { success: false, error: 'Invalid path parameter' };
    }
    
    if (!this.fileSystem) {
      return { success: false, error: 'File system not available' };
    }
    
    try {
      if (!this.fileSystem.mkdir) {
        return { success: false, error: 'File system mkdir method not available' };
      }
      
      const result = this.fileSystem.mkdir(path, recursive);
      
      return {
        success: result === true,
        data: result,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async handleFsRmdir(params: SyscallParams): Promise<SyscallResult> {
    // 简化实现：使用unlink
    return this.handleFsUnlink(params);
  }

  // ============================================================================
  // 时间调用处理器
  // ============================================================================

  private async handleTimeNow(params: SyscallParams): Promise<SyscallResult> {
    const now = this.timeManager 
      ? (this.timeManager.getCurrent ? this.timeManager.getCurrent() : Date.now())
      : Date.now();
    
    return {
      success: true,
      data: {
        timestamp: now,
        isoString: new Date(now).toISOString(),
        milliseconds: now,
      },
    };
  }

  private async handleTimeSleep(params: SyscallParams): Promise<SyscallResult> {
    const { milliseconds } = params;
    const ms = Number(milliseconds);
    
    if (isNaN(ms) || ms < 0) {
      return { success: false, error: 'Invalid sleep duration' };
    }
    
    if (ms > 60000) {
      return { success: false, error: 'Sleep duration too long (max 60 seconds)' };
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, ms);
    });
  }

  private async handleTimeAlarm(params: SyscallParams): Promise<SyscallResult> {
    const { timestamp, callbackId } = params;
    const alarmTime = Number(timestamp);
    
    if (isNaN(alarmTime) || alarmTime < Date.now()) {
      return { success: false, error: 'Invalid alarm time' };
    }
    
    if (!callbackId || typeof callbackId !== 'string') {
      return { success: false, error: 'Invalid callback identifier' };
    }
    
    // 简化实现：设置定时器
    const delay = alarmTime - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        // 这里应该触发回调，但简化实现
        console.log(`[SyscallHandler] Alarm triggered for callback ${callbackId}`);
      }, delay);
    }
    
    return {
      success: true,
      data: { alarmId: `alarm_${callbackId}_${Date.now()}` },
    };
  }

  // ============================================================================
  // 调试调用处理器
  // ============================================================================

  private async handleDebugLog(params: SyscallParams): Promise<SyscallResult> {
    const { message, level = 'info' } = params;
    
    if (message === undefined) {
      return { success: false, error: 'No message to log' };
    }
    
    const logMessage = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    
    const levels = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
      log: console.log,
    };
    
    const logger = levels[level as keyof typeof levels] || console.log;
    logger(`[Process Debug] ${logMessage}`);
    
    return { success: true };
  }

  private async handleDebugBreak(params: SyscallParams): Promise<SyscallResult> {
    console.warn('[SyscallHandler] Debug break requested:', params);
    
    // 在开发模式下触发调试器
    if (process.env.NODE_ENV === 'development') {
      debugger; // eslint-disable-line no-debugger
    }
    
    return { success: true };
  }

  // ============================================================================
  // 工具方法
  // ============================================================================

  /**
   * 设置文件系统接口
   */
  setFileSystem(fs: any): void {
    this.fileSystem = fs;
  }

  /**
   * 设置时间管理器
   */
  setTimeManager(tm: any): void {
    this.timeManager = tm;
  }

  /**
   * 启用/禁用调试日志
   */
  setDebugEnabled(enabled: boolean): void {
    this.debugEnabled = enabled;
  }
}