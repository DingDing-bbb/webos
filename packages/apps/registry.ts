/**
 * WebOS 应用注册中心
 * 统一管理所有应用的注册、图标和信息
 */

import React from 'react';

// 应用信息接口
export interface AppInfo {
  id: string;           // 应用ID，如 com.os.filemanager
  name: string;         // 应用名称
  nameKey: string;      // 国际化键名
  description?: string; // 描述
  descriptionKey?: string; // 描述国际化键名
  version: string;      // 版本号
  author?: string;      // 作者
  category: AppCategory; // 分类
  icon: React.FC<IconProps>; // 图标组件
  component: React.FC;  // 应用组件
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  singleton?: boolean;  // 是否单例（只能打开一个窗口）
}

// 图标组件属性
export interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// 应用分类
export type AppCategory =
  | 'system'     // 系统工具
  | 'productivity' // 生产力
  | 'media'      // 媒体
  | 'games'      // 游戏
  | 'network'    // 网络
  | 'development' // 开发
  | 'utilities'; // 实用工具

// 分类信息
export interface CategoryInfo {
  id: AppCategory;
  nameKey: string;
  icon: React.FC<IconProps>;
}

// 应用注册表
const appRegistry = new Map<string, AppInfo>();

/**
 * 注册应用
 */
export function registerApp(app: AppInfo): void {
  if (appRegistry.has(app.id)) {
    console.warn(`App ${app.id} is already registered, overwriting...`);
  }
  appRegistry.set(app.id, app);
}

/**
 * 获取应用信息
 */
export function getApp(appId: string): AppInfo | undefined {
  return appRegistry.get(appId);
}

/**
 * 获取所有应用
 */
export function getAllApps(): AppInfo[] {
  return Array.from(appRegistry.values());
}

/**
 * 按分类获取应用
 */
export function getAppsByCategory(category: AppCategory): AppInfo[] {
  return getAllApps().filter(app => app.category === category);
}

/**
 * 获取应用图标
 */
export function getAppIcon(appId: string): React.FC<IconProps> | undefined {
  const app = appRegistry.get(appId);
  return app?.icon;
}

/**
 * 检查应用是否已注册
 */
export function isAppRegistered(appId: string): boolean {
  return appRegistry.has(appId);
}

// ============================================
// 分类图标
// ============================================

export const CategoryIcons = {
  system: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  productivity: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  media: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  games: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <line x1="6" y1="12" x2="10" y2="12"/>
      <line x1="8" y1="10" x2="8" y2="14"/>
      <circle cx="16" cy="10" r="1" fill="currentColor"/>
      <circle cx="18" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),
  network: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  development: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  utilities: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  ),
};

// 分类信息列表
export const CATEGORIES: CategoryInfo[] = [
  { id: 'system', nameKey: 'category.system', icon: CategoryIcons.system },
  { id: 'productivity', nameKey: 'category.productivity', icon: CategoryIcons.productivity },
  { id: 'media', nameKey: 'category.media', icon: CategoryIcons.media },
  { id: 'games', nameKey: 'category.games', icon: CategoryIcons.games },
  { id: 'network', nameKey: 'category.network', icon: CategoryIcons.network },
  { id: 'development', nameKey: 'category.development', icon: CategoryIcons.development },
  { id: 'utilities', nameKey: 'category.utilities', icon: CategoryIcons.utilities },
];
