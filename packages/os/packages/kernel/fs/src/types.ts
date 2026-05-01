// 文件系统类型定义

/** 用户角色 */
export type UserRole = 'root' | 'admin' | 'user' | 'guest';

/** 用户信息 */
export interface UserInfo {
  username: string;
  role: UserRole;
  isRoot: boolean;
  /** 用户所属的主要组 */
  group: string;
  /** 用户所属的附加组列表 */
  groups: string[];
}

/** 权限位 */
export interface PermissionBits {
  read: boolean;
  write: boolean;
  execute: boolean;
}

/** 完整权限 (owner, group, others) */
export type Permissions = [PermissionBits, PermissionBits, PermissionBits];

/** 文件系统节点 */
export interface FSNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  /** 文件所属的组 */
  group: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  content?: string;
  children?: Map<string, FSNode>;
}

/** 目录列表项 */
export interface DirEntry {
  name: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  /** 文件所属的组 */
  group: string;
  size: number;
  modifiedAt: Date;
}

/** 文件系统错误代码 */
export type FSErrorCode =
  | 'ENOENT' // 文件不存在
  | 'EACCES' // 权限拒绝
  | 'EEXIST' // 文件已存在
  | 'ENOTDIR' // 不是目录
  | 'EISDIR' // 是目录
  | 'ENOSPC' // 空间不足
  | 'EROFS' // 只读文件系统
  | 'EINVAL'; // 无效参数

/** 文件系统错误 */
export class FileSystemError extends Error {
  code: FSErrorCode;
  path: string;

  constructor(code: FSErrorCode, path: string, message?: string) {
    super(message || `${code}: ${path}`);
    this.code = code;
    this.path = path;
    this.name = 'FileSystemError';
  }
}

/** 文件系统统计信息 */
export interface FSStats {
  totalNodes: number;
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
}

/** 文件系统事件类型 */
export type FSEventType = 'create' | 'write' | 'delete' | 'rename' | 'chmod';

/** 文件系统事件 */
export interface FSEvent {
  type: FSEventType;
  path: string;
  timestamp: Date;
}

/** 文件系统事件监听器 */
export type FSEventListener = (event: FSEvent) => void;

/** 文件系统 API 接口 */
export interface FileSystemAPI {
  // 基本操作
  read(path: string): string | null;
  write(path: string, content: string): boolean;
  exists(path: string): boolean;
  delete(path: string): boolean;

  // 目录操作
  mkdir(path: string, recursive?: boolean): boolean;
  rmdir(path: string): boolean;
  readdir(path: string): DirEntry[];

  // 节点信息
  stat(path: string): FSNode | null;

  // 权限
  chmod(path: string, mode: string): boolean;
  chown(path: string, owner: string): boolean;
  chgrp(path: string, group: string): boolean;

  // 工具方法
  resolve(...paths: string[]): string;
  dirname(path: string): string;
  basename(path: string): string;
  extname(path: string): string;

  // 事件
  watch(path: string, listener: FSEventListener): () => void;

  // 统计
  stats(): FSStats;
}
