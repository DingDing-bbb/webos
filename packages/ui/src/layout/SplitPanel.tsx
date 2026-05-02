/**
 * @fileoverview SplitPanel Component - Resizable Split Layout
 * @module @ui/layout/SplitPanel
 *
 * A resizable split panel layout with draggable splitter.
 * Supports horizontal/vertical split, collapse functionality.
 *
 * @example
 * ```tsx
 * import { SplitPanel, SplitPanelItem } from '@webos/ui/layout';
 *
 * // Basic horizontal split
 * <SplitPanel direction="horizontal" defaultSplit={30}>
 *   <SplitPanelItem minSize={100}>Left sidebar</SplitPanelItem>
 *   <SplitPanelItem auto>Main content</SplitPanelItem>
 * </SplitPanel>
 *
 * // With collapsible panels
 * <SplitPanel direction="vertical" collapsible>
 *   <SplitPanelItem collapsible defaultCollapsed={false}>
 *     Header
 *   </SplitPanelItem>
 *   <SplitPanelItem auto>Content</SplitPanelItem>
 * </SplitPanel>
 *
 * // Controlled mode
 * <SplitPanel
 *   split={splitValue}
 *   onSplitChange={setSplitValue}
 * >
 *   <SplitPanelItem>Panel A</SplitPanelItem>
 *   <SplitPanelItem>Panel B</SplitPanelItem>
 * </SplitPanel>
 * ```
 */

import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useImperativeHandle,
} from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Split direction
 */
export type SplitDirection = 'horizontal' | 'vertical';

/**
 * SplitPanel component props
 */
export interface SplitPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Split direction */
  direction?: SplitDirection;
  /** Initial split percentage (0-100) for first panel */
  defaultSplit?: number;
  /** Controlled split percentage */
  split?: number;
  /** Callback when split changes */
  onSplitChange?: (value: number) => void;
  /** Minimum size for first panel (px or %) */
  minSize?: number | string;
  /** Maximum size for first panel (px or %) */
  maxSize?: number | string;
  /** Enable collapse functionality */
  collapsible?: boolean;
  /** Collapsed state for first panel */
  collapsed?: boolean;
  /** Callback when collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Show collapse button */
  showCollapseButton?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Children content (should be exactly 2 SplitPanelItem) */
  children?: React.ReactNode;
  /** Test id for testing */
  testId?: string;
}

/**
 * SplitPanelItem component props
 */
export interface SplitPanelItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Auto-size (takes remaining space) */
  auto?: boolean;
  /** Minimum size in pixels */
  minSize?: number;
  /** Maximum size in pixels */
  maxSize?: number;
  /** Initial size (only for first item) */
  initialSize?: number | string;
  /** Collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Collapsed size in pixels */
  collapsedSize?: number;
  /** Additional CSS class names */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
}

/**
 * SplitPanel ref handle
 */
export interface SplitPanelHandle {
  /** Get current split value */
  getSplit: () => number;
  /** Set split value */
  setSplit: (value: number) => void;
  /** Collapse first panel */
  collapse: () => void;
  /** Expand first panel */
  expand: () => void;
  /** Toggle collapse state */
  toggle: () => void;
}

// ============================================================================
// Icons
// ============================================================================

const ChevronLeftIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ============================================================================
// SplitPanel Component
// ============================================================================

/**
 * SplitPanel - A resizable split layout container
 *
 * Features:
 * - Horizontal/vertical split
 * - Draggable splitter
 * - Collapse support
 * - Min/max size constraints
 * - Keyboard accessible
 *
 * @param {SplitPanelProps} props - Component props
 * @returns {JSX.Element} SplitPanel element
 */
