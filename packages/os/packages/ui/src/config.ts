/**
 * WebOS UI 配置
 *
 * 提供系统名称和版本等常量
 * 在 Turbopack 环境下替代 webpack DefinePlugin
 */

// 声明全局变量类型
declare const __OS_NAME__: string | undefined;
declare const __OS_VERSION__: string | undefined;

// 导出配置（带默认值）
export const OS_NAME = typeof __OS_NAME__ !== 'undefined' ? __OS_NAME__ : 'WebOS';
export const OS_VERSION = typeof __OS_VERSION__ !== 'undefined' ? __OS_VERSION__ : '0.0.1';
