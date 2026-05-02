// 全局类型声明

declare const __OS_NAME__: string;
declare const __OS_VERSION__: string;
declare const __BUILD_TIME__: string;

declare global {
  interface Window {
    __HW_CAPS?: {
      canvas2d: boolean;
      indexedDB: boolean;
      webAssembly: boolean;
      localStorage: boolean;
    };
    webos?: any;
    __rustKernel?: any;
    __windowContainer?: HTMLDivElement;
  }
}

declare module '@webos/drivers' {
  export const bootloader: {
    getStatus: () => import('./drivers/src').BootStatus;
    subscribe: (cb: (s: import('./drivers/src').BootStatus) => void) => () => void;
    boot: () => Promise<boolean>;
    isOOBEComplete: () => boolean;
    completeOOBE: () => void;
  };
  export function setupGlobalErrorHandler(): void;
  export type BootStatus = import('./drivers/src').BootStatus;
}

declare module '@webos/kernel' {
  export function initWebOS(): void;
}

declare module '@webos/oobe' {
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

declare module '@webos/recovery' {
  export const RecoveryMode: React.FC<{
    status: any;
    onRetry: () => void;
    onReset: () => void;
    onRecoverFromCache: () => void;
  }>;
}
