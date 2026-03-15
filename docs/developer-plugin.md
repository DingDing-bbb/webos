# WebOS 开发者插件

开发者插件允许在系统启动后强制重置系统。此功能主要用于开发和调试目的。

## 安装方式

### 方式一：OOBE阶段（首次启动）

在OOBE（首次启动向导）界面：

1. 按 **F12** 打开浏览器开发者工具
2. 切换到 **Console** 标签
3. 输入以下命令并回车：

```javascript
webosInstallDevPlugin()
```

此时插件会安装到引导程序中，无需密码验证。

### 方式二：非OOBE阶段

如果系统已经完成首次启动设置，安装开发者插件需要：

1. 按 **F12** 打开浏览器开发者工具
2. 切换到 **Console** 标签
3. 输入以下命令并回车：

```javascript
webosInstallDevPlugin()
```

此时需要输入管理员密码进行验证。

## 控制台命令

安装开发者插件后，可以使用以下控制台命令：

### 检查插件状态

```javascript
webosCanResetSystem()
// 返回 true 表示插件已安装，可以进行系统重置
```

### 重置系统

```javascript
webosResetSystem()
// 清除所有数据并重启系统
// ⚠️ 此操作不可逆，所有用户数据和设置将被删除
```

### 卸载插件

```javascript
webosUninstallDevPlugin()
// 卸载开发者插件
// 卸载后将无法使用 webosResetSystem() 命令
```

## 安全说明

- 开发者插件存储在浏览器的 `localStorage` 中
- 插件只在 OOBE 阶段可以免密安装
- 在正常使用阶段安装需要管理员密码验证
- 重置系统会清除所有 IndexedDB、localStorage、SessionStorage 和缓存数据

## 权限说明

开发者插件包含以下权限：

| 权限 | 说明 |
|------|------|
| `system:reset` | 允许重置系统 |
| `system:debug` | 允许调试功能 |
| `system:recovery` | 允许进入恢复模式 |

## 技术实现

插件作为一个独立的包存在于 `packages/dev-plugin` 目录中。插件的安装状态存储在：

- `localStorage['webos-dev-plugin-installed']` - 安装状态
- `localStorage['webos-bootloader-plugins']` - 插件列表

插件通过 `bootloader` 模块进行管理，相关代码位于 `packages/bootloader/src/index.ts`。
