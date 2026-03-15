/**
 * @fileoverview Config Types
 * @module @kernel/services/config/types
 */

export interface ConfigOptions {
  scope?: 'system' | 'user' | 'session';
  persistent?: boolean;
}

export interface ConfigSchema {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: unknown;
  required?: boolean;
  description?: string;
}
