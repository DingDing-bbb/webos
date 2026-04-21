/**
 * Menu Component - 菜单组件
 * 支持水平/垂直模式、多级嵌套、图标支持、亚克力背景
 */

import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';

// ========== Types ==========
export interface MenuItemProps {
  key?: string;
  id?: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  active?: boolean;
  children?: MenuItemProps[];
  onClick?: () => void;
}

export interface MenuProps {
  items: MenuItemProps[];
  mode?: 'horizontal' | 'vertical' | 'inline' | 'sidebar';
  defaultSelectedKey?: string;
  defaultOpenKeys?: string[];
  selectedKey?: string;
  openKeys?: string[];
  onSelect?: (key: string) => void;
  onOpenChange?: (keys: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
  acrylic?: boolean;
  variant?: 'default' | 'sidebar';
}

// Helper to get item key (used for debugging)
const _getItemKey = (item: MenuItemProps): string => item.key || item.id || '';

// Helper to normalize items with keys
const normalizeItems = (items: MenuItemProps[]): MenuItemProps[] => {
  return items.map((item, index) => ({
    ...item,
    key: item.key || item.id || `item-${index}`,
    children: item.children ? normalizeItems(item.children) : undefined,
  }));
};

interface MenuContextType {
  selectedKey: string;
  openKeys: string[];
  mode: 'horizontal' | 'vertical' | 'inline';
  onSelect: (key: string) => void;
  onToggle: (key: string) => void;
}

const MenuContext = createContext<MenuContextType | null>(null);

// ========== SubMenu Component ==========
interface SubMenuProps {
  item: MenuItemProps;
  level: number;
}

const SubMenu: React.FC<SubMenuProps> = ({ item, level }) => {
  const context = useContext(MenuContext);
  const [hoverOpen, setHoverOpen] = useState(false);
  const subMenuRef = useRef<HTMLLIElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  if (!context) return null;

  const { mode, selectedKey, openKeys, onToggle, onSelect } = context;
  const isOpen = openKeys.includes(item.key) || hoverOpen;
  const isHorizontal = mode === 'horizontal';
  const isInline = mode === 'inline';

  const handleMouseEnter = () => {
    if (!isInline && item.children) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setHoverOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isInline && item.children) {
      timeoutRef.current = setTimeout(() => {
        setHoverOpen(false);
      }, 100);
    }
  };

