# I18n

多语言国际化模块。

## 支持语言

| 代码 | 名称 | 状态 |
|------|------|------|
| en | English | 完整 |
| zh-CN | 简体中文 | 完整 |
| zh-TW | 繁體中文 | 完整 |
| fr | Français | 预留 |
| de | Deutsch | 预留 |

## 目录结构

```
src/
└── index.ts          # 入口文件
locales/
├── en.json           # 英语
├── zh-CN.json        # 简体中文
├── zh-TW.json        # 繁体中文
├── fr.json           # 法语（预留）
└── de.json           # 德语（预留）
```

## 使用

```typescript
import { translations, availableLocales } from '@i18n';
```
