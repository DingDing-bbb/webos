/**
 * WebOS Application Registry
 * 统一管理所有应用的注册、查询和生命周期
 */

import type { 
  AppInfo, 
  AppCategory, 
  CategoryInfo, 
  IconProps, 
  AppInstance, 
  AppEventListener,
  AppStatus,
  AppEvent
} from './types';

// ============================================
// 应用注册表
// ============================================

const registry = new Map<string, AppInfo>();
const appInstances = new Map<string, AppInstance>();
const listeners = new Set<AppEventListener>();

// 触发事件
function emitEvent(event: AppEvent): void {
  listeners.forEach(listener => {
    try {
      listener(event);
    } catch (error) {
      console.error('[AppRegistry] Listener error:', error);
    }
  });
}

/**
 * 应用注册中心
 */
export const appRegistry = {
  /**
   * 注册应用
   */
  register(app: AppInfo): void {
    if (registry.has(app.id)) {
      console.warn(`[AppRegistry] App ${app.id} already registered, overwriting...`);
    }
    registry.set(app.id, app);
    emitEvent({ type: 'install', appId: app.id, timestamp: new Date() });
  },

  /**
   * 注销应用
   */
  unregister(appId: string): boolean {
    const deleted = registry.delete(appId);
    if (deleted) {
      emitEvent({ type: 'uninstall', appId, timestamp: new Date() });
    }
    return deleted;
  },

  /**
   * 获取应用
   */
  get(appId: string): AppInfo | undefined {
    return registry.get(appId);
  },

  /**
   * 获取所有应用
   */
  getAll(): AppInfo[] {
    return Array.from(registry.values());
  },

  /**
   * 按分类获取应用
   */
  getByCategory(category: AppCategory): AppInfo[] {
    return this.getAll().filter(app => app.category === category);
  },

  /**
   * 搜索应用
   */
  search(query: string): AppInfo[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(app =>
      app.name.toLowerCase().includes(lowerQuery) ||
      app.description?.toLowerCase().includes(lowerQuery) ||
      app.id.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * 检查应用是否已注册
   */
  isRegistered(appId: string): boolean {
    return registry.has(appId);
  },

  /**
   * 检查应用是否正在运行
   */
  isRunning(appId: string): boolean {
    for (const instance of appInstances.values()) {
      if (instance.appId === appId && instance.status === 'running') {
        return true;
      }
    }
    return false;
  },

  /**
   * 获取应用实例
   */
  getInstances(appId: string): AppInstance[] {
    return Array.from(appInstances.values()).filter(i => i.appId === appId);
  },

  /**
   * 启动应用
   */
  launch(appId: string): string | null {
    const app = registry.get(appId);
    if (!app) {
      console.error(`[AppRegistry] App ${appId} not found`);
      return null;
    }

    // 检查单例
    if (app.singleton) {
      const existing = this.getInstances(appId).find(i => i.status === 'running');
      if (existing) {
        return existing.id;
      }
    }

    // 创建实例
    const instanceId = `${appId}-${Date.now()}`;
    const instance: AppInstance = {
      id: instanceId,
      appId,
      startTime: new Date(),
      status: 'running' as AppStatus
    };
    appInstances.set(instanceId, instance);
    
    emitEvent({ type: 'launch', appId, timestamp: new Date(), data: { instanceId } });
    return instanceId;
  },

  /**
   * 关闭应用实例
   */
  close(instanceId: string): boolean {
    const instance = appInstances.get(instanceId);
    if (!instance) return false;
    
    instance.status = 'stopped';
    appInstances.delete(instanceId);
    
    emitEvent({ type: 'close', appId: instance.appId, timestamp: new Date(), data: { instanceId } });
    return true;
  },

  /**
   * 订阅应用事件
   */
  subscribe(listener: AppEventListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * 获取分类列表
   */
  getCategories(): CategoryInfo[] {
    return CATEGORIES;
  }
};

// ============================================
// 分类图标
// ============================================

import React from 'react';

export const CategoryIcons: Record<AppCategory, React.FC<IconProps>> = {
  system: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  productivity: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  media: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  games: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <line x1="6" y1="12" x2="10" y2="12"/>
      <line x1="8" y1="10" x2="8" y2="14"/>
    </svg>
  ),
  network: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/>
    </svg>
  ),
  development: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  utilities: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/>
    </svg>
  ),
};

// 分类信息
export const CATEGORIES: CategoryInfo[] = [
  { id: 'system', nameKey: 'category.system', icon: CategoryIcons.system },
  { id: 'productivity', nameKey: 'category.productivity', icon: CategoryIcons.productivity },
  { id: 'media', nameKey: 'category.media', icon: CategoryIcons.media },
  { id: 'games', nameKey: 'category.games', icon: CategoryIcons.games },
  { id: 'network', nameKey: 'category.network', icon: CategoryIcons.network },
  { id: 'development', nameKey: 'category.development', icon: CategoryIcons.development },
  { id: 'utilities', nameKey: 'category.utilities', icon: CategoryIcons.utilities },
];

// 向后兼容导出
export const registerApp = appRegistry.register;
export const getApp = appRegistry.get;
export const getAllApps = appRegistry.getAll;
export const getAppsByCategory = appRegistry.getByCategory;
export const isAppRegistered = appRegistry.isRegistered;
export const getAppIcon = (appId: string) => appRegistry.get(appId)?.icon;
