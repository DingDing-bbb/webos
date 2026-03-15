// 系统核心类型定义

// 应用相关类型 - 重新定义以避免循环依赖
export type AppCategory = 'system' | 'productivity' | 'media' | 'games' | 'network' | 'development' | 'utilities';

export interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface AppInfo {
  id: string;
  name: string;
  nameKey: string;
  description?: string;
  descriptionKey?: string;
  version: string;
  author?: string;
  category: AppCategory;
  icon: React.FC<IconProps>;
  component: React.FC;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  singleton?: boolean;
  permissions?: AppPermission[];
  entry?: string;
}

export type AppPermission = 'fs:read' | 'fs:write' | 'network' | 'notification' | 'clipboard' | 'storage';

export type AppStatus = 'running' | 'stopped' | 'installed' | 'pending';

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
  icon: React.FC<IconProps>;
}

export interface AppEvent {
  type: 'install' | 'uninstall' | 'launch' | 'close' | 'update';
  appId: string;
  timestamp: Date;
  data?: unknown;
}

export type AppEventListener = (event: AppEvent) => void;

export interface LaunchOptions {
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}

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
    mkdir: (path: string, recursive?: boolean) => boolean;
    remove: (path: string) => boolean;
    delete: (path: string) => boolean;
    readdir: (path: string) => { name: string; type: 'file' | 'directory'; permissions: string; owner: string; size: number; modifiedAt: Date }[];
    stat: (path: string) => FileSystemNode | null;
    chmod: (path: string, mode: string) => boolean;
    getPermissions: (path: string) => string;
    setPermissions: (path: string, permissions: string, requireAuth?: boolean) => boolean;
    getNode: (path: string) => FileSystemNode | null;
    watch: (path: string, listener: (event: { type: string; path: string; timestamp: Date }) => void) => () => void;
    resolve: (...paths: string[]) => string;
    dirname: (path: string) => string;
    basename: (path: string) => string;
    extname: (path: string) => string;
  };
  apps: {
    register: (app: AppInfo) => void;
    unregister: (appId: string) => boolean;
    get: (appId: string) => AppInfo | undefined;
    getAll: () => AppInfo[];
    getByCategory: (category: AppCategory) => AppInfo[];
    search: (query: string) => AppInfo[];
    isRegistered: (appId: string) => boolean;
    isRunning: (appId: string) => boolean;
    getInstances: (appId: string) => AppInstance[];
    launch: (appId: string, options?: LaunchOptions) => string | null;
    close: (instanceId: string) => boolean;
    getCategories: () => CategoryInfo[];
    subscribe: (listener: AppEventListener) => () => void;
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
    // 安全用户管理 (PBKDF2 100K + AES-256-GCM + 加密SQL数据库)
    secure: {
      isReady: () => boolean;
      isInitialized: () => Promise<boolean>;
      isLocked: () => boolean;
      getState: () => { isInitialized: boolean; isLocked: boolean; hasUsers: boolean; currentUser: User | null };
      createFirstUser: (username: string, password: string, options?: { displayName?: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
      login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
      logout: () => Promise<void>;
      lock: () => void;
      unlock: (password: string) => Promise<{ success: boolean; error?: string }>;
      getCurrentUser: () => User | null;
      getUserList: () => Promise<Array<{ username: string; displayName: string; role: string }>>;
      changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
      updateDisplayName: (displayName: string) => Promise<{ success: boolean; error?: string }>;
      isAdmin: () => boolean;
      isRoot: () => boolean;
      hasPermission: (permission: Permission) => boolean;
      saveEncryptedData: (key: string, data: string) => Promise<{ success: boolean; error?: string }>;
      getEncryptedData: (key: string) => Promise<string | null>;
      resetSystem: (password: string) => Promise<{ success: boolean; error?: string }>;
      resetAndReinit: () => Promise<void>;
      getTotalUserCount: () => Promise<number>;
      subscribe: (callback: () => void) => () => void;
    };
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
