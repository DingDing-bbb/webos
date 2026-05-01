// IndexedDB 持久化存储后端
// 使用加密数据库存储文件系统数据

import type { FSNode } from '../types';
import { 
  initDatabase, 
  saveDatabase, 
  querySql, 
  runSql, 
  isUnlocked, 
  databaseExists 
} from '../../../kernel/src/core/encryptedDatabase';

/**
 * 数据库中的文件系统记录接口
 */
interface FSRecord {
  id?: number;
  path: string;
  name: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  group: string;
  content: string | null;
  size: number;
  created_at: string;
  modified_at: string;
  target: string | null;
}

/**
 * IndexedDB 存储后端
 */
export class IndexedDBStorage {
  private initialized = false;

  constructor() {
    this.ensureDatabase = this.ensureDatabase.bind(this);
  }

  /**
   * 确保数据库已初始化和解锁
   */
  private async ensureDatabase(): Promise<boolean> {
    if (this.initialized && isUnlocked()) {
      return true;
    }

    // 检查是否存在现有数据库
    const exists = await databaseExists();
    
    if (exists) {
      // 尝试用默认密码解锁（如果系统已设置）
      // 注意：实际系统中应该有密码管理机制
      const result = await initDatabase('', false); // 空密码用于测试
      if (result.success) {
        this.initialized = true;
        return true;
      }
    }

    // 创建新数据库
    const result = await initDatabase('', true); // 空密码用于测试，生产环境需要安全密码
    if (result.success) {
      this.initialized = true;
      return true;
    }

    console.error('[IndexedDBStorage] Failed to initialize database:', result.error);
    return false;
  }

  /**
   * 将 FSNode 转换为数据库记录
   */
  private nodeToRecord(node: FSNode): FSRecord {
    return {
      path: node.path,
      name: node.name,
      type: node.type,
      permissions: node.permissions,
      owner: node.owner,
      group: node.group,
      content: node.type === 'file' ? node.content || '' : null,
      size: node.size,
      created_at: node.createdAt.toISOString(),
      modified_at: node.modifiedAt.toISOString(),
      target: null, // 符号链接目标，暂不支持
    };
  }

  /**
   * 将数据库记录转换为 FSNode
   */
  private recordToNode(record: FSRecord): FSNode {
    const node: FSNode = {
      name: record.name,
      path: record.path,
      type: record.type,
      permissions: record.permissions,
      owner: record.owner,
      group: record.group,
      size: record.size,
      createdAt: new Date(record.created_at),
      modifiedAt: new Date(record.modified_at),
    };

    if (record.type === 'file') {
      node.content = record.content || '';
    } else {
      node.children = new Map();
    }

    return node;
  }

