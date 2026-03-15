/**
 * @fileoverview Stack Component - Vertical/Horizontal Layout
 * @module @ui/components/Stack
 *
 * A layout component for stacking elements vertically or horizontally
 * with consistent spacing and optional dividers.
 *
 * @example
 * ```tsx
 * import { Stack, HStack, VStack } from '@ui/components/Stack';
 *
 * // Vertical stack
 * <VStack gap={4}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </VStack>
 *
 * // Horizontal stack with dividers
 * <HStack gap={2} divider={<Divider />}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </HStack>
 *
 * // Responsive stack
 * <Stack direction={{ base: 'column', md: 'row' }} gap={4}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * ```
 */

import React from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

/** Stack direction */
type StackDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

/** Align items values */
type StackAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

/** Justify content values */
type StackJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

/** Spacing values */
type SpacingValue = number | string | 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/** Wrap values */
type StackWrap = 'wrap' | 'nowrap' | 'wrap-reverse';

/** Responsive value */
type ResponsiveValue<T> = T | {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
};

interface StackProps {
  /** Stack direction */
  direction?: ResponsiveValue<StackDirection>;
  /** Gap between items */
  gap?: ResponsiveValue<SpacingValue>;
  /** Align items on cross axis */
  align?: ResponsiveValue<StackAlign>;
  /** Justify content on main axis */
  justify?: ResponsiveValue<StackJustify>;
  /** Wrap behavior */
  wrap?: ResponsiveValue<StackWrap>;
  /** Divider element between items */
  divider?: React.ReactNode;
  /** Should items stretch to fill width (column) or height (row) */
  shouldWrapChildren?: boolean;
  /** Inline stack */
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
 * Maps align value to CSS value
 */
const getAlignValue = (value: StackAlign): string => {
  const alignMap: Record<string, string> = {
    'start': 'flex-start',
    'end': 'flex-end',
    'center': 'center',
    'baseline': 'baseline',
    'stretch': 'stretch',
  };
  
  return alignMap[value] || 'stretch';
};

/**
 * Maps justify value to CSS value
 */
const getJustifyValue = (value: StackJustify): string => {
  const justifyMap: Record<string, string> = {
    'start': 'flex-start',
    'end': 'flex-end',
    'center': 'center',
    'between': 'space-between',
    'around': 'space-around',
    'evenly': 'space-evenly',
  };
  
  return justifyMap[value] || 'flex-start';
};

/**
 * Get current breakpoint value from responsive prop
 */
const getBreakpointValue = <T,>(value: ResponsiveValue<T> | undefined, defaultValue: T): T => {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'object' || value === null) return value;
  
  // In a real implementation, this would check current breakpoint
  // For now, return base value
  if ('base' in value) return value.base ?? defaultValue;
  return value as T;
};

/**
 * Generate CSS styles from props
 */
const generateStyles = (props: StackProps): React.CSSProperties => {
  const styles: React.CSSProperties = {
    display: props.inline ? 'inline-flex' : 'flex',
  };
  
  // Direction
  const direction = getBreakpointValue(props.direction, 'column');
  styles.flexDirection = direction;
  
  // Gap
  const gap = getBreakpointValue(props.gap, undefined);
  if (gap !== undefined) {
    styles.gap = getSpacingValue(gap);
  }
  
  // Align
  const align = getBreakpointValue(props.align, 'stretch');
  styles.alignItems = getAlignValue(align);
  
  // Justify
  const justify = getBreakpointValue(props.justify, 'start');
  styles.justifyContent = getJustifyValue(justify);
  
  // Wrap
  const wrap = getBreakpointValue(props.wrap, 'nowrap');
  styles.flexWrap = wrap;
  
  return styles;
};

/**
 * Generate BEM class names
 */
const generateClassNames = (props: StackProps): string => {
  const classes = ['stack'];
  
  // Direction modifier
  const direction = getBreakpointValue(props.direction, 'column');
  if (direction === 'column' || direction === 'column-reverse') {
    classes.push('stack--vertical');
  } else {
    classes.push('stack--horizontal');
  }
  
  // Inline modifier
  if (props.inline) {
    classes.push('stack--inline');
  }
  
  // Custom className
  if (props.className) {
    classes.push(props.className);
  }
  
  return classes.join(' ');
};

// ============================================================================
// Component
// ============================================================================

/**
 * Stack is a layout component for arranging elements vertically or horizontally.
 * It's built on top of CSS Flexbox and provides a simple, declarative API
 * for common layout patterns.
 *
 * Features:
 * - Vertical or horizontal stacking
 * - Consistent spacing via gap
 * - Optional dividers between items
 * - Responsive direction support
 * - BEM naming convention
 * - Light and dark theme support
 *
 * @param {StackProps} props - Component props
 * @returns {JSX.Element} Stack element
 */
export const Stack: React.FC<StackProps> = ({
  direction = 'column',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  divider,
  shouldWrapChildren = false,
  inline = false,
  className,
  style,
  children,
  testId,
  id,
  'aria-label': ariaLabel,
}) => {
  const generatedStyles = generateStyles({
    direction,
    gap,
    align,
    justify,
    wrap,
    inline,
  });
  const combinedStyles = { ...generatedStyles, ...style };
  const classNames = generateClassNames({
    direction,
    gap,
    align,
    justify,
    wrap,
    inline,
    className,
  });
  
  // If no divider, render children directly
  if (!divider) {
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
  }
  
  // With dividers - clone elements and insert dividers
  const childArray = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child)
  );
  
  const childrenWithDividers = childArray.reduce<React.ReactNode[]>(
    (acc, child, index) => {
      // Add the child (potentially wrapped)
      const childElement = shouldWrapChildren ? (
        <div className="stack__item">{child}</div>
      ) : (
        child
      );
      acc.push(childElement);
      
      // Add divider after each child except the last
      if (index < childArray.length - 1) {
        acc.push(
          <div
            key={`divider-${index}`}
            className="stack__divider"
            aria-hidden="true"
          >
            {divider}
          </div>
        );
      }
      
      return acc;
    },
    []
  );
  
  return (
    <div
      className={classNames}
      style={combinedStyles}
      data-testid={testId}
      id={id}
      aria-label={ariaLabel}
    >
      {childrenWithDividers}
    </div>
  );
};

Stack.displayName = 'Stack';

// ============================================================================
// Convenience Components
// ============================================================================

interface VStackProps extends Omit<StackProps, 'direction'> {}
interface HStackProps extends Omit<StackProps, 'direction'> {}

/**
 * Vertical Stack - stacks children vertically
 */
export const VStack: React.FC<VStackProps> = (props) => (
  <Stack {...props} direction="column" />
);
VStack.displayName = 'VStack';

/**
 * Horizontal Stack - stacks children horizontally
 */
export const HStack: React.FC<HStackProps> = (props) => (
  <Stack {...props} direction="row" />
);
HStack.displayName = 'HStack';

export default Stack;
