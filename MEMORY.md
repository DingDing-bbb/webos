# 长期记忆

## 角色设定

顶尖前端架构师，精通浏览器操作系统环境开发，擅长 React/TypeScript/Webpack，对窗口系统、文件系统、权限模型、Service Worker、国际化有深入实践。

---

## 项目

**WebOS** - 浏览器中运行的操作系统，具有真实生产力，不是模拟。

仓库：https://github.com/DingDing-bbb/webos.git  
部署：https://dingding-bbb.github.io/webos/

---

## 核心需求

1. 不使用 Next.js，Webpack 从零配置
2. 窗口引擎必须使用自定义元素 `<os-window>`
3. 启动动画 + OOBE 首次向导
4. 多语言：简中/繁中/英语，其他预留隐藏
5. 视觉分层：基础层 + 美化层，优雅降级
6. 类Unix文件系统，权限保护
7. 内置应用：文件管理器、时钟、终端、设置
8. 系统API：window.webos
9. Service Worker 缓存恢复
10. 代码不提及其他OS名称
11. 系统名称通过 DefinePlugin 注入全局变量

---

## 项目结构

```
/home/z/my-project/
├── src/index.tsx                    # 主入口
├── global.d.ts                      # 全局类型声明
├── webpack.config.js                # Webpack配置
├── tsconfig.json                    # TypeScript配置
├── package.json                     # 项目配置
│
├── packages/
│   ├── kernel/                      # 内核
│   │   └── src/
│   │       ├── index.ts             # 内核入口
│   │       ├── types.ts             # 类型定义
│   │       └── core/
│   │           ├── windowManager.ts # 窗口管理器
│   │           ├── fileSystem.ts    # 文件系统
│   │           ├── userManager.ts   # 用户管理
│   │           ├── errorHandler.ts  # 错误处理
│   │           ├── resourceLoader.ts
│   │           ├── api.ts           # 系统API入口
│   │           └── managers/        # 管理器模块（模块化）
│   │               ├── i18nManager.ts    # 国际化
│   │               ├── timeManager.ts    # 时间/闹钟
│   │               ├── notifyManager.ts  # 通知
│   │               ├── configManager.ts  # 配置
│   │               ├── bootManager.ts    # 启动状态
│   │               └── index.ts          # 统一导出
│   │
│   ├── ui/                          # UI组件
│   │   └── src/
│   │       ├── index.ts             # UI入口
│   │       ├── components/          # React组件
│   │       │   ├── Desktop/         # 桌面
│   │       │   ├── Taskbar/         # 任务栏+开始菜单
│   │       │   ├── Boot/            # 启动画面
│   │       │   ├── Notification/    # 通知
│   │       │   ├── ErrorDialog/     # 应用错误弹窗
│   │       │   └── BlueScreen/      # 系统蓝屏
│   │       └── styles/              # CSS架构（ITCSS分层）
│   │           ├── index.css        # 主入口
│   │           ├── wallpaper.css    # 壁纸系统
│   │           ├── 1-foundations/   # 基础层：变量、重置
│   │           ├── 2-themes/        # 主题层：浅色/深色
│   │           ├── 3-components/    # 组件层：独立文件
│   │           └── 4-utilities/     # 工具层：动画、工具类
│   │
│   ├── i18n/                        # 国际化
│   │   └── locales/                 # 语言文件
│   │       ├── en.json
│   │       ├── zh-CN.json
│   │       ├── zh-TW.json
│   │       ├── fr.json
│   │       └── de.json
│   │
│   ├── bootloader/                  # 启动加载器
│   ├── oobe/                        # 首次向导
│   ├── recovery/                    # 恢复模式
│   ├── tablet/                      # 平板/触摸支持
│   │
│   └── apps/                        # 内置应用
│       ├── com.os.settings/         # 设置
│       ├── com.os.filemanager/      # 文件管理器
│       ├── com.os.clock/            # 时钟
│       └── com.os.terminal/         # 终端
│
├── public/                          # 静态资源
└── dist/                            # 构建输出
```

---

## CSS架构（ITCSS分层）

