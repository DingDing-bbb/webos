# WebOS 项目记录

## 项目简介

WebOS - 一个在浏览器中运行的操作系统，具有真实的操作系统体验。

技术栈：React 18 + TypeScript + Webpack 5 + Bun

---

## 项目结构

```
/home/z/my-project/
├── src/index.tsx              # 主入口
├── packages/
│   ├── kernel/                # 内核 - 窗口管理、文件系统、API
│   ├── ui/                    # UI组件 - 桌面、任务栏、启动菜单
│   ├── i18n/                  # 国际化 - 多语言支持
│   ├── bootloader/            # 启动加载器
│   ├── oobe/                  # 首次启动向导
│   ├── recovery/              # 恢复模式
│   ├── tablet/                # 平板/触摸支持
│   └── apps/                  # 内置应用
│       ├── com.os.settings/   # 设置
│       ├── com.os.filemanager/# 文件管理器
│       ├── com.os.clock/      # 时钟
│       └── com.os.terminal/   # 终端
├── webpack.config.js
└── package.json
```

---

## 已完成的工作

### 2024-03 (根据 git 记录)

1. **Initial commit** - 初始化项目
2. **Add top-level t() translation** - 添加顶层翻译方法
3. **Real resource loading** - 真实资源加载和初始化系统
4. **Allow filesystem access before login** - 允许登录前文件系统访问
5. **Complete i18n translations** - 完成所有语言翻译 (en, zh-CN, zh-TW)
6. **Add tablet/touch support** - 添加平板/触摸设备支持
7. **Remove @tablet dependency** - 移除依赖，内联平板检测
8. **Complete Settings app** - 完成设置应用所有功能

### 设置应用功能
- 系统设置（系统名称、平板模式）
- 语言设置（简中/繁中/英文）
- 日期时间设置（时区、格式）
- 显示设置（主题、字体大小）
- 存储管理（查看使用、清除缓存）
- 恢复（重置系统、重启）
- 关于（系统信息）

---

## 本次会话修复的问题

### 窗口内容空白问题

**问题**：打开应用时，窗口框架正常但内容区域空白。

**原因**：
- `OSWindow` 自定义元素的 `connectedCallback` 在 `appendChild` 时触发
- `connectedCallback` 调用 `render()` 使用 `innerHTML` 重写DOM
- 导致之前通过 `setContent` 设置的内容丢失

**修复**：
- 添加 `pendingContent` 属性保存 DOM 未就绪时的内容
- 添加 `isRendered` 标志跟踪渲染状态
- `connectedCallback` 在 `render()` 后恢复 `pendingContent`
- `setState` 在已渲染时只更新样式，不重新渲染

**修改文件**：`packages/kernel/src/core/windowManager.ts`

---

## 开发命令

```bash
bun run dev    # 启动开发服务器 (端口3000)
bun run lint   # 代码检查
```

## 远程仓库

GitHub: https://github.com/DingDing-bbb/webos.git
