/**
 * @fileoverview WebOS SDK - React Hooks
 * @module @webos/sdk/react
 * 
 * 应用开发所需的 React Hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// 翻译 Hook
// ============================================

/**
 * 获取翻译函数
 * 
 * @example
 * ```tsx
 * function MyApp() {
 *   const t = useTranslation();
 *   return <h1>{t('app.myapp.title')}</h1>;
 * }
 * ```
 */
export function useTranslation(): (key: string, params?: Record<string, string | number>) => string {
  const [, setLocale] = useState(() => {
    if (typeof window !== 'undefined' && window.webos) {
      return window.webos.i18n.getCurrentLocale();
    }
    return 'en';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.webos) return;
    
    const unsubscribe = window.webos.i18n.onLocaleChange((newLocale) => {
      setLocale(newLocale);
    });
    
    return unsubscribe;
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    if (typeof window !== 'undefined' && window.webos) {
      return window.webos.i18n.t(key, params as Record<string, string>);
    }
    // Fallback: 返回键名
    if (params) {
      return key.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
    }
    return key;
  }, []);

  return t;
}

/**
 * 获取当前语言
 */
export function useLocale(): string {
  const [locale, setLocale] = useState(() => {
    if (typeof window !== 'undefined' && window.webos) {
      return window.webos.i18n.getCurrentLocale();
    }
    return 'en';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.webos) return;
    
    setLocale(window.webos.i18n.getCurrentLocale());
    
    const unsubscribe = window.webos.i18n.onLocaleChange((newLocale) => {
      setLocale(newLocale);
    });
    
    return unsubscribe;
  }, []);

  return locale;
}

// ============================================
// 主题 Hook
// ============================================

/**
 * 获取当前主题
 * 
 * @example
 * ```tsx
 * function MyApp() {
 *   const { theme, toggleTheme } = useTheme();
 *   return (
 *     <div className={theme}>
 *       <button onClick={toggleTheme}>Toggle</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme(): {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
} {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('webos-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('webos-theme', newTheme);
      if (window.webos) {
        window.webos.config.set('theme', newTheme);
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}

// ============================================
// 窗口 Hook
// ============================================

/**
 * 获取窗口管理器
 */
export function useWindowManager() {
  const open = useCallback((appId: string, options?: {
    title?: string;
    width?: number;
    height?: number;
    content?: HTMLElement | string;
  }) => {
    if (typeof window !== 'undefined' && window.webos) {
      return window.webos.window.open(appId, options);
    }
    return null;
  }, []);

  const close = useCallback((windowId: string) => {
    if (typeof window !== 'undefined' && window.webos) {
      window.webos.window.close(windowId);
    }
  }, []);

  const focus = useCallback((windowId: string) => {
    if (typeof window !== 'undefined' && window.webos) {
      window.webos.window.focus(windowId);
    }
  }, []);

  return { open, close, focus };
}

// ============================================
// 文件系统 Hook
// ============================================

/**
 * 获取文件系统 API
 */
export function useFileSystem() {
  const read = useCallback((path: string) => {
    if (typeof window !== 'undefined' && window.webos) {
      return window.webos.fs.read(path);
    }
    return null;
  }, []);

  const write = useCallback((path: string, content: string) => {
    if (typeof window !== 'undefined' && window.webos) {
      return window.webos.fs.write(path, content);
    }
    return false;
  }, []);

  const exists = useCallback((path: string) => {
    if (typeof window !== 'undefined' && window.webos) {
      return window.webos.fs.exists(path);
    }
    return false;
  }, []);

  const list = useCallback((path: string) => {
    if (typeof window !== 'undefined' && window.webos) {
      return window.webos.fs.readdir(path);
    }
    return [];
  }, []);

  const mkdir = useCallback((path: string, recursive?: boolean) => {
    if (typeof window !== 'undefined' && window.webos) {
      return window.webos.fs.mkdir(path, recursive);
    }
    return false;
  }, []);

  const remove = useCallback((path: string) => {
    if (typeof window !== 'undefined' && window.webos) {
      return window.webos.fs.delete(path);
    }
    return false;
  }, []);

  return { read, write, exists, list, mkdir, remove };
}

// ============================================
// 通知 Hook
// ============================================

/**
 * 显示通知
 */
export function useNotification() {
  const show = useCallback((title: string, message: string, options?: {
    icon?: string;
    duration?: number;
  }) => {
    if (typeof window !== 'undefined' && window.webos) {
      window.webos.notify.show(title, message, options);
    }
  }, []);

  return { show };
}

// ============================================
// 存储 Hook
// ============================================

/**
 * 持久化状态（自动同步到 localStorage）
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
      return newValue;
    });
  }, [key]);

  return [storedValue, setValue];
}

// ============================================
// 平板模式 Hook
// ============================================

/**
 * 检测是否为平板模式
 */
export function useTabletMode(): boolean {
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('webos-tablet-mode');
    if (saved !== null) return saved === 'true';
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  useEffect(() => {
    const checkTablet = () => {
      const saved = localStorage.getItem('webos-tablet-mode');
      if (saved !== null) {
        setIsTablet(saved === 'true');
      }
    };

    window.addEventListener('storage', checkTablet);
    return () => window.removeEventListener('storage', checkTablet);
  }, []);

  return isTablet;
}

// ============================================
// 用户 Hook
// ============================================

/**
 * 获取当前用户信息
 */
export function useUser() {
  const [user, setUser] = useState<{
    username: string;
    displayName?: string;
    isRoot: boolean;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.webos) return;

    const updateUser = () => {
      const currentUser = window.webos.user.getCurrentUser();
      if (currentUser) {
        setUser({
          username: currentUser.username,
          displayName: currentUser.displayName,
          isRoot: currentUser.isRoot,
        });
      } else {
        setUser(null);
      }
    };

    updateUser();
    const unsubscribe = window.webos.user.subscribe(updateUser);
    return unsubscribe;
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    if (typeof window !== 'undefined' && window.webos) {
      return window.webos.user.login(username, password);
    }
    return { success: false, error: 'System not ready' };
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined' && window.webos) {
      window.webos.user.logout();
    }
  }, []);

  return { user, login, logout };
}

// ============================================
// 键盘快捷键 Hook
// ============================================

/**
 * 注册键盘快捷键
 * 
 * @example
 * ```tsx
 * useKeyboardShortcut('ctrl+s', () => {
 *   saveDocument();
 * });
 * ```
 */
export function useKeyboardShortcut(
  shortcut: string,
  callback: () => void,
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options || {};
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const keys = shortcut.toLowerCase().split('+');
    const mainKey = keys.pop()!;

    const handleKeyDown = (e: KeyboardEvent) => {
      const hasCtrl = keys.includes('ctrl') ? e.ctrlKey || e.metaKey : true;
      const hasShift = keys.includes('shift') ? e.shiftKey : true;
      const hasAlt = keys.includes('alt') ? e.altKey : true;
      const keyMatch = e.key.toLowerCase() === mainKey;

      if (hasCtrl && hasShift && hasAlt && keyMatch) {
        e.preventDefault();
        callbackRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, enabled]);
}

// ============================================
// 焦点管理 Hook
// ============================================

/**
 * 窗口焦点状态
 */
export function useWindowFocus(): boolean {
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isFocused;
}
