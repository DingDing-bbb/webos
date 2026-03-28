# OOBE

首次启动向导模块 (Out-of-Box Experience)。

## 包名

无独立包名，通过 `@oobe` 别名引用。

## 功能

- 用户名设置
- 密码设置
- 语言选择
- 系统名称设置
- 平板模式选择
- 主题选择

## 目录结构

```
oobe/
├── package.json
├── README.md
└── src/
    └── index.tsx
```

## 使用

```tsx
import { OOBE } from '@oobe';

function App() {
  const [showOOBE, setShowOOBE] = useState(false);

  if (showOOBE) {
    return (
      <OOBE 
        onComplete={(data) => {
          console.log('User:', data.username);
          console.log('Language:', data.language);
          console.log('System Name:', data.systemName);
          console.log('Tablet Mode:', data.tabletMode);
          console.log('Theme:', data.theme);
          
          setShowOOBE(false);
        }} 
      />
    );
  }
}
```

## 完成数据

```typescript
interface OOBECompleteData {
  username: string;        // 用户名
  password: string;        // 密码
  language: string;        // 语言代码（如 'zh-CN'）
  systemName?: string;     // 系统名称
  tabletMode?: boolean;    // 是否启用平板模式
  theme?: 'light' | 'dark'; // 主题
}
```

## 向导步骤

1. **欢迎页面** - 系统介绍
2. **语言选择** - 选择界面语言
3. **用户设置** - 设置用户名和密码
4. **系统设置** - 系统名称、平板模式、主题
5. **完成** - 开始使用系统
