/**
 * 标签栏组件
 * 管理浏览器标签页的创建、切换和关闭
 */

import React from 'react';
import type { Tab } from '../types';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onNewTab: () => void;
}

/**
 * 标签栏组件
 */
export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
}) => {
  const handleTabClose = (
    event: React.MouseEvent,
    tabId: string
  ): void => {
    event.stopPropagation();
    if (onTabClose) {
      onTabClose(tabId);
    }
  };

  return (
    <div className="browser-tab-bar">
      <div className="browser-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`browser-tab ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="browser-tab-title">
              {tab.isLoading ? 'Loading...' : tab.title}
            </span>
            {tab.isLoading && (
              <span className="browser-tab-loading">◐</span>
            )}
            {onTabClose && (
              <button
                className="browser-tab-close"
                onClick={(e) => handleTabClose(e, tab.id)}
                aria-label="Close tab"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        className="browser-new-tab"
        onClick={onNewTab}
        aria-label="New tab"
      >
        +
      </button>
    </div>
  );
};

export default TabBar;