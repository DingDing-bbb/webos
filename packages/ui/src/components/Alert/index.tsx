/**
 * @fileoverview Alert Component
 * @module @ui/components/Alert
 *
 * A flexible alert component for displaying important messages
 * with icons, actions, and closable functionality.
 *
 * @example
 * ```tsx
 * import { Alert } from '@ui/components/Alert';
 *
 * <Alert type="success" title="Success!">
 *   Your changes have been saved.
 * </Alert>
 * ```
 */

import React from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  /** Alert type determines styling and icon */
  type?: AlertType;
  /** Alert title */
  title?: string;
  /** Alert description/content */
  children: React.ReactNode;
  /** Show icon */
  showIcon?: boolean;
  /** Custom icon (overrides default) */
  icon?: React.ReactNode;
  /** Closable alert */
  closable?: boolean;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Action button */
  action?: React.ReactNode;
  /** Full width alert */
  fullWidth?: boolean;
  /** Additional class name */
  className?: string;
  /** Inline style */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const AlertIcons: Record<AlertType, React.ReactNode> = {
  info: (
    <svg className="alert__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  success: (
    <svg className="alert__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  warning: (
    <svg className="alert__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  error: (
    <svg className="alert__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

// ============================================================================
// Alert Component
// ============================================================================

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  showIcon = true,
  icon,
  closable = false,
  onClose,
  action,
  fullWidth = false,
  className = '',
  style,
}) => {
  const displayIcon = icon ?? (showIcon ? AlertIcons[type] : null);

  return (
    <div
      className={`alert alert--${type} ${fullWidth ? 'alert--full' : ''} ${className}`}
      role="alert"
      style={style}
    >
      {displayIcon && <div className="alert__icon">{displayIcon}</div>}
      <div className="alert__content">
        {title && <div className="alert__title">{title}</div>}
        <div className="alert__message">{children}</div>
        {action && <div className="alert__action">{action}</div>}
      </div>
      {closable && (
        <button
          className="alert__close"
          onClick={onClose}
          aria-label="Close alert"
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
// AlertAction Component
// ============================================================================

export interface AlertActionProps {
  /** Button label */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary';
  /** Additional class name */
  className?: string;
}

export const AlertAction: React.FC<AlertActionProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
}) => {
  return (
    <button
      className={`alert__action-button alert__action-button--${variant} ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};

// ============================================================================
// AlertLink Component
// ============================================================================

export interface AlertLinkProps {
  /** Link text */
  children: React.ReactNode;
  /** Link URL */
  href: string;
  /** Open in new tab */
  external?: boolean;
  /** Additional class name */
  className?: string;
}

export const AlertLink: React.FC<AlertLinkProps> = ({
  children,
  href,
  external = false,
  className = '',
}) => {
  return (
    <a
      className={`alert__link ${className}`}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  );
};

// ============================================================================
// InlineAlert Component (for compact display)
// ============================================================================

export interface InlineAlertProps {
  /** Alert type */
  type?: AlertType;
  /** Alert content */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  type = 'info',
  children,
  className = '',
}) => {
  return (
    <span className={`inline-alert inline-alert--${type} ${className}`} role="status">
      {children}
    </span>
  );
};

// ============================================================================
// AlertGroup Component (for displaying multiple alerts)
// ============================================================================

export interface AlertGroupProps {
  /** Alerts to display */
  children: React.ReactNode;
  /** Orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Additional class name */
  className?: string;
}

export const AlertGroup: React.FC<AlertGroupProps> = ({
  children,
  orientation = 'vertical',
  className = '',
}) => {
  return (
    <div className={`alert-group alert-group--${orientation} ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// BannerAlert Component (for page-level alerts)
// ============================================================================

export interface BannerAlertProps {
  /** Alert type */
  type?: AlertType;
  /** Alert title */
  title?: string;
  /** Alert content */
  children: React.ReactNode;
  /** Show icon */
  showIcon?: boolean;
  /** Closable */
  closable?: boolean;
  /** Close callback */
  onClose?: () => void;
  /** Action button */
  action?: React.ReactNode;
  /** Additional class name */
  className?: string;
}

export const BannerAlert: React.FC<BannerAlertProps> = ({
  type = 'info',
  title,
  children,
  showIcon = true,
  closable = false,
  onClose,
  action,
  className = '',
}) => {
  return (
    <div className={`banner-alert banner-alert--${type} ${className}`} role="alert">
      <div className="banner-alert__container">
        {showIcon && <div className="banner-alert__icon">{AlertIcons[type]}</div>}
        <div className="banner-alert__content">
          {title && <div className="banner-alert__title">{title}</div>}
          <div className="banner-alert__message">{children}</div>
        </div>
        {action && <div className="banner-alert__action">{action}</div>}
        {closable && (
          <button
            className="banner-alert__close"
            onClick={onClose}
            aria-label="Close alert"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Exports
// ============================================================================

export default Alert;
