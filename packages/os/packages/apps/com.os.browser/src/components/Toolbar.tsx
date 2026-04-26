/**
 * 浏览器工具栏组件
 * 包含导航按钮、地址栏和工具按钮
 */

import React, { useState, type FC } from 'react';
import type { Tab } from '../types';

interface ToolbarProps {
  activeTab?: Tab;
  addressInput: string;
  onAddressChange: (value: string) => void;
  onNavigate: (url: string) => void;
  onGoBack?: () => void;
  onGoForward?: () => void;
  onRefresh?: () => void;
  onSettings?: () => void;
}

/**
 * 浏览器工具栏组件
 */
export const Toolbar: FC<ToolbarProps> = ({
  activeTab,
  addressInput,
  onAddressChange,
  onNavigate,
  onGoBack,
  onGoForward,
  onRefresh,
  onSettings,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      onNavigate(addressInput);
    }
  };

  const handleRefresh = (): void => {
    if (onRefresh && activeTab?.url) {
      onRefresh();
    }
  };

  return (
    <div className="browser-toolbar">
      {/* 导航按钮 */}
      <div className="browser-nav-buttons">
        <button
          className="browser-nav-btn"
          onClick={onGoBack}
          disabled={!activeTab?.canGoBack}
          title="Back"
        >
          ←
        </button>
        <button
          className="browser-nav-btn"
          onClick={onGoForward}
          disabled={!activeTab?.canGoForward}
          title="Forward"
        >
          →
        </button>
        <button
          className="browser-nav-btn"
          onClick={handleRefresh}
          disabled={!activeTab?.url}
          title="Refresh"
        >
          ↻
        </button>
      </div>

      {/* 地址栏 */}
      <div className="browser-address-bar">
        <input
          type="text"
          value={addressInput}
          onChange={(e) => onAddressChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search with Bing or enter URL"
          className={`browser-address-input ${isFocused ? 'focused' : ''}`}
          aria-label="Address bar"
        />
      </div>

      {/* 工具栏按钮 */}
      <div className="browser-toolbar-actions">
        {onSettings && (
          <button
            className="browser-toolbar-btn"
            onClick={onSettings}
            title="Settings"
          >
            ⚙
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;