/**
 * @webos/ui
 * WebOS UI Framework - Modern Glassmorphism Design System
 */

// Load styles
import './theme/acrylic.css';
import './styles/index.css';

// ========== Theme System ==========
export * from './theme/index';

// ========== Hooks ==========
export * from './hooks';

// ========== Utils ==========
export * from './utils';

// ========== UI Components ==========
// Desktop
export { default as Desktop } from './components/Desktop';
export { default as ContextMenu } from './components/Desktop/ContextMenu';

// Taskbar - 命名导出
export { Taskbar, StartMenu } from './components/Taskbar';

// Boot
export { default as BootScreen } from './components/Boot';

// Notifications - 命名导出
export { NotificationContainer } from './components/Notification';

// Error Handling
export { ErrorDialog, ErrorDialogContainer } from './components/ErrorDialog';
export { BlueScreen, BlueScreenContainer } from './components/BlueScreen';

// Lock Screen
export { default as LockScreen } from './components/LockScreen';
export { SecureLockScreen } from './components/LockScreen/SecureLockScreen';
export { SecureLoginScreen } from './components/LockScreen/SecureLoginScreen';
export { SecureSettings } from './components/LockScreen/SecureSettings';
export { PasswordSetup } from './components/LockScreen/PasswordSetup';

// Spinner
export { default as Spinner } from './components/Spinner';

// Update Notification
export { default as UpdateNotification } from './components/UpdateNotification';

// Types
export type { WallpaperConfig, WallpaperType } from './components/Desktop';
export type { TaskbarDisplayMode } from './components/Taskbar';
export type { LockScreenProps } from './components/LockScreen';

// Version info
export const UI_VERSION = '2.0.0';
export const UI_FRAMEWORK_NAME = 'WebOS UI Framework';
export const UI_FEATURES = [
  'acrylic-glass-effect',
  'high-blur',
  'dark-light-theme',
  'responsive',
  'typescript',
] as const;
