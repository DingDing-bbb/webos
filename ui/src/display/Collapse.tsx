/**
 * @fileoverview Collapse/Accordion Component
 * @module @ui/display/Collapse
 *
 * A collapsible panel component with accordion mode,
 * nested support, and customizable icons.
 *
 * @example
 * ```tsx
 * import { Collapse } from '@webos/ui/display';
 *
 * <Collapse accordion>
 *   <Collapse.Panel key="1" header="Panel 1">
 *     Content of panel 1
 *   </Collapse.Panel>
 *   <Collapse.Panel key="2" header="Panel 2">
 *     Content of panel 2
 *   </Collapse.Panel>
 * </Collapse>
 * ```
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
  forwardRef,
  memo,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export interface CollapseProps {
  /** Active panel keys */
  activeKey?: string | string[];
  /** Default active panel keys */
  defaultActiveKey?: string | string[];
  /** Accordion mode (only one panel open at a time) */
  accordion?: boolean;
  /** Expand icon position */
  expandIconPosition?: 'left' | 'right';
  /** Custom expand icon */
  expandIcon?: React.ReactNode | ((props: { isActive: boolean }) => React.ReactNode);
  /** Border style */
  bordered?: boolean;
  /** Ghost style (no border) */
  ghost?: boolean;
  /** Active key change callback */
  onChange?: (activeKey: string | string[]) => void;
  /** Destroy panel content when collapsed */
  destroyInactivePanel?: boolean;
  /** Children (CollapsePanel components) */
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export interface CollapsePanelProps {
  /** Panel key */
  panelKey: string;
  /** Panel header */
  header: React.ReactNode;
  /** Panel header extra content */
  extra?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Show expand icon */
  showArrow?: boolean;
  /** Force render panel content */
  forceRender?: boolean;
  /** Panel content */
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

interface CollapseContextValue {
  activeKeys: Set<string>;
  accordion: boolean;
  expandIconPosition: 'left' | 'right';
  expandIcon?: CollapseProps['expandIcon'];
  destroyInactivePanel: boolean;
  togglePanel: (key: string) => void;
}

// ============================================================================
// Context
// ============================================================================

const CollapseContext = createContext<CollapseContextValue | null>(null);

const useCollapseContext = () => {
  const context = useContext(CollapseContext);
  if (!context) {
    throw new Error('CollapsePanel must be used within Collapse');
  }
  return context;
};

// ============================================================================
// Expand Icon
// ============================================================================

interface ExpandIconProps {
  isActive: boolean;
  disabled?: boolean;
  position: 'left' | 'right';
  customIcon?: CollapseProps['expandIcon'];
}

const ExpandIcon: React.FC<ExpandIconProps> = ({ isActive, disabled, position, customIcon }) => {
  if (customIcon) {
    if (typeof customIcon === 'function') {
      return (
        <span className={`ui-collapse-arrow ${disabled ? 'disabled' : ''}`}>
          {customIcon({ isActive })}
        </span>
      );
    }
    return <span className={`ui-collapse-arrow ${disabled ? 'disabled' : ''}`}>{customIcon}</span>;
  }

  return (
    <span
      className={`ui-collapse-arrow ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      style={{ order: position === 'right' ? 1 : -1 }}
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </span>
  );
};

// ============================================================================
// Collapse Panel
// ============================================================================

export const CollapsePanel = memo(
  forwardRef<HTMLDivElement, CollapsePanelProps>(
    (
      {
        panelKey,
        header,
        extra,
        disabled = false,
        showArrow = true,
        forceRender = false,
        children,
        className = '',
        style,
      },
      ref
    ) => {
      const contentRef = useRef<HTMLDivElement>(null);
      const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
      const [hasRendered, setHasRendered] = useState(false);

      const {
        activeKeys,
        accordion: _accordion,
        expandIconPosition,
        expandIcon,
        destroyInactivePanel,
        togglePanel,
      } = useCollapseContext();

      const isActive = activeKeys.has(panelKey);

      // Track if content has been rendered at least once
      useEffect(() => {
        if (isActive && !hasRendered) {
          setHasRendered(true);
        }
      }, [isActive, hasRendered]);

      // Animate content height
      useEffect(() => {
        if (contentRef.current) {
          if (isActive) {
            setContentHeight(contentRef.current.scrollHeight);
            // After animation, set to auto for dynamic content
            const timer = setTimeout(() => setContentHeight(undefined), 300);
            return () => clearTimeout(timer);
          } else {
            // Set explicit height first for animation
            setContentHeight(contentRef.current.scrollHeight);
            requestAnimationFrame(() => {
              setContentHeight(0);
            });
          }
        }
      }, [isActive]);

      const handleToggle = () => {
        if (!disabled) {
          togglePanel(panelKey);
        }
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      };

      const shouldRenderContent = isActive || forceRender || (hasRendered && !destroyInactivePanel);

      const panelClasses = [
        'ui-collapse-panel',
        isActive ? 'ui-collapse-panel-active' : '',
        disabled ? 'ui-collapse-panel-disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ');

      const contentStyle: React.CSSProperties = {
        height: isActive
          ? contentHeight !== undefined
            ? contentHeight
            : 'auto'
          : contentHeight !== undefined
            ? contentHeight
            : 0,
        overflow: 'hidden',
        transition: 'height 0.3s ease',
      };

      return (
        <div ref={ref} className={panelClasses} style={style}>
          <div
            className="ui-collapse-header"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-expanded={isActive}
            aria-disabled={disabled}
          >
            {showArrow && (
              <ExpandIcon
                isActive={isActive}
                disabled={disabled}
                position={expandIconPosition}
                customIcon={expandIcon}
              />
            )}
            <span className="ui-collapse-header-text">{header}</span>
            {extra && <span className="ui-collapse-extra">{extra}</span>}
          </div>

          <div className="ui-collapse-content" style={contentStyle}>
            <div ref={contentRef} className="ui-collapse-content-box">
              {shouldRenderContent && children}
            </div>
          </div>
        </div>
      );
    }
  )
);

CollapsePanel.displayName = 'CollapsePanel';

// ============================================================================
// Main Collapse Component
// ============================================================================

export const Collapse: React.FC<CollapseProps> & {
  Panel: typeof CollapsePanel;
} = ({
  activeKey,
  defaultActiveKey,
  accordion = false,
  expandIconPosition = 'left',
  expandIcon,
  bordered = true,
  ghost = false,
  onChange,
  destroyInactivePanel = false,
  children,
  className = '',
  style,
}) => {
  // Initialize active keys
  const getInitialActiveKeys = useCallback((): Set<string> => {
    const keys = activeKey ?? defaultActiveKey;
    if (!keys) return new Set();
    const keyArray = Array.isArray(keys) ? keys : [keys];
    return new Set(accordion && keyArray.length > 0 ? [keyArray[0]] : keyArray);
  }, [activeKey, defaultActiveKey, accordion]);

  const [activeKeys, setActiveKeys] = useState<Set<string>>(getInitialActiveKeys);

  // Sync with controlled activeKey
  useEffect(() => {
    if (activeKey !== undefined) {
      const keyArray = Array.isArray(activeKey) ? activeKey : [activeKey];
      setActiveKeys(new Set(accordion && keyArray.length > 0 ? [keyArray[0]] : keyArray));
    }
  }, [activeKey, accordion]);

  const togglePanel = useCallback(
    (key: string) => {
      setActiveKeys((prevKeys) => {
        const newKeys = new Set(prevKeys);

        if (accordion) {
          if (newKeys.has(key)) {
            newKeys.clear();
          } else {
            newKeys.clear();
            newKeys.add(key);
          }
        } else {
          if (newKeys.has(key)) {
            newKeys.delete(key);
          } else {
            newKeys.add(key);
          }
        }

        // Call onChange callback
        const newActiveKey = accordion ? Array.from(newKeys)[0] || '' : Array.from(newKeys);
        onChange?.(newActiveKey);

        return newKeys;
      });
    },
    [accordion, onChange]
  );

  const contextValue: CollapseContextValue = {
    activeKeys,
    accordion,
    expandIconPosition,
    expandIcon,
    destroyInactivePanel,
    togglePanel,
  };

  const collapseClasses = [
    'ui-collapse',
    bordered && !ghost ? 'ui-collapse-bordered' : '',
    ghost ? 'ui-collapse-ghost' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <CollapseContext.Provider value={contextValue}>
      <div className={collapseClasses} style={style}>
        {children}
      </div>
    </CollapseContext.Provider>
  );
};

Collapse.Panel = CollapsePanel;

// ============================================================================
// Nested Collapse Support
// ============================================================================

export interface NestedCollapseProps extends CollapseProps {
  /** Nesting level (for styling) */
  level?: number;
}

export const NestedCollapse: React.FC<NestedCollapseProps> = ({
  level = 1,
  className = '',
  ...props
}) => {
  return (
    <Collapse {...props} className={`ui-collapse-nested ui-collapse-level-${level} ${className}`} />
  );
};

export default Collapse;
