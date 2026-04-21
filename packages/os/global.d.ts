// 全局类型声明

// Webpack 注入的全局变量
declare const __OS_NAME__: string;
declare const __OS_VERSION__: string;
declare const __BUILD_TIME__: string;

// 模块声明
declare module '@kernel' {
  export function initWebOS(): void;
  export function createWebOSAPI(): import('./packages/kernel/src/types').WebOSAPI;
  export const windowManager: {
    setContainer: (el: HTMLDivElement) => void;
    open: (options: import('./packages/kernel/src/types').WindowOptions) => string;
    close: (id: string) => void;
    minimize: (id: string) => void;
    maximize: (id: string) => void;
    restore: (id: string) => void;
    focus: (id: string) => void;
    getAll: () => import('./packages/kernel/src/types').WindowState[];
  };
}

declare module '@ui' {
  export const BootScreen: React.FC<{ onComplete: () => void | Promise<void> }>;
  export const Desktop: React.FC<{
    onOpenApp: (appId: string, title: string) => void;
    wallpaper: import('./packages/ui/src/components/Desktop').WallpaperConfig;
  }>;
  export const Taskbar: React.FC<{
    windows: import('./packages/kernel/src/types').WindowState[];
    onWindowClick: (id: string) => void;
    onStartClick: () => void;
    isStartMenuOpen: boolean;
  }>;
  export const StartMenu: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    apps: { id: string; name: string; onClick: () => void }[];
    onSettings: () => void;
    onShutdown: () => void;
  }>;
  export const NotificationContainer: React.FC;
  export const ErrorDialogContainer: React.FC;
  export const BlueScreenContainer: React.FC;
  export const Login: React.FC<{
    users: import('./packages/kernel/src/types').User[];
    onLogin: (username: string, password: string) => { success: boolean; error?: string };
    onGuestLogin?: () => void;
    isTemporarySession?: boolean;
    temporaryUserInfo?: { username: string; password: string; reason: string } | null;
  }>;
  export type WallpaperConfig = import('./packages/ui/src/components/Desktop').WallpaperConfig;
  export type WallpaperType = import('./packages/ui/src/components/Desktop').WallpaperType;
}

declare module '@oobe' {
  export const OOBE: React.FC<{
    onComplete: (data: {
      username: string;
      password: string;
      language: string;
      systemName?: string;
      tabletMode?: boolean;
    }) => void;
  }>;
}

declare module '@bootloader' {
  export const bootloader: {
    getStatus: () => import('./packages/bootloader/src').BootStatus;
    subscribe: (
      callback: (status: import('./packages/bootloader/src').BootStatus) => void
    ) => () => void;
    boot: () => Promise<boolean>;
    recoverFromCache: () => Promise<boolean>;
    resetSystem: () => Promise<void>;
  };
  export function setupGlobalErrorHandler(): void;
  export type BootStatus = import('./packages/bootloader/src').BootStatus;
  export type BootError = import('./packages/bootloader/src').BootError;
}

declare module '@recovery' {
  export const RecoveryMode: React.FC<{
    status: import('./packages/bootloader/src').BootStatus;
    onRetry: () => void;
    onReset: () => void;
    onRecoverFromCache: () => void;
  }>;
}
