/**
 * @fileoverview Box Component - Generic Container
 * @module @ui/components/Box
 *
 * A versatile container component that supports all CSS properties via props.
 * Designed for building layouts with responsive props support.
 *
 * @example
 * ```tsx
 * import { Box } from '@ui/components/Box';
 *
 * // Basic usage
 * <Box padding={4} background="surface">
 *   Content here
 * </Box>
 *
 * // With responsive props
 * <Box
 *   padding={{ base: 2, md: 4, lg: 6 }}
 *   display="flex"
 *   flexDirection="column"
 * >
 *   Responsive content
 * </Box>
 * ```
 */

import React from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

/** Spacing values using CSS variables */
type SpacingValue = number | string | 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/** Display values */
type DisplayValue = 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'none';

/** Flex direction values */
type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

/** Flex wrap values */
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

/** Justify content values */
type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

/** Align items values */
type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';

/** Border radius values */
type BorderRadiusValue = number | string | 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

/** Shadow values */
type ShadowValue = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner';

/** Background theme values */
type BackgroundValue = 'surface' | 'surface-variant' | 'primary' | 'secondary' | 'transparent' | string;

/** Responsive prop value */
type ResponsiveValue<T> = T | {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

/** HTML element types */
type ElementType = 'div' | 'section' | 'article' | 'aside' | 'main' | 'nav' | 'header' | 'footer' | 'span' | 'p';

interface BoxProps {
  /** HTML element to render */
  as?: ElementType;
  /** Padding */
  padding?: ResponsiveValue<SpacingValue>;
  /** Horizontal padding */
  paddingX?: ResponsiveValue<SpacingValue>;
  /** Vertical padding */
  paddingY?: ResponsiveValue<SpacingValue>;
  /** Padding top */
  paddingTop?: ResponsiveValue<SpacingValue>;
  /** Padding right */
  paddingRight?: ResponsiveValue<SpacingValue>;
  /** Padding bottom */
  paddingBottom?: ResponsiveValue<SpacingValue>;
  /** Padding left */
  paddingLeft?: ResponsiveValue<SpacingValue>;
  /** Margin */
  margin?: ResponsiveValue<SpacingValue>;
  /** Horizontal margin */
  marginX?: ResponsiveValue<SpacingValue>;
  /** Vertical margin */
  marginY?: ResponsiveValue<SpacingValue>;
  /** Margin top */
  marginTop?: ResponsiveValue<SpacingValue>;
  /** Margin right */
  marginRight?: ResponsiveValue<SpacingValue>;
  /** Margin bottom */
  marginBottom?: ResponsiveValue<SpacingValue>;
  /** Margin left */
  marginLeft?: ResponsiveValue<SpacingValue>;
  /** Width */
  width?: ResponsiveValue<string | number>;
  /** Height */
  height?: ResponsiveValue<string | number>;
  /** Min width */
  minWidth?: ResponsiveValue<string | number>;
  /** Max width */
  maxWidth?: ResponsiveValue<string | number>;
  /** Min height */
  minHeight?: ResponsiveValue<string | number>;
  /** Max height */
  maxHeight?: ResponsiveValue<string | number>;
  /** Display mode */
  display?: ResponsiveValue<DisplayValue>;
  /** Flex direction */
  flexDirection?: ResponsiveValue<FlexDirection>;
  /** Flex wrap */
  flexWrap?: ResponsiveValue<FlexWrap>;
  /** Justify content */
  justifyContent?: ResponsiveValue<JustifyContent>;
  /** Align items */
  alignItems?: ResponsiveValue<AlignItems>;
  /** Gap between items */
  gap?: ResponsiveValue<SpacingValue>;
  /** Row gap */
  gapX?: ResponsiveValue<SpacingValue>;
  /** Column gap */
  gapY?: ResponsiveValue<SpacingValue>;
  /** Border radius */
  borderRadius?: ResponsiveValue<BorderRadiusValue>;
  /** Background color */
  background?: BackgroundValue;
  /** Box shadow */
  shadow?: ShadowValue;
  /** Opacity */
  opacity?: number;
  /** Overflow behavior */
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  /** Position */
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  /** Z-index */
  zIndex?: number;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Children */
  children?: React.ReactNode;
  /** Test ID for testing */
  testId?: string;
  /** ID attribute */
  id?: string;
  /** Data attributes */
  'data-*'?: string;
  /** Aria attributes */
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Maps spacing value to CSS variable
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
 * Maps border radius value to CSS variable
 */
const getBorderRadiusValue = (value: BorderRadiusValue): string => {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  
  const radiusMap: Record<string, string> = {
    'none': '0',
    'sm': 'var(--radius-sm, 4px)',
    'md': 'var(--radius-md, 8px)',
    'lg': 'var(--radius-lg, 12px)',
    'xl': 'var(--radius-xl, 16px)',
    '2xl': 'var(--radius-2xl, 24px)',
    'full': '9999px',
  };
  
  return radiusMap[value] || value;
};

/**
 * Maps shadow value to CSS variable
 */
const getShadowValue = (value: ShadowValue): string => {
  const shadowMap: Record<string, string> = {
    'none': 'none',
    'sm': 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
    'md': 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
    'lg': 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))',
    'xl': 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
    '2xl': 'var(--shadow-2xl, 0 25px 50px -12px rgba(0, 0, 0, 0.25))',
    'inner': 'var(--shadow-inner, inset 0 2px 4px 0 rgba(0, 0, 0, 0.05))',
  };
  
  return shadowMap[value] || 'none';
};

