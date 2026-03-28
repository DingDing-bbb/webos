# WebOS - Modern Web-Based Operating System

<p align="center">
  <strong>一个在浏览器中运行的完整操作系统</strong>
</p>

---

## 项目概述

WebOS 是一个基于 Web 技术构建的操作系统，采用 Monorepo 架构，使用 Bun 作为包管理器。项目支持两种运行方式：

1. **独立模式** - 通过 Webpack 构建，直接运行 `packages/os/`
2. **Next.js 集成模式** - 通过 Next.js 构建，运行 `site/`

---

## 目录结构

```
/home/z/my-project/
│
├── package.json                    # Monorepo 根配置
├── bun.lock                        # Bun 锁文件
├── tsconfig.json                   # TypeScript 配置
├── eslint.config.js                # ESLint 配置
│
├── docs/                           # 📄 Markdown 文档
│   ├── developer-plugin.md         # 开发者插件指南
│   ├── THIRD-PARTY-APPS.md         # 第三方应用开发指南
│   └── UI-FRAMEWORK.md             # UI 框架文档
│
├── site/                           # 🌐 Next.js 站点（主入口）
│   ├── package.json
│   ├── next.config.js              # 路径别名配置
│   ├── tsconfig.json
│   ├── public/
│   │   ├── version.json            # 版本信息
│   │   ├── sw.js                   # Service Worker
│   │   └── favicon.svg
│   └── src/
│       └── app/
│           ├── page.tsx            # / (重定向到 /intro)
│           ├── intro/page.tsx      # /intro (介绍页面)
│           ├── docs/page.tsx       # /docs (文档页面)
│           ├── app/page.tsx        # /app (WebOS 系统)
│           ├── layout.tsx          # 根布局
│           ├── globals.css         # 全局样式
│           └── WebOSApp.tsx        # WebOS 主组件
│
├── packages/                       # 📦 包目录
│   │
│   ├── os/                         # 🖥️ WebOS 核心系统
│   │   ├── package.json            # @webos/os
│   │   ├── webpack.config.js       # Webpack 配置（独立构建）
│   │   ├── babel.config.json
│   │   ├── global.d.ts
│   │   │
│   │   ├── src/                    # 主入口
│   │   │   ├── index.tsx           # Webpack 入口（独立模式）
│   │   │   └── index.html          # HTML 模板
│   │   │
│   │   ├── packages/               # 子包
│   │   │   │
│   │   │   ├── kernel/             # 🔧 内核
│   │   │   │   ├── package.json    # @kernel
│   │   │   │   └── src/
│   │   │   │       ├── index.ts    # 导出入口
│   │   │   │       ├── types.ts    # 类型定义
│   │   │   │       │
│   │   │   │       └── core/
│   │   │   │           ├── api.ts              # window.webos API
│   │   │   │           ├── windowManager.ts    # 窗口管理器
│   │   │   │           ├── userManager.ts      # 用户管理
│   │   │   │           ├── secureUserManager.ts # 安全用户管理
│   │   │   │           ├── crypto.ts           # 加密工具
│   │   │   │           ├── encryptedDatabase.ts # 加密数据库
│   │   │   │           ├── secureStorage.ts    # 安全存储
│   │   │   │           ├── resourceLoader.ts   # 资源加载
│   │   │   │           ├── errorHandler.ts     # 错误处理
│   │   │   │           │
│   │   │   │           └── managers/
│   │   │   │               ├── i18nManager.ts    # 国际化管理
│   │   │   │               ├── timeManager.ts    # 时间管理
│   │   │   │               ├── configManager.ts  # 配置管理
│   │   │   │               ├── updateManager.ts  # 更新管理
│   │   │   │               ├── bootManager.ts    # 启动管理
│   │   │   │               └── notifyManager.ts   # 通知管理
│   │   │   │
│   │   │   ├── kernel/fs/           # 📁 文件系统
│   │   │   │   ├── package.json
│   │   │   │   └── src/
│   │   │   │       ├── index.ts
│   │   │   │       ├── types.ts
│   │   │   │       └── core/
│   │   │   │           ├── FileSystem.ts    # 文件系统实现
│   │   │   │           ├── Permissions.ts   # 权限管理
│   │   │   │           └── Node.ts          # 文件节点
│   │   │   │
│   │   │   ├── kernel/app-manager/  # 📱 应用管理器
│   │   │   │   ├── package.json
│   │   │   │   └── src/
│   │   │   │       ├── index.ts
│   │   │   │       ├── registry.tsx   # 应用注册表
│   │   │   │       └── types.ts
│   │   │   │
│   │   │   ├── ui/                   # 🎨 UI 组件库
│   │   │   │   ├── package.json      # @webos/ui
│   │   │   │   └── src/
│   │   │   │       ├── index.ts      # 导出入口
│   │   │   │       │
│   │   │   │       ├── styles/       # CSS 样式系统
│   │   │   │       │   ├── index.css
│   │   │   │       │   ├── 1-foundations/   # 基础样式
│   │   │   │       │   │   ├── _variables.css
│   │   │   │       │   │   └── _reset.css
│   │   │   │       │   ├── 2-themes/         # 主题
│   │   │   │       │   │   ├── _light.css
│   │   │   │       │   │   └── _dark.css
│   │   │   │       │   ├── 3-components/     # 组件样式
│   │   │   │       │   │   ├── _desktop.css
│   │   │   │       │   │   ├── _taskbar.css
│   │   │   │       │   │   ├── _window.css
│   │   │   │       │   │   ├── _start-menu.css
│   │   │   │       │   │   ├── _notification.css
│   │   │   │       │   │   ├── _boot.css
│   │   │   │       │   │   ├── _oobe.css
│   │   │   │       │   │   ├── _auth.css
│   │   │   │       │   │   ├── _error.css
│   │   │   │       │   │   └── _tablet.css
│   │   │   │       │   ├── 4-utilities/      # 工具类
│   │   │   │       │   │   ├── _animations.css
│   │   │   │       │   │   └── _utilities.css
│   │   │   │       │   └── wallpaper.css
│   │   │   │       │
│   │   │   │       ├── theme/        # 主题系统
│   │   │   │       │   ├── index.ts
│   │   │   │       │   └── acrylic.css
│   │   │   │       │
│   │   │   │       ├── hooks/        # React Hooks
│   │   │   │       │   └── index.ts
│   │   │   │       │
│   │   │   │       ├── utils/        # 工具函数
│   │   │   │       │   └── index.ts
│   │   │   │       │
│   │   │   │       ├── components/   # 主要组件
│   │   │   │       │   ├── Desktop/         # 桌面
│   │   │   │       │   ├── Taskbar/         # 任务栏
│   │   │   │       │   ├── Boot/            # 启动画面
│   │   │   │       │   ├── LockScreen/      # 锁屏
│   │   │   │       │   ├── Notification/    # 通知
│   │   │   │       │   ├── ErrorDialog/     # 错误对话框
│   │   │   │       │   ├── BlueScreen/      # 蓝屏
│   │   │   │       │   ├── Spinner/         # 加载指示器
│   │   │   │       │   └── UpdateNotification/
│   │   │   │       │
│   │   │   │       ├── desktop/      # 桌面环境组件
│   │   │   │       │   ├── Desktop.tsx
│   │   │   │       │   ├── Taskbar.tsx
│   │   │   │       │   ├── StartMenu.tsx
│   │   │   │       │   ├── Window.tsx
│   │   │   │       │   ├── WindowManager.tsx
│   │   │   │       │   ├── DesktopIcon.tsx
│   │   │   │       │   ├── ContextMenu.tsx
│   │   │   │       │   ├── SystemTray.tsx
│   │   │   │       │   ├── NotificationCenter.tsx
│   │   │   │       │   ├── LockScreen.tsx
│   │   │   │       │   ├── LoginScreen.tsx
│   │   │   │       │   ├── MenuBar.tsx
│   │   │   │       │   ├── ControlPanel.tsx
│   │   │   │       │   ├── Widget.tsx
│   │   │   │       │   └── ResizeHandle.tsx
│   │   │   │       │
│   │   │   │       ├── base/         # 基础组件
│   │   │   │       │   ├── Button.tsx
│   │   │   │       │   ├── Icon.tsx
│   │   │   │       │   ├── Typography.tsx
│   │   │   │       │   ├── Divider.tsx
│   │   │   │       │   ├── Spacer.tsx
│   │   │   │       │   └── Color.tsx
│   │   │   │       │
│   │   │   │       ├── layout/       # 布局组件
│   │   │   │       │   ├── Grid.tsx
│   │   │   │       │   ├── Stack.tsx
│   │   │   │       │   ├── Flex.tsx
│   │   │   │       │   ├── Box.tsx
│   │   │   │       │   ├── Container.tsx
│   │   │   │       │   └── SplitPanel.tsx
│   │   │   │       │
│   │   │   │       ├── input/        # 输入组件
│   │   │   │       │   ├── Input.tsx
│   │   │   │       │   ├── TextArea.tsx
│   │   │   │       │   ├── Select.tsx
│   │   │   │       │   ├── Checkbox.tsx
│   │   │   │       │   ├── Radio.tsx
│   │   │   │       │   ├── Switch.tsx
│   │   │   │       │   └── Slider.tsx
│   │   │   │       │
│   │   │   │       ├── feedback/      # 反馈组件
│   │   │   │       │   ├── Modal.tsx
│   │   │   │       │   ├── Drawer.tsx
│   │   │   │       │   ├── Toast.tsx
│   │   │   │       │   ├── Alert.tsx
│   │   │   │       │   ├── Confirm.tsx
│   │   │   │       │   ├── Tooltip.tsx
│   │   │   │       │   ├── Popover.tsx
│   │   │   │       │   ├── Spinner.tsx
│   │   │   │       │   ├── Message.tsx
│   │   │   │       │   ├── Notification.tsx
│   │   │   │       │   └── ProgressOverlay.tsx
│   │   │   │       │
│   │   │   │       ├── navigation/   # 导航组件
│   │   │   │       │   ├── Menu.tsx
│   │   │   │       │   ├── Tabs.tsx
│   │   │   │       │   ├── Sidebar.tsx
│   │   │   │       │   ├── Breadcrumb.tsx
│   │   │   │       │   ├── Dropdown.tsx
│   │   │   │       │   ├── Pagination.tsx
│   │   │   │       │   ├── Steps.tsx
│   │   │   │       │   ├── Anchor.tsx
│   │   │   │       │   └── Tree.tsx
│   │   │   │       │
│   │   │   │       └── display/      # 展示组件
│   │   │   │           ├── Card.tsx
│   │   │   │           ├── List.tsx
│   │   │   │           ├── Table.tsx
│   │   │   │           ├── Tree.tsx
│   │   │   │           ├── Calendar.tsx
│   │   │   │           ├── Timeline.tsx
│   │   │   │           ├── Collapse.tsx
│   │   │   │           └── Statistic.tsx
│   │   │   │
│   │   │   ├── i18n/                 # 🌍 国际化
│   │   │   │   ├── package.json
│   │   │   │   └── src/
│   │   │   │       └── index.ts
│   │   │   └── locales/
│   │   │       ├── en.json            # English
│   │   │       ├── zh-CN.json         # 简体中文
│   │   │       ├── zh-TW.json         # 繁體中文
│   │   │       ├── fr.json            # Français
│   │   │       └── de.json            # Deutsch
│   │   │   │
│   │   │   ├── bootloader/           # 🚀 启动加载器
│   │   │   │   ├── package.json
│   │   │   │   ├── README.md
│   │   │   │   └── src/
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── recovery/             # 🔄 恢复模式
│   │   │   │   ├── package.json
│   │   │   │   ├── README.md
│   │   │   │   └── src/
│   │   │   │       └── index.tsx
│   │   │   │
│   │   │   ├── oobe/                 # ✨ 首次启动向导
│   │   │   │   ├── package.json
│   │   │   │   ├── README.md
│   │   │   │   └── src/
│   │   │   │       └── index.tsx
│   │   │   │
│   │   │   ├── tablet/               # 📱 触摸支持
│   │   │   │   ├── package.json
│   │   │   │   ├── README.md
│   │   │   │   └── src/
│   │   │   │       ├── index.ts
│   │   │   │       ├── deviceDetector.ts
│   │   │   │       ├── touchHandler.ts
│   │   │   │       ├── gestures.ts
│   │   │   │       └── tabletMode.ts
│   │   │   │
│   │   │   ├── apps/                 # 📲 内置应用
│   │   │   │   ├── package.json      # @webos/apps
│   │   │   │   ├── index.ts          # 应用注册入口
│   │   │   │   ├── registry.tsx      # 应用注册表
│   │   │   │   ├── types.ts
│   │   │   │   │
│   │   │   │   ├── com.os.clock/     # 时钟应用
│   │   │   │   │   ├── appinfo.json
│   │   │   │   │   ├── package.json
│   │   │   │   │   └── src/
│   │   │   │   │       ├── index.tsx
│   │   │   │   │       └── icon.tsx
│   │   │   │   │
│   │   │   │   ├── com.os.filemanager/  # 文件管理器
│   │   │   │   │   ├── appinfo.json
│   │   │   │   │   ├── package.json
│   │   │   │   │   └── src/
│   │   │   │   │       ├── index.tsx
│   │   │   │   │       └── icon.tsx
│   │   │   │   │
│   │   │   │   ├── com.os.settings/     # 设置应用
│   │   │   │   │   ├── appinfo.json
│   │   │   │   │   ├── package.json
│   │   │   │   │   └── src/
│   │   │   │   │       ├── index.tsx
│   │   │   │   │       ├── SettingsApp.tsx
│   │   │   │   │       ├── icon.tsx
│   │   │   │   │       ├── styles.css
│   │   │   │   │       └── panes/
│   │   │   │   │           └── VisualEffects.tsx
│   │   │   │   │
│   │   │   │   ├── com.os.terminal/     # 终端应用
│   │   │   │   │   ├── appinfo.json
│   │   │   │   │   ├── package.json
│   │   │   │   │   └── src/
│   │   │   │   │       ├── index.tsx
│   │   │   │   │       └── icon.tsx
│   │   │   │   │
│   │   │   │   └── com.os.browser/      # 浏览器应用
│   │   │   │       ├── appinfo.json
│   │   │   │       ├── package.json
│   │   │   │       └── src/
│   │   │   │           ├── index.tsx
│   │   │   │           ├── icon.tsx
│   │   │   │           ├── styles.css
│   │   │   │           ├── kernel/
│   │   │   │           ├── ipc/
│   │   │   │           └── network/
│   │   │   │
│   │   │   └── dev-plugin/           # 🔌 开发者插件
│   │   │       ├── package.json
│   │   │       └── src/
│   │   │           └── index.ts
│   │   │
│   │   ├── public/                   # 静态资源
│   │   │   ├── version.json
│   │   │   ├── sw.js
│   │   │   ├── favicon.svg
│   │   │   ├── wasm/
│   │   │   │   └── sql-wasm-browser.wasm
│   │   │   └── wallpapers/
│   │   │       ├── catgirl-static.png
│   │   │       └── catgirl-animated.mp4
│   │   │
│   │   └── dist/                     # 构建输出
│   │       ├── index.html
│   │       ├── main.*.js
│   │       ├── main.*.css
│   │       ├── vendor.*.js
│   │       └── ...
│   │
│   ├── docs/                         # 📄 文档页面组件
│   │   ├── package.json              # @webos/docs
│   │   └── src/
│   │       ├── index.tsx
│   │       └── page.tsx
│   │
│   └── intro/                        # 🏠 介绍页面组件
│       ├── package.json              # @webos/intro
│       └── src/
│           ├── index.tsx
│           └── page.tsx
│
├── CHANGELOG.md                      # 变更日志
├── README.md                         # 本文件
└── worklog.md                        # 工作日志
```

