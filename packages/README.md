# Packages

系统核心包目录。

## 包列表

| 包名 | 描述 |
|------|------|
| bootloader | 引导加载器（完整性检查、错误检测） |
| recovery | 恢复模式（系统错误恢复界面） |
| kernel | 系统内核（API、文件系统、窗口管理） |
| i18n | 多语言国际化 |
| ui | UI 组件库 |
| oobe | 首次启动向导 |
| apps | 应用程序 |

## 启动流程

```
1. bootloader (引导加载器)
   ├── 检查 Service Worker
   ├── 运行完整性检查
   ├── 加载核心模块
   └── 缓存核心文件

2. recovery (如果启动失败)
   └── 显示恢复模式界面

3. kernel (内核初始化)
   └── 初始化 window.webos API

4. oobe / desktop
   └── 显示启动向导或桌面
```

## 依赖关系

```
bootloader (引导加载器)
  └── 无依赖

recovery (恢复模式)
  └── 依赖 bootloader

kernel (内核)
  └── 无依赖

ui (UI组件)
  └── 依赖 kernel (类型)

i18n (多语言)
  └── 依赖 kernel (类型)

oobe (启动向导)
  └── 依赖 kernel, ui

apps (应用)
  └── 依赖 kernel, ui, i18n
```

## 恢复机制

当系统检测到严重错误时：

1. **语法错误** → 自动进入恢复模式
2. **模块加载失败** → 显示错误信息，可重试
3. **网络错误** → 提示检查网络，可从缓存恢复
4. **缓存错误** → 提供重置选项

恢复选项：
- 从缓存恢复（需要 Service Worker）
- 重试启动
- 重置系统（清除所有数据）
