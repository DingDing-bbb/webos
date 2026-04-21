# WebOS API 参考

## 内核 API

内核模块位于 `@kernel` 路径下，提供系统级功能。

### `@kernel/core`

```ts
import { getSystemInfo, reboot, shutdown } from '@kernel/core';

// 获取系统信息
const info = getSystemInfo(); // { version: string, platform: string }

// 重启系统
await reboot();

// 关机
await shutdown();
```

### `@kernel/types`

```ts
import type { AppManifest, Process, SystemEvent } from '@kernel/types';
```

## UI 组件库

UI 组件从 `@ui` 导入：

```ts
import { Button, Card, Modal, Toast } from '@ui/components';
import { useTheme } from '@ui/hooks';
import { lightTheme, darkTheme } from '@ui/theme';
```

## 应用 SDK

创建应用时，可以使用以下 API：

```ts
// 注册应用
import { registerApp } from '@webos/sdk';
registerApp({
  id: 'my-app',
  name: 'My App',
  icon: '/icons/app.svg',
});

// 文件系统访问（受限）
import { readFile, writeFile } from '@webos/sdk/fs';
```

## 系统事件

```ts
import { on, emit } from '@kernel/events';

on('app:launch', (appId) => console.log(appId));
emit('system:ready');
```
