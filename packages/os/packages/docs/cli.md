# WebOS SDK CLI 工具

`webos-sdk` 是 WebOS 官方命令行工具，用于创建、构建和测试 WebOS 应用。

## 安装

SDK 已集成在 monorepo 的 `packages/os/packages/sdk` 目录中。在项目根目录运行：

```bash
bun install
cd packages/os/packages/sdk
bun run build
```

之后可以全局链接（可选）：

```bash
cd packages/os/packages/sdk
bun link --global
```

## 命令

### webos-sdk create \<app-name\>

创建一个新的 WebOS 应用项目。

```bash
webos-sdk create my-app
cd my-app
bun install
```

生成的项目结构：

```
my-app/
├── src/
│   └── index.tsx      # 入口组件
├── index.html         # HTML 模板
├── package.json
└── README.md
```

### webos-sdk build

构建当前应用，输出到 dist/app.js。

```bash
webos-sdk build
```

**选项**

- `-w, --watch`：监听模式，文件变化时自动重新构建。

```bash
webos-sdk build --watch
```

### webos-sdk test

运行当前应用中的测试（基于 bun test）。

```bash
webos-sdk test
```

**选项**

- `--coverage`：生成测试覆盖率报告。

```bash
webos-sdk test --coverage
```

## 开发工作流示例

1. 创建应用：`webos-sdk create todo-app`
2. 进入目录：`cd todo-app`
3. 安装依赖：`bun install`
4. 开发模式：`webos-sdk build --watch`
5. 编写代码：编辑 `src/index.tsx`
6. 编写测试：创建 `src/index.test.ts`
7. 运行测试：`webos-sdk test`
8. 发布：将 `dist/app.js` 部署到 WebOS 环境

## 故障排除

### command not found: webos-sdk

确保在 SDK 目录执行了 `bun run build`，并已运行 `bun link --global`（或直接使用 `./dist/cli.js`）。

### 构建失败：找不到 src/index.tsx

检查当前目录下是否存在 `src/index.tsx` 文件。SDK 默认以此为入口。

### 测试失败：bun: command not found

请先安装 Bun：https://bun.sh
