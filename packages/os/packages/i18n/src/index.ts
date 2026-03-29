/**
 * @fileoverview i18n 国际化模块
 * @module @i18n
 */

import type { LocaleConfig } from '@kernel/types';

// 导入语言文件
import en from '../locales/en.json';
import zhCN from '../locales/zh-CN.json';
import zhTW from '../locales/zh-TW.json';

/** 翻译数据类型 */
export type TranslationData = Record<string, string>;

/** 所有语言翻译映射 */
export const translations: Record<string, TranslationData> = {
  'en': en,
  'zh-CN': zhCN,
  'zh-TW': zhTW
};

/** 可用语言列表 */
export const availableLocales: LocaleConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' }
];

/** 默认语言 */
export const DEFAULT_LOCALE = 'en';

/** 缺失翻译键记录 */
const missingKeys = new Set<string>();

/**
 * 获取所有语言列表
 */
export function getAllLocales(): LocaleConfig[] {
  return availableLocales;
}

/**
 * 检查语言是否可用
 */
export function isLocaleAvailable(locale: string): boolean {
  return locale in translations;
}

/**
 * 获取翻译
 */
export function getTranslation(locale: string, key: string): string | undefined {
  return translations[locale]?.[key];
}

/**
 * 翻译函数 - 支持回退到英文
 * @param locale 语言代码
 * @param key 翻译键
 * @param params 可选的插值参数
 */
export function t(locale: string, key: string, params?: Record<string, string | number>): string {
  let text = translations[locale]?.[key];
  
  // 回退到英文
  if (!text && locale !== DEFAULT_LOCALE) {
    text = translations[DEFAULT_LOCALE]?.[key];
  }
  
  // 未找到翻译
  if (!text) {
    const missingKey = `${locale}:${key}`;
    if (!missingKeys.has(missingKey)) {
      missingKeys.add(missingKey);
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing translation: "${key}" for locale "${locale}"`);
      }
    }
    return key;
  }
  
  // 插值处理
  if (params) {
    return text.replace(/\{(\w+)\}/g, (_, paramKey) => {
      return String(params[paramKey] ?? `{${paramKey}}`);
    });
  }
  
  return text;
}

/**
 * 检查翻译键是否存在
 */
export function hasTranslation(locale: string, key: string): boolean {
  return !!(translations[locale]?.[key] || translations[DEFAULT_LOCALE]?.[key]);
}

/**
 * 获取所有缺失的翻译键
 */
export function getMissingKeys(): string[] {
  return Array.from(missingKeys);
}

/**
 * 清除缺失翻译键记录
 */
export function clearMissingKeys(): void {
  missingKeys.clear();
}

/**
 * 获取所有翻译键
 */
export function getAllKeys(): string[] {
  return Object.keys(translations[DEFAULT_LOCALE] || {});
}

/**
 * 验证翻译键在所有语言中的完整性
 */
export function validateKey(key: string): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const locale of Object.keys(translations)) {
    if (!translations[locale][key]) {
      missing.push(locale);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

// 导出语言数据
export { en, zhCN, zhTW };
