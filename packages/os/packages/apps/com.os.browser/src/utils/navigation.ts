/**
 * 浏览器导航工具函数
 */

import type { Tab } from '../types';
import { SEARCH_ENGINES, INTERNAL_PAGES } from '../constants';
import { BrowserKernel } from '../kernel';

/**
 * 处理URL输入，添加协议前缀或转换为搜索URL
 */
export function processUrlInput(input: string): string {
  let processedUrl = input.trim();

  // 空URL或空白页面
  if (processedUrl === '' || processedUrl === 'about:blank') {
    return 'about:blank';
  }

  // 内部页面
  if (processedUrl.startsWith('browser://')) {
    return processedUrl;
  }

  // 搜索查询或URL
  if (!processedUrl.includes('.') && !processedUrl.startsWith('http')) {
    return `${SEARCH_ENGINES.bing.url}${encodeURIComponent(processedUrl)}`;
  } else if (!processedUrl.startsWith('http')) {
    return 'https://' + processedUrl;
  }

  return processedUrl;
}

/**
 * 创建新标签页
 */
export function createNewTab(id?: string): Tab {
  const tabId = id || `tab-${Date.now()}`;
  return {
    id: tabId,
    title: 'New Tab',
    url: 'about:blank',
    isLoading: false,
    canGoBack: false,
    canGoForward: false,
    history: ['about:blank'],
    historyIndex: 0,
    kernel: new BrowserKernel(800, 600),
  };
}

/**
 * 判断是否为内部页面
 */
export function isInternalPage(url: string): boolean {
  return url.startsWith('browser://');
}

/**
 * 获取内部页面内容
 */
export function getInternalPageContent(url: string): string | undefined {
  return INTERNAL_PAGES[url];
}

/**
 * 更新标签页URL和标题
 */
export function updateTabUrlAndTitle(
  tab: Tab,
  url: string,
  title?: string
): Tab {
  const newHistory = [...tab.history];
  const newHistoryIndex = tab.historyIndex;

  if (url !== newHistory[newHistoryIndex]) {
    newHistory.push(url);
    return {
      ...tab,
      url,
      title: title || tab.title,
      history: newHistory,
      historyIndex: newHistoryIndex + 1,
      canGoBack: newHistoryIndex > 0,
      canGoForward: false,
    };
  }

  return {
    ...tab,
    url,
    title: title || tab.title,
  };
}

/**
 * 导航到历史记录中的上一页
 */
export function navigateBack(tab: Tab): Tab {
  if (tab.historyIndex <= 0) return tab;

  const newIndex = tab.historyIndex - 1;
  return {
    ...tab,
    url: tab.history[newIndex],
    historyIndex: newIndex,
    canGoBack: newIndex > 0,
    canGoForward: true,
  };
}

/**
 * 导航到历史记录中的下一页
 */
export function navigateForward(tab: Tab): Tab {
  if (tab.historyIndex >= tab.history.length - 1) return tab;

  const newIndex = tab.historyIndex + 1;
  return {
    ...tab,
    url: tab.history[newIndex],
    historyIndex: newIndex,
    canGoBack: true,
    canGoForward: newIndex < tab.history.length - 1,
  };
}

/**
 * 关闭标签页
 */
export function closeTab(tabs: Tab[], tabId: string): Tab[] {
  return tabs.filter((tab) => tab.id !== tabId);
}

/**
 * 查找下一个活动标签页
 */
export function findNextActiveTabId(
  tabs: Tab[],
  activeTabId: string
): string | null {
  const index = tabs.findIndex((tab) => tab.id === activeTabId);
  if (index === -1) return null;

  if (tabs.length === 1) return null; // 没有其他标签页
  if (index === tabs.length - 1) return tabs[index - 1].id; // 关闭最后一个标签页
  return tabs[index + 1].id; // 关闭中间的标签页
}

/**
 * 验证URL格式
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    // 可能是相对URL或搜索查询
    return url.trim().length > 0;
  }
}

/**
 * 获取页面标题
 */
export function extractPageTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }

  // 尝试从h1标签中提取
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim();
  }

  return 'Untitled Page';
}