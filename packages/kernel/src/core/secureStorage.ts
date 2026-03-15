/**
 * 安全存储模块
 * 使用 IndexedDB 存储加密数据
 */

const DB_NAME = 'webos-secure-storage';
const DB_VERSION = 1;

// 存储仓库名称
const STORES = {
  USERS: 'users',
  SETTINGS: 'settings',
  SESSION: 'session',
  VAULT: 'vault' // 加密的数据存储
} as const;

/**
 * IndexedDB 数据库实例
 */
let db: IDBDatabase | null = null;

/**
 * 初始化数据库
 */
export async function initDatabase(): Promise<IDBDatabase> {
  if (db) return db;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('[SecureStorage] Failed to open database:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // 用户存储
      if (!database.objectStoreNames.contains(STORES.USERS)) {
        const userStore = database.createObjectStore(STORES.USERS, { keyPath: 'username' });
        userStore.createIndex('role', 'role', { unique: false });
        userStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      
      // 设置存储
      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
      
      // 会话存储
      if (!database.objectStoreNames.contains(STORES.SESSION)) {
        database.createObjectStore(STORES.SESSION, { keyPath: 'id' });
      }
      
      // 加密数据存储
      if (!database.objectStoreNames.contains(STORES.VAULT)) {
        const vaultStore = database.createObjectStore(STORES.VAULT, { keyPath: 'key' });
        vaultStore.createIndex('category', 'category', { unique: false });
      }
    };
  });
}

/**
 * 通用存储操作
 */
async function getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
  const database = await initDatabase();
  const transaction = database.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

/**
 * 添加或更新记录
 */
async function putRecord<T extends object>(storeName: string, record: T): Promise<void> {
  const store = await getStore(storeName, 'readwrite');
  
  return new Promise((resolve, reject) => {
    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * 获取记录
 */
async function getRecord<T>(storeName: string, key: string): Promise<T | null> {
  const store = await getStore(storeName);
  
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 删除记录
 */
async function deleteRecord(storeName: string, key: string): Promise<void> {
  const store = await getStore(storeName, 'readwrite');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * 获取所有记录
 */
async function getAllRecords<T>(storeName: string): Promise<T[]> {
  const store = await getStore(storeName);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 清空存储
 */
async function clearStore(storeName: string): Promise<void> {
  const store = await getStore(storeName, 'readwrite');
  
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// 用户存储 API
// ============================================

export interface StoredUser {
  username: string;
  passwordHash: string;
  passwordSalt: string;
  role: 'root' | 'admin' | 'user' | 'guest';
  isRoot: boolean;
  homeDir: string;
  permissions: string[];
  displayName: string;
  createdAt: string;
  lastLogin?: string;
  isTemporary: boolean;
  temporaryReason?: string;
}

export async function saveUser(user: StoredUser): Promise<void> {
  return putRecord(STORES.USERS, user);
}

export async function getUser(username: string): Promise<StoredUser | null> {
  return getRecord<StoredUser>(STORES.USERS, username);
}

export async function getAllUsers(): Promise<StoredUser[]> {
  return getAllRecords<StoredUser>(STORES.USERS);
}

export async function deleteUser(username: string): Promise<void> {
  return deleteRecord(STORES.USERS, username);
}

export async function clearUsers(): Promise<void> {
  return clearStore(STORES.USERS);
}

// ============================================
// 会话存储 API
// ============================================

export interface StoredSession {
  id: string;
  username: string;
  loginTime: string;
  isTemporary: boolean;
  masterKey?: string; // 加密的临时密钥（用于会话）
}

export async function saveSession(session: StoredSession): Promise<void> {
  return putRecord(STORES.SESSION, session);
}

export async function getSession(): Promise<StoredSession | null> {
  const sessions = await getAllRecords<StoredSession>(STORES.SESSION);
  return sessions[0] || null;
}

export async function clearSession(): Promise<void> {
  return clearStore(STORES.SESSION);
}

// ============================================
// 加密数据存储 API（系统数据）
// ============================================

export interface VaultEntry {
  key: string;
  encryptedData: string;
  iv: string;
  salt: string;
  category: string;
  updatedAt: string;
}

export async function saveToVault(entry: VaultEntry): Promise<void> {
  return putRecord(STORES.VAULT, {
    ...entry,
    updatedAt: new Date().toISOString()
  });
}

export async function getFromVault(key: string): Promise<VaultEntry | null> {
  return getRecord<VaultEntry>(STORES.VAULT, key);
}

export async function getVaultByCategory(category: string): Promise<VaultEntry[]> {
  const store = await getStore(STORES.VAULT);
  
  return new Promise((resolve, reject) => {
    const index = store.index('category');
    const request = index.getAll(category);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFromVault(key: string): Promise<void> {
  return deleteRecord(STORES.VAULT, key);
}

export async function clearVault(): Promise<void> {
  return clearStore(STORES.VAULT);
}

// ============================================
// 设置存储 API
// ============================================

export interface SettingEntry {
  key: string;
  value: unknown;
  updatedAt: string;
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  return putRecord(STORES.SETTINGS, {
    key,
    value,
    updatedAt: new Date().toISOString()
  });
}

export async function getSetting<T>(key: string): Promise<T | null> {
  const entry = await getRecord<SettingEntry>(STORES.SETTINGS, key);
  return entry ? (entry.value as T) : null;
}

export async function deleteSetting(key: string): Promise<void> {
  return deleteRecord(STORES.SETTINGS, key);
}

// ============================================
// 数据库管理
// ============================================

/**
 * 检查数据库是否已初始化
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const users = await getAllUsers();
    return users.length > 0;
  } catch {
    return false;
  }
}

/**
 * 完全重置数据库
 */
export async function resetDatabase(): Promise<void> {
  await clearUsers();
  await clearSession();
  await clearVault();
  
  // 清除设置中的敏感数据
  const database = await initDatabase();
  const transaction = database.transaction(STORES.SETTINGS, 'readwrite');
  const store = transaction.objectStore(STORES.SETTINGS);
  
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * 导出所有数据（用于备份）
 */
export async function exportAllData(): Promise<{
  users: StoredUser[];
  settings: SettingEntry[];
  vault: VaultEntry[];
}> {
  return {
    users: await getAllUsers(),
    settings: await getAllRecords<SettingEntry>(STORES.SETTINGS),
    vault: await getAllRecords<VaultEntry>(STORES.VAULT)
  };
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
