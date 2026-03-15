/**
 * @fileoverview Locale Types
 * @module @kernel/services/locale/types
 */

export interface LocaleOptions {
  fallback?: string;
  detectBrowser?: boolean;
}

export type PluralRule = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
