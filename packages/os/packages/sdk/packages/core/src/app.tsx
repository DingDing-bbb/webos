/**
 * @fileoverview WebOS SDK Core - Application Helpers
 */

import type { AppConfig, AppCategory, CategoryInfo, IconProps } from './types';
import React from 'react';

// ============================================
// 应用注册
// ============================================

const appRegistry = new Map<string, AppConfig>();

export function registerApp(app: AppConfig): void {
  if (appRegistry.has(app.id)) {
    console.warn(`[SDK] App ${app.id} already registered, overwriting...`);
  }
  appRegistry.set(app.id, app);
  
  if (typeof window !== 'undefined' && window.webos?.apps) {
    window.webos.apps.register(app);
  }
}

export function unregisterApp(appId: string): boolean {
  const deleted = appRegistry.delete(appId);
  if (deleted && typeof window !== 'undefined' && window.webos?.apps) {
    window.webos.apps.unregister(appId);
  }
  return deleted;
}

export function getApp(appId: string): AppConfig | undefined {
  return appRegistry.get(appId) || window.webos?.apps?.get(appId);
}

export function getAllApps(): AppConfig[] {
  const localApps = Array.from(appRegistry.values());
  const systemApps = window.webos?.apps?.getAll() || [];
  return [...localApps, ...systemApps.filter(a => !appRegistry.has(a.id))];
}

export function getAppsByCategory(category: AppCategory): AppConfig[] {
  return getAllApps().filter(app => app.category === category);
}

export function isAppRegistered(appId: string): boolean {
  return appRegistry.has(appId) || window.webos?.apps?.isRegistered?.(appId) === true;
}

// ============================================
// 应用工厂
// ============================================

export function createApp(config: AppConfig): AppConfig {
  return {
    defaultWidth: 700,
    defaultHeight: 450,
    resizable: true,
    singleton: false,
    ...config,
    nameKey: config.nameKey || `app.${config.id.split('.').pop()}.name`,
  };
}

// ============================================
// 分类图标
// ============================================

export const CategoryIcons: Record<AppCategory, React.FC<IconProps>> = {
  system: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  productivity: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  media: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  games: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <line x1="6" y1="12" x2="10" y2="12"/>
      <line x1="8" y1="10" x2="8" y2="14"/>
    </svg>
  ),
  network: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/>
    </svg>
  ),
  development: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  utilities: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/>
    </svg>
  ),
};

export const CATEGORIES: CategoryInfo[] = [
  { id: 'system', nameKey: 'category.system', icon: CategoryIcons.system },
  { id: 'productivity', nameKey: 'category.productivity', icon: CategoryIcons.productivity },
  { id: 'media', nameKey: 'category.media', icon: CategoryIcons.media },
  { id: 'games', nameKey: 'category.games', icon: CategoryIcons.games },
  { id: 'network', nameKey: 'category.network', icon: CategoryIcons.network },
  { id: 'development', nameKey: 'category.development', icon: CategoryIcons.development },
  { id: 'utilities', nameKey: 'category.utilities', icon: CategoryIcons.utilities },
];

// ============================================
// 类型声明
// ============================================

declare global {
  interface Window {
    webos?: {
      apps?: {
        register: (app: AppConfig) => void;
        unregister: (appId: string) => boolean;
        get: (appId: string) => AppConfig | undefined;
        getAll: () => AppConfig[];
        isRegistered: (appId: string) => boolean;
      };
    };
  }
}
