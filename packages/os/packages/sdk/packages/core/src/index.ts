/**
 * @fileoverview WebOS SDK Core
 * @module @webos/sdk-core
 * 
 * SDK 核心功能模块
 */

// 重新导出类型
export type {
  AppConfig,
  AppCategory,
  AppPermission,
  AppStatus,
  AppInstance,
  AppManifest,
  AppEvent,
  AppEventListener,
  CategoryInfo,
  IconProps,
  WindowOptions,
  WindowState,
  FileSystemNode,
  DirEntry,
  NotifyOptions,
  Alarm,
  UserRole,
  Permission,
  User,
  LaunchOptions,
  LocaleConfig,
  TranslationData,
  AppTranslations,
  BuildConfig,
} from './types';

// 导出应用工具
export {
  registerApp,
  unregisterApp,
  getApp,
  getAllApps,
  getAppsByCategory,
  isAppRegistered,
  createApp,
  CATEGORIES,
  CategoryIcons,
} from './app';

// 导出工具函数
export * from './utils';

// 版本信息
export const SDK_VERSION = '2.0.0';
export const SDK_NAME = '@webos/sdk-core';
