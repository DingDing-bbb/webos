/**
 * @fileoverview List Component
 * @module @ui/components/List
 *
 * A flexible list component for displaying collections of items.
 *
 * @example
 * ```tsx
 * import { List, ListItem } from '@ui/components/List';
 *
 * <List divider interactive>
 *   <ListItem
 *     icon={<UserIcon />}
 *     primary="John Doe"
 *     secondary="john@example.com"
 *     selected={selectedId === 1}
 *     onClick={() => setSelectedId(1)}
 *   />
 *   <ListItem
 *     icon={<UserIcon />}
 *     primary="Jane Doe"
 *     secondary="jane@example.com"
 *   />
 * </List>
 * ```
 */

import React, {
  forwardRef,
  createContext,
  useContext,
  useMemo,
} from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type ListSize = 'sm' | 'md' | 'lg';

export interface ListContextValue {
  size: ListSize;
  divider: boolean;
  interactive: boolean;
  disabled: boolean;
}

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** List size */
  size?: ListSize;
  /** Show divider between items */
  divider?: boolean;
  /** Items are interactive (hover/click) */
  interactive?: boolean;
  /** Disable all items */
  disabled?: boolean;
  /** Show border around list */
  bordered?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Children (ListItem components) */
  children?: React.ReactNode;
}

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Primary text content */
  primary?: React.ReactNode;
  /** Secondary text content (subtitle) */
  secondary?: React.ReactNode;
  /** Icon/avatar to display before content */
  icon?: React.ReactNode;
  /** Action element (button, checkbox, etc.) */
  action?: React.ReactNode;
  /** Trailing content (badge, meta) */
  trailing?: React.ReactNode;
  /** Item is selected */
  selected?: boolean;
  /** Item is disabled */
  disabled?: boolean;
  /** Item is clickable */
  clickable?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Children (for nested lists) */
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

const ListContext = createContext<ListContextValue>({
  size: 'md',
  divider: false,
  interactive: false,
  disabled: false,
});

const useListContext = () => useContext(ListContext);

// ============================================================================
// List Component
// ============================================================================

/**
 * List container component for displaying collections.
 */
export const List = forwardRef<HTMLUListElement, ListProps>(
  (
    {
      size = 'md',
      divider = false,
      interactive = false,
      disabled = false,
      bordered = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const contextValue = useMemo<ListContextValue>(
      () => ({ size, divider, interactive, disabled }),
      [size, divider, interactive, disabled]
    );

    return (
      <ListContext.Provider value={contextValue}>
        <ul
          ref={ref}
          className={`list list--${size} ${divider ? 'list--divider' : ''} ${bordered ? 'list--bordered' : ''} ${className}`}
          role="list"
          {...props}
        >
          {children}
        </ul>
      </ListContext.Provider>
    );
  }
);

List.displayName = 'List';

// ============================================================================
// ListItem Component
// ============================================================================

/**
 * Individual list item with icon, text, and action support.
 */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      primary,
      secondary,
      icon,
      action,
      trailing,
      selected = false,
      disabled = false,
      clickable,
      onClick,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const listContext = useListContext();
    const isInteractive = clickable ?? listContext.interactive;
    const isDisabled = disabled || listContext.disabled;
    const hasChildren = React.Children.count(children) > 0;

    const handleClick = () => {
      if (!isDisabled && onClick) {
        onClick();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (isInteractive && !isDisabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick?.();
      }
    };

    return (
      <li
        ref={ref}
        className={`list-item list--${listContext.size} ${isInteractive ? 'list-item--interactive' : ''} ${selected ? 'list-item--selected' : ''} ${isDisabled ? 'list-item--disabled' : ''} ${icon ? 'list-item--with-icon' : ''} ${className}`}
        onClick={isInteractive ? handleClick : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        role={isInteractive ? 'listitem' : undefined}
        tabIndex={isInteractive && !isDisabled ? 0 : undefined}
        aria-selected={selected}
        aria-disabled={isDisabled}
        {...props}
      >
        <div className="list-item__container">
          {icon && <div className="list-item__icon">{icon}</div>}
          <div className="list-item__content">
            {primary && <div className="list-item__primary">{primary}</div>}
            {secondary && <div className="list-item__secondary">{secondary}</div>}
          </div>
          {trailing && <div className="list-item__trailing">{trailing}</div>}
          {action && <div className="list-item__action">{action}</div>}
        </div>
        {hasChildren && (
          <div className="list-item__nested">
            {children}
          </div>
        )}
      </li>
    );
  }
);

ListItem.displayName = 'ListItem';

// ============================================================================
// ListDivider Component
// ============================================================================

export interface ListDividerProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Additional CSS class */
  className?: string;
}

/**
 * Visual divider for list items.
 */
export const ListDivider = forwardRef<HTMLLIElement, ListDividerProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={`list-divider ${className}`}
        role="separator"
        aria-hidden="true"
        {...props}
      />
    );
  }
);

ListDivider.displayName = 'ListDivider';

// ============================================================================
// ListHeader Component
// ============================================================================

export interface ListHeaderProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Header content */
  children: React.ReactNode;
  /** Sticky header */
  sticky?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Header/label for a group of list items.
 */
export const ListHeader = forwardRef<HTMLLIElement, ListHeaderProps>(
  ({ sticky = false, className = '', children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={`list-header ${sticky ? 'list-header--sticky' : ''} ${className}`}
        role="presentation"
        {...props}
      >
        {children}
      </li>
    );
  }
);

ListHeader.displayName = 'ListHeader';

// ============================================================================
// Exports
// ============================================================================

export default List;
