/**
 * @fileoverview Flex Component - Flexbox Container
 * @module @ui/components/Flex
 *
 * A flexbox container component with all flex properties exposed as props.
 * Provides a declarative API for building flex layouts.
 *
 * @example
 * ```tsx
 * import { Flex, FlexItem } from '@ui/components/Flex';
 *
 * // Basic flex container
 * <Flex gap={4} align="center">
 *   <FlexItem grow>Flexible item</FlexItem>
 *   <FlexItem shrink={0}>Fixed item</FlexItem>
 * </Flex>
 *
 * // Inline flex
 * <Flex inline gap={2}>
 *   <span>Item 1</span>
 *   <span>Item 2</span>
 * </Flex>
 *
 * // With responsive props
 * <Flex
 *   direction={{ base: 'column', md: 'row' }}
 *   gap={{ base: 2, md: 4 }}
 * >
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Flex>
 * ```
 */

import React from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

/** Flex direction values */
type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

/** Flex wrap values */
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

/** Justify content values */
type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

/** Align items values */
type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';

/** Align content values */
type AlignContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';

/** Spacing values */
type SpacingValue = number | string | 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/** Responsive value */
type ResponsiveValue<T> = T | {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
};

interface FlexProps {
  /** Flex direction */
  direction?: ResponsiveValue<FlexDirection>;
  /** Flex wrap */
  wrap?: ResponsiveValue<FlexWrap>;
  /** Justify content */
  justify?: ResponsiveValue<JustifyContent>;
  /** Align items */
  align?: ResponsiveValue<AlignItems>;
  /** Align content (for multi-line flex containers) */
  alignContent?: ResponsiveValue<AlignContent>;
  /** Gap between items */
  gap?: ResponsiveValue<SpacingValue>;
  /** Row gap */
  gapX?: ResponsiveValue<SpacingValue>;
  /** Column gap */
  gapY?: ResponsiveValue<SpacingValue>;
  /** Display as inline-flex */
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

interface FlexItemProps {
  /** Flex grow factor */
  grow?: boolean | number;
  /** Flex shrink factor */
  shrink?: boolean | number;
  /** Flex basis */
  basis?: string | number | 'auto';
  /** Flex shorthand (overrides grow, shrink, basis) */
  flex?: string;
  /** Align self */
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
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
 * Generate CSS styles for Flex container
 */
const generateFlexStyles = (props: FlexProps): React.CSSProperties => {
  const styles: React.CSSProperties = {
    display: props.inline ? 'inline-flex' : 'flex',
  };
  
  // Direction
  const direction = getBreakpointValue(props.direction, 'row');
  if (direction !== 'row') styles.flexDirection = direction;
  
  // Wrap
  const wrap = getBreakpointValue(props.wrap, 'nowrap');
  if (wrap !== 'nowrap') styles.flexWrap = wrap;
  
  // Justify
  const justify = getBreakpointValue(props.justify, 'flex-start');
  if (justify !== 'flex-start') styles.justifyContent = justify;
  
  // Align items
  const align = getBreakpointValue(props.align, 'stretch');
  if (align !== 'stretch') styles.alignItems = align;
  
  // Align content
  const alignContent = getBreakpointValue(props.alignContent, undefined);
  if (alignContent) styles.alignContent = alignContent;
  
  // Gap
  const gap = getBreakpointValue(props.gap, undefined);
  if (gap !== undefined) styles.gap = getSpacingValue(gap);
  
  // Gap X (column gap)
  const gapX = getBreakpointValue(props.gapX, undefined);
  if (gapX !== undefined) styles.columnGap = getSpacingValue(gapX);
  
  // Gap Y (row gap)
  const gapY = getBreakpointValue(props.gapY, undefined);
  if (gapY !== undefined) styles.rowGap = getSpacingValue(gapY);
  
  return styles;
};

/**
 * Generate CSS styles for FlexItem
 */
const generateFlexItemStyles = (props: FlexItemProps): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  // Flex shorthand
  if (props.flex) {
    styles.flex = props.flex;
  } else {
    // Grow
    if (props.grow !== undefined) {
      styles.flexGrow = typeof props.grow === 'boolean' ? (props.grow ? 1 : 0) : props.grow;
    }
    
    // Shrink
    if (props.shrink !== undefined) {
      styles.flexShrink = typeof props.shrink === 'boolean' ? (props.shrink ? 1 : 0) : props.shrink;
    }
    
    // Basis
    if (props.basis !== undefined) {
      styles.flexBasis = typeof props.basis === 'number' ? `${props.basis}px` : props.basis;
    }
  }
  
