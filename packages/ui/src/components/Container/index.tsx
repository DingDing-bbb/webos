/**
 * @fileoverview Container Component - Max-Width Layout
 * @module @ui/components/Container
 *
 * A max-width container component that centers content horizontally.
 * Provides consistent content width across different screen sizes.
 *
 * @example
 * ```tsx
 * import { Container } from '@ui/components/Container';
 *
 * // Basic usage
 * <Container>
 *   <p>Content here</p>
 * </Container>
 *
 * // With size
 * <Container size="lg">
 *   <p>Wider content</p>
 * </Container>
 *
 * // Full width with padding
 * <Container size="full" padding={4}>
 *   <p>Full width content</p>
 * </Container>
 *
 * // Centered content
 * <Container size="md" centerContent>
 *   <p>Centered content</p>
 * </Container>
 * ```
 */

import React from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

/** Container size presets */
type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

/** Spacing values */
type SpacingValue = number | string | 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface ContainerProps {
  /** Container size preset */
  size?: ContainerSize;
  /** Horizontal padding */
  padding?: SpacingValue;
  /** Center content vertically and horizontally */
  centerContent?: boolean;
  /** Center horizontally only */
  center?: boolean;
  /** HTML element to render */
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer';
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
 * Get max-width value for container size
 */
const getMaxWidth = (size: ContainerSize): string => {
  const maxWidthMap: Record<ContainerSize, string> = {
    'sm': 'var(--container-sm, 640px)',
    'md': 'var(--container-md, 768px)',
    'lg': 'var(--container-lg, 1024px)',
    'xl': 'var(--container-xl, 1280px)',
    '2xl': 'var(--container-2xl, 1536px)',
    'full': '100%',
  };
  
  return maxWidthMap[size];
};

/**
 * Generate CSS styles from props
 */
const generateStyles = (props: ContainerProps): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  // Max width
  styles.maxWidth = getMaxWidth(props.size || 'lg');
  
  // Padding
  if (props.padding !== undefined) {
    const paddingValue = getSpacingValue(props.padding);
    styles.paddingLeft = paddingValue;
    styles.paddingRight = paddingValue;
  }
  
  // Center content
  if (props.centerContent) {
    styles.display = 'flex';
    styles.flexDirection = 'column';
    styles.alignItems = 'center';
    styles.justifyContent = 'center';
    styles.minHeight = '100%';
  }
  
  // Center horizontally
  if (props.center !== false) {
    styles.marginLeft = 'auto';
    styles.marginRight = 'auto';
  }
  
  return styles;
};

/**
 * Generate BEM class names
 */
const generateClassNames = (props: ContainerProps): string => {
  const classes = ['container'];
  
  // Size modifier
  if (props.size) {
    classes.push(`container--${props.size}`);
  }
  
  // Center content modifier
  if (props.centerContent) {
    classes.push('container--center-content');
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
 * Container is a layout component that provides a max-width wrapper
 * for content with horizontal centering by default.
 *
 * Features:
 * - Predefined size presets
 * - Horizontal centering by default
 * - Optional vertical centering
 * - Padding support
 * - BEM naming convention
 * - Light and dark theme support
 *
 * @param {ContainerProps} props - Component props
 * @returns {JSX.Element} Container element
 */
export const Container: React.FC<ContainerProps> = ({
  size = 'lg',
  padding = 'md',
  centerContent = false,
  center = true,
  as: Component = 'div',
  className,
  style,
  children,
  testId,
  id,
  'aria-label': ariaLabel,
}) => {
  const generatedStyles = generateStyles({
    size,
    padding,
    centerContent,
    center,
  });
  const combinedStyles = { ...generatedStyles, ...style };
  const classNames = generateClassNames({
    size,
    centerContent,
    className,
  });
  
  return (
    <Component
      className={classNames}
      style={combinedStyles}
      data-testid={testId}
      id={id}
      aria-label={ariaLabel}
    >
      {children}
    </Component>
  );
};

Container.displayName = 'Container';

export default Container;
