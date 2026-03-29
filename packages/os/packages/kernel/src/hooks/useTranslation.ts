// 统一的翻译 Hook
// 所有应用都应该使用这个 Hook 来获取翻译函数

import { useCallback, useMemo, useState, useEffect } from 'react';

/**
 * 翻译 Hook
 * @param namespace 可选的命名空间前缀，如 'settings', 'terminal', 'clock'
 * @returns 翻译函数 t 和当前语言 locale
 *
 * @example
 * // 在设置应用中使用
 * const { t, locale } = useTranslation('settings');
 * t('language') // 先尝试 'settings.language'，再尝试 'language'
 *
 * @example
 * // 无命名空间使用
 * const { t } = useTranslation();
 * t('common.save') // 直接使用键名
 */
export function useTranslation(namespace?: string) {
  const [locale, setLocale] = useState(() => {
    return window.webos?.i18n?.getCurrentLocale?.() || 'en';
  });

  // 监听语言变化
  useEffect(() => {
    const handleLocaleChange = () => {
      setLocale(window.webos?.i18n?.getCurrentLocale?.() || 'en');
    };

    window.addEventListener('localechange', handleLocaleChange);
    return () => window.removeEventListener('localechange', handleLocaleChange);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // 如果有命名空间，先尝试带命名空间的键
      if (namespace) {
        const namespacedKey = `${namespace}.${key}`;
        const namespacedResult = window.webos?.t(namespacedKey, params);
        if (namespacedResult && namespacedResult !== namespacedKey) {
          return namespacedResult;
        }
      }

      // 回退到直接使用键名
      const result = window.webos?.t(key, params);

      // 如果找不到翻译，在开发模式下显示警告
      if (!result || result === key) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[useTranslation] Missing translation key: "${key}"${namespace ? ` (namespace: "${namespace}")` : ''}`
          );
        }
        return key;
      }

      return result;
    },
    [namespace]
  );

  return { t, locale };
}

/**
 * 获取当前语言 Hook
 */
export function useLocale() {
  const [locale, setLocale] = useState(() => {
    return window.webos?.i18n?.getCurrentLocale?.() || 'en';
  });

  useEffect(() => {
    const handleLocaleChange = () => {
      setLocale(window.webos?.i18n?.getCurrentLocale?.() || 'en');
    };

    window.addEventListener('localechange', handleLocaleChange);
    return () => window.removeEventListener('localechange', handleLocaleChange);
  }, []);

  return locale;
}

/**
 * 获取可用语言列表 Hook
 */
export function useAvailableLocales() {
  return useMemo(() => {
    return window.webos?.i18n?.getAvailableLocales?.() || [];
  }, []);
}

/**
 * 检查翻译键是否存在
 */
export function useHasTranslation(key: string): boolean {
  return useMemo(() => {
    return window.webos?.i18n?.hasTranslation?.(key) ?? false;
  }, [key]);
}

export default useTranslation;
