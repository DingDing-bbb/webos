/**
 * @fileoverview Storage Adapter Types
 * @module @kernel/hal/storage/types
 */

import type { StorageCapabilities, IStorageAdapter } from '../types';

/**
 * Storage adapter configuration
 */
export interface StorageConfig {
  /** Database name for IndexedDB */
  dbName?: string;
  /** Database version */
  dbVersion?: number;
  /** Store name */
  storeName?: string;
  /** Key prefix for namespacing */
  keyPrefix?: string;
}

/**
 * Storage event types
 */
export type StorageEventType = 'set' | 'delete' | 'clear';

/**
 * Storage event
 */
export interface StorageEvent {
  type: StorageEventType;
  key?: string;
  oldValue?: Uint8Array | null;
  newValue?: Uint8Array | null;
  timestamp: number;
}

/**
 * Storage adapter base class interface
 */
export interface IStorageAdapterBase extends IStorageAdapter {
  // Events
  subscribe(handler: (event: StorageEvent) => void): () => void;
  
  // Utility
  getString(key: string): Promise<string | null>;
  setString(key: string, value: string): Promise<void>;
  getJSON<T>(key: string): Promise<T | null>;
  setJSON<T>(key: string, value: T): Promise<void>;
}

/**
 * Re-export from parent types
 */
export type { StorageCapabilities, IStorageAdapter };
