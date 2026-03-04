// 文件系统核心 - 类 Unix 文件系统模拟

import type { FileSystemNode, User } from '../types';

// 权限解析
const parsePermissions = (perm: string) => {
  const result = [];
  for (let i = 0; i < 3; i++) {
    const char = perm.substring(i * 3, i * 3 + 3);
    result.push({
      read: char.includes('r'),
      write: char.includes('w'),
      execute: char.includes('x')
    });
  }
  return result as [{ read: boolean; write: boolean; execute: boolean }, typeof result[0], typeof result[0]];
};

// 格式化权限字符串（内部使用，导出供其他模块使用）
export const formatPermissions = (isDir: boolean, perms: readonly { read: boolean; write: boolean; execute: boolean }[]) => {
  const type = isDir ? 'd' : '-';
  return type + perms.map(p => 
    (p.read ? 'r' : '-') + 
    (p.write ? 'w' : '-') + 
    (p.execute ? 'x' : '-')
  ).join('');
};

class FileSystem {
  private root: FileSystemNode;
  private currentUser: User | null = null;
  private elevatedSession = false;

  constructor() {
    this.root = this.createDefaultStructure();
  }

  private createNode(
    name: string, 
    type: 'file' | 'directory', 
    permissions: string,
    owner: string,
    content = ''
  ): FileSystemNode {
    const now = new Date();
    return {
      name,
      type,
      permissions,
      owner,
      content: type === 'file' ? content : undefined,
      children: type === 'directory' ? new Map() : undefined,
      createdAt: now,
      modifiedAt: now
    };
  }

  private createDefaultStructure(): FileSystemNode {
    const root = this.createNode('/', 'directory', 'drwxr-xr-x', 'root');
    
    // /home - 用户目录
    const home = this.createNode('home', 'directory', 'drwxr-xr-x', 'root');
    root.children!.set('home', home);
    
    // /etc - 系统配置
    const etc = this.createNode('etc', 'directory', 'drwxr-xr-x', 'root');
    etc.children!.set('config.json', this.createNode(
      'config.json', 'file', '-rw-r--r--', 'root',
      JSON.stringify({ system: 'WebOS', version: '1.0.0' }, null, 2)
    ));
    etc.children!.set('passwd', this.createNode(
      'passwd', 'file', '-rw-r--r--', 'root', ''
    ));
    root.children!.set('etc', etc);
    
    // /usr - 用户应用
    const usr = this.createNode('usr', 'directory', 'drwxr-xr-x', 'root');
    usr.children!.set('bin', this.createNode('bin', 'directory', 'drwxr-xr-x', 'root'));
    usr.children!.set('lib', this.createNode('lib', 'directory', 'drwxr-xr-x', 'root'));
    root.children!.set('usr', usr);
    
    // /var - 可变数据
    const varDir = this.createNode('var', 'directory', 'drwxr-xr-x', 'root');
    varDir.children!.set('log', this.createNode('log', 'directory', 'drwxr-xr-x', 'root'));
    varDir.children!.set('cache', this.createNode('cache', 'directory', 'drwxr-xr-x', 'root'));
    varDir.children!.set('tmp', this.createNode('tmp', 'directory', 'drwxrwxrwx', 'root'));
    root.children!.set('var', varDir);
    
    // /tmp - 临时文件
    root.children!.set('tmp', this.createNode('tmp', 'directory', 'drwxrwxrwx', 'root'));
    
    // /system - 系统核心（只读）
    const system = this.createNode('system', 'directory', 'dr-xr-xr-x', 'root');
    system.children!.set('apps', this.createNode('apps', 'directory', 'dr-xr-xr-x', 'root'));
    system.children!.set('core', this.createNode('core', 'directory', 'dr-xr-xr-x', 'root'));
    system.children!.set('boot', this.createNode('boot', 'directory', 'dr-xr-xr-x', 'root'));
    root.children!.set('system', system);
    
    // /dev - 设备文件
    const dev = this.createNode('dev', 'directory', 'drwxr-xr-x', 'root');
    dev.children!.set('null', this.createNode('null', 'file', 'crw-rw-rw-', 'root'));
    dev.children!.set('zero', this.createNode('zero', 'file', 'crw-rw-rw-', 'root'));
    dev.children!.set('random', this.createNode('random', 'file', 'crw-rw-rw-', 'root'));
    root.children!.set('dev', dev);
    
    return root;
  }

