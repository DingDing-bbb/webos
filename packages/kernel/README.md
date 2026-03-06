# Kernel

系统内核模块，提供核心 API 和基础功能。

## 功能

- **文件系统** - 类 Unix 内存文件系统，支持权限管理
- **窗口管理器** - 基于 Custom Elements 的窗口系统
- **系统 API** - `window.webos` 全局 API

## 目录结构

```
src/
├── index.ts          # 入口文件
├── types.ts          # 类型定义
└── core/
    ├── api.ts        # 系统 API
    ├── fileSystem.ts # 文件系统
    └── windowManager.ts # 窗口管理器
```

## 使用

```typescript
import { initWebOS } from '@kernel';
import type { WindowState } from '@kernel/types';

// 初始化系统
initWebOS();

// 使用 API
window.webos.window.open('app-id', { title: 'My App' });
```
