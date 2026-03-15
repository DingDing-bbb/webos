# Clock

时钟应用。

## 功能

- 显示当前时间
- 设置闹钟
- 闹钟通知

## 应用信息

| 属性 | 值 |
|------|-----|
| ID | com.os.clock |
| 版本 | 1.0.0 |
| 分类 | utility |
| 图标 | clock |

## 权限

- `notification.show` - 显示通知
- `time.alarm` - 设置闹钟

## 目录结构

```
src/
└── index.tsx     # 主组件
```

## 使用

```tsx
import { Clock } from '@app/com.os.clock/src';

<Clock />
```
