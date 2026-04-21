/**
 * @fileoverview Encrypted SQLite Database Module
 * @module @kernel/core/encryptedDatabase
 *
 * Provides an encrypted SQLite database that persists in IndexedDB.
 * The entire database file is encrypted using AES-256-GCM before storage.
 *
 * @architecture
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │                     Memory Layer                            │
 * │  ┌─────────────────────────────────────────────────────┐   │
 * │  │              sql.js (SQLite in WASM)                 │   │
 * │  │         In-memory database operations                │   │
 * │  └─────────────────────────────────────────────────────┘   │
 * └─────────────────────────────────────────────────────────────┘
 *                            │
 *                            │ export() / import()
 *                            ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │                   Encryption Layer                          │
 * │  ┌─────────────────────────────────────────────────────┐   │
 * │  │              AES-256-GCM Encryption                  │   │
 * │  │         Password-derived key (PBKDF2)                │   │
 * │  └─────────────────────────────────────────────────────┘   │
 * └─────────────────────────────────────────────────────────────┘
 *                            │
 *                            │ encrypt() / decrypt()
 *                            ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │                  Persistence Layer                          │
 * │  ┌─────────────────────────────────────────────────────┐   │
 * │  │              IndexedDB Storage                        │   │
 * │  │         Encrypted database blob                      │   │
 * │  └─────────────────────────────────────────────────────┘   │
 * └─────────────────────────────────────────────────────────────┘
 * ```
 *
 * @security
 * - Database is encrypted at rest with AES-256-GCM
 * - Password never stored - used only for key derivation
 * - Each save operation generates new IV and salt
 *
 * @example
 * ```typescript
 * import { initDatabase, saveDatabase, querySql, runSql } from '@kernel/core/encryptedDatabase';
 *
 * // Initialize or unlock database
 * await initDatabase('user-password', true); // true = create new
 *
 * // Execute queries
 * runSql('INSERT INTO users (name) VALUES (?)', ['Alice']);
 * const users = querySql<{name: string}>('SELECT * FROM users');
 *
 * // Persist changes
 * await saveDatabase();
 * ```
 */

import initSqlJs from 'sql.js';
import type { Database, SqlJsStatic } from 'sql.js';
import { encrypt, decrypt, isCryptoAvailable } from './crypto';

// ============================================================================
// Constants
// ============================================================================

/** IndexedDB database name */
const DB_NAME = 'webos-secure-storage';

/** IndexedDB object store name */
const STORE_NAME = 'databases';

/** Primary key for the main database */
const DB_KEY = 'main-db';

// ============================================================================
// Module State
// ============================================================================

/** SQL.js engine instance (singleton) */
let SQL: SqlJsStatic | null = null;

/** Current in-memory database instance */
let database: Database | null = null;

/** Current session password (memory only, never persisted) */
let currentPassword: string | null = null;

/** Initialization flag */
let isInitialized = false;

// ============================================================================
// SQL.js Engine Initialization
// ============================================================================

/**
 * Initializes the SQL.js WebAssembly engine.
 *
 * Attempts to load WASM from local public directory first.
 * Falls back to CDN if local loading fails.
 *
 * @returns {Promise<SqlJsStatic>} Initialized SQL.js instance
 * @throws {Error} If WASM loading fails from all sources
 *
 * @internal
 */
async function initSqlEngine(): Promise<SqlJsStatic> {
  if (SQL) return SQL;

  // Local WASM file path (recommended for production)
  const wasmUrls = ['/wasm/sql-wasm-browser.wasm'];

  let lastError: Error | null = null;

  for (const wasmUrl of wasmUrls) {
    try {
      SQL = await initSqlJs({
        locateFile: (file) => {
          if (file.endsWith('.wasm')) {
            return wasmUrl;
          }
          return file;
        },
      });
      console.log('[EncryptedDB] SQL.js engine initialized from:', wasmUrl);
      return SQL;
    } catch (err) {
      lastError = err as Error;
      console.warn('[EncryptedDB] Failed to load WASM from:', wasmUrl, err);
    }
  }

  throw lastError || new Error('Failed to initialize SQL.js engine');
}

