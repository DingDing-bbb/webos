/**
 * Breadcrumb Component - 面包屑组件
 * 支持分隔符自定义、图标支持、下拉菜单集成
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ========== Types ==========
export interface BreadcrumbItem {
  key: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  dropdown?: BreadcrumbDropdownItem[];
}

export interface BreadcrumbDropdownItem {
  key: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  acrylic?: boolean;
  maxItems?: number;
  showDropdownOnEllipsis?: boolean;
}

// ========== Dropdown Component ==========
interface BreadcrumbDropdownProps {
  items: BreadcrumbDropdownItem[];
  isOpen: boolean;
  onClose: () => void;
}

const BreadcrumbDropdown: React.FC<BreadcrumbDropdownProps> = ({
  items,
  isOpen,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ul
      ref={dropdownRef}
      className="nav-breadcrumb-dropdown"
      role="menu"
    >
      {items.map((item) => (
        <li
          key={item.key}
          className={`
            nav-breadcrumb-dropdown-item
            ${item.disabled ? 'nav-breadcrumb-dropdown-item-disabled' : ''}
          `.trim()}
          role="menuitem"
        >
          <a
            href={item.disabled ? undefined : item.href}
            onClick={(e) => {
              if (item.disabled) {
                e.preventDefault();
                return;
              }
              item.onClick?.(e);
              onClose();
            }}
            aria-disabled={item.disabled}
          >
            {item.icon && <span className="nav-breadcrumb-item-icon">{item.icon}</span>}
            <span>{item.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );
};

// ========== Breadcrumb Item Component ==========
interface BreadcrumbItemRenderProps {
  item: BreadcrumbItem;
  isLast: boolean;
  separator: React.ReactNode;
  onDropdownToggle: (key: string) => void;
  openDropdownKey: string | null;
}

const BreadcrumbItemRender: React.FC<BreadcrumbItemRenderProps> = ({
  item,
  isLast,
  separator,
  onDropdownToggle,
  openDropdownKey,
}) => {
  const hasDropdown = item.dropdown && item.dropdown.length > 0;
  const isDropdownOpen = openDropdownKey === item.key;

  const handleClick = (e: React.MouseEvent) => {
    if (hasDropdown) {
      e.preventDefault();
      onDropdownToggle(item.key);
    } else {
      item.onClick?.(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as unknown as React.MouseEvent);
    }
  };

  const content = (
    <>
      {item.icon && <span className="nav-breadcrumb-item-icon">{item.icon}</span>}
      <span className="nav-breadcrumb-item-title">{item.title}</span>
      {hasDropdown && (
        <span className="nav-breadcrumb-dropdown-arrow">▼</span>
      )}
    </>
  );

  return (
    <li className="nav-breadcrumb-item" role="listitem">
      {isLast ? (
        <span className="nav-breadcrumb-link nav-breadcrumb-link-current" aria-current="page">
          {content}
        </span>
      ) : (
        <>
          {item.href ? (
            <a
              className="nav-breadcrumb-link"
              href={item.href}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              aria-haspopup={hasDropdown}
              aria-expanded={isDropdownOpen}
            >
              {content}
            </a>
          ) : (
            <button
              className="nav-breadcrumb-link"
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              aria-haspopup={hasDropdown}
              aria-expanded={isDropdownOpen}
            >
              {content}
            </button>
          )}
          <span className="nav-breadcrumb-separator" aria-hidden="true">
            {separator}
          </span>
        </>
      )}
      {hasDropdown && (
        <BreadcrumbDropdown
          items={item.dropdown!}
          isOpen={isDropdownOpen}
          onClose={() => onDropdownToggle('')}
        />
      )}
    </li>
  );
};

// ========== Main Breadcrumb Component ==========
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = '',
  style,
  acrylic = true,
  maxItems,
  showDropdownOnEllipsis = true,
}) => {
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const handleDropdownToggle = useCallback((key: string) => {
    setOpenDropdownKey((prev) => (prev === key ? null : key));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openDropdownKey) {
        setOpenDropdownKey(null);
      }
    };

    nav.addEventListener('keydown', handleKeyDown);
    return () => nav.removeEventListener('keydown', handleKeyDown);
  }, [openDropdownKey]);

  // Handle ellipsis mode
  const renderItems = () => {
    if (!maxItems || items.length <= maxItems) {
      return items.map((item, index) => (
        <BreadcrumbItemRender
          key={item.key}
          item={item}
          isLast={index === items.length - 1}
          separator={separator}
          onDropdownToggle={handleDropdownToggle}
          openDropdownKey={openDropdownKey}
        />
      ));
    }

    // Show first item, ellipsis, and last (maxItems - 2) items
    const firstItems = items.slice(0, 1);
    const lastItems = items.slice(-(maxItems - 1));
    const hiddenItems = items.slice(1, -(maxItems - 1));

    return (
      <>
        {firstItems.map((item) => (
          <BreadcrumbItemRender
            key={item.key}
            item={item}
            isLast={false}
            separator={separator}
            onDropdownToggle={handleDropdownToggle}
            openDropdownKey={openDropdownKey}
          />
        ))}
        <li className="nav-breadcrumb-item">
          <span className="nav-breadcrumb-ellipsis">...</span>
          <span className="nav-breadcrumb-separator" aria-hidden="true">
            {separator}
          </span>
          {showDropdownOnEllipsis && hiddenItems.length > 0 && (
            <BreadcrumbDropdown
              items={hiddenItems.map((item) => ({
                key: item.key,
                title: item.title,
                icon: item.icon,
                href: item.href,
                onClick: item.onClick,
              }))}
              isOpen={openDropdownKey === '__ellipsis__'}
              onClose={() => setOpenDropdownKey(null)}
            />
          )}
        </li>
        {lastItems.map((item, index) => (
          <BreadcrumbItemRender
            key={item.key}
            item={item}
            isLast={index === lastItems.length - 1}
            separator={separator}
            onDropdownToggle={handleDropdownToggle}
            openDropdownKey={openDropdownKey}
          />
        ))}
      </>
    );
  };

  return (
    <nav
      ref={navRef}
      className={`
        nav-breadcrumb
        ${acrylic ? 'nav-breadcrumb-acrylic' : ''}
        ${className}
      `.trim()}
      style={style}
      aria-label="Breadcrumb"
    >
      <ol className="nav-breadcrumb-list" role="list">
        {renderItems()}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