  setCurrentUser(user: User | null): void {
    this.currentUser = user;
    if (user) {
      this.ensureUserHome(user.username);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setElevated(elevated: boolean): void {
    this.elevatedSession = elevated;
  }

  isElevated(): boolean {
    return this.elevatedSession || (this.currentUser?.isRoot ?? false);
  }

  private ensureUserHome(username: string): void {
    const home = this.root.children!.get('home');
    if (home && !home.children!.has(username)) {
      const userHome = this.createNode(username, 'directory', 'drwxr-xr-x', username);
      // 创建默认用户目录
      userHome.children!.set('Documents', this.createNode('Documents', 'directory', 'drwxr-xr-x', username));
      userHome.children!.set('Downloads', this.createNode('Downloads', 'directory', 'drwxr-xr-x', username));
      userHome.children!.set('Pictures', this.createNode('Pictures', 'directory', 'drwxr-xr-x', username));
      userHome.children!.set('Desktop', this.createNode('Desktop', 'directory', 'drwxr-xr-x', username));
      home.children!.set(username, userHome);
    }
  }

  private resolvePath(path: string): string[] {
    return path.replace(/^\//, '').split('/').filter(Boolean);
  }

  private getNodeByPath(path: string): FileSystemNode | null {
    if (path === '/' || path === '') return this.root;
    
    let current = this.root;
    for (const part of this.resolvePath(path)) {
      if (!current.children?.has(part)) return null;
      current = current.children.get(part)!;
    }
    return current;
  }

  private getParentNode(path: string): { parent: FileSystemNode; name: string } | null {
    const parts = this.resolvePath(path);
    if (parts.length === 0) return null;

    const name = parts.pop()!;
    let current = this.root;

    for (const part of parts) {
      if (!current.children?.has(part)) return null;
      current = current.children.get(part)!;
    }

    return { parent: current, name };
  }

  private checkPermission(node: FileSystemNode, permission: 'read' | 'write' | 'execute'): boolean {
    if (this.isElevated()) return true;

    const perms = parsePermissions(node.permissions);

    // 如果没有当前用户，使用 "其他人" 权限
    if (!this.currentUser) {
      return perms[2][permission];
    }

    const user = this.currentUser;

    // 所有者权限
    if (node.owner === user.username) {
      return perms[0][permission];
    }

    // 其他人权限
    return perms[2][permission];
  }

  needsAuthentication(path: string, operation: 'read' | 'write' | 'execute'): boolean {
    if (this.isElevated()) return false;
    
    const node = this.getNodeByPath(path);
    if (!node) return false;
    return !this.checkPermission(node, operation);
  }

  read(path: string): string | null {
    const node = this.getNodeByPath(path);
    if (!node || node.type !== 'file') return null;
    if (!this.checkPermission(node, 'read')) return null;
    return node.content || '';
  }

  write(path: string, content: string): boolean {
    let node = this.getNodeByPath(path);
    
    if (node) {
      if (!this.checkPermission(node, 'write')) return false;
      node.content = content;
      node.modifiedAt = new Date();
    } else {
      const parentInfo = this.getParentNode(path);
      if (!parentInfo || !this.checkPermission(parentInfo.parent, 'write')) return false;
      
      node = this.createNode(
        parentInfo.name, 
        'file', 
        '-rw-r--r--', 
        this.currentUser?.username || 'root', 
        content
      );
      parentInfo.parent.children!.set(parentInfo.name, node);
    }
    
    return true;
  }

  exists(path: string): boolean {
    return this.getNodeByPath(path) !== null;
  }

  list(path: string): FileSystemNode[] {
    const node = this.getNodeByPath(path);
    if (!node || node.type !== 'directory') return [];
    if (!this.checkPermission(node, 'execute')) return [];
    return Array.from(node.children!.values());
  }

  mkdir(path: string): boolean {
    if (this.exists(path)) return false;
    
    const parentInfo = this.getParentNode(path);
    if (!parentInfo || !this.checkPermission(parentInfo.parent, 'write')) return false;
    
    parentInfo.parent.children!.set(parentInfo.name, this.createNode(
      parentInfo.name, 
      'directory', 
      'drwxr-xr-x', 
      this.currentUser?.username || 'root'
    ));
    
    return true;
  }

  remove(path: string): boolean {
    const parentInfo = this.getParentNode(path);
    if (!parentInfo) return false;
    
    const node = parentInfo.parent.children?.get(parentInfo.name);
    if (!node || !this.checkPermission(node, 'write')) return false;
    
    return parentInfo.parent.children!.delete(parentInfo.name);
  }

  getPermissions(path: string): string {
    return this.getNodeByPath(path)?.permissions || '----------';
  }

  setPermissions(path: string, permissions: string): boolean {
    const node = this.getNodeByPath(path);
    if (!node || !this.checkPermission(node, 'write')) return false;
    if (!/^[d-][rwx-]{9}$/.test(permissions)) return false;
    node.permissions = permissions;
    return true;
  }

  getNode(path: string): FileSystemNode | null {
    return this.getNodeByPath(path);
  }
}

export const fileSystem = new FileSystem();
