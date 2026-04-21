# @webos/tablet

平板和触摸设备支持模块，提供设备检测、触摸手势、窗口触摸交互等功能。

## 包名

无独立包名，通过 `@tablet` 别名引用。

## 功能模块

### 设备检测 (`deviceDetector`)

- 自动检测设备类型（桌面/平板/手机）
- 检测触摸支持
- 检测屏幕方向
- 监听设备变化

### 触摸手势 (`gestures`)

- 点击 (tap)
- 双击 (doubleTap)
- 长按 (longPress)
- 滑动 (swipe)
- 捏合 (pinch)
- 拖动 (pan)

### 触摸处理器 (`touchHandler`)

- 窗口触摸拖动
- 窗口触摸缩放
- 双击最大化

### 平板模式 (`tabletMode`)

- 自动切换平板/桌面模式
- 增大触摸目标
- 禁用悬停效果
- 边缘滑动手势

## 目录结构

```
tablet/
├── package.json
├── README.md
└── src/
    ├── index.ts           # 入口
    ├── deviceDetector.ts  # 设备检测
    ├── touchHandler.ts    # 触摸处理
    ├── gestures.ts        # 手势识别
    └── tabletMode.ts      # 平板模式管理
```

## 使用方法

```typescript
import { deviceDetector, tabletModeManager, gestureDetector } from '@tablet';

// 检测设备
const info = deviceDetector.getInfo();
console.log('设备类型:', info.type); // 'desktop' | 'tablet' | 'mobile'
console.log('支持触摸:', info.hasTouch);
console.log('屏幕方向:', info.orientation);

// 检查平板模式
if (tabletModeManager.isEnabled()) {
  console.log('平板模式已启用');
}

// 切换平板模式
tabletModeManager.enable();
tabletModeManager.disable();

// 监听平板模式变化
tabletModeManager.subscribe((enabled) => {
  console.log('平板模式:', enabled ? '开启' : '关闭');
});

// 为元素添加手势识别
const element = document.getElementById('myElement');
const recognizer = gestureDetector.createRecognizer(element, {
  onTap: (e) => console.log('点击', e),
  onDoubleTap: (e) => console.log('双击', e),
  onLongPress: (e) => console.log('长按', e),
  onSwipe: (e) => console.log('滑动', e.direction),
  onPinch: (e) => console.log('缩放', e.scale),
  onPan: (e) => console.log('拖动', e.deltaX, e.deltaY),
});

// 销毁手势识别器
recognizer.destroy();
```

## 平板模式特性

- 窗口可通过标题栏拖动
- 角落和边缘触摸缩放
- 双击标题栏最大化/还原
- 更大的触摸目标
- 无悬停效果
- 边缘滑动手势
- 自动检测触摸设备并切换模式

## 设备类型

| 类型      | 描述                           |
| --------- | ------------------------------ |
| `desktop` | 桌面设备（无触摸）             |
| `tablet`  | 平板设备（触摸，屏幕 > 7英寸） |
| `mobile`  | 移动设备（触摸，屏幕 < 7英寸） |
