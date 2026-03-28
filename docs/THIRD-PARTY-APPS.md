# WebOS 第三方应用开发指南

## 概述

WebOS 支持安装和运行第三方应用程序。本文档详细介绍如何开发、打包、发布和安装第三方应用。

## 目录

- [应用架构](#应用架构)
- [开发指南](#开发指南)
- [应用打包](#应用打包)
- [应用发布](#应用发布)
- [应用安装](#应用安装)
- [API 参考](#api-参考)
- [最佳实践](#最佳实践)

---

## 应用架构

### 应用包结构

```
com.example.myapp/
├── appinfo.json          # 应用清单文件（必需）
├── package.json          # 依赖配置
├── src/
│   ├── index.tsx         # 应用入口组件
│   ├── icon.tsx          # 应用图标组件
│   └── styles.css        # 应用样式
├── public/
│   └── assets/           # 静态资源
└── README.md             # 应用说明文档
```

### 应用清单文件 (appinfo.json)

```json
{
  "id": "com.example.myapp",
  "name": "My Application",
  "nameKey": "apps.myapp.name",
  "version": "1.0.0",
  "description": "A sample WebOS application",
  "descriptionKey": "apps.myapp.description",
  "author": {
    "name": "Developer Name",
    "email": "developer@example.com",
    "url": "https://example.com"
  },
  "license": "MIT",
  "homepage": "https://example.com/myapp",
  "repository": {
    "type": "git",
    "url": "https://github.com/example/myapp"
  },
  "keywords": ["utility", "productivity"],
  "categories": ["Utility", "Productivity"],
  "permissions": [
    "storage",
    "network",
    "notifications"
  ],
  "minOSVersion": "0.0.1",
  "defaultWidth": 800,
  "defaultHeight": 600,
  "minWidth": 400,
  "minHeight": 300,
  "maxWidth": 1920,
  "maxHeight": 1080,
  "resizable": true,
  "fullscreen": false,
  "singleton": false,
  "fileHandlers": [
    {
      "extension": ".txt",
      "mimeType": "text/plain"
    }
  ],
  "protocolHandlers": [
    {
      "protocol": "myapp"
    }
  ],
  "icons": {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "shortcuts": [
    {
      "name": "New Document",
      "shortcut": "Ctrl+N",
      "action": "new-document"
    }
  ]
}
```

### 清单字段说明

| 字段 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| id | string | 是 | 应用唯一标识符，采用反向域名格式 |
| name | string | 是 | 应用显示名称 |
| nameKey | string | 否 | 国际化键名 |
| version | string | 是 | 语义化版本号 |
| description | string | 否 | 应用描述 |
| author | object | 是 | 作者信息 |
| permissions | array | 否 | 所需权限列表 |
| minOSVersion | string | 否 | 最低系统版本要求 |
| defaultWidth | number | 否 | 默认窗口宽度 |
| defaultHeight | number | 否 | 默认窗口高度 |
| resizable | boolean | 否 | 是否可调整窗口大小 |
| singleton | boolean | 否 | 是否单例应用（只能打开一个实例） |

---

## 开发指南

### 创建新应用

1. **创建应用目录**

```bash
cd packages/os/packages/apps
mkdir com.example.myapp
cd com.example.myapp
```

2. **创建 package.json**

```json
{
  "name": "@webos-app/com.example.myapp",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.tsx",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

3. **创建入口组件 (src/index.tsx)**

```tsx
import React, { useState } from 'react';
import type { WebOSApp } from '@apps/types';
import { AppIcon } from './icon';
import './styles.css';

const MyApp: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="my-app">
      <header className="my-app-header">
        <h1>My Application</h1>
      </header>
      <main className="my-app-content">
        <p>Count: {count}</p>
        <button onClick={() => setCount(c => c + 1)}>
          Increment
        </button>
      </main>
    </div>
  );
};

// 导出应用定义
export default {
  id: 'com.example.myapp',
  name: 'My Application',
  nameKey: 'apps.myapp.name',
  component: MyApp,
  icon: AppIcon,
  defaultWidth: 800,
  defaultHeight: 600,
} as WebOSApp;
```

4. **创建图标组件 (src/icon.tsx)**

```tsx
import React from 'react';

export const AppIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none"
  >
    <rect 
      x="4" 
      y="4" 
      width="40" 
      height="40" 
      rx="8" 
      fill="#0078d4"
    />
    <text 
      x="24" 
      y="30" 
      textAnchor="middle" 
      fill="white" 
      fontSize="16"
    >
      MA
    </text>
  </svg>
);
```

5. **创建样式文件 (src/styles.css)**

```css
.my-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--os-color-background);
  color: var(--os-color-text);
}

.my-app-header {
  padding: 16px;
  border-bottom: 1px solid var(--os-color-border);
}

.my-app-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}
```

### 注册应用到系统

在 `packages/apps/registry.tsx` 中注册：

```tsx
import myApp from './com.example.myapp';

export const registeredApps = [
  // ... 其他应用
  myApp,
];
```

---

## 应用打包

### 构建应用

```bash
# 进入应用目录
cd packages/os/packages/apps/com.example.myapp

# 构建
bun run build
```

### 创建发布包

```bash
# 创建 .webosapp 文件（ZIP 格式）
zip -r com.example.myapp.webosapp \
  appinfo.json \
  dist/ \
  public/
```

### 打包工具 (webos-pack)

```bash
# 安装打包工具
bun add -g @webos/pack

# 打包应用
webos-pack ./com.example.myapp --output ./dist/
```

---

## 应用发布

### 应用商店发布

1. **创建开发者账户**

访问 WebOS 应用商店开发者中心注册账户。

2. **提交应用**

```bash
# 使用 CLI 提交
webos-store publish ./com.example.myapp.webosapp
```

3. **审核流程**

- 自动化测试检查
- 安全审核
- 功能审核
- 上架发布

### 自托管发布

将 `.webosapp` 文件托管在任意 HTTP 服务器：

```
https://example.com/apps/com.example.myapp.webosapp
```

---

## 应用安装

### 从应用商店安装

```tsx
import { appStore } from '@kernel';

// 打开应用商店
appStore.open();

// 或直接安装
appStore.install('com.example.myapp');
```

### 从 URL 安装

```tsx
import { appManager } from '@kernel';

await appManager.installFromUrl(
  'https://example.com/apps/com.example.myapp.webosapp'
);
```

### 手动安装

1. 下载 `.webosapp` 文件
2. 双击打开或通过设置安装
3. 确认安装权限

### 卸载应用

```tsx
import { appManager } from '@kernel';

await appManager.uninstall('com.example.myapp');
```

---

## API 参考

### WebOS 全局对象

所有应用都可以访问 `window.webos` 全局对象：

```typescript
interface WebOSAPI {
  // 窗口管理
  window: {
    open: (appId: string, options?: WindowOptions) => string;
    close: (windowId: string) => void;
    focus: (windowId: string) => void;
    minimize: (windowId: string) => void;
    maximize: (windowId: string) => void;
    getAll: () => WindowState[];
  };

  // 文件系统
  fs: {
    read: (path: string) => Promise<Blob>;
    write: (path: string, data: Blob) => Promise<void>;
    delete: (path: string) => Promise<void>;
    list: (path: string) => Promise<FileInfo[]>;
    exists: (path: string) => Promise<boolean>;
  };

  // 存储
  storage: {
    get: (key: string) => string | null;
    set: (key: string, value: string) => void;
    remove: (key: string) => void;
    clear: () => void;
  };

  // 国际化
  i18n: {
    t: (key: string, params?: Record<string, string>) => string;
    locale: string;
    setLocale: (locale: string) => void;
  };

  // 主题
  theme: {
    current: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    onChange: (callback: (theme: string) => void) => () => void;
  };

  // 通知
  notification: {
    show: (options: NotificationOptions) => string;
    dismiss: (id: string) => void;
  };

  // 剪贴板
  clipboard: {
    read: () => Promise<string>;
    write: (text: string) => Promise<void>;
  };

  // 用户
  user: {
    current: User | null;
    isLoggedIn: boolean;
  };

  // 配置
  config: {
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
  };
}
```

### 使用示例

```tsx
function MyComponent() {
  const [content, setContent] = useState('');

  // 读取文件
  const handleOpenFile = async () => {
    const data = await window.webos.fs.read('/documents/note.txt');
    setContent(await data.text());
  };

  // 显示通知
  const handleNotify = () => {
    window.webos.notification.show({
      title: '提示',
      message: '操作完成',
      type: 'success',
    });
  };

  // 国际化
  const { t } = window.webos.i18n;

  return (
    <div>
      <h1>{t('myapp.title')}</h1>
      <button onClick={handleOpenFile}>{t('myapp.open')}</button>
      <button onClick={handleNotify}>{t('myapp.notify')}</button>
    </div>
  );
}
```

### 权限系统

应用需要在清单中声明所需权限：

```json
{
  "permissions": [
    "storage",      // 本地存储访问
    "network",      // 网络请求
    "notifications", // 系统通知
    "filesystem",   // 文件系统访问
    "camera",       // 摄像头
    "microphone",   // 麦克风
    "clipboard",    // 剪贴板
    "geolocation",  // 地理位置
    "bluetooth"     // 蓝牙
  ]
}
```

---

## 最佳实践

### 1. 响应式设计

```tsx
// 使用 CSS 变量适配主题
.my-component {
  background: var(--os-color-background);
  color: var(--os-color-text);
  border: 1px solid var(--os-color-border);
}

// 响应窗口大小变化
useEffect(() => {
  const handleResize = () => {
    // 更新布局
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### 2. 性能优化

```tsx
// 懒加载大型组件
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// 使用虚拟滚动
import { VirtualList } from '@ui-framework';

// 防抖和节流
import { debounce, throttle } from 'lodash-es';
const debouncedSearch = debounce(search, 300);
```

### 3. 错误处理

```tsx
// 全局错误边界
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// 异步错误处理
try {
  await window.webos.fs.read(path);
} catch (error) {
  window.webos.notification.show({
    title: '错误',
    message: error.message,
    type: 'error',
  });
}
```

### 4. 国际化

```tsx
// 使用翻译键而非硬编码字符串
const MyComponent = () => {
  const { t } = window.webos.i18n;
  
  return (
    <div>
      <h1>{t('myapp.welcome')}</h1>
      <p>{t('myapp.description', { name: user.name })}</p>
    </div>
  );
};
```

### 5. 安全考虑

```tsx
// 不要直接使用 innerHTML
// 错误
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// 正确
<div>{userInput}</div>

// 验证用户输入
const sanitizeInput = (input: string) => {
  return input.replace(/[<>]/g, '');
};
```

---

## 常见问题

### Q: 如何调试应用？

打开开发者工具 (F12)，在 Console 中可以访问 `window.webos` 对象。

### Q: 如何处理文件关联？

在 `appinfo.json` 中声明 `fileHandlers`，系统会自动关联文件类型。

### Q: 如何支持拖放？

```tsx
<div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    // 处理文件
  }}
>
  拖放文件到这里
</div>
```

### Q: 如何访问系统设置？

```tsx
window.webos.window.open('com.os.settings', {
  section: 'display'
});
```

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|-----|------|---------|
| 1.0.0 | 2024-01 | 初始版本 |
| 1.1.0 | 2024-02 | 添加权限系统 |
| 1.2.0 | 2024-03 | 添加文件关联支持 |

---

## 支持

- 文档: https://docs.webos.example.com
- 社区: https://community.webos.example.com
- 问题反馈: https://github.com/example/webos/issues