  const handleClick = () => {
    if (item.disabled) return;
    if (item.children) {
      onToggle(item.key);
    } else {
      onSelect(item.key);
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
      ref={subMenuRef}
      className={`
        nav-menu-submenu
        ${isOpen ? 'nav-menu-submenu-open' : ''}
        ${selectedKey === item.key ? 'nav-menu-item-selected' : ''}
        ${item.disabled ? 'nav-menu-item-disabled' : ''}
        ${item.danger ? 'nav-menu-item-danger' : ''}
      `.trim()}
      role="menuitem"
      aria-haspopup={!!item.children}
      aria-expanded={isOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="nav-menu-item-content"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={item.disabled ? -1 : 0}
        role="button"
      >
        {item.icon && <span className="nav-menu-item-icon">{item.icon}</span>}
        <span className="nav-menu-item-label">{item.label}</span>
        {item.children && (
          <span className={`nav-menu-item-arrow ${isOpen ? 'nav-menu-item-arrow-open' : ''}`}>
            {isHorizontal && level === 0 ? '▼' : '▶'}
          </span>
        )}
      </div>

      {item.children && (
        <ul
          className={`
            nav-menu-submenu-popup
            ${isHorizontal ? 'nav-menu-submenu-popup-horizontal' : 'nav-menu-submenu-popup-vertical'}
            ${isOpen ? 'nav-menu-submenu-popup-visible' : ''}
          `.trim()}
          role="menu"
        >
          {item.children.map((child) =>
            child.divider ? (
              <li key={child.key} className="nav-menu-divider" role="separator" />
            ) : child.children ? (
              <SubMenu key={child.key} item={child} level={level + 1} />
            ) : (
              <MenuItem key={child.key} item={child} />
            )
          )}
        </ul>
      )}
    </li>
  );
};

// ========== MenuItem Component ==========
interface MenuItemSingleProps {
  item: MenuItemProps;
}

const MenuItem: React.FC<MenuItemSingleProps> = ({ item }) => {
  const context = useContext(MenuContext);

  if (!context) return null;

  const { selectedKey, onSelect } = context;

  const handleClick = () => {
    if (item.disabled) return;
    onSelect(item.key);
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
        nav-menu-item
        ${selectedKey === item.key ? 'nav-menu-item-selected' : ''}
        ${item.disabled ? 'nav-menu-item-disabled' : ''}
        ${item.danger ? 'nav-menu-item-danger' : ''}
      `.trim()}
      role="menuitem"
    >
      <div
        className="nav-menu-item-content"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={item.disabled ? -1 : 0}
        role="button"
      >
        {item.icon && <span className="nav-menu-item-icon">{item.icon}</span>}
        <span className="nav-menu-item-label">{item.label}</span>
      </div>
    </li>
  );
};

// ========== Main Menu Component ==========
export const Menu: React.FC<MenuProps> = ({
  items,
  mode = 'vertical',
  defaultSelectedKey = '',
  defaultOpenKeys = [],
  selectedKey: controlledSelectedKey,
  openKeys: controlledOpenKeys,
  onSelect,
  onOpenChange,
  className = '',
  style,
  acrylic = true,
}) => {
  const [internalSelectedKey, setInternalSelectedKey] = useState(defaultSelectedKey);
  const [internalOpenKeys, setInternalOpenKeys] = useState<string[]>(defaultOpenKeys);
  const menuRef = useRef<HTMLUListElement>(null);

  const selectedKey = controlledSelectedKey ?? internalSelectedKey;
  const openKeys = controlledOpenKeys ?? internalOpenKeys;

  const handleSelect = useCallback(
    (key: string) => {
      setInternalSelectedKey(key);
      onSelect?.(key);
    },
    [onSelect]
  );

  const handleToggle = useCallback(
    (key: string) => {
      setInternalOpenKeys((prev) => {
        const newKeys = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
        onOpenChange?.(newKeys);
        return newKeys;
      });
    },
    [onOpenChange]
  );

  // Keyboard navigation
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const focusableItems = menu.querySelectorAll<HTMLElement>(
        '.nav-menu-item:not(.nav-menu-item-disabled) .nav-menu-item-content, .nav-menu-submenu > .nav-menu-item-content'
      );
      const currentIndex = Array.from(focusableItems).findIndex(
        (item) => item === document.activeElement
      );

      let nextIndex: number;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;
          break;
        case 'ArrowRight':
          if (mode === 'horizontal') {
            e.preventDefault();
            nextIndex = currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;
            break;
          }
          return;
        case 'ArrowLeft':
          if (mode === 'horizontal') {
            e.preventDefault();
            nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;
            break;
          }
          return;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = focusableItems.length - 1;
          break;
        default:
          return;
      }

      focusableItems[nextIndex]?.focus();
    };

    menu.addEventListener('keydown', handleKeyDown);
    return () => menu.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  const contextValue: MenuContextType = {
    selectedKey,
    openKeys,
    mode,
    onSelect: handleSelect,
    onToggle: handleToggle,
  };

  // Normalize items to ensure all have keys
  const normalizedItems = normalizeItems(items);

  return (
    <MenuContext.Provider value={contextValue}>
      <ul
        ref={menuRef}
        className={`
          nav-menu
          nav-menu-${mode}
          ${acrylic ? 'nav-menu-acrylic' : ''}
          ${className}
        `.trim()}
        style={style}
        role="menu"
        aria-orientation={mode === 'horizontal' ? 'horizontal' : 'vertical'}
      >
        {normalizedItems.map((item) =>
          item.divider ? (
            <li key={item.key} className="nav-menu-divider" role="separator" />
          ) : item.children ? (
            <SubMenu key={item.key} item={item} level={0} />
          ) : (
            <MenuItem key={item.key} item={item} />
          )
        )}
      </ul>
    </MenuContext.Provider>
  );
};

export default Menu;
