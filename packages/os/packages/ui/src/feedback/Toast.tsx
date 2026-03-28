/**
 * @fileoverview Toast Component
 * @module @ui/feedback/Toast
 *
 * Lightweight toast notifications for quick feedback messages.
 * Supports success, error, warning, info types and loading state.
 * Multiple toasts can stack with animation.
 *
 * @example
 * ```tsx
 * import { ToastProvider, useToast } from '@ui/feedback';
 *
 * // In your app root
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 *
 * // In a component
 * const toast = useToast();
 *
 * toast.success('Operation completed!');
 * toast.error('Something went wrong');
 * toast.loading('Processing...', { duration: 0 });
 * ```
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  icon?: React.ReactNode;
  onClose?: () => void;
  createdAt: number;
}

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  icon?: React.ReactNode;
  onClose?: () => void;
}

interface ToastContextValue {
  toasts: ToastItem[];
  show: (options: ToastOptions) => string;
  success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string;
  error: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string;
  warning: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string;
  info: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string;
  loading: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, options: Partial<ToastOptions>) => void;
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

// ============================================================================
// Icons
// ============================================================================

const DEFAULT_ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L7 8.586 5.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4.5a1 1 0 112 0v3a1 1 0 11-2 0v-3zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4.5a1 1 0 112 0v3a1 1 0 11-2 0v-3zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4.5a1 1 0 012 0v4a1 1 0 11-2 0v-4zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  loading: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="toast__spinner"
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
  ),
};

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 3000,
  error: 4000,
  warning: 3500,
  info: 3000,
  loading: 0, // No auto-close for loading
};

// ============================================================================
// Provider Component
// ============================================================================

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  maxCount?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'bottom',
  maxCount = 5,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((options: ToastOptions): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const type = options.type || 'info';
    const duration = options.duration ?? DEFAULT_DURATIONS[type];

    const toast: ToastItem = {
      ...options,
      id,
      type,
      duration,
      createdAt: Date.now(),
    };

    setToasts(prev => {
      const updated = [...prev, toast];
      return updated.slice(-maxCount);
    });

    return id;
  }, [maxCount]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      toast?.onClose?.();
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const update = useCallback((id: string, options: Partial<ToastOptions>) => {
    setToasts(prev =>
      prev.map(toast =>
        toast.id === id ? { ...toast, ...options } : toast
      )
    );
  }, []);

  const typedShow = useCallback(
    (type: ToastType) =>
      (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
        show({ ...options, message, type }),
    [show]
  );

  const contextValue: ToastContextValue = {
    toasts,
    show,
    success: typedShow('success'),
    error: typedShow('error'),
    warning: typedShow('warning'),
    info: typedShow('info'),
    loading: typedShow('loading'),
    dismiss,
    dismissAll,
    update,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={position} />
    </ToastContext.Provider>
  );
};

// ============================================================================
// Container Component
// ============================================================================

interface ToastContainerProps {
  position: 'top' | 'bottom';
}

const ToastContainer: React.FC<ToastContainerProps> = ({ position }) => {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { toasts } = context;

  return (
    <div className={`toast-container toast-container--${position}`}>
      {toasts.map(toast => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

// ============================================================================
// Toast Card Component
// ============================================================================

interface ToastCardProps {
  toast: ToastItem;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast }) => {
  const context = useContext(ToastContext);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClose = useCallback(() => {
    context?.dismiss(toast.id);
  }, [context, toast.id]);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      timerRef.current = setTimeout(handleClose, toast.duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [toast.duration, handleClose]);

  const icon = toast.icon ?? DEFAULT_ICONS[toast.type];

  return (
    <div
      className={`toast toast--${toast.type}`}
      role="alert"
      aria-live="polite"
      onClick={toast.type !== 'loading' ? handleClose : undefined}
    >
      {icon && <div className="toast__icon">{icon}</div>}
      <span className="toast__message">{toast.message}</span>
      {toast.type !== 'loading' && (
        <button
          className="toast__close"
          onClick={handleClose}
          aria-label="Dismiss"
          type="button"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5.589 5l2.956-2.956a.417.417 0 00-.59-.589L5 4.411 2.044 1.455a.417.417 0 00-.589.59L4.411 5l-2.956 2.956a.417.417 0 00.59.589L5 5.589l2.956 2.956a.417.417 0 00.589-.59L5.589 5z" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ============================================================================
// Standalone Toast Component
// ============================================================================

export interface ToastProps {
  message: string;
  type?: ToastType;
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  icon,
  onClose,
  className = '',
}) => {
  const defaultIcon = DEFAULT_ICONS[type];

  return (
    <div className={`toast toast--${type} ${className}`} role="alert">
      {(icon || defaultIcon) && <div className="toast__icon">{icon || defaultIcon}</div>}
      <span className="toast__message">{message}</span>
      {onClose && (
        <button className="toast__close" onClick={onClose} type="button" aria-label="Dismiss">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5.589 5l2.956-2.956a.417.417 0 00-.59-.589L5 4.411 2.044 1.455a.417.417 0 00-.589.59L4.411 5l-2.956 2.956a.417.417 0 00.59.589L5 5.589l2.956 2.956a.417.417 0 00.589-.59L5.589 5z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Toast;
