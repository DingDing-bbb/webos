# WebOS 入门指南

## 环境要求

- [Bun](https://bun.sh) 1.0 或更高版本（推荐）
- Node.js 18+（备选，但建议使用 Bun）

## 安装

克隆仓库并安装依赖：

```bash
git clone https://github.com/DingDing-bbb/webos.git
cd webos
bun install
```

## 开发

启动开发服务器（Next.js + Turbopack）：

```bash
bun run dev
```

访问 http://localhost:3000 即可预览 WebOS 桌面环境。

## 构建

生成静态站点（用于部署到 GitHub Pages 等）：

```bash
bun run build
```

输出目录：site/out/

## 使用 SDK

WebOS 提供了命令行工具 webos-sdk，用于创建、构建和测试应用。

### 创建一个新应用

```bash
cd packages/os/packages/sdk
bun run build  # 首次使用需要编译 SDK
./dist/cli.js create my-app
cd my-app
bun install
```

### 构建应用

```bash
webos-sdk build
```

### 监听模式（自动重建）

```bash
webos-sdk build --watch
```

### 运行测试

```bash
webos-sdk test
```

## 项目结构

- `site/` - Next.js 主站点（包含 WebOS 桌面 UI）
- `packages/os/packages/` - 核心模块（kernel, ui, apps, sdk...）
- `packages/os/packages/sdk` - CLI 开发工具

## 下一步

- 查看 [CLI 工具文档](cli.md)
- 查看 [API 参考](api.md)
- 查看 [应用配置](app-config.md)
