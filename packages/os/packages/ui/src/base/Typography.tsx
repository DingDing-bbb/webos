/**
 * WebOS Typography Component
 * 排版组件系统，支持标题、文本、段落等
 */

import React, { forwardRef, useMemo } from 'react';

// ============================================
// Types
// ============================================

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'disabled'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'inherit';

// ============================================
// Constants
// ============================================

const headingStyles: Record<
  HeadingLevel,
  { fontSize: string; fontWeight: string; lineHeight: string }
> = {
  h1: {
    fontSize: 'var(--os-font-size-4xl)',
    fontWeight: 'var(--os-font-weight-bold)',
    lineHeight: 'var(--os-line-height-tight)',
  },
  h2: {
    fontSize: 'var(--os-font-size-3xl)',
    fontWeight: 'var(--os-font-weight-bold)',
    lineHeight: 'var(--os-line-height-tight)',
  },
  h3: {
    fontSize: 'var(--os-font-size-2xl)',
    fontWeight: 'var(--os-font-weight-semibold)',
    lineHeight: 'var(--os-line-height-tight)',
  },
  h4: {
    fontSize: 'var(--os-font-size-xl)',
    fontWeight: 'var(--os-font-weight-semibold)',
    lineHeight: 'var(--os-line-height-normal)',
  },
  h5: {
    fontSize: 'var(--os-font-size-lg)',
    fontWeight: 'var(--os-font-weight-medium)',
    lineHeight: 'var(--os-line-height-normal)',
  },
  h6: {
    fontSize: 'var(--os-font-size-md)',
    fontWeight: 'var(--os-font-weight-medium)',
    lineHeight: 'var(--os-line-height-normal)',
  },
};

const textSizeMap: Record<TextSize, string> = {
  xs: 'var(--os-font-size-xs)',
  sm: 'var(--os-font-size-sm)',
  md: 'var(--os-font-size-md)',
  lg: 'var(--os-font-size-lg)',
  xl: 'var(--os-font-size-xl)',
  '2xl': 'var(--os-font-size-2xl)',
  '3xl': 'var(--os-font-size-3xl)',
};

const textWeightMap: Record<TextWeight, string> = {
  light: 'var(--os-font-weight-light)',
  normal: 'var(--os-font-weight-normal)',
  medium: 'var(--os-font-weight-medium)',
  semibold: 'var(--os-font-weight-semibold)',
  bold: 'var(--os-font-weight-bold)',
};

const textColorMap: Record<TextColor, string> = {
  primary: 'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  tertiary: 'var(--text-tertiary)',
  disabled: 'var(--text-disabled)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
  inherit: 'inherit',
};

// ============================================
// Heading Component
// ============================================

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** 标题级别 */
  level?: HeadingLevel;
  /** 视觉级别 (可不同于语义级别) */
  visualLevel?: HeadingLevel;
  /** 文本对齐 */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** 是否加粗 */
  bold?: boolean;
  /** 是否斜体 */
  italic?: boolean;
  /** 是否截断 */
  truncate?: boolean | number;
  /** 截断行数 */
  lines?: number;
  /** 自定义颜色 */
  color?: TextColor | string;
  /** 无下边距 */
  noMargin?: boolean;
  /** 子元素 */
  children?: React.ReactNode;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      level = 'h2',
      visualLevel,
      align = 'left',
      bold,
      italic,
      truncate,
      lines,
      color,
      noMargin = false,
      className = '',
      children,
      style,
      ...restProps
    },
    ref
  ) => {
    // 获取样式配置
    const effectiveLevel = visualLevel || level;
    const config = headingStyles[effectiveLevel];

    // 构建类名
    const headingClasses = useMemo(() => {
      const classes = [
        'webos-heading',
        `webos-heading--${level}`,
        truncate && 'webos-heading--truncate',
        lines && `webos-heading--lines-${lines}`,
        noMargin && 'webos-heading--no-margin',
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return classes;
    }, [level, truncate, lines, noMargin, className]);

    // 合并样式
    const headingStyle = useMemo(() => {
      const mergedStyle: React.CSSProperties = {
        fontSize: config.fontSize,
        fontWeight: bold ? 'var(--os-font-weight-bold)' : config.fontWeight,
        lineHeight: config.lineHeight,
        textAlign: align,
        ...style,
      };

      if (italic) mergedStyle.fontStyle = 'italic';
      if (color) mergedStyle.color = textColorMap[color as TextColor] || color;
      if (truncate && typeof truncate === 'number') mergedStyle.maxWidth = `${truncate}ch`;

      return mergedStyle;
    }, [config, bold, italic, align, color, truncate, style]);

    // 动态创建元素
    const Tag = level;

    return (
      <Tag ref={ref} className={headingClasses} style={headingStyle} {...restProps}>
        {children}
      </Tag>
    );
  }
);

