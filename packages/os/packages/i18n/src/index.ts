// i18n 模块入口

import type { LocaleConfig } from '@kernel/types';

// 导入所有语言文件
import en from '../locales/en.json';
import zhCN from '../locales/zh-CN.json';
import zhTW from '../locales/zh-TW.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';

export const translations: Record<string, Record<string, string>> = {
  'en': en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'fr': fr,
  'de': de
};

export const availableLocales: LocaleConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' }
];

// 默认隐藏的语言（可通过修改此数组来显示/隐藏语言）
export const hiddenLocales: string[] = ['fr', 'de'];

// 存储缺失的翻译键（用于开发调试）
const missingKeys = new Set<string>();

// 获取可见的语言列表
export function getVisibleLocales(): LocaleConfig[] {
  return availableLocales.filter(locale => !hiddenLocales.includes(locale.code));
}

// 获取所有语言列表
export function getAllLocales(): LocaleConfig[] {
  return availableLocales;
}

// 检查语言是否可用
export function isLocaleAvailable(locale: string): boolean {
  return locale in translations;
}

// 获取翻译
export function getTranslation(locale: string, key: string): string | undefined {
  return translations[locale]?.[key];
}

/**
 * 强制翻译函数 - 如果键不存在会显示警告
 * @param locale 语言代码
 * @param key 翻译键
 * @param params 可选的插值参数
 * @returns 翻译后的文本
 */
export function t(locale: string, key: string, params?: Record<string, string | number>): string {
  let text = translations[locale]?.[key];
  
  // 如果当前语言没有找到，尝试回退到英文
  if (!text && locale !== 'en') {
    text = translations['en']?.[key];
  }
  
  // 如果还是没找到，记录警告
  if (!text) {
    const missingKey = `${locale}:${key}`;
    if (!missingKeys.has(missingKey)) {
      missingKeys.add(missingKey);
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing translation: "${key}" for locale "${locale}"`);
      }
    }
    // 返回键名作为后备
    return key;
  }
  
  // 处理插值参数
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
  return !!(translations[locale]?.[key] || translations['en']?.[key]);
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
  return Object.keys(translations['en'] || {});
}

/**
 * 检查某个键在所有语言中是否都存在
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

export { en, zhCN, zhTW, fr, de };
