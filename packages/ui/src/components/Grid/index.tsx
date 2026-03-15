/**
 * @fileoverview Grid Component - CSS Grid Container
 * @module @ui/components/Grid
 *
 * A CSS Grid wrapper component with all grid properties exposed as props.
 * Provides a declarative API for building grid layouts.
 *
 * @example
 * ```tsx
 * import { Grid, GridItem } from '@ui/components/Grid';
 *
 * // Basic grid
 * <Grid columns={3} gap={4}>
 *   <GridItem>1</GridItem>
 *   <GridItem>2</GridItem>
 *   <GridItem>3</GridItem>
 * </Grid>
 *
 * // With span
 * <Grid columns={12} gap={2}>
 *   <GridItem colSpan={8}>Main content</GridItem>
 *   <GridItem colSpan={4}>Sidebar</GridItem>
 * </Grid>
 *
 * // With areas
 * <Grid
 *   templateAreas={`
 *     "header header header"
 *     "sidebar main main"
 *     "footer footer footer"
 *   `}
 *   gap={4}
 * >
 *   <GridItem area="header">Header</GridItem>
 *   <GridItem area="sidebar">Sidebar</GridItem>
 *   <GridItem area="main">Main</GridItem>
 *   <GridItem area="footer">Footer</GridItem>
 * </Grid>
 * ```
 */

import React from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

/** Spacing values */
type SpacingValue = number | string | 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/** Grid auto flow values */
type GridAutoFlow = 'row' | 'column' | 'dense' | 'row dense' | 'column dense';

/** Grid auto values */
type GridAuto = 'auto' | 'min-content' | 'max-content' | 'minmax' | string;

/** Justify items values */
type JustifyItems = 'start' | 'end' | 'center' | 'stretch';

/** Align items values */
type AlignItems = 'start' | 'end' | 'center' | 'stretch';

/** Justify content values */
type JustifyContent = 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';

/** Align content values */
type AlignContent = 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';

/** Justify self values */
type JustifySelf = 'auto' | 'start' | 'end' | 'center' | 'stretch';

/** Align self values */
type AlignSelf = 'auto' | 'start' | 'end' | 'center' | 'stretch';

/** Responsive value */
type ResponsiveValue<T> = T | {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
};

interface GridProps {
  /** Number of columns (shorthand) */
  columns?: number | string;
  /** Number of rows (shorthand) */
  rows?: number | string;
  /** Gap between items */
  gap?: ResponsiveValue<SpacingValue>;
  /** Column gap */
  gapX?: ResponsiveValue<SpacingValue>;
  /** Row gap */
  gapY?: ResponsiveValue<SpacingValue>;
  /** Grid template columns */
  templateColumns?: string;
  /** Grid template rows */
  templateRows?: string;
  /** Grid template areas */
  templateAreas?: string;
  /** Grid auto columns */
  autoColumns?: GridAuto;
  /** Grid auto rows */
  autoRows?: GridAuto;
  /** Grid auto flow */
  autoFlow?: GridAutoFlow;
  /** Justify items */
  justifyItems?: JustifyItems;
  /** Align items */
  alignItems?: AlignItems;
  /** Justify content */
  justifyContent?: JustifyContent;
  /** Align content */
  alignContent?: AlignContent;
  /** Display as inline-grid */
  inline?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Children */
  children?: React.ReactNode;
  /** Test ID */
  testId?: string;
  /** ID attribute */
  id?: string;
  /** Aria label */
  'aria-label'?: string;
}

