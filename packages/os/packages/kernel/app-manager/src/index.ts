// 应用管理器入口

// 导出类型
export * from './types';

// 导出注册中心（从共享位置重导出）
export { appRegistry, CATEGORIES, CategoryIcons } from './registry';

// 创建应用管理器 API
import { appRegistry } from './registry';
import type {
  AppManagerAPI,
  AppInfo,
  AppCategory,
  AppInstallOptions,
  AppInstallResult,
  AppEventListener,
} from './types';

/**
 * 创建应用管理器 API
 * 暴露到 window.webos.apps
 */
export function createAppManagerAPI(): AppManagerAPI {
  return {
    // 应用注册
    register: (app: AppInfo) => appRegistry.register(app),
    unregister: (appId: string) => appRegistry.unregister(appId),

    // 应用查询
    get: (appId: string) => appRegistry.get(appId),
    getAll: () => appRegistry.getAll(),
    getByCategory: (category: AppCategory) => appRegistry.getByCategory(category),
    search: (query: string) => appRegistry.search(query),

    // 应用状态
    isRegistered: (appId: string) => appRegistry.isRegistered(appId),
    isRunning: (appId: string) => appRegistry.isRunning(appId),
    getInstances: (appId: string) => appRegistry.getInstances(appId),

    // 应用操作
    launch: (appId: string) => appRegistry.launch(appId),
    close: (instanceId: string) => appRegistry.close(instanceId),

    // 分类
    getCategories: () => appRegistry.getCategories(),
    getCategoryIcon: (category: AppCategory) => {
      const categoryInfo = appRegistry.getCategories().find((c) => c.id === category);
      return categoryInfo?.icon || (() => null);
    },

    // 事件
    subscribe: (listener: AppEventListener) => appRegistry.subscribe(listener),

    // 安装/卸载
    install: async (options: AppInstallOptions): Promise<AppInstallResult> => {
      // TODO: 实现应用安装逻辑
      console.log('[AppManager] Install not implemented yet:', options);
      return { success: false, error: 'Not implemented' };
    },

    uninstall: async (appId: string): Promise<boolean> => {
      // TODO: 实现应用卸载逻辑
      console.log('[AppManager] Uninstall not implemented yet:', appId);
      return false;
    },
  };
}

// 默认导出
export default appRegistry;
