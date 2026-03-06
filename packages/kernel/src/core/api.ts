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
      createUser: (username: string, password: string, options?: { role?: UserRole; isRoot?: boolean }) =>
        userManager.createUser(username, password, options),
      login: (username: string, password: string) => userManager.login(username, password),
      logout: () => userManager.logout(),
      isLoggedIn: () => userManager.isLoggedIn(),
      isRoot: () => userManager.isRoot(),
      isAdmin: () => userManager.isAdmin(),
      hasPermission: (permission: Permission) => userManager.hasPermission(permission),
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
      requestPrivilege: async (reason: string): Promise<boolean> => {
        return new Promise((resolve) => {
          const dialog = document.createElement('div');
          dialog.className = 'os-auth-dialog-overlay';
          dialog.innerHTML = `
            <div class="os-auth-dialog">
              <div class="os-auth-dialog-header">
                <h3>${i18n.t('auth.password')}</h3>
              </div>
              <div class="os-auth-dialog-body">
                <p>${reason}</p>
                <input type="password" class="os-auth-input" placeholder="${i18n.t('auth.password')}" />
                <div class="os-auth-dialog-error" style="display: none;">${i18n.t('auth.incorrect')}</div>
              </div>
              <div class="os-auth-dialog-footer">
                <button class="os-auth-btn cancel">${i18n.t('auth.cancel')}</button>
                <button class="os-auth-btn submit">${i18n.t('auth.submit')}</button>
              </div>
            </div>
          `;

          const input = dialog.querySelector('.os-auth-input') as HTMLInputElement;
          const errorEl = dialog.querySelector('.os-auth-dialog-error') as HTMLElement;
          const submitBtn = dialog.querySelector('.os-auth-btn.submit') as HTMLButtonElement;
          const cancelBtn = dialog.querySelector('.os-auth-btn.cancel') as HTMLButtonElement;

          const close = (result: boolean) => {
            dialog.remove();
            resolve(result);
          };

          submitBtn.addEventListener('click', () => {
            const rootUser = userManager.getUser('root');
            if (rootUser && userManager.login('root', input.value).success) {
              close(true);
            } else {
              errorEl.style.display = 'block';
              input.classList.add('error');
            }
          });

          cancelBtn.addEventListener('click', () => close(false));
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitBtn.click();
            if (e.key === 'Escape') close(false);
          });

          document.body.appendChild(dialog);
          input.focus();
        });
      },
      createTemporaryUser: (reason?: string) => userManager.createTemporaryUser(reason),
      hasTemporaryUser: () => userManager.hasTemporaryUser(),
      getTemporaryUserInfo: () => userManager.getTemporaryUserInfo(),
      clearTemporaryUser: () => userManager.clearTemporaryUser(),
      isTemporarySession: () => userManager.isTemporarySession(),
      tryAutoLogin: () => userManager.tryAutoLogin(),
      subscribe: (callback: () => void) => userManager.subscribe(callback)
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
