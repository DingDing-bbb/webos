/**
 * @fileoverview Flex Component - Flexible Layout Container
 * @module @ui/layout/Flex
 *
 * A flexible box layout component with direction, wrap, justify, align, and gap support.
 * Built on CSS Flexbox with intuitive props API.
 *
 * @example
 * ```tsx
 * import { Flex, FlexItem } from '@webos/ui/layout';
 *
 * // Basic flex container
 * <Flex justify="center" align="center" gap={4}>
 *   <FlexItem grow>Left side</FlexItem>
 *   <FlexItem shrink={0}>Right side</FlexItem>
 * </Flex>
 *
 * // Column layout
 * <Flex direction="column" gap={2}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Flex>
 *
 * // Wrap items
 * <Flex wrap gap={3}>
 *   {items.map(item => <div key={item.id}>{item.name}</div>)}
 * </Flex>
 * ```
 */

import React, { forwardRef, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | string;

/**
 * Flex direction options
 */
export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

/**
 * Flex wrap options
 */
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

/**
 * Flex justify content options
 */
export type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

/**
 * Flex align items options
 */
export type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

/**
 * Flex component props
 */
export interface FlexProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Flex direction */
  direction?: FlexDirection;
  /** Flex wrap */
  wrap?: FlexWrap | boolean;
  /** Justify content */
  justify?: FlexJustify;
  /** Align items */
  align?: FlexAlign;
  /** Gap between items */
  gap?: SpacingValue;
  /** Row gap */
  rowGap?: SpacingValue;
  /** Column gap */
  columnGap?: SpacingValue;
  /** Inline flex */
  inline?: boolean;
  /** Width */
  width?: string | number | 'full' | 'auto' | 'screen';
  /** Height */
  height?: string | number | 'full' | 'auto' | 'screen';
  /** Padding */
  padding?: SpacingValue;
  /** Additional CSS class names */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
  /** Test id for testing */
  testId?: string;
}

/**
 * FlexItem component props
 */
export interface FlexItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Flex grow */
  grow?: boolean | number;
  /** Flex shrink */
  shrink?: boolean | number;
  /** Flex basis */
  basis?: string | number | 'auto' | 'full';
  /** Align self */
  alignSelf?: FlexAlign;
  /** Order */
  order?: number;
  /** Additional CSS class names */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
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
  return `var(--layout-spacing-${value}, ${(value as number) * 4}px)`;
};

/**
 * Convert dimension to CSS
 */
const dimensionToCSS = (
  value: string | number | 'full' | 'auto' | 'screen' | undefined
): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value}px`;
  if (value === 'full') return '100%';
  if (value === 'screen') return '100vh';
  return value;
};

// ============================================================================
// Flex Component
// ============================================================================

/**
 * Flex - A flexible layout container
 *
 * Features:
 * - Full Flexbox support
 * - Direction, wrap, justify, align props
 * - Gap support
 * - Responsive helpers
 *
 * @param {FlexProps} props - Component props
 * @returns {JSX.Element} Flex container element
 */
export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction = 'row',
      wrap = 'nowrap',
      justify = 'start',
      align = 'stretch',
      gap,
      rowGap,
      columnGap,
      inline = false,
      width,
      height,
      padding,
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
      const classes = ['layout-flex'];

      // Direction
      classes.push(`layout-flex--${direction}`);

      // Wrap
      const wrapValue = typeof wrap === 'boolean' ? (wrap ? 'wrap' : 'nowrap') : wrap;
      classes.push(`layout-flex--${wrapValue}`);

      // Justify
      classes.push(`layout-flex--justify-${justify}`);

      // Align
      classes.push(`layout-flex--align-${align}`);

      // Gap
      if (gap !== undefined) {
        classes.push(`layout-gap-${gap}`);
      }

      return classes.join(' ');
    }, [direction, wrap, justify, align, gap]);

    // Generate inline styles
    const styles = useMemo(() => {
      const style: React.CSSProperties = {
        ...propStyle,
        display: inline ? 'inline-flex' : 'flex',
      };

      // Gap (row and column)
      if (rowGap !== undefined) {
        style.rowGap = spacingToCSS(rowGap);
      }
      if (columnGap !== undefined) {
        style.columnGap = spacingToCSS(columnGap);
      }

      // Dimensions
      if (width !== undefined) {
        style.width = dimensionToCSS(width);
      }
      if (height !== undefined) {
        style.height = dimensionToCSS(height);
      }

      // Padding
      if (padding !== undefined) {
        style.padding = spacingToCSS(padding);
      }

      return style;
    }, [inline, rowGap, columnGap, width, height, padding, propStyle]);

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

Flex.displayName = 'Flex';

// ============================================================================
// FlexItem Component
// ============================================================================

/**
 * FlexItem - A child of Flex container
 *
 * Features:
 * - Grow, shrink, basis support
 * - Align self override
 * - Order support
 *
 * @param {FlexItemProps} props - Component props
 * @returns {JSX.Element} Flex item element
 */
export const FlexItem = forwardRef<HTMLDivElement, FlexItemProps>(
  (
    {
      grow = false,
      shrink = true,
      basis = 'auto',
      alignSelf,
      order,
      className = '',
      children,
      style: propStyle,
      ...rest
    },
    ref
  ) => {
    // Generate class names
    const classNames = useMemo(() => {
      const classes = ['layout-flex__item'];

      // Grow
      if (grow) {
        classes.push('layout-flex__item--grow');
      }

      // Shrink
      if (!shrink) {
        classes.push('layout-flex__item--noshrink');
      }

      return classes.join(' ');
    }, [grow, shrink]);

    // Generate inline styles
    const styles = useMemo(() => {
      const style: React.CSSProperties = { ...propStyle };

      // Flex properties
      style.flexGrow = typeof grow === 'number' ? grow : grow ? 1 : 0;
      style.flexShrink = typeof shrink === 'number' ? shrink : shrink ? 1 : 0;
      style.flexBasis =
        basis === 'full' ? '100%' : typeof basis === 'number' ? `${basis}px` : basis;

      // Align self
      if (alignSelf !== undefined) {
        const alignSelfMap: Record<FlexAlign, string> = {
          start: 'flex-start',
          end: 'flex-end',
          center: 'center',
          baseline: 'baseline',
          stretch: 'stretch',
        };
        style.alignSelf = alignSelfMap[alignSelf];
      }

      // Order
      if (order !== undefined) {
        style.order = order;
      }

      return style;
    }, [grow, shrink, basis, alignSelf, order, propStyle]);

    return (
      <div
        ref={ref}
        className={`${classNames}${className ? ` ${className}` : ''}`}
        style={styles}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

FlexItem.displayName = 'FlexItem';

// ============================================================================
// Exports
// ============================================================================

export default Flex;
