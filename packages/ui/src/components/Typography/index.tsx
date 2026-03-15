/**
 * @fileoverview Typography Component
 * @module @ui/components/Typography
 *
 * A versatile typography component for text rendering.
 * Supports multiple elements, variants, colors, and text utilities.
 */

import React, {
  forwardRef,
  useMemo,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import './styles.css';

/* ============================================
   Types
   ============================================ */

export type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label' | 'div' | 'code';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'body-sm'
  | 'body-lg'
  | 'label'
  | 'label-lg'
  | 'caption'
  | 'overline'
  | 'code';

export type TypographyColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'danger'
  | 'success'
  | 'warning'
  | 'inherit'
  | 'white'
  | 'black';

export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

export type TypographyWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  /** HTML element to render */
  as?: TypographyElement;
  /** Typography variant */
  variant?: TypographyVariant;
  /** Text color */
  color?: TypographyColor;
  /** Text alignment */
  align?: TypographyAlign;
  /** Font weight override */
  weight?: TypographyWeight;
  /** Number of lines to clamp (1-4) */
  lineClamp?: 1 | 2 | 3 | 4;
  /** Enable text truncation (single line) */
  truncate?: boolean;
  /** No text wrap */
  noWrap?: boolean;
  /** Italic text */
  italic?: boolean;
  /** Underline text */
  underline?: boolean;
  /** Strikethrough text */
  lineThrough?: boolean;
  /** Uppercase text */
  uppercase?: boolean;
  /** Lowercase text */
  lowercase?: boolean;
  /** Capitalize text */
  capitalize?: boolean;
  /** Break words */
  breakWord?: boolean;
  /** Text content */
  children?: ReactNode;
  /** For label elements - associates with form control */
  htmlFor?: string;
}

/* ============================================
   Variant to Element Mapping
   ============================================ */

const variantToElement: Record<TypographyVariant, TypographyElement> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  'body-sm': 'p',
  'body-lg': 'p',
  label: 'label',
  'label-lg': 'label',
  caption: 'span',
  overline: 'span',
  code: 'code',
};

/* ============================================
   Component
   ============================================ */

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      as,
      variant = 'body',
      color = 'default',
      align,
      weight,
      lineClamp,
      truncate = false,
      noWrap = false,
      italic = false,
      underline = false,
      lineThrough = false,
      uppercase = false,
      lowercase = false,
      capitalize = false,
      breakWord = false,
      children,
      className = '',
      htmlFor,
      ...rest
    },
    ref
  ) => {
    // Determine the HTML element to render
    const Component = as || variantToElement[variant] || 'p';

    // Compute class names using BEM
    const classNames = useMemo(() => {
      const classes = ['os-typography', `os-typography--${variant}`];

      // Color
      if (color !== 'default') {
        classes.push(`os-typography--${color}`);
      }

      // Alignment
      if (align) {
        classes.push(`os-typography--align-${align}`);
      }

      // Weight
      if (weight) {
        classes.push(`os-typography--weight-${weight}`);
      }

      // Line clamp or truncation
      if (lineClamp) {
        classes.push(`os-typography--clamp-${lineClamp}`);
      } else if (truncate) {
        classes.push('os-typography--truncate');
      }

      // No wrap
      if (noWrap && !truncate && !lineClamp) {
        classes.push('os-typography--no-wrap');
      }

      // Text style
      if (italic) {
        classes.push('os-typography--italic');
      }

      if (underline) {
        classes.push('os-typography--underline');
      }

      if (lineThrough) {
        classes.push('os-typography--line-through');
      }

      // Text transform
      if (uppercase) {
        classes.push('os-typography--uppercase');
      }

      if (lowercase) {
        classes.push('os-typography--lowercase');
      }

      if (capitalize) {
        classes.push('os-typography--capitalize');
      }

      // Word break
      if (breakWord) {
        classes.push('os-typography--break-word');
      }

      // Custom className
      if (className) {
        classes.push(className);
      }

      return classes.join(' ');
    }, [
      variant,
      color,
      align,
      weight,
      lineClamp,
      truncate,
      noWrap,
      italic,
      underline,
      lineThrough,
      uppercase,
      lowercase,
      capitalize,
      breakWord,
      className,
    ]);

    // Common props
    const props = {
      ref: ref as React.Ref<HTMLElement>,
      className: classNames,
      ...(Component === 'label' && htmlFor ? { htmlFor } : {}),
      ...rest,
    };

    // Render the component
    return React.createElement(Component, props, children);
  }
);

Typography.displayName = 'Typography';

/* ============================================
   Compound Components
   ============================================ */

// Heading components for convenience
export const H1 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'as' | 'variant'>>(
  (props, ref) => <Typography ref={ref} as="h1" variant="h1" {...props} />
);
H1.displayName = 'Typography.H1';

export const H2 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'as' | 'variant'>>(
  (props, ref) => <Typography ref={ref} as="h2" variant="h2" {...props} />
);
H2.displayName = 'Typography.H2';

export const H3 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'as' | 'variant'>>(
  (props, ref) => <Typography ref={ref} as="h3" variant="h3" {...props} />
);
H3.displayName = 'Typography.H3';

export const H4 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'as' | 'variant'>>(
  (props, ref) => <Typography ref={ref} as="h4" variant="h4" {...props} />
);
H4.displayName = 'Typography.H4';

export const H5 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'as' | 'variant'>>(
  (props, ref) => <Typography ref={ref} as="h5" variant="h5" {...props} />
);
H5.displayName = 'Typography.H5';

export const H6 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'as' | 'variant'>>(
  (props, ref) => <Typography ref={ref} as="h6" variant="h6" {...props} />
);
H6.displayName = 'Typography.H6';

// Body components
export const Text = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'as' | 'variant'>>(
  (props, ref) => <Typography ref={ref} as="p" variant="body" {...props} />
);
Text.displayName = 'Typography.Text';

export const TextSmall = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'as' | 'variant'>>(
  (props, ref) => <Typography ref={ref} as="p" variant="body-sm" {...props} />
);
TextSmall.displayName = 'Typography.TextSmall';

export const TextLarge = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'as' | 'variant'>>(
  (props, ref) => <Typography ref={ref} as="p" variant="body-lg" {...props} />
);
TextLarge.displayName = 'Typography.TextLarge';

// Label component
export const Label = forwardRef<HTMLLabelElement, Omit<TypographyProps, 'as' | 'variant'>>(
  (props, ref) => <Typography ref={ref} as="label" variant="label" {...props} />
);
Label.displayName = 'Typography.Label';

// Caption component
export const Caption = forwardRef<HTMLSpanElement, Omit<TypographyProps, 'as' | 'variant'>>(
  (props, ref) => <Typography ref={ref} as="span" variant="caption" {...props} />
);
Caption.displayName = 'Typography.Caption';

/* ============================================
   Exports
   ============================================ */

export default Typography;
