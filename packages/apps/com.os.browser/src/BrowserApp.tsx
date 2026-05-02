/**
 * 浏览器应用主组件
 * 重构版本，使用子组件和工具函数
 */

import React, { useState, useCallback, useMemo, type FC } from 'react';
import { TabBar } from './components/TabBar';
import { Toolbar } from './components/Toolbar';
import { ContentArea } from './components/ContentArea';
import type { Tab } from './types';
import {
  createNewTab,
  closeTab,
  findNextActiveTabId,
  navigateBack,
  navigateForward,
} from './utils/navigation';
import { navigateTo } from './utils/navigationService';

interface BrowserAppProps {
  windowId?: string;
}

/**
 * 浏览器应用主组件
 */
export const BrowserApp: FC<BrowserAppProps> = () => {
  // 标签页状态
  const [tabs, setTabs] = useState<Tab[]>([createNewTab('tab-1')]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [addressInput, setAddressInput] = useState<string>('');

  // 活动标签页
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  // 标签页操作
  const handleTabSelect = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    const selectedTab = tabs.find((tab) => tab.id === tabId);
    if (selectedTab) {
      setAddressInput(selectedTab.url);
    }
  }, [tabs]);

  const handleTabClose = useCallback((tabId: string) => {
    const newTabs = closeTab(tabs, tabId);
    setTabs(newTabs);

    const nextTabId = findNextActiveTabId(tabs, tabId);
    if (nextTabId) {
      setActiveTabId(nextTabId);
      const nextTab = newTabs.find((tab) => tab.id === nextTabId);
      if (nextTab) {
        setAddressInput(nextTab.url);
      }
    }
  }, [tabs]);

  const handleNewTab = useCallback(() => {
    const newTab = createNewTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setAddressInput(newTab.url);
  }, []);

  // 导航操作
  const handleNavigate = useCallback((url: string) => {
    navigateTo(url, activeTabId, tabs, setTabs, setAddressInput);
  }, [activeTabId, tabs]);

  const handleGoBack = useCallback(() => {
    if (activeTab?.canGoBack) {
      const updatedTab = navigateBack(activeTab);
      setTabs((prev) =>
        prev.map((tab) => (tab.id === activeTabId ? updatedTab : tab))
      );
      setAddressInput(updatedTab.url);
    }
  }, [activeTab, activeTabId]);

  const handleGoForward = useCallback(() => {
    if (activeTab?.canGoForward) {
      const updatedTab = navigateForward(activeTab);
      setTabs((prev) =>
        prev.map((tab) => (tab.id === activeTabId ? updatedTab : tab))
      );
      setAddressInput(updatedTab.url);
    }
  }, [activeTab, activeTabId]);

  const handleRefresh = useCallback(() => {
    if (activeTab?.url) {
      handleNavigate(activeTab.url);
    }
  }, [activeTab?.url, handleNavigate]);

  const handleSettings = useCallback(() => {
    handleNavigate('browser://settings');
  }, [handleNavigate]);

  // 地址栏操作
  const handleAddressChange = useCallback((value: string) => {
    setAddressInput(value);
  }, []);

  return (
    <div className="browser-app">
      {/* 标签栏 */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
      />

      {/* 工具栏 */}
      <Toolbar
        activeTab={activeTab}
        addressInput={addressInput}
        onAddressChange={handleAddressChange}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onRefresh={handleRefresh}
        onSettings={handleSettings}
      />

      {/* 内容区域 */}
      <ContentArea
        activeTab={activeTab}
        onNewTab={handleNewTab}
      />
    </div>
  );
};

export default BrowserApp;