/**
 * @fileoverview Locale Service - Internationalization
 * @module @kernel/services/locale
 */

import type { IService, ServiceStatus, Subscription } from '../types';

export interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
}

/**
 * LocaleService handles internationalization
 */
export class LocaleService implements IService {
  readonly name = 'locale';
  readonly version = '1.0.0';
  
  private status: ServiceStatus = 'stopped';
  private currentLocale = 'en';
  private locales = new Map<string, LocaleConfig>();
  private translations = new Map<string, Map<string, string>>();
  private listeners: Set<() => void> = new Set();
  
  constructor() {
    // Initialize default locales
    this.locales.set('en', { code: 'en', name: 'English', nativeName: 'English' });
    this.locales.set('zh-CN', { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' });
    this.locales.set('zh-TW', { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' });
    this.locales.set('ja', { code: 'ja', name: 'Japanese', nativeName: '日本語' });
    this.locales.set('ko', { code: 'ko', name: 'Korean', nativeName: '한국어' });
    this.locales.set('de', { code: 'de', name: 'German', nativeName: 'Deutsch' });
    this.locales.set('fr', { code: 'fr', name: 'French', nativeName: 'Français' });
  }
  
  async init(): Promise<void> {
    this.status = 'running';
    // Load saved locale
    const saved = localStorage.getItem('webos-locale');
    if (saved && this.locales.has(saved)) {
      this.currentLocale = saved;
    }
  }
  
  async destroy(): Promise<void> { this.status = 'stopped'; }
  isReady(): boolean { return this.status === 'running'; }
  getStatus(): ServiceStatus { return this.status; }
  
  getCurrentLocale(): string {
    return this.currentLocale;
  }
  
  setLocale(locale: string): boolean {
    if (!this.locales.has(locale)) return false;
    
    this.currentLocale = locale;
    localStorage.setItem('webos-locale', locale);
    this.notifyListeners();
    return true;
  }
  
  getAvailableLocales(): LocaleConfig[] {
    return Array.from(this.locales.values());
  }
  
  registerTranslations(locale: string, translations: Record<string, string>): void {
    if (!this.translations.has(locale)) {
      this.translations.set(locale, new Map());
    }
    
    const map = this.translations.get(locale)!;
    Object.entries(translations).forEach(([key, value]) => {
      map.set(key, value);
    });
  }
  
  t(key: string, params?: Record<string, string>): string {
    const translations = this.translations.get(this.currentLocale);
    let text = translations?.get(key) ?? key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    
    return text;
  }
  
  onLocaleChange(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  subscribe(listener: () => void): Subscription {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(l => { try { l(); } catch { } });
  }
}

export const localeService = new LocaleService();
