# WebOS 贡献指南

感谢您对 WebOS 项目的关注！本文档旨在帮助您了解如何为项目做出贡献。

## 行为准则

请遵守以下行为准则：
- 尊重所有贡献者
- 建设性讨论，避免人身攻击
- 保持开放和包容的态度

## 开始贡献

### 1. 环境设置

#### 系统要求
- Node.js 18+ 或 Bun 1.0+
- Git 2.20+
- 现代浏览器（Chrome 90+、Firefox 88+、Safari 14+）

#### 克隆仓库
```bash
git clone https://github.com/DingDing-bbb/webos.git
cd webos
```

#### 安装依赖
```bash
# 使用 Bun（推荐）
bun install

# 或使用 npm
npm install
```

#### 启动开发服务器
```bash
# 启动 Next.js 开发服务器（主入口）
bun run dev

# 或直接进入 site 目录
cd site && bun run dev
```

### 2. 项目结构

了解项目结构对于贡献非常重要：
```
webos/
├── packages/           # 核心包
│   ├── os/            # WebOS 核心系统
│   │   └── packages/  # 子模块（内核、UI、应用等）
│   └── site/          # Next.js 网站入口
├── docs/              # 文档
└── 配置文件           # 构建、代码质量等配置
```

详细结构请参考 [README.md](./README.md)。

## 贡献流程

### 1. 找到贡献点

#### 新手友好的任务
- 修复拼写错误或文档问题
- 添加测试用例
- 改进现有代码的注释
- 优化 CSS 样式

#### 功能开发
- 查看 [Issues](https://github.com/DingDing-bbb/webos/issues) 中的任务
- 寻找标记为 `good first issue` 或 `help wanted` 的标签
- 讨论新功能想法前，请先创建 Issue 进行讨论

### 2. 创建分支

```bash
# 同步主分支
git checkout main
git pull origin main

# 创建功能分支
git checkout -b feat/your-feature-name
# 或修复分支
git checkout -b fix/issue-description
```

**分支命名规范**:
- `feat/`: 新功能
- `fix/`: 修复 bug
- `docs/`: 文档更新
- `style/`: 代码风格调整
- `refactor/`: 代码重构
- `test/`: 测试相关
- `chore/`: 构建过程或工具更新

### 3. 编写代码

#### 遵循代码风格
请严格遵守 [代码风格指南](./STYLE-GUIDE.md)：
```bash
# 提交前运行检查和格式化
bun run lint
bun run format
bun run typecheck
```

#### 编写测试
- 为新功能添加单元测试
- 确保现有测试通过
- 考虑边界情况和错误处理

```bash
# 运行测试
bun run test

# 运行测试并生成覆盖率报告
bun run test:coverage
```

#### 提交代码

```bash
# 添加更改
git add .

# 提交（遵循提交信息规范）
git commit -m "feat: 添加新功能描述"
```

**提交信息格式**:
```
<type>: <description>

[optional body]

[optional footer]
```

示例：
```
feat: 添加用户认证系统

- 实现登录/登出功能
- 添加 JWT 令牌管理
- 创建受保护路由中间件

Closes #123
```

### 4. 创建 Pull Request

1. 推送分支到远程仓库：
   ```bash
   git push origin feat/your-feature-name
   ```

2. 在 GitHub 上创建 Pull Request
3. 填写 PR 描述模板
4. 关联相关 Issue（如适用）
5. 等待代码审查

## 代码审查

### 审查流程
1. **自动检查**：CI/CD 流水线运行测试和检查
2. **人工审查**：至少需要 1 名维护者批准
3. **修改请求**：根据反馈进行修改
4. **合并**：审查通过后由维护者合并

### 审查要点
审查者会关注：
- ✅ 代码符合风格指南
- ✅ 功能按预期工作
- ✅ 包含适当的测试
- ✅ 文档已更新
- ✅ 没有引入新的 bug
- ✅ 性能影响可接受

## 开发指南

### 1. 添加新应用

#### 步骤
1. 在 `packages/os/packages/apps/` 下创建新目录
2. 创建应用配置文件：
   ```json
   // appinfo.json
   {
     "id": "com.os.your-app",
     "name": "Your App",
     "version": "1.0.0",
     "description": "应用描述",
     "author": "你的名字",
     "category": "utilities",
     "icon": "path/to/icon.svg",
     "entry": "./src/index.tsx"
   }
   ```

3. 实现应用组件：
   ```typescript
   // src/index.tsx
   import React from 'react';
   import './styles.css';

   const YourApp: React.FC = () => {
     return <div>你的应用内容</div>;
   };

   export default YourApp;
   ```

4. 在应用注册表中注册：
   ```typescript
   // packages/os/packages/apps/registry.tsx
   import YourApp from './your-app/src/index.tsx';
   
   appRegistry.register({
     id: 'com.os.your-app',
     // ... 其他配置
   });
   ```

### 2. 添加新 UI 组件

1. 在 `packages/os/packages/ui/src/components/` 下创建组件
2. 实现组件及其 TypeScript 类型
3. 添加组件样式（CSS Modules）
4. 添加组件文档和示例
5. 导出组件

### 3. 修改内核 API

**重要**：内核 API 修改需要谨慎，可能影响现有应用。

1. 更新类型定义
2. 实现 API 变更
3. 更新相关文档
4. 考虑向后兼容性
5. 添加废弃警告（如需要）

## 测试指南

### 测试结构
```
__tests__/
├── unit/           # 单元测试
├── integration/    # 集成测试
└── e2e/           # 端到端测试
```

### 编写测试
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## 文档指南

### 文档类型
1. **代码注释**：使用 JSDoc 格式
2. **组件文档**：说明组件用法和 Props
3. **API 文档**：描述公共 API 的使用
4. **教程文档**：引导用户完成特定任务

### 文档标准
- 使用清晰、简洁的语言
- 包含代码示例
- 说明前提条件和依赖
- 保持文档与代码同步

## 故障排除

### 常见问题

#### 依赖安装失败
```bash
# 清理并重新安装
bun run clean
bun install
```

#### 类型检查错误
```bash
# 运行类型检查
bun run typecheck

# 如果遇到错误，检查 tsconfig.json 配置
```

#### 构建失败
```bash
# 检查错误信息
bun run build

# 查看详细日志
bun run build --verbose
```

### 获取帮助
- 查看现有文档和 Issues
- 在 Discussions 中提问
- 联系维护者

## 发布流程

### 版本管理
WebOS 使用语义化版本控制：
- **主版本**：不兼容的 API 修改
- **次版本**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 发布步骤
1. 更新版本号
2. 更新 CHANGELOG.md
3. 创建发布标签
4. 构建发布包
5. 发布到 GitHub Releases

## 维护者指南

### 权限和责任
- 审查和合并 Pull Request
- 管理 Issues 和项目看板
- 维护代码质量和项目健康度
- 制定项目路线图

### 合并准则
- 确保 CI 通过
- 获得足够的审查批准
- 遵循语义化版本控制
- 更新相关文档

## 社区参与

### 沟通渠道
- **GitHub Issues**: 功能请求和 bug 报告
- **GitHub Discussions**: 讨论和问答
- **Pull Requests**: 代码贡献

### 活动参与
- 参与代码审查
- 帮助解答问题
- 改进文档
- 分享使用经验

## 许可证

WebOS 项目使用 MIT 许可证。所有贡献者需同意其代码将按此许可证发布。

## 致谢

感谢所有贡献者的时间和努力！WebOS 的发展离不开社区的参与和支持。

---

*本文档最后更新: 2024-01-01*
*如有疑问或建议，请创建 Issue 讨论。*