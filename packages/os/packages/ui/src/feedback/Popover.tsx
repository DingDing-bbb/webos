/**
 * @fileoverview Popover Component
 * @module @ui/feedback/Popover
 *
 * Popover card component for displaying floating content triggered by
 * click or hover. Supports nested content and positioning.
 *
 * @example
 * ```tsx
 * import { Popover } from '@ui/feedback';
 *
 * <Popover
 *   trigger="click"
 *   content={
 *     <div>
 *       <h4>Popover Title</h4>
 *       <p>Popover content goes here</p>
 *       <button onClick={() => {}}>Action</button>
 *     </div>
 *   }
 * >
 *   <button>Click me</button>
 * </Popover>
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

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type PopoverTrigger = 'click' | 'hover' | 'focus';

export interface PopoverProps {
  /** Popover content */
  content: React.ReactNode;
  /** Trigger element */
  children: React.ReactElement;
  /** Popover position relative to trigger */
  position?: PopoverPosition;
  /** How popover is triggered */
  trigger?: PopoverTrigger;
  /** Whether popover is disabled */
  disabled?: boolean;
  /** Additional class name for popover */
  className?: string;
  /** Whether to show arrow */
  showArrow?: boolean;
  /** Offset from trigger (px) */
  offset?: number;
  /** Z-index */
  zIndex?: number;
  /** Callback when popover opens */
  onOpen?: () => void;
  /** Callback when popover closes */
  onClose?: () => void;
  /** Title for the popover */
  title?: React.ReactNode;
  /** Whether to close when clicking outside */
  closeOnClickOutside?: boolean;
  /** Whether to close when pressing Escape */
  closeOnEscape?: boolean;
  /** Delay before showing for hover trigger (ms) */
  showDelay?: number;
  /** Delay before hiding for hover trigger (ms) */
  hideDelay?: number;
}

