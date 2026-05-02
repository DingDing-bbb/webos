/**
 * @fileoverview Modal Dialog Component
 * @module @ui/feedback/Modal
 *
 * A versatile modal dialog with acrylic background, draggable support,
 * and multiple size variants.
 *
 * @example
 * ```tsx
 * import { Modal } from '@webos/ui/feedback';
 *
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   size="medium"
 *   position="center"
 *   draggable
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 * ```
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen' | 'auto';
export type ModalPosition = 'center' | 'top';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: React.ReactNode;
  /** Modal content */
  children: React.ReactNode;
  /** Size variant */
  size?: ModalSize;
  /** Position on screen */
  position?: ModalPosition;
  /** Whether the modal can be dragged */
  draggable?: boolean;
  /** Whether clicking overlay closes modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Custom width (overrides size) */
  width?: string | number;
  /** Custom height (overrides size) */
  height?: string | number;
  /** Additional class name */
  className?: string;
  /** Footer content */
  footer?: React.ReactNode;
  /** Z-index override */
  zIndex?: number;
  /** Whether to trap focus inside modal */
  focusTrap?: boolean;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

// ============================================================================
// Constants
// ============================================================================

const SIZE_MAP: Record<ModalSize, React.CSSProperties> = {
  small: { width: 400, maxWidth: '90vw' },
  medium: { width: 600, maxWidth: '90vw' },
  large: { width: 800, maxWidth: '90vw' },
  fullscreen: { width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh' },
  auto: {},
};

// ============================================================================
// Component
// ============================================================================

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  position = 'center',
  draggable = false,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  width,
  height,
  className = '',
  footer,
  zIndex,
  focusTrap = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [position_, setPosition_] = useState({ x: 0, y: 0 });

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
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && focusTrap) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();

      return () => {
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, focusTrap]);

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      setPosition_({ x: 0, y: 0 });
      setDragState({
        isDragging: false,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
      });
    }
  }, [isOpen]);

  // Drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!draggable || !headerRef.current?.contains(e.target as Node)) return;

      e.preventDefault();
      setDragState((prev) => ({
        ...prev,
        isDragging: true,
        startX: e.clientX - prev.offsetX,
        startY: e.clientY - prev.offsetY,
      }));
    },
    [draggable]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging) return;

      const newOffsetX = e.clientX - dragState.startX;
      const newOffsetY = e.clientY - dragState.startY;

      setPosition_({ x: newOffsetX, y: newOffsetY });
      setDragState((prev) => ({
        ...prev,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      }));
    },
    [dragState]
  );

  const handleMouseUp = useCallback(() => {
    setDragState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Focus trap handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!focusTrap || e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
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
  };

  if (!isOpen) return null;

  const sizeStyles = SIZE_MAP[size];
  const customStyles: React.CSSProperties = {
    ...sizeStyles,
    ...(width !== undefined && { width: typeof width === 'number' ? width : width }),
    ...(height !== undefined && { height: typeof height === 'number' ? height : height }),
    ...(draggable && {
      transform: `translate(${position_.x}px, ${position_.y}px)`,
    }),
  };

  return (
    <div
      className={`modal-overlay modal-overlay--${position}`}
      onClick={handleOverlayClick}
      style={{ zIndex: zIndex || 'var(--z-modal)' }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`modal modal--${size} ${className}`}
        style={customStyles}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {(title || showCloseButton) && (
          <div ref={headerRef} className="modal__header" onMouseDown={handleMouseDown}>
            {title && (
              <h2 id="modal-title" className="modal__title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                className="modal__close"
                onClick={onClose}
                aria-label="Close modal"
                type="button"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6.707 6l3.147-3.146a.5.5 0 00-.708-.708L6 5.293 2.854 2.146a.5.5 0 10-.708.708L5.293 6l-3.147 3.146a.5.5 0 00.708.708L6 6.707l3.146 3.147a.5.5 0 00.708-.708L6.707 6z" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="modal__content">{children}</div>

        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
