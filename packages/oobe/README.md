# OOBE

首次启动向导模块。

## 功能

- 用户名设置
- 密码设置
- 语言选择
- 系统名称设置

## 目录结构

```
src/
└── index.tsx     # OOBE 组件
```

## 使用

```tsx
import { OOBE } from '@oobe';

<OOBE onComplete={(data) => {
  console.log('User:', data.username);
  console.log('Language:', data.language);
}} />
```
