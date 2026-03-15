// WebOS Kernel 入口

// 先导出本地类型（避免重复导出）
export type { 
  User, 
  UserSession, 
  UserRole, 
  Permission,
  FileSystemNode,
  WindowOptions,
  WindowState,
  NotifyOptions,
  Alarm,
  LocaleConfig,
  SystemConfig,
  WebOSAPI
} from './types';

export * from './core/windowManager';
export * from './core/userManager';
export * from './core/api';
export * from './core/resourceLoader';
export * from './core/errorHandler';
export { initWebOS, createWebOSAPI } from './core/api';
export { updateManager } from './core/managers/updateManager';

// 安全模块
export * from './core/crypto';
export * from './core/secureStorage';
export { secureUserManager } from './core/secureUserManager';
// Re-export types explicitly for ESM compatibility
import type { SecureUserManagerState as _SecureUserManagerState, LoginResult as _LoginResult } from './core/secureUserManager';
export type SecureUserManagerState = _SecureUserManagerState;
export type LoginResult = _LoginResult;

// 导出文件系统包
export * from '../fs/src';

// 导出应用管理器（不导出类型，避免冲突）
export { appRegistry, createAppManagerAPI } from '../app-manager/src';
