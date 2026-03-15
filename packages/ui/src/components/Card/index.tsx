/**
 * @fileoverview Card Component
 * @module @ui/components/Card
 *
 * A flexible card component for displaying content in a contained format.
 *
 * @example
 * ```tsx
 * import { Card, CardHeader, CardBody, CardFooter } from '@ui/components/Card';
 *
 * <Card hoverable>
 *   <CardHeader>
 *     <h3>Card Title</h3>
 *   </CardHeader>
 *   <CardBody>
 *     <p>Card content goes here...</p>
 *   </CardBody>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */

import React, { forwardRef, useMemo, createContext, useContext } from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'glass';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: CardVariant;
  /** Enable hover effect */
  hoverable?: boolean;
  /** Enable click interaction */
  clickable?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Title text */
  title?: React.ReactNode;
  /** Subtitle text */
  subtitle?: React.ReactNode;
  /** Action buttons/elements */
  action?: React.ReactNode;
  /** Avatar/icon */
  avatar?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Align content */
  align?: 'left' | 'center' | 'right' | 'between';
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Image source */
  src: string;
  /** Alt text */
  alt: string;
  /** Aspect ratio */
  aspectRatio?: 'auto' | 'square' | 'video' | 'wide';
  /** Object fit */
  objectFit?: 'cover' | 'contain' | 'fill';
  /** Overlay content */
  overlay?: React.ReactNode;
  /** Position: top or bottom */
  position?: 'top' | 'bottom';
  /** Additional CSS class */
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

interface CardContextValue {
  variant: CardVariant;
  hoverable: boolean;
  clickable: boolean;
  disabled: boolean;
}

const CardContext = createContext<CardContextValue>({
  variant: 'default',
  hoverable: false,
  clickable: false,
  disabled: false,
});

export const useCardContext = () => useContext(CardContext);

// ============================================================================
// Card Component
// ============================================================================

/**
 * Card container component with various style variants.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      hoverable = false,
      clickable = false,
      selected = false,
      disabled = false,
      fullWidth = false,
      className = '',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const contextValue = useMemo(
      () => ({ variant, hoverable, clickable, disabled }),
      [variant, hoverable, clickable, disabled]
    );

    const classNames = [
      'card',
      `card--${variant}`,
      hoverable && 'card--hoverable',
      clickable && 'card--clickable',
      selected && 'card--selected',
      disabled && 'card--disabled',
      fullWidth && 'card--full-width',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (clickable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };

    return (
      <CardContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={classNames}
          onClick={disabled ? undefined : onClick}
          onKeyDown={clickable ? handleKeyDown : undefined}
          role={clickable ? 'button' : undefined}
          tabIndex={clickable && !disabled ? 0 : undefined}
          aria-disabled={disabled}
          aria-selected={selected}
          {...props}
        >
          {children}
        </div>
      </CardContext.Provider>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// CardHeader Component
// ============================================================================

/**
 * Card header section with optional title, subtitle, avatar, and action.
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      title,
      subtitle,
      action,
      avatar,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={`card__header ${className}`} {...props}>
        {avatar && <div className="card__header-avatar">{avatar}</div>}
        <div className="card__header-content">
          {title && <div className="card__header-title">{title}</div>}
          {subtitle && <div className="card__header-subtitle">{subtitle}</div>}
          {children}
        </div>
        {action && <div className="card__header-action">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// ============================================================================
// CardBody Component
// ============================================================================

/**
 * Card body section for main content.
 */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`card__body ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// ============================================================================
// CardFooter Component
// ============================================================================

/**
 * Card footer section for actions.
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ align = 'right', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`card__footer card__footer--${align} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// ============================================================================
// CardImage Component
// ============================================================================

/**
 * Card image with optional overlay.
 */
export const CardImage = forwardRef<HTMLImageElement, CardImageProps>(
  (
    {
      src,
      alt,
      aspectRatio = 'auto',
      objectFit = 'cover',
      overlay,
      position = 'top',
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={`card__image-wrapper card__image--${position} card__image--${aspectRatio}`}
      >
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={`card__image card__image--${objectFit} ${className}`}
          {...props}
        />
        {overlay && <div className="card__image-overlay">{overlay}</div>}
      </div>
    );
  }
);

CardImage.displayName = 'CardImage';

// ============================================================================
// Compound Exports
// ============================================================================

export default Card;
