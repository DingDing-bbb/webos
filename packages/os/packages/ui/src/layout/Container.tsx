/**
 * @fileoverview Container Component - Layout Container
 * @module @ui/layout/Container
 *
 * A layout container with fixed/fluid width options, centering, and max-width constraints.
 * Supports acrylic/glass effects for modern UI designs.
 *
 * @example
 * ```tsx
 * import { Container } from '@webos/ui/layout';
 *
 * // Fixed width container
 * <Container size="lg">
 *   <p>Content limited to 1024px width, centered</p>
 * </Container>
 *
 * // Fluid container
 * <Container fluid padding={4}>
 *   <p>Full width content with padding</p>
 * </Container>
 *
 * // Acrylic container
 * <Container size="md" variant="acrylic" centered>
 *   <p>Glassmorphic centered container</p>
 * </Container>
 * ```
 */

import React, { forwardRef, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Container size options
 */
export type ContainerSize =
  | 'xs' // 480px
  | 'sm' // 640px
  | 'md' // 768px
  | 'lg' // 1024px
  | 'xl' // 1280px
  | '2xl' // 1536px
  | 'full'; // 100%

/**
 * Container variant options
 */
export type ContainerVariant =
  | 'default'
  | 'acrylic'
  | 'acrylic-light'
  | 'acrylic-dark'
  | 'mica'
  | 'glass'
  | 'solid';

/**
 * Container component props
 */
export interface ContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Maximum width size */
  size?: ContainerSize;
  /** Fluid width (no max-width) */
  fluid?: boolean;
  /** Visual variant */
  variant?: ContainerVariant;
  /** Center content vertically */
  centered?: boolean;
  /** Horizontal padding (gutter) */
  padding?: SpacingValue;
  /** Horizontal padding override */
  paddingX?: SpacingValue;
  /** Vertical padding */
  paddingY?: SpacingValue;
  /** Border radius */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Additional CSS class names */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
  /** Test id for testing */
  testId?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert spacing value to CSS
 */
const spacingToCSS = (value: SpacingValue | undefined): string | undefined => {
  if (value === undefined) return undefined;
  if (value === 0) return '0';
  return `var(--layout-spacing-${value}, ${value * 4}px)`;
};

/**
 * Convert border radius to CSS variable
 */
const borderRadiusToCSS = (
  value: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | undefined
): string | undefined => {
  if (value === undefined || value === 'none') return undefined;
  return `var(--radius-${value}, 8px)`;
};

// ============================================================================
// Container Component
// ============================================================================

/**
 * Container - A layout container with width constraints
 *
 * Features:
 * - Fixed or fluid width
 * - Auto centering
 * - Acrylic/glass effects
 * - Responsive gutters
 *
 * @param {ContainerProps} props - Component props
 * @returns {JSX.Element} Container element
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      size = 'lg',
      fluid = false,
      variant = 'default',
      centered = false,
      padding,
      paddingX,
      paddingY,
      borderRadius,
      className = '',
      children,
      testId,
      style: propStyle,
      ...rest
    },
    ref
  ) => {
    // Generate class names
    const classNames = useMemo(() => {
      const classes = ['layout-container'];

      // Size
      if (!fluid) {
        classes.push(`layout-container--${size}`);
      } else {
        classes.push('layout-container--fluid');
      }

      // Variant
      if (variant !== 'default') {
        classes.push(`layout-box--${variant}`);
      }

      // Centered
      if (centered) {
        classes.push('layout-container--centered');
      }

      return classes.join(' ');
    }, [size, fluid, variant, centered]);

    // Generate inline styles
    const styles = useMemo(() => {
      const style: React.CSSProperties = { ...propStyle };

      // Padding
      if (padding !== undefined) {
        style.padding = spacingToCSS(padding);
      }
      if (paddingX !== undefined) {
        style.paddingLeft = spacingToCSS(paddingX);
        style.paddingRight = spacingToCSS(paddingX);
      }
      if (paddingY !== undefined) {
        style.paddingTop = spacingToCSS(paddingY);
        style.paddingBottom = spacingToCSS(paddingY);
      }

      // Border radius
      if (borderRadius !== undefined && borderRadius !== 'none') {
        style.borderRadius = borderRadiusToCSS(borderRadius);
      }

      return style;
    }, [padding, paddingX, paddingY, borderRadius, propStyle]);

    return (
      <div
        ref={ref}
        className={`${classNames}${className ? ` ${className}` : ''}`}
        style={styles}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

// ============================================================================
// Utility Container Components
// ============================================================================

/**
 * Section - Semantic container for page sections
 */
export interface SectionProps extends ContainerProps {
  /** HTML element to render as */
  as?: 'section' | 'article' | 'aside' | 'main' | 'div';
}

type SectionElement = HTMLElement & HTMLDivElement;

export const Section = forwardRef<SectionElement, SectionProps>(
  ({ as: Component = 'section', children, ...props }, ref) => {
    return (
      <Component
        ref={ref as React.Ref<SectionElement>}
        {...(props as React.HTMLAttributes<HTMLElement>)}
      >
        {children}
      </Component>
    );
  }
);

Section.displayName = 'Section';

/**
 * Center - A container that centers its content
 */
export interface CenterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Center horizontally */
  horizontal?: boolean;
  /** Center vertically */
  vertical?: boolean;
  /** Max width */
  maxWidth?: string | number;
  /** Additional CSS class names */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
}

export const Center = forwardRef<HTMLDivElement, CenterProps>(
  (
    {
      horizontal = true,
      vertical = true,
      maxWidth,
      className = '',
      children,
      style: propStyle,
      ...rest
    },
    ref
  ) => {
    const styles = useMemo(() => {
      const style: React.CSSProperties = {
        ...propStyle,
        display: 'flex',
      };

      if (horizontal) {
        style.justifyContent = 'center';
      }
      if (vertical) {
        style.alignItems = 'center';
      }
      if (maxWidth !== undefined) {
        style.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
      }

      return style;
    }, [horizontal, vertical, maxWidth, propStyle]);

    return (
      <div ref={ref} className={className} style={styles} {...rest}>
        {children}
      </div>
    );
  }
);

Center.displayName = 'Center';

// ============================================================================
// Exports
// ============================================================================

export default Container;
