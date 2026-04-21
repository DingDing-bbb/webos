# File Manager

文件管理器应用。

## 功能

- 浏览文件系统
- 查看文件权限
- 打开/编辑文本文件
- 目录导航

## 应用信息

| 属性 | 值                 |
| ---- | ------------------ |
| ID   | com.os.filemanager |
| 版本 | 1.0.0              |
| 分类 | utility            |
| 图标 | folder             |

## 权限

- `filesystem.read` - 读取文件
- `filesystem.write` - 写入文件

## 目录结构

```
src/
└── index.tsx     # 主组件
```

## 使用

```tsx
import { FileManager } from '@app/com.os.filemanager/src';

<FileManager />;
```
