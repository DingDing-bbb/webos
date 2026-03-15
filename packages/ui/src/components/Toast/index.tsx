/**
 * @fileoverview Toast/Message Component
 * @module @ui/components/Toast
 *
 * A customizable toast notification system with stacking, auto-close,
 * and multiple position support.
 *
 * @example
 * ```tsx
 * import { ToastProvider, useToast } from '@ui/components/Toast';
 *
 * // In your app root
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 *
 * // In a component
 * const { show } = useToast();
 * show({ type: 'success', message: 'Operation completed!' });
 * ```
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ToastProps {
  /** Unique identifier for the toast */
  id: string;
  /** Toast type determines styling and icon */
  type: ToastType;
  /** Toast message content */
  message: string;
  /** Optional title */
  title?: string;
  /** Duration in milliseconds before auto-close (0 = no auto-close) */
  duration?: number;
  /** Position of the toast */
  position?: ToastPosition;
  /** Show close button */
  closable?: boolean;
  /** Show progress bar for auto-close */
  showProgress?: boolean;
  /** Callback when toast is closed */
  onClose?: () => void;
}

export interface ToastOptions {
  /** Toast type determines styling and icon */
  type: ToastType;
  /** Toast message content */
  message: string;
  /** Optional title */
  title?: string;
  /** Duration in milliseconds before auto-close (default: 5000) */
  duration?: number;
  /** Position of the toast (default: 'top-right') */
  position?: ToastPosition;
  /** Show close button (default: true) */
  closable?: boolean;
  /** Show progress bar for auto-close (default: true) */
  showProgress?: boolean;
  /** Callback when toast is closed */
  onClose?: () => void;
}

interface ToastContextValue {
  toasts: ToastProps[];
  show: (options: ToastOptions) => string;
  close: (id: string) => void;
  closeAll: () => void;
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

// ============================================================================
// Icons
// ============================================================================

const ToastIcons: Record<ToastType, React.ReactNode> = {
  info: (
    <svg className="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  success: (
    <svg className="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  warning: (
    <svg className="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  error: (
    <svg className="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

// ============================================================================
// Toast Component
// ============================================================================

const Toast: React.FC<ToastProps> = ({
  type,
  message,
  title,
  duration = 5000,
  closable = true,
  showProgress = true,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<number | null>(null);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  }, [isClosing, onClose]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressRef.current) {
      cancelAnimationFrame(progressRef.current);
      progressRef.current = null;
    }
    remainingTimeRef.current -= Date.now() - startTimeRef.current;
  }, []);

  const resumeTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        handleClose();
      }, remainingTimeRef.current);

      const updateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = remainingTimeRef.current - elapsed;
        const percentage = (remaining / duration) * 100;
        setProgress(Math.max(0, percentage));
        if (remaining > 0) {
          progressRef.current = requestAnimationFrame(updateProgress);
        }
      };
      progressRef.current = requestAnimationFrame(updateProgress);
    }
  }, [duration, handleClose]);

  useEffect(() => {
    if (duration > 0) {
      resumeTimer();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [duration, resumeTimer]);

  return (
    <div
      className={`toast toast--${type} ${isClosing ? 'toast--closing' : ''}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
    >
      <div className="toast__content">
        <div className="toast__icon-wrapper">
          {ToastIcons[type]}
        </div>
        <div className="toast__body">
          {title && <div className="toast__title">{title}</div>}
          <div className="toast__message">{message}</div>
        </div>
        {closable && (
          <button
            className="toast__close"
            onClick={handleClose}
            aria-label="Close notification"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      {showProgress && duration > 0 && (
        <div className="toast__progress">
          <div
            className={`toast__progress-bar toast__progress-bar--${type}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ToastContainer Component
// ============================================================================

interface ToastContainerProps {
  position: ToastPosition;
  toasts: ToastProps[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ position, toasts }) => {
  return (
    <div className={`toast-container toast-container--${position}`} role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

// ============================================================================
// ToastProvider Component
// ============================================================================

export interface ToastProviderProps {
  /** Default position for toasts */
  defaultPosition?: ToastPosition;
  /** Default duration for toasts */
  defaultDuration?: number;
  /** Maximum number of toasts to show */
  maxToasts?: number;
  /** Child components */
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  defaultPosition = 'top-right',
  defaultDuration = 5000,
  maxToasts = 5,
  children,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const idCounterRef = useRef(0);

  const show = useCallback(
    (options: ToastOptions): string => {
      const id = `toast-${++idCounterRef.current}`;
      const position = options.position || defaultPosition;
      const duration = options.duration ?? defaultDuration;

      const newToast: ToastProps = {
        id,
        type: options.type,
        message: options.message,
        title: options.title,
        duration,
        position,
        closable: options.closable ?? true,
        showProgress: options.showProgress ?? true,
        onClose: () => {
          options.onClose?.();
          setToasts((prev) => prev.filter((t) => t.id !== id));
        },
      };

      setToasts((prev) => {
        const positionToasts = prev.filter((t) => t.position === position);
        const otherToasts = prev.filter((t) => t.position !== position);

        if (positionToasts.length >= maxToasts) {
          const updated = [...positionToasts.slice(1), newToast];
          return [...otherToasts, ...updated];
        }
        return [...prev, newToast];
      });

      return id;
    },
    [defaultPosition, defaultDuration, maxToasts]
  );

  const close = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const closeAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position || defaultPosition;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, ToastProps[]>);

  return (
    <ToastContext.Provider value={{ toasts, show, close, closeAll }}>
      {children}
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <ToastContainer
          key={position}
          position={position as ToastPosition}
          toasts={positionToasts}
        />
      ))}
    </ToastContext.Provider>
  );
};

// ============================================================================
// useToast Hook
// ============================================================================

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ============================================================================
// Exports
// ============================================================================

export { Toast };
export default ToastProvider;
