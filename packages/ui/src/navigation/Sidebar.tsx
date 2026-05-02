/**
 * Sidebar Component - 侧边栏组件
 * 支持可折叠、图标模式、亚克力效果
 */

import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';

// ========== Types ==========
export interface SidebarItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children?: SidebarItem[];
  onClick?: () => void;
  disabled?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string, item: SidebarItem) => void;
  position?: 'left' | 'right';
  width?: number | string;
  collapsedWidth?: number | string;
  className?: string;
  style?: React.CSSProperties;
  acrylic?: boolean;
  showToggle?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

interface SidebarContextType {
  collapsed: boolean;
  selectedKey: string;
  onSelect: (key: string, item: SidebarItem) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

// ========== Sidebar SubMenu Component ==========
interface SidebarSubMenuProps {
  item: SidebarItem;
  level: number;
}

const SidebarSubMenu: React.FC<SidebarSubMenuProps> = ({ item, level }) => {
  const context = useContext(SidebarContext);
  const [isOpen, setIsOpen] = useState(false);

  if (!context) return null;

  const { collapsed, selectedKey, onSelect } = context;
  const isSelected = selectedKey === item.key;
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (item.disabled) return;

    if (hasChildren && !collapsed) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item.key, item);
      item.onClick?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <li
      className={`
        nav-sidebar-item
        nav-sidebar-submenu
        ${isOpen ? 'nav-sidebar-submenu-open' : ''}
        ${isSelected ? 'nav-sidebar-item-selected' : ''}
        ${item.disabled ? 'nav-sidebar-item-disabled' : ''}
      `.trim()}
      role="menuitem"
    >
      <div
        className="nav-sidebar-item-content"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={item.disabled ? -1 : 0}
        role="button"
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-haspopup={hasChildren}
        title={collapsed ? item.label : undefined}
      >
        {item.icon && <span className="nav-sidebar-item-icon">{item.icon}</span>}
        {!collapsed && (
          <>
            <span className="nav-sidebar-item-label">{item.label}</span>
            {item.badge && <span className="nav-sidebar-item-badge">{item.badge}</span>}
            {hasChildren && (
              <span
                className={`nav-sidebar-item-arrow ${isOpen ? 'nav-sidebar-item-arrow-open' : ''}`}
              >
                ▼
              </span>
            )}
          </>
        )}
      </div>

      {!collapsed && hasChildren && (
        <ul
          className={`
            nav-sidebar-submenu-items
            ${isOpen ? 'nav-sidebar-submenu-items-visible' : ''}
          `.trim()}
          role="menu"
        >
          {item.children!.map((child) =>
            child.children ? (
              <SidebarSubMenu key={child.key} item={child} level={level + 1} />
            ) : (
              <SidebarMenuItem key={child.key} item={child} />
            )
          )}
        </ul>
      )}
    </li>
  );
};

// ========== Sidebar Menu Item Component ==========
interface SidebarMenuItemProps {
  item: SidebarItem;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ item }) => {
  const context = useContext(SidebarContext);

  if (!context) return null;

  const { collapsed, selectedKey, onSelect } = context;
  const isSelected = selectedKey === item.key;

  const handleClick = () => {
    if (item.disabled) return;
    onSelect(item.key, item);
    item.onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <li
      className={`
        nav-sidebar-item
        ${isSelected ? 'nav-sidebar-item-selected' : ''}
        ${item.disabled ? 'nav-sidebar-item-disabled' : ''}
      `.trim()}
      role="menuitem"
    >
      <div
        className="nav-sidebar-item-content"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={item.disabled ? -1 : 0}
        role="button"
        title={collapsed ? item.label : undefined}
      >
        {item.icon && <span className="nav-sidebar-item-icon">{item.icon}</span>}
        {!collapsed && (
          <>
            <span className="nav-sidebar-item-label">{item.label}</span>
            {item.badge && <span className="nav-sidebar-item-badge">{item.badge}</span>}
          </>
        )}
      </div>
    </li>
  );
};

// ========== Main Sidebar Component ==========
export const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapse,
  selectedKey: controlledSelectedKey,
  defaultSelectedKey = '',
  onSelect,
  position = 'left',
  width = 240,
  collapsedWidth = 64,
  className = '',
  style,
  acrylic = true,
  showToggle = true,
  header,
  footer,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [internalSelectedKey, setInternalSelectedKey] = useState(defaultSelectedKey);
  const sidebarRef = useRef<HTMLElement>(null);

  const collapsed = controlledCollapsed ?? internalCollapsed;
  const selectedKey = controlledSelectedKey ?? internalSelectedKey;

  const handleCollapse = useCallback(() => {
    const newCollapsed = !collapsed;
    setInternalCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  }, [collapsed, onCollapse]);

  const handleSelect = useCallback(
    (key: string, item: SidebarItem) => {
      setInternalSelectedKey(key);
      onSelect?.(key, item);
    },
    [onSelect]
  );

  // Keyboard shortcut to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCollapse]);

  const contextValue: SidebarContextType = {
    collapsed,
    selectedKey,
    onSelect: handleSelect,
  };

  const sidebarStyle: React.CSSProperties = {
    width: collapsed ? collapsedWidth : width,
    ...style,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <aside
        ref={sidebarRef}
        className={`
          nav-sidebar
          nav-sidebar-${position}
          ${collapsed ? 'nav-sidebar-collapsed' : ''}
          ${acrylic ? 'nav-sidebar-acrylic' : ''}
          ${className}
        `.trim()}
        style={sidebarStyle}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        {header && <div className="nav-sidebar-header">{header}</div>}

        {/* Menu */}
        <nav className="nav-sidebar-nav">
          <ul className="nav-sidebar-menu" role="menu">
            {items.map((item) =>
              item.children ? (
                <SidebarSubMenu key={item.key} item={item} level={0} />
              ) : (
                <SidebarMenuItem key={item.key} item={item} />
              )
            )}
          </ul>
        </nav>

        {/* Footer */}
        {footer && <div className="nav-sidebar-footer">{footer}</div>}

        {/* Toggle Button */}
        {showToggle && (
          <button
            className="nav-sidebar-toggle"
            onClick={handleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand (Ctrl+B)' : 'Collapse (Ctrl+B)'}
          >
            <span
              className={`nav-sidebar-toggle-icon ${collapsed ? 'nav-sidebar-toggle-icon-collapsed' : ''}`}
            >
              {position === 'left' ? '◀' : '▶'}
            </span>
          </button>
        )}

        {/* Tooltip for collapsed items */}
        {collapsed && <div className="nav-sidebar-tooltip" aria-hidden="true" />}
      </aside>
    </SidebarContext.Provider>
  );
};

// ========== Sidebar Group Component ==========
export interface SidebarGroupProps {
  title?: string;
  children: React.ReactNode;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({ title, children }) => {
  const context = useContext(SidebarContext);

  return (
    <div className="nav-sidebar-group">
      {title && !context?.collapsed && <div className="nav-sidebar-group-title">{title}</div>}
      {children}
    </div>
  );
};

export default Sidebar;
