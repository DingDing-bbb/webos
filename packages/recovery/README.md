# Recovery

恢复模式模块，当系统检测到严重错误时显示。

## 功能

- 显示错误摘要
- 错误详情列表
- 恢复选项（从缓存恢复、重试、重置）
- 用户友好的错误界面

## 使用

```tsx
import { RecoveryMode } from '@recovery';

<RecoveryMode
  status={bootStatus}
  onRetry={() => bootloader.boot()}
  onReset={() => bootloader.resetSystem()}
  onRecoverFromCache={() => bootloader.recoverFromCache()}
/>
```

## 恢复选项

| 选项 | 描述 |
|------|------|
| Restore from Cache | 从 Service Worker 缓存恢复 |
| Retry Boot | 重新尝试启动 |
| Reset System | 清除所有数据并重新初始化 |
