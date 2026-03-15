/**
 * @fileoverview HAL Layer Exports
 * @module @kernel/hal
 */

// Types
export * from './types';

// Storage
export { StorageAdapter } from './storage/StorageAdapter';
export { IndexedDBAdapter } from './storage/IndexedDBAdapter';
export { LocalStorageAdapter } from './storage/LocalStorageAdapter';
export * from './storage/types';

// Network
export { NetworkAdapter } from './network/NetworkAdapter';
export { FetchAdapter } from './network/FetchAdapter';
export * from './network/types';

// Input
export { InputAdapter } from './input/InputAdapter';
export { KeyboardAdapter } from './input/KeyboardAdapter';
export { MouseAdapter } from './input/MouseAdapter';
export { TouchAdapter } from './input/TouchAdapter';
export * from './input/types';