export interface PopoverRef {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  isVisible: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const Popover = forwardRef<PopoverRef, PopoverProps>(
  (
    {
      content,
      children,
      position = 'bottom',
      trigger = 'click',
      disabled = false,
      className = '',
      showArrow = true,
      offset = 8,
      zIndex,
      onOpen,
      onClose,
      title,
      closeOnClickOutside = true,
      closeOnEscape = true,
      showDelay = 100,
      hideDelay = 100,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [actualPosition, setActualPosition] = useState<PopoverPosition>(position);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate popover position
    const calculatePosition = useCallback(() => {
      if (!triggerRef.current || !popoverRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();

      let x = 0;
      let y = 0;
      let finalPosition = position;

      const calculateForPosition = (pos: PopoverPosition) => {
        let px = 0;
        let py = 0;

        switch (pos) {
          case 'top':
            px = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
            py = triggerRect.top - popoverRect.height - offset;
            break;
          case 'bottom':
            px = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
            py = triggerRect.bottom + offset;
            break;
          case 'left':
            px = triggerRect.left - popoverRect.width - offset;
            py = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
            break;
          case 'right':
            px = triggerRect.right + offset;
            py = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
            break;
        }

        return { x: px, y: py };
      };

      if (position === 'auto') {
        // Find best position
        const positions: PopoverPosition[] = ['bottom', 'top', 'right', 'left'];

        for (const pos of positions) {
          const calculated = calculateForPosition(pos);
          const inViewport =
            calculated.x >= 0 &&
            calculated.y >= 0 &&
            calculated.x + popoverRect.width <= window.innerWidth &&
            calculated.y + popoverRect.height <= window.innerHeight;

          if (inViewport) {
            finalPosition = pos;
            x = calculated.x;
            y = calculated.y;
            break;
          }
        }
      } else {
        const calculated = calculateForPosition(position);
        x = calculated.x;
        y = calculated.y;
      }

      // Keep popover within viewport
      const padding = 8;
      x = Math.max(padding, Math.min(x, window.innerWidth - popoverRect.width - padding));
      y = Math.max(padding, Math.min(y, window.innerHeight - popoverRect.height - padding));

      setActualPosition(finalPosition);
      setCoords({ x, y });
    }, [position, offset]);

    // Show popover
    const show = useCallback(() => {
      if (disabled) return;

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        onOpen?.();
      }, showDelay);
    }, [disabled, showDelay, onOpen]);

    // Hide popover
    const hide = useCallback(() => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }

      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, hideDelay);
    }, [hideDelay, onClose]);

    // Toggle popover
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
      get isVisible() {
        return isVisible;
      },
    }));

    // Update position when visible
    useEffect(() => {
      if (isVisible) {
        // Reset position calculation
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

    // Handle click outside
    useEffect(() => {
      if (trigger === 'click' && isVisible && closeOnClickOutside) {
        const handleClickOutside = (e: MouseEvent) => {
          if (
            !triggerRef.current?.contains(e.target as Node) &&
            !popoverRef.current?.contains(e.target as Node)
          ) {
            hide();
          }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [trigger, isVisible, closeOnClickOutside, hide]);

    // Handle escape key
    useEffect(() => {
      if (isVisible && closeOnEscape) {
        const handleEscape = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            hide();
          }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [isVisible, closeOnEscape, hide]);

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

      if (trigger === 'click') {
        props.onClick = toggle;
      }

      if (trigger === 'hover') {
        props.onMouseEnter = show;
        props.onMouseLeave = hide;
      }

      if (trigger === 'focus') {
        props.onFocus = show;
        props.onBlur = hide;
      }

      return props;
    };

    // Clone child element with props
    const triggerElement = React.cloneElement(children, {
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': isVisible,
    });

    return (
      <>
        <div
          ref={triggerRef}
          className="popover-trigger"
          {...getTriggerProps()}
        >
          {triggerElement}
        </div>

        {isVisible && (
          <div
            ref={popoverRef}
            className={`popover popover--${actualPosition} ${showArrow ? 'popover--arrow' : ''} ${className}`}
            style={{
              left: coords.x,
              top: coords.y,
              zIndex: zIndex || 'var(--z-popover)',
            }}
            role="dialog"
            aria-modal="false"
            onMouseEnter={trigger === 'hover' ? show : undefined}
            onMouseLeave={trigger === 'hover' ? hide : undefined}
          >
            {title && (
              <div className="popover__title">
                {title}
              </div>
            )}

            <div className="popover__content">
              {content}
            </div>

            {showArrow && (
              <div className={`popover__arrow popover__arrow--${actualPosition}`} />
            )}
          </div>
        )}
      </>
    );
  }
);

Popover.displayName = 'Popover';

// ============================================================================
// Dropdown Popover Component
// ============================================================================

export interface DropdownPopoverProps {
  children: React.ReactElement;
  items: Array<{
    label: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
    danger?: boolean;
    divider?: boolean;
  }>;
  position?: PopoverPosition;
  className?: string;
}

export const DropdownPopover: React.FC<DropdownPopoverProps> = ({
  children,
  items,
  position = 'bottom',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      trigger="click"
      position={position}
      className={className}
      content={
        <div className="dropdown-menu" role="menu">
          {items.map((item, index) =>
            item.divider ? (
              <div key={index} className="dropdown-menu__divider" />
            ) : (
              <button
                key={index}
                className={`dropdown-menu__item ${item.danger ? 'dropdown-menu__item--danger' : ''} ${item.disabled ? 'dropdown-menu__item--disabled' : ''}`}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setIsOpen(false);
                  }
                }}
                disabled={item.disabled}
                type="button"
                role="menuitem"
              >
                {item.icon && <span className="dropdown-menu__icon">{item.icon}</span>}
                {item.label}
              </button>
            )
          )}
        </div>
      }
    >
      {React.cloneElement(children, {
        'aria-expanded': isOpen,
      })}
    </Popover>
  );
};

export default Popover;
