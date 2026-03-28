# Apps

系统应用程序目录。

## 包名

`@webos/apps`

## 应用列表

| 应用 | ID | 描述 | 文件夹 |
|------|-----|------|--------|
| Clock | `com.os.clock` | 时钟和闹钟 | `com.os.clock/` |
| File Manager | `com.os.filemanager` | 文件管理器 | `com.os.filemanager/` |
| Settings | `com.os.settings` | 系统设置 | `com.os.settings/` |
| Terminal | `com.os.terminal` | 终端模拟器 | `com.os.terminal/` |
| Browser | `com.os.browser` | 网页浏览器 | `com.os.browser/` |

## 目录结构

```
apps/
├── package.json          # @webos/apps
├── index.ts              # 应用注册入口
├── registry.tsx          # 应用注册表
├── types.ts              # 类型定义
├── README.md             # 本文件
│
├── com.os.clock/         # 时钟应用
│   ├── appinfo.json
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── index.tsx     # 入口组件和应用信息导出
│       └── icon.tsx      # 应用图标
│
├── com.os.filemanager/   # 文件管理器
│   ├── appinfo.json
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── index.tsx
│       └── icon.tsx
│
├── com.os.settings/      # 设置应用
│   ├── appinfo.json
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── index.tsx
│       ├── SettingsApp.tsx
│       ├── icon.tsx
│       ├── styles.css
│       └── panes/
│           └── VisualEffects.tsx
│
├── com.os.terminal/      # 终端应用
│   ├── appinfo.json
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── index.tsx
│       └── icon.tsx
│
└── com.os.browser/       # 浏览器应用
    ├── appinfo.json
    ├── package.json
    └── src/
        ├── index.tsx
        ├── icon.tsx
        ├── styles.css
        ├── kernel/
        ├── ipc/
        └── network/
```

## 应用结构

每个应用遵循以下结构：

```
com.os.xxx/
├── appinfo.json     # 应用配置清单
├── package.json     # npm 配置
├── README.md        # 应用文档
└── src/
    ├── index.tsx    # 入口组件 + appInfo 导出
    └── icon.tsx     # 应用图标组件
```

## appInfo 结构

```typescript
interface AppInfo {
  id: string;              // 应用唯一标识符，如 'com.os.clock'
  name: string;            // 显示名称
  nameKey: string;         // 国际化键名
  description?: string;    // 描述
  descriptionKey?: string; // 描述国际化键名
  version: string;         // 版本号
  author?: string;         // 作者
  category: AppCategory;   // 分类
  icon: React.FC<IconProps>; // 图标组件
  component: React.FC;     // 主组件
  defaultWidth?: number;   // 默认宽度
  defaultHeight?: number;  // 默认高度
  minWidth?: number;       // 最小宽度
  minHeight?: number;      // 最小高度
  resizable?: boolean;     // 是否可调整大小
  singleton?: boolean;     // 是否单例（只能打开一个实例）
  permissions?: AppPermission[]; // 权限列表
}
```

## 添加新应用

1. 在 `apps/` 目录下创建新文件夹，使用反向域名命名（如 `com.os.newapp`）
2. 创建 `appinfo.json` 配置文件
3. 创建 `package.json` 文件
4. 在 `src/index.tsx` 中实现应用组件并导出 `appInfo`
5. 在 `src/icon.tsx` 中创建图标组件
6. 应用会自动注册到系统

## 应用开发示例

```tsx
// src/index.tsx
import React from 'react';
import { AppIcon } from './icon';
import type { AppInfo } from '../../types';

const MyApp: React.FC = () => {
  return (
    <div style={{ padding: 16 }}>
      <h1>My Application</h1>
    </div>
  );
};

export const appInfo: AppInfo = {
  id: 'com.os.myapp',
  name: 'My App',
  nameKey: 'app.myapp',
  version: '1.0.0',
  category: 'utilities',
  icon: AppIcon,
  component: MyApp,
  defaultWidth: 800,
  defaultHeight: 600,
};

export default MyApp;
```

```tsx
// src/icon.tsx
import React from 'react';

export const AppIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <rect width="48" height="48" rx="8" fill="#0078d4" />
    <text x="24" y="30" textAnchor="middle" fill="white" fontSize="16">MA</text>
  </svg>
);
```
