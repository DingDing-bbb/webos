// 文件系统节点模块

import type { FSNode, DirEntry } from '../types';

/**
 * 创建文件系统节点
 */
export function createNode(
  name: string,
  type: 'file' | 'directory',
  permissions: string,
  owner: string,
  content: string = '',
  group: string = owner // 默认组与所有者相同
): FSNode {
  const now = new Date();
  return {
    name,
    path: '', // 由外部设置
    type,
    permissions,
    owner,
    group,
    size: type === 'file' ? content.length : 0,
    createdAt: now,
    modifiedAt: now,
    content: type === 'file' ? content : undefined,
    children: type === 'directory' ? new Map() : undefined,
  };
}

/**
 * 节点转换为目录条目
 */
export function toDirEntry(node: FSNode): DirEntry {
  return {
    name: node.name,
    type: node.type,
    permissions: node.permissions,
    owner: node.owner,
    group: node.group,
    size: node.size,
    modifiedAt: node.modifiedAt,
  };
}

/**
 * 计算目录大小
 */
export function calculateDirSize(node: FSNode): number {
  if (node.type !== 'directory' || !node.children) {
    return node.size;
  }

  let total = 0;
  node.children.forEach((child) => {
    total += child.size;
  });
  return total;
}

/**
 * 复制节点
 */
export function cloneNode(node: FSNode, deep: boolean = false): FSNode {
  const clone: FSNode = {
    ...node,
    createdAt: new Date(node.createdAt),
    modifiedAt: new Date(node.modifiedAt),
  };

  if (deep && node.children) {
    clone.children = new Map();
    node.children.forEach((child, name) => {
      clone.children!.set(name, cloneNode(child, true));
    });
  }

  return clone;
}

/**
 * 更新节点修改时间
 */
export function touch(node: FSNode): void {
  node.modifiedAt = new Date();
}

/**
 * 设置节点内容 (仅文件)
 */
export function setContent(node: FSNode, content: string): boolean {
  if (node.type !== 'file') return false;
  node.content = content;
  node.size = content.length;
  node.modifiedAt = new Date();
  return true;
}

/**
 * 获取节点内容
 */
export function getContent(node: FSNode): string | null {
  if (node.type !== 'file') return null;
  return node.content || '';
}

/**
 * 添加子节点
 */
export function addChild(parent: FSNode, child: FSNode): boolean {
  if (parent.type !== 'directory' || !parent.children) return false;
  parent.children.set(child.name, child);
  parent.modifiedAt = new Date();
  return true;
}

/**
 * 移除子节点
 */
export function removeChild(parent: FSNode, name: string): FSNode | null {
  if (parent.type !== 'directory' || !parent.children) return null;
  const child = parent.children.get(name);
  if (child) {
    parent.children.delete(name);
    parent.modifiedAt = new Date();
    return child;
  }
  return null;
}

/**
 * 获取子节点
 */
export function getChild(parent: FSNode, name: string): FSNode | null {
  if (parent.type !== 'directory' || !parent.children) return null;
  return parent.children.get(name) || null;
}

/**
 * 获取所有子节点
 */
export function getChildren(node: FSNode): FSNode[] {
  if (node.type !== 'directory' || !node.children) return [];
  return Array.from(node.children.values());
}

/**
 * 检查是否为空目录
 */
export function isEmptyDir(node: FSNode): boolean {
  return node.type === 'directory' && (!node.children || node.children.size === 0);
}
