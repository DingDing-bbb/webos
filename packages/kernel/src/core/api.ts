/**
 * 系统 API 入口 - 暴露到 window.webos
 */

import { fileSystem } from './fileSystem';
import { windowManager } from './windowManager';
import { userManager } from './userManager';
import { I18nManager, TimeManager, NotifyManager, ConfigManager, BootManager } from './managers';
import type { WebOSAPI, WindowOptions, NotifyOptions, UserRole, Permission } from '../types';

// 创建并导出 API
export function createWebOSAPI(): WebOSAPI {
  const i18n = new I18nManager();
  const time = new TimeManager();
  const notify = new NotifyManager();
  const config = new ConfigManager();
  const boot = new BootManager();

  // 加载保存的语言设置
  const savedLocale = config.get<string>('locale');
  if (savedLocale) {
    i18n.setLocale(savedLocale);
  }

  const api: WebOSAPI = {
    // 快捷翻译方法
    t: (key: string, params?: Record<string, string>) => i18n.t(key, params),
    
    // 设置窗口容器
    setWindowContainer: (element: HTMLDivElement) => {
      windowManager.setContainer(element);
    },
    
    window: {
      open: (appId: string, options?: WindowOptions) => {
        return windowManager.open({ ...options, appId, title: options?.title || appId });
      },
      close: (id: string) => windowManager.close(id),
      minimize: (id: string) => windowManager.minimize(id),
      maximize: (id: string) => windowManager.maximize(id),
      restore: (id: string) => windowManager.restore(id),
      focus: (id: string) => windowManager.focus(id),
      getAll: () => windowManager.getAll()
    },

    notify: {
      show: (title: string, message: string, options?: Partial<NotifyOptions>) => {
        notify.show(title, message, options);
      }
    },

    time: {
      getCurrent: () => time.getCurrent(),
      setAlarm: (date: Date, callback: () => void) => time.setAlarm(date, callback),
      clearAlarm: (id: string) => time.clearAlarm(id),
      getAlarms: () => time.getAlarms()
    },

    fs: {
      read: (path: string) => fileSystem.read(path),
      write: (path: string, content: string, requireAuth?: boolean) => {
        if (requireAuth || fileSystem.needsAuthentication(path, 'write')) {
          return false;
        }
        return fileSystem.write(path, content);
      },
      exists: (path: string) => fileSystem.exists(path),
      list: (path: string) => fileSystem.list(path),
      mkdir: (path: string) => fileSystem.mkdir(path),
      remove: (path: string) => fileSystem.remove(path),
      getPermissions: (path: string) => fileSystem.getPermissions(path),
      setPermissions: (path: string, permissions: string, requireAuth?: boolean) => {
        if (requireAuth) return false;
        return fileSystem.setPermissions(path, permissions);
      },
      getNode: (path: string) => fileSystem.getNode(path)
    },

    user: {
      getCurrentUser: () => userManager.getCurrentUser(),
      getAllUsers: () => userManager.getAllUsers(),
      getRealUsers: () => userManager.getRealUsers(),
      hasUsers: () => userManager.hasUsers(),
      getUser: (username: string) => userManager.getUser(username),
      createUser: (username: string, password: string, options?: { role?: UserRole; isRoot?: boolean; displayName?: string }) =>
        userManager.createUser(username, password, options),
      login: (username: string, password: string) => userManager.login(username, password),
      logout: () => userManager.logout(),
      isLoggedIn: () => userManager.isLoggedIn(),
      isRoot: () => userManager.isRoot(),
      isAdmin: () => userManager.isAdmin(),
      hasPermission: (permission: Permission) => userManager.hasPermission(permission),
      tryAutoLogin: () => userManager.tryAutoLogin(),
      subscribe: (callback: () => void) => userManager.subscribe(callback),
      authenticate: (password: string) => {
        const currentUser = userManager.getCurrentUser();
        if (!currentUser) return false;
        if (currentUser.isRoot) return true;
        const rootUser = userManager.getUser('root');
        if (rootUser && userManager.login('root', password).success) {
          return true;
        }
        return false;
      },
      createTemporaryUser: (reason?: string) => userManager.createTemporaryUser(reason),
      hasTemporaryUser: () => userManager.hasTemporaryUser(),
      getTemporaryUserInfo: () => userManager.getTemporaryUserInfo(),
      clearTemporaryUser: () => userManager.clearTemporaryUser(),
      isTemporarySession: () => userManager.isTemporarySession()
    },

    i18n: {
      getCurrentLocale: () => i18n.getCurrentLocale(),
      setLocale: (locale: string) => {
        i18n.setLocale(locale);
        config.set('locale', locale);
      },
      t: (key: string, params?: Record<string, string>) => i18n.t(key, params),
      getAvailableLocales: () => i18n.getAvailableLocales(),
      onLocaleChange: (callback: (locale: string) => void) => i18n.onLocaleChange(callback)
    },

    config: {
      get: <T>(key: string) => config.get<T>(key),
      set: <T>(key: string, value: T) => config.set(key, value),
      getSystemName: () => config.getSystemName(),
      setSystemName: (name: string) => config.setSystemName(name)
    },

    boot: {
      isComplete: () => boot.isComplete(),
      isOOBEComplete: () => boot.isOOBEComplete(),
      completeOOBE: () => boot.completeOOBE(),
      reset: () => boot.reset()
    }
  };

  return api;
}

// 初始化 WebOS
export function initWebOS(): void {
  const api = createWebOSAPI();
  
  // 暴露到全局
  (window as unknown as { webos: WebOSAPI }).webos = api;
  
  // 添加控制台强制重置功能
  (window as unknown as { webosReset: () => void }).webosReset = async () => {
    console.log('[WebOS] Force reset initiated...');
    
    // 1. 清除所有 localStorage
    localStorage.clear();
    console.log('[WebOS] localStorage cleared');
    
    // 2. 清除 sessionStorage
    sessionStorage.clear();
    console.log('[WebOS] sessionStorage cleared');
    
    // 3. 清除所有 Cache API 缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[WebOS] Cache API cleared');
    }
    
    // 4. 清除 IndexedDB
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            if (db.name) {
              return new Promise<void>((resolve) => {
                const request = indexedDB.deleteDatabase(db.name);
                request.onsuccess = () => resolve();
                request.onerror = () => resolve();
                request.onblocked = () => resolve();
              });
            }
            return Promise.resolve();
          })
        );
        console.log('[WebOS] IndexedDB cleared');
      } catch {
        console.log('[WebOS] IndexedDB clear skipped (not supported)');
      }
    }
    
    // 5. 注销 Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        console.log('[WebOS] Service Workers unregistered');
      } catch {
        console.log('[WebOS] Service Worker unregister skipped');
      }
    }
    
    // 6. 清除 cookies
    try {
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });
      console.log('[WebOS] Cookies cleared');
    } catch {
      console.log('[WebOS] Cookie clear skipped');
    }
    
    console.log('[WebOS] Reset complete! Reloading...');
    window.location.reload();
  };
  
  console.log('[WebOS] System initialized. Type `webosReset()` in console to force reset system.');
  
  // 设置通知容器
  const createNotificationContainer = () => {
    const container = document.createElement('div');
    container.className = 'os-notification-container';
    container.id = 'os-notifications';
    document.body.appendChild(container);
    return container;
  };
  
  // 延迟设置通知容器
  if (document.body) {
    const notify = new NotifyManager();
    notify.setContainer(createNotificationContainer());
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      const notify = new NotifyManager();
      notify.setContainer(createNotificationContainer());
    });
  }
}