export const SplitPanel = forwardRef<SplitPanelHandle, SplitPanelProps>(
  (
    {
      direction = 'horizontal',
      defaultSplit = 50,
      split: controlledSplit,
      onSplitChange,
      minSize = 50,
      maxSize = '80%',
      collapsible = false,
      collapsed: controlledCollapsed,
      onCollapseChange,
      showCollapseButton = true,
      className = '',
      children,
      testId,
      style: propStyle,
      ...rest
    },
    ref
  ) => {
    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const splitterRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    // State
    const [internalSplit, setInternalSplit] = useState(defaultSplit);
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [isDraggingState, setIsDraggingState] = useState(false);

    // Current values (controlled or uncontrolled)
    const currentSplit = controlledSplit !== undefined ? controlledSplit : internalSplit;
    const currentCollapsed =
      controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

    // Parse size constraints
    const parsedMinSize = useMemo(() => {
      if (typeof minSize === 'number') return minSize;
      if (minSize.endsWith('%')) {
        return parseInt(minSize, 10);
      }
      return parseInt(minSize, 10);
    }, [minSize]);

    const parsedMaxSize = useMemo(() => {
      if (typeof maxSize === 'number') return maxSize;
      if (maxSize.endsWith('%')) {
        return parseInt(maxSize, 10);
      }
      return parseInt(maxSize, 10);
    }, [maxSize]);

    // Update split
    const updateSplit = useCallback(
      (newSplit: number) => {
        // Clamp to min/max
        const clampedSplit = Math.max(parsedMinSize, Math.min(parsedMaxSize, newSplit));

        if (controlledSplit === undefined) {
          setInternalSplit(clampedSplit);
        }
        onSplitChange?.(clampedSplit);
      },
      [controlledSplit, onSplitChange, parsedMinSize, parsedMaxSize]
    );

    // Toggle collapse
    const toggleCollapse = useCallback(() => {
      const newCollapsed = !currentCollapsed;

      if (controlledCollapsed === undefined) {
        setInternalCollapsed(newCollapsed);
      }
      onCollapseChange?.(newCollapsed);
    }, [currentCollapsed, controlledCollapsed, onCollapseChange]);

    // Collapse
    const collapse = useCallback(() => {
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(true);
      }
      onCollapseChange?.(true);
    }, [controlledCollapsed, onCollapseChange]);

    // Expand
    const expand = useCallback(() => {
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(false);
      }
      onCollapseChange?.(false);
    }, [controlledCollapsed, onCollapseChange]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getSplit: () => currentSplit,
        setSplit: updateSplit,
        collapse,
        expand,
        toggle: toggleCollapse,
      }),
      [currentSplit, updateSplit, collapse, expand, toggleCollapse]
    );

    // Mouse handlers for dragging
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (currentCollapsed) return;

        e.preventDefault();
        isDragging.current = true;
        setIsDraggingState(true);
        document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';
      },
      [currentCollapsed, direction]
    );

    // Global mouse move and up handlers
    useEffect(() => {
      if (!isDragging.current) return;

      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        let newSplit: number;
        if (direction === 'horizontal') {
          newSplit = ((e.clientX - rect.left) / rect.width) * 100;
        } else {
          newSplit = ((e.clientY - rect.top) / rect.height) * 100;
        }

        updateSplit(newSplit);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        setIsDraggingState(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [direction, updateSplit]);

    // Keyboard support
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (currentCollapsed) return;

        const step = 5; // 5% step
        let newSplit = currentSplit;

        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowUp':
            if (direction === 'horizontal' || direction === 'vertical') {
              newSplit = currentSplit - step;
            }
            break;
          case 'ArrowRight':
          case 'ArrowDown':
            if (direction === 'horizontal' || direction === 'vertical') {
              newSplit = currentSplit + step;
            }
            break;
          case 'Home':
            newSplit = parsedMinSize;
            break;
          case 'End':
            newSplit = parsedMaxSize as number;
            break;
          case 'Enter':
          case ' ':
            toggleCollapse();
            return;
          default:
            return;
        }

        e.preventDefault();
        updateSplit(newSplit);
      },
      [
        currentSplit,
        currentCollapsed,
        direction,
        parsedMinSize,
        parsedMaxSize,
        toggleCollapse,
        updateSplit,
      ]
    );

    // Generate class names
    const classNames = useMemo(() => {
      const classes = ['layout-split', `layout-split--${direction}`];
      return classes.join(' ');
    }, [direction]);

    // Generate styles
    const styles = useMemo(() => {
      const style: React.CSSProperties = { ...propStyle };
      return style;
    }, [propStyle]);

    // Panel sizes
    const panelStyles = useMemo(() => {
      if (currentCollapsed) {
        return {
          first: { flex: '0 0 0px', overflow: 'hidden' },
          second: { flex: '1' },
        };
      }

      return {
        first: { flex: `0 0 ${currentSplit}%` },
        second: { flex: '1' },
      };
    }, [currentSplit, currentCollapsed]);

    // Render children
    const childArray = React.Children.toArray(children);
    const firstChild = childArray[0] as React.ReactElement<SplitPanelItemProps> | undefined;
    const secondChild = childArray[1] as React.ReactElement<SplitPanelItemProps> | undefined;

    return (
      <div
        ref={containerRef}
        className={`${classNames}${className ? ` ${className}` : ''}`}
        style={styles}
        data-testid={testId}
        {...rest}
      >
        {/* First Panel */}
        <div
          className={`layout-split__panel${currentCollapsed ? ' layout-split__panel--collapsed' : ''}`}
          style={panelStyles.first}
        >
          {firstChild}
        </div>

        {/* Splitter */}
        <div
          ref={splitterRef}
          className={`layout-split__splitter${isDraggingState ? ' layout-split__splitter--dragging' : ''}${currentCollapsed ? ' layout-split__splitter--collapsed' : ''}`}
          onMouseDown={handleMouseDown}
          onKeyDown={handleKeyDown}
          role="separator"
          aria-valuenow={currentSplit}
          aria-valuemin={parsedMinSize}
          aria-valuemax={parsedMaxSize}
          tabIndex={0}
        >
          {showCollapseButton && collapsible && (
            <button
              className="layout-split__collapse-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse();
              }}
              aria-label={currentCollapsed ? 'Expand' : 'Collapse'}
            >
              {direction === 'horizontal' ? (
                currentCollapsed ? (
                  <ChevronRightIcon />
                ) : (
                  <ChevronLeftIcon />
                )
              ) : currentCollapsed ? (
                <ChevronDownIcon />
              ) : (
                <ChevronUpIcon />
              )}
            </button>
          )}
        </div>

        {/* Second Panel */}
        <div className="layout-split__panel layout-split__panel--auto" style={panelStyles.second}>
          {secondChild}
        </div>
      </div>
    );
  }
);

