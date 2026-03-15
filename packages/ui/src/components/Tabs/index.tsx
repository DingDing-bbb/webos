/**
 * @fileoverview Tabs Component
 * @module @ui/components/Tabs
 *
 * A tabbed interface component with keyboard navigation and accessibility.
 *
 * @example
 * ```tsx
 * import { Tabs, TabList, Tab, TabPanel } from '@ui/components/Tabs';
 *
 * <Tabs defaultIndex={0}>
 *   <TabList>
 *     <Tab>Overview</Tab>
 *     <Tab>Details</Tab>
 *     <Tab disabled>Settings</Tab>
 *   </TabList>
 *   <TabPanel>
 *     <p>Overview content...</p>
 *   </TabPanel>
 *   <TabPanel>
 *     <p>Details content...</p>
 *   </TabPanel>
 *   <TabPanel>
 *     <p>Settings content...</p>
 *   </TabPanel>
 * </Tabs>
 * ```
 */

import React, {
  forwardRef,
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  Children,
  isValidElement,
  cloneElement,
} from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type TabsVariant = 'line' | 'enclosed' | 'solid';

export interface TabsContextValue {
  activeIndex: number;
  onChange: (index: number) => void;
  variant: TabsVariant;
  disabled: boolean;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Default active tab index */
  defaultIndex?: number;
  /** Controlled active tab index */
  index?: number;
  /** Tab change callback */
  onChange?: (index: number) => void;
  /** Visual variant */
  variant?: TabsVariant;
  /** Disable all tabs */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Children (TabList and TabPanels) */
  children: React.ReactNode;
}

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS class */
  className?: string;
  /** Children (Tab components) */
  children: React.ReactNode;
}

export interface TabProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  /** Tab is disabled */
  disabled?: boolean;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Badge/count */
  badge?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

const TabsContext = createContext<TabsContextValue>({
  activeIndex: 0,
  onChange: () => {},
  variant: 'line',
  disabled: false,
});

const useTabsContext = () => useContext(TabsContext);

// ============================================================================
// Tabs Component
// ============================================================================

/**
 * Tabs container component managing tab state.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      defaultIndex = 0,
      index: controlledIndex,
      onChange,
      variant = 'line',
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const [internalIndex, setInternalIndex] = useState(defaultIndex);
    const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

    const handleChange = useCallback(
      (newIndex: number) => {
        if (controlledIndex === undefined) {
          setInternalIndex(newIndex);
        }
        onChange?.(newIndex);
      },
      [controlledIndex, onChange]
    );

    const contextValue = useMemo<TabsContextValue>(
      () => ({
        activeIndex,
        onChange: handleChange,
        variant,
        disabled,
      }),
      [activeIndex, handleChange, variant, disabled]
    );

    // Clone children to inject index prop
    let tabIndex = 0;
    let panelIndex = 0;

    const enhancedChildren = Children.map(children, (child) => {
      if (isValidElement(child)) {
        if (child.type === TabList) {
          // Inject index to Tab children
          const childProps = child.props as { children?: React.ReactNode };
          const tabListChildren = Children.map(childProps.children, (tabChild) => {
            if (isValidElement(tabChild) && tabChild.type === Tab) {
              const currentIndex = tabIndex++;
              return cloneElement(tabChild as React.ReactElement<{ index?: number }>, {
                index: currentIndex,
              });
            }
            return tabChild;
          });
          return cloneElement(child as React.ReactElement<{ children?: React.ReactNode }>, {
            children: tabListChildren,
          });
        }
        if (child.type === TabPanel) {
          const currentIndex = panelIndex++;
          return cloneElement(child as React.ReactElement<{ index?: number }>, {
            index: currentIndex,
          });
        }
      }
      return child;
    });

    return (
      <TabsContext.Provider value={contextValue}>
        <div ref={ref} className={`tabs tabs--${variant} ${className}`} {...props}>
          {enhancedChildren}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

// ============================================================================
// TabList Component
// ============================================================================

/**
 * Container for tab buttons.
 */
export const TabList = forwardRef<HTMLDivElement, TabListProps>(
  ({ className = '', children, ...props }, ref) => {
    const { variant } = useTabsContext();

    const handleKeyDown = (e: React.KeyboardEvent) => {
      const tabs = Array.from(
        (e.currentTarget as HTMLElement).querySelectorAll('[role="tab"]:not([disabled])')
      );
      const currentIndex = tabs.findIndex(
        (tab) => tab === document.activeElement
      );

      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowLeft':
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          break;
        case 'ArrowRight':
          newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = tabs.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      (tabs[newIndex] as HTMLElement).focus();
    };

    return (
      <div
        ref={ref}
        className={`tabs__list tabs__list--${variant} ${className}`}
        role="tablist"
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabList.displayName = 'TabList';

// ============================================================================
// Tab Component
// ============================================================================

/**
 * Individual tab button.
 */
export const Tab = forwardRef<HTMLButtonElement, TabProps & { index?: number }>(
  (
    {
      index = 0,
      disabled = false,
      icon,
      badge,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const { activeIndex, onChange, variant, disabled: tabsDisabled } = useTabsContext();
    const isSelected = activeIndex === index;
    const isDisabled = disabled || tabsDisabled;

    const handleClick = () => {
      if (!isDisabled) {
        onChange(index);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        className={`tabs__tab tabs__tab--${variant} ${isSelected ? 'tabs__tab--active' : ''} ${isDisabled ? 'tabs__tab--disabled' : ''} ${className}`}
        role="tab"
        aria-selected={isSelected}
        aria-disabled={isDisabled}
        tabIndex={isSelected ? 0 : -1}
        onClick={handleClick}
        disabled={isDisabled}
        {...props}
      >
        {icon && <span className="tabs__tab-icon">{icon}</span>}
        {children && <span className="tabs__tab-content">{children}</span>}
        {badge && <span className="tabs__tab-badge">{badge}</span>}
      </button>
    );
  }
);

Tab.displayName = 'Tab';

// ============================================================================
// TabPanel Component
// ============================================================================

/**
 * Content panel for a tab.
 */
export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps & { index?: number }>(
  ({ index = 0, className = '', children, ...props }, ref) => {
    const { activeIndex } = useTabsContext();
    const isSelected = activeIndex === index;

    if (!isSelected) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={`tabs__panel ${className}`}
        role="tabpanel"
        tabIndex={0}
        aria-hidden={!isSelected}
        hidden={!isSelected}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabPanel.displayName = 'TabPanel';

// ============================================================================
// TabPanels Component (Optional Helper)
// ============================================================================

export interface TabPanelsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS class */
  className?: string;
  /** Children (TabPanel components) */
  children: React.ReactNode;
}

/**
 * Container for tab panels.
 */
export const TabPanels = forwardRef<HTMLDivElement, TabPanelsProps>(
  ({ className = '', children, ...props }, ref) => {
    // Clone children to inject index prop
    let panelIndex = 0;
    const enhancedChildren = Children.map(children, (child) => {
      if (isValidElement(child) && child.type === TabPanel) {
        const currentIndex = panelIndex++;
        return cloneElement(child as React.ReactElement<{ index?: number }>, {
          index: currentIndex,
        });
      }
      return child;
    });

    return (
      <div ref={ref} className={`tabs__panels ${className}`} {...props}>
        {enhancedChildren}
      </div>
    );
  }
);

TabPanels.displayName = 'TabPanels';

// ============================================================================
// Exports
// ============================================================================

export default Tabs;
