# Bootloader

引导加载器模块，负责系统完整性检查和错误恢复。

## 功能

- 系统完整性检查
- 错误检测和收集
- 恢复模式触发
- Service Worker 检测
- 核心文件缓存

## 错误类型

| 类型 | 描述 |
|------|------|
| syntax | 语法错误（如忘记括号） |
| module | 模块加载失败 |
| network | 网络错误 |
| cache | 缓存错误 |
| runtime | 运行时错误 |

## 使用

```typescript
import { bootloader, setupGlobalErrorHandler } from '@bootloader';

// 设置全局错误处理
setupGlobalErrorHandler();

// 订阅状态变化
bootloader.subscribe((status) => {
  console.log('Boot status:', status.stage);
});

// 执行引导
const success = await bootloader.boot();

// 从缓存恢复
if (!success) {
  await bootloader.recoverFromCache();
}
```

## 恢复策略

1. **从缓存恢复** - 使用 Service Worker 缓存的文件
2. **重试引导** - 重新尝试启动流程
3. **重置系统** - 清除所有数据并重新初始化
