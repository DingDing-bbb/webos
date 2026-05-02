# Terminal

终端应用。

## 功能

- 命令行界面
- 支持基础 Unix 命令
- 用户切换/提权

## 支持命令

| 命令   | 描述         |
| ------ | ------------ |
| help   | 显示帮助     |
| time   | 显示当前时间 |
| clear  | 清屏         |
| ls     | 列出目录     |
| cat    | 查看文件     |
| pwd    | 当前目录     |
| cd     | 切换目录     |
| mkdir  | 创建目录     |
| touch  | 创建文件     |
| rm     | 删除文件     |
| echo   | 输出文本     |
| su     | 切换用户     |
| whoami | 当前用户     |
| exit   | 退出提权     |

## 应用信息

| 属性 | 值              |
| ---- | --------------- |
| ID   | com.os.terminal |
| 版本 | 1.0.0           |
| 分类 | developer       |
| 图标 | terminal        |

## 权限

- `filesystem.read` - 读取文件
- `filesystem.write` - 写入文件
- `user.authenticate` - 用户认证

## 目录结构

```
src/
└── index.tsx     # 主组件
```

## 使用

```tsx
import { Terminal } from '@app/com.os.terminal/src';

<Terminal />;
```
