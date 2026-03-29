# WebOS 项目结构

## 核心目录

```
webos/
├── site/                    # Next.js 网站入口
│   ├── src/app/             # 页面路由
│   │   ├── page.tsx         # 首页（重定向）
│   │   ├── intro/           # 介绍页
│   │   ├── docs/            # 文档页
│   │   ├── app/             # 应用入口
│   │   │   ├── page.tsx     # 用户协议
│   │   │   └── os/          # OS 运行时
│   │   └── api/             # API 路由
│   └── public/              # 静态资源
│
├── packages/os/             # WebOS 核心包
│   ├── src/                 # 入口文件
│   │   ├── index.tsx        # 主入口
│   │   └── index.html       # HTML 模板
│   ├── public/              # 静态资源
│   │   ├── wallpapers/      # 壁纸
│   │   └── wasm/            # SQLite WASM
│   └── packages/            # 子包
│       ├── kernel/          # 核心功能
│       │   ├── core/        # 核心模块
│       │   │   ├── windowManager.ts
│       │   │   ├── userManager.ts
│       │   │   ├── api.ts
│       │   │   └── managers/
│       │   ├── fs/          # 文件系统
│       │   ├── app-manager/ # 应用管理
│       │   └── hooks/       # React Hooks
│       │
│       ├── ui/              # UI 组件库
│       │   ├── desktop/     # 桌面组件
│       │   │   ├── Desktop.tsx
│       │   │   ├── Window.tsx
│       │   │   ├── Taskbar.tsx
│       │   │   ├── StartMenu.tsx
│       │   │   └── ...
│       │   ├── components/  # 通用组件
│       │   │   ├── Boot/
│       │   │   ├── LockScreen/
│       │   │   └── ...
│       │   ├── base/        # 基础组件
│       │   ├── input/       # 输入组件
│       │   ├── display/     # 展示组件
│       │   ├── feedback/    # 反馈组件
│       │   ├── layout/      # 布局组件
│       │   ├── navigation/  # 导航组件
│       │   └── styles/      # 样式文件
│       │
│       ├── apps/            # 内置应用
│       │   ├── com.os.clock/
│       │   ├── com.os.browser/
│       │   ├── com.os.terminal/
│       │   ├── com.os.settings/
│       │   ├── com.os.filemanager/
│       │   └── com.os.docs/
│       │
│       ├── bootloader/      # 启动加载器
│       ├── oobe/            # 首次启动向导
│       ├── i18n/            # 国际化
│       ├── tablet/          # 平板模式
│       ├── recovery/        # 恢复模式
│       ├── sdk/             # 应用开发 SDK
│       ├── docs/            # SDK 文档
│       └── dev-plugin/      # 开发插件
│
├── docs/                    # 项目文档
│   ├── REFACTOR-PLAN.md
│   ├── UI-FRAMEWORK.md
│   └── THIRD-PARTY-APPS.md
│
└── skills/                  # ⚠️ AI 技能包（待确认是否保留）
    ├── docx/
    ├── pptx/
    ├── pdf/
    ├── xlsx/
    ├── ASR/
    ├── TTS/
    ├── VLM/
    ├── LLM/
    ├── image-generation/
    ├── video-generation/
    ├── web-search/
    └── ... (40+ 技能包)
```

## 已清理的内容

- ❌ `packages/docs/` - 旧代码，已删除
- ❌ `packages/intro/` - 旧代码，已删除
- ❌ `site/public/os/` - 构建产物，已删除

## 待确认

### `skills/` 目录
这是一个庞大的目录，包含 40+ 个 AI 技能包（文档处理、图像生成、语音识别等）。
这些看起来是 AI Agent 的工具包，不是 WebOS 操作系统的一部分。

**请确认是否删除？**

## 建议的进一步整理

1. **合并 UI 组件** - `ui/src/desktop/` 和 `ui/src/components/` 有重叠，可以合并
2. **删除未使用的组件** - 检查 `ui/src/navigation/`、`ui/src/display/` 等是否都在使用
3. **精简 README** - 很多包都有 README.md，可以考虑只保留核心文档
