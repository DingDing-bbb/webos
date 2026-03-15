/**
 * @fileoverview IndexedDB Storage Adapter
 * @module @kernel/hal/storage/IndexedDBAdapter
 */

import { StorageAdapter } from './StorageAdapter';
import type { StorageCapabilities, IStorageAdapter } from '../types';
import type { StorageConfig, StorageEvent } from './types';

/**
 * IndexedDB-based storage adapter
 * Provides persistent, large-capacity storage
 */
export class IndexedDBAdapter extends StorageAdapter implements IStorageAdapter {
  readonly name = 'indexeddb';
  
  readonly capabilities: StorageCapabilities = {
    persistent: true,
    encrypted: false,
    quota: 'unlimited', // Subject to browser limits
    sync: false,
    transactional: true,
  };
  
  private db: IDBDatabase | null = null;
  private config: Required<StorageConfig>;
  
  constructor(config: StorageConfig = {}) {
    super();
    this.config = {
      dbName: config.dbName || 'webos-storage',
      dbVersion: config.dbVersion || 1,
      storeName: config.storeName || 'default',
      keyPrefix: config.keyPrefix || '',
    };
  }
  
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.dbVersion);
      
      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          db.createObjectStore(this.config.storeName, { keyPath: 'key' });
        }
      };
    });
  }
  
  async destroy(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
  
  private getStore(mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const transaction = this.db.transaction(this.config.storeName, mode);
    return transaction.objectStore(this.config.storeName);
  }
  
  private prefixKey(key: string): string {
    return this.config.keyPrefix ? `${this.config.keyPrefix}:${key}` : key;
  }
  
  async get(key: string): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('readonly');
      const request = store.get(this.prefixKey(key));
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.value ?? null);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to get key "${key}": ${request.error?.message}`));
      };
    });
  }
  
  async set(key: string, value: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('readwrite');
      const prefixedKey = this.prefixKey(key);
      const request = store.put({ key: prefixedKey, value });
      
      request.onsuccess = () => {
        this.emit({
          type: 'set',
          key,
          newValue: value,
          timestamp: Date.now(),
        });
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to set key "${key}": ${request.error?.message}`));
      };
    });
  }
  
  async delete(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('readwrite');
      const prefixedKey = this.prefixKey(key);
      
      // Get old value first
      const getRequest = store.get(prefixedKey);
      
      getRequest.onsuccess = () => {
        const oldValue = getRequest.result?.value;
        const deleteRequest = store.delete(prefixedKey);
        
        deleteRequest.onsuccess = () => {
          this.emit({
            type: 'delete',
            key,
            oldValue,
            timestamp: Date.now(),
          });
          resolve(oldValue !== undefined);
        };
        
        deleteRequest.onerror = () => {
          reject(new Error(`Failed to delete key "${key}": ${deleteRequest.error?.message}`));
        };
      };
      
      getRequest.onerror = () => {
        reject(new Error(`Failed to get key for deletion "${key}": ${getRequest.error?.message}`));
      };
    });
  }
  
  async exists(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('readonly');
      const request = store.get(this.prefixKey(key));
      
      request.onsuccess = () => {
        resolve(request.result !== undefined);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to check existence of key "${key}": ${request.error?.message}`));
      };
    });
  }
  
  async list(prefix?: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('readonly');
      const request = store.getAllKeys();
      
      request.onsuccess = () => {
        const keys = request.result as string[];
        const filtered = keys
          .filter(key => {
            // Remove prefix if configured
            const unprefixed = this.config.keyPrefix 
              ? key.replace(new RegExp(`^${this.config.keyPrefix}:`), '')
              : key;
            return prefix ? unprefixed.startsWith(prefix) : true;
          })
          .map(key => 
            this.config.keyPrefix 
              ? key.replace(new RegExp(`^${this.config.keyPrefix}:`), '')
              : key
          );
        resolve(filtered);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to list keys: ${request.error?.message}`));
      };
    });
  }
  
  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('readwrite');
      const request = store.clear();
      
      request.onsuccess = () => {
        this.emit({
          type: 'clear',
          timestamp: Date.now(),
        });
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to clear store: ${request.error?.message}`));
      };
    });
  }
  
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    // IndexedDB transactions are automatic
    // This method exists for API compatibility
    return fn();
  }
}