interface GridItemProps {
  /** Column start */
  colStart?: number | string;
  /** Column end */
  colEnd?: number | string;
  /** Column span */
  colSpan?: number | string;
  /** Row start */
  rowStart?: number | string;
  /** Row end */
  rowEnd?: number | string;
  /** Row span */
  rowSpan?: number | string;
  /** Grid area name */
  area?: string;
  /** Justify self */
  justifySelf?: JustifySelf;
  /** Align self */
  alignSelf?: AlignSelf;
  /** Order */
  order?: number;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Children */
  children?: React.ReactNode;
  /** Test ID */
  testId?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Maps spacing value to CSS value
 */
const getSpacingValue = (value: SpacingValue): string => {
  if (typeof value === 'number') {
    return `calc(var(--spacing-base, 4px) * ${value})`;
  }
  
  const spacingMap: Record<string, string> = {
    'none': '0',
    'xs': 'var(--spacing-xs, 2px)',
    'sm': 'var(--spacing-sm, 4px)',
    'md': 'var(--spacing-md, 8px)',
    'lg': 'var(--spacing-lg, 16px)',
    'xl': 'var(--spacing-xl, 24px)',
    '2xl': 'var(--spacing-2xl, 32px)',
    '3xl': 'var(--spacing-3xl, 48px)',
  };
  
  return spacingMap[value] || value;
};

/**
 * Get current breakpoint value from responsive prop
 */
const getBreakpointValue = <T,>(value: ResponsiveValue<T> | undefined, defaultValue: T): T => {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'object' || value === null) return value;
  if ('base' in value) return value.base ?? defaultValue;
  return value as T;
};

/**
 * Generate repeat template string
 */
const generateRepeatTemplate = (count: number, size: string = '1fr'): string => {
  return `repeat(${count}, ${size})`;
};

/**
 * Generate CSS styles for Grid container
 */
const generateGridStyles = (props: GridProps): React.CSSProperties => {
  const styles: React.CSSProperties = {
    display: props.inline ? 'inline-grid' : 'grid',
  };
  
  // Columns (shorthand)
  if (props.columns !== undefined) {
    if (typeof props.columns === 'number') {
      styles.gridTemplateColumns = generateRepeatTemplate(props.columns);
    } else {
      styles.gridTemplateColumns = props.columns;
    }
  }
  
  // Rows (shorthand)
  if (props.rows !== undefined) {
    if (typeof props.rows === 'number') {
      styles.gridTemplateRows = generateRepeatTemplate(props.rows);
    } else {
      styles.gridTemplateRows = props.rows;
    }
  }
  
  // Template columns
  if (props.templateColumns) {
    styles.gridTemplateColumns = props.templateColumns;
  }
  
  // Template rows
  if (props.templateRows) {
    styles.gridTemplateRows = props.templateRows;
  }
  
  // Template areas
  if (props.templateAreas) {
    styles.gridTemplateAreas = props.templateAreas;
  }
  
  // Auto columns
  if (props.autoColumns) {
    styles.gridAutoColumns = props.autoColumns;
  }
  
  // Auto rows
  if (props.autoRows) {
    styles.gridAutoRows = props.autoRows;
  }
  
  // Auto flow
  if (props.autoFlow) {
    styles.gridAutoFlow = props.autoFlow;
  }
  
  // Gap
  const gap = getBreakpointValue(props.gap, undefined);
  if (gap !== undefined) {
    styles.gap = getSpacingValue(gap);
  }
  
  // Gap X (column gap)
  const gapX = getBreakpointValue(props.gapX, undefined);
  if (gapX !== undefined) styles.columnGap = getSpacingValue(gapX);
  
  // Gap Y (row gap)
  const gapY = getBreakpointValue(props.gapY, undefined);
  if (gapY !== undefined) styles.rowGap = getSpacingValue(gapY);
  
  // Justify items
  if (props.justifyItems) styles.justifyItems = props.justifyItems;
  
  // Align items
  if (props.alignItems) styles.alignItems = props.alignItems;
  
  // Justify content
  if (props.justifyContent) styles.justifyContent = props.justifyContent;
  
  // Align content
  if (props.alignContent) styles.alignContent = props.alignContent;
  
  return styles;
};

/**
 * Generate CSS styles for GridItem
 */
