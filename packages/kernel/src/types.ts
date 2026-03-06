// 系统核心类型定义

// 用户角色类型
export type UserRole = 'root' | 'admin' | 'user' | 'guest';

// 权限类型
export type Permission =
  // 文件权限
  | 'read:files'
  | 'write:files'
  | 'delete:files'
  // 设置权限
  | 'read:settings'
  | 'write:settings'
  // 用户管理权限
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  // 命令执行权限
  | 'execute:commands'
  // 系统管理
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

export interface UserSession {
  user: User;
  loginTime: Date;
  isTemporary: boolean;
}

export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  content?: string;
  children?: Map<string, FileSystemNode>;
  createdAt: Date;
  modifiedAt: Date;
}

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
  // 窗口恢复位置（最大化前）
  restoreX?: number;
  restoreY?: number;
  restoreWidth?: number;
  restoreHeight?: number;
}

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

export interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
}

export interface SystemConfig {
  osName: string;
  osVersion: string;
  locale: string;
  userName: string;
  systemName: string;
}

export interface WebOSAPI {
  // 快捷翻译方法
  t: (key: string, params?: Record<string, string>) => string;

  // 设置窗口容器
  setWindowContainer: (element: HTMLDivElement) => void;

  window: {
    open: (appId: string, options?: WindowOptions) => string;
    close: (windowId: string) => void;
    minimize: (windowId: string) => void;
    maximize: (windowId: string) => void;
    restore: (windowId: string) => void;
    focus: (windowId: string) => void;
    getAll: () => WindowState[];
  };
  notify: {
    show: (title: string, message: string, options?: Partial<NotifyOptions>) => void;
  };
  time: {
    getCurrent: () => Date;
    setAlarm: (time: Date, callback: () => void) => string;
    clearAlarm: (alarmId: string) => void;
    getAlarms: () => Alarm[];
  };
  fs: {
    read: (path: string) => string | null;
    write: (path: string, content: string, requireAuth?: boolean) => boolean;
    exists: (path: string) => boolean;
    list: (path: string) => FileSystemNode[];
    mkdir: (path: string) => boolean;
    remove: (path: string) => boolean;
    getPermissions: (path: string) => string;
    setPermissions: (path: string, permissions: string, requireAuth?: boolean) => boolean;
    getNode: (path: string) => FileSystemNode | null;
  };
  user: {
    getCurrentUser: () => User | null;
    getAllUsers: () => User[];
    getRealUsers: () => User[];
    hasUsers: () => boolean;
    createUser: (username: string, password: string, options?: { role?: UserRole; isRoot?: boolean }) => { success: boolean; user?: User; error?: string };
    login: (username: string, password: string) => { success: boolean; error?: string };
    logout: () => void;
    isLoggedIn: () => boolean;
    isRoot: () => boolean;
    isAdmin: () => boolean;
    hasPermission: (permission: Permission) => boolean;
    authenticate: (password: string) => boolean;
    requestPrivilege: (reason: string) => Promise<boolean>;
    createTemporaryUser: (reason?: string) => User;
    hasTemporaryUser: () => boolean;
    getTemporaryUserInfo: () => { username: string; password: string; reason: string } | null;
    clearTemporaryUser: () => void;
    isTemporarySession: () => boolean;
    tryAutoLogin: () => { success: boolean; error?: string };
    subscribe: (callback: () => void) => () => void;
  };
  i18n: {
    getCurrentLocale: () => string;
    setLocale: (locale: string) => void;
    t: (key: string, params?: Record<string, string>) => string;
    getAvailableLocales: () => LocaleConfig[];
    onLocaleChange: (callback: (locale: string) => void) => () => void;
  };
  config: {
    get: <T>(key: string) => T | undefined;
    set: <T>(key: string, value: T) => void;
    getSystemName: () => string;
    setSystemName: (name: string) => void;
  };
  boot: {
    isComplete: () => boolean;
    isOOBEComplete: () => boolean;
    completeOOBE: () => void;
    reset: () => void;
  };
}

declare global {
  interface Window {
    webos: WebOSAPI;
  }
}
