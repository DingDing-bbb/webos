/**
 * WebOS Applications - Main Entry
 *
 * 系统应用主入口，包含所有内置应用
 */

// 导出注册中心功能
export {
  appRegistry,
  registerApp,
  getApp,
  getAllApps,
  getAppsByCategory,
  isAppRegistered,
  getAppIcon,
  CATEGORIES,
  CategoryIcons,
} from './registry';

// 导出类型
export type {
  AppInfo,
  AppCategory,
  AppInstance,
  CategoryInfo,
  IconProps,
  AppEventListener,
  AppEvent,
  LaunchOptions,
  AppStatus,
  AppPermission,
} from './types';

// 导入注册函数
import { registerApp, appRegistry } from './registry';

// 导入应用
import { appInfo as clockInfo } from './com.os.clock';
import { appInfo as fileManagerInfo } from './com.os.filemanager';
import { appInfo as settingsInfo } from './com.os.settings';
import { appInfo as terminalInfo } from './com.os.terminal';
import { appInfo as browserInfo } from './com.os.browser';

// 所有应用信息列表
const allAppInfos = [clockInfo, fileManagerInfo, settingsInfo, terminalInfo, browserInfo];

// 是否已初始化
let initialized = false;

/**
 * 初始化应用注册（只需调用一次）
 */
export function initApps(): void {
  if (initialized) return;

  allAppInfos.forEach((appInfo) => {
    registerApp(appInfo);
  });

  initialized = true;
  console.log(`[Apps] Initialized ${allAppInfos.length} apps`);
}

/**
 * 获取所有已注册应用（自动初始化）
 */
export function getRegisteredApps() {
  initApps();
  return appRegistry.getAll();
}

/**
 * 获取应用启动器配置
 */
export function getAppLauncherConfig() {
  initApps();

  return allAppInfos.map((app) => ({
    id: app.id,
    name: app.name,
    nameKey: app.nameKey,
    category: app.category,
    defaultWidth: app.defaultWidth,
    defaultHeight: app.defaultHeight,
    minWidth: app.minWidth,
    minHeight: app.minHeight,
    resizable: app.resizable,
    singleton: app.singleton,
  }));
}
