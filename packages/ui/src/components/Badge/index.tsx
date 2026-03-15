/**
 * @fileoverview Badge Component
 * @module @ui/components/Badge
 *
 * A flexible badge component for labels, counts, and status indicators.
 *
 * @example
 * ```tsx
 * import { Badge, DotBadge } from '@ui/components/Badge';
 *
 * // Basic badge
 * <Badge>Default</Badge>
 *
 * // Colored badge
 * <Badge color="success">Active</Badge>
 *
 * // With icon
 * <Badge icon={<CheckIcon />}>Verified</Badge>
 *
 * // Dot badge (notification indicator)
 * <DotBadge count={5}>
 *   <BellIcon />
 * </DotBadge>
 * ```
 */

import React, { forwardRef, useMemo } from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type BadgeVariant = 'solid' | 'subtle' | 'outline';
export type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge content */
  children?: React.ReactNode;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Color scheme */
  color?: BadgeColor;
  /** Badge size */
  size?: BadgeSize;
  /** Icon to display before content */
  icon?: React.ReactNode;
  /** Icon to display after content */
  iconEnd?: React.ReactNode;
  /** Render as a dot only */
  dot?: boolean;
  /** Additional CSS class */
  className?: string;
}

export interface DotBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Content to wrap with badge */
  children: React.ReactNode;
  /** Count number to display */
  count?: number;
  /** Maximum count before showing N+ */
  max?: number;
  /** Show dot without count */
  showDot?: boolean;
  /** Color scheme */
  color?: BadgeColor;
  /** Additional CSS class */
  className?: string;
  /** Offset position */
  offset?: [number, number];
}

// ============================================================================
// Constants
// ============================================================================

const COLOR_MAP: Record<BadgeColor, Record<BadgeVariant, { bg: string; text: string; border: string }>> = {
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

const DOT_COLORS: Record<BadgeColor, string> = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  neutral: '#6b7280',
};

// ============================================================================
// Badge Component
// ============================================================================

/**
 * Badge component for labels, status, and counts.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'subtle',
      color = 'primary',
      size = 'md',
      icon,
      iconEnd,
      dot = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const colors = useMemo(() => COLOR_MAP[color][variant], [color, variant]);

    // Dot only badge
    if (dot && !children) {
      return (
        <span
          ref={ref}
          className={`badge badge--dot ${className}`}
          style={{ backgroundColor: colors.bg }}
          aria-hidden="true"
          {...props}
        />
      );
    }

    return (
      <span
        ref={ref}
        className={`badge badge--${size} badge--${variant} ${className}`}
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          borderColor: colors.border,
        }}
        {...props}
      >
        {dot && (
          <span
            className="badge__dot"
            style={{ backgroundColor: DOT_COLORS[color] }}
          />
        )}
        {icon && <span className="badge__icon">{icon}</span>}
        {children && <span className="badge__content">{children}</span>}
        {iconEnd && <span className="badge__icon">{iconEnd}</span>}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// ============================================================================
// DotBadge Component
// ============================================================================

/**
 * DotBadge wraps children with a notification badge.
 * Shows count or dot indicator at the corner.
 */
export const DotBadge = forwardRef<HTMLSpanElement, DotBadgeProps>(
  (
    {
      children,
      count,
      max = 99,
      showDot = false,
      color = 'error',
      className = '',
      offset = [0, 0],
      ...props
    },
    ref
  ) => {
    const displayCount = useMemo(() => {
      if (showDot || count === undefined) return null;
      if (count <= 0) return null;
      if (count > max) return `${max}+`;
      return count;
    }, [count, max, showDot]);

    const shouldShow = showDot || (count !== undefined && count > 0);

    return (
      <span
        ref={ref}
        className={`dot-badge ${className}`}
        {...props}
      >
        {children}
        {shouldShow && (
          <span
            className={`dot-badge__indicator ${displayCount ? 'dot-badge__indicator--count' : ''}`}
            style={{
              backgroundColor: DOT_COLORS[color],
              top: offset[1] || undefined,
              right: offset[0] || undefined,
            }}
          >
            {displayCount}
          </span>
        )}
      </span>
    );
  }
);

DotBadge.displayName = 'DotBadge';

// ============================================================================
// Exports
// ============================================================================

export default Badge;
