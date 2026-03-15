/**
 * @fileoverview LocalStorage Adapter
 * @module @kernel/hal/storage/LocalStorageAdapter
 */

import { StorageAdapter } from './StorageAdapter';
import type { StorageCapabilities, IStorageAdapter } from '../types';
import type { StorageConfig, StorageEvent } from './types';

/**
 * localStorage-based storage adapter
 * Provides synchronous, small-capacity persistent storage
 */
export class LocalStorageAdapter extends StorageAdapter implements IStorageAdapter {
  readonly name = 'localstorage';
  
  readonly capabilities: StorageCapabilities = {
    persistent: true,
    encrypted: false,
    quota: 5 * 1024 * 1024, // ~5MB typical limit
    sync: true,
    transactional: false,
  };
  
  private config: Required<StorageConfig>;
  private storage: Storage;
  
  constructor(config: StorageConfig = {}) {
    super();
    this.config = {
      dbName: config.dbName || 'webos',
      dbVersion: config.dbVersion || 1,
      storeName: config.storeName || 'default',
      keyPrefix: config.keyPrefix || 'webos',
    };
    this.storage = window.localStorage;
  }
  
  async init(): Promise<void> {
    // localStorage is always available
    // No initialization needed
  }
  
  async destroy(): Promise<void> {
    // Nothing to destroy
  }
  
  private prefixKey(key: string): string {
    return this.config.keyPrefix ? `${this.config.keyPrefix}:${key}` : key;
  }
  
  private encode(data: Uint8Array): string {
    // Convert to base64 for storage
    let binary = '';
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    return btoa(binary);
  }
  
  private decode(str: string): Uint8Array {
    // Convert from base64
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  
  async get(key: string): Promise<Uint8Array | null> {
    const prefixedKey = this.prefixKey(key);
    const value = this.storage.getItem(prefixedKey);
    if (value === null) return null;
    try {
      return this.decode(value);
    } catch {
      // Not base64 encoded, might be a plain string
      return new TextEncoder().encode(value);
    }
  }
  
  async set(key: string, value: Uint8Array): Promise<void> {
    const prefixedKey = this.prefixKey(key);
    const encoded = this.encode(value);
    const oldValue = this.storage.getItem(prefixedKey);
    
    this.storage.setItem(prefixedKey, encoded);
    
    this.emit({
      type: 'set',
      key,
      oldValue: oldValue ? this.decode(oldValue) : null,
      newValue: value,
      timestamp: Date.now(),
    });
  }
  
  async delete(key: string): Promise<boolean> {
    const prefixedKey = this.prefixKey(key);
    const oldValue = this.storage.getItem(prefixedKey);
    
    if (oldValue === null) return false;
    
    this.storage.removeItem(prefixedKey);
    
    this.emit({
      type: 'delete',
      key,
      oldValue: this.decode(oldValue),
      timestamp: Date.now(),
    });
    
    return true;
  }
  
  async exists(key: string): Promise<boolean> {
    const prefixedKey = this.prefixKey(key);
    return this.storage.getItem(prefixedKey) !== null;
  }
  
  async list(prefix?: string): Promise<string[]> {
    const keys: string[] = [];
    const prefixToMatch = this.config.keyPrefix 
      ? `${this.config.keyPrefix}:${prefix ?? ''}`
      : prefix ?? '';
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(prefixToMatch)) {
        // Remove prefix
        const unprefixed = this.config.keyPrefix
          ? key.replace(new RegExp(`^${this.config.keyPrefix}:`), '')
          : key;
        keys.push(unprefixed);
      }
    }
    
    return keys;
  }
  
  async clear(): Promise<void> {
    if (this.config.keyPrefix) {
      // Only clear keys with our prefix
      const keys: string[] = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(`${this.config.keyPrefix}:`)) {
          keys.push(key);
        }
      }
      keys.forEach(key => this.storage.removeItem(key));
    } else {
      this.storage.clear();
    }
    
    this.emit({
      type: 'clear',
      timestamp: Date.now(),
    });
  }
  
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    // localStorage doesn't support transactions
    // Just execute the function
    return fn();
  }
}
