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

declare module '@oobe' {
  export const OOBE: React.FC<{
    onComplete: (data: {
      username: string;
      password: string;
      language: string;
      systemName?: string;
      tabletMode?: boolean;
      theme?: 'light' | 'dark';
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
    resetSystem: () => Promise<{ success: boolean; error?: string }>;
    isRecoveryMode: () => boolean;
    completeOOBE: () => void;
    isOOBEComplete: () => boolean;
    isOOBEMode: () => boolean;
    addError: (error: Partial<import('./packages/bootloader/src').BootError>) => void;
    enterRecoveryMode: () => void;
    canResetSystem: () => boolean;
  };
  export class BootController {
    registerTask(task: {
      id: string;
      name: string;
      weight: number;
      execute: () => Promise<void>;
    }): void;
    setProgressHandler(handler: (name: string, progress: number) => void): void;
    run(): Promise<{ success: boolean; error?: string }>;
  }
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
