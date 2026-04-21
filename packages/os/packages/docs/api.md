# API 参考

WebOS SDK 提供的完整 API 文档。

## 应用管理

### registerApp

注册应用到系统。

```typescript
import { registerApp } from '@webos/sdk';

registerApp({
  id: 'com.example.myapp',
  name: 'My App',
  // ...
});
```

### createApp

创建应用配置的工厂函数。

```typescript
import { createApp } from '@webos/sdk';

export default createApp({
  id: 'com.example.myapp',
  name: 'My App',
  category: 'productivity',
  icon: MyAppIcon,
  component: MyApp,
});
```

### getAllApps

获取所有已注册的应用。

```typescript
import { getAllApps } from '@webos/sdk';

const apps = getAllApps();
// 返回: AppConfig[]
```

### getAppsByCategory

按分类获取应用。

```typescript
import { getAppsByCategory } from '@webos/sdk';

const productivityApps = getAppsByCategory('productivity');
```

## 窗口管理

### WindowOptions

```typescript
interface WindowOptions {
  id?: string;
  title: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  appId?: string;
}
```

### WindowState

```typescript
interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  zIndex: number;
}
```

## 文件系统

### FileSystemNode

```typescript
interface FileSystemNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  size: number;
  content?: string;
  children?: Map<string, FileSystemNode>;
  createdAt: Date;
  modifiedAt: Date;
}
```

### DirEntry

```typescript
interface DirEntry {
  name: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  size: number;
  modifiedAt: Date;
}
```

## 用户系统

### User

```typescript
interface User {
  username: string;
  role: UserRole;
  isRoot: boolean;
  homeDir: string;
  permissions: Permission[];
  displayName?: string;
  createdAt?: Date;
  lastLogin?: Date;
}
```

### UserRole

```typescript
type UserRole = 'root' | 'admin' | 'user' | 'guest';
```

### Permission

```typescript
type Permission =
  | 'read:files'
  | 'write:files'
  | 'delete:files'
  | 'read:settings'
  | 'write:settings'
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'execute:commands'
  | 'admin:system';
```

## 国际化

### LocaleConfig

```typescript
interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
}
```

### 翻译文件格式

```json
{
  "app.myapp.name": "My App",
  "app.myapp.description": "A sample application",
  "welcome.message": "Welcome, {name}!"
}
```

## 事件系统

### AppEvent

```typescript
interface AppEvent {
  type: 'install' | 'uninstall' | 'launch' | 'close' | 'update';
  appId: string;
  timestamp: Date;
  data?: unknown;
}
```

### AppEventListener

```typescript
type AppEventListener = (event: AppEvent) => void;
```

## 工具函数

### generateId

生成唯一 ID。

```typescript
import { generateId } from '@webos/sdk-core';

const id = generateId();
// 返回: "m1a2b3c4d-xyz123"
```

### formatFileSize

格式化文件大小。

```typescript
import { formatFileSize } from '@webos/sdk-core';

formatFileSize(1024); // "1 KB"
formatFileSize(1048576); // "1 MB"
formatFileSize(1073741824); // "1 GB"
```

### formatDate / formatTime / formatDateTime

格式化日期和时间。

```typescript
import { formatDate, formatTime, formatDateTime } from '@webos/sdk-core';

const now = new Date();
formatDate(now); // "Jan 1, 2024"
formatTime(now); // "12:30 PM"
formatDateTime(now); // "Jan 1, 2024 12:30 PM"
```

### debounce / throttle

防抖和节流函数。

```typescript
import { debounce, throttle } from '@webos/sdk-core';

const debouncedSave = debounce(save, 300);
const throttledScroll = throttle(handleScroll, 100);
```

### deepClone / deepMerge

深拷贝和深度合并。

```typescript
import { deepClone, deepMerge } from '@webos/sdk-core';

const cloned = deepClone(original);
const merged = deepMerge(target, source);
```

### isValidAppId

验证应用 ID 格式。

```typescript
import { isValidAppId } from '@webos/sdk-core';

isValidAppId('com.example.myapp'); // true
isValidAppId('invalid'); // false
```

### cn

类名合并工具。

```typescript
import { cn } from '@webos/sdk-core';

cn('btn', isActive && 'active', className);
// 返回: "btn active custom-class"
```

### sleep

异步等待。

```typescript
import { sleep } from '@webos/sdk-core';

await sleep(1000); // 等待 1 秒
```

### retry

重试函数。

```typescript
import { retry } from '@webos/sdk-core';

const result = await retry(fetchData, {
  maxAttempts: 3,
  delay: 1000,
  backoff: true,
});
```