  /**
   * 保存节点到数据库
   */
  async saveNode(node: FSNode): Promise<boolean> {
    try {
      const ready = await this.ensureDatabase();
      if (!ready) return false;

      const record = this.nodeToRecord(node);
      
      // 检查节点是否已存在
      const existing = querySql<FSRecord>(
        'SELECT * FROM filesystem WHERE path = ?',
        [node.path]
      );

      if (existing.length > 0) {
        // 更新现有记录
        runSql(
          `UPDATE filesystem SET 
            name = ?, type = ?, permissions = ?, owner = ?, "group" = ?,
            content = ?, size = ?, modified_at = ?
           WHERE path = ?`,
          [
            record.name,
            record.type,
            record.permissions,
            record.owner,
            record.group,
            record.content,
            record.size,
            record.modified_at,
            record.path,
          ]
        );
      } else {
        // 插入新记录
        runSql(
          `INSERT INTO filesystem 
            (path, name, type, permissions, owner, "group", content, size, created_at, modified_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record.path,
            record.name,
            record.type,
            record.permissions,
            record.owner,
            record.group,
            record.content,
            record.size,
            record.created_at,
            record.modified_at,
          ]
        );
      }

      // 保存到持久化存储
      await saveDatabase();
      return true;
    } catch (error) {
      console.error('[IndexedDBStorage] Failed to save node:', error);
      return false;
    }
  }

  /**
   * 从数据库获取节点
   */
  async getNode(path: string): Promise<FSNode | null> {
    try {
      const ready = await this.ensureDatabase();
      if (!ready) return null;

      const records = querySql<FSRecord>(
        'SELECT * FROM filesystem WHERE path = ?',
        [path]
      );

      if (records.length === 0) {
        return null;
      }

      return this.recordToNode(records[0]);
    } catch (error) {
      console.error('[IndexedDBStorage] Failed to get node:', error);
      return null;
    }
  }

  /**
   * 从数据库删除节点
   */
  async deleteNode(path: string): Promise<boolean> {
    try {
      const ready = await this.ensureDatabase();
      if (!ready) return false;

      // 先检查是否存在
      const records = querySql<FSRecord>(
        'SELECT * FROM filesystem WHERE path = ?',
        [path]
      );

      if (records.length === 0) {
        return false;
      }

      // 删除节点
      runSql('DELETE FROM filesystem WHERE path = ?', [path]);
      
      // 如果有子节点，递归删除（应该由文件系统逻辑处理）
      // 这里只删除指定路径的节点
      
      await saveDatabase();
      return true;
    } catch (error) {
      console.error('[IndexedDBStorage] Failed to delete node:', error);
      return false;
    }
  }

  /**
   * 列出目录下的节点
   */
  async listNodes(parentPath: string): Promise<FSNode[]> {
    try {
      const ready = await this.ensureDatabase();
      if (!ready) return [];

      // 查找以 parentPath/ 开头的所有路径
      const records = querySql<FSRecord>(
        'SELECT * FROM filesystem WHERE path LIKE ?',
        [`${parentPath}/%`]
      );

      // 过滤出直接子节点
      const directChildren = records.filter(record => {
        const remainingPath = record.path.substring(parentPath.length + 1);
        return !remainingPath.includes('/');
      });

      return directChildren.map(record => this.recordToNode(record));
    } catch (error) {
      console.error('[IndexedDBStorage] Failed to list nodes:', error);
      return [];
    }
  }

  /**
   * 加载所有节点（用于初始化文件系统）
   */
  async loadAllNodes(): Promise<FSNode[]> {
    try {
      const ready = await this.ensureDatabase();
      if (!ready) return [];

      const records = querySql<FSRecord>('SELECT * FROM filesystem ORDER BY path');
      return records.map(record => this.recordToNode(record));
    } catch (error) {
      console.error('[IndexedDBStorage] Failed to load all nodes:', error);
      return [];
    }
  }

  /**
   * 批量保存节点
   */
  async saveAllNodes(nodes: FSNode[]): Promise<boolean> {
    try {
      const ready = await this.ensureDatabase();
      if (!ready) return false;

      // 开始事务（通过批量操作）
      for (const node of nodes) {
        const record = this.nodeToRecord(node);
        const existing = querySql<FSRecord>(
          'SELECT * FROM filesystem WHERE path = ?',
          [node.path]
        );

        if (existing.length > 0) {
          runSql(
            `UPDATE filesystem SET 
              name = ?, type = ?, permissions = ?, owner = ?, "group" = ?,
              content = ?, size = ?, modified_at = ?
             WHERE path = ?`,
            [
              record.name,
              record.type,
              record.permissions,
              record.owner,
              record.group,
              record.content,
              record.size,
              record.modified_at,
              record.path,
            ]
          );
        } else {
          runSql(
            `INSERT INTO filesystem 
              (path, name, type, permissions, owner, "group", content, size, created_at, modified_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              record.path,
              record.name,
              record.type,
              record.permissions,
              record.owner,
              record.group,
              record.content,
              record.size,
              record.created_at,
              record.modified_at,
            ]
          );
        }
      }

      await saveDatabase();
      return true;
    } catch (error) {
      console.error('[IndexedDBStorage] Failed to save all nodes:', error);
      return false;
    }
  }

  /**
   * 清空所有文件系统数据
   */
  async clearAll(): Promise<boolean> {
    try {
      const ready = await this.ensureDatabase();
      if (!ready) return false;

      runSql('DELETE FROM filesystem');
      await saveDatabase();
      return true;
    } catch (error) {
      console.error('[IndexedDBStorage] Failed to clear all:', error);
      return false;
    }
  }

  /**
   * 检查数据库是否可用
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await this.ensureDatabase();
    } catch (error) {
      return false;
    }
  }
}

// 导出单例实例
export const indexedDBStorage = new IndexedDBStorage();