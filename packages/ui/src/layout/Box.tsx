/**
 * @fileoverview Box Component - Universal Layout Container
 * @module @ui/layout/Box
 *
 * A polymorphic box component that serves as the foundation for all layout.
 * Supports padding, margin, width, height, and CSS variable shortcuts.
 *
 * @example
 * ```tsx
 * import { Box } from '@webos/ui/layout';
 *
 * // Basic usage
 * <Box padding={4} margin={2}>
 *   Content
 * </Box>
 *
 * // With acrylic effect
 * <Box variant="acrylic" borderRadius="lg">
 *   Glassmorphic content
 * </Box>
 *
 * // As different element
 * <Box as="section" width="full" height="screen">
 *   Full screen section
 * </Box>
 * ```
 */

import React, { forwardRef, useMemo } from 'react';
import type { JSX } from 'react';

// ============================================================================
// Types
// ============================================================================

type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 'auto' | string;

type DimensionValue = number | string | 'full' | 'screen' | 'auto' | 'min' | 'max' | 'fit';

type CSSProperty = string | number;

/**
 * Box variants for visual styling
 */
export type BoxVariant =
  | 'default'
  | 'acrylic'
  | 'acrylic-light'
  | 'acrylic-dark'
  | 'mica'
  | 'glass'
  | 'solid';

/**
 * Border radius options
 */
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

/**
 * Overflow options
 */
export type OverflowValue = 'auto' | 'hidden' | 'visible' | 'scroll';

/**
 * Position options
 */
export type PositionValue = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

/**
 * Box component props
 */
export interface BoxProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  /** HTML element to render as */
  as?: keyof JSX.IntrinsicElements;
  /** Visual variant */
  variant?: BoxVariant;
  /** Padding - single value or object for individual sides */
  padding?:
    | SpacingValue
    | {
        x?: SpacingValue;
        y?: SpacingValue;
        t?: SpacingValue;
        r?: SpacingValue;
        b?: SpacingValue;
        l?: SpacingValue;
      };
  /** Margin - single value or object for individual sides */
  margin?:
    | SpacingValue
    | {
        x?: SpacingValue;
        y?: SpacingValue;
        t?: SpacingValue;
        r?: SpacingValue;
        b?: SpacingValue;
        l?: SpacingValue;
      };
  /** Width */
  width?: DimensionValue;
  /** Height */
  height?: DimensionValue;
  /** Min width */
  minWidth?: DimensionValue;
  /** Max width */
  maxWidth?: DimensionValue;
  /** Min height */
  minHeight?: DimensionValue;
  /** Max height */
  maxHeight?: DimensionValue;
  /** Border radius */
  borderRadius?: BorderRadius;
  /** Overflow behavior */
  overflow?: OverflowValue;
  /** Overflow-x behavior */
  overflowX?: OverflowValue;
  /** Overflow-y behavior */
  overflowY?: OverflowValue;
  /** Position */
  position?: PositionValue;
  /** Top position */
  top?: CSSProperty;
  /** Right position */
  right?: CSSProperty;
  /** Bottom position */
  bottom?: CSSProperty;
  /** Left position */
  left?: CSSProperty;
  /** Z-index */
  zIndex?: number | 'auto';
  /** Display property */
  display?:
    | 'block'
    | 'inline'
    | 'inline-block'
    | 'flex'
    | 'inline-flex'
    | 'grid'
    | 'inline-grid'
    | 'none';
  /** Flex grow */
  flexGrow?: number;
  /** Flex shrink */
  flexShrink?: number;
  /** Flex basis */
  flexBasis?: CSSProperty;
  /** Opacity */
  opacity?: number;
  /** Background color (CSS variable or value) */
  bgColor?: string;
  /** Text color (CSS variable or value) */
  color?: string;
  /** Box shadow */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
  if (value === 'auto') return 'auto';
  if (value === 0) return '0';
  return `var(--layout-spacing-${value}, ${(value as number) * 4}px)`;
};

/**
 * Convert dimension value to CSS
 */