const generateGridItemStyles = (props: GridItemProps): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  // Column start
  if (props.colStart !== undefined) {
    styles.gridColumnStart = typeof props.colStart === 'number' ? props.colStart : props.colStart;
  }
  
  // Column end
  if (props.colEnd !== undefined) {
    styles.gridColumnEnd = typeof props.colEnd === 'number' ? props.colEnd : props.colEnd;
  }
  
  // Column span
  if (props.colSpan !== undefined) {
    if (typeof props.colSpan === 'number') {
      styles.gridColumn = `span ${props.colSpan} / span ${props.colSpan}`;
    } else {
      styles.gridColumn = props.colSpan;
    }
  }
  
  // Row start
  if (props.rowStart !== undefined) {
    styles.gridRowStart = typeof props.rowStart === 'number' ? props.rowStart : props.rowStart;
  }
  
  // Row end
  if (props.rowEnd !== undefined) {
    styles.gridRowEnd = typeof props.rowEnd === 'number' ? props.rowEnd : props.rowEnd;
  }
  
  // Row span
  if (props.rowSpan !== undefined) {
    if (typeof props.rowSpan === 'number') {
      styles.gridRow = `span ${props.rowSpan} / span ${props.rowSpan}`;
    } else {
      styles.gridRow = props.rowSpan;
    }
  }
  
  // Area
  if (props.area) {
    styles.gridArea = props.area;
  }
  
  // Justify self
  if (props.justifySelf && props.justifySelf !== 'auto') {
    styles.justifySelf = props.justifySelf;
  }
  
  // Align self
  if (props.alignSelf && props.alignSelf !== 'auto') {
    styles.alignSelf = props.alignSelf;
  }
  
  // Order
  if (props.order !== undefined) {
    styles.order = props.order;
  }
  
  return styles;
};

/**
 * Generate BEM class names for Grid
 */
const generateGridClassNames = (props: GridProps): string => {
  const classes = ['grid'];
  
  // Inline modifier
  if (props.inline) {
    classes.push('grid--inline');
  }
  
  // Custom className
  if (props.className) {
    classes.push(props.className);
  }
  
  return classes.join(' ');
};

/**
 * Generate BEM class names for GridItem
 */
const generateGridItemClassNames = (props: GridItemProps): string => {
  const classes = ['grid__item'];
  
  // Custom className
  if (props.className) {
    classes.push(props.className);
  }
  
  return classes.join(' ');
};

// ============================================================================
// Components
// ============================================================================

/**
 * Grid is a CSS Grid container component that provides a declarative API
 * for building grid-based layouts.
 *
 * Features:
 * - All grid container properties as props
 * - Shorthand props for common patterns
 * - Responsive value support
 * - Inline grid support
 * - BEM naming convention
 * - Light and dark theme support
 *
 * @param {GridProps} props - Component props
 * @returns {JSX.Element} Grid container element
 */
export const Grid: React.FC<GridProps> = ({
  columns,
  rows,
  gap,
  gapX,
  gapY,
  templateColumns,
  templateRows,
  templateAreas,
  autoColumns,
  autoRows,
  autoFlow,
  justifyItems,
  alignItems,
  justifyContent,
  alignContent,
  inline = false,
  className,
  style,
  children,
  testId,
  id,
  'aria-label': ariaLabel,
}) => {
  const generatedStyles = generateGridStyles({
    columns,
    rows,
    gap,
    gapX,
    gapY,
    templateColumns,
    templateRows,
    templateAreas,
    autoColumns,
    autoRows,
    autoFlow,
    justifyItems,
    alignItems,
    justifyContent,
    alignContent,
    inline,
  });
  const combinedStyles = { ...generatedStyles, ...style };
  const classNames = generateGridClassNames({
    inline,
    className,
  });
  
  return (
    <div
      className={classNames}
      style={combinedStyles}
      data-testid={testId}
      id={id}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};

Grid.displayName = 'Grid';

/**
 * GridItem is a child component of Grid that provides control over
 * how an individual item is placed within the grid.
 *
 * Features:
 * - Column and row placement props
 * - Span support for both columns and rows
 * - Named area support
 * - Justify/align self support
 * - BEM naming convention
 *
 * @param {GridItemProps} props - Component props
 * @returns {JSX.Element} Grid item element
 */
export const GridItem: React.FC<GridItemProps> = ({
  colStart,
  colEnd,
  colSpan,
  rowStart,
  rowEnd,
  rowSpan,
  area,
  justifySelf,
  alignSelf,
  order,
  className,
  style,
  children,
  testId,
}) => {
  const generatedStyles = generateGridItemStyles({
    colStart,
    colEnd,
    colSpan,
    rowStart,
    rowEnd,
    rowSpan,
    area,
    justifySelf,
    alignSelf,
    order,
  });
  const combinedStyles = { ...generatedStyles, ...style };
  const classNames = generateGridItemClassNames({ className });
  
  return (
    <div
      className={classNames}
      style={combinedStyles}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

GridItem.displayName = 'GridItem';

export default Grid;
