# CLI 命令

WebOS SDK 提供命令行工具，用于创建、构建和打包应用。

## 安装

```bash
# 全局安装
npm install -g @webos/sdk

# 或在项目中安装
npm install @webos/sdk --save-dev
```

## 命令概览

```bash
webos-sdk <command> [options]

Commands:
  create <app-id>  创建新应用
  build            构建应用
  dev              启动开发服务器
  pack             打包应用

Options:
  -h, --help       显示帮助信息
  -v, --version    显示版本号
```

## create

创建新的 WebOS 应用。

### 用法

```bash
webos-sdk create <app-id> [options]
```

### 参数

| 参数     | 必填 | 说明                                 |
| -------- | ---- | ------------------------------------ |
| `app-id` | 是   | 应用 ID，格式：`com.company.appname` |

### 选项

| 选项          | 简写 | 默认值         | 说明       |
| ------------- | ---- | -------------- | ---------- |
| `--name`      | `-n` | 从 app-id 提取 | 应用名称   |
| `--category`  | `-c` | `utilities`    | 应用分类   |
| `--template`  | `-t` | `default`      | 使用的模板 |
| `--directory` | `-d` | 当前目录       | 目标目录   |

### 示例

```bash
# 创建基础应用
webos-sdk create com.example.myapp

# 指定名称和分类
webos-sdk create com.example.editor --name "代码编辑器" --category development

# 指定目标目录
webos-sdk create com.example.game --category games --directory ./my-games
```

### 生成的项目结构

```
my-app/
├── src/
│   ├── index.tsx      # 应用入口
│   ├── App.tsx        # 主组件
│   ├── icon.tsx       # 图标组件
│   └── styles.css     # 样式文件
├── locales/
│   ├── en.json        # 英文翻译
│   └── zh-CN.json     # 中文翻译
├── appinfo.json       # 应用配置
├── package.json
├── tsconfig.json
└── README.md
```

## build

构建应用。

### 用法

```bash
webos-sdk build [options]
```

### 选项

| 选项          | 简写 | 默认值         | 说明            |
| ------------- | ---- | -------------- | --------------- |
| `--config`    | `-c` | `appinfo.json` | 配置文件路径    |
| `--output`    | `-o` | `dist`         | 输出目录        |
| `--minify`    | `-m` | `false`        | 压缩输出        |
| `--sourcemap` | `-s` | `false`        | 生成 source map |

### 示例

```bash
# 基础构建
webos-sdk build

# 压缩并生成 source map
webos-sdk build --minify --sourcemap

# 指定配置文件和输出目录
webos-sdk build -c my-config.json -o ./build
```

### 构建输出

```
dist/
├── index.js          # 打包后的代码
├── icon.js           # 图标组件
├── appinfo.json      # 应用配置
└── locales/          # 翻译文件
    ├── en.json
    └── zh-CN.json
```

## dev

启动开发服务器。

### 用法

```bash
webos-sdk dev [options]
```

### 选项

| 选项      | 简写 | 默认值 | 说明           |
| --------- | ---- | ------ | -------------- |
| `--port`  | `-p` | `3000` | 开发服务器端口 |
| `--watch` | `-w` | `true` | 监听文件变化   |

### 示例

```bash
# 启动开发服务器
webos-sdk dev

# 指定端口
webos-sdk dev --port 8080
```

## pack

打包应用为可分发格式。

### 用法

```bash
webos-sdk pack [options]
```

### 选项

| 选项       | 简写 | 默认值      | 说明       |
| ---------- | ---- | ----------- | ---------- |
| `--output` | `-o` | `app.webos` | 输出文件名 |

### 示例

```bash
# 打包应用
webos-sdk pack

# 指定输出文件名
webos-sdk pack -o my-app-1.0.0.webos
```

### 打包输出

打包后会生成一个包含以下内容的目录：

- `manifest.json` - 包清单
- `index.js` - 应用代码
- `icon.js` - 图标
- `appinfo.json` - 应用配置
- `locales/` - 翻译文件

## 配置文件

### package.json scripts

```json
{
  "scripts": {
    "dev": "webos-sdk dev",
    "build": "webos-sdk build",
    "pack": "webos-sdk pack"
  }
}
```

## 环境变量

| 变量               | 说明             |
| ------------------ | ---------------- |
| `WEBOS_SDK_DEBUG`  | 启用调试模式     |
| `WEBOS_SDK_CONFIG` | 默认配置文件路径 |

```bash
# 启用调试模式
WEBOS_SDK_DEBUG=true webos-sdk build
```
