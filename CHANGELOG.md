# WebOS 变更日志

## 项目简介

WebOS - 一个在浏览器中运行的操作系统，具有真实的操作系统体验。

技术栈：React 19 + TypeScript + Next.js 15 + Bun

---

## 当前版本: 1.0.0

### 架构改进

#### Monorepo 结构
- 使用 Bun workspaces 管理多包
- 支持两种运行模式：
  - 独立模式：Webpack 构建 `packages/os/`
  - Next.js 模式：集成到 `site/`

#### 路径别名系统
- 在 `next.config.js` 和 `tsconfig.json` 中统一配置
- 支持的别名：`@kernel`, `@ui`, `@i18n`, `@oobe`, `@bootloader`, `@recovery`, `@tablet`, `@apps`, `@webos/os`, `@webos/docs`, `@webos/intro`

---

## 已完成的功能

### 核心系统
- [x] 安全认证 - PBKDF2 100K 迭代 + AES-256-GCM 加密
- [x] 加密存储 - SQLite 数据库加密存储在 IndexedDB
- [x] 多用户支持 - Root 和标准用户账户，带权限系统
- [x] 文件系统 - 类 Unix 内存文件系统，支持权限管理
- [x] 窗口管理 - 拖拽、调整大小、最小化、最大化
- [x] 启动加载器 - 系统完整性检查和错误恢复
- [x] 恢复模式 - 系统错误时的恢复界面

### 用户界面
- [x] 启动动画 - 优雅的加载序列
- [x] OOBE (开箱即用体验) - 首次启动设置向导
- [x] 锁屏界面 - 安全锁屏和用户选择
- [x] 任务栏 - 应用程序启动器和系统托盘
- [x] 开始菜单 - 应用程序列表
- [x] 右键菜单 - 桌面上下文菜单
- [x] 通知系统 - 系统通知提醒
- [x] 蓝屏界面 - 错误显示界面

### 内置应用
- [x] 时钟应用 (`com.os.clock`) - 时钟和闹钟
- [x] 文件管理器 (`com.os.filemanager`) - 文件浏览
- [x] 设置应用 (`com.os.settings`) - 系统配置
  - [x] 系统设置（系统名称、平板模式）
  - [x] 语言设置（简中/繁中/英文）
  - [x] 日期时间设置（时区、格式）
  - [x] 显示设置（主题、字体大小）
  - [x] 存储管理（查看使用、清除缓存）
  - [x] 恢复（重置系统、重启）
  - [x] 关于（系统信息）
- [x] 终端应用 (`com.os.terminal`) - 命令行界面
- [x] 浏览器应用 (`com.os.browser`) - 网页浏览

### 国际化
- [x] English (en)
- [x] 简体中文 (zh-CN)
- [x] 繁體中文 (zh-TW)
- [ ] Français (fr) - 预留
- [ ] Deutsch (de) - 预留

### 触摸支持
- [x] 设备检测 - 自动检测桌面/平板/手机
- [x] 触摸手势 - 点击、双击、长按、滑动、捏合
- [x] 平板模式 - 自动切换、增大触摸目标、边缘手势

---

## 最近修复的问题

### Next.js 集成修复

#### Service Worker 和 version.json 404
- **问题**: Service Worker 注册失败，版本检查失败
- **原因**: `site/public/` 目录缺少这两个文件
- **修复**: 创建 `site/public/version.json` 和 `site/public/sw.js`

#### 窗口无法显示
- **问题**: 点击桌面应用图标没有窗口弹出
- **原因**:
  1. `next.config.js` 路径别名错误（`__dirname` 指向 `site/` 而非项目根目录）
  2. `windowManager.ts` 在服务端执行 `customElements.define` 报错
  3. 窗口容器未设置
- **修复**:
  1. 路径别名从 `packages/os/...` 改为 `../packages/os/...`
  2. 添加 `typeof window !== 'undefined'` 检查
  3. 在 WebOSApp.tsx 中添加窗口容器设置

#### 桌面图标无法点击
- **问题**: 窗口容器覆盖桌面图标，导致点击无效
- **修复**: 窗口容器设置 `pointer-events: none`，窗口元素设置 `pointer-events: auto`

---

## 开发命令

```bash
# 安装依赖
bun install

# 启动 Next.js 开发服务器 (端口 3000)
bun run dev

# 启动 WebOS 独立开发服务器
bun run dev:os

# 构建
bun run build:os     # 构建 WebOS
bun run build:site   # 构建 Next.js 站点
bun run build        # 完整构建
```

---

## 远程仓库

GitHub: https://github.com/DingDing-bbb/webos.git
