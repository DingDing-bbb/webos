# @webos/sdk

WebOS 应用开发工具包，用于创建、构建和打包 WebOS 应用程序。

## 安装

```bash
npm install @webos/sdk
```

## 快速开始

### 创建新应用

```bash
# 使用 CLI 创建应用
webos-sdk create com.example.myapp

# 指定选项
webos-sdk create com.example.myapp --name "My App" --category productivity
```

### 应用配置

创建 `appinfo.json`:

```json
{
  "id": "com.example.myapp",
  "name": "My App",
  "version": "1.0.0",
  "category": "productivity",
  "main": "./dist/index.js",
  "icon": "./dist/icon.js",
  "defaultWidth": 800,
  "defaultHeight": 600,
  "permissions": ["fs:read", "fs:write"]
}
```

### 应用入口

```tsx
// src/index.tsx
import React from 'react';
import { createApp, registerApp } from '@webos/sdk';
import { useTranslation, useTheme } from '@webos/sdk/react';
import Icon from './icon';

const MyApp: React.FC = () => {
  const t = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`app ${theme}`}>
      <h1>{t('app.myapp.title')}</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

export default createApp({
  id: 'com.example.myapp',
  name: 'My App',
  nameKey: 'app.myapp.name',
  version: '1.0.0',
  category: 'productivity',
  icon: Icon,
  component: MyApp,
});
```

## React Hooks

### useTranslation

获取翻译函数：

```tsx
function MyComponent() {
  const t = useTranslation();
  return <h1>{t('app.myapp.title')}</h1>;
}
```

### useTheme

获取和切换主题：

```tsx
function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div className={theme}>
      <button onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>
    </div>
  );
}
```

### useFileSystem

文件系统操作：

```tsx
function FileManager() {
  const { read, write, exists, list, mkdir, remove } = useFileSystem();

  const handleSave = async () => {
    await write('/home/user/document.txt', 'Hello World');
  };

  const handleLoad = async () => {
    const content = read('/home/user/document.txt');
    console.log(content);
  };

  return <div>...</div>;
}
```

### useNotification

显示通知：

```tsx
function MyComponent() {
  const { show } = useNotification();

  const handleClick = () => {
    show('Notification', 'This is a notification!');
  };

  return <button onClick={handleClick}>Notify</button>;
}
```

### useLocalStorage

持久化状态：

```tsx
function Settings() {
  const [settings, setSettings] = useLocalStorage('myapp.settings', {
    theme: 'light',
    fontSize: 14,
  });

  return (
    <div>
      <button onClick={() => setSettings((s) => ({ ...s, theme: 'dark' }))}>Dark Mode</button>
    </div>
  );
}
```

### useKeyboardShortcut

注册快捷键：

```tsx
function Editor() {
  useKeyboardShortcut('ctrl+s', () => {
    saveDocument();
  });

  return <div>...</div>;
}
```

## 类型定义

### AppConfig

应用配置类型：

```typescript
interface AppConfig {
  id: string; // 应用ID
  name: string; // 应用名称
  nameKey: string; // 国际化键名
  description?: string; // 描述
  version: string; // 版本号
  category: AppCategory; // 分类
  icon: FC<IconProps>; // 图标组件
  component: FC; // 主组件
  defaultWidth?: number; // 默认宽度
  defaultHeight?: number; // 默认高度
  minWidth?: number; // 最小宽度
  minHeight?: number; // 最小高度
  resizable?: boolean; // 可调整大小
  singleton?: boolean; // 单例模式
  permissions?: AppPermission[]; // 权限
}
```

### AppCategory

应用分类：

```typescript
type AppCategory =
  | 'system' // 系统工具
  | 'productivity' // 生产力
  | 'media' // 媒体
  | 'games' // 游戏
  | 'network' // 网络
  | 'development' // 开发
  | 'utilities'; // 实用工具
```

### AppPermission

应用权限：

```typescript
type AppPermission =
  | 'fs:read' // 文件系统读取
  | 'fs:write' // 文件系统写入
  | 'network' // 网络访问
  | 'notification' // 通知
  | 'clipboard' // 剪贴板
  | 'storage'; // 本地存储
```

## CLI 命令

### webos-sdk create

创建新应用：

```bash
webos-sdk create <app-id> [options]

Options:
  -n, --name <name>        应用名称
  -c, --category <category> 应用分类
  -t, --template <template> 模板
  -d, --directory <directory> 目标目录
```

### webos-sdk build

构建应用：

```bash
webos-sdk build [options]

Options:
  -c, --config <config>    配置文件路径
  -o, --output <output>    输出目录
  -m, --minify             压缩输出
  -s, --sourcemap          生成 source map
```

### webos-sdk dev

开发模式：

```bash
webos-sdk dev [options]

Options:
  -p, --port <port>        开发服务器端口
  -w, --watch              监听文件变化
```

### webos-sdk pack

打包应用：

```bash
webos-sdk pack [options]

Options:
  -o, --output <output>    输出文件
```

## 项目结构

```
my-app/
├── src/
│   ├── index.tsx      # 入口文件
│   ├── App.tsx        # 主组件
│   ├── icon.tsx       # 图标组件
│   └── styles.css     # 样式
├── locales/
│   ├── en.json        # 英文翻译
│   └── zh-CN.json     # 中文翻译
├── appinfo.json       # 应用配置
├── package.json
└── tsconfig.json
```

## 示例

查看 `packages/apps` 目录下的内置应用了解更多示例：

- `com.os.filemanager` - 文件管理器
- `com.os.terminal` - 终端
- `com.os.browser` - 浏览器
- `com.os.settings` - 设置
- `com.os.clock` - 时钟

## License

MIT
