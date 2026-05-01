// 文件系统核心类

import type { FSNode, DirEntry, UserInfo, FSEvent, FSEventListener, FSStats } from '../types';
import {
  createNode,
  toDirEntry,
  getChildren,
  getChild,
  addChild,
  removeChild,
  setContent,
  getContent,
  isEmptyDir,
} from './Node';
import { checkPermission, DEFAULT_DIR_PERMS, DEFAULT_FILE_PERMS } from './Permissions';
import { indexedDBStorage } from './IndexedDBStorage';

/**
 * 文件系统类
 * 实现类 Unix 文件系统
 */
export class FileSystem {
  private root: FSNode;
  private currentUser: UserInfo | null = null;
  private watchers: Map<string, Set<FSEventListener>> = new Map();
  private globalWatchers: Set<FSEventListener> = new Set();
  private storageInitialized = false;

  constructor() {
    // 先创建内存中的默认结构，确保文件系统立即可用
    this.root = this.createDefaultStructure();
    
    // 异步初始化持久化存储
    this.initStorage().catch(error => {
      console.error('[FileSystem] Failed to initialize storage:', error);
    });
  }

  /**
   * 初始化持久化存储
   */
  private async initStorage(): Promise<void> {
    try {
      // 检查存储是否可用
      const available = await indexedDBStorage.isAvailable();
      if (!available) {
        console.warn('[FileSystem] IndexedDB storage not available, using in-memory only');
        return;
      }

      // 尝试从存储加载所有节点
      const storedNodes = await indexedDBStorage.loadAllNodes();

      if (storedNodes.length === 0) {
        // 存储为空，将当前内存结构保存到存储
        console.log('[FileSystem] No stored data found, saving default structure to storage');
        await this.saveAllToStorage();
      } else {
        // 用存储数据重建内存树
        console.log(`[FileSystem] Loaded ${storedNodes.length} nodes from storage`);
        await this.loadFromStorage(storedNodes);
      }

      this.storageInitialized = true;
      console.log('[FileSystem] Storage initialized successfully');
    } catch (error) {
      console.error('[FileSystem] Storage initialization error:', error);
      // 存储初始化失败不影响内存文件系统
    }
  }

  /**
   * 从存储数据重建内存树
   */
  private async loadFromStorage(nodes: FSNode[]): Promise<void> {
    // 清空当前内存树（保留根节点）
    const newRoot: FSNode = {
      name: '/',
      path: '/',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      group: 'root',
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
      children: new Map(),
    };

    // 按路径排序，确保父节点在子节点之前
    const sortedNodes = nodes.sort((a, b) => a.path.localeCompare(b.path));
    
    // 重建节点映射
    const nodeMap = new Map<string, FSNode>();
    nodeMap.set('/', newRoot);

    for (const node of sortedNodes) {
      if (node.path === '/') {
        // 跳过根节点（已创建）
        continue;
      }

      // 确保父节点存在
      const parentPath = this.dirname(node.path);
      const parent = nodeMap.get(parentPath);
      if (!parent || parent.type !== 'directory' || !parent.children) {
        console.warn(`[FileSystem] Parent not found for path: ${node.path}`);
        continue;
      }

      // 设置节点路径并添加到父节点
      node.children = node.type === 'directory' ? new Map() : undefined;
      nodeMap.set(node.path, node);
      parent.children.set(node.name, node);
    }

    // 计算目录大小
    const recalcSize = (node: FSNode): number => {
      if (node.type === 'file') {
        return node.size;
      } else {
        let total = 0;
        if (node.children) {
          node.children.forEach(child => {
            total += recalcSize(child);
          });
        }
        node.size = total;
        return total;
      }
    };

    recalcSize(newRoot);
    this.root = newRoot;
  }

  /**
   * 保存所有节点到存储
   */
  private async saveAllToStorage(): Promise<boolean> {
    // 收集所有节点
    const nodes: FSNode[] = [];
    const collect = (node: FSNode) => {
      nodes.push(node);
      if (node.type === 'directory' && node.children) {
        node.children.forEach(child => collect(child));
      }
    };
    collect(this.root);

    // 保存到存储
    return await indexedDBStorage.saveAllNodes(nodes);
  }

  /**
   * 保存单个节点到存储（异步，不阻塞）
   */
  private saveNodeToStorage(node: FSNode): void {
    if (!this.storageInitialized) return;
    
    // 异步保存，不等待完成
    indexedDBStorage.saveNode(node).catch(error => {
      console.error('[FileSystem] Failed to save node to storage:', error);
    });
  }

