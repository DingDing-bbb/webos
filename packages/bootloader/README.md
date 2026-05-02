# Bootloader

引导加载器模块，负责系统完整性检查和错误恢复。

## 包名

无独立包名，通过 `@bootloader` 别名引用。

## 功能

- 系统完整性检查
- 错误检测和收集
- 恢复模式触发
- Service Worker 检测
- 核心文件缓存
- 开发者插件管理

## 目录结构

```
bootloader/
├── package.json
├── README.md
└── src/
    └── index.ts
```

## 错误类型

| 类型      | 描述                   |
| --------- | ---------------------- |
| `syntax`  | 语法错误（如忘记括号） |
| `module`  | 模块加载失败           |
| `network` | 网络错误               |
| `cache`   | 缓存错误               |
| `runtime` | 运行时错误             |

## 状态

```typescript
interface BootStatus {
  stage: 'idle' | 'booting' | 'ready' | 'error' | 'recovery';
  progress: number;
  message?: string;
  errors: BootError[];
}
```

## 使用

```typescript
import { bootloader, setupGlobalErrorHandler } from '@bootloader';
import type { BootStatus } from '@bootloader';

// 设置全局错误处理
setupGlobalErrorHandler();

// 订阅状态变化
const unsubscribe = bootloader.subscribe((status: BootStatus) => {
  console.log('Boot status:', status.stage);
  if (status.stage === 'recovery') {
    // 显示恢复界面
  }
});

// 执行引导
const success = await bootloader.boot();

// 获取当前状态
const status = bootloader.getStatus();

// 从缓存恢复
if (!success) {
  await bootloader.recoverFromCache();
}

// 重置系统
await bootloader.resetSystem();

// 取消订阅
unsubscribe();
```

## 恢复策略

| 策略           | 描述                           |
| -------------- | ------------------------------ |
| **从缓存恢复** | 使用 Service Worker 缓存的文件 |
| **重试引导**   | 重新尝试启动流程               |
| **重置系统**   | 清除所有数据并重新初始化       |

## 事件

| 事件名                | 描述         |
| --------------------- | ------------ |
| `bootloader:recovery` | 进入恢复模式 |
| `bootloader:progress` | 启动进度更新 |
| `bootloader:error`    | 启动错误     |

## 开发者插件

引导加载器支持开发者插件，用于调试和系统重置：

```javascript
// 安装开发者插件
webosInstallDevPlugin();

// 检查是否可以重置
webosCanResetSystem();

// 重置系统
webosResetSystem();

// 卸载插件
webosUninstallDevPlugin();
```

详见 [开发者插件文档](../../../docs/developer-plugin.md)。
