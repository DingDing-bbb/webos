// 应用注册中心 - 重导出共享的应用注册表
// 这确保所有模块使用同一个应用注册表实例

// 从 apps 包导入共享的注册表和类型
export {
  appRegistry,
  CATEGORIES,
  CategoryIcons
} from '../../../apps/registry';

// 重导出类型
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
  AppPermission
} from '../../../apps/types';
