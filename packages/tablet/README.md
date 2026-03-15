# @webos/tablet

平板和触摸设备支持模块，提供设备检测、触摸手势、窗口触摸交互等功能。

## 功能

### 设备检测 (`deviceDetector`)
- 自动检测设备类型（桌面/平板/手机）
- 检测触摸支持
- 检测屏幕方向
- 监听设备变化

### 触摸手势 (`gestureDetector`)
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

### 平板模式 (`tabletModeManager`)
- 自动切换平板/桌面模式
- 增大触摸目标
- 禁用悬停效果
- 边缘滑动手势

## 使用方法

```typescript
import { deviceDetector, tabletModeManager, gestureDetector } from '@webos/tablet';

// 检测设备
const info = deviceDetector.getInfo();
console.log('设备类型:', info.type); // 'desktop' | 'tablet' | 'mobile'

// 检查平板模式
if (tabletModeManager.isEnabled()) {
  console.log('平板模式已启用');
}

// 为元素添加手势识别
const element = document.getElementById('myElement');
gestureDetector.createRecognizer(element, {
  onTap: (e) => console.log('点击', e),
  onSwipe: (e) => console.log('滑动', e.direction),
  onPinch: (e) => console.log('缩放', e.scale)
});
```

## 平板模式特性

- 窗口可通过标题栏拖动
- 角落和边缘触摸缩放
- 双击标题栏最大化/还原
- 更大的触摸目标
- 无悬停效果
- 边缘滑动手势
