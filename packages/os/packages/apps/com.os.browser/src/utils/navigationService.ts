/**
 * 浏览器导航服务
 * 处理页面加载、渲染和网络请求
 */

import type { Tab } from '../types';
import {
  processUrlInput,
  isInternalPage,
  getInternalPageContent,
  updateTabUrlAndTitle,
  extractPageTitle,
} from './navigation';
import { INTERNAL_PAGES } from '../constants';

/**
 * 导航到指定URL
 */
export async function navigateTo(
  url: string,
  activeTabId: string,
  tabs: Tab[],
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>,
  setAddressInput: React.Dispatch<React.SetStateAction<string>>
): Promise<void> {
  const processedUrl = processUrlInput(url);
  
  // 空白页面
  if (processedUrl === 'about:blank') {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, url: 'about:blank', title: 'New Tab', isLoading: false }
          : tab
      )
    );
    setAddressInput('');
    return;
  }

  // 内部页面
  if (isInternalPage(processedUrl)) {
    const content = getInternalPageContent(processedUrl);
    if (content) {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === activeTabId) {
            const result = tab.kernel.render(content, processedUrl, 800, 600);
            return updateTabUrlAndTitle(
              { ...tab, isLoading: false },
              processedUrl,
              result.title
            );
          }
          return tab;
        })
      );
      setAddressInput(processedUrl);
      return;
    }
    setAddressInput(processedUrl);
    return;
  }

  // 设置加载状态
  setTabs((prev) =>
    prev.map((tab) => ({
      ...tab,
      isLoading: tab.id === activeTabId,
    }))
  );

  setAddressInput(processedUrl);

  try {
    // 获取页面内容
    const html = await fetchPageContent(processedUrl);
    
    // 渲染页面
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTabId) {
          const result = tab.kernel.render(html, processedUrl, 800, 600);
          return updateTabUrlAndTitle(
            { ...tab, isLoading: false },
            processedUrl,
            result.title
          );
        }
        return tab;
      })
    );
  } catch (error) {
    console.error('Navigation error:', error);
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId 
          ? { 
              ...tab, 
              isLoading: false, 
              error: String(error) 
            } 
          : tab
      )
    );
  }
}

/**
 * 获取页面内容
 */
async function fetchPageContent(url: string): Promise<string> {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];

  // 尝试每个代理
  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy);
      if (res.ok) {
        return await res.text();
      }
    } catch {
      continue;
    }
  }

  // 所有代理都失败，返回演示页面
  return createDemoPage(url);
}

/**
 * 创建演示页面（当无法加载真实页面时）
 */
function createDemoPage(url: string): string {
  const title = extractPageTitle('') || url;
  return `
    <html>
      <head><title>${title}</title></head>
      <body style="font-family: system-ui, sans-serif; padding: 40px; background: #fff;">
        <h1 style="color: #333;">${title}</h1>
        <p style="color: #666;">Unable to load page. CORS restrictions may apply.</p>
        <p style="color: #999; font-size: 14px; margin-top: 20px;">
          This is a demo page. The WebOS Browser uses CORS proxies to load external content.
        </p>
      </body>
    </html>
  `;
}

/**
 * 批量更新标签页
 */
export function updateTabs(
  tabs: Tab[],
  updater: (tab: Tab) => Tab
): Tab[] {
  return tabs.map(updater);
}

/**
 * 查找标签页
 */
export function findTab(tabs: Tab[], tabId: string): Tab | undefined {
  return tabs.find((tab) => tab.id === tabId);
}

/**
 * 更新指定标签页
 */
export function updateTab(
  tabs: Tab[],
  tabId: string,
  updates: Partial<Tab>
): Tab[] {
  return tabs.map((tab) =>
    tab.id === tabId ? { ...tab, ...updates } : tab
  );
}