const dimensionToCSS = (value: DimensionValue | undefined): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value}px`;
  if (value === 'full') return '100%';
  if (value === 'screen') return '100vh';
  if (value === 'auto') return 'auto';
  if (value === 'min') return 'min-content';
  if (value === 'max') return 'max-content';
  if (value === 'fit') return 'fit-content';
  return value;
};

/**
 * Convert border radius to CSS variable
 */
const borderRadiusToCSS = (value: BorderRadius | undefined): string | undefined => {
  if (value === undefined || value === 'none') return undefined;
  return `var(--radius-${value}, 8px)`;
};

/**
 * Convert shadow to CSS variable
 */
const shadowToCSS = (
  value: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | undefined
): string | undefined => {
  if (value === undefined || value === 'none') return undefined;
  return `var(--shadow-${value}, 0 4px 12px rgba(0, 0, 0, 0.25))`;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Box - A polymorphic layout container
 *
 * Features:
 * - Polymorphic: can render as any HTML element
 * - Full spacing control: padding, margin
 * - Dimension control: width, height, min/max
 * - Visual variants: acrylic, glass, solid
 * - Full TypeScript support
 *
 * @param {BoxProps} props - Component props
 * @returns {JSX.Element} Box element
 */
export const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      as: Component = 'div',
      variant = 'default',
      padding,
      margin,
      width,
      height,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      borderRadius,
      overflow,
      overflowX,
      overflowY,
      position,
      top,
      right,
      bottom,
      left,
      zIndex,
      display,
      flexGrow,
      flexShrink,
      flexBasis,
      opacity,
      bgColor,
      color,
      shadow,
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
      const classes = ['layout-box'];

      // Add variant class
      if (variant !== 'default') {
        classes.push(`layout-box--${variant}`);
      }

      return classes.join(' ');
    }, [variant]);

    // Generate inline styles
    const styles = useMemo(() => {
      const style: React.CSSProperties = { ...propStyle };

      // Padding
      if (padding !== undefined) {
        if (typeof padding === 'object') {
          if (padding.t !== undefined) style.paddingTop = spacingToCSS(padding.t);
          if (padding.r !== undefined) style.paddingRight = spacingToCSS(padding.r);
          if (padding.b !== undefined) style.paddingBottom = spacingToCSS(padding.b);
          if (padding.l !== undefined) style.paddingLeft = spacingToCSS(padding.l);
          if (padding.x !== undefined) {
            style.paddingLeft = spacingToCSS(padding.x);
            style.paddingRight = spacingToCSS(padding.x);
          }
          if (padding.y !== undefined) {
            style.paddingTop = spacingToCSS(padding.y);
            style.paddingBottom = spacingToCSS(padding.y);
          }
        } else {
          style.padding = spacingToCSS(padding);
        }
      }

      // Margin
      if (margin !== undefined) {
        if (typeof margin === 'object') {
          if (margin.t !== undefined) style.marginTop = spacingToCSS(margin.t);
          if (margin.r !== undefined) style.marginRight = spacingToCSS(margin.r);
          if (margin.b !== undefined) style.marginBottom = spacingToCSS(margin.b);
          if (margin.l !== undefined) style.marginLeft = spacingToCSS(margin.l);
          if (margin.x !== undefined) {
            style.marginLeft = spacingToCSS(margin.x);
            style.marginRight = spacingToCSS(margin.x);
          }
          if (margin.y !== undefined) {
            style.marginTop = spacingToCSS(margin.y);
            style.marginBottom = spacingToCSS(margin.y);
          }
        } else {
          style.margin = spacingToCSS(margin);
        }
      }

      // Dimensions
      if (width !== undefined) style.width = dimensionToCSS(width);
      if (height !== undefined) style.height = dimensionToCSS(height);
      if (minWidth !== undefined) style.minWidth = dimensionToCSS(minWidth);
      if (maxWidth !== undefined) style.maxWidth = dimensionToCSS(maxWidth);
      if (minHeight !== undefined) style.minHeight = dimensionToCSS(minHeight);
      if (maxHeight !== undefined) style.maxHeight = dimensionToCSS(maxHeight);

      // Border radius
      if (borderRadius !== undefined && borderRadius !== 'none') {
        style.borderRadius = borderRadiusToCSS(borderRadius);
      }

      // Overflow
      if (overflow !== undefined) style.overflow = overflow;
      if (overflowX !== undefined) style.overflowX = overflowX;
      if (overflowY !== undefined) style.overflowY = overflowY;

      // Position
      if (position !== undefined) style.position = position;
      if (top !== undefined) style.top = typeof top === 'number' ? `${top}px` : top;
      if (right !== undefined) style.right = typeof right === 'number' ? `${right}px` : right;
      if (bottom !== undefined) style.bottom = typeof bottom === 'number' ? `${bottom}px` : bottom;
      if (left !== undefined) style.left = typeof left === 'number' ? `${left}px` : left;
      if (zIndex !== undefined) style.zIndex = zIndex;

      // Display and flex
      if (display !== undefined) style.display = display;
      if (flexGrow !== undefined) style.flexGrow = flexGrow;
      if (flexShrink !== undefined) style.flexShrink = flexShrink;
      if (flexBasis !== undefined)
        style.flexBasis = typeof flexBasis === 'number' ? `${flexBasis}px` : flexBasis;

      // Visual
      if (opacity !== undefined) style.opacity = opacity;
      if (bgColor !== undefined) style.backgroundColor = bgColor;
      if (color !== undefined) style.color = color;
      if (shadow !== undefined && shadow !== 'none') style.boxShadow = shadowToCSS(shadow);

      return style;
    }, [
      padding,
      margin,
      width,
      height,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      borderRadius,
      overflow,
      overflowX,
      overflowY,
      position,
      top,
      right,
      bottom,
      left,
      zIndex,
      display,
      flexGrow,
      flexShrink,
      flexBasis,
      opacity,
      bgColor,
      color,
      shadow,
      propStyle,
    ]);

    // Polymorphic component renders as different HTML/SVG elements.
    // The union type of all possible props is too complex for TS to check,
    // so we use createElement to bypass the JSX type-checking.
    return React.createElement(
      Component,
      {
        ref,
        className: `${classNames}${className ? ` ${className}` : ''}`,
        style: styles,
        'data-testid': testId,
        ...rest,
      } as any,
      children
    );
  }
);

Box.displayName = 'Box';

// ============================================================================
// Exports
// ============================================================================

export default Box;