/**
 * Maps background value to CSS variable
 */
const getBackgroundValue = (value: BackgroundValue): string => {
  const backgroundMap: Record<string, string> = {
    'surface': 'var(--color-surface, #ffffff)',
    'surface-variant': 'var(--color-surface-variant, #f5f5f5)',
    'primary': 'var(--color-primary, #42a5f5)',
    'secondary': 'var(--color-secondary, #1976d2)',
    'transparent': 'transparent',
  };
  
  return backgroundMap[value] || value;
};

/**
 * Generates CSS styles from props
 */
const generateStyles = (props: BoxProps): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  // Padding
  if (props.padding !== undefined) {
    const value = typeof props.padding === 'object' ? props.padding.base : props.padding;
    if (value !== undefined) styles.padding = getSpacingValue(value);
  }
  if (props.paddingX !== undefined) {
    const value = typeof props.paddingX === 'object' ? props.paddingX.base : props.paddingX;
    if (value !== undefined) {
      styles.paddingLeft = getSpacingValue(value);
      styles.paddingRight = getSpacingValue(value);
    }
  }
  if (props.paddingY !== undefined) {
    const value = typeof props.paddingY === 'object' ? props.paddingY.base : props.paddingY;
    if (value !== undefined) {
      styles.paddingTop = getSpacingValue(value);
      styles.paddingBottom = getSpacingValue(value);
    }
  }
  if (props.paddingTop !== undefined) {
    const value = typeof props.paddingTop === 'object' ? props.paddingTop.base : props.paddingTop;
    if (value !== undefined) styles.paddingTop = getSpacingValue(value);
  }
  if (props.paddingRight !== undefined) {
    const value = typeof props.paddingRight === 'object' ? props.paddingRight.base : props.paddingRight;
    if (value !== undefined) styles.paddingRight = getSpacingValue(value);
  }
  if (props.paddingBottom !== undefined) {
    const value = typeof props.paddingBottom === 'object' ? props.paddingBottom.base : props.paddingBottom;
    if (value !== undefined) styles.paddingBottom = getSpacingValue(value);
  }
  if (props.paddingLeft !== undefined) {
    const value = typeof props.paddingLeft === 'object' ? props.paddingLeft.base : props.paddingLeft;
    if (value !== undefined) styles.paddingLeft = getSpacingValue(value);
  }
  
  // Margin
  if (props.margin !== undefined) {
    const value = typeof props.margin === 'object' ? props.margin.base : props.margin;
    if (value !== undefined) styles.margin = getSpacingValue(value);
  }
  if (props.marginX !== undefined) {
    const value = typeof props.marginX === 'object' ? props.marginX.base : props.marginX;
    if (value !== undefined) {
      styles.marginLeft = getSpacingValue(value);
      styles.marginRight = getSpacingValue(value);
    }
  }
  if (props.marginY !== undefined) {
    const value = typeof props.marginY === 'object' ? props.marginY.base : props.marginY;
    if (value !== undefined) {
      styles.marginTop = getSpacingValue(value);
      styles.marginBottom = getSpacingValue(value);
    }
  }
  if (props.marginTop !== undefined) {
    const value = typeof props.marginTop === 'object' ? props.marginTop.base : props.marginTop;
    if (value !== undefined) styles.marginTop = getSpacingValue(value);
  }
  if (props.marginRight !== undefined) {
    const value = typeof props.marginRight === 'object' ? props.marginRight.base : props.marginRight;
    if (value !== undefined) styles.marginRight = getSpacingValue(value);
  }
  if (props.marginBottom !== undefined) {
    const value = typeof props.marginBottom === 'object' ? props.marginBottom.base : props.marginBottom;
    if (value !== undefined) styles.marginBottom = getSpacingValue(value);
  }
  if (props.marginLeft !== undefined) {
    const value = typeof props.marginLeft === 'object' ? props.marginLeft.base : props.marginLeft;
    if (value !== undefined) styles.marginLeft = getSpacingValue(value);
  }
  
  // Dimensions
  if (props.width !== undefined) {
    const value = typeof props.width === 'object' ? props.width.base : props.width;
    if (value !== undefined) styles.width = typeof value === 'number' ? `${value}px` : value;
  }
  if (props.height !== undefined) {
    const value = typeof props.height === 'object' ? props.height.base : props.height;
    if (value !== undefined) styles.height = typeof value === 'number' ? `${value}px` : value;
  }
  if (props.minWidth !== undefined) {
    const value = typeof props.minWidth === 'object' ? props.minWidth.base : props.minWidth;
    if (value !== undefined) styles.minWidth = typeof value === 'number' ? `${value}px` : value;
  }
  if (props.maxWidth !== undefined) {
    const value = typeof props.maxWidth === 'object' ? props.maxWidth.base : props.maxWidth;
    if (value !== undefined) styles.maxWidth = typeof value === 'number' ? `${value}px` : value;
  }
  if (props.minHeight !== undefined) {
    const value = typeof props.minHeight === 'object' ? props.minHeight.base : props.minHeight;
    if (value !== undefined) styles.minHeight = typeof value === 'number' ? `${value}px` : value;
  }
  if (props.maxHeight !== undefined) {
    const value = typeof props.maxHeight === 'object' ? props.maxHeight.base : props.maxHeight;
    if (value !== undefined) styles.maxHeight = typeof value === 'number' ? `${value}px` : value;
  }
  
  // Display and Flex
  if (props.display !== undefined) {
    const value = typeof props.display === 'object' ? props.display.base : props.display;
    if (value !== undefined) styles.display = value;
  }
  if (props.flexDirection !== undefined) {
    const value = typeof props.flexDirection === 'object' ? props.flexDirection.base : props.flexDirection;
    if (value !== undefined) styles.flexDirection = value;
  }
  if (props.flexWrap !== undefined) {
    const value = typeof props.flexWrap === 'object' ? props.flexWrap.base : props.flexWrap;
    if (value !== undefined) styles.flexWrap = value;
  }
  if (props.justifyContent !== undefined) {
    const value = typeof props.justifyContent === 'object' ? props.justifyContent.base : props.justifyContent;
    if (value !== undefined) styles.justifyContent = value;
  }
  if (props.alignItems !== undefined) {
    const value = typeof props.alignItems === 'object' ? props.alignItems.base : props.alignItems;
    if (value !== undefined) styles.alignItems = value;
  }
  if (props.gap !== undefined) {
    const value = typeof props.gap === 'object' ? props.gap.base : props.gap;
    if (value !== undefined) styles.gap = getSpacingValue(value);
  }
  if (props.gapX !== undefined) {
    const value = typeof props.gapX === 'object' ? props.gapX.base : props.gapX;
    if (value !== undefined) styles.columnGap = getSpacingValue(value);
  }
  if (props.gapY !== undefined) {
    const value = typeof props.gapY === 'object' ? props.gapY.base : props.gapY;
    if (value !== undefined) styles.rowGap = getSpacingValue(value);
  }
  
  // Visual
  if (props.borderRadius !== undefined) {
    const value = typeof props.borderRadius === 'object' ? props.borderRadius.base : props.borderRadius;
    if (value !== undefined) styles.borderRadius = getBorderRadiusValue(value);
  }
  if (props.background !== undefined) {
    styles.background = getBackgroundValue(props.background);
  }
  if (props.shadow !== undefined) {
    styles.boxShadow = getShadowValue(props.shadow);
  }
  if (props.opacity !== undefined) {
    styles.opacity = props.opacity;
  }
  
  // Positioning
  if (props.overflow !== undefined) {
    styles.overflow = props.overflow;
  }
  if (props.position !== undefined) {
    styles.position = props.position;
  }
  if (props.zIndex !== undefined) {
    styles.zIndex = props.zIndex;
  }
  
  return styles;
};

