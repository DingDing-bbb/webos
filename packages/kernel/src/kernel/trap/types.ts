/**
 * @fileoverview Trap (System Call) Types
 * @module @kernel/kernel/trap/types
 */

import type { SysCallNumber, SysCallHandler } from '../types';

export type { SysCallNumber, SysCallHandler } from '../types';

/**
 * System call definition
 */
export interface SysCallDefinition {
  number: SysCallNumber;
  name: string;
  handler: SysCallHandler;
  requiresAuth?: boolean;
  description?: string;
}

/**
 * Common syscall numbers (inspired by Linux/x86_64)
 */
export const SysCallNumbers = {
  // File operations
  READ: 0,
  WRITE: 1,
  OPEN: 2,
  CLOSE: 3,
  STAT: 4,
  FSTAT: 5,
  LSTAT: 6,
  POLL: 7,
  LSEEK: 8,
  
  // Process operations
  MMAP: 9,
  MPROTECT: 10,
  MUNMAP: 11,
  BRK: 12,
  RT_SIGACTION: 13,
  RT_SIGPROCMASK: 14,
  RT_SIGRETURN: 15,
  IOCTL: 16,
  PREAD64: 17,
  PWRITE64: 18,
  
  // Process control
  EXECVE: 59,
  EXIT: 60,
  WAIT4: 61,
  KILL: 62,
  CLONE: 56,
  FORK: 57,
  VFORK: 58,
  
  // File system
  MKDIR: 83,
  RMDIR: 84,
  UNLINK: 87,
  SYMLINK: 88,
  READLINK: 89,
  CHMOD: 90,
  FCHMOD: 91,
  CHOWN: 92,
  FCHOWN: 93,
  
  // Network
  SOCKET: 41,
  CONNECT: 42,
  ACCEPT: 43,
  SENDTO: 44,
  RECVFROM: 45,
  SENDMSG: 46,
  RECVMSG: 47,
  SHUTDOWN: 48,
  BIND: 49,
  LISTEN: 50,
  GETSOCKNAME: 51,
  GETPEERNAME: 52,
  
  // System info
  GETUID: 102,
  GETGID: 104,
  GETEUID: 107,
  GETEGID: 108,
  SETUID: 105,
  SETGID: 106,
  
  // Time
  TIME: 201,
  CLOCK_GETTIME: 228,
  CLOCK_SETTIME: 227,
  
  // Custom syscalls (0x1000+)
  WINDOW_OPEN: 0x1000,
  WINDOW_CLOSE: 0x1001,
  WINDOW_MINIMIZE: 0x1002,
  WINDOW_MAXIMIZE: 0x1003,
  NOTIFY_SHOW: 0x1010,
  CONFIG_GET: 0x1020,
  CONFIG_SET: 0x1021,
} as const;
