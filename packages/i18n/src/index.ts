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

export { en, zhCN, zhTW, fr, de };
