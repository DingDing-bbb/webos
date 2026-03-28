# UI

WebOS UI 组件库 - 现代化亚克力/毛玻璃设计系统。

## 包名

`@webos/ui`

## 特性

- 🎨 **亚克力/毛玻璃效果** - 高斯模糊背景，支持自定义透明度
- 🌗 **主题系统** - 完整的深色/浅色模式支持
- 📦 **60+ 组件** - 覆盖所有常见使用场景
- ♿ **无障碍支持** - 完整的 ARIA 属性和键盘导航
- 📱 **响应式设计** - 自适应各种屏幕尺寸
- 🎭 **TypeScript** - 完整的类型定义

## 目录结构

```
ui/
├── package.json
├── README.md
└── src/
    ├── index.ts              # 主入口
    │
    ├── styles/               # CSS 样式系统
    │   ├── index.css         # 样式入口
    │   ├── 1-foundations/    # 基础样式
    │   │   ├── _variables.css # 设计令牌
    │   │   └── _reset.css     # 重置样式
    │   ├── 2-themes/         # 主题
    │   │   ├── _light.css
    │   │   └── _dark.css
    │   ├── 3-components/     # 组件样式
    │   │   ├── _desktop.css
    │   │   ├── _taskbar.css
    │   │   ├── _window.css
    │   │   ├── _start-menu.css
    │   │   ├── _notification.css
    │   │   ├── _boot.css
    │   │   ├── _oobe.css
    │   │   ├── _auth.css
    │   │   ├── _error.css
    │   │   └── _tablet.css
    │   ├── 4-utilities/      # 工具类
    │   │   ├── _animations.css
    │   │   └── _utilities.css
    │   └── wallpaper.css
    │
    ├── theme/               # 主题系统
    │   ├── index.ts
    │   └── acrylic.css
    │
    ├── hooks/               # React Hooks
    │   └── index.ts
    │
    ├── utils/               # 工具函数
    │   └── index.ts
    │
    ├── components/          # 主要组件
    │   ├── Desktop/         # 桌面
    │   ├── Taskbar/         # 任务栏
    │   ├── Boot/            # 启动画面
    │   ├── LockScreen/      # 锁屏
    │   ├── Notification/    # 通知
    │   ├── ErrorDialog/     # 错误对话框
    │   ├── BlueScreen/      # 蓝屏
    │   ├── Spinner/         # 加载指示器
    │   └── UpdateNotification/
    │
    ├── desktop/             # 桌面环境组件
    │   ├── Desktop.tsx
    │   ├── Taskbar.tsx
    │   ├── StartMenu.tsx
    │   ├── Window.tsx
    │   ├── WindowManager.tsx
    │   ├── DesktopIcon.tsx
    │   ├── ContextMenu.tsx
    │   ├── SystemTray.tsx
    │   ├── NotificationCenter.tsx
    │   ├── LockScreen.tsx
    │   ├── LoginScreen.tsx
    │   ├── MenuBar.tsx
    │   ├── ControlPanel.tsx
    │   ├── Widget.tsx
    │   └── ResizeHandle.tsx
    │
    ├── base/                # 基础组件
    │   ├── Button.tsx
    │   ├── Icon.tsx
    │   ├── Typography.tsx
    │   ├── Divider.tsx
    │   ├── Spacer.tsx
    │   └── Color.tsx
    │
    ├── layout/              # 布局组件
    │   ├── Grid.tsx
    │   ├── Stack.tsx
    │   ├── Flex.tsx
    │   ├── Box.tsx
    │   ├── Container.tsx
    │   └── SplitPanel.tsx
    │
    ├── input/               # 输入组件
    │   ├── Input.tsx
    │   ├── TextArea.tsx
    │   ├── Select.tsx
    │   ├── Checkbox.tsx
    │   ├── Radio.tsx
    │   ├── Switch.tsx
    │   └── Slider.tsx
    │
    ├── feedback/            # 反馈组件
    │   ├── Modal.tsx
    │   ├── Drawer.tsx
    │   ├── Toast.tsx
    │   ├── Alert.tsx
    │   ├── Confirm.tsx
    │   ├── Tooltip.tsx
    │   ├── Popover.tsx
    │   ├── Spinner.tsx
    │   ├── Message.tsx
    │   ├── Notification.tsx
    │   └── ProgressOverlay.tsx
    │
    ├── navigation/          # 导航组件
    │   ├── Menu.tsx
    │   ├── Tabs.tsx
    │   ├── Sidebar.tsx
    │   ├── Breadcrumb.tsx
    │   ├── Dropdown.tsx
    │   ├── Pagination.tsx
    │   ├── Steps.tsx
    │   ├── Anchor.tsx
    │   └── Tree.tsx
    │
    └── display/             # 展示组件
        ├── Card.tsx
        ├── List.tsx
        ├── Table.tsx
        ├── Tree.tsx
        ├── Calendar.tsx
        ├── Timeline.tsx
        ├── Collapse.tsx
        └── Statistic.tsx
```

## 组件分类

### 桌面环境组件
| 组件 | 描述 |
|------|------|
| `Desktop` | 桌面环境 |
| `Taskbar` | 任务栏 |
| `StartMenu` | 开始菜单 |
| `Window` | 窗口 |
| `WindowManager` | 窗口管理器 |
| `DesktopIcon` | 桌面图标 |
| `ContextMenu` | 右键菜单 |
| `SystemTray` | 系统托盘 |
| `NotificationCenter` | 通知中心 |
| `LockScreen` | 锁屏界面 |
| `LoginScreen` | 登录界面 |

### 主要组件
| 组件 | 描述 |
|------|------|
| `BootScreen` | 启动画面 |
| `NotificationContainer` | 通知容器 |
| `ErrorDialogContainer` | 错误对话框容器 |
| `BlueScreenContainer` | 蓝屏容器 |
| `Spinner` | 加载指示器 |
| `UpdateNotification` | 更新通知 |

## 使用

```tsx
import { 
  Desktop, Taskbar, StartMenu, BootScreen,
  NotificationContainer, LockScreen
} from '@ui';
import type { WallpaperConfig, TaskbarDisplayMode } from '@ui';

function App() {
  return (
    <>
      <Desktop apps={apps} wallpaper={{ type: 'soft' }} />
      <Taskbar windows={windows} onStartClick={handleStart} />
      <StartMenu isOpen={isOpen} apps={apps} />
      <NotificationContainer />
    </>
  );
}
```

## 设计令牌

```css
:root {
  /* 颜色 */
  --os-color-primary: #0078d4;
  --os-color-success: #10b981;
  --os-color-warning: #f59e0b;
  --os-color-danger: #ef4444;

  /* 间距 */
  --os-spacing-xs: 4px;
  --os-spacing-sm: 8px;
  --os-spacing-md: 16px;
  --os-spacing-lg: 24px;
  --os-spacing-xl: 32px;

  /* 圆角 */
  --os-radius-sm: 4px;
  --os-radius-md: 8px;
  --os-radius-lg: 12px;

  /* 毛玻璃 */
  --os-glass-bg: rgba(255, 255, 255, 0.7);
  --os-glass-blur: 20px;
}
```

## 版本

- 版本: 2.0.0
- 特性: acrylic-glass-effect, high-blur, dark-light-theme, responsive, typescript
