/**
 * WebOS Divider Component
 * 分隔线组件，支持水平/垂直、虚线/实线、带文字等
 */

import React, { forwardRef, useMemo } from 'react';

// ============================================
// Types
// ============================================

export type DividerDirection = 'horizontal' | 'vertical';
export type DividerStyle = 'solid' | 'dashed' | 'dotted' | 'double';
export type DividerSize = 'sm' | 'md' | 'lg';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 方向 */
  direction?: DividerDirection;
  /** 样式 */
  dividerStyle?: DividerStyle;
  /** 粗细 */
  size?: DividerSize;
  /** 颜色 */
  color?: string;
  /** 带文字标签 */
  label?: string;
  /** 文字位置 */
  labelPosition?: 'left' | 'center' | 'right';
  /** 自定义图标 */
  icon?: React.ReactNode;
  /** 间距 */
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  /** 是否透明 */
  transparent?: boolean;
  /** 是否为装饰性 (无语义) */
  decorative?: boolean;
  /** 子元素 */
  children?: React.ReactNode;
}

// ============================================
// Constants
// ============================================

const sizeMap: Record<DividerSize, number> = {
  sm: 1,
  md: 2,
  lg: 3,
};

const spacingMap: Record<string, string> = {
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
};

// ============================================
// Divider Component
// ============================================

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      direction = 'horizontal',
      dividerStyle = 'solid',
      size = 'md',
      color,
      label,
      labelPosition = 'center',
      icon,
      spacing = 'md',
      transparent = false,
      decorative = false,
      className = '',
      children,
      style,
      ...restProps
    },
    ref
  ) => {
    const hasContent = !!label || !!icon || !!children;

    // 构建类名
    const dividerClasses = useMemo(() => {
      const classes = [
        'webos-divider',
        `webos-divider--${direction}`,
        `webos-divider--${dividerStyle}`,
        `webos-divider--${size}`,
        hasContent && 'webos-divider--with-content',
        hasContent && `webos-divider--label-${labelPosition}`,
        transparent && 'webos-divider--transparent',
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return classes;
    }, [direction, dividerStyle, size, hasContent, labelPosition, transparent, className]);

    // 合并样式
    const dividerStyle_ = useMemo(() => {
      const mergedStyle: React.CSSProperties = {
        ...style,
      };

      // 设置颜色
      const borderColor = color || (transparent ? 'transparent' : 'var(--border-default)');

      if (direction === 'horizontal') {
        mergedStyle.borderTopWidth = `${sizeMap[size]}px`;
        mergedStyle.borderTopStyle = dividerStyle;
        mergedStyle.borderTopColor = borderColor;
        mergedStyle.marginTop = spacingMap[spacing];
        mergedStyle.marginBottom = spacingMap[spacing];
      } else {
        mergedStyle.borderLeftWidth = `${sizeMap[size]}px`;
        mergedStyle.borderLeftStyle = dividerStyle;
        mergedStyle.borderLeftColor = borderColor;
        mergedStyle.marginLeft = spacingMap[spacing];
        mergedStyle.marginRight = spacingMap[spacing];
        mergedStyle.height = '100%';
        mergedStyle.display = 'inline-block';
        mergedStyle.verticalAlign = 'middle';
      }

      return mergedStyle;
    }, [direction, dividerStyle, size, color, transparent, spacing, style]);

    // 无障碍属性
    const ariaProps = decorative
      ? { 'aria-hidden': true as const }
      : { role: 'separator' as const, 'aria-orientation': direction };

    // 渲染简单分隔线
    if (!hasContent) {
      return (
        <div
          ref={ref}
          className={dividerClasses}
          style={dividerStyle_}
          {...ariaProps}
          {...restProps}
        />
      );
    }

    // 渲染带内容的分隔线
    return (
      <div ref={ref} className={dividerClasses} {...ariaProps} {...restProps}>
        {direction === 'horizontal' ? (
          <>
            <span className="webos-divider__line webos-divider__line--before" />
            <span className="webos-divider__content">
              {icon && <span className="webos-divider__icon">{icon}</span>}
              {label && <span className="webos-divider__label">{label}</span>}
              {children}
            </span>
            <span className="webos-divider__line webos-divider__line--after" />
          </>
        ) : (
          <div className="webos-divider__vertical-wrapper">
            <span className="webos-divider__line webos-divider__line--before" />
            <span className="webos-divider__content">
              {icon && <span className="webos-divider__icon">{icon}</span>}
              {label && <span className="webos-divider__label">{label}</span>}
              {children}
            </span>
            <span className="webos-divider__line webos-divider__line--after" />
          </div>
        )}
      </div>
    );
  }
);

Divider.displayName = 'Divider';

// ============================================
// Horizontal Divider Component
// ============================================

export type HorizontalDividerProps = Omit<DividerProps, 'direction'>;

export const HorizontalDivider: React.FC<HorizontalDividerProps> = (props) => (
  <Divider direction="horizontal" {...props} />
);

HorizontalDivider.displayName = 'HorizontalDivider';

// ============================================
// Vertical Divider Component
// ============================================

export type VerticalDividerProps = Omit<DividerProps, 'direction'>;

export const VerticalDivider: React.FC<VerticalDividerProps> = (props) => (
  <Divider direction="vertical" {...props} />
);

VerticalDivider.displayName = 'VerticalDivider';