  /**
   * 从存储删除节点（异步，不阻塞）
   */
  private deleteNodeFromStorage(path: string): void {
    if (!this.storageInitialized) return;
    
    indexedDBStorage.deleteNode(path).catch(error => {
      console.error('[FileSystem] Failed to delete node from storage:', error);
    });
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
   * 创建默认目录结构
   */
  private createDefaultStructure(): FSNode {
    const now = new Date();

    // 根目录
    const root: FSNode = {
      name: '/',
      path: '/',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      group: 'root',
      size: 0,
      createdAt: now,
      modifiedAt: now,
      children: new Map(),
    };

    // /home - 用户目录
    const home = createNode('home', 'directory', DEFAULT_DIR_PERMS, 'root');
    home.path = '/home';
    addChild(root, home);

    // /bin - 系统二进制目录
    const bin = createNode('bin', 'directory', DEFAULT_DIR_PERMS, 'root');
    bin.path = '/bin';
    addChild(root, bin);

    // /etc - 系统配置
    const etc = createNode('etc', 'directory', DEFAULT_DIR_PERMS, 'root');
    etc.path = '/etc';

    const configJson = createNode(
      'config.json',
      'file',
      DEFAULT_FILE_PERMS,
      'root',
      JSON.stringify({ system: 'WebOS', version: '0.0.1-alpha' }, null, 2)
    );
    configJson.path = '/etc/config.json';
    addChild(etc, configJson);

    const passwd = createNode('passwd', 'file', DEFAULT_FILE_PERMS, 'root', '');
    passwd.path = '/etc/passwd';
    addChild(etc, passwd);

    addChild(root, etc);

    // /usr - 用户程序
    const usr = createNode('usr', 'directory', DEFAULT_DIR_PERMS, 'root');
    usr.path = '/usr';

    const usrBin = createNode('bin', 'directory', DEFAULT_DIR_PERMS, 'root');
    usrBin.path = '/usr/bin';
    addChild(usr, usrBin);

    const usrLib = createNode('lib', 'directory', DEFAULT_DIR_PERMS, 'root');
    usrLib.path = '/usr/lib';
    addChild(usr, usrLib);

    addChild(root, usr);

    // /var - 可变数据
    const varDir = createNode('var', 'directory', DEFAULT_DIR_PERMS, 'root');
    varDir.path = '/var';

    const varLog = createNode('log', 'directory', DEFAULT_DIR_PERMS, 'root');
    varLog.path = '/var/log';
    addChild(varDir, varLog);

    const varCache = createNode('cache', 'directory', DEFAULT_DIR_PERMS, 'root');
    varCache.path = '/var/cache';
    addChild(varDir, varCache);

    const varTmp = createNode('tmp', 'directory', 'drwxrwxrwx', 'root');
    varTmp.path = '/var/tmp';
    addChild(varDir, varTmp);

    addChild(root, varDir);

    // /tmp - 临时文件
    const tmp = createNode('tmp', 'directory', 'drwxrwxrwx', 'root');
    tmp.path = '/tmp';
    addChild(root, tmp);

    // /system - 系统核心 (只读)
    const system = createNode('system', 'directory', 'dr-xr-xr-x', 'root');
    system.path = '/system';

    const sysApps = createNode('apps', 'directory', 'dr-xr-xr-x', 'root');
    sysApps.path = '/system/apps';
    addChild(system, sysApps);

    const sysCore = createNode('core', 'directory', 'dr-xr-xr-x', 'root');
    sysCore.path = '/system/core';
    addChild(system, sysCore);

    const sysBoot = createNode('boot', 'directory', 'dr-xr-xr-x', 'root');
    sysBoot.path = '/system/boot';
    addChild(system, sysBoot);

    addChild(root, system);

    // /dev - 设备文件
    const dev = createNode('dev', 'directory', DEFAULT_DIR_PERMS, 'root');
    dev.path = '/dev';

    const devNull = createNode('null', 'file', 'crw-rw-rw-', 'root');
    devNull.path = '/dev/null';
    addChild(dev, devNull);

    const devZero = createNode('zero', 'file', 'crw-rw-rw-', 'root');
    devZero.path = '/dev/zero';
    addChild(dev, devZero);

    const devRandom = createNode('random', 'file', 'crw-rw-rw-', 'root');
    devRandom.path = '/dev/random';
    addChild(dev, devRandom);

    addChild(root, dev);

    return root;
  }

  /**
   * 确保用户主目录存在
   */
  private ensureUserHome(username: string): void {
    const home = getChild(this.root, 'home');
    if (!home) return;

    let userHome = getChild(home, username);
    if (!userHome) {
      userHome = createNode(username, 'directory', DEFAULT_DIR_PERMS, username);
      userHome.path = `/home/${username}`;

      // 创建默认用户目录
      const documents = createNode('Documents', 'directory', DEFAULT_DIR_PERMS, username);
      documents.path = `/home/${username}/Documents`;
      addChild(userHome, documents);

      const downloads = createNode('Downloads', 'directory', DEFAULT_DIR_PERMS, username);
      downloads.path = `/home/${username}/Downloads`;
      addChild(userHome, downloads);

      const pictures = createNode('Pictures', 'directory', DEFAULT_DIR_PERMS, username);
      pictures.path = `/home/${username}/Pictures`;
      addChild(userHome, pictures);

      const desktop = createNode('Desktop', 'directory', DEFAULT_DIR_PERMS, username);
      desktop.path = `/home/${username}/Desktop`;
      addChild(userHome, desktop);

      addChild(home, userHome);
      this.emitEvent({ type: 'create', path: userHome.path, timestamp: new Date() });
      
      // 保存所有新创建的节点到存储
      [userHome, documents, downloads, pictures, desktop].forEach(node => {
        this.saveNodeToStorage(node);
      });
    }
  }

  /**
   * 规范化路径
   */
  normalizePath(path: string): string {
    // 处理空路径
    if (!path) return '/';

    // 确保以 / 开头
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // 解析 . 和 ..
    const parts = path.split('/').filter(Boolean);
    const result: string[] = [];

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        result.pop();
      } else {
        result.push(part);
      }
    }