// ============================================================================
// IndexedDB Operations
// ============================================================================

/**
 * Opens or creates the IndexedDB database for encrypted storage.
 *
 * @returns {Promise<IDBDatabase>} IndexedDB database instance
 * @throws {Error} If IndexedDB is unavailable or opening fails
 *
 * @internal
 */
async function getIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Loads the encrypted database blob from IndexedDB.
 *
 * @returns {Promise<{encrypted: string, iv: string, salt: string} | null>}
 *          Encrypted data or null if no database exists
 *
 * @internal
 */
async function loadEncryptedDb(): Promise<{ encrypted: string; iv: string; salt: string } | null> {
  const db = await getIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(DB_KEY);

    request.onsuccess = () => {
      if (request.result) {
        resolve({
          encrypted: request.result.encrypted,
          iv: request.result.iv,
          salt: request.result.salt,
        });
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves the encrypted database blob to IndexedDB.
 *
 * @param {string} encrypted - Base64 encoded encrypted data
 * @param {string} iv - Base64 encoded IV
 * @param {string} salt - Base64 encoded salt
 * @returns {Promise<void>}
 *
 * @internal
 */
async function saveEncryptedDb(encrypted: string, iv: string, salt: string): Promise<void> {
  const db = await getIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      key: DB_KEY,
      encrypted,
      iv,
      salt,
      updatedAt: new Date().toISOString(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// Schema Management
// ============================================================================

/**
 * Creates the database schema with all required tables.
 *
 * Tables:
 * - users: User accounts and authentication data
 * - sessions: Active user sessions
 * - vault: Encrypted user data storage
 * - settings: System configuration
 * - filesystem: Virtual file system metadata
 *
 * @param {Database} db - Database instance
 *
 * @internal
 */
function createTables(db: Database): void {
  // User accounts table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_root INTEGER NOT NULL DEFAULT 0,
      home_dir TEXT,
      permissions TEXT,
      display_name TEXT,
      created_at TEXT,
      last_login TEXT,
      is_temporary INTEGER NOT NULL DEFAULT 0,
      temporary_reason TEXT
    )
  `);

  // Active sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      login_time TEXT NOT NULL,
      is_temporary INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (username) REFERENCES users(username)
    )
  `);

  // Encrypted data vault
  db.run(`
    CREATE TABLE IF NOT EXISTS vault (
      key TEXT PRIMARY KEY,
      encrypted_data TEXT NOT NULL,
      iv TEXT NOT NULL,
      salt TEXT NOT NULL,
      category TEXT,
      updated_at TEXT
    )
  `);

  // System settings
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT
    )
  `);

  // Virtual file system
  db.run(`
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

  // Performance indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_vault_category ON vault(category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_fs_path ON filesystem(path)`);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Initializes or unlocks the encrypted database.
 *
 * This function handles three scenarios:
 * 1. Creating a new database (createNew = true)
 * 2. Unlocking an existing database (createNew = false)
 * 3. Database already unlocked (returns success immediately)
 *
 * @param {string} password - Master password for encryption/decryption
 * @param {boolean} [createNew=false] - Whether to create a new database
 * @returns {Promise<{success: boolean, error?: string}>} Result object
 *
 * @throws {Error} If Web Crypto API is unavailable
 *
 * @example
 * ```typescript
 * // First time setup
 * const result = await initDatabase('user-password', true);
 *
 * // Subsequent unlocks
 * const result = await initDatabase('user-password', false);
 * if (!result.success) {
 *   console.error('Invalid password');
 * }
 * ```
 */
export async function initDatabase(
  password: string,
  createNew: boolean = false
): Promise<{ success: boolean; error?: string }> {
  if (!isCryptoAvailable()) {
    return { success: false, error: 'Web Crypto API not available' };
  }

  try {
    // Return if already unlocked
    if (isUnlocked() && !createNew) {
      console.log('[EncryptedDB] Database already unlocked');
      return { success: true };
    }

    // Initialize SQL.js engine
    const sqlEngine = await initSqlEngine();

    // Attempt to load existing encrypted database
    const existingDb = await loadEncryptedDb();

    if (existingDb && !createNew) {
      // Decrypt existing database
      const decryptedData = await decrypt(
        existingDb.encrypted,
        password,
        existingDb.iv,
        existingDb.salt
      );

      // Create database from decrypted binary data
      const binaryData = Uint8Array.from(atob(decryptedData), (c) => c.charCodeAt(0));
      database = new sqlEngine.Database(binaryData);
      currentPassword = password;
      isInitialized = true;

      console.log('[EncryptedDB] Database unlocked successfully');
      return { success: true };
    } else if (createNew) {
      // Close existing database if any
      if (database) {
        database.close();
        database = null;
      }

      // Create new empty database
      database = new sqlEngine.Database();
      createTables(database);
      currentPassword = password;
      isInitialized = true;

      // Encrypt and save
      await saveDatabase();

      console.log('[EncryptedDB] New database created and encrypted');
      return { success: true };
    }

    return { success: false, error: 'Invalid state' };
  } catch (error) {
    console.error('[EncryptedDB] Initialization failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Saves the current database state to IndexedDB.
 *
 * Exports the in-memory database to binary, encrypts it,
 * and persists the encrypted blob to IndexedDB.
 *
 * @returns {Promise<void>}
 * @throws {Error} If database is not initialized or password is not set
 *
 * @example
 * ```typescript
 * // Make changes
 * runSql('UPDATE settings SET value = ? WHERE key = ?', ['dark', 'theme']);
 *
 * // Persist changes
 * await saveDatabase();
 * ```
 */
export async function saveDatabase(): Promise<void> {
  if (!database || !currentPassword) {
    throw new Error('Database not initialized or not unlocked');
  }

  // Export database to binary
  const binaryData = database.export();
  const base64Data = btoa(String.fromCharCode(...binaryData));

  // Encrypt the database
  const encrypted = await encrypt(base64Data, currentPassword);

  // Persist to IndexedDB
  await saveEncryptedDb(encrypted.encrypted, encrypted.iv, encrypted.salt);
}

/**
 * Checks if an encrypted database exists in IndexedDB.
 *
 * @returns {Promise<boolean>} True if database exists
 *
 * @example
 * ```typescript
 * const hasExistingDb = await databaseExists();
 * if (hasExistingDb) {
 *   // Show login screen
 * } else {
 *   // Show OOBE
 * }
 * ```
 */
export async function databaseExists(): Promise<boolean> {
  const existingDb = await loadEncryptedDb();
  return existingDb !== null;
}

/**
 * Checks if the database is currently unlocked and ready.
 *
 * @returns {boolean} True if database is unlocked
 *
 * @example
 * ```typescript
 * if (!isUnlocked()) {
 *   throw new Error('Database is locked');
 * }
 * ```
 */
export function isUnlocked(): boolean {
  return isInitialized && database !== null && currentPassword !== null;
}

/**
 * Gets the raw database instance for advanced operations.
 *
 * @returns {Database | null} Database instance or null if not unlocked
 *
 * @example
 * ```typescript
 * const db = getDatabase();
 * if (db) {
 *   const result = db.exec('PRAGMA table_info(users)');
 * }
 * ```
 */
export function getDatabase(): Database | null {
  return database;
}

/**
 * Executes a SQL statement that modifies data.
 *
 * @param {string} sql - SQL statement with optional placeholders
 * @param {unknown[]} [params=[]] - Parameter values for placeholders
 * @returns {{changes: number, lastInsertRowId: number}} Affected rows info
 *
 * @example
 * ```typescript
 * // Insert
 * const result = runSql(
 *   'INSERT INTO users (username, role) VALUES (?, ?)',
 *   ['alice', 'user']
 * );
 * console.log('Inserted ID:', result.lastInsertRowId);
 *
 * // Update
 * const { changes } = runSql(
 *   'UPDATE users SET role = ? WHERE username = ?',
 *   ['admin', 'alice']
 * );
 * console.log('Rows updated:', changes);
 * ```
 */
export function runSql(
  sql: string,
  params: unknown[] = []
): { changes: number; lastInsertRowId: number } {
  if (!database) {
    throw new Error('Database not initialized');
  }

  database.run(sql, params);
  return {
    changes: database.getRowsModified(),
    lastInsertRowId:
      (database.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] as number) || 0,
  };
}

/**
 * Executes a SQL query and returns results as typed objects.
 *
 * @template T - Type of the returned objects
 * @param {string} sql - SQL SELECT statement
 * @param {unknown[]} [params=[]] - Parameter values for placeholders
 * @returns {T[]} Array of result objects
 *
 * @example
 * ```typescript
 * interface UserRow {
 *   username: string;
 *   role: string;
 *   display_name: string;
 * }
 *
 * const users = querySql<UserRow>('SELECT username, role, display_name FROM users WHERE role = ?', ['admin']);
 * users.forEach(user => console.log(user.username));
 * ```
 */
export function querySql<T = unknown>(sql: string, params: unknown[] = []): T[] {
  if (!database) {
    throw new Error('Database not initialized');
  }

  const result = database.exec(sql, params);
  if (result.length === 0) return [];

  const columns = result[0].columns;
  const values = result[0].values;

  return values.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj as T;
  });
}

/**
 * Closes the database and clears sensitive data from memory.
 *
 * After calling this function, initDatabase must be called again
 * with the correct password to access the database.
 *
 * @example
 * ```typescript
 * // Lock the system
 * closeDatabase();
 * // Now user must re-authenticate
 * ```
 */
export function closeDatabase(): void {
  if (database) {
    database.close();
    database = null;
  }
  currentPassword = null;
  isInitialized = false;
}

/**
 * Permanently deletes the encrypted database from IndexedDB.
 *
 * This operation cannot be undone.
 *
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * // Factory reset
 * await deleteDatabase();
 * location.reload();
 * ```
 */
export async function deleteDatabase(): Promise<void> {
  closeDatabase();

  const db = await getIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(DB_KEY);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Changes the encryption password for the database.
 *
 * Re-encrypts the database with the new password.
 * Database must be unlocked before calling this function.
 *
 * @param {string} newPassword - New encryption password
 * @returns {Promise<void>}
 * @throws {Error} If database is not unlocked
 *
 * @example
 * ```typescript
 * await changePassword('new-secure-password');
 * ```
 */
export async function changePassword(newPassword: string): Promise<void> {
  if (!isUnlocked()) {
    throw new Error('Database not unlocked');
  }

  currentPassword = newPassword;
  await saveDatabase();
}

/**
 * Gets statistics about the current database.
 *
 * @returns {{userCount: number, vaultCount: number, settingsCount: number}}
 *          Object containing row counts for main tables
 *
 * @example
 * ```typescript
 * const stats = getStats();
 * console.log(`Users: ${stats.userCount}, Vault entries: ${stats.vaultCount}`);
 * ```
 */
export function getStats(): {
  userCount: number;
  vaultCount: number;
  settingsCount: number;
} {
  if (!database) {
    return { userCount: 0, vaultCount: 0, settingsCount: 0 };
  }

  const userResult = database.exec('SELECT COUNT(*) FROM users');
  const vaultResult = database.exec('SELECT COUNT(*) FROM vault');
  const settingsResult = database.exec('SELECT COUNT(*) FROM settings');

  return {
    userCount: (userResult[0]?.values[0]?.[0] as number) || 0,
    vaultCount: (vaultResult[0]?.values[0]?.[0] as number) || 0,
    settingsCount: (settingsResult[0]?.values[0]?.[0] as number) || 0,
  };
}
