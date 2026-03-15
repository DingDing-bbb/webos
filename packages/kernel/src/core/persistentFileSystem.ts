/**
 * 持久化文件系统
 * - 文件和目录存储在加密的 SQL 数据库中
 * - 与用户系统共用同一个加密数据库文件
 * - 支持完整的 Unix 风格文件操作
 */

import { querySql, runSql, saveDatabase, isUnlocked } from './encryptedDatabase';

// ============================================
// 类型定义
// ============================================

export type FSNodeType = 'file' | 'directory' | 'symlink';

export interface FSNode {
  id?: number;
  path: string;
  name: string;
  type: FSNodeType;
  permissions: string;
  owner: string;
  content?: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  target?: string; // 符号链接目标
}

export interface DirEntry {
  name: string;
  type: FSNodeType;
  permissions: string;
  owner: string;
  size: number;
  modifiedAt: Date;
}

export interface FSStats {
  totalNodes: number;
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
}

export type FSEventType = 'create' | 'write' | 'delete' | 'rename' | 'chmod';
export interface FSEvent { type: FSEventType; path: string; timestamp: Date; }
export type FSEventListener = (event: FSEvent) => void;

export interface UserInfo {
  username: string;
  isRoot: boolean;
}

// ============================================
// 持久化文件系统类
// ============================================

export class PersistentFileSystem {
  private currentUser: UserInfo | null = null;
  private watchers: Map<string, Set<FSEventListener>> = new Map();
  private globalWatchers: Set<FSEventListener> = new Set();
  private cache: Map<string, FSNode> = new Map();
  private initialized = false;

  /**
   * 初始化文件系统表
   */
  async init(): Promise<void> {
    if (this.initialized || !isUnlocked()) return;
    
    runSql(`
      CREATE TABLE IF NOT EXISTS filesystem (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'file',
        permissions TEXT NOT NULL DEFAULT '-rw-r--r--',
        owner TEXT NOT NULL DEFAULT 'root',
        content TEXT,
        size INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        modified_at TEXT NOT NULL,
        target TEXT
      )
    `);
    
    runSql(`CREATE INDEX IF NOT EXISTS idx_fs_path ON filesystem(path)`);
    runSql(`CREATE INDEX IF NOT EXISTS idx_fs_parent ON filesystem(name)`);
    
    // 检查是否需要创建默认结构
    const roots = querySql<{ count: number }>('SELECT COUNT(*) as count FROM filesystem WHERE path = "/"');
    if (roots.length === 0 || roots[0].count === 0) {
      this.createDefaultStructure();
    }
    
    this.initialized = true;
    await saveDatabase();
  }

  /**
   * 创建默认目录结构
   */
  private createDefaultStructure(): void {
    const now = new Date().toISOString();
    
    // 根目录
    this.insertNode({
      path: '/',
      name: '/',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date()
    });

    // 默认目录
    const defaultDirs = [
      { path: '/home', name: 'home' },
      { path: '/etc', name: 'etc' },
      { path: '/usr', name: 'usr' },
      { path: '/usr/bin', name: 'bin' },
      { path: '/usr/lib', name: 'lib' },
      { path: '/var', name: 'var' },
      { path: '/var/log', name: 'log' },
      { path: '/var/cache', name: 'cache' },
      { path: '/var/tmp', name: 'tmp' },
      { path: '/tmp', name: 'tmp' },
      { path: '/system', name: 'system' },
      { path: '/system/apps', name: 'apps' },
      { path: '/system/core', name: 'core' },
      { path: '/dev', name: 'dev' },
    ];

    for (const dir of defaultDirs) {
      this.insertNode({
        path: dir.path,
        name: dir.name,
        type: 'directory',
        permissions: 'drwxr-xr-x',
        owner: 'root',
        size: 0,
        createdAt: new Date(),
        modifiedAt: new Date()
      });
    }

    // /tmp 和 /var/tmp 可写
    runSql("UPDATE filesystem SET permissions = 'drwxrwxrwx' WHERE path IN ('/tmp', '/var/tmp')");

    // /system 只读
    runSql("UPDATE filesystem SET permissions = 'dr-xr-xr-x' WHERE path LIKE '/system%'");

    // 默认文件
    this.insertNode({
      path: '/etc/config.json',
      name: 'config.json',
      type: 'file',
      permissions: '-rw-r--r--',
      owner: 'root',
      content: JSON.stringify({ system: 'WebOS', version: '0.0.1-alpha' }, null, 2),
      size: 50,
      createdAt: new Date(),
      modifiedAt: new Date()
    });

    this.insertNode({
      path: '/etc/passwd',
      name: 'passwd',
      type: 'file',
      permissions: '-rw-r--r--',
      owner: 'root',
      content: '',
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date()
    });

    // 设备文件
    const devices = ['null', 'zero', 'random'];
    for (const dev of devices) {
      this.insertNode({
        path: `/dev/${dev}`,
        name: dev,
        type: 'file',
        permissions: 'crw-rw-rw-',
        owner: 'root',
        content: '',
        size: 0,
        createdAt: new Date(),
        modifiedAt: new Date()
      });
    }
  }

