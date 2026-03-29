/**
 * @fileoverview Drawer Component
 * @module @ui/feedback/Drawer
 *
 * A slide-out drawer panel that can appear from any side of the screen.
 * Supports custom sizing, scroll locking, and acrylic background.
 *
 * @example
 * ```tsx
 * import { Drawer } from '@ui/feedback';
 *
 * <Drawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   position="right"
 *   size={400}
 *   title="Settings"
 * >
 *   <SettingsPanel />
 * </Drawer>
 * ```
 */

import React, { useEffect, useRef, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
  /** Drawer content */
  children: React.ReactNode;
  /** Position from which drawer slides in */
  position?: DrawerPosition;
  /** Size in pixels or string (width for left/right, height for top/bottom) */
  size?: number | string;
  /** Drawer title */
  title?: React.ReactNode;
  /** Whether clicking overlay closes drawer */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape closes drawer */
  closeOnEscape?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Additional class name */
  className?: string;
  /** Footer content */
  footer?: React.ReactNode;
  /** Z-index override */
  zIndex?: number;
  /** Whether to lock body scroll */
  lockScroll?: boolean;
  /** Whether drawer has acrylic background */
  acrylic?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_SIZES: Record<DrawerPosition, number> = {
  left: 320,
  right: 320,
  top: 300,
  bottom: 300,
};

// ============================================================================
// Component
// ============================================================================

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  position = 'right',
  size,
  title,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  footer,
  zIndex,
  lockScroll = true,
  acrylic = true,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const scrollLockRef = useRef<{ count: number }>({ count: 0 });

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen && lockScroll) {
      const scrollLock = scrollLockRef.current;
      scrollLock.count++;
      if (scrollLock.count === 1) {
        document.body.style.overflow = 'hidden';
      }
      return () => {
        scrollLock.count--;
        if (scrollLock.count === 0) {
          document.body.style.overflow = '';
        }
      };
    }
  }, [isOpen, lockScroll]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      drawerRef.current?.focus();

      return () => {
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  // Focus trap handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = drawerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements?.length) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  // Compute drawer styles
  const getDrawerStyle = (): React.CSSProperties => {
    const computedSize = size ?? DEFAULT_SIZES[position];
    const sizeValue = typeof computedSize === 'number' ? `${computedSize}px` : computedSize;

    const styles: React.CSSProperties = {};

    if (position === 'left' || position === 'right') {
      styles.width = sizeValue;
      styles.height = '100%';
    } else {
      styles.height = sizeValue;
      styles.width = '100%';
    }

    return styles;
  };

  if (!isOpen) return null;

  return (
    <div
      className={`drawer-overlay drawer-overlay--${position}`}
      onClick={handleOverlayClick}
      style={{ zIndex: zIndex || 'var(--z-modal)' }}
      role="presentation"
    >
      <div
        ref={drawerRef}
        className={`drawer drawer--${position} ${acrylic ? 'drawer--acrylic' : ''} ${className}`}
        style={getDrawerStyle()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {(title || showCloseButton) && (
          <div className="drawer__header">
            {title && (
              <h2 id="drawer-title" className="drawer__title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                className="drawer__close"
                onClick={onClose}
                aria-label="Close drawer"
                type="button"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6.707 6l3.147-3.146a.5.5 0 00-.708-.708L6 5.293 2.854 2.146a.5.5 0 10-.708.708L5.293 6l-3.147 3.146a.5.5 0 00.708.708L6 6.707l3.146 3.147a.5.5 0 00.708-.708L6.707 6z" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="drawer__content">{children}</div>

        {footer && <div className="drawer__footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Drawer;
