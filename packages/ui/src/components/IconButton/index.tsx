/**
 * @fileoverview IconButton Component
 * @module @ui/components/IconButton
 *
 * An icon-only button component with tooltip support.
 * Supports circular/square shapes, multiple sizes, and variants.
 */

import {
  forwardRef,
  useMemo,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import './styles.css';

/* ============================================
   Types
   ============================================ */

export type IconButtonVariant = 'default' | 'primary' | 'ghost';
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type IconButtonShape = 'circle' | 'square';
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Button style variant */
  variant?: IconButtonVariant;
  /** Button size */
  size?: IconButtonSize;
  /** Button shape */
  shape?: IconButtonShape;
  /** Show loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Icon to display */
  icon?: ReactNode;
  /** Tooltip text (shown on hover/focus) */
  tooltip?: string;
  /** Tooltip position */
  tooltipPosition?: TooltipPosition;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Accessible label (required for screen readers) */
  'aria-label': string;
}

/* ============================================
   Component
   ============================================ */

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      shape = 'circle',
      loading = false,
      disabled = false,
      icon,
      tooltip,
      tooltipPosition = 'top',
      type = 'button',
      className = '',
      'aria-label': ariaLabel,
      ...rest
    },
    ref
  ) => {
    // Compute class names using BEM
    const classNames = useMemo(() => {
      const classes = [
        'os-icon-button',
        `os-icon-button--${variant}`,
        `os-icon-button--${size}`,
        `os-icon-button--${shape}`,
      ];

      if (loading) {
        classes.push('os-icon-button--loading');
      }

      if (className) {
        classes.push(className);
      }

      return classes.join(' ');
    }, [variant, size, shape, loading, className]);

    // Compute tooltip class
    const tooltipClassName = useMemo(() => {
      const base = 'os-icon-button__tooltip';
      if (tooltipPosition === 'top') return base;
      return `${base} os-icon-button__tooltip--${tooltipPosition}`;
    }, [tooltipPosition]);

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        aria-label={ariaLabel}
        {...rest}
      >
        {loading && (
          <span className="os-icon-button__spinner" aria-hidden="true" />
        )}
        <span className="os-icon-button__icon" aria-hidden="true">
          {icon}
        </span>
        {tooltip && (
          <span className={tooltipClassName} role="tooltip">
            {tooltip}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

/* ============================================
   Exports
   ============================================ */

export default IconButton;
