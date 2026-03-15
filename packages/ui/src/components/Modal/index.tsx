/**
 * @fileoverview Modal Component
 * @module @ui/components/Modal
 *
 * A fully accessible modal dialog with animations, size variants,
 * and keyboard navigation support.
 *
 * @example
 * ```tsx
 * import { Modal, ModalHeader, ModalBody, ModalFooter } from '@ui/components/Modal';
 *
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <ModalHeader>Modal Title</ModalHeader>
 *   <ModalBody>Modal content here</ModalBody>
 *   <ModalFooter>
 *     <Button onClick={() => setIsOpen(false)}>Close</Button>
 *   </ModalFooter>
 * </Modal>
 * ```
 */

import React, { useEffect, useCallback, useRef, createContext, useContext } from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalAnimation = 'fade' | 'slide' | 'scale' | 'none';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal requests to close */
  onClose: () => void;
  /** Modal size */
  size?: ModalSize;
  /** Animation type */
  animation?: ModalAnimation;
  /** Allow closing by clicking overlay */
  closeOnOverlay?: boolean;
  /** Allow closing by pressing Escape */
  closeOnEscape?: boolean;
  /** Center modal vertically */
  centered?: boolean;
  /** Show close button in header */
  showCloseButton?: boolean;
  /** Modal title (for accessibility) */
  title?: string;
  /** ARIA described by */
  ariaDescribedBy?: string;
  /** Additional class name for modal */
  className?: string;
  /** Additional class name for overlay */
  overlayClassName?: string;
  /** Children content */
  children: React.ReactNode;
}

export interface ModalHeaderProps {
  /** Header content */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Show close button (overrides Modal prop) */
  showCloseButton?: boolean;
  /** Close button click handler */
  onClose?: () => void;
}

export interface ModalBodyProps {
  /** Body content */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Enable scrollable body */
  scrollable?: boolean;
}

export interface ModalFooterProps {
  /** Footer content */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Align footer content */
  align?: 'left' | 'center' | 'right' | 'between';
}

// ============================================================================
// Context
// ============================================================================

interface ModalContextValue {
  onClose: () => void;
  showCloseButton: boolean;
}

const ModalContext = createContext<ModalContextValue | null>(null);

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components must be used within a Modal');
  }
  return context;
};

// ============================================================================
// Scroll Lock
// ============================================================================

let scrollLockCount = 0;
const originalOverflow = typeof document !== 'undefined' ? document.body.style.overflow : '';

const lockScroll = () => {
  if (scrollLockCount === 0) {
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount++;
};

const unlockScroll = () => {
  scrollLockCount--;
  if (scrollLockCount === 0) {
    document.body.style.overflow = originalOverflow;
  }
};

// ============================================================================
// Modal Component
// ============================================================================

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  size = 'md',
  animation = 'fade',
  closeOnOverlay = true,
  closeOnEscape = true,
  centered = true,
  showCloseButton = true,
  title,
  ariaDescribedBy,
  className = '',
  overlayClassName = '',
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle Escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && closeOnOverlay) {
        onClose();
      }
    },
    [closeOnOverlay, onClose]
  );

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      lockScroll();

      // Focus the modal
      setTimeout(() => {
        const focusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }, 0);

      document.addEventListener('keydown', handleKeyDown);
    } else {
      unlockScroll();
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus
      previousActiveElement.current?.focus();
    }

    return () => {
      unlockScroll();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <ModalContext.Provider value={{ onClose, showCloseButton }}>
      <div
        className={`modal-overlay modal-overlay--${animation} ${overlayClassName}`}
        onClick={handleOverlayClick}
        role="presentation"
      >
        <div
          ref={modalRef}
          className={`modal modal--${size} modal--${animation} ${centered ? 'modal--centered' : ''} ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={ariaDescribedBy}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal__content">{children}</div>
        </div>
      </div>
    </ModalContext.Provider>
  );
};

// ============================================================================
// ModalHeader Component
// ============================================================================

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  className = '',
  showCloseButton,
  onClose,
}) => {
  const context = useModalContext();
  const shouldShowClose = showCloseButton ?? context.showCloseButton;
  const handleClose = onClose ?? context.onClose;

  return (
    <div className={`modal__header ${className}`}>
      <h2 id="modal-title" className="modal__title">
        {children}
      </h2>
      {shouldShowClose && (
        <button
          className="modal__close"
          onClick={handleClose}
          aria-label="Close modal"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// ModalBody Component
// ============================================================================

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = '',
  scrollable = false,
}) => {
  return (
    <div className={`modal__body ${scrollable ? 'modal__body--scrollable' : ''} ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// ModalFooter Component
// ============================================================================

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = '',
  align = 'right',
}) => {
  return (
    <div className={`modal__footer modal__footer--${align} ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// ConfirmModal - Convenience Component
// ============================================================================

export interface ConfirmModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal requests to close */
  onClose: () => void;
  /** Callback when confirm is clicked */
  onConfirm: () => void;
  /** Modal title */
  title: string;
  /** Modal message */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button variant */
  confirmVariant?: 'primary' | 'danger';
  /** Modal size */
  size?: ModalSize;
  /** Loading state */
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  size = 'sm',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} title={title}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <p className="modal__message">{message}</p>
      </ModalBody>
      <ModalFooter>
        <button
          className={`modal__button modal__button--secondary`}
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          className={`modal__button modal__button--${confirmVariant}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Loading...' : confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};

// ============================================================================
// Exports
// ============================================================================

export default Modal;
