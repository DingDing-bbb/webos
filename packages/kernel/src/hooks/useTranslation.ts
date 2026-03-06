// 统一的翻译 Hook
// 所有应用都应该使用这个 Hook 来获取翻译函数

import { useCallback, useMemo } from 'react';

/**
 * 翻译 Hook
 * @param namespace 可选的命名空间前缀，如 'settings', 'terminal', 'clock'
 * @returns 翻译函数 t
 * 
 * @example
 * // 在设置应用中使用
 * const t = useTranslation('settings');
 * t('language') // 先尝试 'settings.language'，再尝试 'language'
 * 
 * @example
 * // 无命名空间使用
 * const t = useTranslation();
 * t('common.save') // 直接使用键名
 */
export function useTranslation(namespace?: string) {
  const t = useCallback((key: string, params?: Record<string, string>): string => {
    // 如果有命名空间，先尝试带命名空间的键
    if (namespace) {
      const namespacedKey = `${namespace}.${key}`;
      const namespacedResult = window.webos?.t(namespacedKey, params);
      if (namespacedResult && namespacedResult !== namespacedKey) {
        return namespacedResult;
      }
    }
    
    // 回退到直接使用键名
    return window.webos?.t(key, params) || key;
  }, [namespace]);

  return t;
}

/**
 * 获取当前语言 Hook
 */
export function useLocale() {
  return useMemo(() => {
    return window.webos?.i18n?.getCurrentLocale?.() || 'en';
  }, []);
}

/**
 * 获取可用语言列表 Hook
 */
export function useAvailableLocales() {
  return useMemo(() => {
    return window.webos?.i18n?.getAvailableLocales?.() || [];
  }, []);
}

export default useTranslation;
