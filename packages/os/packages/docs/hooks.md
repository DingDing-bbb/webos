# React Hooks

WebOS SDK 提供了一系列 React Hooks，简化应用开发。

## useTranslation

获取翻译函数，用于国际化。

```tsx
import { useTranslation } from '@webos/sdk/react';

function MyComponent() {
  const t = useTranslation();

  return <h1>{t('app.myapp.title')}</h1>;
}
```

### 带参数的翻译

```tsx
// 翻译文件: { "welcome": "Hello, {name}!" }
const t = useTranslation();
return <p>{t('welcome', { name: 'World' })}</p>;
// 输出: Hello, World!
```

## useTheme

获取和切换主题。

```tsx
import { useTheme } from '@webos/sdk/react';

function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div className={theme}>
      <p>当前主题: {theme}</p>
      <button onClick={toggleTheme}>{theme === 'light' ? '🌙 暗色模式' : '☀️ 亮色模式'}</button>
    </div>
  );
}
```

### 返回值

| 属性          | 类型                | 说明     |
| ------------- | ------------------- | -------- |
| `theme`       | `'light' \| 'dark'` | 当前主题 |
| `setTheme`    | `(theme) => void`   | 设置主题 |
| `toggleTheme` | `() => void`        | 切换主题 |

## useFileSystem

文件系统操作 Hook。

```tsx
import { useFileSystem } from '@webos/sdk/react';

function FileManager() {
  const { read, write, exists, list, mkdir, remove } = useFileSystem();

  const handleSave = async () => {
    await write('/home/user/document.txt', 'Hello World');
  };

  const handleLoad = async () => {
    const content = read('/home/user/document.txt');
    console.log(content);
  };

  return (
    <div>
      <button onClick={handleSave}>保存</button>
      <button onClick={handleLoad}>读取</button>
    </div>
  );
}
```

### 方法列表

| 方法     | 参数               | 返回值           | 说明             |
| -------- | ------------------ | ---------------- | ---------------- |
| `read`   | `path: string`     | `string \| null` | 读取文件内容     |
| `write`  | `path, content`    | `boolean`        | 写入文件         |
| `exists` | `path: string`     | `boolean`        | 检查文件是否存在 |
| `list`   | `path: string`     | `DirEntry[]`     | 列出目录内容     |
| `mkdir`  | `path, recursive?` | `boolean`        | 创建目录         |
| `remove` | `path: string`     | `boolean`        | 删除文件或目录   |

## useNotification

显示系统通知。

```tsx
import { useNotification } from '@webos/sdk/react';

function NotificationDemo() {
  const { show } = useNotification();

  const handleNotify = () => {
    show('通知标题', '这是一条通知内容', {
      icon: 'info',
      duration: 5000,
    });
  };

  return <button onClick={handleNotify}>发送通知</button>;
}
```

## useLocalStorage

持久化状态存储。

```tsx
import { useLocalStorage } from '@webos/sdk/react';

interface Settings {
  theme: 'light' | 'dark';
  fontSize: number;
}

function Settings() {
  const [settings, setSettings] = useLocalStorage<Settings>('myapp.settings', {
    theme: 'light',
    fontSize: 14,
  });

  const updateTheme = () => {
    setSettings((s) => ({ ...s, theme: 'dark' }));
  };

  return (
    <div style={{ fontSize: settings.fontSize }}>
      <p>当前主题: {settings.theme}</p>
      <button onClick={updateTheme}>切换主题</button>
    </div>
  );
}
```

## useKeyboardShortcut

注册键盘快捷键。

```tsx
import { useKeyboardShortcut } from '@webos/sdk/react';

function Editor() {
  const [saved, setSaved] = useState(false);

  useKeyboardShortcut('ctrl+s', () => {
    // 保存逻辑
    setSaved(true);
  });

  return (
    <div>
      <p>按 Ctrl+S 保存</p>
      {saved && <p>已保存!</p>}
    </div>
  );
}
```

### 支持的组合键

- `ctrl` - Ctrl 键（Mac 上为 Cmd 键）
- `shift` - Shift 键
- `alt` - Alt 键
- 组合使用：`'ctrl+s'`, `'ctrl+shift+p'`, `'alt+enter'`

## useUser

获取当前用户信息。

```tsx
import { useUser } from '@webos/sdk/react';

function UserProfile() {
  const { user, login, logout } = useUser();

  if (!user) {
    return <LoginForm onSubmit={login} />;
  }

  return (
    <div>
      <p>欢迎, {user.displayName || user.username}</p>
      {user.isRoot && <span className="badge">管理员</span>}
      <button onClick={logout}>退出登录</button>
    </div>
  );
}
```

## useWindowFocus

检测窗口焦点状态。

```tsx
import { useWindowFocus } from '@webos/sdk/react';

function AutoSave() {
  const isFocused = useWindowFocus();

  useEffect(() => {
    if (!isFocused) {
      // 窗口失去焦点时自动保存
      saveDocument();
    }
  }, [isFocused]);

  return <div>窗口状态: {isFocused ? '活跃' : '未激活'}</div>;
}
```

## useTabletMode

检测是否为平板模式。

```tsx
import { useTabletMode } from '@webos/sdk/react';

function ResponsiveUI() {
  const isTablet = useTabletMode();

  return (
    <div className={isTablet ? 'tablet-layout' : 'desktop-layout'}>
      {isTablet ? <TabletNav /> : <DesktopNav />}
    </div>
  );
}
```
