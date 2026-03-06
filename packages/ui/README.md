# UI

用户界面组件库。

## 组件

- **BootScreen** - 启动画面
- **Desktop** - 桌面
- **Taskbar** - 任务栏
- **StartMenu** - 开始菜单
- **NotificationContainer** - 通知容器

## 目录结构

```
src/
├── index.ts              # 入口文件
├── components/
│   ├── Boot/             # 启动画面
│   ├── Desktop/          # 桌面
│   ├── Taskbar/          # 任务栏
│   └── Notification/     # 通知
└── styles/
    ├── base.css          # 基础样式
    └── enhancement.css   # 增强样式
```

## 使用

```tsx
import { BootScreen, Desktop, Taskbar } from '@ui';

<BootScreen onComplete={() => console.log('Boot complete')} />
```
