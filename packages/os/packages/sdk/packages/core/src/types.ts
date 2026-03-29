/**
 * @fileoverview WebOS SDK Core Types
 * @module @webos/sdk-core/types
 */

import type { FC, CSSProperties } from 'react';

// ============================================
// 基础类型
// ============================================

export interface IconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export type AppCategory =
  | 'system'
  | 'productivity'
  | 'media'
  | 'games'
  | 'network'
  | 'development'
  | 'utilities';

export type AppPermission = 
  | 'fs:read'
  | 'fs:write'
  | 'network'
  | 'notification'
  | 'clipboard'
  | 'storage';

export type AppStatus = 'running' | 'stopped' | 'installed' | 'pending';

// ============================================
// 应用定义
// ============================================

export interface AppConfig {
  id: string;
  name: string;
  nameKey: string;
  description?: string;
  descriptionKey?: string;
  version: string;
  author?: string;
  category: AppCategory;
  icon: FC<IconProps>;
  component: FC;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  singleton?: boolean;
  permissions?: AppPermission[];
  entry?: string;
}

export interface AppInstance {
  id: string;
  appId: string;
  windowId?: string;
  startTime: Date;
  status: AppStatus;
}

export interface CategoryInfo {
  id: AppCategory;
  nameKey: string;
  icon: FC<IconProps>;
}

export interface LaunchOptions {
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}

// ============================================
// 窗口系统
// ============================================

export interface WindowOptions {
  id?: string;
  title: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  appId?: string;
  content?: string | HTMLElement;
}

export interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  zIndex: number;
  resizable: boolean;
  minimizable: boolean;
  maximizable: boolean;
  closable: boolean;
  appId?: string;
  restoreX?: number;
  restoreY?: number;
  restoreWidth?: number;
  restoreHeight?: number;
}

// ============================================
// 文件系统
// ============================================

export interface FileSystemNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  size: number;
  content?: string;
  children?: Map<string, FileSystemNode>;
  createdAt: Date;
  modifiedAt: Date;
}

export interface DirEntry {
  name: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  size: number;
  modifiedAt: Date;
}

// ============================================
// 通知系统
// ============================================

export interface NotifyOptions {
  title: string;
  message: string;
  icon?: string;
  duration?: number;
}

export interface Alarm {
  id: string;
  time: Date;
  callback: () => void;
  enabled: boolean;
}

// ============================================
// 用户系统
// ============================================

export type UserRole = 'root' | 'admin' | 'user' | 'guest';

export type Permission =
  | 'read:files'
  | 'write:files'
  | 'delete:files'
  | 'read:settings'
  | 'write:settings'
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'execute:commands'
  | 'admin:system';

export interface User {
  username: string;
  password: string;
  role: UserRole;
  isRoot: boolean;
  homeDir: string;
  permissions: Permission[];
  displayName?: string;
  createdAt?: Date;
  lastLogin?: Date;
  isTemporary?: boolean;
  temporaryReason?: string;
}

// ============================================
// 国际化
// ============================================

export interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
}

export type TranslationData = Record<string, string>;

export interface AppTranslations {
  [locale: string]: TranslationData;
}

// ============================================
// 应用清单
// ============================================

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  category: AppCategory;
  main: string;
  icon: string;
  description?: string;
  author?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  singleton?: boolean;
  permissions?: AppPermission[];
  dependencies?: Record<string, string>;
}

// ============================================
// 事件系统
// ============================================

export interface AppEvent {
  type: 'install' | 'uninstall' | 'launch' | 'close' | 'update';
  appId: string;
  timestamp: Date;
  data?: unknown;
}

export type AppEventListener = (event: AppEvent) => void;

// ============================================
// 构建配置
// ============================================

export interface BuildConfig {
  entry: string;
  outDir: string;
  manifest: AppManifest;
  minify?: boolean;
  sourcemap?: boolean;
  external?: string[];
  localesDir?: string;
}
