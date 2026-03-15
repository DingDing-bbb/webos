/**
 * @fileoverview Filesystem Service - Virtual File System
 * @module @kernel/services/filesystem/FileSystemService
 */

import type { IService, ServiceStatus, Subscription } from '../types';
import type { FileStat, WatchEvent, WatchHandler, FileType, FileMode } from './types';

/**
 * FileSystemService provides virtual file system operations
 */
export class FileSystemService implements IService {
  readonly name = 'filesystem';
  readonly version = '1.0.0';
  
  private status: ServiceStatus = 'stopped';
  private listeners: Set<() => void> = new Set();
  private watchers = new Map<string, Set<WatchHandler>>();
  
  async init(): Promise<void> { this.status = 'running'; }
  async destroy(): Promise<void> { this.status = 'stopped'; }
  isReady(): boolean { return this.status === 'running'; }
  getStatus(): ServiceStatus { return this.status; }
  
  // File operations
  async read(path: string): Promise<string | null> {
    // Placeholder implementation
    return localStorage.getItem(`fs:${path}`);
  }
  
  async readBinary(path: string): Promise<Uint8Array | null> {
    const data = await this.read(path);
    if (!data) return null;
    return new TextEncoder().encode(data);
  }
  
  async write(path: string, content: string | Uint8Array): Promise<boolean> {
    const data = typeof content === 'string' ? content : new TextDecoder().decode(content);
    localStorage.setItem(`fs:${path}`, data);
    this.notifyWatchers(path, 'modify');
    return true;
  }
  
  async append(path: string, content: string): Promise<boolean> {
    const existing = await this.read(path) ?? '';
    return this.write(path, existing + content);
  }
  
  // Directory operations
  async mkdir(path: string, _recursive?: boolean): Promise<boolean> {
    // Placeholder implementation
    localStorage.setItem(`fs:dir:${path}`, JSON.stringify({ type: 'directory' }));
    return true;
  }
  
  async readdir(path: string): Promise<FileStat[]> {
    // Placeholder implementation
    const entries: FileStat[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`fs:${path}/`)) {
        entries.push({
          path: key.replace('fs:', ''),
          name: key.split('/').pop() ?? '',
          type: 'file',
          mode: 'rw-r--r--',
          size: localStorage.getItem(key)?.length ?? 0,
          uid: 'nobody',
          gid: 'nobody',
          atime: new Date(),
          mtime: new Date(),
          ctime: new Date(),
        });
      }
    }
    return entries;
  }
  
  async rmdir(path: string): Promise<boolean> {
    localStorage.removeItem(`fs:dir:${path}`);
    return true;
  }
  
  // Node operations
  async stat(path: string): Promise<FileStat | null> {
    const data = localStorage.getItem(`fs:${path}`);
    if (!data) return null;
    
    return {
      path,
      name: path.split('/').pop() ?? '',
      type: 'file',
      mode: 'rw-r--r--',
      size: data.length,
      uid: 'nobody',
      gid: 'nobody',
      atime: new Date(),
      mtime: new Date(),
      ctime: new Date(),
    };
  }
  
  exists(path: string): boolean {
    return localStorage.getItem(`fs:${path}`) !== null;
  }
  
  async delete(path: string): Promise<boolean> {
    localStorage.removeItem(`fs:${path}`);
    this.notifyWatchers(path, 'delete');
    return true;
  }
  
  async rename(oldPath: string, newPath: string): Promise<boolean> {
    const data = await this.read(oldPath);
    if (data === null) return false;
    
    await this.write(newPath, data);
    await this.delete(oldPath);
    return true;
  }
  
  async chmod(_path: string, _mode: FileMode): Promise<boolean> {
    // Placeholder - in browser we don't have real chmod
    return true;
  }
  
  // Watching
  watch(path: string, callback: WatchHandler): () => void {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, new Set());
    }
    this.watchers.get(path)!.add(callback);
    
    return () => {
      this.watchers.get(path)?.delete(callback);
    };
  }
  
  private notifyWatchers(path: string, type: 'create' | 'modify' | 'delete'): void {
    const event: WatchEvent = {
      type,
      path,
      timestamp: new Date(),
    };
    
    this.watchers.forEach((handlers, watchPath) => {
      if (path.startsWith(watchPath)) {
        handlers.forEach(h => { try { h(event); } catch { } });
      }
    });
  }
  
  // Path utilities
  resolve(...paths: string[]): string {
    return paths.join('/').replace(/\/+/g, '/');
  }
  
  dirname(path: string): string {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/') || '/';
  }
  
  basename(path: string): string {
    return path.split('/').pop() ?? '';
  }
  
  extname(path: string): string {
    const name = this.basename(path);
    const dotIndex = name.lastIndexOf('.');
    return dotIndex > 0 ? name.substring(dotIndex) : '';
  }
  
  subscribe(listener: () => void): Subscription {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const fileSystemService = new FileSystemService();
