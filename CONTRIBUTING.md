# 贡献指南

感谢您有兴趣为 WebOS 做出贡献！

## 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/DingDing-bbb/webos.git
cd webos

# 安装依赖
bun install

# 启动开发服务器
bun run dev
```

## 项目结构

```
webos/
├── site/              # Next.js 网站入口
├── packages/os/       # WebOS 核心系统
│   └── packages/
│       ├── kernel/    # 核心功能
│       ├── ui/        # UI 组件库
│       ├── apps/      # 内置应用
│       ├── i18n/      # 国际化
│       └── ...
└── docs/              # 项目文档
```

## 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 配置
- 组件使用函数式组件 + Hooks
- 样式使用 CSS Modules 或 CSS 文件

## 提交规范

使用约定式提交：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具相关

## 分支策略

- `master` - 主分支，稳定版本
- `develop` - 开发分支
- `feature/*` - 功能分支
- `fix/*` - 修复分支

## Pull Request 流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 问题反馈

请使用 [GitHub Issues](https://github.com/DingDing-bbb/webos/issues) 反馈问题。

## 许可证

本项目采用 MIT 许可证。贡献的代码将以相同许可证发布。
