/**
 * IPC (进程间通信) 类型定义
 */

// 系统调用号枚举
export enum SyscallNumber {
  // 文件系统调用 (0x0100-0x01FF)
  FS_READ = 0x0100,
  FS_WRITE = 0x0101,
  FS_OPEN = 0x0102,
  FS_CLOSE = 0x0103,
  FS_SEEK = 0x0104,
  FS_STAT = 0x0105,
  FS_UNLINK = 0x0106,
  FS_MKDIR = 0x0107,
  FS_RMDIR = 0x0108,
  
  // 进程管理调用 (0x0200-0x02FF)
  PROCESS_FORK = 0x0200,
  PROCESS_EXEC = 0x0201,
  PROCESS_EXIT = 0x0202,
  PROCESS_WAIT = 0x0203,
  PROCESS_KILL = 0x0204,
  PROCESS_GETPID = 0x0205,
  PROCESS_GETPPID = 0x0206,
  
  // 内存管理调用 (0x0300-0x03FF)
  MEMORY_ALLOC = 0x0300,
  MEMORY_FREE = 0x0301,
  MEMORY_PROTECT = 0x0302,
  MEMORY_MAP = 0x0303,
  MEMORY_UNMAP = 0x0304,
  
  // 时间调用 (0x0400-0x04FF)
  TIME_NOW = 0x0400,
  TIME_SLEEP = 0x0401,
  TIME_ALARM = 0x0402,
  
  // 设备I/O调用 (0x0500-0x05FF)
  IO_READ = 0x0500,
  IO_WRITE = 0x0501,
  
  // 网络调用 (0x0600-0x06FF)
  NET_SOCKET = 0x0600,
  NET_CONNECT = 0x0601,
  NET_BIND = 0x0602,
  NET_LISTEN = 0x0603,
  NET_ACCEPT = 0x0604,
  NET_SEND = 0x0605,
  NET_RECV = 0x0606,
  
  // 调试调用 (0x0700-0x07FF)
  DEBUG_LOG = 0x0700,
  DEBUG_BREAK = 0x0701,
  
  // IPC调用 (0x0800-0x08FF)
  IPC_SEND = 0x0800,
  IPC_RECEIVE = 0x0801,
  IPC_CREATE_CHANNEL = 0x0802,
  
  // 通知调用 (0x0900-0x09FF)
  NOTIFY_SHOW = 0x0900,
  NOTIFY_CLOSE = 0x0901,
  NOTIFY_LIST = 0x0902,
}

// 进程状态
export enum ProcessState {
  NEW = 'new',        // 新建
  READY = 'ready',    // 就绪
  RUNNING = 'running', // 运行中
  BLOCKED = 'blocked', // 阻塞
  ZOMBIE = 'zombie',  // 僵尸（已终止但资源未释放）
  DEAD = 'dead',      // 死亡（资源已释放）
}

// IPC消息结构
export interface IPCMessage {
  id: string;
  sourcePid: number;      // 源进程ID
  targetPid: number;      // 目标进程ID
  type: string;           // 消息类型
  data: any;              // 消息数据
  timestamp: number;      // 时间戳
  priority: number;       // 优先级（0-10，默认5）
}

// 系统调用参数
export interface SyscallParams {
  [key: string]: any;
}

// 系统调用结果
export interface SyscallResult {
  success: boolean;
  data?: any;
  error?: string;
}

// 进程描述符
export interface ProcessDescriptor {
  pid: number;                    // 进程ID
  parentPid: number;              // 父进程ID
  name: string;                   // 进程名
  state: ProcessState;            // 当前状态
  priority: number;               // 优先级（0-10，默认5）
  memorySize: number;             // 内存使用量（字节）
  startTime: number;              // 启动时间戳
  cpuTime: number;                // 累计CPU时间（毫秒）
  exitCode?: number;              // 退出码（如果已终止）
}

// 系统调用处理器类型
export type SyscallHandler = (params: SyscallParams) => Promise<SyscallResult>;

// Worker类型（支持Web Worker和Wasm Worker）
export type WorkerType = 'web-worker' | 'wasm-worker' | 'iframe-worker';

// 进程配置
export interface ProcessConfig {
  name: string;                   // 进程名
  workerType: WorkerType;         // Worker类型
  scriptUrl?: string;             // 脚本URL（Web Worker用）
  wasmModule?: WebAssembly.Module; // Wasm模块（Wasm Worker用）
  memorySize?: number;            // 初始内存大小（字节）
  priority?: number;              // 优先级（0-10，默认5）
  parentPid?: number;             // 父进程ID（默认0=内核）
}