/**
 * WebOS 应用模块入口
 */

// 导出注册中心功能
export {
  registerApp,
  getApp,
  getAllApps,
  getAppsByCategory,
  getAppIcon,
  isAppRegistered,
  CATEGORIES,
  CategoryIcons,
} from './registry';

// 导出类型
export type { AppInfo, IconProps, AppCategory, CategoryInfo } from './registry';

// 导入注册函数
import { registerApp, getAllApps } from './registry';

// 导入应用信息和组件（使用正确的路径）
import { FileManager, appInfo as fileManagerInfo } from './com.os.filemanager/src/index';
import { Settings, appInfo as settingsInfo } from './com.os.settings/src/index';
import { Terminal, appInfo as terminalInfo } from './com.os.terminal/src/index';
import { Clock, appInfo as clockInfo } from './com.os.clock/src/index';

// 导出应用组件（供直接引用）
export { FileManager } from './com.os.filemanager/src/index';
export { Settings } from './com.os.settings/src/index';
export { Terminal } from './com.os.terminal/src/index';
export { Clock } from './com.os.clock/src/index';

// 导出图标
export { FileManagerIcon } from './com.os.filemanager/src/icon';
export { SettingsIcon } from './com.os.settings/src/icon';
export { TerminalIcon } from './com.os.terminal/src/icon';
export { ClockIcon } from './com.os.clock/src/icon';

// 所有应用信息列表
const allAppInfos = [fileManagerInfo, settingsInfo, terminalInfo, clockInfo];

// 是否已初始化
let initialized = false;

/**
 * 初始化应用注册（只需调用一次）
 */
export function initApps(): void {
  if (initialized) return;
  
  allAppInfos.forEach(appInfo => {
    registerApp(appInfo);
  });
  
  initialized = true;
}

/**
 * 获取所有已注册应用（自动初始化）
 */
export function getRegisteredApps() {
  initApps();
  return getAllApps();
}