SplitPanel.displayName = 'SplitPanel';

// ============================================================================
// SplitPanelItem Component
// ============================================================================

/**
 * SplitPanelItem - A child panel of SplitPanel
 *
 * @param {SplitPanelItemProps} props - Component props
 * @returns {JSX.Element} Panel item element
 */
export const SplitPanelItem = forwardRef<HTMLDivElement, SplitPanelItemProps>(
  (
    {
      auto = false,
      minSize,
      maxSize,
      initialSize: _initialSize,
      collapsible: _collapsible = false,
      defaultCollapsed: _defaultCollapsed = false,
      collapsedSize: _collapsedSize = 0,
      className = '',
      children,
      style: propStyle,
      ...rest
    },
    ref
  ) => {
    // Generate styles
    const styles = useMemo(() => {
      const style: React.CSSProperties = { ...propStyle };

      if (minSize !== undefined) {
        style.minWidth = `${minSize}px`;
      }
      if (maxSize !== undefined) {
        style.maxWidth = `${maxSize}px`;
      }

      return style;
    }, [minSize, maxSize, propStyle]);

    // Generate class names
    const classNames = useMemo(() => {
      const classes = ['layout-split__panel'];
      if (auto) {
        classes.push('layout-split__panel--auto');
      }
      return classes.join(' ');
    }, [auto]);

    return (
      <div
        ref={ref}
        className={`${classNames}${className ? ` ${className}` : ''}`}
        style={styles}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

SplitPanelItem.displayName = 'SplitPanelItem';

// ============================================================================
// Exports
// ============================================================================

export default SplitPanel;
