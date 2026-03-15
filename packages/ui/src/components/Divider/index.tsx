/**
 * @fileoverview Divider Component - Horizontal/Vertical Separator
 * @module @ui/components/Divider
 *
 * A versatile divider component that can be horizontal or vertical,
 * with optional text labels and various styling options.
 *
 * @example
 * ```tsx
 * import { Divider } from '@ui/components/Divider';
 *
 * // Horizontal divider
 * <Divider />
 *
 * // Vertical divider
 * <Divider orientation="vertical" />
 *
 * // With label
 * <Divider>OR</Divider>
 *
 * // With styling
 * <Divider variant="dashed" color="primary" />
 *
 * // With decorative label
 * <Divider labelPosition="left">Section</Divider>
 * ```
 */

import React from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

/** Divider orientation */
type DividerOrientation = 'horizontal' | 'vertical';

/** Divider variant */
type DividerVariant = 'solid' | 'dashed' | 'dotted' | 'gradient';

/** Divider color */
type DividerColor = 'default' | 'primary' | 'secondary' | 'muted';

/** Label position */
type LabelPosition = 'center' | 'left' | 'right';

/** Spacing values */
type SpacingValue = number | string | 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface DividerProps {
  /** Orientation of the divider */
  orientation?: DividerOrientation;
  /** Visual style variant */
  variant?: DividerVariant;
  /** Color theme */
  color?: DividerColor;
  /** Label or children to display in the center */
  children?: React.ReactNode;
  /** Label text (alternative to children) */
  label?: string;
  /** Position of the label */
  labelPosition?: LabelPosition;
  /** Spacing around the divider */
  spacing?: SpacingValue;
  /** Thickness of the divider line */
  thickness?: number | 'thin' | 'medium' | 'thick';
  /** Flex grow to fill available space (for vertical in flex containers) */
  flexItem?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testId?: string;
  /** Decorative only (no semantic meaning) */
  decorative?: boolean;
  /** Aria label (required if not decorative) */
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
  };
  
  return spacingMap[value] || value;
};

/**
 * Get thickness value
 */
const getThicknessValue = (thickness: number | 'thin' | 'medium' | 'thick'): string => {
  if (typeof thickness === 'number') {
    return `${thickness}px`;
  }
  
  const thicknessMap: Record<string, string> = {
    'thin': '1px',
    'medium': '2px',
    'thick': '4px',
  };
  
  return thicknessMap[thickness] || '1px';
};

/**
 * Generate CSS styles from props
 */
const generateStyles = (props: DividerProps): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  // Spacing
  if (props.spacing !== undefined) {
    const spacing = getSpacingValue(props.spacing);
    if (props.orientation === 'vertical') {
      styles.marginLeft = spacing;
      styles.marginRight = spacing;
    } else {
      styles.marginTop = spacing;
      styles.marginBottom = spacing;
    }
  }
  
  // Thickness (applied via CSS variable)
  if (props.thickness !== undefined) {
    (styles as Record<string, string>)['--divider-thickness'] = getThicknessValue(props.thickness);
  }
  
  return styles;
};

/**
 * Generate BEM class names
 */
const generateClassNames = (props: DividerProps): string => {
  const classes = ['divider'];
  
  // Orientation modifier
  classes.push(`divider--${props.orientation || 'horizontal'}`);
  
  // Variant modifier
  if (props.variant && props.variant !== 'solid') {
    classes.push(`divider--${props.variant}`);
  }
  
  // Color modifier
  if (props.color && props.color !== 'default') {
    classes.push(`divider--${props.color}`);
  }
  
  // Label position modifier
  if (props.children || props.label) {
    classes.push('divider--with-label');
    if (props.labelPosition && props.labelPosition !== 'center') {
      classes.push(`divider--label-${props.labelPosition}`);
    }
  }
  
  // Flex item modifier
  if (props.flexItem) {
    classes.push('divider--flex-item');
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
 * Divider is a visual separator that can be oriented horizontally or vertically,
 * with optional text labels and various styling options.
 *
 * Features:
 * - Horizontal or vertical orientation
 * - Multiple visual variants (solid, dashed, dotted, gradient)
 * - Optional text label with positioning
 * - Theme color support
 * - BEM naming convention
 * - Light and dark theme support
 * - Accessible with proper ARIA attributes
 *
 * @param {DividerProps} props - Component props
 * @returns {JSX.Element} Divider element
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  color = 'default',
  children,
  label,
  labelPosition = 'center',
  spacing,
  thickness = 'thin',
  flexItem = false,
  className,
  style,
  testId,
  decorative = false,
  'aria-label': ariaLabel,
}) => {
  const generatedStyles = generateStyles({
    orientation,
    spacing,
    thickness,
  });
  const combinedStyles = { ...generatedStyles, ...style };
  const classNames = generateClassNames({
    orientation,
    variant,
    color,
    children,
    label,
    labelPosition,
    flexItem,
    className,
  });
  
  const labelText = label || children;
  
  // Determine ARIA role
  const ariaRole = decorative ? undefined : 'separator';
  const ariaOrientation = decorative ? undefined : orientation;
  
  return (
    <div
      className={classNames}
      style={combinedStyles}
      role={ariaRole}
      aria-orientation={ariaOrientation}
      aria-label={ariaLabel}
      aria-hidden={decorative}
      data-testid={testId}
    >
      {labelText && (
        <>
          <span className="divider__line divider__line--before" />
          <span className="divider__label">{labelText}</span>
          <span className="divider__line divider__line--after" />
        </>
      )}
    </div>
  );
};

Divider.displayName = 'Divider';

/**
 * Convenience component for vertical divider
 */
export const VerticalDivider: React.FC<Omit<DividerProps, 'orientation'>> = (props) => (
  <Divider {...props} orientation="vertical" />
);
VerticalDivider.displayName = 'VerticalDivider';

/**
 * Convenience component for horizontal divider
 */
export const HorizontalDivider: React.FC<Omit<DividerProps, 'orientation'>> = (props) => (
  <Divider {...props} orientation="horizontal" />
);
HorizontalDivider.displayName = 'HorizontalDivider';

export default Divider;
