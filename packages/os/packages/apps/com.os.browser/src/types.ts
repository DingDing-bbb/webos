/**
 * 浏览器应用类型定义
 */

import { BrowserKernel, RenderResult } from './kernel';

/**
 * 标签页接口
 */
export interface Tab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  history: string[];
  historyIndex: number;
  error?: string;
  kernel: BrowserKernel;
  renderResult?: RenderResult;
}

/**
 * 书签接口
 */
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  createdAt: number;
}

/**
 * 搜索引擎配置接口
 */
export interface SearchEngine {
  name: string;
  url: string;
}

/**
 * 搜索引擎类型
 */
export type SearchEngineType = 'bing' | 'google' | 'baidu';

/**
 * 浏览器配置接口
 */
export interface BrowserConfig {
  defaultSearchEngine: SearchEngineType;
  homepage: string;
  enableJavaScript: boolean;
  enableImages: boolean;
  privacyMode: boolean;
}

/**
 * 浏览器组件 Props 接口
 */
export interface BrowserProps {
  windowId?: string;
}

/**
 * 导航选项接口
 */
export interface NavigateOptions {
  replace?: boolean;
  referrer?: string;
  userAgent?: string;
}

/**
 * 渲染错误接口
 */
export interface RenderError {
  message: string;
  code?: string;
  url?: string;
  timestamp: number;
}