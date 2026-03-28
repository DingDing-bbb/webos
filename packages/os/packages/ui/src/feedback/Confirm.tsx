/**
 * @fileoverview Confirm Dialog Component
 * @module @ui/feedback/Confirm
 *
 * Confirmation dialog for user confirmations with async support.
 * Provides imperative API for showing confirm dialogs from anywhere.
 *
 * @example
 * ```tsx
 * import { ConfirmProvider, useConfirm } from '@ui/feedback';
 *
 * // In your app root
 * <ConfirmProvider>
 *   <App />
 * </ConfirmProvider>
 *
 * // In a component
 * const confirm = useConfirm();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm.show({
 *     title: 'Delete Item',
 *     message: 'Are you sure you want to delete this item?',
 *     confirmText: 'Delete',
 *     cancelText: 'Cancel',
 *   });
 *
 *   if (confirmed) {
 *     // Perform deletion
 *   }
 * };
 * ```
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export type ConfirmType = 'info' | 'warning' | 'danger';

export interface ConfirmButton {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void | Promise<void>;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  confirmButton?: ConfirmButton;
  cancelButton?: ConfirmButton;
  icon?: React.ReactNode;
  hideCancel?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  id: string;
  resolve: (value: boolean) => void;
  isLoading?: boolean;
}

interface ConfirmContextValue {
  show: (options: ConfirmOptions) => Promise<boolean>;
}

// ============================================================================
// Context
// ============================================================================

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

// ============================================================================
// Icons
// ============================================================================

const DEFAULT_ICONS: Record<ConfirmType, React.ReactNode> = {
  info: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 2a14 14 0 100 28 14 14 0 000-28zm1 20a1 1 0 11-2 0v-8a1 1 0 012 0v8zm-1-12a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
    </svg>
  ),
  warning: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 2a14 14 0 100 28 14 14 0 000-28zm-1 8a1 1 0 112 0v6a1 1 0 11-2 0v-6zm1 12a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
    </svg>
  ),
  danger: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 2a14 14 0 100 28 14 14 0 000-28zm4.95 9.05a1 1 0 010 1.41L17.41 18l3.54 3.54a1 1 0 11-1.41 1.41L16 19.41l-3.54 3.54a1 1 0 11-1.41-1.41L14.59 18l-3.54-3.54a1 1 0 111.41-1.41L16 16.59l3.54-3.54a1 1 0 011.41 0z" />
    </svg>
  ),
};

// ============================================================================
// Provider Component
// ============================================================================

export interface ConfirmProviderProps {
  children: React.ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  const show = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      const id = `confirm-${Date.now()}`;
      setConfirmState({
        ...options,
        id,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!confirmState) return;

    setConfirmState(prev => prev ? { ...prev, isLoading: true } : null);

    try {
      if (confirmState.confirmButton?.onClick) {
        await confirmState.confirmButton.onClick();
      }
      confirmState.resolve(true);
    } catch {
      confirmState.resolve(false);
    } finally {
      setConfirmState(null);
    }
  }, [confirmState]);

  const handleCancel = useCallback(async () => {
    if (!confirmState) return;

    try {
      if (confirmState.cancelButton?.onClick) {
        await confirmState.cancelButton.onClick();
      }
    } finally {
      confirmState.resolve(false);
      setConfirmState(null);
    }
  }, [confirmState]);

  // Handle escape key
  useEffect(() => {
    if (!confirmState) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !confirmState.hideCancel) {
        handleCancel();
      } else if (e.key === 'Enter') {
        handleConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [confirmState, handleCancel, handleConfirm]);

  // Handle body scroll lock
  useEffect(() => {
    if (confirmState) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [confirmState]);

  // Focus management
  useEffect(() => {
    if (confirmState) {
      const focusable = confirmRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }
  }, [confirmState]);

  return (
    <ConfirmContext.Provider value={{ show }}>
      {children}
      {confirmState && (
        <div className="confirm-overlay" role="presentation">
          <div
            ref={confirmRef}
            className={`confirm confirm--${confirmState.type || 'info'}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
          >
            <div className="confirm__content">
              {(confirmState.icon ?? DEFAULT_ICONS[confirmState.type || 'info']) && (
                <div className={`confirm__icon confirm__icon--${confirmState.type || 'info'}`}>
                  {confirmState.icon ?? DEFAULT_ICONS[confirmState.type || 'info']}
                </div>
              )}

              {confirmState.title && (
                <h3 id="confirm-title" className="confirm__title">
                  {confirmState.title}
                </h3>
              )}

              <p id="confirm-message" className="confirm__message">
                {confirmState.message}
              </p>
            </div>

            <div className="confirm__actions">
              {!confirmState.hideCancel && (
                <button
                  className="confirm__button confirm__button--cancel"
                  onClick={handleCancel}
                  disabled={confirmState.isLoading}
                  type="button"
                >
                  {confirmState.cancelButton?.label ?? confirmState.cancelText ?? 'Cancel'}
                </button>
              )}

              <button
                className={`confirm__button confirm__button--confirm ${
                  confirmState.type === 'danger' ? 'confirm__button--danger' : ''
                }`}
                onClick={handleConfirm}
                disabled={confirmState.isLoading}
                type="button"
              >
                {confirmState.isLoading ? (
                  <span className="confirm__loading">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 12 12"
                          to="360 12 12"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </svg>
                  </span>
                ) : (
                  confirmState.confirmButton?.label ?? confirmState.confirmText ?? 'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useConfirm = (): ConfirmContextValue => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

// ============================================================================
// Standalone Confirm Component
// ============================================================================

export interface ConfirmProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  icon?: React.ReactNode;
  hideCancel?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const Confirm: React.FC<ConfirmProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  icon,
  hideCancel = false,
  isLoading = false,
  className = '',
}) => {
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const focusable = confirmRef.current?.querySelector<HTMLElement>('button');
      focusable?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" role="presentation">
      <div
        ref={confirmRef}
        className={`confirm confirm--${type} ${className}`}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="confirm__content">
          {(icon ?? DEFAULT_ICONS[type]) && (
            <div className={`confirm__icon confirm__icon--${type}`}>
              {icon ?? DEFAULT_ICONS[type]}
            </div>
          )}

          {title && <h3 className="confirm__title">{title}</h3>}
          <p className="confirm__message">{message}</p>
        </div>

        <div className="confirm__actions">
          {!hideCancel && (
            <button
              className="confirm__button confirm__button--cancel"
              onClick={onCancel}
              disabled={isLoading}
              type="button"
            >
              {cancelText}
            </button>
          )}

          <button
            className={`confirm__button confirm__button--confirm ${
              type === 'danger' ? 'confirm__button--danger' : ''
            }`}
            onClick={onConfirm}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <span className="confirm__loading">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 12 12"
                      to="360 12 12"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirm;
