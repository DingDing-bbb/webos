# Kernel

系统内核模块，提供核心 API 和基础功能。

## 包名

`@kernel`

## 功能模块

### 核心 (core/)

- **api.ts** - `window.webos` 全局 API 实现
- **windowManager.ts** - 基于 Custom Elements 的窗口管理器
- **userManager.ts** - 用户管理
- **secureUserManager.ts** - 安全用户管理（PBKDF2 + AES-256-GCM）
- **crypto.ts** - 加密工具
- **encryptedDatabase.ts** - 加密数据库
- **secureStorage.ts** - 安全存储
- **resourceLoader.ts** - 资源加载器
- **errorHandler.ts** - 错误处理

### 管理器 (core/managers/)

- **i18nManager.ts** - 国际化管理
- **timeManager.ts** - 时间管理
- **configManager.ts** - 配置管理
- **updateManager.ts** - 更新管理
- **bootManager.ts** - 启动管理
- **notifyManager.ts** - 通知管理

### 显示 (core/display/)

- **resolutionManager.ts** - 分辨率管理

### 子包

- **fs/** - 类 Unix 内存文件系统，支持权限管理
- **app-manager/** - 应用注册和管理

## 目录结构

```
kernel/
├── package.json
├── README.md
├── src/
│   ├── index.ts              # 入口文件
│   ├── types.ts              # 类型定义
│   ├── types/
│   │   └── sql.js.d.ts       # SQL.js 类型声明
│   ├── hooks/
│   │   ├── index.ts
│   │   └── useTranslation.ts # 翻译 Hook
│   └── core/
│       ├── api.ts
│       ├── windowManager.ts
│       ├── userManager.ts
│       ├── secureUserManager.ts
│       ├── crypto.ts
│       ├── encryptedDatabase.ts
│       ├── secureStorage.ts
│       ├── resourceLoader.ts
│       ├── errorHandler.ts
│       ├── persistentFileSystem.ts
│       ├── display/
│       │   ├── index.ts
│       │   └── resolutionManager.ts
│       └── managers/
│           ├── index.ts
│           ├── i18nManager.ts
│           ├── timeManager.ts
│           ├── configManager.ts
│           ├── updateManager.ts
│           ├── bootManager.ts
│           └── notifyManager.ts
├── fs/                       # 文件系统子包
│   ├── package.json
│   └── src/
│       ├── index.ts
│       ├── types.ts
│       └── core/
│           ├── FileSystem.ts
│           ├── Permissions.ts
│           └── Node.ts
└── app-manager/              # 应用管理器子包
    ├── package.json
    └── src/
        ├── index.ts
        ├── registry.tsx
        └── types.ts
```

## 导出

```typescript
// 类型导出
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
  WebOSAPI,
} from './types';

// 功能导出
export * from './core/windowManager';
export * from './core/userManager';
export * from './core/api';
export * from './core/crypto';
export * from './core/secureStorage';
export { secureUserManager } from './core/secureUserManager';
export { updateManager } from './core/managers/updateManager';
export { appRegistry } from '../app-manager/src';
export * from '../fs/src';
```

## 使用

```typescript
import { initWebOS } from '@kernel';
import type { WindowState } from '@kernel/types';

// 初始化系统
initWebOS();

// 使用 API
window.webos.window.open('app-id', { title: 'My App' });
window.webos.fs.read('/path/to/file');
window.webos.user.getCurrentUser();
```

## window.webos API

```typescript
interface WebOSAPI {
  t: (key: string, params?: Record<string, string>) => string;
  setWindowContainer: (element: HTMLDivElement) => void;

  window: {
    open: (appId: string, options?: WindowOptions) => string;
    close: (windowId: string) => void;
    focus: (windowId: string) => void;
    minimize: (windowId: string) => void;
    maximize: (windowId: string) => void;
    restore: (windowId: string) => void;
    getAll: () => WindowState[];
  };

  fs: {
    /* 文件系统 API */
  };
  notify: {
    /* 通知 API */
  };
  time: {
    /* 时间 API */
  };
  user: {
    /* 用户 API */
  };
  i18n: {
    /* 国际化 API */
  };
  config: {
    /* 配置 API */
  };
  boot: {
    /* 启动 API */
  };
  apps: {
    /* 应用 API */
  };
}
```
