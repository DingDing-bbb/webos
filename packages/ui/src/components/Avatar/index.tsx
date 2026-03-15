/**
 * @fileoverview Avatar Component
 * @module @ui/components/Avatar
 *
 * A customizable avatar component with status indicators, group support,
 * and image fallback capabilities.
 *
 * @example
 * ```tsx
 * import { Avatar, AvatarGroup } from '@ui/components/Avatar';
 *
 * // Basic avatar with image
 * <Avatar src="/user.jpg" alt="John Doe" />
 *
 * // Avatar with initials
 * <Avatar initials="JD" />
 *
 * // Avatar with status
 * <Avatar src="/user.jpg" status="online" />
 *
 * // Avatar group (stacked)
 * <AvatarGroup max={3}>
 *   <Avatar src="/user1.jpg" />
 *   <Avatar src="/user2.jpg" />
 *   <Avatar src="/user3.jpg" />
 *   <Avatar src="/user4.jpg" />
 * </AvatarGroup>
 * ```
 */

import React, { useState, useCallback, forwardRef, useMemo } from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Initials to display when no image */
  initials?: string;
  /** Icon to display when no image or initials */
  icon?: React.ReactNode;
  /** Avatar size */
  size?: AvatarSize;
  /** Status indicator */
  status?: AvatarStatus;
  /** Custom status badge */
  statusBadge?: React.ReactNode;
  /** Fallback image when src fails to load */
  fallbackSrc?: string;
  /** Show status badge */
  showStatus?: boolean;
  /** Shape variant */
  shape?: 'circle' | 'square';
  /** Additional CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum avatars to show before +N */
  max?: number;
  /** Size for all avatars in group */
  size?: AvatarSize;
  /** Spacing between avatars */
  spacing?: 'tight' | 'normal' | 'loose';
  /** Additional CSS class */
  className?: string;
  /** Children (Avatar components) */
  children: React.ReactNode;
}

// ============================================================================
// Constants
// ============================================================================

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const STATUS_COLORS: Record<AvatarStatus, string> = {
  online: '#22c55e',
  offline: '#6b7280',
  busy: '#ef4444',
  away: '#f59e0b',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Generate a consistent color from a string
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 45%)`;
}

// ============================================================================
// Avatar Component
// ============================================================================

/**
 * Avatar component with image, initials, or icon support.
 * Includes status indicator and fallback capabilities.
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      initials,
      icon,
      size = 'md',
      status,
      statusBadge,
      fallbackSrc,
      showStatus = true,
      shape = 'circle',
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);

    const handleError = useCallback(() => {
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      } else {
        setImageError(true);
      }
    }, [fallbackSrc, currentSrc]);

    // Determine what to render
    const renderContent = useMemo(() => {
      if (currentSrc && !imageError) {
        return (
          <img
            src={currentSrc}
            alt={alt}
            className="avatar__image"
            onError={handleError}
          />
        );
      }

      if (initials) {
        const bgColor = stringToColor(initials);
        return (
          <span className="avatar__initials" style={{ backgroundColor: bgColor }}>
            {initials.substring(0, 2).toUpperCase()}
          </span>
        );
      }

      if (icon) {
        return <span className="avatar__icon">{icon}</span>;
      }

      // Default user icon
      return (
        <span className="avatar__icon">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width="60%"
            height="60%"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </span>
      );
    }, [currentSrc, imageError, alt, initials, icon, handleError]);

    // Status badge
    const renderStatus = useMemo(() => {
      if (!showStatus || !status) return null;

      if (statusBadge) {
        return <span className="avatar__status-badge">{statusBadge}</span>;
      }

      return (
        <span
          className={`avatar__status avatar__status--${status}`}
          style={{ backgroundColor: STATUS_COLORS[status] }}
          aria-label={status}
        />
      );
    }, [showStatus, status, statusBadge]);

    const sizeStyle = {
      width: SIZE_MAP[size],
      height: SIZE_MAP[size],
      fontSize: size === 'xs' ? 10 : size === 'sm' ? 12 : size === 'lg' ? 20 : size === 'xl' ? 28 : 14,
    };

    return (
      <div
        ref={ref}
        className={`avatar avatar--${size} avatar--${shape}${onClick ? ' avatar--clickable' : ''} ${className}`}
        style={sizeStyle}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={alt || initials || 'Avatar'}
        {...props}
      >
        {renderContent}
        {renderStatus}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// ============================================================================
// AvatarGroup Component
// ============================================================================

/**
 * AvatarGroup displays multiple avatars in a stacked layout.
 * Shows a +N indicator when exceeding the maximum count.
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      max = 4,
      size = 'md',
      spacing = 'normal',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const childArray = React.Children.toArray(children);
    const visibleCount = Math.min(max, childArray.length);
    const remainingCount = childArray.length - visibleCount;

    const visibleChildren = childArray.slice(0, visibleCount);

    return (
      <div
        ref={ref}
        className={`avatar-group avatar-group--${spacing} ${className}`}
        role="group"
        aria-label={`${childArray.length} avatars`}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div key={index} className="avatar-group__item" style={{ zIndex: visibleCount - index }}>
            {React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size })
              : child}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="avatar-group__item">
            <Avatar
              initials={`+${remainingCount}`}
              size={size}
              className="avatar-group__overflow"
            />
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

// ============================================================================
// Exports
// ============================================================================

export default Avatar;
