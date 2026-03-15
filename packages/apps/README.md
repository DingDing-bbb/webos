# Apps

系统应用程序目录。

## 应用列表

| 应用 | ID | 描述 |
|------|-----|------|
| File Manager | com.os.filemanager | 文件管理器 |
| Clock | com.os.clock | 时钟 |
| Terminal | com.os.terminal | 终端 |
| Settings | com.os.settings | 设置 |

## 应用结构

每个应用遵循以下结构：

```
com.os.xxx/
├── appinfo.json     # 应用配置
├── package.json     # npm 配置
├── README.md        # 文档
└── src/
    └── index.tsx    # 入口组件
```

## 添加新应用

1. 在此目录下创建新文件夹，使用反向域名命名（如 `com.os.newapp`）
2. 创建 `appinfo.json` 配置文件
3. 创建 `package.json` 文件
4. 在 `src/index.tsx` 中实现应用组件
5. 在主入口 `src/index.tsx` 中注册应用
