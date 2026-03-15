/**
 * @fileoverview Button Component
 * @module @ui/components/Button
 *
 * A versatile button component with multiple variants, sizes, and states.
 * Supports icons, loading state, and cursor glow effect.
 */

import {
  forwardRef,
  useMemo,
  useCallback,
  type ButtonHTMLAttributes,
  type ReactNode,
  type MouseEvent,
} from 'react';
import './styles.css';

/* ============================================
   Types
   ============================================ */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Block level button (full width) */
  block?: boolean;
  /** Icon to display on the left */
  iconLeft?: ReactNode;
  /** Icon to display on the right */
  iconRight?: ReactNode;
  /** Button content */
  children?: ReactNode;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Accessible label for icon-only buttons */
  'aria-label'?: string;
}

/* ============================================
   Component
   ============================================ */

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      block = false,
      iconLeft,
      iconRight,
      children,
      type = 'button',
      className = '',
      onMouseMove,
      ...rest
    },
    ref
  ) => {
    // Determine if icon-only button
    const isIconOnly = !children && (iconLeft || iconRight);

    // Compute class names using BEM
    const classNames = useMemo(() => {
      const classes = [
        'os-button',
        `os-button--${variant}`,
        `os-button--${size}`,
      ];

      if (isIconOnly) {
        classes.push('os-button--icon-only');
      }

      if (block) {
        classes.push('os-button--block');
      }

      if (loading) {
        classes.push('os-button--loading');
      }

      if (className) {
        classes.push(className);
      }

      return classes.join(' ');
    }, [variant, size, isIconOnly, block, loading, className]);

    // Cursor glow effect handler
    const handleMouseMove = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        button.style.setProperty('--glow-x', `${x}px`);
        button.style.setProperty('--glow-y', `${y}px`);

        // Update pseudo-element position via CSS variable
        const glowElement = button as HTMLButtonElement & { _glowElement?: HTMLSpanElement };
        if (!glowElement._glowElement) {
          const glow = button.querySelector('::before') as unknown as HTMLSpanElement;
          glowElement._glowElement = glow;
        }

        // Apply position to the button for the glow to follow cursor
        button.style.setProperty('--mouse-x', `${x}px`);
        button.style.setProperty('--mouse-y', `${y}px`);

        onMouseMove?.(event);
      },
      [onMouseMove]
    );

    // Render icon wrapper
    const renderIcon = (icon: ReactNode, position: 'left' | 'right') => (
      <span
        className={`os-button__icon os-button__icon--${position}`}
        aria-hidden="true"
      >
        {icon}
      </span>
    );

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        onMouseMove={handleMouseMove}
        {...rest}
      >
        {loading && (
          <span className="os-button__spinner" aria-hidden="true" />
        )}
        {iconLeft && renderIcon(iconLeft, 'left')}
        {children && <span className="os-button__text">{children}</span>}
        {iconRight && renderIcon(iconRight, 'right')}
      </button>
    );
  }
);

Button.displayName = 'Button';

/* ============================================
   Compound Components & Exports
   ============================================ */

export default Button;
