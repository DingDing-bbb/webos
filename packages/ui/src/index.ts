/**
 * WebOS UI Module - UI模块入口
 *
 * CSS架构：
 * - styles/index.css 统一导入所有样式
 * - 分层管理：变量 → 主题 → 组件 → 工具
 */

import './styles/index.css';

// 导入并重新导出所有组件
import { Desktop } from './components/Desktop';
import { Taskbar, StartMenu } from './components/Taskbar';
import { BootScreen } from './components/Boot';
import { NotificationContainer } from './components/Notification';
import { ErrorDialog, ErrorDialogContainer } from './components/ErrorDialog';
import { BlueScreen, BlueScreenContainer } from './components/BlueScreen';
import { UpdateNotification } from './components/UpdateNotification';
import { LockScreen } from './components/LockScreen';
import { SecureLockScreen } from './components/LockScreen/SecureLockScreen';

// 导出类型
export type { WallpaperConfig, WallpaperType } from './components/Desktop';
export type { LockScreenProps } from './components/LockScreen';
export type { SecureLockScreenProps } from './components/LockScreen/SecureLockScreen';
export type { TaskbarDisplayMode } from './components/Taskbar';

// 导出组件
export { 
  Desktop, 
  Taskbar, 
  StartMenu, 
  BootScreen, 
  NotificationContainer, 
  ErrorDialog, 
  ErrorDialogContainer, 
  BlueScreen, 
  BlueScreenContainer, 
  UpdateNotification, 
  LockScreen,
  SecureLockScreen,
};
