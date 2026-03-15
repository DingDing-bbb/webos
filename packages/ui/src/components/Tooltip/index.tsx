/**
 * @fileoverview Tooltip Component
 * @module @ui/components/Tooltip
 *
 * A customizable tooltip component with auto-positioning,
 * delay support, and multiple trigger modes.
 *
 * @example
 * ```tsx
 * import { Tooltip } from '@ui/components/Tooltip';
 *
 * <Tooltip content="Helpful information" position="top">
 *   <button>Hover me</button>
 * </Tooltip>
 * ```
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'focus' | 'click';
export type TooltipVariant = 'dark' | 'light';

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Position of tooltip relative to trigger */
  position?: TooltipPosition;
  /** Enable auto-positioning when tooltip overflows viewport */
  autoPosition?: boolean;
  /** Delay before showing tooltip (ms) */
  showDelay?: number;
  /** Delay before hiding tooltip (ms) */
  hideDelay?: number;
  /** Trigger mode */
  trigger?: TooltipTrigger;
  /** Tooltip variant (dark or light) */
  variant?: TooltipVariant;
  /** Show arrow pointer */
  showArrow?: boolean;
  /** Offset from trigger element (px) */
  offset?: number;
  /** Additional class name for tooltip */
  className?: string;
  /** Additional class name for tooltip content */
  tooltipClassName?: string;
  /** Disable tooltip */
  disabled?: boolean;
  /** Children element that triggers the tooltip */
  children: React.ReactElement;
}

interface TooltipState {
  visible: boolean;
  position: TooltipPosition;
}

// ============================================================================
// Utility Functions
// ============================================================================


const getFallbackPositions = (position: TooltipPosition): TooltipPosition[] => {
  const fallbacks: Record<TooltipPosition, TooltipPosition[]> = {
    top: ['bottom', 'left', 'right'],
    bottom: ['top', 'left', 'right'],
    left: ['right', 'top', 'bottom'],
    right: ['left', 'top', 'bottom'],
  };
  return fallbacks[position];
};

// ============================================================================
// Tooltip Component
// ============================================================================

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  autoPosition = true,
  showDelay = 100,
  hideDelay = 100,
  trigger = 'hover',
  variant = 'dark',
  showArrow = true,
  offset = 8,
  className = '',
  tooltipClassName = '',
  disabled = false,
  children,
}) => {
  const [state, setState] = useState<TooltipState>({
    visible: false,
    position,
  });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Calculate the best position based on viewport
  const calculatePosition = useCallback((): TooltipPosition => {
    if (!autoPosition || !triggerRef.current || !tooltipRef.current) {
      return position;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Check if current position fits
    const fitsInViewport = (pos: TooltipPosition): boolean => {
      switch (pos) {
        case 'top':
          return triggerRect.top >= tooltipRect.height + offset;
        case 'bottom':
          return triggerRect.bottom + tooltipRect.height + offset <= viewport.height;
        case 'left':
          return triggerRect.left >= tooltipRect.width + offset;
        case 'right':
          return triggerRect.right + tooltipRect.width + offset <= viewport.width;
        default:
          return true;
      }
    };

    if (fitsInViewport(position)) {
      return position;
    }

    // Try fallback positions
    const fallbacks = getFallbackPositions(position);
    for (const fallback of fallbacks) {
      if (fitsInViewport(fallback)) {
        return fallback;
      }
    }

    return position;
  }, [position, autoPosition, offset]);

  // Show tooltip
  const show = useCallback(() => {
    if (disabled) return;

    clearTimeouts();
    showTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({
        visible: true,
        position: autoPosition ? calculatePosition() : prev.position,
      }));
    }, showDelay);
  }, [disabled, clearTimeouts, showDelay, autoPosition, calculatePosition]);

  // Hide tooltip
  const hide = useCallback(() => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, visible: false }));
    }, hideDelay);
  }, [clearTimeouts, hideDelay]);

  // Toggle tooltip (for click trigger)
  const toggle = useCallback(() => {
    if (state.visible) {
      hide();
    } else {
      show();
    }
  }, [state.visible, show, hide]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape' && state.visible) {
        hide();
      }
    },
    [state.visible, hide]
  );

  // Click outside handler for click trigger
  useEffect(() => {
    if (trigger === 'click' && state.visible) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          tooltipRef.current &&
          !tooltipRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          hide();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [trigger, state.visible, hide]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  // Get trigger event handlers
  const getTriggerProps = (): React.HTMLAttributes<HTMLElement> => {
    const props: React.HTMLAttributes<HTMLElement> = {
      onKeyDown: handleKeyDown,
    };

    if (trigger === 'hover') {
      props.onMouseEnter = show;
      props.onMouseLeave = hide;
      props.onFocus = show;
      props.onBlur = hide;
    } else if (trigger === 'focus') {
      props.onFocus = show;
      props.onBlur = hide;
    } else if (trigger === 'click') {
      props.onClick = toggle;
    }

    return props;
  };

  // Clone child element with trigger props
  const triggerElement = React.cloneElement(children, getTriggerProps());

  if (disabled) {
    return children;
  }

  return (
    <div 
      ref={triggerRef as React.RefObject<HTMLDivElement>}
      className={`tooltip-wrapper ${className}`}
    >
      {triggerElement}
      {state.visible && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip--${state.position} tooltip--${variant} ${showArrow ? 'tooltip--arrow' : ''} ${tooltipClassName}`}
          role="tooltip"
          style={{ '--tooltip-offset': `${offset}px` } as React.CSSProperties}
          onMouseEnter={trigger === 'hover' ? show : undefined}
          onMouseLeave={trigger === 'hover' ? hide : undefined}
        >
          <div className="tooltip__content">{content}</div>
          {showArrow && <div className="tooltip__arrow" />}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// TooltipProvider Component (for global tooltip management)
// ============================================================================

export interface TooltipProviderProps {
  /** Default tooltip variant */
  defaultVariant?: TooltipVariant;
  /** Default show delay */
  defaultShowDelay?: number;
  /** Default hide delay */
  defaultHideDelay?: number;
  /** Children */
  children: React.ReactNode;
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
}) => {
  // Context could be added here for global configuration
  return <>{children}</>;
};

// ============================================================================
// SimpleTooltip Component (for simple use cases)
// ============================================================================

export interface SimpleTooltipProps {
  /** Tooltip text */
  text: string;
  /** Position */
  position?: TooltipPosition;
  /** Children */
  children: React.ReactElement;
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  text,
  position = 'top',
  children,
}) => {
  return (
    <Tooltip content={text} position={position}>
      {children}
    </Tooltip>
  );
};

// ============================================================================
// Exports
// ============================================================================

export default Tooltip;