Heading.displayName = 'Heading';

// ============================================
// Text Component
// ============================================

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 文本尺寸 */
  size?: TextSize;
  /** 文本粗细 */
  weight?: TextWeight;
  /** 文本颜色 */
  color?: TextColor | string;
  /** 文本对齐 */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** 是否截断 */
  truncate?: boolean | number;
  /** 截断行数 */
  lines?: number;
  /** 是否加粗 */
  bold?: boolean;
  /** 是否斜体 */
  italic?: boolean;
  /** 下划线 */
  underline?: boolean;
  /** 删除线 */
  strike?: boolean;
  /** 小型大写字母 */
  smallCaps?: boolean;
  /** 字母间距 */
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest' | number;
  /** 文本转换 */
  transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  /** 渲染元素 */
  as?: 'span' | 'p' | 'div' | 'label' | 'small' | 'strong' | 'em';
  /** 子元素 */
  children?: React.ReactNode;
}

export const Text = forwardRef<HTMLSpanElement, TextProps>(
  (
    {
      size = 'md',
      weight = 'normal',
      color = 'primary',
      align = 'left',
      truncate,
      lines,
      bold,
      italic,
      underline,
      strike,
      smallCaps,
      letterSpacing,
      transform,
      as: Component = 'span',
      className = '',
      children,
      style,
      ...restProps
    },
    ref
  ) => {
    // 构建类名
    const textClasses = useMemo(() => {
      const classes = [
        'webos-text',
        `webos-text--${size}`,
        truncate && 'webos-text--truncate',
        lines && `webos-text--lines-${lines}`,
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return classes;
    }, [size, truncate, lines, className]);

    // 合并样式
    const textStyle = useMemo(() => {
      const mergedStyle: React.CSSProperties = {
        fontSize: textSizeMap[size],
        fontWeight: bold ? 'var(--os-font-weight-bold)' : textWeightMap[weight],
        color: textColorMap[color as TextColor] || color,
        textAlign: align,
        ...style,
      };

      if (italic) mergedStyle.fontStyle = 'italic';
      if (underline) mergedStyle.textDecoration = 'underline';
      if (strike) mergedStyle.textDecoration = 'line-through';
      if (underline && strike) mergedStyle.textDecoration = 'underline line-through';
      if (smallCaps) mergedStyle.fontVariant = 'small-caps';
      if (transform && transform !== 'none') mergedStyle.textTransform = transform;
      if (typeof letterSpacing === 'string') {
        mergedStyle.letterSpacing = `var(--letter-spacing-${letterSpacing})`;
      } else if (typeof letterSpacing === 'number') {
        mergedStyle.letterSpacing = `${letterSpacing}px`;
      }
      if (truncate && typeof truncate === 'number') {
        mergedStyle.maxWidth = `${truncate}ch`;
      }

      return mergedStyle;
    }, [
      size,
      weight,
      color,
      align,
      bold,
      italic,
      underline,
      strike,
      smallCaps,
      letterSpacing,
      transform,
      truncate,
      style,
    ]);

    return (
      <Component
        ref={ref as React.Ref<HTMLSpanElement>}
        className={textClasses}
        style={textStyle}
        {...restProps}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

// ============================================
// Paragraph Component
// ============================================

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** 文本尺寸 */
  size?: TextSize;
  /** 文本颜色 */
  color?: TextColor | string;
  /** 文本对齐 */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** 行高 */
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  /** 截断行数 */
  lines?: number;
  /** 下边距 */
  marginBottom?: boolean;
  /** 子元素 */
  children?: React.ReactNode;
}

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      size = 'md',
      color = 'primary',
      align = 'left',
      lineHeight = 'relaxed',
      lines,
      marginBottom = true,
      className = '',
      children,
      style,
      ...restProps
    },
    ref
  ) => {
    // 构建类名
    const paragraphClasses = useMemo(() => {
      const classes = [
        'webos-paragraph',
        `webos-paragraph--${size}`,
        lines && `webos-paragraph--lines-${lines}`,
        !marginBottom && 'webos-paragraph--no-margin',
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return classes;
    }, [size, lines, marginBottom, className]);

    // 合并样式
    const paragraphStyle = useMemo(() => {
      const mergedStyle: React.CSSProperties = {
        fontSize: textSizeMap[size],
        color: textColorMap[color as TextColor] || color,
        textAlign: align,
        lineHeight: `var(--os-line-height-${lineHeight})`,
        ...style,
      };

      return mergedStyle;
    }, [size, color, align, lineHeight, style]);

    return (
      <p ref={ref} className={paragraphClasses} style={paragraphStyle} {...restProps}>
        {children}
      </p>
    );
  }
);

Paragraph.displayName = 'Paragraph';

// ============================================
// Link Component
// ============================================

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** 文本尺寸 */
  size?: TextSize;
  /** 链接颜色 */
  color?: TextColor | string;
  /** 是否显示下划线 */
  underline?: boolean | 'hover';
  /** 是否禁用 */
  disabled?: boolean;
  /** 外部链接图标 */
  external?: boolean;
  /** 子元素 */
  children?: React.ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      size = 'md',
      color = 'info',
      underline = 'hover',
      disabled = false,
      external = false,
      className = '',
      children,
      style,
      href,
      target,
      rel,
      ...restProps
    },
    ref
  ) => {
    // 构建类名
    const linkClasses = useMemo(() => {
      const classes = [
        'webos-link',
        `webos-link--${size}`,
        underline === true && 'webos-link--underline',
        underline === 'hover' && 'webos-link--underline-hover',
        disabled && 'webos-link--disabled',
        external && 'webos-link--external',
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return classes;
    }, [size, underline, disabled, external, className]);

    // 合并样式
    const linkStyle = useMemo(() => {
      const mergedStyle: React.CSSProperties = {
        fontSize: textSizeMap[size],
        ...style,
      };

      if (!disabled && color) {
        mergedStyle.color = textColorMap[color as TextColor] || color;
      }

      return mergedStyle;
    }, [size, color, disabled, style]);

    // 处理外部链接
    const linkTarget = external ? '_blank' : target;
    const linkRel = external ? 'noopener noreferrer' : rel;

    return (
      <a
        ref={ref}
        className={linkClasses}
        style={linkStyle}
        href={disabled ? undefined : href}
        target={linkTarget}
        rel={linkRel}
        aria-disabled={disabled}
        {...restProps}
      >
        {children}
        {external && (
          <svg
            className="webos-link__external-icon"
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        )}
      </a>
    );
  }
);

