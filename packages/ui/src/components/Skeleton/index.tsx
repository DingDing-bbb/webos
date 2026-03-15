/**
 * @fileoverview Skeleton Component
 * @module @ui/components/Skeleton
 *
 * A loading placeholder component for content that is still loading.
 * Supports text, avatar, image, and card variants.
 *
 * @example
 * ```tsx
 * import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard } from '@ui/components/Skeleton';
 *
 * // Text skeleton
 * <SkeletonText lines={3} />
 *
 * // Avatar skeleton
 * <SkeletonAvatar size={48} />
 *
 * // Card skeleton
 * <SkeletonCard />
 * ```
 */

import React from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

export interface SkeletonProps {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Animation type */
  animation?: SkeletonAnimation;
  /** Border radius */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Additional class name */
  className?: string;
  /** Inline style */
  style?: React.CSSProperties;
}

export interface SkeletonTextProps {
  /** Number of lines to show */
  lines?: number;
  /** Width of the last line (percentage or CSS value) */
  lastLineWidth?: string | number;
  /** Animation type */
  animation?: SkeletonAnimation;
  /** Gap between lines */
  gap?: number;
  /** Additional class name */
  className?: string;
}

export interface SkeletonAvatarProps {
  /** Size of the avatar */
  size?: number;
  /** Shape of the avatar */
  shape?: 'circle' | 'square';
  /** Animation type */
  animation?: SkeletonAnimation;
  /** Additional class name */
  className?: string;
}

export interface SkeletonImageProps {
  /** Width of the image */
  width?: string | number;
  /** Height of the image */
  height?: string | number;
  /** Animation type */
  animation?: SkeletonAnimation;
  /** Additional class name */
  className?: string;
}

export interface SkeletonCardProps {
  /** Show header */
  showHeader?: boolean;
  /** Show avatar in header */
  showAvatar?: boolean;
  /** Number of body lines */
  bodyLines?: number;
  /** Show footer */
  showFooter?: boolean;
  /** Animation type */
  animation?: SkeletonAnimation;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const getRadiusClass = (radius: SkeletonProps['radius']): string => {
  if (!radius || radius === 'none') return '';
  return `skeleton--radius-${radius}`;
};

const getAnimationClass = (animation: SkeletonAnimation): string => {
  return `skeleton--${animation}`;
};

const formatDimension = (value: string | number | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

// ============================================================================
// Skeleton Component (Base)
// ============================================================================

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  animation = 'pulse',
  radius = 'md',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`skeleton ${getAnimationClass(animation)} ${getRadiusClass(radius)} ${className}`}
      style={{
        width: formatDimension(width),
        height: formatDimension(height),
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

// ============================================================================
// SkeletonText Component
// ============================================================================

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lastLineWidth = 60,
  animation = 'pulse',
  gap = 8,
  className = '',
}) => {
  const lastLineWidthValue = formatDimension(lastLineWidth) || '60%';

  return (
    <div className={`skeleton-text ${className}`} style={{ gap }} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={`skeleton skeleton--text ${getAnimationClass(animation)}`}
          style={{
            width: index === lines - 1 ? lastLineWidthValue : '100%',
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// SkeletonAvatar Component
// ============================================================================

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 40,
  shape = 'circle',
  animation = 'pulse',
  className = '',
}) => {
  return (
    <div
      className={`skeleton skeleton--avatar ${getAnimationClass(animation)} ${shape === 'square' ? 'skeleton--radius-md' : 'skeleton--radius-full'} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
};

// ============================================================================
// SkeletonImage Component
// ============================================================================

export const SkeletonImage: React.FC<SkeletonImageProps> = ({
  width = '100%',
  height = 200,
  animation = 'pulse',
  className = '',
}) => {
  return (
    <div
      className={`skeleton skeleton--image ${getAnimationClass(animation)} skeleton--radius-md ${className}`}
      style={{
        width: formatDimension(width),
        height: formatDimension(height),
      }}
      aria-hidden="true"
    />
  );
};

// ============================================================================
// SkeletonCard Component
// ============================================================================

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showHeader = true,
  showAvatar = true,
  bodyLines = 3,
  showFooter = false,
  animation = 'pulse',
  className = '',
}) => {
  return (
    <div className={`skeleton-card ${className}`} aria-hidden="true">
      {showHeader && (
        <div className="skeleton-card__header">
          {showAvatar && <SkeletonAvatar animation={animation} />}
          <div className="skeleton-card__header-text">
            <Skeleton width="60%" height={16} animation={animation} radius="sm" />
            <Skeleton width="40%" height={12} animation={animation} radius="sm" />
          </div>
        </div>
      )}
      <div className="skeleton-card__body">
        <SkeletonText lines={bodyLines} animation={animation} />
      </div>
      {showFooter && (
        <div className="skeleton-card__footer">
          <Skeleton width={80} height={32} animation={animation} radius="md" />
          <Skeleton width={80} height={32} animation={animation} radius="md" />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SkeletonList Component
// ============================================================================

export interface SkeletonListProps {
  /** Number of items */
  items?: number;
  /** Show avatar */
  showAvatar?: boolean;
  /** Number of text lines per item */
  lines?: number;
  /** Animation type */
  animation?: SkeletonAnimation;
  /** Additional class name */
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 3,
  showAvatar = true,
  lines = 2,
  animation = 'pulse',
  className = '',
}) => {
  return (
    <div className={`skeleton-list ${className}`} aria-hidden="true">
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="skeleton-list__item">
          {showAvatar && <SkeletonAvatar animation={animation} />}
          <div className="skeleton-list__content">
            <SkeletonText lines={lines} animation={animation} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// SkeletonTable Component
// ============================================================================

export interface SkeletonTableProps {
  /** Number of rows */
  rows?: number;
  /** Number of columns */
  columns?: number;
  /** Show header row */
  showHeader?: boolean;
  /** Animation type */
  animation?: SkeletonAnimation;
  /** Additional class name */
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  animation = 'pulse',
  className = '',
}) => {
  return (
    <div className={`skeleton-table ${className}`} aria-hidden="true">
      {showHeader && (
        <div className="skeleton-table__header">
          {Array.from({ length: columns }, (_, index) => (
            <div key={index} className="skeleton-table__cell">
              <Skeleton height={20} animation={animation} radius="sm" />
            </div>
          ))}
        </div>
      )}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table__row">
          {Array.from({ length: columns }, (_, colIndex) => (
            <div key={colIndex} className="skeleton-table__cell">
              <Skeleton height={16} animation={animation} radius="sm" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Exports
// ============================================================================

export default Skeleton;
