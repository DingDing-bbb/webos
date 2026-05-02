/**
 * Browser Application - 使用规范级内核
 *
 * 严格遵循：
 * - HTML Living Standard
 * - CSS Specifications
 * - DOM Living Standard
 */

import React, { useState, useCallback, useRef, useEffect, useMemo, type FC } from 'react';
import { BrowserIcon } from './icon';
import { TabBar } from './components/TabBar';
import { Toolbar } from './components/Toolbar';
import { ContentArea } from './components/ContentArea';
import type { AppInfo } from '../../types';
import type { Tab, Bookmark } from './types';
import { SEARCH_ENGINES, INTERNAL_PAGES } from './constants';
import { BrowserKernel, type RenderResult } from './kernel';
import './styles.css';

// ============================================
// Component
// ============================================


/**
 * 从本地存储加载书签
 */
function loadBookmarks(): Bookmark[] {
  try {
    const saved = localStorage.getItem('browser-bookmarks');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * 保存书签到本地存储
 */
export function saveBookmark(bookmark: Bookmark): void {
  const bookmarks = loadBookmarks();
  bookmarks.push(bookmark);
  localStorage.setItem('browser-bookmarks', JSON.stringify(bookmarks));
}

// ============================================
// BrowserApp Component
// ============================================

export const BrowserApp: React.FC = () => {
  // State
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'New Tab',
      url: 'about:blank',
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      history: ['about:blank'],
      historyIndex: 0,
      kernel: new BrowserKernel(800, 600),
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [addressInput, setAddressInput] = useState('');
  const [_bookmarks] = useState<Bookmark[]>(loadBookmarks);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active tab
  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  // ============================================
  // Canvas Rendering
  // ============================================

  const renderToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container || !activeTab) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Paint
    if (activeTab.renderResult?.layout) {
      activeTab.kernel.paint(ctx);
    }
  }, [activeTab]);

  // ============================================
  // Navigation
  // ============================================

  const navigateTo = useCallback(
    async (url: string) => {
      let processedUrl = url.trim();

      if (processedUrl === '' || processedUrl === 'about:blank') {
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

      // Internal pages
      if (processedUrl.startsWith('browser://')) {
        const content = INTERNAL_PAGES[processedUrl];
        if (content) {
          setTabs((prev) =>
            prev.map((tab) => {
              if (tab.id === activeTabId) {
                const result = tab.kernel.render(content, processedUrl, 800, 600);
                return {
                  ...tab,
                  url: processedUrl,
                  title: result.title,
                  isLoading: false,
                  renderResult: result,
                };
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

      // Search or URL
      if (!processedUrl.includes('.') && !processedUrl.startsWith('http')) {
        processedUrl = `${SEARCH_ENGINES.bing.url}${encodeURIComponent(processedUrl)}`;
      } else if (!processedUrl.startsWith('http')) {
        processedUrl = 'https://' + processedUrl;
      }

      // Update tab
      setTabs((prev) =>
        prev.map((tab) => ({
          ...tab,
          isLoading: tab.id === activeTabId,
        }))
      );

      setAddressInput(processedUrl);

      // Fetch
      try {
        const proxies = [
          `https://api.allorigins.win/raw?url=${encodeURIComponent(processedUrl)}`,
          `https://corsproxy.io/?${encodeURIComponent(processedUrl)}`,
        ];

        let html = '';
        for (const proxy of proxies) {
          try {
            const res = await fetch(proxy);
            if (res.ok) {
              html = await res.text();
              break;
            }
          } catch {
            continue;
          }
        }

        if (!html) {
          // Demo page
          html = `
          <html>
            <head><title>${processedUrl}</title></head>
            <body style="font-family: system-ui, sans-serif; padding: 40px; background: #fff;">
              <h1 style="color: #333;">${processedUrl}</h1>
              <p style="color: #666;">Unable to load page. CORS restrictions may apply.</p>
            </body>
          </html>
        `;
        }

        setTabs((prev) =>
          prev.map((tab) => {
            if (tab.id === activeTabId) {
              const result = tab.kernel.render(html, processedUrl, 800, 600);
              return {
                ...tab,
                url: processedUrl,
                title: result.title,
                isLoading: false,
                renderResult: result,
              };
            }
            return tab;
          })
        );
      } catch (error) {
        console.error('Navigation error:', error);
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === activeTabId ? { ...tab, isLoading: false, error: String(error) } : tab
          )
        );
      }
    },
    [activeTabId]
  );

  // ============================================
  // Effects
  // ============================================

  useEffect(() => {
    if (activeTab?.renderResult?.layout) {
      requestAnimationFrame(renderToCanvas);
    }
  }, [activeTab?.renderResult, renderToCanvas]);

  useEffect(() => {
    const handleResize = () => renderToCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderToCanvas]);

  // ============================================
  // Render
  // ============================================

  return (
    <div className="browser-app">
      {/* Tab Bar */}
      <div className="browser-tab-bar">
        <div className="browser-tabs">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`browser-tab ${tab.id === activeTabId ? 'active' : ''}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span className="browser-tab-title">{tab.title}</span>
              {tab.isLoading && <span className="browser-tab-loading">◐</span>}
            </div>
          ))}
        </div>
        <button
          className="browser-new-tab"
          onClick={() => {
            const newTab: Tab = {
              id: `tab-${Date.now()}`,
              title: 'New Tab',
              url: 'about:blank',
              isLoading: false,
              canGoBack: false,
              canGoForward: false,
              history: ['about:blank'],
              historyIndex: 0,
              kernel: new BrowserKernel(800, 600),
            };
            setTabs((prev) => [...prev, newTab]);
            setActiveTabId(newTab.id);
          }}
        >
          +
        </button>
      </div>

      {/* Toolbar */}
      <div className="browser-toolbar">
        <div className="browser-nav-buttons">
          <button className="browser-nav-btn" onClick={() => {}} title="Back">
            ←
          </button>
          <button className="browser-nav-btn" onClick={() => {}} title="Forward">
            →
          </button>
          <button
            className="browser-nav-btn"
            onClick={() => activeTab?.url && navigateTo(activeTab.url)}
            title="Refresh"
          >
            ↻
          </button>
        </div>
        <div className="browser-address-bar">
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigateTo(addressInput)}
            placeholder="Search with Bing or enter URL"
            className="browser-address-input"
          />
        </div>
        <div className="browser-toolbar-actions">
          <button
            className="browser-toolbar-btn"
            onClick={() => navigateTo('browser://settings')}
            title="Settings"
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="browser-content" ref={containerRef}>
        {activeTab?.url === 'about:blank' ? (
          <div className="browser-new-tab-page">
            <h1>WebOS Browser</h1>
            <p>Enter a URL or search term to get started</p>
            <div className="browser-quick-links">
              <button onClick={() => navigateTo('https://www.bing.com')}>Bing</button>
              <button onClick={() => navigateTo('https://www.google.com')}>Google</button>
              <button onClick={() => navigateTo('https://www.github.com')}>GitHub</button>
            </div>
          </div>
        ) : (
          <canvas ref={canvasRef} className="browser-canvas" />
        )}
      </div>
    </div>
  );
};

// 应用信息
export const appInfo: AppInfo = {
  id: 'com.os.browser',
  name: 'Browser',
  nameKey: 'app.browser',
  description: 'Web browser with Canvas rendering',
  descriptionKey: 'app.browser.desc',
  version: '1.0.0',
  category: 'network',
  icon: BrowserIcon,
  component: BrowserApp,
  defaultWidth: 1000,
  defaultHeight: 700,
  minWidth: 600,
  minHeight: 400,
  resizable: true,
  singleton: false,
};

export default BrowserApp;