    return '/' + result.join('/');
  }

  /**
   * 解析路径为数组
   */
  private resolvePath(path: string): string[] {
    return this.normalizePath(path).split('/').filter(Boolean);
  }

  /**
   * 根据路径获取节点
   */
  getNode(path: string): FSNode | null {
    const normalized = this.normalizePath(path);
    if (normalized === '/') return this.root;

    const parts = this.resolvePath(normalized);
    let current = this.root;

    for (const part of parts) {
      const child = getChild(current, part);
      if (!child) return null;
      current = child;
    }

    return current;
  }

  /**
   * 获取父节点和名称
   */
  private getParentAndName(path: string): { parent: FSNode; name: string } | null {
    const normalized = this.normalizePath(path);
    if (normalized === '/') return null;

    const parts = this.resolvePath(normalized);
    if (parts.length === 0) return null;

    const name = parts.pop()!;
    let current = this.root;

    for (const part of parts) {
      const child = getChild(current, part);
      if (!child) return null;
      current = child;
    }

    return { parent: current, name };
  }

  /**
   * 检查权限
   */
  private checkAccess(node: FSNode, access: 'read' | 'write' | 'execute'): boolean {
    return checkPermission(node.permissions, this.currentUser, node.owner, node.group, access);
  }

  /**
   * 触发事件
   */
  private emitEvent(event: FSEvent): void {
    // 通知全局监听器
    this.globalWatchers.forEach((listener) => listener(event));

    // 通知路径监听器
    const pathListeners = this.watchers.get(event.path);
    if (pathListeners) {
      pathListeners.forEach((listener) => listener(event));
    }

    // 通知父目录监听器
    const parentPath = this.dirname(event.path);
    if (parentPath !== event.path) {
      const parentListeners = this.watchers.get(parentPath);
      if (parentListeners) {
        parentListeners.forEach((listener) => listener(event));
      }
    }
  }

  // ==================== 公共 API ====================

  /**
   * 读取文件内容
   */
  read(path: string): string | null {
    const node = this.getNode(path);
    if (!node) return null;
    if (node.type !== 'file') return null;
    if (!this.checkAccess(node, 'read')) return null;
    return getContent(node);
  }

  /**
   * 写入文件
   */
  write(path: string, content: string): boolean {
    const normalized = this.normalizePath(path);
    let node = this.getNode(normalized);

    if (node) {
      // 文件存在，检查写权限
      if (node.type !== 'file') return false;
      if (!this.checkAccess(node, 'write')) return false;
      setContent(node, content);
      this.emitEvent({ type: 'write', path: normalized, timestamp: new Date() });
      // 保存到存储
      this.saveNodeToStorage(node);
    } else {
      // 文件不存在，创建新文件
      const parentInfo = this.getParentAndName(normalized);
      if (!parentInfo) return false;
      if (!this.checkAccess(parentInfo.parent, 'write')) return false;

      node = createNode(
        parentInfo.name,
        'file',
        DEFAULT_FILE_PERMS,
        this.currentUser?.username || 'root',
        content
      );
      node.path = normalized;
      addChild(parentInfo.parent, node);
      this.emitEvent({ type: 'create', path: normalized, timestamp: new Date() });
      // 保存新节点到存储
      this.saveNodeToStorage(node);
    }

    return true;
  }

  /**
   * 检查文件是否存在
   */
  exists(path: string): boolean {
    return this.getNode(path) !== null;
  }

  /**
   * 删除文件或目录
   */
  delete(path: string): boolean {
    const normalized = this.normalizePath(path);
    if (normalized === '/') return false;

    const parentInfo = this.getParentAndName(normalized);
    if (!parentInfo) return false;

    const node = getChild(parentInfo.parent, parentInfo.name);
    if (!node) return false;
    if (!this.checkAccess(node, 'write')) return false;

    removeChild(parentInfo.parent, parentInfo.name);
    this.emitEvent({ type: 'delete', path: normalized, timestamp: new Date() });
    // 从存储删除
    this.deleteNodeFromStorage(normalized);
    return true;
  }

  /**
   * 创建目录
   */
  mkdir(path: string, recursive: boolean = false): boolean {
    const normalized = this.normalizePath(path);
    if (this.exists(normalized)) return false;

    if (recursive) {
      // 递归创建父目录
      const parts = this.resolvePath(normalized);
      let current = this.root;
      let currentPath = '';
      const createdNodes: FSNode[] = [];

      for (const part of parts) {
        currentPath += '/' + part;
        let child = getChild(current, part);

        if (!child) {
          if (!this.checkAccess(current, 'write')) return false;
          child = createNode(
            part,
            'directory',
            DEFAULT_DIR_PERMS,
            this.currentUser?.username || 'root'
          );
          child.path = this.normalizePath(currentPath);
          addChild(current, child);
          this.emitEvent({ type: 'create', path: child.path, timestamp: new Date() });
          createdNodes.push(child);
        } else if (child.type !== 'directory') {
          return false;
        }

        current = child;
      }

      // 保存所有新创建的节点到存储
      createdNodes.forEach(node => this.saveNodeToStorage(node));
      return true;
    } else {
      // 非递归，直接创建
      const parentInfo = this.getParentAndName(normalized);
      if (!parentInfo) return false;
      if (!this.checkAccess(parentInfo.parent, 'write')) return false;

      const node = createNode(
        parentInfo.name,
        'directory',
        DEFAULT_DIR_PERMS,
        this.currentUser?.username || 'root'
      );
      node.path = normalized;
      addChild(parentInfo.parent, node);
      this.emitEvent({ type: 'create', path: normalized, timestamp: new Date() });
      // 保存新节点到存储
      this.saveNodeToStorage(node);
      return true;
    }
  }

  /**
   * 删除空目录
   */
  rmdir(path: string): boolean {
    const node = this.getNode(path);
    if (!node) return false;
    if (node.type !== 'directory') return false;
    if (!isEmptyDir(node)) return false;
    return this.delete(path);
  }

  /**
   * 读取目录
   */
  readdir(path: string): DirEntry[] {
    const node = this.getNode(path);
    if (!node) return [];
    if (node.type !== 'directory') return [];
    if (!this.checkAccess(node, 'execute')) return [];

    return getChildren(node).map(toDirEntry);
  }

  /**
   * 列出目录内容 (旧 API 兼容)
   */
  list(path: string): FSNode[] {
    const node = this.getNode(path);
    if (!node) return [];
    if (node.type !== 'directory') return [];
    if (!this.checkAccess(node, 'execute')) return [];
    return getChildren(node);
  }

  /**
   * 获取节点信息
   */
  stat(path: string): FSNode | null {
    const node = this.getNode(path);
    if (!node) return null;
    if (!this.checkAccess(node, 'read')) return null;
    return node;
  }

  /**
   * 修改权限
   */
  chmod(path: string, mode: string): boolean {
    const node = this.getNode(path);
    if (!node) return false;
    if (!this.checkAccess(node, 'write')) return false;

    // 验证权限格式
    if (!/^[d-][rwx-]{9}$/.test(mode)) return false;

    node.permissions = mode;
    node.modifiedAt = new Date();
    this.emitEvent({ type: 'chmod', path: this.normalizePath(path), timestamp: new Date() });
    // 保存到存储
    this.saveNodeToStorage(node);
    return true;
  }

  /**
   * 修改所有者
   */
  chown(path: string, owner: string): boolean {
    // 只有 root 可以修改所有者
    if (!this.currentUser?.isRoot) return false;

    const node = this.getNode(path);
    if (!node) return false;

    node.owner = owner;
    node.modifiedAt = new Date();
    this.emitEvent({ type: 'chmod', path: this.normalizePath(path), timestamp: new Date() });
    // 保存到存储
    this.saveNodeToStorage(node);
    return true;
  }

  /**
   * 修改所属组
   */
  chgrp(path: string, group: string): boolean {
    // root 用户可以修改任何文件的组
    // 文件所有者也可以修改组（如果用户在该组中）
    const node = this.getNode(path);
    if (!node) return false;

    if (this.currentUser?.isRoot) {
      // root 有所有权限
    } else if (node.owner === this.currentUser?.username) {
      // 所有者可以修改组，但必须在新组中
      if (!this.currentUser || (!this.currentUser.groups.includes(group) && this.currentUser.group !== group)) {
        return false;
      }
    } else {
      // 非所有者非 root 用户不能修改组
      return false;
    }

    node.group = group;
    node.modifiedAt = new Date();
    this.emitEvent({ type: 'chmod', path: this.normalizePath(path), timestamp: new Date() });
    // 保存到存储
    this.saveNodeToStorage(node);
    return true;
  }

  /**
   * 重命名/移动
   */
  rename(oldPath: string, newPath: string): boolean {
    const node = this.getNode(oldPath);
    if (!node) return false;
    if (!this.checkAccess(node, 'write')) return false;

    const oldParent = this.getParentAndName(oldPath);
    const newParent = this.getParentAndName(newPath);
    if (!oldParent || !newParent) return false;
    if (!this.checkAccess(newParent.parent, 'write')) return false;

    // 检查目标是否已存在
    if (getChild(newParent.parent, newParent.name)) return false;

    // 移动节点
    removeChild(oldParent.parent, oldParent.name);
    node.name = newParent.name;
    node.path = this.normalizePath(newPath);
    addChild(newParent.parent, node);

    this.emitEvent({ type: 'rename', path: oldPath, timestamp: new Date() });
    
    // 更新存储：删除旧记录，保存新记录
    this.deleteNodeFromStorage(oldPath);
    this.saveNodeToStorage(node);
    return true;
  }

  // ==================== 工具方法 ====================

  /**
   * 获取目录名
   */
  dirname(path: string): string {
    const normalized = this.normalizePath(path);
    if (normalized === '/') return '/';

    const parts = normalized.split('/').filter(Boolean);
    parts.pop();
    return parts.length === 0 ? '/' : '/' + parts.join('/');
  }

  /**
   * 获取文件名
   */
  basename(path: string): string {
    const normalized = this.normalizePath(path);
    if (normalized === '/') return '/';

    const parts = normalized.split('/').filter(Boolean);
    return parts[parts.length - 1] || '/';
  }

  /**
   * 获取扩展名
   */
  extname(path: string): string {
    const name = this.basename(path);
    const idx = name.lastIndexOf('.');
    return idx > 0 ? name.substring(idx) : '';
  }

  /**
   * 解析路径
   */
  resolve(...paths: string[]): string {
    let result = '';
    for (const p of paths) {
      if (p.startsWith('/')) {
        result = p;
      } else {
        result = result ? result + '/' + p : p;
      }
    }
    return this.normalizePath(result);
  }

  // ==================== 事件监听 ====================

  /**
   * 监听文件系统变化
   */
  watch(path: string, listener: FSEventListener): () => void {
    const normalized = this.normalizePath(path);

    if (!this.watchers.has(normalized)) {
      this.watchers.set(normalized, new Set());
    }

    this.watchers.get(normalized)!.add(listener);

    return () => {
      this.watchers.get(normalized)?.delete(listener);
    };
  }

  // ==================== 统计信息 ====================

  /**
   * 获取文件系统统计
   */
  stats(): FSStats {
    let totalNodes = 0;
    let totalFiles = 0;
    let totalDirectories = 0;
    let totalSize = 0;

    const count = (node: FSNode) => {
      totalNodes++;
      if (node.type === 'file') {
        totalFiles++;
        totalSize += node.size;
      } else {
        totalDirectories++;
        if (node.children) {
          node.children.forEach((child) => count(child));
        }
      }
    };

    count(this.root);

    return {
      totalNodes,
      totalFiles,
      totalDirectories,
      totalSize,
    };
  }

  // ==================== 权限检查 ====================

  /**
   * 检查是否需要认证
   */
  needsAuthentication(path: string, operation: 'read' | 'write' | 'execute'): boolean {
    if (this.currentUser?.isRoot) return false;

    const node = this.getNode(path);
    if (!node) return false;
    return !this.checkAccess(node, operation);
  }

  /**
   * 获取权限字符串
   */
  getPermissions(path: string): string {
    return this.getNode(path)?.permissions || '----------';
  }
}

// 导出单例
export const fileSystem = new FileSystem();
