/**
 * @fileoverview Stack Component - Stack Layout Container
 * @module @ui/layout/Stack
 *
 * A component for stacking elements vertically or horizontally with consistent spacing.
 * Supports dividers between items for visual separation.
 *
 * @example
 * ```tsx
 * import { Stack, HStack, VStack } from '@webos/ui/layout';
 *
 * // Vertical stack with dividers
 * <Stack direction="vertical" gap={4} divider>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Stack>
 *
 * // Horizontal stack
 * <HStack gap={2} align="center">
 *   <Icon />
 *   <Text>Label</Text>
 * </HStack>
 *
 * // Vertical stack shorthand
 * <VStack gap={3}>
 *   <Header />
 *   <Content />
 *   <Footer />
 * </VStack>
 * ```
 */

import React, { forwardRef, useMemo, Children, isValidElement } from 'react';

// ============================================================================
// Types
// ============================================================================

type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Stack direction options
 */
export type StackDirection = 'vertical' | 'horizontal';

/**
 * Stack align options
 */
export type StackAlign = 'start' | 'end' | 'center' | 'stretch' | 'baseline';

/**
 * Stack justify options
 */
export type StackJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

/**
 * Divider variant
 */
export type DividerVariant = 'default' | 'acrylic';

/**
 * Stack component props
 */
export interface StackProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Stack direction */
  direction?: StackDirection;
  /** Gap between items */
  gap?: SpacingValue;
  /** Align items */
  align?: StackAlign;
  /** Justify content */
  justify?: StackJustify;
  /** Show dividers between items */
  divider?: boolean | DividerVariant;
  /** Divider className */
  dividerClassName?: string;
  /** Width */
  width?: string | number | 'full' | 'auto' | 'screen';
  /** Height */
  height?: string | number | 'full' | 'auto' | 'screen';
  /** Wrap items */
  wrap?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
  /** Test id for testing */
  testId?: string;
}

/**
 * VStack props (shorthand for vertical stack)
 */
export type VStackProps = Omit<StackProps, 'direction'>;

/**
 * HStack props (shorthand for horizontal stack)
 */
export type HStackProps = Omit<StackProps, 'direction'>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert spacing value to CSS
 */
const _spacingToCSS = (value: SpacingValue | undefined): string | undefined => {
  if (value === undefined) return undefined;
  if (value === 0) return '0';
  return `var(--layout-spacing-${value}, ${value * 4}px)`;
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
// Stack Component
// ============================================================================

/**
 * Stack - A layout component for stacking elements
 *
 * Features:
 * - Vertical or horizontal stacking
 * - Consistent gap spacing
 * - Optional dividers between items
 * - Align and justify support
 *
 * @param {StackProps} props - Component props
 * @returns {JSX.Element} Stack container element
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'vertical',
      gap,
      align = 'stretch',
      justify = 'start',
      divider = false,
      dividerClassName = '',
      width,
      height,
      wrap = false,
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
      const classes = ['layout-stack', `layout-stack--${direction}`];

      // Gap
      if (gap !== undefined) {
        classes.push(`layout-gap-${gap}`);
      }

      return classes.join(' ');
    }, [direction, gap]);

    // Generate inline styles
    const styles = useMemo(() => {
      const style: React.CSSProperties = { ...propStyle };

      // Align items
      const alignMap: Record<StackAlign, string> = {
        start: 'flex-start',
        end: 'flex-end',
        center: 'center',
        stretch: 'stretch',
        baseline: 'baseline',
      };
      style.alignItems = alignMap[align];

      // Justify content
      const justifyMap: Record<StackJustify, string> = {
        start: 'flex-start',
        end: 'flex-end',
        center: 'center',
        between: 'space-between',
        around: 'space-around',
        evenly: 'space-evenly',
      };
      style.justifyContent = justifyMap[justify];

      // Wrap
      if (wrap) {
        style.flexWrap = 'wrap';
      }

      // Dimensions
      if (width !== undefined) {
        style.width = dimensionToCSS(width);
      }
      if (height !== undefined) {
        style.height = dimensionToCSS(height);
      }

      return style;
    }, [align, justify, wrap, width, height, propStyle]);

    // Render with dividers
    const renderChildren = useMemo(() => {
      if (!divider) {
        return children;
      }

      const childArray = Children.toArray(children).filter(isValidElement);
      const dividerVariant = typeof divider === 'string' ? divider : 'default';

      return childArray.map((child, index) => {
        const isLast = index === childArray.length - 1;

        return (
          <React.Fragment key={index}>
            {child}
            {!isLast && (
              <div
                className={`layout-stack__divider layout-stack__divider--${dividerVariant}${dividerClassName ? ` ${dividerClassName}` : ''}`}
                role="separator"
                aria-orientation={direction === 'vertical' ? 'horizontal' : 'vertical'}
              />
            )}
          </React.Fragment>
        );
      });
    }, [children, divider, dividerClassName, direction]);

    return (
      <div
        ref={ref}
        className={`${classNames}${className ? ` ${className}` : ''}`}
        style={styles}
        data-testid={testId}
        {...rest}
      >
        {renderChildren}
      </div>
    );
  }
);

Stack.displayName = 'Stack';

// ============================================================================
// VStack Component (Vertical Stack)
// ============================================================================

/**
 * VStack - Vertical Stack shorthand
 *
 * @param {VStackProps} props - Component props
 * @returns {JSX.Element} VStack container element
 */
export const VStack = forwardRef<HTMLDivElement, VStackProps>((props, ref) => {
  return <Stack ref={ref} direction="vertical" {...props} />;
});

VStack.displayName = 'VStack';

// ============================================================================
// HStack Component (Horizontal Stack)
// ============================================================================

/**
 * HStack - Horizontal Stack shorthand
 *
 * @param {HStackProps} props - Component props
 * @returns {JSX.Element} HStack container element
 */
export const HStack = forwardRef<HTMLDivElement, HStackProps>((props, ref) => {
  return <Stack ref={ref} direction="horizontal" {...props} />;
});

HStack.displayName = 'HStack';

// ============================================================================
// Divider Component
// ============================================================================

/**
 * Divider props
 */
export interface DividerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Visual variant */
  variant?: DividerVariant;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Divider - A visual separator
 *
 * @param {DividerProps} props - Component props
 * @returns {JSX.Element} Divider element
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = 'horizontal', variant = 'default', className = '', ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`layout-stack__divider layout-stack__divider--${variant}${className ? ` ${className}` : ''}`}
        role="separator"
        aria-orientation={orientation}
        {...rest}
      />
    );
  }
);

Divider.displayName = 'Divider';

// ============================================================================
// Exports
// ============================================================================

export default Stack;
