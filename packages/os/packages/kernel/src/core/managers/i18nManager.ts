/**
 * I18n Manager - 国际化管理
 * 基于@i18n包的统一翻译管理器
 */

import type { LocaleConfig } from '../../types';
import { 
  t as i18nT, 
  getAllLocales, 
  availableLocales, 
  DEFAULT_LOCALE,
  isLocaleAvailable,
  getTranslation,
  hasTranslation
} from '@i18n';

export class I18nManager {
  private currentLocale: string = DEFAULT_LOCALE;
  private listeners: Set<(locale: string) => void> = new Set();
  private availableLocales: LocaleConfig[] = availableLocales;
  
  constructor() {
    // 从localStorage加载保存的语言设置
    this.loadSavedLocale();
  }
  
  private loadSavedLocale(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('webos-locale');
      const saved2 = localStorage.getItem('webos-language');
      const locale = saved || saved2;
      if (locale && isLocaleAvailable(locale)) {
        this.currentLocale = locale;
      }
    }
  }
  
  private saveLocale(locale: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('webos-locale', locale);
    }
  }

  getCurrentLocale(): string {
    return this.currentLocale;
  }

  setLocale(locale: string): void {
    if (isLocaleAvailable(locale)) {
      this.currentLocale = locale;
      this.saveLocale(locale);
      this.listeners.forEach((cb) => cb(locale));
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    return i18nT(this.currentLocale, key, params);
  }

  getAvailableLocales(): LocaleConfig[] {
    return this.availableLocales;
  }

  getAllLocales(): LocaleConfig[] {
    return this.availableLocales;
  }

  onLocaleChange(callback: (locale: string) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}