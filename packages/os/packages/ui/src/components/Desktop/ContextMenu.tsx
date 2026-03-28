/**
 * @fileoverview Professional Context Menu Component
 * @module @ui/components/Desktop/ContextMenu
 *
 * A macOS/Windows 11 style context menu with:
 * - Nested submenus
 * - Keyboard shortcuts
 * - Dividers
 * - Smooth animations
 * - Light/dark theme support
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ContextMenuItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Keyboard shortcut */
  shortcut?: string;
  /** Is item disabled */
  disabled?: boolean;
  /** Is this a divider */
  divider?: boolean;
  /** Submenu items */
  submenu?: ContextMenuItem[];
  /** Click handler */
  onClick?: () => void;
}

export interface ContextMenuProps {
  /** Is menu visible */
  isOpen: boolean;
  /** Menu position X */
  x: number;
  /** Menu position Y */
  y: number;
  /** Menu items */
  items: ContextMenuItem[];
  /** Close handler */
  onClose: () => void;
}

// ============================================================================
// Context Menu Item Component
// ============================================================================

interface MenuItemProps {
  item: ContextMenuItem;
  onClose: () => void;
  depth?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onClose, depth = 0 }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const itemRef = useRef<HTMLLIElement>(null);
  const submenuRef = useRef<HTMLUListElement>(null);
  const [submenuPosition, setSubmenuPosition] = useState<'right' | 'left'>('right');

  // Calculate submenu position
  const updateSubmenuPosition = useCallback(() => {
    if (!itemRef.current || !submenuRef.current) return;

    const itemRect = itemRef.current.getBoundingClientRect();
    const submenuRect = submenuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Check if submenu would overflow right edge
    const wouldOverflowRight = itemRect.right + submenuRect.width > viewportWidth;
    setSubmenuPosition(wouldOverflowRight ? 'left' : 'right');

    // Adjust vertical position if needed
    if (submenuRect.bottom > viewportHeight) {
      submenuRef.current.style.top = 'auto';
      submenuRef.current.style.bottom = '0';
    }
  }, []);

  useEffect(() => {
    if (submenuOpen) {
      updateSubmenuPosition();
    }
  }, [submenuOpen, updateSubmenuPosition]);

  // Divider
  if (item.divider) {
    return <li className="os-context-menu-divider" role="separator" />;
  }

  const hasSubmenu = item.submenu && item.submenu.length > 0;

  const handleClick = () => {
    if (item.disabled) return;
    if (hasSubmenu) return;
    item.onClick?.();
    onClose();
  };

  const handleMouseEnter = () => {
    if (hasSubmenu) {
      setSubmenuOpen(true);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!submenuRef.current?.contains(relatedTarget)) {
        setSubmenuOpen(false);
      }
    }
  };

  return (
    <li
      ref={itemRef}
      className={`os-context-menu-item ${item.disabled ? 'disabled' : ''} ${hasSubmenu ? 'has-submenu' : ''}`}
      role="menuitem"
      aria-disabled={item.disabled}
      aria-haspopup={hasSubmenu ? 'menu' : undefined}
      aria-expanded={hasSubmenu ? submenuOpen : undefined}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon */}
      {item.icon && (
        <span className="os-context-menu-icon" aria-hidden="true">
          {item.icon}
        </span>
      )}

      {/* Label */}
      <span className="os-context-menu-label">{item.label}</span>

      {/* Shortcut or Arrow */}
      {item.shortcut && !hasSubmenu && (
        <span className="os-context-menu-shortcut">{item.shortcut}</span>
      )}

      {hasSubmenu && (
        <span className="os-context-menu-arrow" aria-hidden="true">›</span>
      )}

      {/* Submenu */}
      {hasSubmenu && submenuOpen && (
        <ul
          ref={submenuRef}
          className={`os-context-menu os-context-menu-submenu os-context-menu-submenu-${submenuPosition}`}
          role="menu"
          onMouseEnter={() => setSubmenuOpen(true)}
          onMouseLeave={(e) => {
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (!itemRef.current?.contains(relatedTarget)) {
              setSubmenuOpen(false);
            }
          }}
        >
          {item.submenu!.map((subItem, index) => (
            <MenuItem
              key={subItem.id || `submenu-${index}`}
              item={subItem}
              onClose={onClose}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// ============================================================================
// Context Menu Component
// ============================================================================

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  x,
  y,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ x, y });

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 8;
    }
    if (adjustedX < 8) {
      adjustedX = 8;
    }

    // Adjust vertical position
    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 8;
    }
    if (adjustedY < 8) {
      adjustedY = 8;
    }

    setPosition({ x: adjustedX, y: adjustedY });
  }, [isOpen, x, y]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

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

    // Delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ul
      ref={menuRef}
      className="os-context-menu"
      role="menu"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {items.map((item, index) => (
        <MenuItem
          key={item.id || `item-${index}`}
          item={item}
          onClose={onClose}
        />
      ))}
    </ul>
  );
};

// ============================================================================
// Default Icons
// ============================================================================

export const ContextMenuIcons = {
  View: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Sort: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="14" y2="12" />
      <line x1="4" y1="18" x2="8" y2="18" />
    </svg>
  ),
  Refresh: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  NewFolder: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  ),
  NewFile: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  Display: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Personalize: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  Terminal: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  Open: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Properties: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Delete: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Rename: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Copy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Paste: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  Cut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  ),
  LargeIcons: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  SmallIcons: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="5" height="5" />
      <rect x="10" y="3" width="5" height="5" />
      <rect x="17" y="3" width="5" height="5" />
      <rect x="3" y="10" width="5" height="5" />
      <rect x="10" y="10" width="5" height="5" />
      <rect x="17" y="10" width="5" height="5" />
      <rect x="3" y="17" width="5" height="5" />
      <rect x="10" y="17" width="5" height="5" />
      <rect x="17" y="17" width="5" height="5" />
    </svg>
  ),
  List: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Details: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="10" x2="14" y2="10" />
      <line x1="4" y1="14" x2="18" y2="14" />
      <line x1="4" y1="18" x2="10" y2="18" />
    </svg>
  ),
};

export default ContextMenu;
