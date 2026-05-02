/**
 * Dropdown Component - 下拉菜单组件
 * 支持触发方式 hover/click、位置 top/bottom/left/right、动画效果
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  cloneElement,
  isValidElement,
} from 'react';

// ========== Types ==========
export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  items: DropdownItem[];
  trigger?: 'hover' | 'click' | 'contextMenu';
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  acrylic?: boolean;
  children: React.ReactElement;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (key: string, item: DropdownItem) => void;
  arrow?: boolean;
  offset?: number;
  animation?: 'none' | 'fade' | 'scale' | 'slide';
}

interface PositionState {
  top: number;
  left: number;
  transformOrigin: string;
}

// ========== Main Dropdown Component ==========
export const Dropdown: React.FC<DropdownProps> = ({
  items,
  trigger = 'hover',
  position = 'bottom',
  align = 'start',
  disabled = false,
  className = '',
  style,
  acrylic = true,
  children,
  onOpenChange,
  onSelect,
  arrow = false,
  offset = 4,
  animation = 'scale',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positionState, setPositionState] = useState<PositionState>({
    top: 0,
    left: 0,
    transformOrigin: 'top left',
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  // Calculate dropdown position
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !dropdownRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;
    let transformOrigin = '';

    // Calculate position based on placement
    switch (position) {
      case 'bottom':
        top = triggerRect.bottom + offset;
        transformOrigin = 'top';
        break;
      case 'top':
        top = triggerRect.top - dropdownRect.height - offset;
        transformOrigin = 'bottom';
        break;
      case 'left':
        left = triggerRect.left - dropdownRect.width - offset;
        transformOrigin = 'right';
        break;
      case 'right':
        left = triggerRect.right + offset;
        transformOrigin = 'left';
        break;
    }

    // Calculate alignment
    if (position === 'bottom' || position === 'top') {
      switch (align) {
        case 'start':
          left = triggerRect.left;
          break;
        case 'center':
          left = triggerRect.left + (triggerRect.width - dropdownRect.width) / 2;
          break;
        case 'end':
          left = triggerRect.right - dropdownRect.width;
          break;
      }
      transformOrigin += align === 'center' ? ' center' : ` ${align === 'end' ? 'right' : 'left'}`;
    } else {
      switch (align) {
        case 'start':
          top = triggerRect.top;
          break;
        case 'center':
          top = triggerRect.top + (triggerRect.height - dropdownRect.height) / 2;
          break;
        case 'end':
          top = triggerRect.bottom - dropdownRect.height;
          break;
      }
      transformOrigin = `${align === 'end' ? 'bottom' : align === 'center' ? 'center' : 'top'} ${transformOrigin}`;
    }

    // Adjust for viewport overflow
    if (left < 0) {
      left = offset;
    } else if (left + dropdownRect.width > viewportWidth) {
      left = viewportWidth - dropdownRect.width - offset;
    }

    if (top < 0) {
      top = offset;
    } else if (top + dropdownRect.height > viewportHeight) {
      top = viewportHeight - dropdownRect.height - offset;
    }

    setPositionState({ top, left, transformOrigin });
  }, [isOpen, position, align, offset]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    onOpenChange?.(true);
  }, [disabled, onOpenChange]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [isOpen, handleOpen, handleClose]);

  const handleItemClick = useCallback(
    (item: DropdownItem) => {
      if (item.disabled) return;
      item.onClick?.();
      onSelect?.(item.key, item);
      handleClose();
    },
    [onSelect, handleClose]
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      handleClose();
    };

    if (isOpen && trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, trigger, handleClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  // Hover trigger handlers
  const handleMouseEnter = () => {
    if (trigger !== 'hover') return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    handleOpen();
  };

  const handleMouseLeave = () => {
    if (trigger !== 'hover') return;
    hoverTimeoutRef.current = setTimeout(() => {
      handleClose();
    }, 100);
  };

  // Context menu trigger
  const handleContextMenu = (e: React.MouseEvent) => {
    if (trigger !== 'contextMenu') return;
    e.preventDefault();
    handleToggle();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const focusableItems = dropdownRef.current?.querySelectorAll<HTMLElement>(
        '.nav-dropdown-item:not(.nav-dropdown-item-disabled) .nav-dropdown-item-content'
      );
      if (!focusableItems?.length) return;

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

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Clone child element with event handlers
  const triggerElement = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        onClick: (e: React.MouseEvent) => {
          (children.props as any).onClick?.(e);
          if (trigger === 'click') handleToggle();
        },
        onContextMenu: handleContextMenu,
        'aria-expanded': isOpen,
        'aria-haspopup': 'menu',
      })
    : children;

  return (
    <div
      ref={triggerRef}
      className={`nav-dropdown-wrapper ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {triggerElement}

      {isOpen && (
        <ul
          ref={dropdownRef}
          className={`
            nav-dropdown
            nav-dropdown-${position}
            nav-dropdown-align-${align}
            ${acrylic ? 'nav-dropdown-acrylic' : ''}
            ${arrow ? 'nav-dropdown-arrow' : ''}
            nav-dropdown-animation-${animation}
          `.trim()}
          style={{
            position: 'fixed',
            top: positionState.top,
            left: positionState.left,
            transformOrigin: positionState.transformOrigin,
          }}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item) =>
            item.divider ? (
              <li key={item.key} className="nav-dropdown-divider" role="separator" />
            ) : (
              <li
                key={item.key}
                className={`
                  nav-dropdown-item
                  ${item.disabled ? 'nav-dropdown-item-disabled' : ''}
                  ${item.danger ? 'nav-dropdown-item-danger' : ''}
                `.trim()}
                role="menuitem"
              >
                <div
                  className="nav-dropdown-item-content"
                  onClick={() => handleItemClick(item)}
                  tabIndex={item.disabled ? -1 : 0}
                  role="button"
                >
                  {item.icon && <span className="nav-dropdown-item-icon">{item.icon}</span>}
                  <span className="nav-dropdown-item-label">{item.label}</span>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
};

// ========== Dropdown Button Component ==========
export interface DropdownButtonProps extends Omit<DropdownProps, 'children'> {
  label: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({
  label,
  icon,
  loading = false,
  ...props
}) => {
  return (
    <Dropdown {...props}>
      <button className="nav-dropdown-button" disabled={props.disabled || loading}>
        {loading ? (
          <span className="nav-dropdown-button-loading">⟳</span>
        ) : (
          <>
            {icon && <span className="nav-dropdown-button-icon">{icon}</span>}
            <span>{label}</span>
            <span className="nav-dropdown-button-arrow">▼</span>
          </>
        )}
      </button>
    </Dropdown>
  );
};

export default Dropdown;
