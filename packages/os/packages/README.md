# Packages

WebOS 核心系统包目录。

## 包概览

| 包           | 别名          | 描述                         |
| ------------ | ------------- | ---------------------------- |
| `kernel`     | `@kernel`     | 核心系统服务、API 和安全层   |
| `ui`         | `@ui`         | UI 组件库、视觉元素和样式    |
| `i18n`       | `@i18n`       | 国际化和本地化               |
| `oobe`       | `@oobe`       | 开箱即用体验（首次启动向导） |
| `bootloader` | `@bootloader` | 系统完整性验证               |
| `recovery`   | `@recovery`   | 错误恢复和回退模式           |
| `tablet`     | `@tablet`     | 触摸和平板设备支持           |
| `apps`       | `@apps`       | 内置系统应用                 |

## 目录结构

```
packages/
├── kernel/           # 内核
│   ├── src/          # 核心代码
│   ├── fs/           # 文件系统子包
│   └── app-manager/  # 应用管理器子包
│
├── ui/               # UI 组件库
│   └── src/
│       ├── styles/   # CSS 样式
│       ├── theme/    # 主题系统
│       ├── components/  # 主要组件
│       ├── desktop/  # 桌面环境组件
│       ├── base/     # 基础组件
│       ├── layout/   # 布局组件
│       ├── input/    # 输入组件
│       ├── feedback/ # 反馈组件
│       ├── navigation/ # 导航组件
│       └── display/  # 展示组件
│
├── i18n/             # 国际化
│   ├── src/
│   └── locales/      # 语言文件
│
├── bootloader/       # 启动加载器
├── recovery/         # 恢复模式
├── oobe/             # 首次启动向导
├── tablet/           # 触摸支持
│
├── apps/             # 内置应用
│   ├── com.os.clock/
│   ├── com.os.filemanager/
│   ├── com.os.settings/
│   ├── com.os.terminal/
│   └── com.os.browser/
│
└── dev-plugin/       # 开发者插件
```

## 启动序列

```
┌─────────────────────────────────────────────────────────────┐
│                     BOOT SEQUENCE                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. bootloader                                              │
│     ├── Service Worker 注册                                 │
│     ├── 系统完整性检查                                       │
│     ├── 核心模块验证                                         │
│     └── 缓存预热                                             │
│                                                             │
│  2. recovery (失败时)                                       │
│     └── 显示恢复界面                                        │
│                                                             │
│  3. kernel                                                  │
│     ├── 初始化 Web Crypto API                               │
│     ├── 加载加密数据库                                       │
│     └── 暴露 window.webos API                               │
│                                                             │
│  4. lockscreen / oobe                                       │
│     ├── 检查现有用户                                        │
│     ├── 显示登录界面 (如果用户存在)                          │
│     └── 显示 OOBE (首次运行)                                │
│                                                             │
│  5. desktop (ui)                                            │
│     └── 初始化桌面环境                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 依赖关系

```
bootloader
    └── (无依赖)

recovery
    └── bootloader

kernel
    └── (无依赖)

i18n
    └── kernel (types)

ui
    └── kernel (types)

oobe
    ├── kernel
    └── ui

tablet
    └── (无依赖)

apps
    ├── kernel
    ├── ui
    └── i18n

dev-plugin
    └── bootloader
```

## 错误恢复

| 错误类型     | 行为               |
| ------------ | ------------------ |
| 语法错误     | 自动进入恢复模式   |
| 模块加载失败 | 显示错误，允许重试 |
| 网络错误     | 提示检查连接       |
| 缓存错误     | 提供系统重置选项   |
| 数据库损坏   | 从备份恢复或重置   |

## 开发

```bash
# 从项目根目录运行
bun run dev        # 启动 Next.js 开发服务器
bun run dev:os     # 启动 WebOS 独立开发服务器

# 构建
bun run build:os   # 构建 WebOS
```

## 贡献

添加新包时：

1. 遵循现有目录结构
2. 包含 README.md 文档
3. 在 `index.ts` 中导出类型
4. 保持向后兼容