// ============================================
// Dashed Divider Component
// ============================================

export type DashedDividerProps = Omit<DividerProps, 'dividerStyle'>;

export const DashedDivider: React.FC<DashedDividerProps> = (props) => (
  <Divider dividerStyle="dashed" {...props} />
);

DashedDivider.displayName = 'DashedDivider';

// ============================================
// Dotted Divider Component
// ============================================

export type DottedDividerProps = Omit<DividerProps, 'dividerStyle'>;

export const DottedDivider: React.FC<DottedDividerProps> = (props) => (
  <Divider dividerStyle="dotted" {...props} />
);

DottedDivider.displayName = 'DottedDivider';

// ============================================
// Gradient Divider Component
// ============================================

export interface GradientDividerProps extends Omit<DividerProps, 'color' | 'transparent'> {
  /** 渐变开始颜色 */
  fromColor?: string;
  /** 渐变结束颜色 */
  toColor?: string;
}

export const GradientDivider: React.FC<GradientDividerProps> = ({
  fromColor = 'transparent',
  toColor = 'var(--border-default)',
  direction = 'horizontal',
  className = '',
  style,
  ...props
}) => {
  const gradientStyle = useMemo(() => {
    const mergedStyle: React.CSSProperties = {
      ...style,
    };

    if (direction === 'horizontal') {
      mergedStyle.background = `linear-gradient(to right, ${fromColor}, ${toColor}, ${fromColor})`;
      mergedStyle.height = '1px';
      mergedStyle.border = 'none';
    } else {
      mergedStyle.background = `linear-gradient(to bottom, ${fromColor}, ${toColor}, ${fromColor})`;
      mergedStyle.width = '1px';
      mergedStyle.border = 'none';
    }

    return mergedStyle;
  }, [direction, fromColor, toColor, style]);

  return (
    <Divider
      direction={direction}
      transparent
      className={`webos-divider--gradient ${className}`}
      style={gradientStyle}
      {...props}
    />
  );
};

GradientDivider.displayName = 'GradientDivider';

// ============================================
// Glow Divider Component (亚克力发光效果)
// ============================================

export interface GlowDividerProps extends Omit<DividerProps, 'color' | 'transparent'> {
  /** 发光颜色 */
  glowColor?: string;
  /** 发光强度 */
  intensity?: 'low' | 'medium' | 'high';
}

export const GlowDivider: React.FC<GlowDividerProps> = ({
  glowColor = 'var(--color-primary)',
  intensity = 'medium',
  direction = 'horizontal',
  className = '',
  style,
  ...props
}) => {
  const intensityMap = {
    low: '0 0 10px',
    medium: '0 0 20px',
    high: '0 0 30px',
  };

  const glowStyle = useMemo(() => {
    const mergedStyle: React.CSSProperties = {
      ...style,
    };

    if (direction === 'horizontal') {
      mergedStyle.height = '2px';
      mergedStyle.background = `linear-gradient(to right, transparent, ${glowColor}, transparent)`;
      mergedStyle.boxShadow = `${intensityMap[intensity]} ${glowColor}`;
      mergedStyle.border = 'none';
    } else {
      mergedStyle.width = '2px';
      mergedStyle.background = `linear-gradient(to bottom, transparent, ${glowColor}, transparent)`;
      mergedStyle.boxShadow = `${intensityMap[intensity]} ${glowColor}`;
      mergedStyle.border = 'none';
    }

    return mergedStyle;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intensityMap is a static lookup table that doesn't need to be a dependency
  }, [direction, glowColor, intensity, style]);

  return (
    <Divider
      direction={direction}
      transparent
      className={`webos-divider--glow ${className}`}
      style={glowStyle}
      {...props}
    />
  );
};

GlowDivider.displayName = 'GlowDivider';

// ============================================
// Acrylic Divider Component (亚克力风格)
// ============================================

export interface AcrylicDividerProps extends Omit<DividerProps, 'color'> {
  /** 模糊程度 */
  blur?: 'sm' | 'md' | 'lg';
}

export const AcrylicDivider: React.FC<AcrylicDividerProps> = ({
  blur = 'md',
  direction = 'horizontal',
  className = '',
  style,
  ...props
}) => {
  const blurMap = {
    sm: 'var(--blur-sm)',
    md: 'var(--blur-md)',
    lg: 'var(--blur-lg)',
  };

  const acrylicStyle = useMemo(() => {
    const mergedStyle: React.CSSProperties = {
      ...style,
      background: 'var(--bg-acrylic)',
      backdropFilter: `blur(${blurMap[blur]}) saturate(180%)`,
      WebkitBackdropFilter: `blur(${blurMap[blur]}) saturate(180%)`,
    };

    if (direction === 'horizontal') {
      mergedStyle.height = '2px';
      mergedStyle.border = 'none';
    } else {
      mergedStyle.width = '2px';
      mergedStyle.border = 'none';
    }

    return mergedStyle;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- blurMap is a static lookup table that doesn't need to be a dependency
  }, [direction, blur, style]);

  return (
    <Divider
      direction={direction}
      transparent
      className={`webos-divider--acrylic ${className}`}
      style={acrylicStyle}
      {...props}
    />
  );
};

AcrylicDivider.displayName = 'AcrylicDivider';

// ============================================
// Exports
// ============================================

export default Divider;
