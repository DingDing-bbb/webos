/**
 * WebOS Documentation Application
 * 文档应用 - 解析和展示 MD 文档
 */

import React, { useState, useMemo } from 'react';
import './styles.css';

// 文档元数据类型
interface DocMeta {
  id: string;
  title: string;
  description: string;
  file: string;
  order: number;
}

// 文档索引（从 docs/index.json 导入）
const docIndex: DocMeta[] = [
  { id: 'getting-started', title: '快速开始', description: 'WebOS SDK 入门指南', file: 'getting-started.md', order: 1 },
  { id: 'app-config', title: '应用配置', description: 'appinfo.json 配置文件说明', file: 'app-config.md', order: 2 },
  { id: 'hooks', title: 'React Hooks', description: '可用的 React Hooks 列表', file: 'hooks.md', order: 3 },
  { id: 'api', title: 'API 参考', description: '完整的 API 文档', file: 'api.md', order: 4 },
  { id: 'cli', title: 'CLI 命令', description: '命令行工具使用指南', file: 'cli.md', order: 5 },
];

// 文档内容（直接内联）
const docContents: Record<string, string> = {
  'getting-started': `# 快速开始

欢迎使用 WebOS SDK！本指南将帮助您快速入门。

## 系统要求

- Node.js 18+
- Bun 或 npm
- 现代浏览器（Chrome 80+, Firefox 75+, Safari 14+）

## 安装

\`\`\`bash
# 使用 bun
bun add @webos/sdk

# 或使用 npm
npm install @webos/sdk
\`\`\`

## 创建第一个应用

### 1. 使用 CLI 创建

\`\`\`bash
# 创建新应用
webos-sdk create com.example.myapp

# 进入项目目录
cd myapp

# 安装依赖
bun install

# 启动开发模式
bun run dev
\`\`\`

### 2. 手动创建

创建项目结构：

\`\`\`
my-app/
├── src/
│   ├── index.tsx      # 入口文件
│   ├── App.tsx        # 主组件
│   └── icon.tsx       # 图标组件
├── locales/
│   ├── en.json        # 英文翻译
│   └── zh-CN.json     # 中文翻译
├── appinfo.json       # 应用配置
└── package.json
\`\`\`

## 下一步

- [应用配置](#app-config) - 了解应用配置选项
- [React Hooks](#hooks) - 学习可用的 React Hooks
- [API 参考](#api) - 查看完整的 API 文档
`,

  'app-config': `# 应用配置

每个 WebOS 应用都需要一个 \`appinfo.json\` 配置文件。

## 基本结构

\`\`\`json
{
  "id": "com.example.myapp",
  "name": "My App",
  "version": "1.0.0",
  "category": "productivity",
  "main": "./dist/index.js",
  "icon": "./dist/icon.js"
}
\`\`\`

## 配置项说明

### 必填字段

| 字段 | 类型 | 说明 |
|------|------|------|
| \`id\` | string | 应用唯一标识，格式：\`com.company.appname\` |
| \`name\` | string | 应用名称 |
| \`version\` | string | 版本号，遵循语义化版本 |
| \`category\` | string | 应用分类 |
| \`main\` | string | 入口文件路径 |
| \`icon\` | string | 图标文件路径 |

### 可选字段

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| \`description\` | string | - | 应用描述 |
| \`author\` | string | - | 作者信息 |
| \`defaultWidth\` | number | 700 | 默认窗口宽度 |
| \`defaultHeight\` | number | 450 | 默认窗口高度 |
| \`minWidth\` | number | 200 | 最小窗口宽度 |
| \`minHeight\` | number | 150 | 最小窗口高度 |
| \`resizable\` | boolean | true | 是否可调整窗口大小 |
| \`singleton\` | boolean | false | 是否单例模式 |
| \`permissions\` | string[] | [] | 所需权限列表 |

## 应用分类

\`\`\`typescript
type AppCategory =
  | 'system'       // 系统工具
  | 'productivity' // 生产力
  | 'media'        // 媒体
  | 'games'        // 游戏
  | 'network'      // 网络
  | 'development'  // 开发
  | 'utilities';   // 实用工具
\`\`\`

## 权限配置

\`\`\`json
{
  "permissions": [
    "fs:read",      // 文件系统读取
    "fs:write",     // 文件系统写入
    "network",      // 网络访问
    "notification", // 通知权限
    "clipboard",    // 剪贴板访问
    "storage"       // 本地存储
  ]
}
\`\`\`
`,

  'hooks': `# React Hooks

WebOS SDK 提供了一系列 React Hooks，简化应用开发。

## useTranslation

获取翻译函数，用于国际化。

\`\`\`tsx
import { useTranslation } from '@webos/sdk/react';

function MyComponent() {
  const t = useTranslation();
  
  return <h1>{t('app.myapp.title')}</h1>;
}
\`\`\`

### 带参数的翻译

\`\`\`tsx
// 翻译文件: { "welcome": "Hello, {name}!" }
const t = useTranslation();
return <p>{t('welcome', { name: 'World' })}</p>;
// 输出: Hello, World!
\`\`\`

## useTheme

获取和切换主题。

\`\`\`tsx
import { useTheme } from '@webos/sdk/react';

function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div className={theme}>
      <p>当前主题: {theme}</p>
      <button onClick={toggleTheme}>
        {theme === 'light' ? '🌙 暗色模式' : '☀️ 亮色模式'}
      </button>
    </div>
  );
}
\`\`\`

### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| \`theme\` | \`'light' \\| 'dark'\` | 当前主题 |
| \`setTheme\` | \`(theme) => void\` | 设置主题 |
| \`toggleTheme\` | \`() => void\` | 切换主题 |

## useFileSystem

文件系统操作 Hook。

\`\`\`tsx
import { useFileSystem } from '@webos/sdk/react';

function FileManager() {
  const { read, write, exists, list, mkdir, remove } = useFileSystem();
  
  const handleSave = async () => {
    await write('/home/user/document.txt', 'Hello World');
  };
  
  return (
    <div>
      <button onClick={handleSave}>保存</button>
    </div>
  );
}
\`\`\`

### 方法列表

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| \`read\` | \`path: string\` | \`string \\| null\` | 读取文件内容 |
| \`write\` | \`path, content\` | \`boolean\` | 写入文件 |
| \`exists\` | \`path: string\` | \`boolean\` | 检查文件是否存在 |
| \`list\` | \`path: string\` | \`DirEntry[]\` | 列出目录内容 |

## useNotification

显示系统通知。

\`\`\`tsx
import { useNotification } from '@webos/sdk/react';

function NotificationDemo() {
  const { show } = useNotification();
  
  const handleNotify = () => {
    show('通知标题', '这是一条通知内容', {
      icon: 'info',
      duration: 5000
    });
  };
  
  return <button onClick={handleNotify}>发送通知</button>;
}
\`\`\`

## useLocalStorage

持久化状态存储。

\`\`\`tsx
import { useLocalStorage } from '@webos/sdk/react';

function Settings() {
  const [settings, setSettings] = useLocalStorage('myapp.settings', {
    theme: 'light',
    fontSize: 14,
  });
  
  return (
    <div style={{ fontSize: settings.fontSize }}>
      <p>当前主题: {settings.theme}</p>
    </div>
  );
}
\`\`\`

## useKeyboardShortcut

注册键盘快捷键。

\`\`\`tsx
import { useKeyboardShortcut } from '@webos/sdk/react';

function Editor() {
  useKeyboardShortcut('ctrl+s', () => {
    // 保存逻辑
  });
  
  return <div>按 Ctrl+S 保存</div>;
}
\`\`\`
`,

  'api': `# API 参考

WebOS SDK 提供的完整 API 文档。

## 应用管理

### registerApp

注册应用到系统。

\`\`\`typescript
import { registerApp } from '@webos/sdk';

registerApp({
  id: 'com.example.myapp',
  name: 'My App',
  // ...
});
\`\`\`

### createApp

创建应用配置的工厂函数。

\`\`\`typescript
import { createApp } from '@webos/sdk';

export default createApp({
  id: 'com.example.myapp',
  name: 'My App',
  category: 'productivity',
  icon: MyAppIcon,
  component: MyApp,
});
\`\`\`

### getAllApps

获取所有已注册的应用。

\`\`\`typescript
import { getAllApps } from '@webos/sdk';

const apps = getAllApps();
// 返回: AppConfig[]
\`\`\`

### getAppsByCategory

按分类获取应用。

\`\`\`typescript
import { getAppsByCategory } from '@webos/sdk';

const productivityApps = getAppsByCategory('productivity');
\`\`\`

## 窗口管理

### WindowOptions

\`\`\`typescript
interface WindowOptions {
  id?: string;
  title: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  appId?: string;
}
\`\`\`

### WindowState

\`\`\`typescript
interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  zIndex: number;
}
\`\`\`

## 文件系统

### FileSystemNode

\`\`\`typescript
interface FileSystemNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  size: number;
  content?: string;
  children?: Map<string, FileSystemNode>;
  createdAt: Date;
  modifiedAt: Date;
}
\`\`\`

## 用户系统

### User

\`\`\`typescript
interface User {
  username: string;
  role: UserRole;
  isRoot: boolean;
  homeDir: string;
  permissions: Permission[];
  displayName?: string;
}
\`\`\`

### UserRole

\`\`\`typescript
type UserRole = 'root' | 'admin' | 'user' | 'guest';
\`\`\`

## 工具函数

### formatFileSize

\`\`\`typescript
import { formatFileSize } from '@webos/sdk-core';

formatFileSize(1024);      // "1 KB"
formatFileSize(1048576);   // "1 MB"
\`\`\`

### debounce / throttle

\`\`\`typescript
import { debounce, throttle } from '@webos/sdk-core';

const debouncedSave = debounce(save, 300);
const throttledScroll = throttle(handleScroll, 100);
\`\`\`

### cn

类名合并工具。

\`\`\`typescript
import { cn } from '@webos/sdk-core';

cn('btn', isActive && 'active', className);
// 返回: "btn active custom-class"
\`\`\`
`,

  'cli': `# CLI 命令

WebOS SDK 提供命令行工具，用于创建、构建和打包应用。

## 安装

\`\`\`bash
# 全局安装
npm install -g @webos/sdk

# 或在项目中安装
npm install @webos/sdk --save-dev
\`\`\`

## 命令概览

\`\`\`bash
webos-sdk <command> [options]

Commands:
  create <app-id>  创建新应用
  build            构建应用
  dev              启动开发服务器
  pack             打包应用
\`\`\`

## create

创建新的 WebOS 应用。

### 用法

\`\`\`bash
webos-sdk create <app-id> [options]
\`\`\`

### 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| \`app-id\` | 是 | 应用 ID，格式：\`com.company.appname\` |

### 选项

| 选项 | 简写 | 默认值 | 说明 |
|------|------|--------|------|
| \`--name\` | \`-n\` | 从 app-id 提取 | 应用名称 |
| \`--category\` | \`-c\` | \`utilities\` | 应用分类 |
| \`--directory\` | \`-d\` | 当前目录 | 目标目录 |

### 示例

\`\`\`bash
# 创建基础应用
webos-sdk create com.example.myapp

# 指定名称和分类
webos-sdk create com.example.editor --name "代码编辑器" --category development
\`\`\`

### 生成的项目结构

\`\`\`
my-app/
├── src/
│   ├── index.tsx      # 应用入口
│   ├── App.tsx        # 主组件
│   ├── icon.tsx       # 图标组件
│   └── styles.css     # 样式文件
├── locales/
│   ├── en.json        # 英文翻译
│   └── zh-CN.json     # 中文翻译
├── appinfo.json       # 应用配置
└── package.json
\`\`\`

## build

构建应用。

\`\`\`bash
webos-sdk build [options]
\`\`\`

### 选项

| 选项 | 简写 | 默认值 | 说明 |
|------|------|--------|------|
| \`--config\` | \`-c\` | \`appinfo.json\` | 配置文件路径 |
| \`--output\` | \`-o\` | \`dist\` | 输出目录 |
| \`--minify\` | \`-m\` | \`false\` | 压缩输出 |

## dev

启动开发服务器。

\`\`\`bash
webos-sdk dev [options]
\`\`\`

### 选项

| 选项 | 简写 | 默认值 | 说明 |
|------|------|--------|------|
| \`--port\` | \`-p\` | \`3000\` | 开发服务器端口 |
| \`--watch\` | \`-w\` | \`true\` | 监听文件变化 |

## pack

打包应用为可分发格式。

\`\`\`bash
webos-sdk pack [options]
\`\`\`

### 选项

| 选项 | 简写 | 默认值 | 说明 |
|------|------|--------|------|
| \`--output\` | \`-o\` | \`app.webos\` | 输出文件名 |
`,
};

