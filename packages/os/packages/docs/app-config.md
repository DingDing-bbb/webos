# 应用配置

每个 WebOS 应用都需要一个 `appinfo.json` 配置文件。

## 基本结构

```json
{
  "id": "com.example.myapp",
  "name": "My App",
  "version": "1.0.0",
  "category": "productivity",
  "main": "./dist/index.js",
  "icon": "./dist/icon.js"
}
```

## 配置项说明

### 必填字段

| 字段       | 类型   | 说明                                      |
| ---------- | ------ | ----------------------------------------- |
| `id`       | string | 应用唯一标识，格式：`com.company.appname` |
| `name`     | string | 应用名称                                  |
| `version`  | string | 版本号，遵循语义化版本                    |
| `category` | string | 应用分类                                  |
| `main`     | string | 入口文件路径                              |
| `icon`     | string | 图标文件路径                              |

### 可选字段

| 字段            | 类型     | 默认值 | 说明               |
| --------------- | -------- | ------ | ------------------ |
| `description`   | string   | -      | 应用描述           |
| `author`        | string   | -      | 作者信息           |
| `defaultWidth`  | number   | 700    | 默认窗口宽度       |
| `defaultHeight` | number   | 450    | 默认窗口高度       |
| `minWidth`      | number   | 200    | 最小窗口宽度       |
| `minHeight`     | number   | 150    | 最小窗口高度       |
| `resizable`     | boolean  | true   | 是否可调整窗口大小 |
| `singleton`     | boolean  | false  | 是否单例模式       |
| `permissions`   | string[] | []     | 所需权限列表       |

## 应用分类

```typescript
type AppCategory =
  | 'system' // 系统工具
  | 'productivity' // 生产力
  | 'media' // 媒体
  | 'games' // 游戏
  | 'network' // 网络
  | 'development' // 开发
  | 'utilities'; // 实用工具
```

## 权限配置

```json
{
  "permissions": [
    "fs:read", // 文件系统读取
    "fs:write", // 文件系统写入
    "network", // 网络访问
    "notification", // 通知权限
    "clipboard", // 剪贴板访问
    "storage" // 本地存储
  ]
}
```

## 示例配置

### 文本编辑器

```json
{
  "id": "com.example.texteditor",
  "name": "Text Editor",
  "version": "1.0.0",
  "category": "productivity",
  "main": "./dist/index.js",
  "icon": "./dist/icon.js",
  "description": "A simple text editor",
  "defaultWidth": 800,
  "defaultHeight": 600,
  "minWidth": 400,
  "minHeight": 300,
  "permissions": ["fs:read", "fs:write", "storage"]
}
```

### 音乐播放器

```json
{
  "id": "com.example.musicplayer",
  "name": "Music Player",
  "version": "1.0.0",
  "category": "media",
  "main": "./dist/index.js",
  "icon": "./dist/icon.js",
  "description": "Play your favorite music",
  "defaultWidth": 400,
  "defaultHeight": 500,
  "resizable": false,
  "permissions": ["fs:read", "notification"]
}
```
