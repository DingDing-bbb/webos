/**
 * IPC (进程间通信) 模块导出
 */

// 类型导出
export * from './types';

// 类导出
export { Process } from './process';
export { ProcessManager } from './manager';
export { SyscallHandler } from './syscall';

// 常量
export { SyscallNumber, ProcessState } from './types';