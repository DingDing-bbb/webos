/**
 * @fileoverview Grid Component - CSS Grid Layout System
 * @module @ui/layout/Grid
 *
 * A 12-column grid system with responsive breakpoints.
 * Supports gap, gutter, and auto-fill/auto-fit modes.
 *
 * @example
 * ```tsx
 * import { Grid, GridItem } from '@webos/ui/layout';
 *
 * // 12-column grid
 * <Grid columns={12} gap={4}>
 *   <GridItem colSpan={8}>Main content (8 cols)</GridItem>
 *   <GridItem colSpan={4}>Sidebar (4 cols)</GridItem>
 * </Grid>
 *
 * // Responsive grid
 * <Grid columns="responsive" gap={3}>
 *   {items.map(item => (
 *     <GridItem key={item.id}>{item.content}</GridItem>
 *   ))}
 * </Grid>
 *
 * // Auto-fill grid
 * <Grid autoFill minItemWidth={200} gap={4}>
 *   {cards.map(card => <Card key={card.id} {...card} />)}
 * </Grid>
 * ```
 */

import React, { forwardRef, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | string;

/**
 * Grid columns options
 */
export type GridColumns =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 'auto-fill'
  | 'auto-fit'
  | 'responsive';

/**
 * Responsive breakpoint columns
 */
export interface ResponsiveColumns {
  xs?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  '2xl'?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

/**
 * Grid component props
 */
export interface GridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Number of columns (1-12), 'auto-fill', 'auto-fit', or 'responsive' */
  columns?: GridColumns;
  /** Responsive column configuration */
  responsiveColumns?: ResponsiveColumns;
  /** Gap between items */
  gap?: SpacingValue;
  /** Row gap */
  rowGap?: SpacingValue;
  /** Column gap */
  columnGap?: SpacingValue;
  /** Minimum item width for auto-fill/auto-fit */
  minItemWidth?: number | string;
  /** Grid auto-flow */
  flow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  /** Align items */
  alignItems?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  /** Justify items */
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  /** Width */
  width?: string | number | 'full' | 'auto' | 'screen';
  /** Height */
  height?: string | number | 'full' | 'auto' | 'screen';
  /** Additional CSS class names */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
  /** Test id for testing */
  testId?: string;
}

/**
 * GridItem component props
 */
export interface GridItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Column span (1-12) */
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  /** Column start position (1-13) */
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'auto';
  /** Column end position (1-13) */
  colEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'auto';
  /** Row span */
  rowSpan?: number;
  /** Row start position */
  rowStart?: number | 'auto';
  /** Row end position */
  rowEnd?: number | 'auto';
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
// Grid Component
// ============================================================================

/**
 * Grid - A 12-column CSS Grid layout system
 *
 * Features:
 * - 12-column grid system
 * - Responsive breakpoints
 * - Auto-fill and auto-fit modes
 * - Gap and gutter support
 * - Grid placement for items
 *
 * @param {GridProps} props - Component props
 * @returns {JSX.Element} Grid container element
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns = 12,
      responsiveColumns,
      gap,
      rowGap,
      columnGap,
      minItemWidth = 200,
      flow,
      alignItems,
      justifyItems,
      width,
      height,
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
      const classes = ['layout-grid'];

      // Columns (static)
      if (typeof columns === 'number') {
        classes.push(`layout-grid--cols-${columns}`);
      } else if (columns === 'auto-fill') {
        classes.push('layout-grid--auto-fill');
      } else if (columns === 'auto-fit') {
        classes.push('layout-grid--auto-fit');
      }

      // Gap
      if (gap !== undefined) {
        classes.push(`layout-gap-${gap}`);
      }

      // Responsive classes
      if (responsiveColumns) {
        if (responsiveColumns.sm) classes.push('layout-grid--responsive-sm');
        if (responsiveColumns.md) classes.push('layout-grid--responsive-md');
        if (responsiveColumns.lg) classes.push('layout-grid--responsive-lg');
        if (responsiveColumns.xl) classes.push('layout-grid--responsive-xl');
        if (responsiveColumns['2xl']) classes.push('layout-grid--responsive-2xl');
      }

      return classes.join(' ');
    }, [columns, gap, responsiveColumns]);

    // Generate inline styles
    const styles = useMemo(() => {
      const style: React.CSSProperties = { ...propStyle };

      // Gap
      if (rowGap !== undefined) {
        style.rowGap = spacingToCSS(rowGap);
      }
      if (columnGap !== undefined) {
        style.columnGap = spacingToCSS(columnGap);
      }

      // Min item width for auto-fill/auto-fit
      if (columns === 'auto-fill' || columns === 'auto-fit') {
        const minWidth = typeof minItemWidth === 'number' ? `${minItemWidth}px` : minItemWidth;
        (style as Record<string, string>)['--grid-item-min'] = minWidth;
      }

      // Grid auto-flow
      if (flow !== undefined) {
        style.gridAutoFlow = flow;
      }

      // Align items
      if (alignItems !== undefined) {
        style.alignItems = alignItems;
      }

      // Justify items
      if (justifyItems !== undefined) {
        style.justifyItems = justifyItems;
      }

      // Dimensions
      if (width !== undefined) {
        style.width = dimensionToCSS(width);
      }
      if (height !== undefined) {
        style.height = dimensionToCSS(height);
      }

      // Responsive columns via media queries (inline)
      if (responsiveColumns) {
        // For a proper implementation, use CSS classes or a CSS-in-JS solution
        // Here we use the base columns
        if (typeof columns === 'number') {
          style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        }
      }

      return style;
    }, [
      columns,
      rowGap,
      columnGap,
      minItemWidth,
      flow,
      alignItems,
      justifyItems,
      width,
      height,
      responsiveColumns,
      propStyle,
    ]);

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

Grid.displayName = 'Grid';

// ============================================================================
// GridItem Component
// ============================================================================

/**
 * GridItem - A child of Grid container
 *
 * Features:
 * - Column and row spanning
 * - Explicit placement
 * - Full TypeScript support
 *
 * @param {GridItemProps} props - Component props
 * @returns {JSX.Element} Grid item element
 */
export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      colSpan = 1,
      colStart,
      colEnd,
      rowSpan,
      rowStart,
      rowEnd,
      className = '',
      children,
      style: propStyle,
      ...rest
    },
    ref
  ) => {
    // Generate class names
    const classNames = useMemo(() => {
      const classes = ['layout-grid__item'];
      return classes.join(' ');
    }, []);

    // Generate inline styles
    const styles = useMemo(() => {
      const style: React.CSSProperties = { ...propStyle };

      // Column span
      if (colSpan === 'full') {
        style.gridColumn = '1 / -1';
      } else if (colSpan !== 1) {
        style.gridColumn = `span ${colSpan}`;
      }

      // Column start/end
      if (colStart !== undefined && colStart !== 'auto') {
        style.gridColumnStart = colStart;
      }
      if (colEnd !== undefined && colEnd !== 'auto') {
        style.gridColumnEnd = colEnd;
      }

      // Row span
      if (rowSpan !== undefined && rowSpan !== 1) {
        style.gridRow = `span ${rowSpan}`;
      }

      // Row start/end
      if (rowStart !== undefined && rowStart !== 'auto') {
        style.gridRowStart = rowStart;
      }
      if (rowEnd !== undefined && rowEnd !== 'auto') {
        style.gridRowEnd = rowEnd;
      }

      return style;
    }, [colSpan, colStart, colEnd, rowSpan, rowStart, rowEnd, propStyle]);

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

GridItem.displayName = 'GridItem';

// ============================================================================
// Exports
// ============================================================================

export default Grid;
