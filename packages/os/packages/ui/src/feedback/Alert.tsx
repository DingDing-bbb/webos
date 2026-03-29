/**
 * @fileoverview Alert Component
 * @module @ui/feedback/Alert
 *
 * Alert banner component for displaying important messages.
 * Supports multiple types, icons, and closable functionality.
 *
 * @example
 * ```tsx
 * import { Alert } from '@ui/feedback';
 *
 * <Alert type="warning" title="Warning" closable onClose={() => {}}>
 *   This action cannot be undone.
 * </Alert>
 *
 * <Alert type="success" icon={<CustomIcon />}>
 *   Operation completed successfully!
 * </Alert>
 * ```
 */

import React, { useState, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  /** Alert type determining color scheme */
  type?: AlertType;
  /** Alert title */
  title?: string;
  /** Alert content */
  children: React.ReactNode;
  /** Custom icon (overrides default) */
  icon?: React.ReactNode;
  /** Whether to show icon */
  showIcon?: boolean;
  /** Whether the alert can be closed */
  closable?: boolean;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Additional class name */
  className?: string;
  /** Whether alert has acrylic background */
  acrylic?: boolean;
  /** Whether alert is filled (solid background) */
  filled?: boolean;
  /** Action button */
  action?: React.ReactNode;
}

// ============================================================================
// Icons
// ============================================================================

const DEFAULT_ICONS: Record<AlertType, React.ReactNode> = {
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// ============================================================================
// Component
// ============================================================================

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  icon,
  showIcon = true,
  closable = false,
  onClose,
  className = '',
  acrylic = false,
  filled = false,
  action,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  if (!isVisible) return null;

  const displayIcon = icon ?? (showIcon ? DEFAULT_ICONS[type] : null);

  const classNames = [
    'alert',
    `alert--${type}`,
    acrylic && 'alert--acrylic',
    filled && 'alert--filled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} role="alert">
      {displayIcon && <div className="alert__icon">{displayIcon}</div>}

      <div className="alert__content">
        {title && <div className="alert__title">{title}</div>}
        <div className="alert__message">{children}</div>
      </div>

      {action && <div className="alert__action">{action}</div>}

      {closable && (
        <button
          className="alert__close"
          onClick={handleClose}
          aria-label="Close alert"
          type="button"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6.707 6l3.147-3.146a.5.5 0 00-.708-.708L6 5.293 2.854 2.146a.5.5 0 10-.708.708L5.293 6l-3.147 3.146a.5.5 0 00.708.708L6 6.707l3.146 3.147a.5.5 0 00.708-.708L6.707 6z" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Compound Components
// ============================================================================

export interface AlertBannerProps extends AlertProps {
  /** Whether to show border */
  bordered?: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  bordered = false,
  className = '',
  ...props
}) => {
  return <Alert className={`${bordered ? 'alert--bordered' : ''} ${className}`} {...props} />;
};

export default Alert;