// 简单的 Markdown 解析器
function parseMarkdown(md: string): string {
  let html = md;

  // 代码块
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="md-code-block"><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // 标题
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 粗体和斜体
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="md-link">$1</a>');

  // 列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // 表格
  const tableRegex = /\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g;
  html = html.replace(tableRegex, (_, header, body) => {
    const headers = header.split('|').filter((h: string) => h.trim());
    const rows = body.trim().split('\n');
    
    let tableHtml = '<table class="md-table"><thead><tr>';
    headers.forEach((h: string) => {
      tableHtml += `<th>${h.trim()}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    
    rows.forEach((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim());
      tableHtml += '<tr>';
      cells.forEach((c: string) => {
        tableHtml += `<td>${c.trim()}</td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  // 段落
  html = html.replace(/\n\n/g, '</p><p class="md-paragraph">');
  html = `<p class="md-paragraph">${html}</p>`;
  html = html.replace(/<p class="md-paragraph"><\/p>/g, '');
  html = html.replace(/<p class="md-paragraph">(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p class="md-paragraph">(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p class="md-paragraph">(<pre)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p class="md-paragraph">(<table)/g, '$1');
  html = html.replace(/(<\/table>)<\/p>/g, '$1');

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 图标组件
const DocsIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// 文档应用主组件
const DocsApp: React.FC = () => {
  const [currentDoc, setCurrentDoc] = useState<string>('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 过滤文档列表
  const filteredDocs = useMemo(() => {
    if (!searchQuery) return docIndex;
    const query = searchQuery.toLowerCase();
    return docIndex.filter(doc =>
      doc.title.toLowerCase().includes(query) ||
      doc.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 当前文档内容
  const currentContent = useMemo(() => {
    return docContents[currentDoc] || '# 文档未找到\n\n该文档内容暂未加载。';
  }, [currentDoc]);

  // 解析后的 HTML
  const renderedHtml = useMemo(() => {
    return parseMarkdown(currentContent);
  }, [currentContent]);

  // 当前文档信息
  const currentDocInfo = useMemo(() => {
    return docIndex.find(doc => doc.id === currentDoc);
  }, [currentDoc]);

  return (
    <div className="docs-app">
      {/* 侧边栏 */}
      <aside className={`docs-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="docs-sidebar-header">
          <div className="docs-logo">
            <DocsIcon size={20} />
            <span>WebOS SDK</span>
          </div>
          <button
            className="docs-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <div className="docs-search">
          <input
            type="text"
            placeholder="搜索文档..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="docs-search-input"
          />
        </div>

        <nav className="docs-nav">
          <div className="docs-nav-section">
            <h3 className="docs-nav-title">文档</h3>
            <ul className="docs-nav-list">
              {filteredDocs.map(doc => (
                <li key={doc.id}>
                  <button
                    className={`docs-nav-item ${currentDoc === doc.id ? 'active' : ''}`}
                    onClick={() => setCurrentDoc(doc.id)}
                  >
                    <span className="docs-nav-item-title">{doc.title}</span>
                    <span className="docs-nav-item-desc">{doc.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="docs-main">
        <header className="docs-header">
          <button
            className="docs-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 className="docs-title">{currentDocInfo?.title || '文档'}</h1>
          <div className="docs-actions">
            <a
              href="https://github.com/DingDing-bbb/webos"
              target="_blank"
              rel="noopener noreferrer"
              className="docs-github-link"
            >
              GitHub
            </a>
          </div>
        </header>

        <div className="docs-content-wrapper">
          <article
            className="docs-content"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      </main>
    </div>
  );
};

export default DocsApp;

// 导出应用配置
export const appInfo = {
  id: 'com.os.docs',
  name: 'Documentation',
  nameKey: 'app.docs.name',
  version: '1.0.0',
  category: 'development' as const,
  icon: DocsIcon,
  component: DocsApp,
  defaultWidth: 1000,
  defaultHeight: 700,
  minWidth: 600,
  minHeight: 400,
};
