/**
 * @fileoverview Tooltip Component
 * @module @ui/feedback/Tooltip
 *
 * Tooltip component for displaying contextual information on hover or focus.
 * Supports multiple directions, triggers, and rich content.
 *
 * @example
 * ```tsx
 * import { Tooltip } from '@webos/ui/feedback';
 *
 * <Tooltip content="This is a tooltip" position="top">
 *   <button>Hover me</button>
 * </Tooltip>
 *
 * <Tooltip
 *   content={<span>Rich <strong>content</strong></span>}
 *   trigger="click"
 * >
 *   <span>Click me</span>
 * </Tooltip>
 * ```
 */

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'focus' | 'click';

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Trigger element */
  children: React.ReactElement;
  /** Tooltip position relative to trigger */
  position?: TooltipPosition;
  /** How tooltip is triggered */
  trigger?: TooltipTrigger;
  /** Delay before showing (ms) */
  showDelay?: number;
  /** Delay before hiding (ms) */
  hideDelay?: number;
  /** Whether tooltip is disabled */
  disabled?: boolean;
  /** Additional class name for tooltip */
  className?: string;
  /** Additional class name for trigger wrapper */
  wrapperClassName?: string;
  /** Offset from trigger (px) */
  offset?: number;
  /** Z-index */
  zIndex?: number;
  /** Whether to show arrow */
  showArrow?: boolean;
}

export interface TooltipRef {
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const Tooltip = forwardRef<TooltipRef, TooltipProps>(
  (
    {
      content,
      children,
      position = 'top',
      trigger = 'hover',
      showDelay = 200,
      hideDelay = 100,
      disabled = false,
      className = '',
      wrapperClassName = '',
      offset = 8,
      zIndex,
      showArrow = true,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate tooltip position
    const calculatePosition = useCallback(() => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          y = triggerRect.top - tooltipRect.height - offset;
          break;
        case 'bottom':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          y = triggerRect.bottom + offset;
          break;
        case 'left':
          x = triggerRect.left - tooltipRect.width - offset;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
        case 'right':
          x = triggerRect.right + offset;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
      }

      // Keep tooltip within viewport
      const padding = 8;
      x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding));
      y = Math.max(padding, Math.min(y, window.innerHeight - tooltipRect.height - padding));

      setCoords({ x, y });
    }, [position, offset]);

    // Show tooltip
    const show = useCallback(() => {
      if (disabled) return;

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, showDelay);
    }, [disabled, showDelay]);

    // Hide tooltip
    const hide = useCallback(() => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }

      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    }, [hideDelay]);

    // Toggle tooltip
    const toggle = useCallback(() => {
      if (isVisible) {
        hide();
      } else {
        show();
      }
    }, [isVisible, show, hide]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      show,
      hide,
      toggle,
    }));

    // Update position when visible
    useEffect(() => {
      if (isVisible) {
        calculatePosition();

        const handleResize = () => calculatePosition();
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleResize, true);

        return () => {
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('scroll', handleResize, true);
        };
      }
    }, [isVisible, calculatePosition]);

    // Handle click outside for click trigger
    useEffect(() => {
      if (trigger === 'click' && isVisible) {
        const handleClickOutside = (e: MouseEvent) => {
          if (
            !triggerRef.current?.contains(e.target as Node) &&
            !tooltipRef.current?.contains(e.target as Node)
          ) {
            hide();
          }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [trigger, isVisible, hide]);

    // Handle escape key for click trigger
    useEffect(() => {
      if (trigger === 'click' && isVisible) {
        const handleEscape = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            hide();
          }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [trigger, isVisible, hide]);

    // Cleanup timeouts on unmount
    useEffect(() => {
      return () => {
        if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      };
    }, []);

    // Event handlers based on trigger
    const getTriggerProps = () => {
      const props: React.HTMLAttributes<HTMLDivElement> = {};

      if (trigger === 'hover' || trigger === 'focus') {
        props.onMouseEnter = show;
        props.onMouseLeave = hide;
        props.onFocus = show;
        props.onBlur = hide;
      }

      if (trigger === 'click') {
        props.onClick = toggle;
      }

      return props;
    };

    // Clone child element with props
    const triggerElement = React.cloneElement(
      children as React.ReactElement<Record<string, unknown>>,
      {
        'aria-describedby': isVisible ? 'tooltip' : undefined,
      }
    );

    return (
      <>
        <div
          ref={triggerRef}
          className={`tooltip-trigger ${wrapperClassName}`}
          {...getTriggerProps()}
        >
          {triggerElement}
        </div>

        {isVisible && (
          <div
            ref={tooltipRef}
            id="tooltip"
            className={`tooltip tooltip--${position} ${showArrow ? 'tooltip--arrow' : ''} ${className}`}
            style={{
              left: coords.x,
              top: coords.y,
              zIndex: zIndex || 'var(--z-tooltip)',
            }}
            role="tooltip"
            aria-hidden={!isVisible}
          >
            <div className="tooltip__content">{content}</div>
            {showArrow && <div className={`tooltip__arrow tooltip__arrow--${position}`} />}
          </div>
        )}
      </>
    );
  }
);

Tooltip.displayName = 'Tooltip';

// ============================================================================
// Simple Tooltip Component
// ============================================================================

export interface SimpleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  className?: string;
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  return (
    <div className="simple-tooltip-wrapper" data-tooltip={content} data-position={position}>
      <div className={`simple-tooltip simple-tooltip--${position} ${className}`}>{content}</div>
      {children}
    </div>
  );
};

export default Tooltip;
