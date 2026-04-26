# WebOS 代码风格指南

## 概述

本指南定义了 WebOS 项目的统一代码风格规范，旨在提高代码一致性、可读性和维护性。所有贡献者必须遵循此规范。

## TypeScript 规范

### 文件扩展名
- **`.ts`**: 纯 TypeScript 文件（不包含 JSX）
- **`.tsx`**: 包含 JSX 的 TypeScript 文件
- **`.d.ts`**: 类型声明文件

### 类型定义
```typescript
// ✅ 推荐
interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

type UserRole = 'admin' | 'user' | 'guest';

// ❌ 避免
type UserProfile = {
  id: string;
  name: string;
};
```

### 类型导入
```typescript
// ✅ 推荐 - 内联导入类型
import { useState, useEffect, type FC } from 'react';

// ✅ 推荐 - 单独导入类型
import type { UserProfile, UserRole } from './types';

// ❌ 避免 - 混合导入
import { useState, UserProfile } from './types';
```

### 空值处理
```typescript
// ✅ 推荐
const name: string | null = getUserName();
if (name) {
  console.log(name.toUpperCase());
}

// 使用可选链
const userEmail = user?.email;

// 使用空值合并
const displayName = username ?? 'Anonymous';
```

## React 规范

### 组件定义
```typescript
// ✅ 推荐 - 函数式组件 + Props 类型
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  children,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ✅ 推荐 - 内联 Props 定义
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="card">
    <h3>{title}</h3>
    <div className="card-content">{children}</div>
  </div>
);
```

### Hooks 使用
```typescript
// ✅ 推荐 - 命名清晰的 Hooks
const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
};

// ❌ 避免 - 复杂逻辑的内联 Hooks
const [data, setData] = useState(null);
useEffect(() => {
  // 复杂逻辑...
}, []);
```

### 事件处理
```typescript
// ✅ 推荐
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // 处理逻辑
};

const handleClick = useCallback((itemId: string) => {
  // 处理点击
}, []);

// 在组件中
<form onSubmit={handleSubmit}>
  <button onClick={() => handleClick(item.id)}>Click</button>
</form>
```

## 命名约定

### 文件和目录
- **PascalCase**: 组件文件 (`Button.tsx`, `UserProfile.tsx`)
- **kebab-case**: 非组件文件、目录 (`api-client.ts`, `user-service.ts`, `components/`)
- **camelCase**: 工具函数文件 (`formatDate.ts`, `validationUtils.ts`)

### 变量和函数
- **camelCase**: 变量、函数、方法 (`userName`, `getUserData`, `handleSubmit`)
- **PascalCase**: 类、接口、类型、枚举、React 组件 (`UserService`, `ButtonProps`, `ThemeMode`)
- **UPPER_SNAKE_CASE**: 常量、配置值 (`API_URL`, `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`)

### 示例
```typescript
// 变量和函数
const userName = 'John';
const isLoading = false;
const getUserProfile = () => { /* ... */ };
const handleClick = () => { /* ... */ };

// 类型和接口
interface UserSettings {
  theme: ThemeMode;
  language: string;
}

type ApiResponse<T> = {
  data: T;
  success: boolean;
};

// 常量
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_TIMEOUT = 5000;
```

## 导入组织

### 分组顺序
1. 外部依赖（React、第三方库）
2. 内部模块（@kernel、@ui 等路径别名）
3. 相对路径（父目录）
4. 相对路径（同级目录）
5. 样式文件
6. 类型导入

### 示例
```typescript
// 1. 外部依赖
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

// 2. 内部模块（路径别名）
import { kernel } from '@kernel/core';
import { Button, Card } from '@ui/components';
import { useI18n } from '@i18n/hooks';

// 3. 相对路径（父目录）
import { apiClient } from '../../lib/api';

// 4. 相对路径（同级目录）
import { formatDate } from './utils';
import { UserAvatar } from './UserAvatar';

// 5. 样式文件
import styles from './UserProfile.module.css';

// 6. 类型导入
import type { User, UserRole } from './types';
```

## 格式化规范

### Prettier 配置
项目使用以下 Prettier 配置：
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 换行和缩进
```typescript
// ✅ 推荐 - 适当的换行
const longFunctionCall = someFunction(
  argument1,
  argument2,
  argument3,
  argument4,
);

const component = (
  <div>
    <Header
      title="WebOS Settings"
      subtitle="System Configuration"
      onClose={handleClose}
    />
    <Content>
      <Sidebar items={menuItems} />
      <Main>
        <SettingsForm />
      </Main>
    </Content>
  </div>
);

// ❌ 避免 - 过长的行
const badExample = someFunction(argument1, argument2, argument3, argument4, argument5, argument6);
```

