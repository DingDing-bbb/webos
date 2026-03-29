/**
 * 平板/触控设备支持模块
 * 基于 Windows 11 触控设计规范
 */

export { deviceDetector } from './deviceDetector';
export type { DeviceType, DeviceInfo, InputMode, DeviceCapability } from './deviceDetector';

export { gestureDetector } from './gestures';
export type {
  GestureType,
  GestureEvent,
  SwipeDirection,
  EdgePosition,
  GestureConfig,
} from './gestures';

export { touchHandler } from './touchHandler';
export type { TouchTargetConfig, WindowTouchConfig } from './touchHandler';

export { tabletModeManager } from './tabletMode';
export type { TabletModeConfig, EdgeGestureConfig } from './tabletMode';
