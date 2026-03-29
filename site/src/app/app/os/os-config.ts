// OS 系统配置
// 这些值在构建时注入，替代 webpack DefinePlugin

export const OS_NAME = 'WebOS';
export const OS_VERSION = '0.0.1-alpha';
export const OS_BUILD_TIME = new Date().toISOString();

// 全局声明（用于内核模块）
if (typeof globalThis !== 'undefined') {
  (globalThis as unknown as Record<string, unknown>).__OS_NAME__ = OS_NAME;
  (globalThis as unknown as Record<string, unknown>).__OS_VERSION__ = OS_VERSION;
  (globalThis as unknown as Record<string, unknown>).__BUILD_TIME__ = OS_BUILD_TIME;
}
