/**
 * @fileoverview WebOS SDK - Main Entry
 * @module @webos/sdk
 * 
 * WebOS 应用开发工具包
 * 
 * @example
 * ```typescript
 * // 创建应用
 * import { createApp, registerApp } from '@webos/sdk';
 * import { useTranslation, useTheme } from '@webos/sdk/react';
 * 
 * const myApp = createApp({
 *   id: 'com.example.myapp',
 *   name: 'My App',
 *   category: 'productivity',
 *   icon: MyAppIcon,
 *   component: MyApp,
 * });
 * 
 * registerApp(myApp);
 * ```
 */

// 导出类型
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

// 导出 React Hooks
export {
  useTranslation,
  useLocale,
  useTheme,
  useWindowManager,
  useFileSystem,
  useNotification,
  useLocalStorage,
  useTabletMode,
  useUser,
  useKeyboardShortcut,
  useWindowFocus,
} from './react';

// 版本信息
export const SDK_VERSION = '1.0.0';
