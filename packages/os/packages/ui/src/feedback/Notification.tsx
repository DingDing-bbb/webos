/**
 * @fileoverview Notification Component
 * @module @ui/feedback/Notification
 *
 * Rich notification system with multiple positions, auto-close,
 * and action buttons. Supports stacking and queuing.
 *
 * @example
 * ```tsx
 * import { Notification, NotificationProvider, useNotification } from '@ui/feedback';
 *
 * // In your app root
 * <NotificationProvider>
 *   <App />
 * </NotificationProvider>
 *
 * // In a component
 * const { show } = useNotification();
 *
 * show({
 *   title: 'Success',
 *   message: 'Operation completed',
 *   type: 'success',
 *   actions: [{ label: 'View', onClick: () => {} }]
 * });
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

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

export interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  type?: NotificationType;
  icon?: React.ReactNode;
  duration?: number;
  actions?: NotificationAction[];
  onClose?: () => void;
  createdAt: number;
}

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  icon?: React.ReactNode;
  duration?: number;
  actions?: NotificationAction[];
  onClose?: () => void;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  show: (options: NotificationOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  position: NotificationPosition;
  setPosition: (position: NotificationPosition) => void;
}

// ============================================================================
// Context
// ============================================================================

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ============================================================================
// Icons
// ============================================================================

const DEFAULT_ICONS: Record<NotificationType, React.ReactNode> = {
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
};

// ============================================================================
// Provider Component
// ============================================================================

export interface NotificationProviderProps {
  children: React.ReactNode;
  defaultPosition?: NotificationPosition;
  maxCount?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  maxCount = 5,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [position, setPosition] = useState<NotificationPosition>(defaultPosition);

  const show = useCallback((options: NotificationOptions): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: NotificationItem = {
      ...options,
      id,
      type: options.type || 'info',
      duration: options.duration ?? 5000,
      createdAt: Date.now(),
    };

    setNotifications(prev => {
      const updated = [...prev, notification];
      return updated.slice(-maxCount);
    });

    return id;
  }, [maxCount]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      notification?.onClose?.();
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, show, dismiss, dismissAll, position, setPosition }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// ============================================================================
// Container Component
// ============================================================================

const NotificationContainer: React.FC = () => {
  const context = useContext(NotificationContext);
  if (!context) return null;

  const { notifications, position } = context;

  return (
    <div className={`notification-container notification-container--${position}`}>
      {notifications.map(notification => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

// ============================================================================
// Notification Card Component
// ============================================================================

interface NotificationCardProps {
  notification: NotificationItem;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification }) => {
  const context = useContext(NotificationContext);
  const progressRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(notification.duration ?? 5000);

  const handleClose = useCallback(() => {
    context?.dismiss(notification.id);
  }, [context, notification.id]);

  const startTimer = useCallback(() => {
    if (!notification.duration || notification.duration <= 0) return;

    timerRef.current = setTimeout(() => {
      handleClose();
    }, remainingRef.current);
  }, [notification.duration, handleClose]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      remainingRef.current -= Date.now() - startTimeRef.current;
    }
  }, []);

  const resumeTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startTimer]);

  const type = notification.type || 'info';
  const icon = notification.icon ?? DEFAULT_ICONS[type];

  return (
    <div
      className={`notification notification--${type}`}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      role="alert"
      aria-live="polite"
    >
      {icon && (
        <div className={`notification__icon notification__icon--${type}`}>
          {icon}
        </div>
      )}

      <div className="notification__body">
        {notification.title && (
          <div className="notification__title">
            {notification.title}
          </div>
        )}
        <div className="notification__message">
          {notification.message}
        </div>

        {notification.actions && notification.actions.length > 0 && (
          <div className="notification__actions">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                className={`notification__action ${action.primary ? 'notification__action--primary' : ''}`}
                onClick={() => {
                  action.onClick();
                  handleClose();
                }}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className="notification__close"
        onClick={handleClose}
        aria-label="Dismiss notification"
        type="button"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M5.589 5l2.956-2.956a.417.417 0 00-.59-.589L5 4.411 2.044 1.455a.417.417 0 00-.589.59L4.411 5l-2.956 2.956a.417.417 0 00.59.589L5 5.589l2.956 2.956a.417.417 0 00.589-.59L5.589 5z" />
        </svg>
      </button>

      {notification.duration && notification.duration > 0 && (
        <div className="notification__progress">
          <div
            ref={progressRef}
            className="notification__progress-bar"
            style={{ animationDuration: `${notification.duration}ms` }}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// ============================================================================
// Standalone Notification Component
// ============================================================================

export interface NotificationProps {
  title?: string;
  message: string;
  type?: NotificationType;
  icon?: React.ReactNode;
  onClose?: () => void;
  actions?: NotificationAction[];
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  type = 'info',
  icon,
  onClose,
  actions,
  className = '',
}) => {
  const defaultIcon = DEFAULT_ICONS[type];

  return (
    <div className={`notification notification--${type} ${className}`} role="alert">
      {(icon || defaultIcon) && (
        <div className={`notification__icon notification__icon--${type}`}>
          {icon || defaultIcon}
        </div>
      )}

      <div className="notification__body">
        {title && <div className="notification__title">{title}</div>}
        <div className="notification__message">{message}</div>

        {actions && actions.length > 0 && (
          <div className="notification__actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`notification__action ${action.primary ? 'notification__action--primary' : ''}`}
                onClick={action.onClick}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {onClose && (
        <button className="notification__close" onClick={onClose} type="button" aria-label="Close">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5.589 5l2.956-2.956a.417.417 0 00-.59-.589L5 4.411 2.044 1.455a.417.417 0 00-.589.59L4.411 5l-2.956 2.956a.417.417 0 00.59.589L5 5.589l2.956 2.956a.417.417 0 00.589-.59L5.589 5z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Notification;
