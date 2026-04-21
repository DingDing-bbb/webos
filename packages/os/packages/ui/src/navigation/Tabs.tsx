/**
 * Tabs Component - 标签页组件
 * 支持顶部/底部/左侧/右侧位置、可关闭标签、滚动支持
 */

import React, { useState, useCallback, useRef, useEffect, createContext } from 'react';

// ========== Types ==========
export interface TabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
  content?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onChange?: (key: string) => void;
  onEdit?: (action: 'add' | 'remove', key?: string) => void;
  onClose?: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
  acrylic?: boolean;
  scrollable?: boolean;
  showAddButton?: boolean;
  animated?: boolean;
}

interface TabsContextType {
  activeKey: string;
  onChange: (key: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

// ========== TabPanel Component ==========
interface TabPanelProps {
  tab: TabItem;
}

const TabPanel: React.FC<TabPanelProps> = ({ tab }) => {
  return (
    <div className="nav-tabs-panel" role="tabpanel" aria-labelledby={`nav-tab-${tab.key}`}>
      {tab.content}
    </div>
  );
};

// ========== Main Tabs Component ==========
export const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey: controlledActiveKey,
  defaultActiveKey,
  position = 'top',
  onChange,
  onEdit,
  onClose,
  className = '',
  style,
  acrylic = true,
  scrollable = true,
  showAddButton = false,
  animated = true,
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey ?? items[0]?.key ?? ''
  );
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tabListRef = useRef<HTMLDivElement>(null);
  const tabNavRef = useRef<HTMLDivElement>(null);

  const activeKey = controlledActiveKey ?? internalActiveKey;

  const handleChange = useCallback(
    (key: string) => {
      setInternalActiveKey(key);
      onChange?.(key);
    },
    [onChange]
  );

  const handleClose = useCallback(
    (key: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onClose?.(key);
      onEdit?.('remove', key);
    },
    [onClose, onEdit]
  );

  const handleAdd = useCallback(() => {
    onEdit?.('add');
  }, [onEdit]);

  // Scroll handling
  const checkScrollButtons = useCallback(() => {
    const nav = tabNavRef.current;
    if (!nav || !scrollable) {
      setShowScrollButtons(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = nav;
    setShowScrollButtons(scrollWidth > clientWidth);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, [scrollable]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const nav = tabNavRef.current;
    if (!nav) return;

    const scrollAmount = nav.clientWidth * 0.5;
    nav.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [checkScrollButtons, items]);

  // Scroll active tab into view
  useEffect(() => {
    const activeTab = tabListRef.current?.querySelector(
      `[data-tab-key="${activeKey}"]`
    ) as HTMLElement;
    if (activeTab && tabNavRef.current) {
      activeTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeKey]);

  // Keyboard navigation
  useEffect(() => {
    const tabList = tabListRef.current;
    if (!tabList) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tabs = Array.from(
        tabList.querySelectorAll<HTMLElement>('[role="tab"]:not([aria-disabled="true"])')
      );
      const currentIndex = tabs.findIndex((tab) => tab.dataset.tabKey === activeKey);

      let nextIndex: number;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = tabs.length - 1;
          break;
        default:
          return;
      }

      const nextTab = tabs[nextIndex];
      if (nextTab) {
        handleChange(nextTab.dataset.tabKey!);
        nextTab.focus();
      }
    };

    tabList.addEventListener('keydown', handleKeyDown);
    return () => tabList.removeEventListener('keydown', handleKeyDown);
  }, [activeKey, items, handleChange]);

  const isVertical = position === 'left' || position === 'right';

  const contextValue: TabsContextType = {
    activeKey,
    onChange: handleChange,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={`
          nav-tabs-container
          nav-tabs-${position}
          ${acrylic ? 'nav-tabs-acrylic' : ''}
          ${className}
        `.trim()}
        style={style}
      >
        {/* Tab Navigation */}
        <div className="nav-tabs-nav-wrapper">
          {showScrollButtons && canScrollLeft && (
            <button
              className="nav-tabs-scroll-btn nav-tabs-scroll-left"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              ‹
            </button>
          )}

          <div ref={tabNavRef} className="nav-tabs-nav" onScroll={checkScrollButtons}>
            <div
              ref={tabListRef}
              className="nav-tabs-list"
              role="tablist"
              aria-orientation={isVertical ? 'vertical' : 'horizontal'}
            >
              {items.map((tab) => (
                <div
                  key={tab.key}
                  data-tab-key={tab.key}
                  className={`
                    nav-tab
                    ${activeKey === tab.key ? 'nav-tab-active' : ''}
                    ${tab.disabled ? 'nav-tab-disabled' : ''}
                  `.trim()}
                  role="tab"
                  id={`nav-tab-${tab.key}`}
                  aria-selected={activeKey === tab.key}
                  aria-controls={`nav-panel-${tab.key}`}
                  aria-disabled={tab.disabled}
                  tabIndex={activeKey === tab.key ? 0 : -1}
                  onClick={() => !tab.disabled && handleChange(tab.key)}
                >
                  {tab.icon && <span className="nav-tab-icon">{tab.icon}</span>}
                  <span className="nav-tab-label">{tab.label}</span>
                  {tab.closable !== false && items.length > 1 && (
                    <button
                      className="nav-tab-close"
                      onClick={(e) => handleClose(tab.key, e)}
                      aria-label="Close tab"
                      tabIndex={-1}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Animated indicator */}
            {animated && (
              <div
                className="nav-tabs-indicator"
                style={
                  {
                    // Position will be set by CSS based on active tab
                  }
                }
              />
            )}
          </div>

          {showScrollButtons && canScrollRight && (
            <button
              className="nav-tabs-scroll-btn nav-tabs-scroll-right"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              ›
            </button>
          )}

          {showAddButton && (
            <button className="nav-tabs-add-btn" onClick={handleAdd} aria-label="Add tab">
              +
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="nav-tabs-content">
          {items.map((tab) => (
            <div
              key={tab.key}
              className={`
                nav-tabs-panel-wrapper
                ${activeKey === tab.key ? 'nav-tabs-panel-active' : ''}
                ${animated ? 'nav-tabs-panel-animated' : ''}
              `.trim()}
              id={`nav-panel-${tab.key}`}
              aria-labelledby={`nav-tab-${tab.key}`}
              hidden={activeKey !== tab.key}
            >
              {activeKey === tab.key && <TabPanel tab={tab} />}
            </div>
          ))}
        </div>
      </div>
    </TabsContext.Provider>
  );
};

// ========== TabPane Component (for declarative usage) ==========
export interface TabPaneProps {
  tab?: React.ReactNode;
  key?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
  children: React.ReactNode;
}

export const TabPane: React.FC<TabPaneProps> = ({ children }) => {
  return <>{children}</>;
};

export default Tabs;