---

## 包依赖关系

```
┌─────────────────────────────────────────────────────────────┐
│                      依赖关系图                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  bootloader ──────► (无依赖)                                │
│                                                             │
│  recovery ────────► bootloader                              │
│                                                             │
│  kernel ──────────► (无依赖)                                │
│    ├── fs                                                  │
│    └── app-manager                                         │
│                                                             │
│  i18n ────────────► kernel (types)                         │
│                                                             │
│  ui ──────────────► kernel (types)                         │
│                                                             │
│  oobe ────────────► kernel, ui                              │
│                                                             │
│  tablet ──────────► (无依赖)                                │
│                                                             │
│  apps ────────────► kernel, ui, i18n                        │
│                                                             │
│  dev-plugin ──────► bootloader                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  site ────────────► @webos/os, @webos/docs, @webos/intro    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 路径别名配置

在 `site/next.config.js` 和 `site/tsconfig.json` 中配置：

| 别名 | 路径 |
|------|------|
| `@kernel` | `packages/os/packages/kernel/src` |
| `@i18n` | `packages/os/packages/i18n/src` |
| `@ui` | `packages/os/packages/ui/src` |
| `@oobe` | `packages/os/packages/oobe/src` |
| `@bootloader` | `packages/os/packages/bootloader/src` |
| `@recovery` | `packages/os/packages/recovery/src` |
| `@tablet` | `packages/os/packages/tablet/src` |
| `@apps` | `packages/os/packages/apps` |
| `@webos/os` | `packages/os/src` |
| `@webos/docs` | `packages/docs/src` |
| `@webos/intro` | `packages/intro/src` |

---

## 路由配置

| 路由 | 页面文件 | 描述 |
|------|----------|------|
| `/` | `site/src/app/page.tsx` | 重定向到 `/intro` |
| `/intro` | `site/src/app/intro/page.tsx` | 介绍页面 |
| `/docs` | `site/src/app/docs/page.tsx` | 文档页面 |
| `/app` | `site/src/app/app/page.tsx` | WebOS 系统 |

---

## 开发命令

```bash
# 安装依赖
bun install