```
packages/ui/src/styles/
├── index.css              # 主入口，统一导入
├── wallpaper.css          # 壁纸系统（独立模块）
│
├── 1-foundations/         # 基础层
│   ├── _variables.css     # 设计令牌（颜色、尺寸、字体、阴影、过渡、z-index）
│   └── _reset.css         # 重置样式
│
├── 2-themes/              # 主题层
│   ├── _light.css         # 浅色主题变量
│   └── _dark.css          # 深色主题变量
│
├── 3-components/          # 组件层（10个独立文件）
│   ├── _boot.css          # 启动画面
│   ├── _desktop.css       # 桌面
│   ├── _taskbar.css       # 任务栏
│   ├── _window.css        # 窗口
│   ├── _start-menu.css    # 开始菜单
│   ├── _notification.css  # 通知
│   ├── _oobe.css          # OOBE向导
│   ├── _auth.css          # 认证对话框
│   ├── _error.css         # 错误提示
│   └── _tablet.css        # 平板模式
│
└── 4-utilities/           # 工具层
    ├── _animations.css    # 动画库（淡入淡出、缩放、滑动等）
    └── _utilities.css     # 工具类（flex、间距、文本等）
```

**命名规范**：下划线前缀（`_*.css`）表示部分文件，由 index.css 统一导入

---

## 内核管理器模块

```
packages/kernel/src/core/managers/
├── i18nManager.ts     # 国际化管理 - 多语言翻译
├── timeManager.ts     # 时间管理 - 闹钟设置
├── notifyManager.ts   # 通知管理 - 系统通知
├── configManager.ts   # 配置管理 - localStorage持久化
├── bootManager.ts     # 启动管理 - OOBE状态
└── index.ts           # 统一导出
```

---

## 技能

- `bun run dev` - 启动开发服务器 (端口3000)
- `bun run lint` - ESLint代码检查
- `bun run build` - 生产构建
- `npx tsc --noEmit` - TypeScript类型检查
- `git log --oneline` - 查看提交历史

---

## 错误处理系统

### 应用级错误
- 弹窗提示错误信息
- 显示错误代码（如 ERR_1001）
- 可复制错误详情
- 点击关闭后继续使用系统

### 系统级错误
- 连续三次系统错误触发蓝屏
- 类似经典蓝屏界面
- 显示错误计数和详情
- 可尝试恢复或重置系统

### 错误代码
- 1xxx: 应用错误 (ERR_1001 应用崩溃等)
- 2xxx: 系统错误 (ERR_2001 内核错误等)
- 3xxx: 文件系统错误
- 4xxx: 网络错误

---

## 用户系统

- **用户角色**: root | admin | user | guest
- **权限系统**: 文件权限、设置权限、用户管理权限、命令执行权限
- **临时账户**: 初始化失败时创建临时账户，显示错误横幅
- **自动登录**: 尝试恢复上次会话

---

## 壁纸系统

**壁纸类型**:
- `soft` - 柔色弥散壁纸（默认）
- `animated` - 动态渐变
- `image` - 图片壁纸
- `video` - 视频壁纸
- `sunrise` / `ocean` / `forest` - 预设主题

**存储键**:
- `webos-wallpaper-type`: 壁纸类型
- `webos-wallpaper-custom`: 自定义壁纸JSON

**切换机制**: `wallpaper:change` 自定义事件

---

## 最近会话 (2025-03-04)

### 项目架构重构

**1. CSS架构重构（ITCSS分层方法）**
- 创建分层目录：foundations → themes → components → utilities
- 分离浅色/深色主题到独立文件
- 拆分组件样式为10个独立文件
- 添加动画库和工具类

**2. 项目结构清理**
- 删除 `skills/` 目录（不属于WebOS项目，46,858行）
- 删除 `types/` 目录（重复的类型声明）
- 删除 `worklog.md`（临时工作日志）
- 合并重复的 `global.d.ts`

**3. 代码模块化**
- 拆分 api.ts（原1000+行）为独立管理器模块
- i18nManager、timeManager、notifyManager、configManager、bootManager
- 统一通过 `managers/index.ts` 导出

**4. 类型声明完善**
- 添加缺失的 `BootError` 类型导出
- 更新 `tsconfig.json` 引用正确的 `global.d.ts`

**提交记录**:
- `82c99bc` refactor: reorganize project structure and code architecture
- `69ba05d` refactor: restructure CSS architecture with ITCSS methodology

---

## 历史问题修复

### 窗口内容空白
- 原因：connectedCallback 中 innerHTML 覆盖了 setContent 设置的内容
- 修复：pendingContent 保存未渲染内容，connectedCallback 后恢复

### 翻译函数命名冲突
- 原因：map(t => ...) 循环变量覆盖翻译函数 t
- 修复：循环变量改名为 themeValue

### Emoji图标替换
- 问题：使用emoji当作图标
- 修复：替换为SVG图标组件

### 桌面图标打开应用空白
- 原因：Desktop 直接调用 window.webos.window.open() 只创建空窗口
- 修复：新增 onOpenApp 回调，使用与开始菜单相同的逻辑
