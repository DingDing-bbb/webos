/**
 * 浏览器应用常量定义
 */

import type { SearchEngine, SearchEngineType, BrowserConfig } from './types';

/**
 * 搜索引擎配置
 */
export const SEARCH_ENGINES: Record<SearchEngineType, SearchEngine> = {
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  google: { name: 'Google', url: 'https://www.google.com/search?q=' },
  baidu: { name: 'Baidu', url: 'https://www.baidu.com/s?wd=' },
};

/**
 * 内部页面HTML内容
 */
export const INTERNAL_PAGES: Record<string, string> = {
  'browser://newtab': `
    <html>
      <head><title>New Tab</title></head>
      <body style="font-family: system-ui, sans-serif; padding: 40px; background: #f8f9fa; text-align: center;">
        <h1 style="color: #333; font-size: 32px; margin-bottom: 16px;">WebOS Browser</h1>
        <p style="color: #666; font-size: 16px; margin-bottom: 32px;">Enter a URL or search term to get started</p>
        <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
          <a href="https://www.bing.com" style="padding: 12px 24px; background: #fff; border-radius: 8px; text-decoration: none; color: #333; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">Bing</a>
          <a href="https://www.google.com" style="padding: 12px 24px; background: #fff; border-radius: 8px; text-decoration: none; color: #333; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">Google</a>
          <a href="https://www.github.com" style="padding: 12px 24px; background: #fff; border-radius: 8px; text-decoration: none; color: #333; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">GitHub</a>
        </div>
      </body>
    </html>
  `,
  'browser://settings': `
    <html>
      <head><title>Settings</title></head>
      <body style="font-family: system-ui, sans-serif; padding: 24px; background: #fff;">
        <h1 style="color: #333; font-size: 24px; border-bottom: 1px solid #e0e0e0; padding-bottom: 12px;">Browser Settings</h1>
        <div style="margin-top: 24px;">
          <h2 style="color: #555; font-size: 16px;">Search Engine</h2>
          <p style="color: #666;">Default search engine: Bing</p>
        </div>
        <div style="margin-top: 24px;">
          <h2 style="color: #555; font-size: 16px;">Privacy</h2>
          <p style="color: #666;">Clear browsing data from the settings menu.</p>
        </div>
      </body>
    </html>
  `,
  'browser://about': `
    <html>
      <head><title>About</title></head>
      <body style="font-family: system-ui, sans-serif; padding: 40px; background: #fff; text-align: center;">
        <div style="font-size: 64px; margin-bottom: 16px;">🌐</div>
        <h1 style="color: #333; font-size: 28px;">WebOS Browser</h1>
        <p style="color: #666; font-size: 14px; margin: 8px 0;">Version 1.0.0</p>
        <p style="color: #999; font-size: 13px; margin-top: 24px;">Powered by specification-compliant rendering kernel</p>
      </body>
    </html>
  `,
};

/**
 * 默认浏览器配置
 */
export const DEFAULT_BROWSER_CONFIG: BrowserConfig = {
  defaultSearchEngine: 'bing',
  homepage: 'browser://newtab',
  enableJavaScript: true,
  enableImages: true,
  privacyMode: false,
};

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  BOOKMARKS: 'browser-bookmarks',
  HISTORY: 'browser-history',
  SETTINGS: 'browser-settings',
  SESSION: 'browser-session',
} as const;

/**
 * 浏览器事件类型
 */
export const BROWSER_EVENTS = {
  TAB_CREATED: 'tab-created',
  TAB_CLOSED: 'tab-closed',
  TAB_ACTIVATED: 'tab-activated',
  NAVIGATION_START: 'navigation-start',
  NAVIGATION_COMPLETE: 'navigation-complete',
  NAVIGATION_ERROR: 'navigation-error',
  RENDER_COMPLETE: 'render-complete',
  BOOKMARK_ADDED: 'bookmark-added',
  BOOKMARK_REMOVED: 'bookmark-removed',
} as const;

/**
 * 浏览器快捷键
 */
export const KEYBOARD_SHORTCUTS = {
  NEW_TAB: 'Ctrl+T',
  CLOSE_TAB: 'Ctrl+W',
  NEXT_TAB: 'Ctrl+Tab',
  PREV_TAB: 'Ctrl+Shift+Tab',
  RELOAD: 'Ctrl+R',
  FORCE_RELOAD: 'Ctrl+Shift+R',
  ADDRESS_BAR: 'Ctrl+L',
  FIND: 'Ctrl+F',
  BOOKMARKS: 'Ctrl+B',
  HISTORY: 'Ctrl+H',
  SETTINGS: 'Ctrl+,',
  HELP: 'F1',
} as const;

/**
 * 浏览器错误码
 */
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  DNS_ERROR: 'DNS_ERROR',
  SSL_ERROR: 'SSL_ERROR',
  HTTP_ERROR: 'HTTP_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  RENDER_ERROR: 'RENDER_ERROR',
  SECURITY_ERROR: 'SECURITY_ERROR',
  QUOTA_ERROR: 'QUOTA_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

/**
 * HTTP 状态码映射
 */
export const HTTP_STATUS_CODES: Record<number, string> = {
  200: 'OK',
  301: 'Moved Permanently',
  302: 'Found',
  304: 'Not Modified',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

/**
 * 内容类型映射
 */
export const CONTENT_TYPES = {
  HTML: 'text/html',
  CSS: 'text/css',
  JAVASCRIPT: 'application/javascript',
  JSON: 'application/json',
  XML: 'application/xml',
  PLAIN_TEXT: 'text/plain',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  GIF: 'image/gif',
  SVG: 'image/svg+xml',
  PDF: 'application/pdf',
} as const;