  // Align self
  if (props.alignSelf !== undefined && props.alignSelf !== 'auto') {
    styles.alignSelf = props.alignSelf;
  }
  
  // Order
  if (props.order !== undefined) {
    styles.order = props.order;
  }
  
  return styles;
};

/**
 * Generate BEM class names for Flex
 */
const generateFlexClassNames = (props: FlexProps): string => {
  const classes = ['flex'];
  
  // Inline modifier
  if (props.inline) {
    classes.push('flex--inline');
  }
  
  // Direction modifier
  const direction = getBreakpointValue(props.direction, 'row');
  if (direction === 'column') {
    classes.push('flex--column');
  } else if (direction === 'column-reverse') {
    classes.push('flex--column-reverse');
  } else if (direction === 'row-reverse') {
    classes.push('flex--row-reverse');
  }
  
  // Wrap modifier
  const wrap = getBreakpointValue(props.wrap, 'nowrap');
  if (wrap === 'wrap') {
    classes.push('flex--wrap');
  } else if (wrap === 'wrap-reverse') {
    classes.push('flex--wrap-reverse');
  }
  
  // Custom className
  if (props.className) {
    classes.push(props.className);
  }
  
  return classes.join(' ');
};

/**
 * Generate BEM class names for FlexItem
 */
const generateFlexItemClassNames = (props: FlexItemProps): string => {
  const classes = ['flex__item'];
  
  // Grow modifier
  if (props.grow === true) {
    classes.push('flex__item--grow');
  }
  
  // Shrink modifier
  if (props.shrink === false || props.shrink === 0) {
    classes.push('flex__item--no-shrink');
  }
  
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
 * Flex is a flexbox container component that provides a declarative API
 * for building flexible layouts using CSS Flexbox.
 *
 * Features:
 * - All flex container properties as props
 * - Responsive value support
 * - Inline flex support
 * - BEM naming convention
 * - Light and dark theme support
 *
 * @param {FlexProps} props - Component props
 * @returns {JSX.Element} Flex container element
 */
export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  wrap = 'nowrap',
  justify = 'flex-start',
  align = 'stretch',
  alignContent,
  gap,
  gapX,
  gapY,
  inline = false,
  className,
  style,
  children,
  testId,
  id,
  'aria-label': ariaLabel,
}) => {
  const generatedStyles = generateFlexStyles({
    direction,
    wrap,
    justify,
    align,
    alignContent,
    gap,
    gapX,
    gapY,
    inline,
  });
  const combinedStyles = { ...generatedStyles, ...style };
  const classNames = generateFlexClassNames({
    direction,
    wrap,
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

Flex.displayName = 'Flex';

/**
 * FlexItem is a child component of Flex that provides control over
 * how an individual item behaves within a flex container.
 *
 * Features:
 * - Flex grow, shrink, and basis props
 * - Align self support
 * - Order support
 * - BEM naming convention
 *
 * @param {FlexItemProps} props - Component props
 * @returns {JSX.Element} Flex item element
 */
export const FlexItem: React.FC<FlexItemProps> = ({
  grow,
  shrink,
  basis,
  flex,
  alignSelf,
  order,
  className,
  style,
  children,
  testId,
}) => {
  const generatedStyles = generateFlexItemStyles({
    grow,
    shrink,
    basis,
    flex,
    alignSelf,
    order,
  });
  const combinedStyles = { ...generatedStyles, ...style };
  const classNames = generateFlexItemClassNames({
    grow,
    shrink,
    className,
  });
  
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

FlexItem.displayName = 'FlexItem';

export default Flex;
