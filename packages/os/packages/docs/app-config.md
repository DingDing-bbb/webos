# 应用配置 (app.json)

每个 WebOS 应用需要在根目录提供 `app.json` 文件，定义元数据、权限和入口。

## 示例

```json
{
  "id": "com.example.myapp",
  "name": "My App",
  "version": "1.0.0",
  "icon": "/icons/app.png",
  "entry": "./src/index.tsx",
  "permissions": ["storage", "notifications"],
  "settings": {
    "fullscreen": false,
    "resizable": true
  }
}
```

## 字段说明

| 字段        | 类型     | 必填 | 说明                         |
| ----------- | -------- | ---- | ---------------------------- |
| id          | string   | 是   | 唯一标识符，反向域名格式     |
| name        | string   | 是   | 显示名称                     |
| version     | string   | 是   | 语义化版本                   |
| icon        | string   | 否   | 图标路径（相对于应用根目录） |
| entry       | string   | 是   | 入口文件（相对于应用根目录） |
| permissions | string[] | 否   | 申请的权限列表               |
| settings    | object   | 否   | 运行时配置                   |

## 可用权限

| 权限          | 说明                       |
| ------------- | -------------------------- |
| storage       | 读写应用私有存储           |
| notifications | 发送系统通知               |
| network       | 发起网络请求               |
| clipboard     | 读写剪贴板                 |
| filesystem    | 访问用户文件（需用户授权） |

## 开发时配置

在开发阶段，可以将 `app.json` 放在应用根目录，SDK 构建时会自动读取。如果未提供，SDK 会使用默认配置：

```json
{
  "id": "dev-app",
  "name": "Dev App",
  "version": "0.0.1",
  "entry": "./src/index.tsx",
  "permissions": []
}
```

## 完整配置示例

```json
{
  "id": "com.webos.texteditor",
  "name": "文本编辑器",
  "version": "1.2.0",
  "icon": "./assets/icon.svg",
  "entry": "./src/index.tsx",
  "description": "轻量级文本编辑器",
  "permissions": ["storage", "filesystem", "clipboard"],
  "settings": {
    "fullscreen": false,
    "resizable": true,
    "defaultWidth": 800,
    "defaultHeight": 600,
    "minWidth": 400,
    "minHeight": 300
  }
}
```
