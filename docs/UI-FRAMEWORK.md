# WebOS UI 框架文档

## 概述

WebOS UI 框架是一个专为 Web 操作系统设计的组件库，提供完整的桌面环境 UI 组件、基础 UI 组件和工具函数。

## 目录

- [安装与配置](#安装与配置)
- [设计系统](#设计系统)
- [组件列表](#组件列表)
- [主题系统](#主题系统)
- [国际化支持](#国际化支持)
- [最佳实践](#最佳实践)

---

## 安装与配置

### 包位置

```
packages/os/packages/ui-framework/
```

### 导入方式

```typescript
// 导入所有组件
import { Button, Modal, ContextMenu } from '@ui-framework';

// 导入特定类别
import { Desktop, Taskbar, Window } from '@ui-framework/components/desktop';
import { Input, Select, Form } from '@ui-framework/components/input';
import { ThemeProvider, useTheme } from '@ui-framework/theme';
```

---

## 设计系统

WebOS UI 框架采用双层设计系统，支持 Classic 和 Modern 两种风格：

### Classic 风格
- 方正边角（2px border-radius）
- 实心背景
- 简约动画
- 适合传统桌面应用

### Modern 风格
- 圆角设计（8px border-radius）
- 毛玻璃效果（backdrop-filter）
- 流畅动画
- 适合现代应用

### 设计令牌

```css
/* 颜色系统 */
--os-color-primary: #0078d4;
--os-color-secondary: #6b7280;
--os-color-success: #10b981;
--os-color-warning: #f59e0b;
--os-color-error: #ef4444;

/* 间距系统 */
--os-spacing-xs: 4px;
--os-spacing-sm: 8px;
--os-spacing-md: 16px;
--os-spacing-lg: 24px;
--os-spacing-xl: 32px;

/* 字体系统 */
--os-font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--os-font-size-xs: 11px;
--os-font-size-sm: 12px;
--os-font-size-md: 14px;
--os-font-size-lg: 16px;
--os-font-size-xl: 20px;

/* 阴影系统 */
--os-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--os-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--os-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--os-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

/* 动画系统 */
--os-transition-fast: 0.1s ease;
--os-transition-normal: 0.2s ease;
--os-transition-slow: 0.3s ease;
```

---

## 组件列表

### 1. 基础组件

#### Button 按钮

```tsx
import { Button } from '@ui-framework';

// 变体
<Button variant="primary">主按钮</Button>
<Button variant="secondary">次按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="danger">危险按钮</Button>

// 尺寸
<Button size="sm">小按钮</Button>
<Button size="md">中按钮</Button>
<Button size="lg">大按钮</Button>

// 状态
<Button disabled>禁用</Button>
<Button loading>加载中</Button>

// 图标
<Button leftIcon={<Icon />}>带图标</Button>
<Button rightIcon={<Icon />}>带图标</Button>
<Button iconOnly={<Icon />} aria-label="图标按钮" />
```

#### Icon 图标

```tsx
import { Icon } from '@ui-framework';

<Icon name="settings" size={24} />
<Icon name="home" color="primary" />
<Icon name="close" className="custom-icon" />
```

#### Typography 排版

```tsx
import { Typography } from '@ui-framework';

<Typography variant="h1">标题一</Typography>
<Typography variant="h2">标题二</Typography>
<Typography variant="body">正文</Typography>
<Typography variant="caption">说明文字</Typography>
```

### 2. 布局组件

#### Grid 网格系统

```tsx
import { Grid, GridItem } from '@ui-framework';

<Grid columns={12} gap={16}>
  <GridItem span={6}>左侧</GridItem>
  <GridItem span={6}>右侧</GridItem>
</Grid>
```

#### Container 容器

```tsx
import { Container } from '@ui-framework';

<Container maxWidth="lg" padding="md">
  内容
</Container>
```

#### SplitPanel 分割面板

```tsx
import { SplitPanel } from '@ui-framework';

<SplitPanel direction="horizontal" initialSizes={[200, 'auto']}>
  <div>侧边栏</div>
  <div>主内容</div>
</SplitPanel>
```

#### Stack 堆栈

```tsx
import { Stack } from '@ui-framework';

<Stack direction="column" gap={8}>
  <div>项目1</div>
  <div>项目2</div>
</Stack>
```

### 3. 导航组件

#### Menu 菜单

```tsx
import { Menu, MenuItem, SubMenu } from '@ui-framework';

<Menu>
  <MenuItem>文件</MenuItem>
  <MenuItem>编辑</MenuItem>
  <SubMenu title="视图">
    <MenuItem>大图标</MenuItem>
    <MenuItem>小图标</MenuItem>
  </SubMenu>
</Menu>
```

#### Tabs 标签页

```tsx
import { Tabs, Tab } from '@ui-framework';

<Tabs defaultActive="tab1">
  <Tab id="tab1" label="标签一">内容一</Tab>
  <Tab id="tab2" label="标签二">内容二</Tab>
</Tabs>
```

#### Sidebar 侧边栏

```tsx
import { Sidebar } from '@ui-framework';

<Sidebar width={240} collapsible>
  <Sidebar.Item icon={<Icon />} label="首页" />
  <Sidebar.Item icon={<Icon />} label="设置" />
</Sidebar>
```

#### Breadcrumb 面包屑

```tsx
import { Breadcrumb } from '@ui-framework';

<Breadcrumb>
  <Breadcrumb.Item>首页</Breadcrumb.Item>
  <Breadcrumb.Item>文档</Breadcrumb.Item>
  <Breadcrumb.Item current>指南</Breadcrumb.Item>
</Breadcrumb>
```

### 4. 数据输入组件

#### Input 输入框

```tsx
import { Input } from '@ui-framework';

<Input 
  placeholder="请输入" 
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

<Input 
  type="password"
  leftIcon={<LockIcon />}
  rightIcon={<EyeIcon />}
/>

<Input 
  status="error"
  errorMessage="格式不正确"
/>
```

#### Select 选择器

```tsx
import { Select } from '@ui-framework';

<Select 
  options={[
    { value: '1', label: '选项一' },
    { value: '2', label: '选项二' },
  ]}
  value={value}
  onChange={setValue}
/>
```

#### Checkbox 复选框

```tsx
import { Checkbox } from '@ui-framework';

<Checkbox checked={checked} onChange={setChecked}>
  同意条款
</Checkbox>

<Checkbox.Group value={values} onChange={setValues}>
  <Checkbox value="a">A</Checkbox>
  <Checkbox value="b">B</Checkbox>
</Checkbox.Group>
```

#### Switch 开关

```tsx
import { Switch } from '@ui-framework';

<Switch checked={enabled} onChange={setEnabled} />
```

#### Slider 滑块

```tsx
import { Slider } from '@ui-framework';

<Slider 
  min={0} 
  max={100} 
  value={value} 
  onChange={setValue}
/>
```

#### DatePicker 日期选择器

```tsx
import { DatePicker } from '@ui-framework';

<DatePicker 
  value={date}
  onChange={setDate}
  format="YYYY-MM-DD"
/>

<DatePicker.RangePicker 
  value={[start, end]}
  onChange={setRange}
/>
```

#### Upload 文件上传

```tsx
import { Upload } from '@ui-framework';

<Upload 
  accept="image/*"
  multiple
  onUpload={handleUpload}
>
  <Button>选择文件</Button>
</Upload>
```

### 5. 数据展示组件

#### Table 表格

```tsx
import { Table } from '@ui-framework';

<Table 
  columns={[
    { key: 'name', title: '名称' },
    { key: 'size', title: '大小' },
    { key: 'date', title: '修改日期' },
  ]}
  data={files}
  sortable
  selectable
/>
```

#### List 列表

```tsx
import { List } from '@ui-framework';

<List>
  {items.map(item => (
    <List.Item key={item.id}>{item.name}</List.Item>
  ))}
</List>
```

#### Card 卡片

```tsx
import { Card } from '@ui-framework';

<Card>
  <Card.Header>标题</Card.Header>
  <Card.Body>内容</Card.Body>
  <Card.Footer>操作</Card.Footer>
</Card>
```

#### Tree 树形控件

```tsx
import { Tree } from '@ui-framework';

<Tree 
  data={treeData}
  selectable
  expandable
  onSelect={handleSelect}
/>
```

#### Progress 进度条

```tsx
import { Progress } from '@ui-framework';

<Progress percent={50} />
<Progress type="circle" percent={75} />
```

### 6. 反馈组件

#### Modal 模态框

```tsx
import { Modal } from '@ui-framework';

<Modal 
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="对话框"
>
  <p>内容</p>
  <Modal.Footer>
    <Button onClick={() => setIsOpen(false)}>取消</Button>
    <Button variant="primary">确定</Button>
  </Modal.Footer>
</Modal>
```

#### Toast 轻提示

```tsx
import { toast } from '@ui-framework';

toast.success('操作成功');
toast.error('操作失败');
toast.warning('警告信息');
toast.info('提示信息');
```

#### Notification 通知

```tsx
import { notification } from '@ui-framework';

notification.open({
  title: '通知标题',
  message: '通知内容',
  type: 'info',
  duration: 5000,
});
```

#### Tooltip 提示工具

```tsx
import { Tooltip } from '@ui-framework';

<Tooltip content="提示文字">
  <Button>悬停显示</Button>
</Tooltip>
```

#### Spinner 加载指示器

```tsx
import { Spinner } from '@ui-framework';

<Spinner />
<Spinner size="lg" />
<Spinner variant="dots" />
```

### 7. 操作系统特有组件

#### Desktop 桌面

```tsx
import { Desktop } from '@ui-framework';

<Desktop 
  apps={[
    { 
      id: 'settings', 
      name: '设置', 
      icon: <SettingsIcon />, 
      onOpen: () => openApp('settings') 
    },
  ]}
  wallpaper={{ type: 'soft' }}
/>
```

#### Window 窗口

```tsx
import { Window } from '@ui-framework';

<Window
  id="window-1"
  title="应用窗口"
  x={100}
  y={100}
  width={800}
  height={600}
  resizable
  minimizable
  maximizable
  onClose={() => closeWindow()}
>
  {/* 窗口内容 */}
</Window>
```

#### Taskbar 任务栏

```tsx
import { Taskbar } from '@ui-framework';

<Taskbar
  windows={windows}
  onWindowClick={handleWindowClick}
  onStartClick={toggleStartMenu}
  displayMode="icon-name"
/>
```

#### StartMenu 开始菜单

```tsx
import { StartMenu } from '@ui-framework';

<StartMenu
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  apps={apps}
  onSettings={() => openSettings()}
  onShutdown={handleShutdown}
/>
```

#### ContextMenu 右键菜单

```tsx
import { ContextMenu } from '@ui-framework';

<ContextMenu
  items={[
    { id: 'view', label: '查看', submenu: [...] },
    { id: 'refresh', label: '刷新', shortcut: 'F5' },
    { type: 'divider' },
    { id: 'new', label: '新建', submenu: [...] },
  ]}
  position={{ x: 100, y: 200 }}
  onClose={() => closeMenu()}
/>
```

#### SystemTray 系统托盘

```tsx
import { SystemTray } from '@ui-framework';

<SystemTray>
  <SystemTray.Item icon={<WifiIcon />} tooltip="网络" />
  <SystemTray.Item icon={<VolumeIcon />} tooltip="音量" />
  <SystemTray.Item icon={<BatteryIcon />} tooltip="电池" />
</SystemTray>
```

---

## 主题系统

### 亮色/暗色模式

```tsx
import { ThemeProvider, useTheme } from '@ui-framework';

// 在应用根组件
<ThemeProvider defaultTheme="light">
  <App />
</ThemeProvider>

// 在子组件中切换主题
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      切换主题
    </button>
  );
}
```

### CSS 变量覆盖

```css
:root {
  --os-color-primary: #your-color;
  --os-border-radius: 8px;
}

[data-theme="dark"] {
  --os-color-background: #1a1a1a;
  --os-color-text: #ffffff;
}
```

---

## 国际化支持

### 多语言配置

```tsx
import { I18nProvider } from '@ui-framework';

<I18nProvider locale="zh-CN" fallbackLocale="en">
  <App />
</I18nProvider>
```

### 支持的语言

| 语言代码 | 语言名称 |
|---------|---------|
| zh-CN   | 简体中文 |
| zh-TW   | 繁体中文 |
| en      | English |
| de      | Deutsch |
| fr      | Français |

### 使用翻译

```tsx
import { useTranslation } from '@ui-framework';

function Component() {
  const { t } = useTranslation();
  
  return <span>{t('common.save')}</span>;
}
```

---

## 最佳实践

### 1. 组件组合

```tsx
// 推荐：组合小组件
<Card>
  <Card.Header>
    <Typography variant="h3">{title}</Typography>
  </Card.Header>
  <Card.Body>
    <List>{items}</List>
  </Card.Body>
</Card>

// 不推荐：使用 dangerouslySetInnerHTML
```

### 2. 无障碍访问

```tsx
<Button aria-label="关闭对话框">
  <Icon name="close" />
</Button>

<Modal aria-labelledby="modal-title" aria-describedby="modal-desc">
  <h2 id="modal-title">标题</h2>
  <p id="modal-desc">描述</p>
</Modal>
```

### 3. 响应式设计

```tsx
<Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }}>
  {items}
</Grid>

<Stack direction={{ base: 'column', md: 'row' }}>
  {children}
</Stack>
```

### 4. 性能优化

```tsx
// 使用虚拟滚动处理长列表
import { VirtualList } from '@ui-framework';

<VirtualList
  items={largeData}
  itemHeight={48}
  renderItem={(item) => <ItemComponent item={item} />}
/>

// 懒加载组件
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|-----|------|---------|
| 1.0.0 | 2024-01 | 初始版本，包含基础组件 |
| 1.1.0 | 2024-02 | 添加桌面环境组件 |
| 1.2.0 | 2024-03 | 添加主题系统 |
| 1.3.0 | 2024-04 | 添加国际化支持 |

---

## 贡献指南

请参阅 [CONTRIBUTING.md](../CONTRIBUTING.md) 了解如何贡献代码。

## 许可证

MIT License
