/**
 * @fileoverview Config Service - System Configuration
 * @module @kernel/services/config
 */

import type { IService, ServiceStatus, Subscription } from '../types';

export interface ConfigEntry {
  key: string;
  value: unknown;
  scope: 'system' | 'user' | 'session';
  updatedAt: Date;
}

/**
 * ConfigService manages system configuration
 */
export class ConfigService implements IService {
  readonly name = 'config';
  readonly version = '1.0.0';
  
  private status: ServiceStatus = 'stopped';
  private config = new Map<string, ConfigEntry>();
  private listeners: Set<() => void> = new Set();
  
  async init(): Promise<void> {
    this.status = 'running';
    this.loadFromStorage();
  }
  
  async destroy(): Promise<void> {
    this.status = 'stopped';
  }
  
  isReady(): boolean { return this.status === 'running'; }
  getStatus(): ServiceStatus { return this.status; }
  
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('webos-config');
      if (data) {
        const entries = JSON.parse(data) as [string, ConfigEntry][];
        entries.forEach(([k, v]) => this.config.set(k, v));
      }
    } catch {
      console.warn('[ConfigService] Failed to load config from storage');
    }
  }
  
  private saveToStorage(): void {
    try {
      const data = JSON.stringify(Array.from(this.config.entries()));
      localStorage.setItem('webos-config', data);
    } catch {
      console.warn('[ConfigService] Failed to save config to storage');
    }
  }
  
  get<T>(key: string, defaultValue?: T): T | undefined {
    const entry = this.config.get(key);
    return (entry?.value as T) ?? defaultValue;
  }
  
  set<T>(key: string, value: T, scope: 'system' | 'user' | 'session' = 'user'): void {
    this.config.set(key, {
      key,
      value,
      scope,
      updatedAt: new Date(),
    });
    this.saveToStorage();
    this.notifyListeners();
  }
  
  delete(key: string): boolean {
    const result = this.config.delete(key);
    if (result) {
      this.saveToStorage();
      this.notifyListeners();
    }
    return result;
  }
  
  has(key: string): boolean {
    return this.config.has(key);
  }
  
  getAll(): ConfigEntry[] {
    return Array.from(this.config.values());
  }
  
  getByScope(scope: 'system' | 'user' | 'session'): ConfigEntry[] {
    return this.getAll().filter(e => e.scope === scope);
  }
  
  clear(scope?: 'system' | 'user' | 'session'): void {
    if (scope) {
      const keys = Array.from(this.config.entries())
        .filter(([, v]) => v.scope === scope)
        .map(([k]) => k);
      keys.forEach(k => this.config.delete(k));
    } else {
      this.config.clear();
    }
    this.saveToStorage();
    this.notifyListeners();
  }
  
  // System name shortcut
  getSystemName(): string {
    return this.get('systemName', 'WebOS') ?? 'WebOS';
  }
  
  setSystemName(name: string): void {
    this.set('systemName', name, 'system');
  }
  
  subscribe(listener: () => void): Subscription {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(l => { try { l(); } catch { } });
  }
}

export const configService = new ConfigService();
