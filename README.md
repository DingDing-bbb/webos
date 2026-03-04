# WebOS

一个在浏览器中运行的类操作系统单页应用。

## 功能特性

- **启动动画** - Logo 淡入、进度条
- **OOBE** - 首次启动向导（用户设置、语言选择）
- **窗口系统** - 拖动、缩放、最小化、最大化
- **文件系统** - 类 Unix 内存文件系统，支持权限
- **多语言** - 中英繁支持

## 项目结构

```
webos/
├── packages/              # 系统包
│   ├── kernel/            # 内核
│   ├── i18n/              # 多语言
│   ├── ui/                # UI组件
│   ├── oobe/              # 启动向导
│   └── apps/              # 应用程序
│       ├── com.os.filemanager/
│       ├── com.os.clock/
│       ├── com.os.terminal/
│       └── com.os.settings/
│
├── src/                   # 主入口
│   └── index.tsx
│
├── webpack.config.js
├── tsconfig.json
└── package.json
```

## 快速开始

```bash
# 安装依赖
bun install

# 开发模式
bun run dev

# 构建
bun run build
```

## 技术栈

- React 18
- TypeScript
- Webpack 5
- Custom Elements

## 系统 API

```typescript
// 窗口管理
window.webos.window.open(appId, options)
window.webos.window.close(windowId)

// 文件系统
window.webos.fs.read(path)
window.webos.fs.write(path, content)

// 通知
window.webos.notify.show(title, message)

// 用户
window.webos.user.getCurrentUser()
window.webos.user.requestPrivilege(reason)
```

## 许可证

MIT