Link.displayName = 'Link';

// ============================================
// Code Component
// ============================================

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  /** 代码尺寸 */
  size?: TextSize;
  /** 代码颜色 */
  color?: TextColor | string;
  /** 是否块级代码 */
  block?: boolean;
  /** 语言标识 */
  language?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

export const Code = forwardRef<HTMLElement, CodeProps>(
  (
    {
      size = 'sm',
      color = 'primary',
      block = false,
      language,
      className = '',
      children,
      style,
      ...restProps
    },
    ref
  ) => {
    // 构建类名
    const codeClasses = useMemo(() => {
      const classes = [
        'webos-code',
        `webos-code--${size}`,
        block && 'webos-code--block',
        language && `webos-code--language-${language}`,
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return classes;
    }, [size, block, language, className]);

    // 合并样式
    const codeStyle = useMemo(() => {
      const mergedStyle: React.CSSProperties = {
        fontSize: textSizeMap[size],
        ...style,
      };

      if (color) {
        mergedStyle.color = textColorMap[color as TextColor] || color;
      }

      return mergedStyle;
    }, [size, color, style]);

    const Component = block ? 'pre' : 'code';

    return (
      <Component
        ref={ref as React.Ref<HTMLElement>}
        className={codeClasses}
        style={codeStyle}
        {...restProps}
      >
        {block ? <code>{children}</code> : children}
      </Component>
    );
  }
);

Code.displayName = 'Code';

// ============================================
// Text Utilities
// ============================================

/** 文本截断高阶组件 */
export function withTruncation<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { truncate?: boolean | number; lines?: number }> {
  const TruncatedComponent = forwardRef<
    HTMLElement,
    P & { truncate?: boolean | number; lines?: number }
  >(({ truncate, lines, style, ...props }, ref) => {
    const mergedStyle: React.CSSProperties = {
      ...style,
    };

    if (truncate || lines) {
      mergedStyle.overflow = 'hidden';
      mergedStyle.textOverflow = 'ellipsis';
    }

    if (lines) {
      mergedStyle.display = '-webkit-box';
      mergedStyle.WebkitLineClamp = lines;
      mergedStyle.WebkitBoxOrient = 'vertical';
    } else {
      mergedStyle.whiteSpace = 'nowrap';
    }

    return <Component ref={ref} style={mergedStyle} {...(props as P)} />;
  });

  TruncatedComponent.displayName = `WithTruncation(${Component.displayName || Component.name || 'Component'})`;
  return TruncatedComponent;
}

// ============================================
// Exports
// ============================================

export default {
  Heading,
  Text,
  Paragraph,
  Link,
  Code,
};