/**
 * Generates BEM class names
 */
const generateClassNames = (props: BoxProps): string => {
  const classes = ['box'];
  
  // Shadow modifier
  if (props.shadow) {
    classes.push(`box--shadow-${props.shadow}`);
  }
  
  // Background modifier
  if (props.background && typeof props.background === 'string' && 
      ['surface', 'surface-variant', 'primary', 'secondary'].includes(props.background)) {
    classes.push(`box--bg-${props.background}`);
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
 * Box is a generic container component that serves as a building block
 * for creating layouts. It supports all common CSS properties via props
 * and provides responsive value support.
 *
 * Features:
 * - Generic container with CSS-in-JS style props
 * - Responsive values support
 * - Theme-aware spacing and colors
 * - BEM naming convention
 * - Light and dark theme support
 *
 * @param {BoxProps} props - Component props
 * @returns {JSX.Element} Box element
 */
export const Box: React.FC<BoxProps> = ({
  as: Component = 'div',
  className,
  style,
  children,
  testId,
  id,
  role,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...restProps
}) => {
  const generatedStyles = generateStyles(restProps as BoxProps);
  const combinedStyles = { ...generatedStyles, ...style };
  const classNames = generateClassNames(restProps as BoxProps);
  
  return (
    <Component
      className={classNames}
      style={combinedStyles}
      data-testid={testId}
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </Component>
  );
};

Box.displayName = 'Box';

export default Box;
