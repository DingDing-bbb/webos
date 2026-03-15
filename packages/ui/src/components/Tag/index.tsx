/**
 * @fileoverview Tag Component
 * @module @ui/components/Tag
 *
 * A tag component for categorizing, labeling, and filtering content.
 *
 * @example
 * ```tsx
 * import { Tag } from '@ui/components/Tag';
 *
 * // Basic tag
 * <Tag>React</Tag>
 *
 * // Closable tag
 * <Tag closable onClose={() => console.log('closed')}>JavaScript</Tag>
 *
 * // With icon
 * <Tag icon={<CheckIcon />}>Verified</Tag>
 *
 * // Color variants
 * <Tag color="success">Active</Tag>
 * <Tag color="error">Deprecated</Tag>
 * ```
 */

import React, { forwardRef, useMemo } from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type TagColor = 'primary' | 'success' | 'warning' | 'error' | 'neutral';
export type TagSize = 'sm' | 'md';
export type TagVariant = 'solid' | 'subtle' | 'outline';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tag content */
  children: React.ReactNode;
  /** Color scheme */
  color?: TagColor;
  /** Tag size */
  size?: TagSize;
  /** Visual variant */
  variant?: TagVariant;
  /** Icon to display before content */
  icon?: React.ReactNode;
  /** Show close button */
  closable?: boolean;
  /** Close button click handler */
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Clickable/interactive */
  clickable?: boolean;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
  /** Additional CSS class */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const COLOR_MAP: Record<TagColor, Record<TagVariant, { bg: string; text: string; border: string }>> = {
  primary: {
    solid: { bg: '#3b82f6', text: '#ffffff', border: '#3b82f6' },
    subtle: { bg: '#eff6ff', text: '#1d4ed8', border: 'transparent' },
    outline: { bg: 'transparent', text: '#3b82f6', border: '#3b82f6' },
  },
  success: {
    solid: { bg: '#22c55e', text: '#ffffff', border: '#22c55e' },
    subtle: { bg: '#f0fdf4', text: '#15803d', border: 'transparent' },
    outline: { bg: 'transparent', text: '#22c55e', border: '#22c55e' },
  },
  warning: {
    solid: { bg: '#f59e0b', text: '#ffffff', border: '#f59e0b' },
    subtle: { bg: '#fffbeb', text: '#b45309', border: 'transparent' },
    outline: { bg: 'transparent', text: '#f59e0b', border: '#f59e0b' },
  },
  error: {
    solid: { bg: '#ef4444', text: '#ffffff', border: '#ef4444' },
    subtle: { bg: '#fef2f2', text: '#b91c1c', border: 'transparent' },
    outline: { bg: 'transparent', text: '#ef4444', border: '#ef4444' },
  },
  neutral: {
    solid: { bg: '#6b7280', text: '#ffffff', border: '#6b7280' },
    subtle: { bg: '#f3f4f6', text: '#374151', border: 'transparent' },
    outline: { bg: 'transparent', text: '#6b7280', border: '#d1d5db' },
  },
};

// ============================================================================
// Close Icon Component
// ============================================================================

const CloseIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="1em"
    height="1em"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ============================================================================
// Tag Component
// ============================================================================

/**
 * Tag component for labels and categorization.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      children,
      color = 'neutral',
      size = 'md',
      variant = 'subtle',
      icon,
      closable = false,
      onClose,
      disabled = false,
      clickable = false,
      onClick,
      className = '',
      ...props
    },
    ref
  ) => {
    const colors = useMemo(() => COLOR_MAP[color][variant], [color, variant]);

    const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onClose?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (clickable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLSpanElement>);
      }
    };

    return (
      <span
        ref={ref}
        className={`tag tag--${size} tag--${variant} ${clickable ? 'tag--clickable' : ''} ${disabled ? 'tag--disabled' : ''} ${className}`}
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          borderColor: colors.border,
        }}
        onClick={disabled ? undefined : onClick}
        onKeyDown={clickable ? handleKeyDown : undefined}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable && !disabled ? 0 : undefined}
        aria-disabled={disabled}
        {...props}
      >
        {icon && <span className="tag__icon">{icon}</span>}
        <span className="tag__content">{children}</span>
        {closable && (
          <button
            type="button"
            className="tag__close"
            onClick={handleClose}
            disabled={disabled}
            aria-label="Remove tag"
          >
            <CloseIcon />
          </button>
        )}
      </span>
    );
  }
);

Tag.displayName = 'Tag';

// ============================================================================
// TagGroup Component (Optional)
// ============================================================================

export interface TagGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap between tags */
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  /** Wrap tags */
  wrap?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Children (Tag components) */
  children: React.ReactNode;
}

/**
 * Group container for multiple tags.
 */
export const TagGroup = forwardRef<HTMLDivElement, TagGroupProps>(
  ({ gap = 'sm', wrap = true, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`tag-group tag-group--${gap} ${wrap ? 'tag-group--wrap' : ''} ${className}`}
        role="group"
        {...props}
      >
        {children}
      </div>
    );
  }
);

TagGroup.displayName = 'TagGroup';

// ============================================================================
// Exports
// ============================================================================

export default Tag;
