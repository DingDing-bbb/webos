# Settings

系统设置应用。

## 功能

- 语言设置
- 系统名称修改
- 关于信息

## 应用信息

| 属性 | 值              |
| ---- | --------------- |
| ID   | com.os.settings |
| 版本 | 1.0.0           |
| 分类 | system          |
| 图标 | settings        |

## 权限

- `system.config` - 系统配置
- `system.locale` - 语言设置
- `user.manage` - 用户管理

## 目录结构

```
src/
└── index.tsx     # 主组件
```

## 使用

```tsx
import { Settings } from '@app/com.os.settings/src';

<Settings />;
```