## 注释规范

### JSDoc 注释
```typescript
/**
 * 获取用户信息的 Hook
 * @param userId - 用户ID
 * @returns 用户数据、加载状态和错误信息
 */
const useUserData = (userId: string) => {
  // ...
};

/**
 * 用户配置接口
 * @property theme - 主题模式
 * @property language - 用户语言偏好
 */
interface UserSettings {
  theme: ThemeMode;
  language: string;
}
```

### 内联注释
```typescript
// ✅ 推荐 - 解释复杂逻辑
// 计算用户权限等级，基于角色和许可证状态
const permissionLevel = calculatePermissionLevel(user.role, license.status);

// ❌ 避免 - 描述明显的行为
// 设置用户姓名
setUserName(name);
```

### TODO 注释
```typescript
// TODO: 实现文件上传进度显示
// FIXME: 修复移动端触摸事件处理
// OPTIMIZE: 缓存 API 响应以减少请求次数
// HACK: 临时解决方案，需要重构
```

## CSS 和样式

### 类名命名
- 使用 **BEM 命名法** 或 **CSS Modules**
- 避免使用全局样式污染

```css
/* ✅ 推荐 - CSS Modules */
.button {
  /* 基础样式 */
}

.button--primary {
  /* 修饰符 */
}

.button__icon {
  /* 子元素 */
}

/* ❌ 避免 - 过于简单的类名 */
.btn {
  /* 可能与其他组件冲突 */
}
```

### 样式导入
```typescript
// ✅ 推荐 - CSS Modules
import styles from './Button.module.css';

const Button = () => (
  <button className={styles.button}>
    Click me
  </button>
);

// ✅ 推荐 - 使用 UI 组件库
import { Button } from '@ui/components';
```

## 测试规范

### 测试文件命名
- 组件测试: `ComponentName.test.tsx`
- 工具函数测试: `functionName.test.ts`
- E2E 测试: `featureName.e2e.ts`

### 测试结构
```typescript
describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });

  describe('when disabled', () => {
    it('does not call onClick', () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByText('Click'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
```

## 提交规范

### 提交消息格式
```
<type>: <description>

[optional body]

[optional footer]
```

### 提交类型
- **feat**: 新功能
- **fix**: 修复 bug
- **docs**: 文档更新
- **style**: 代码风格调整（不影响功能）
- **refactor**: 代码重构
- **test**: 测试相关
- **chore**: 构建过程或工具更新

### 示例
```
feat: add user authentication system

- Implement login/logout functionality
- Add JWT token management
- Create protected route middleware

Closes #123
```

## 工具配置

### 编辑器配置
项目包含 `.editorconfig` 文件，确保编辑器使用统一设置。

### Git Hooks
项目使用 Husky 和 lint-staged 在提交前自动检查和修复代码：
- 自动运行 Prettier 格式化
- 自动运行 ESLint 检查

### IDE 插件推荐
- ESLint
- Prettier
- TypeScript
- React Developer Tools

## 异常处理

### 错误边界
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  // 实现错误边界
}

// 使用
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Promise 错误处理
```typescript
// ✅ 推荐
try {
  const data = await fetchData();
} catch (error) {
  console.error('Failed to fetch data:', error);
  showErrorToast('数据加载失败');
}

// 或者使用错误边界包装异步操作
```

## 性能优化

### React 优化
```typescript
// 使用 useMemo 缓存计算
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// 使用 useCallback 缓存函数
const handleClick = useCallback(() => {
  // 处理点击
}, [dependency]);

// 使用 React.memo 避免不必要的重渲染
const MemoizedComponent = React.memo(ExpensiveComponent);
```

### 代码分割
```typescript
// 动态导入组件
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// 使用 Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

## 贡献流程

1. 创建功能分支 (`feat/add-user-auth`)
2. 编写代码，遵循本风格指南
3. 添加测试
4. 运行 `bun run lint` 和 `bun run format`
5. 提交代码，使用规范提交消息
6. 创建 Pull Request

## 代码审查要点

审查代码时关注：
- ✅ 遵循命名约定
- ✅ 类型安全（无 any 类型）
- ✅ 代码可读性
- ✅ 适当的错误处理
- ✅ 测试覆盖
- ✅ 性能考虑
- ✅ 安全性考虑

---

*最后更新: 2024-01-01*
*本指南应随着项目发展而更新。如有疑问，请创建 Issue 讨论。*