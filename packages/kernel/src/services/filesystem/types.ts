/**
 * @fileoverview Filesystem Service Types
 * @module @kernel/services/filesystem/types
 */

/**
 * Filesystem node types
 */
export type FileType = 'file' | 'directory' | 'symlink' | 'device' | 'socket';

/**
 * File permissions (Unix-style)
 */
export type FileMode = string; // e.g., 'rwxr-xr-x'

/**
 * File metadata
 */
export interface FileStat {
  path: string;
  name: string;
  type: FileType;
  mode: FileMode;
  size: number;
  uid: string;
  gid: string;
  atime: Date;
  mtime: Date;
  ctime: Date;
}

/**
 * Watch event types
 */
export type WatchEventType = 'create' | 'modify' | 'delete' | 'rename';

/**
 * Watch event
 */
export interface WatchEvent {
  type: WatchEventType;
  path: string;
  timestamp: Date;
}

/**
 * Watch handler
 */
export type WatchHandler = (event: WatchEvent) => void;
