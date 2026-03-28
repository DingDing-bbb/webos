# Recovery

恢复模式模块，当系统检测到严重错误时显示。

## 包名

无独立包名，通过 `@recovery` 别名引用。

## 功能

- 显示错误摘要
- 错误详情列表
- 恢复选项（从缓存恢复、重试、重置）
- 用户友好的错误界面

## 目录结构

```
recovery/
├── package.json
├── README.md
└── src/
    └── index.tsx
```

## 使用

```tsx
import { RecoveryMode } from '@recovery';
import type { BootStatus } from '@bootloader';

function App() {
  const [showRecovery, setShowRecovery] = useState(false);
  const [bootStatus, setBootStatus] = useState<BootStatus>({ stage: 'idle', progress: 0 });

  if (showRecovery) {
    return (
      <RecoveryMode
        status={bootStatus}
        onRetry={async () => {
          const success = await bootloader.boot();
          if (success) {
            setShowRecovery(false);
          }
        }}
        onReset={async () => {
          await bootloader.resetSystem();
        }}
        onRecoverFromCache={async () => {
          await bootloader.recoverFromCache();
        }}
      />
    );
  }
}
```

## 恢复选项

| 选项 | 描述 |
|------|------|
| **Restore from Cache** | 从 Service Worker 缓存恢复 |
| **Retry Boot** | 重新尝试启动 |
| **Reset System** | 清除所有数据并重新初始化 |

## 界面元素

- 错误图标和标题
- 错误描述
- 错误详情列表（可展开）
- 操作按钮
- 加载状态指示
