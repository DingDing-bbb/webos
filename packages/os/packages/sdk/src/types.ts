/**
 * @fileoverview WebOS SDK - Type Definitions
 * @module @webos/sdk/types
 * 
 * 应用开发所需的所有类型定义
 */

import type { FC, CSSProperties } from 'react';

// ============================================
// 基础类型
// ============================================

/**
 * 图标组件属性
 */
export interface IconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * 应用分类
 */
export type AppCategory =
  | 'system'       // 系统工具
  | 'productivity' // 生产力
  | 'media'        // 媒体
  | 'games'        // 游戏
  | 'network'      // 网络
  | 'development'  // 开发
  | 'utilities';   // 实用工具

/**
 * 应用权限
 */
export type AppPermission = 
  | 'fs:read'       // 文件系统读取
  | 'fs:write'      // 文件系统写入
  | 'network'       // 网络访问
  | 'notification'  // 通知
  | 'clipboard'     // 剪贴板
  | 'storage';      // 本地存储

/**
 * 应用状态
 */
export type AppStatus = 'running' | 'stopped' | 'installed' | 'pending';

// ============================================
// 应用定义
// ============================================

/**
 * 应用信息配置
 * 
 * @example
 * ```typescript
 * const myApp: AppConfig = {
 *   id: 'com.example.myapp',
 *   name: 'My App',
 *   nameKey: 'app.myapp.name',
 *   version: '1.0.0',
 *   category: 'productivity',
 *   icon: MyAppIcon,
 *   component: MyApp,
 *   defaultWidth: 800,
 *   defaultHeight: 600,
 * };
 * ```
 */
export interface AppConfig {
  /** 应用ID，推荐格式：com.company.appname */
  id: string;
  
  /** 应用名称 */
  name: string;
  
  /** 国际化键名 */
  nameKey: string;
  
  /** 应用描述 */
  description?: string;
  
  /** 描述国际化键名 */
  descriptionKey?: string;
  
  /** 版本号 */
  version: string;
  
  /** 作者 */
  author?: string;
  
  /** 分类 */
  category: AppCategory;
  
  /** 图标组件 */
  icon: FC<IconProps>;
  
  /** 应用主组件 */
  component: FC;
  
  /** 默认窗口宽度 */
  defaultWidth?: number;
  
  /** 默认窗口高度 */
  defaultHeight?: number;
  
  /** 最小窗口宽度 */
  minWidth?: number;
  
  /** 最小窗口高度 */
  minHeight?: number;
  
  /** 是否可调整窗口大小 */
  resizable?: boolean;
  
  /** 是否单例模式（只能打开一个窗口） */
  singleton?: boolean;
  
  /** 应用所需权限 */
  permissions?: AppPermission[];
  
  /** 入口文件路径 */
  entry?: string;
}

/**
 * 应用实例
 */
export interface AppInstance {
  /** 实例ID */
  id: string;
  
  /** 应用ID */
  appId: string;
  
  /** 窗口ID */
  windowId?: string;
  
  /** 启动时间 */
  startTime: Date;
  
  /** 状态 */
  status: AppStatus;
}

/**
 * 分类信息
 */
export interface CategoryInfo {
  id: AppCategory;
  nameKey: string;
  icon: FC<IconProps>;
}

/**
 * 启动选项
 */
export interface LaunchOptions {
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}

// ============================================
// 窗口系统
// ============================================

/**
 * 窗口选项
 */
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

/**
 * 窗口状态
 */
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

/**
 * 文件系统节点
 */
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

/**
 * 目录条目
 */
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

/**
 * 通知选项
 */
export interface NotifyOptions {
  title: string;
  message: string;
  icon?: string;
  duration?: number;
}

/**
 * 闹钟
 */
export interface Alarm {
  id: string;
  time: Date;
  callback: () => void;
  enabled: boolean;
}

// ============================================
// 用户系统
// ============================================

/**
 * 用户角色
 */
export type UserRole = 'root' | 'admin' | 'user' | 'guest';

/**
 * 权限类型
 */
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

/**
 * 用户信息
 */
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

/**
 * 语言配置
 */
export interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
}

// ============================================
// 翻译数据
// ============================================

/**
 * 翻译数据类型
 */
export type TranslationData = Record<string, string>;

/**
 * 应用翻译配置
 */
export interface AppTranslations {
  [locale: string]: TranslationData;
}

// ============================================
// 应用清单 (appinfo.json)
// ============================================

/**
 * 应用清单文件
 * 
 * @example
 * ```json
 * {
 *   "id": "com.example.myapp",
 *   "name": "My App",
 *   "version": "1.0.0",
 *   "category": "productivity",
 *   "main": "./dist/index.js",
 *   "icon": "./dist/icon.js"
 * }
 * ```
 */
export interface AppManifest {
  /** 应用ID */
  id: string;
  
  /** 应用名称 */
  name: string;
  
  /** 版本 */
  version: string;
  
  /** 分类 */
  category: AppCategory;
  
  /** 入口文件 */
  main: string;
  
  /** 图标文件 */
  icon: string;
  
  /** 描述 */
  description?: string;
  
  /** 作者 */
  author?: string;
  
  /** 默认宽度 */
  defaultWidth?: number;
  
  /** 默认高度 */
  defaultHeight?: number;
  
  /** 最小宽度 */
  minWidth?: number;
  
  /** 最小高度 */
  minHeight?: number;
  
  /** 可调整大小 */
  resizable?: boolean;
  
  /** 单例模式 */
  singleton?: boolean;
  
  /** 权限 */
  permissions?: AppPermission[];
  
  /** 依赖 */
  dependencies?: Record<string, string>;
}

// ============================================
// 事件系统
// ============================================

/**
 * 应用事件
 */
export interface AppEvent {
  type: 'install' | 'uninstall' | 'launch' | 'close' | 'update';
  appId: string;
  timestamp: Date;
  data?: unknown;
}

/**
 * 应用事件监听器
 */
export type AppEventListener = (event: AppEvent) => void;

// ============================================
// 构建配置
// ============================================

/**
 * SDK 构建配置
 */
export interface BuildConfig {
  /** 入口文件 */
  entry: string;
  
  /** 输出目录 */
  outDir: string;
  
  /** 应用清单 */
  manifest: AppManifest;
  
  /** 是否压缩 */
  minify?: boolean;
  
  /** 是否生成 source map */
  sourcemap?: boolean;
  
  /** 外部依赖 */
  external?: string[];
  
  /** 翻译文件目录 */
  localesDir?: string;
}
