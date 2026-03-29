/**
 * Config Manager - 配置管理
 */

// 系统配置（Turbopack 不支持 DefinePlugin）
const OS_NAME = typeof __OS_NAME__ !== 'undefined' ? __OS_NAME__ : 'WebOS';
declare const __OS_NAME__: string | undefined;

export class ConfigManager {
  private config: Map<string, unknown> = new Map();
  private storageKey = 'webos-config';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([k, v]) => this.config.set(k, v));
      }
    } catch {
      // 忽略错误
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.config);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      // 忽略错误
    }
  }

  get<T>(key: string): T | undefined {
    return this.config.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    this.config.set(key, value);
    this.saveToStorage();
  }

  getSystemName(): string {
    return this.get<string>('systemName') || OS_NAME;
  }

  setSystemName(name: string): void {
    this.set('systemName', name);
  }
}
