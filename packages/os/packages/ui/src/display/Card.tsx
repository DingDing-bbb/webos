/**
 * @fileoverview Card Component
 * @module @ui/display/Card
 *
 * A versatile card component with header, footer, media area,
 * hover effects, and acrylic background support.
 *
 * @example
 * ```tsx
 * import { Card } from '@ui/display';
 *
 * <Card
 *   title="Card Title"
 *   cover={<img src="image.jpg" alt="cover" />}
 *   hoverable
 * >
 *   <p>Card content</p>
 * </Card>
 * ```
 */

import React, { forwardRef, useState, memo } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface CardProps {
  /** Card title */
  title?: React.ReactNode;
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated' | 'glass' | 'selected' | 'outline';
  /** Card subtitle */
  subtitle?: React.ReactNode;
  /** Extra content in header (actions, etc.) */
  extra?: React.ReactNode;
  /** Cover image/media */
  cover?: React.ReactNode;
  /** Card actions */
  actions?: Array<{
    key: string;
    icon?: React.ReactNode;
    text?: string;
    onClick?: () => void;
  }>;
  /** Card content */
  children?: React.ReactNode;
  /** Hoverable effect */
  hoverable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Bordered style */
  bordered?: boolean;
  /** Acrylic background effect */
  acrylic?: boolean;
  /** Card size */
  size?: 'small' | 'default' | 'large';
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Click handler */
  onClick?: () => void;
  /** Inner padding */
  padding?: boolean | number | string;
}

export interface CardHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface CardBodyProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: boolean | number | string;
}

export interface CardFooterProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface CardCoverProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface CardActionsProps {
  actions: Array<{
    key: string;
    icon?: React.ReactNode;
    text?: string;
    onClick?: () => void;
  }>;
  className?: string;
}

export interface CardMetaProps {
  avatar?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// Sub-Components
// ============================================================================

export const CardHeader: React.FC<CardHeaderProps> = memo(
  ({ title, subtitle, extra, className = '', style }) => {
    if (!title && !extra) return null;

    return (
      <div className={`ui-card-header ${className}`} style={style}>
        <div className="ui-card-header-content">
          {title && <div className="ui-card-title">{title}</div>}
          {subtitle && <div className="ui-card-subtitle">{subtitle}</div>}
        </div>
        {extra && <div className="ui-card-extra">{extra}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardBody: React.FC<CardBodyProps> = memo(
  ({ children, className = '', style, padding }) => {
    const bodyStyle: React.CSSProperties = { ...style };

    if (padding !== undefined) {
      if (padding === false) {
        bodyStyle.padding = 0;
      } else if (typeof padding === 'number') {
        bodyStyle.padding = `${padding}px`;
      } else if (typeof padding === 'string') {
        bodyStyle.padding = padding;
      }
    }

    return (
      <div className={`ui-card-body ${className}`} style={bodyStyle}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

export const CardFooter: React.FC<CardFooterProps> = memo(({ children, className = '', style }) => {
  if (!children) return null;

  return (
    <div className={`ui-card-footer ${className}`} style={style}>
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export const CardCover: React.FC<CardCoverProps> = memo(({ children, className = '', style }) => {
  if (!children) return null;

  return (
    <div className={`ui-card-cover ${className}`} style={style}>
      {children}
    </div>
  );
});

CardCover.displayName = 'CardCover';

export const CardActions: React.FC<CardActionsProps> = memo(({ actions, className = '' }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <ul className={`ui-card-actions ${className}`}>
      {actions.map((action) => (
        <li key={action.key} className="ui-card-action-item">
          <button type="button" className="ui-card-action-btn" onClick={action.onClick}>
            {action.icon && <span className="action-icon">{action.icon}</span>}
            {action.text && <span className="action-text">{action.text}</span>}
          </button>
        </li>
      ))}
    </ul>
  );
});

CardActions.displayName = 'CardActions';

export const CardMeta: React.FC<CardMetaProps> = memo(
  ({ avatar, title, description, className = '', style }) => {
    return (
      <div className={`ui-card-meta ${className}`} style={style}>
        {avatar && <div className="ui-card-meta-avatar">{avatar}</div>}
        <div className="ui-card-meta-content">
          {title && <div className="ui-card-meta-title">{title}</div>}
          {description && <div className="ui-card-meta-description">{description}</div>}
        </div>
      </div>
    );
  }
);

CardMeta.displayName = 'CardMeta';

// ============================================================================
// Loading Skeleton
// ============================================================================

interface CardLoadingProps {
  hasCover?: boolean;
  hasAvatar?: boolean;
  rows?: number;
}

const CardLoading: React.FC<CardLoadingProps> = ({
  hasCover = false,
  hasAvatar = false,
  rows = 3,
}) => (
  <div className="ui-card-loading">
    {hasCover && <div className="skeleton-cover" />}
    <div className="skeleton-content">
      {hasAvatar && (
        <div className="skeleton-header">
          <div className="skeleton-avatar" />
          <div className="skeleton-title-group">
            <div className="skeleton-title" />
            <div className="skeleton-subtitle" />
          </div>
        </div>
      )}
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="skeleton-row"
          style={{ width: `${Math.random() * 30 + 70}%` }}
        />
      ))}
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      subtitle,
      extra,
      cover,
      actions,
      children,
      hoverable = false,
      loading = false,
      bordered = true,
      acrylic = false,
      size = 'default',
      className = '',
      style,
      onClick,
      padding = true,
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const cardClasses = [
      'ui-card',
      `ui-card-${size}`,
      hoverable ? 'ui-card-hoverable' : '',
      bordered ? 'ui-card-bordered' : '',
      acrylic ? 'ui-card-acrylic' : '',
      onClick ? 'ui-card-clickable' : '',
      isHovered ? 'ui-card-hovered' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = () => {
      onClick?.();
    };

    const handleMouseEnter = () => {
      if (hoverable) {
        setIsHovered(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    return (
      <div
        ref={ref}
        className={cardClasses}
        style={style}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {loading ? (
          <CardLoading hasCover={!!cover} rows={3} />
        ) : (
          <>
            {cover && <CardCover>{cover}</CardCover>}

            {(title || extra) && <CardHeader title={title} subtitle={subtitle} extra={extra} />}

            {children && <CardBody padding={padding}>{children}</CardBody>}

            {actions && actions.length > 0 && <CardActions actions={actions} />}
          </>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// Card Grid
// ============================================================================

export interface CardGridProps {
  children?: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = 3,
  gap = 16,
  className = '',
  style,
}) => {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: `${gap}px`,
    ...style,
  };

  return (
    <div className={`ui-card-grid ${className}`} style={gridStyle}>
      {children}
    </div>
  );
};

// ============================================================================
// Card Group
// ============================================================================

export interface CardGroupProps {
  children?: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

export const CardGroup: React.FC<CardGroupProps> = ({
  children,
  direction = 'vertical',
  className = '',
  style,
}) => {
  return (
    <div className={`ui-card-group ui-card-group-${direction} ${className}`} style={style}>
      {children}
    </div>
  );
};

export default Card;
