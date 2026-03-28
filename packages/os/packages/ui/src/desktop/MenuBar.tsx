/**
 * @fileoverview Menu Bar Component
 * @module @ui/desktop/MenuBar
 *
 * A macOS-style menu bar with:
 * - Application menu
 * - Status bar
 * - System icons
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface MenuItem {
  /** Item ID */
  id: string;
  /** Display label */
  label: string;
  /** Keyboard shortcut */
  shortcut?: string;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether this is a divider */
  divider?: boolean;
  /** Submenu items */
  submenu?: MenuItem[];
  /** Click handler */
  onClick?: () => void;
}

export interface Menu {
  /** Menu ID */
  id: string;
  /** Menu label */
  label: string;
  /** Menu items */
  items: MenuItem[];
}

export interface StatusItem {
  /** Item ID */
  id: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Text content */
  text?: string;
  /** Tooltip */
  tooltip?: string;
  /** Click handler */
  onClick?: () => void;
  /** Custom panel */
  panel?: React.ReactNode;
}

export interface MenuBarProps {
  /** Application name (shown as first menu) */
  appName?: string;
  /** Menus */
  menus?: Menu[];
  /** Status bar items */
  statusItems?: StatusItem[];
  /** Called when menu is activated */
  onMenuActive?: (menuId: string | null) => void;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

// ============================================================================
// Dropdown Menu Component
// ============================================================================

interface DropdownMenuProps {
  menu: Menu;
  isOpen: boolean;
  onClose: () => void;
  parentRef: React.RefObject<HTMLDivElement>;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ menu, isOpen, onClose, parentRef }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        parentRef.current &&
        !parentRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, parentRef]);

  if (!isOpen) return null;

  return (
    <div ref={menuRef} className="desktop-menubar-dropdown">
      <div className="desktop-menubar-dropdown-acrylic" />
      {menu.items.map((item, index) => {
        if (item.divider) {
          return <div key={`divider-${index}`} className="desktop-menubar-divider" />;
        }

        return (
          <button
            key={item.id}
            className={`desktop-menubar-dropdown-item ${item.disabled ? 'disabled' : ''}`}
            onClick={() => {
              if (!item.disabled) {
                item.onClick?.();
                onClose();
              }
            }}
            disabled={item.disabled}
          >
            <span className="desktop-menubar-dropdown-label">{item.label}</span>
            {item.shortcut && (
              <span className="desktop-menubar-dropdown-shortcut">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const MenuBar: React.FC<MenuBarProps> = ({
  appName = 'Application',
  menus = [],
  statusItems = [],
  onMenuActive,
  className = '',
}) => {
  // ========================================
  // State
  // ========================================
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeStatusPanel, setActiveStatusPanel] = useState<string | null>(null);

  const menubarRef = useRef<HTMLDivElement>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement>>({});

  // ========================================
  // Effects
  // ========================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setActiveStatusPanel(null);
        onMenuActive?.(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onMenuActive]);

  // ========================================
  // Handlers
  // ========================================
  const handleMenuClick = useCallback(
    (menuId: string) => {
      if (activeMenu === menuId) {
        setActiveMenu(null);
        onMenuActive?.(null);
      } else {
        setActiveMenu(menuId);
        onMenuActive?.(menuId);
      }
    },
    [activeMenu, onMenuActive]
  );

  const handleMenuMouseEnter = useCallback(
    (menuId: string) => {
      if (activeMenu) {
        setActiveMenu(menuId);
        onMenuActive?.(menuId);
      }
    },
    [activeMenu, onMenuActive]
  );

  const handleCloseMenu = useCallback(() => {
    setActiveMenu(null);
    onMenuActive?.(null);
  }, [onMenuActive]);

  const handleStatusClick = useCallback((statusId: string) => {
    const item = statusItems.find((i) => i.id === statusId);
    if (item?.panel) {
      setActiveStatusPanel(activeStatusPanel === statusId ? null : statusId);
    } else {
      item?.onClick?.();
    }
  }, [statusItems, activeStatusPanel]);

  // ========================================
  // Default App Menu
  // ========================================
  const appMenu: Menu = {
    id: 'app',
    label: appName,
    items: [
      { id: 'about', label: `About ${appName}` },
      { id: 'divider-1', label: '', divider: true },
      { id: 'preferences', label: 'Preferences...', shortcut: '⌘,' },
      { id: 'divider-2', label: '', divider: true },
      { id: 'hide', label: `Hide ${appName}`, shortcut: '⌘H' },
      { id: 'hide-others', label: 'Hide Others', shortcut: '⌥⌘H' },
      { id: 'show-all', label: 'Show All' },
      { id: 'divider-3', label: '', divider: true },
      { id: 'quit', label: `Quit ${appName}`, shortcut: '⌘Q' },
    ],
  };

  const allMenus = [appMenu, ...menus];

  // ========================================
  // Render
  // ========================================
  return (
    <div ref={menubarRef} className={`desktop-menubar ${className}`}>
      {/* Acrylic Background */}
      <div className="desktop-menubar-acrylic" />

      {/* Left: Menus */}
      <div className="desktop-menubar-left">
        {/* Apple Logo */}
        <button className="desktop-menubar-apple">
          <AppleIcon />
        </button>

        {/* Menus */}
        {allMenus.map((menu) => (
          <div
            key={menu.id}
            ref={(el) => {
              if (el) menuRefs.current[menu.id] = el;
            }}
            className="desktop-menubar-item"
          >
            <button
              className={`desktop-menubar-button ${activeMenu === menu.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(menu.id)}
              onMouseEnter={() => handleMenuMouseEnter(menu.id)}
            >
              {menu.label}
            </button>

            <DropdownMenu
              menu={menu}
              isOpen={activeMenu === menu.id}
              onClose={handleCloseMenu}
              parentRef={{ current: menuRefs.current[menu.id] }}
            />
          </div>
        ))}
      </div>

      {/* Right: Status Items */}
      <div className="desktop-menubar-right">
        {statusItems.map((item) => (
          <div key={item.id} className="desktop-menubar-status">
            <button
              className={`desktop-menubar-status-button ${activeStatusPanel === item.id ? 'active' : ''}`}
              onClick={() => handleStatusClick(item.id)}
              title={item.tooltip}
            >
              {item.icon}
              {item.text && <span className="desktop-menubar-status-text">{item.text}</span>}
            </button>

            {activeStatusPanel === item.id && item.panel && (
              <div className="desktop-menubar-status-panel">
                <div className="desktop-menubar-status-panel-acrylic" />
                {item.panel}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBar;