# 启动 Next.js 开发服务器
bun run dev          # 或 cd site && bun run dev

# 启动 WebOS 独立开发服务器
bun run dev:os       # 或 cd packages/os && bun run dev

# 构建 WebOS
bun run build:os

# 构建 Next.js 站点
bun run build:site

# 完整构建（OS + 复制 + 站点）
bun run build
```

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 运行时 | Bun |
| 框架 | Next.js 15 / React 19 |
| 语言 | TypeScript 5 |
| 构建 | Webpack 5 / Turbopack |
| 数据库 | sql.js (SQLite in WASM) |
| 加密 | Web Crypto API (AES-256-GCM, PBKDF2) |
| 样式 | CSS Modules |

---

## 内置应用

| 应用 | ID | 描述 |
|------|-----|------|
| Clock | `com.os.clock` | 时钟和闹钟 |
| File Manager | `com.os.filemanager` | 文件管理器 |
| Settings | `com.os.settings` | 系统设置 |
| Terminal | `com.os.terminal` | 终端模拟器 |
| Browser | `com.os.browser` | 网页浏览器 |

---

## 国际化支持

| 代码 | 语言 | 状态 |
|------|------|------|
| `en` | English | ✅ 完整 |
| `zh-CN` | 简体中文 | ✅ 完整 |
| `zh-TW` | 繁體中文 | ✅ 完整 |
| `fr` | Français | 🔲 预留 |
| `de` | Deutsch | 🔲 预留 |

---

## 文档

- [开发者插件指南](docs/developer-plugin.md)
- [第三方应用开发](docs/THIRD-PARTY-APPS.md)
- [UI 框架文档](docs/UI-FRAMEWORK.md)
- [Kernel README](packages/os/packages/kernel/README.md)
- [UI README](packages/os/packages/ui/README.md)
- [Apps README](packages/os/packages/apps/README.md)
- [Bootloader README](packages/os/packages/bootloader/README.md)
- [OOBE README](packages/os/packages/oobe/README.md)
- [Recovery README](packages/os/packages/recovery/README.md)
- [I18n README](packages/os/packages/i18n/README.md)
- [Tablet README](packages/os/packages/tablet/README.md)
- [Packages Overview](packages/README.md)
- [工作日志](worklog.md)
- [变更日志](CHANGELOG.md)

---

## 许可证

MIT License

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/DingDing-bbb">DingDing-bbb</a>
</p>
