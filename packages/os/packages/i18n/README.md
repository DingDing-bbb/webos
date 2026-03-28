# I18n

多语言国际化模块。

## 包名

无独立包名，通过 `@i18n` 别名引用。

## 支持语言

| 代码 | 语言名称 | 状态 |
|------|----------|------|
| `en` | English | ✅ 完整 |
| `zh-CN` | 简体中文 | ✅ 完整 |
| `zh-TW` | 繁體中文 | ✅ 完整 |
| `fr` | Français | 🔲 预留 |
| `de` | Deutsch | 🔲 预留 |

## 目录结构

```
i18n/
├── package.json
├── README.md
└── src/
    └── index.ts
└── locales/
    ├── en.json            # English
    ├── zh-CN.json         # 简体中文
    ├── zh-TW.json         # 繁體中文
    ├── fr.json            # Français（预留）
    └── de.json            # Deutsch（预留）
```

## 使用

```typescript
import { translations, availableLocales } from '@i18n';

// 获取翻译
const text = translations['zh-CN']['app.clock.name'];

// 获取可用语言列表
const locales = availableLocales;
// [{ code: 'zh-CN', name: '简体中文' }, ...]
```

## 翻译键结构

```json
{
  "app.clock.name": "时钟",
  "app.clock.desc": "数字时钟和闹钟",
  "app.settings.name": "设置",
  "common.save": "保存",
  "common.cancel": "取消",
  ...
}
```

## 通过 WebOS API 使用

```typescript
// 设置语言
window.webos.i18n.setLocale('zh-CN');

// 获取当前语言
const locale = window.webos.i18n.getCurrentLocale();

// 翻译
const text = window.webos.i18n.t('app.clock.name');
const textWithParams = window.webos.i18n.t('greeting', { name: 'User' });
```
