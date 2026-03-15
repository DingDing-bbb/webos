/**
 * WebOS Developer Plugin
 * 开发者插件 - 安装到引导程序，提供系统重置等开发者功能
 * 
 * 安装方式:
 * - OOBE阶段: location.reload() 带 ?installDevPlugin 参数可免密安装
 * - 非OOBE阶段: 需要密码验证和多次确认
 */

// 插件元信息
export const PLUGIN_INFO = {
  id: 'com.webos.dev-plugin',
  name: 'Developer Plugin',
  version: '1.0.0',
  description: 'Enables developer features including system reset',
  author: 'WebOS Team',
  permissions: ['system:reset', 'system:debug', 'system:recovery'] as const
};

// 插件权限类型
export type DevPluginPermission = typeof PLUGIN_INFO.permissions[number];

// 插件接口
export interface DevPluginInterface {
  id: string;
  name: string;
  version: string;
  isInstalled: boolean;
  installedAt?: string;
  
  // 功能方法
  canResetSystem(): boolean;
  requestSystemReset(): Promise<{ success: boolean; error?: string }>;
  
  // 权限检查
  hasPermission(permission: DevPluginPermission): boolean;
  
  // 安装/卸载
  install(): Promise<{ success: boolean; error?: string }>;
  uninstall(): Promise<{ success: boolean; error?: string }>;
}

// 存储键
const PLUGIN_STORAGE_KEY = 'webos-bootloader-plugins';
const PLUGIN_INSTALLED_FLAG = 'webos-dev-plugin-installed';

/**
 * 开发者插件实现
 */
class DevPlugin implements DevPluginInterface {
  id = PLUGIN_INFO.id;
  name = PLUGIN_INFO.name;
  version = PLUGIN_INFO.version;
  isInstalled = false;
  installedAt?: string;

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      const stored = localStorage.getItem(PLUGIN_INSTALLED_FLAG);
      if (stored) {
        const data = JSON.parse(stored);
        this.isInstalled = true;
        this.installedAt = data.installedAt;
      }
    } catch {
      this.isInstalled = false;
    }
  }

  private saveState(): void {
    localStorage.setItem(PLUGIN_INSTALLED_FLAG, JSON.stringify({
      installedAt: this.installedAt,
      version: this.version
    }));
    
    // 同时更新插件列表
    const pluginsStr = localStorage.getItem(PLUGIN_STORAGE_KEY) || '[]';
    try {
      const plugins = JSON.parse(pluginsStr) as string[];
      if (!plugins.includes(this.id)) {
        plugins.push(this.id);
        localStorage.setItem(PLUGIN_STORAGE_KEY, JSON.stringify(plugins));
      }
    } catch {
      localStorage.setItem(PLUGIN_STORAGE_KEY, JSON.stringify([this.id]));
    }
  }

  private clearState(): void {
    localStorage.removeItem(PLUGIN_INSTALLED_FLAG);
    
    const pluginsStr = localStorage.getItem(PLUGIN_STORAGE_KEY);
    if (pluginsStr) {
      try {
        const plugins = JSON.parse(pluginsStr) as string[];
        const filtered = plugins.filter(p => p !== this.id);
        localStorage.setItem(PLUGIN_STORAGE_KEY, JSON.stringify(filtered));
      } catch {
        localStorage.removeItem(PLUGIN_STORAGE_KEY);
      }
    }
  }

  canResetSystem(): boolean {
    return this.isInstalled;
  }

  hasPermission(permission: DevPluginPermission): boolean {
    if (!this.isInstalled) return false;
    return PLUGIN_INFO.permissions.includes(permission);
  }

  async install(): Promise<{ success: boolean; error?: string }> {
    if (this.isInstalled) {
      return { success: false, error: 'Plugin already installed' };
    }

    this.isInstalled = true;
    this.installedAt = new Date().toISOString();
    this.saveState();

    // 触发安装事件
    window.dispatchEvent(new CustomEvent('dev-plugin:installed', {
      detail: { plugin: PLUGIN_INFO }
    }));

    console.log('[DevPlugin] Installed successfully');
    return { success: true };
  }

  async uninstall(): Promise<{ success: boolean; error?: string }> {
    if (!this.isInstalled) {
      return { success: false, error: 'Plugin not installed' };
    }

    this.isInstalled = false;
    this.installedAt = undefined;
    this.clearState();

    // 触发卸载事件
    window.dispatchEvent(new CustomEvent('dev-plugin:uninstalled', {
      detail: { plugin: PLUGIN_INFO }
    }));

    console.log('[DevPlugin] Uninstalled successfully');
    return { success: true };
  }

  async requestSystemReset(): Promise<{ success: boolean; error?: string }> {
    if (!this.isInstalled) {
      return { success: false, error: 'Developer plugin not installed' };
    }

    if (!this.hasPermission('system:reset')) {
      return { success: false, error: 'Permission denied' };
    }

    // 触发系统重置事件
    window.dispatchEvent(new CustomEvent('dev-plugin:reset-requested', {
      detail: { timestamp: new Date().toISOString() }
    }));

    return { success: true };
  }
}

// 导出单例
export const devPlugin = new DevPlugin();

// 导出检查函数
export function isDevPluginInstalled(): boolean {
  return devPlugin.isInstalled;
}

export function getDevPluginInfo(): typeof PLUGIN_INFO | null {
  return devPlugin.isInstalled ? PLUGIN_INFO : null;
}

export default devPlugin;
