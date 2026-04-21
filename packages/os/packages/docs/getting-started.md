# 快速开始

欢迎使用 WebOS SDK！本指南将帮助您快速入门。

## 系统要求

- Node.js 18+
- Bun 或 npm
- 现代浏览器（Chrome 80+, Firefox 75+, Safari 14+）

## 安装

```bash
# 使用 bun
bun add @webos/sdk

# 或使用 npm
npm install @webos/sdk
```

## 创建第一个应用

### 1. 使用 CLI 创建

```bash
# 创建新应用
webos-sdk create com.example.myapp

# 进入项目目录
cd myapp

# 安装依赖
bun install

# 启动开发模式
bun run dev
```

### 2. 手动创建

创建项目结构：

```
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
```

## 下一步

- [应用配置](./app-config.md) - 了解应用配置选项
- [React Hooks](./hooks.md) - 学习可用的 React Hooks
- [API 参考](./api.md) - 查看完整的 API 文档
