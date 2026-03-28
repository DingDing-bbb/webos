/**
 * @fileoverview Context Menu Component
 * @module @ui/desktop/ContextMenu
 *
 * A professional context menu with:
 * - Multi-level submenus
 * - Dividers
 * - Icon support
 * - Keyboard navigation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ContextMenuItem {
  /** Unique item ID */
  id: string;
  /** Display label */
  label: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Keyboard shortcut */
  shortcut?: string;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether this is a divider */
  divider?: boolean;
  /** Submenu items */
  submenu?: ContextMenuItem[];
  /** Click handler */
  onClick?: () => void;
}

export interface ContextMenuProps {
  /** Menu position X */
  x: number;
  /** Menu position Y */
  y: number;
  /** Menu items */
  items: ContextMenuItem[];
  /** Called when menu closes */
  onClose: () => void;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Submenu Component
// ============================================================================

interface SubMenuProps {
  items: ContextMenuItem[];
  onClose: () => void;
  position: 'left' | 'right';
  parentRef: React.RefObject<HTMLDivElement>;
}

const SubMenu: React.FC<SubMenuProps> = ({ items, onClose, position, parentRef }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Position submenu
    if (menuRef.current && parentRef.current) {
      const rect = menuRef.current.getBoundingClientRect();

      if (position === 'right') {
        if (rect.right > window.innerWidth) {
          menuRef.current.style.left = 'auto';
          menuRef.current.style.right = '100%';
        }
      } else {
        if (rect.left < 0) {
          menuRef.current.style.left = '100%';
          menuRef.current.style.right = 'auto';
        }
      }

      if (rect.bottom > window.innerHeight) {
        menuRef.current.style.top = 'auto';
        menuRef.current.style.bottom = '0';
      }
    }
  }, [position, parentRef]);

  return (
    <div ref={menuRef} className="desktop-context-menu submenu">
      <div className="desktop-context-menu-acrylic" />
      {items.map((item, index) => {
        if (item.divider) {
          return <div key={`divider-${index}`} className="desktop-context-menu-divider" />;
        }

        return (
          <ContextMenuItemComponent
            key={item.id}
            item={item}
            onClose={onClose}
            isSubmenu
          />
        );
      })}
    </div>
  );
};

// ============================================================================
// Menu Item Component
// ============================================================================

interface ContextMenuItemComponentProps {
  item: ContextMenuItem;
  onClose: () => void;
  isSubmenu?: boolean;
}

const ContextMenuItemComponent: React.FC<ContextMenuItemComponentProps> = ({
  item,
  onClose,
  isSubmenu: _isSubmenu = false,
}) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    if (item.disabled) return;
    if (item.submenu) return;

    item.onClick?.();
    onClose();
  }, [item, onClose]);

  const handleMouseEnter = useCallback(() => {
    if (item.submenu) {
      setShowSubmenu(true);
    }
  }, [item.submenu]);

  const handleMouseLeave = useCallback(() => {
    setShowSubmenu(false);
  }, []);

  return (
    <div
      ref={itemRef}
      className={`desktop-context-menu-item ${item.disabled ? 'disabled' : ''} ${item.submenu ? 'has-submenu' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="menuitem"
      aria-disabled={item.disabled}
    >
      {/* Icon */}
      {item.icon && <span className="desktop-context-menu-icon">{item.icon}</span>}

      {/* Label */}
      <span className="desktop-context-menu-label">{item.label}</span>

      {/* Shortcut */}
      {item.shortcut && (
        <span className="desktop-context-menu-shortcut">{item.shortcut}</span>
      )}

      {/* Submenu Arrow */}
      {item.submenu && (
        <span className="desktop-context-menu-arrow">▶</span>
      )}

      {/* Submenu */}
      {showSubmenu && item.submenu && (
        <SubMenu
          items={item.submenu}
          onClose={onClose}
          position="right"
          parentRef={itemRef}
        />
      )}
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  items,
  onClose,
  className = '',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  // ========================================
  // Effects
  // ========================================

  // Adjust position if menu goes off screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      let newX = x;
      let newY = y;

      if (rect.right > window.innerWidth) {
        newX = window.innerWidth - rect.width - 10;
      }
      if (rect.bottom > window.innerHeight) {
        newY = window.innerHeight - rect.height - 10;
      }
      if (rect.left < 0) {
        newX = 10;
      }
      if (rect.top < 0) {
        newY = 10;
      }

      setPosition({ x: newX, y: newY });
    }
  }, [x, y]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // ========================================
  // Render
  // ========================================
  return (
    <div
      ref={menuRef}
      className={`desktop-context-menu ${className}`}
      style={{
        left: position.x,
        top: position.y,
      }}
      role="menu"
    >
      {/* Acrylic Background */}
      <div className="desktop-context-menu-acrylic" />

      {/* Menu Items */}
      {items.map((item, index) => {
        if (item.divider) {
          return <div key={`divider-${index}`} className="desktop-context-menu-divider" />;
        }

        return (
          <ContextMenuItemComponent
            key={item.id}
            item={item}
            onClose={onClose}
          />
        );
      })}
    </div>
  );
};

export default ContextMenu;
