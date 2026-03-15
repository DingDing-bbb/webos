/**
 * @fileoverview Abstract Storage Adapter
 * @module @kernel/hal/storage/StorageAdapter
 */

import type { StorageCapabilities, IStorageAdapter } from '../types';
import type { StorageEvent, IStorageAdapterBase } from './types';

/**
 * Abstract base class for storage adapters
 */
export abstract class StorageAdapter implements IStorageAdapterBase {
  abstract readonly name: string;
  abstract readonly capabilities: StorageCapabilities;
  
  protected listeners: Set<(event: StorageEvent) => void> = new Set();
  
  // Lifecycle
  abstract init(): Promise<void>;
  abstract destroy(): Promise<void>;
  
  // Basic operations
  abstract get(key: string): Promise<Uint8Array | null>;
  abstract set(key: string, value: Uint8Array): Promise<void>;
  abstract delete(key: string): Promise<boolean>;
  abstract exists(key: string): Promise<boolean>;
  
  // Bulk operations
  abstract list(prefix?: string): Promise<string[]>;
  abstract clear(): Promise<void>;
  
  // Transactions
  abstract transaction<T>(fn: () => Promise<T>): Promise<T>;
  
  // Events
  subscribe(handler: (event: StorageEvent) => void): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }
  
  protected emit(event: StorageEvent): void {
    this.listeners.forEach(handler => {
      try {
        handler(event);
      } catch (e) {
        console.error('[StorageAdapter] Event handler error:', e);
      }
    });
  }
  
  // Utility methods
  async getString(key: string): Promise<string | null> {
    const data = await this.get(key);
    if (!data) return null;
    return new TextDecoder().decode(data);
  }
  
  async setString(key: string, value: string): Promise<void> {
    await this.set(key, new TextEncoder().encode(value));
  }
  
  async getJSON<T>(key: string): Promise<T | null> {
    const str = await this.getString(key);
    if (!str) return null;
    try {
      return JSON.parse(str) as T;
    } catch {
      return null;
    }
  }
  
  async setJSON<T>(key: string, value: T): Promise<void> {
    await this.setString(key, JSON.stringify(value));
  }
}