  /**
   * 插入节点
   */
  private insertNode(node: FSNode): void {
    runSql(
      `INSERT OR REPLACE INTO filesystem 
       (path, name, type, permissions, owner, content, size, created_at, modified_at, target)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        node.path,
        node.name,
        node.type,
        node.permissions,
        node.owner,
        node.content || '',
        node.size,
        node.createdAt.toISOString(),
        node.modifiedAt.toISOString(),
        node.target || null
      ]
    );
  }

  /**
   * 设置当前用户
   */
  setCurrentUser(user: UserInfo | null): void {
    this.currentUser = user;
    if (user) {
      this.ensureUserHome(user.username);
    }
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): UserInfo | null {
    return this.currentUser;
  }

  /**
   * 确保用户主目录存在
   */
  private ensureUserHome(username: string): void {
    const homePath = `/home/${username}`;
    const existing = querySql<{ count: number }>(
      'SELECT COUNT(*) as count FROM filesystem WHERE path = ?',
      [homePath]
    );

    if (existing.length === 0 || existing[0].count === 0) {
      const now = new Date();
      
      // 用户主目录
      this.insertNode({
        path: homePath,
        name: username,
        type: 'directory',
        permissions: 'drwxr-xr-x',
        owner: username,
        size: 0,
        createdAt: now,
        modifiedAt: now
      });

      // 默认子目录
      const subDirs = ['Documents', 'Downloads', 'Pictures', 'Desktop'];
      for (const dir of subDirs) {
        this.insertNode({
          path: `${homePath}/${dir}`,
          name: dir,
          type: 'directory',
          permissions: 'drwxr-xr-x',
          owner: username,
          size: 0,
          createdAt: now,
          modifiedAt: now
        });
      }

      saveDatabase();
    }
  }

  /**
   * 规范化路径
   */
  normalizePath(path: string): string {
    if (!path) return '/';
    if (!path.startsWith('/')) path = '/' + path;
    
    const parts = path.split('/').filter(Boolean);
    const result: string[] = [];
    
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') result.pop();
      else result.push(part);
    }
    
    return '/' + result.join('/');
  }

  /**
   * 获取节点
   */
  getNode(path: string): FSNode | null {
    const normalized = this.normalizePath(path);
    
    // 检查缓存
    if (this.cache.has(normalized)) {
      return this.cache.get(normalized)!;
    }
    
    const rows = querySql<{
      id: number;
      path: string;
      name: string;
      type: string;
      permissions: string;
      owner: string;
      content: string;
      size: number;
      created_at: string;
      modified_at: string;
      target: string | null;
    }>('SELECT * FROM filesystem WHERE path = ?', [normalized]);
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    const node: FSNode = {
      id: row.id,
      path: row.path,
      name: row.name,
      type: row.type as FSNodeType,
      permissions: row.permissions,
      owner: row.owner,
      content: row.content,
      size: row.size,
      createdAt: new Date(row.created_at),
      modifiedAt: new Date(row.modified_at),
      target: row.target || undefined
    };
    
    this.cache.set(normalized, node);
    return node;
  }

  /**
   * 检查权限
   */
  private checkAccess(node: FSNode, access: 'read' | 'write' | 'execute'): boolean {
    // root 用户有所有权限
    if (this.currentUser?.isRoot) return true;
    
    const perms = node.permissions;
    const isOwner = this.currentUser?.username === node.owner;
    
    // 解析权限位
    const permStr = perms.substring(1); // 去掉类型位
    const ownerPerms = permStr.substring(0, 3);
    const groupPerms = permStr.substring(3, 6);
    const otherPerms = permStr.substring(6, 9);
    
    const relevantPerms = isOwner ? ownerPerms : otherPerms;
    
    switch (access) {
      case 'read': return relevantPerms[0] === 'r';
      case 'write': return relevantPerms[1] === 'w';
      case 'execute': return relevantPerms[2] === 'x';
    }
    
    return false;
  }

  /**
   * 触发事件
   */
  private emitEvent(event: FSEvent): void {
    this.globalWatchers.forEach(listener => listener(event));
    
    const pathListeners = this.watchers.get(event.path);
    if (pathListeners) {
      pathListeners.forEach(listener => listener(event));
    }
  }

  // ==================== 公共 API ====================

  /**
   * 读取文件内容
   */
  read(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'file') return null;
    if (!this.checkAccess(node, 'read')) return null;
    return node.content || '';
  }

  /**
   * 写入文件
   */
  async write(path: string, content: string): Promise<boolean> {
    if (!isUnlocked()) return false;
    
    const normalized = this.normalizePath(path);
    let node = this.getNode(normalized);
    const now = new Date();

    if (node) {
      if (node.type !== 'file') return false;
      if (!this.checkAccess(node, 'write')) return false;
      
      runSql(
        'UPDATE filesystem SET content = ?, size = ?, modified_at = ? WHERE path = ?',
        [content, content.length, now.toISOString(), normalized]
      );
      this.cache.delete(normalized);
      this.emitEvent({ type: 'write', path: normalized, timestamp: now });
    } else {
      // 创建新文件
      const parentPath = this.dirname(normalized);
      const parentNode = this.getNode(parentPath);
      if (!parentNode || parentNode.type !== 'directory') return false;
      if (!this.checkAccess(parentNode, 'write')) return false;
      
      const name = this.basename(normalized);
      this.insertNode({
        path: normalized,
        name,
        type: 'file',
        permissions: '-rw-r--r--',
        owner: this.currentUser?.username || 'root',
        content,
        size: content.length,
        createdAt: now,
        modifiedAt: now
      });
      this.emitEvent({ type: 'create', path: normalized, timestamp: now });
    }

    await saveDatabase();
    return true;
  }

  /**
   * 检查是否存在
   */
  exists(path: string): boolean {
    return this.getNode(path) !== null;
  }

  /**
   * 删除文件或目录
   */
  async delete(path: string): Promise<boolean> {
    if (!isUnlocked()) return false;
    
    const normalized = this.normalizePath(path);
    if (normalized === '/') return false;

    const node = this.getNode(normalized);
    if (!node) return false;
    if (!this.checkAccess(node, 'write')) return false;

    // 如果是目录，检查是否为空
    if (node.type === 'directory') {
      const children = this.readdir(normalized);
      if (children.length > 0) return false;
    }

    runSql('DELETE FROM filesystem WHERE path = ?', [normalized]);
    this.cache.delete(normalized);
    await saveDatabase();
    this.emitEvent({ type: 'delete', path: normalized, timestamp: new Date() });
    return true;
  }

  /**
   * 创建目录
   */
  async mkdir(path: string, recursive: boolean = false): Promise<boolean> {
    if (!isUnlocked()) return false;
    
    const normalized = this.normalizePath(path);
    if (this.exists(normalized)) return false;

    const now = new Date();

    if (recursive) {
      const parts = normalized.split('/').filter(Boolean);
      let currentPath = '';
      
      for (const part of parts) {
        currentPath += '/' + part;
        const node = this.getNode(currentPath);
        
        if (!node) {
          const parent = this.getNode(this.dirname(currentPath));
          if (parent && !this.checkAccess(parent, 'write')) return false;
          
          this.insertNode({
            path: currentPath,
            name: part,
            type: 'directory',
            permissions: 'drwxr-xr-x',
            owner: this.currentUser?.username || 'root',
            size: 0,
            createdAt: now,
            modifiedAt: now
          });
          this.emitEvent({ type: 'create', path: currentPath, timestamp: now });
        } else if (node.type !== 'directory') {
          return false;
        }
      }
    } else {
      const parentPath = this.dirname(normalized);
      const parent = this.getNode(parentPath);
      if (!parent || parent.type !== 'directory') return false;
      if (!this.checkAccess(parent, 'write')) return false;

      this.insertNode({
        path: normalized,
        name: this.basename(normalized),
        type: 'directory',
        permissions: 'drwxr-xr-x',
        owner: this.currentUser?.username || 'root',
        size: 0,
        createdAt: now,
        modifiedAt: now
      });
      this.emitEvent({ type: 'create', path: normalized, timestamp: now });
    }

    await saveDatabase();
    return true;
  }

  /**
   * 删除空目录
   */
  async rmdir(path: string): Promise<boolean> {
    const node = this.getNode(path);
    if (!node || node.type !== 'directory') return false;
    
    const children = this.readdir(path);
    if (children.length > 0) return false;
    
    return this.delete(path);
  }

  /**
   * 读取目录
   */
  readdir(path: string): DirEntry[] {
    const node = this.getNode(path);
    if (!node || node.type !== 'directory') return [];
    if (!this.checkAccess(node, 'execute')) return [];

    const normalized = this.normalizePath(path);
    const prefix = normalized === '/' ? '/' : normalized + '/';
    
    const rows = querySql<{
      name: string;
      type: string;
      permissions: string;
      owner: string;
      size: number;
      modified_at: string;
    }>(
      'SELECT name, type, permissions, owner, size, modified_at FROM filesystem WHERE path LIKE ? AND path != ?',
      [prefix + '%', normalized]
    );

    // 只返回直接子项
    const depth = normalized.split('/').filter(Boolean).length;
    
    return rows
      .filter(row => {
        const pathParts = row.name.split('/').filter(Boolean);
        return pathParts.length === depth + 1;
      })
      .map(row => ({
        name: row.name.split('/').pop() || row.name,
        type: row.type as FSNodeType,
        permissions: row.permissions,
        owner: row.owner,
        size: row.size,
        modifiedAt: new Date(row.modified_at)
      }));
  }

  /**
   * 列出目录（返回完整节点）
   */
  list(path: string): FSNode[] {
    const node = this.getNode(path);
    if (!node || node.type !== 'directory') return [];
    if (!this.checkAccess(node, 'execute')) return [];

    const normalized = this.normalizePath(path);
    const prefix = normalized === '/' ? '/' : normalized + '/';
    
    const rows = querySql<{
      id: number;
      path: string;
      name: string;
      type: string;
      permissions: string;
      owner: string;
      content: string;
      size: number;
      created_at: string;
      modified_at: string;
    }>(
      'SELECT * FROM filesystem WHERE path LIKE ? AND path != ?',
      [prefix + '%', normalized]
    );

    const depth = normalized.split('/').filter(Boolean).length;
    
    return rows
      .filter(row => {
        const pathParts = row.path.split('/').filter(Boolean);
        return pathParts.length === depth + 1;
      })
      .map(row => ({
        id: row.id,
        path: row.path,
        name: row.name,
        type: row.type as FSNodeType,
        permissions: row.permissions,
        owner: row.owner,
        content: row.content,
        size: row.size,
        createdAt: new Date(row.created_at),
        modifiedAt: new Date(row.modified_at)
      }));
  }

  /**
   * 获取节点信息
   */
  stat(path: string): FSNode | null {
    const node = this.getNode(path);
    if (!node || !this.checkAccess(node, 'read')) return null;
    return node;
  }

  /**
   * 修改权限
   */
  async chmod(path: string, mode: string): Promise<boolean> {
    if (!isUnlocked()) return false;
    
    const node = this.getNode(path);
    if (!node || !this.checkAccess(node, 'write')) return false;
    
    if (!/^[dcb-][rwx-]{9}$/.test(mode)) return false;
    
    runSql(
      'UPDATE filesystem SET permissions = ?, modified_at = ? WHERE path = ?',
      [mode, new Date().toISOString(), this.normalizePath(path)]
    );
    
    this.cache.delete(this.normalizePath(path));
    await saveDatabase();
    this.emitEvent({ type: 'chmod', path: this.normalizePath(path), timestamp: new Date() });
    return true;
  }

  /**
   * 重命名/移动
   */
  async rename(oldPath: string, newPath: string): Promise<boolean> {
    if (!isUnlocked()) return false;
    
    const node = this.getNode(oldPath);
    if (!node || !this.checkAccess(node, 'write')) return false;
    
    const newParent = this.getNode(this.dirname(newPath));
    if (!newParent || !this.checkAccess(newParent, 'write')) return false;
    
    if (this.exists(newPath)) return false;

    const normalizedOld = this.normalizePath(oldPath);
    const normalizedNew = this.normalizePath(newPath);
    const newName = this.basename(newPath);

    // 更新节点
    runSql(
      'UPDATE filesystem SET path = ?, name = ?, modified_at = ? WHERE path = ?',
      [normalizedNew, newName, new Date().toISOString(), normalizedOld]
    );

    // 如果是目录，更新所有子路径
    if (node.type === 'directory') {
      const prefix = normalizedOld === '/' ? '/' : normalizedOld + '/';
      runSql(
        'UPDATE filesystem SET path = REPLACE(path, ?, ?) WHERE path LIKE ?',
        [normalizedOld, normalizedNew, prefix + '%']
      );
    }

    this.cache.clear();
    await saveDatabase();
    this.emitEvent({ type: 'rename', path: normalizedOld, timestamp: new Date() });
    return true;
  }

  // ==================== 工具方法 ====================

  dirname(path: string): string {
    const normalized = this.normalizePath(path);
    if (normalized === '/') return '/';
    const parts = normalized.split('/').filter(Boolean);
    parts.pop();
    return parts.length === 0 ? '/' : '/' + parts.join('/');
  }

  basename(path: string): string {
    const normalized = this.normalizePath(path);
    if (normalized === '/') return '/';
    const parts = normalized.split('/').filter(Boolean);
    return parts[parts.length - 1] || '/';
  }

  extname(path: string): string {
    const name = this.basename(path);
    const idx = name.lastIndexOf('.');
    return idx > 0 ? name.substring(idx) : '';
  }

  resolve(...paths: string[]): string {
    let result = '';
    for (const p of paths) {
      if (p.startsWith('/')) result = p;
      else result = result ? result + '/' + p : p;
    }
    return this.normalizePath(result);
  }

  // ==================== 事件监听 ====================

  watch(path: string, listener: FSEventListener): () => void {
    const normalized = this.normalizePath(path);
    if (!this.watchers.has(normalized)) {
      this.watchers.set(normalized, new Set());
    }
    this.watchers.get(normalized)!.add(listener);
    return () => this.watchers.get(normalized)?.delete(listener);
  }

  // ==================== 权限检查 ====================

  needsAuthentication(path: string, operation: 'read' | 'write' | 'execute'): boolean {
    if (this.currentUser?.isRoot) return false;
    const node = this.getNode(path);
    if (!node) return false;
    return !this.checkAccess(node, operation);
  }

  getPermissions(path: string): string {
    return this.getNode(path)?.permissions || '----------';
  }

  // ==================== 统计信息 ====================

  stats(): FSStats {
    const files = querySql<{ count: number; total_size: number }>(
      "SELECT COUNT(*) as count, SUM(size) as total_size FROM filesystem WHERE type = 'file'"
    );
    const dirs = querySql<{ count: number }>(
      "SELECT COUNT(*) as count FROM filesystem WHERE type = 'directory'"
    );

    return {
      totalNodes: (files[0]?.count || 0) + (dirs[0]?.count || 0),
      totalFiles: files[0]?.count || 0,
      totalDirectories: dirs[0]?.count || 0,
      totalSize: files[0]?.total_size || 0
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// 导出单例
export const persistentFileSystem = new PersistentFileSystem();
