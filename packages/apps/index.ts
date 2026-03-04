/**
 * WebOS 应用模块入口
 * 导入所有应用并初始化注册中心
 */

// 导入注册中心
export { registerApp, getApp, getAllApps, getAppsByCategory, getAppIcon, isAppRegistered } from './registry';
export type { AppInfo, IconProps, AppCategory, CategoryInfo } from './registry';
export { CATEGORIES, CategoryIcons } from './registry';

// 导入并注册所有应用
import './com.os.filemanager/src';
import './com.os.settings/src';
import './com.os.terminal/src';
import './com.os.clock/src';

// 导出应用组件（供直接使用）
export { FileManager } from './com.os.filemanager/src';
export { Settings } from './com.os.settings/src';
export { Terminal } from './com.os.terminal/src';
export { Clock } from './com.os.clock/src';

// 导出图标
export { FileManagerIcon } from './com.os.filemanager/src/icon';
export { SettingsIcon } from './com.os.settings/src/icon';
export { TerminalIcon } from './com.os.terminal/src/icon';
export { ClockIcon } from './com.os.clock/src/icon';
