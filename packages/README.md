# Packages

WebOS Monorepo 包目录。

## 包列表

| 包               | 名称           | 描述           |
| ---------------- | -------------- | -------------- |
| `packages/os`    | `@webos/os`    | WebOS 核心系统 |
| `packages/docs`  | `@webos/docs`  | 文档页面组件   |
| `packages/intro` | `@webos/intro` | 介绍页面组件   |

## 目录结构

```
packages/
├── os/                    # WebOS 核心系统
│   ├── package.json       # @webos/os
│   ├── webpack.config.js  # Webpack 构建配置
│   ├── src/               # 主入口
│   │   └── index.tsx      # 独立运行入口
│   ├── packages/          # 子包
│   │   ├── kernel/        # 内核
│   │   ├── ui/            # UI 组件
│   │   ├── i18n/          # 国际化
│   │   ├── bootloader/    # 启动加载器
│   │   ├── recovery/      # 恢复模式
│   │   ├── oobe/          # 首次启动向导
│   │   ├── tablet/        # 触摸支持
│   │   ├── apps/          # 内置应用
│   │   └── dev-plugin/    # 开发者插件
│   ├── public/            # 静态资源
│   │   ├── wasm/          # SQLite WASM
│   │   └── wallpapers/    # 壁纸
│   └── dist/              # 构建输出
│
├── docs/                  # 文档页面组件
│   ├── package.json       # @webos/docs
│   └── src/
│       ├── index.tsx
│       └── page.tsx
│
├── intro/                 # 介绍页面组件
│   ├── package.json       # @webos/intro
│   └── src/
│       ├── index.tsx
│       └── page.tsx
│
└── README.md              # 本文件
```

## 依赖关系

```
site (@webos/site)
    ├── @webos/os
    ├── @webos/docs
    └── @webos/intro

@webos/os
    └── packages/* (kernel, ui, i18n, ...)
```

## 开发

```bash
# 安装依赖
bun install

# 启动 Next.js 开发服务器（使用 site/）
bun run dev

# 启动 WebOS 独立开发服务器
bun run dev:os
```

## 相关文档

- [WebOS 核心系统包](os/packages/README.md)
- [Kernel README](os/packages/kernel/README.md)
- [UI README](os/packages/ui/README.md)
- [Apps README](os/packages/apps/README.md)
