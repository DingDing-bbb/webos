/**
 * WebOS Spacer Component
 * 灵活的间距组件，支持水平和垂直方向
 */

import React, { forwardRef, useMemo } from 'react';

// ============================================
// Types
// ============================================

export type SpacerSize = 'none' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type SpacerDirection = 'horizontal' | 'vertical' | 'both';

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 间距尺寸 */
  size?: SpacerSize;
  /** 自定义尺寸 (px) */
  customSize?: number | string;
  /** 方向 */
  direction?: SpacerDirection;
  /** 是否自动填充剩余空间 */
  flex?: boolean;
  /** 是否显示背景 (用于调试) */
  debug?: boolean;
  /** 是否可见 (不可见但占据空间) */
  invisible?: boolean;
  /** 最小尺寸 */
  minSize?: number;
  /** 最大尺寸 */
  maxSize?: number;
  /** 子元素 */
  children?: React.ReactNode;
}

// ============================================
// Constants
// ============================================

const sizeMap: Record<SpacerSize, number> = {
  none: 0,
  '2xs': 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// ============================================
// Spacer Component
// ============================================

export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(
  (
    {
      size = 'md',
      customSize,
      direction = 'vertical',
      flex = false,
      debug = false,
      invisible = false,
      minSize,
      maxSize,
      className = '',
      children,
      style,
      ...restProps
    },
    ref
  ) => {
    // 计算实际尺寸
    const actualSize = useMemo(() => {
      if (customSize !== undefined) {
        return typeof customSize === 'number' ? customSize : parseInt(customSize, 10);
      }
      return sizeMap[size];
    }, [customSize, size]);

    // 构建类名
    const spacerClasses = useMemo(() => {
      const classes = [
        'webos-spacer',
        `webos-spacer--${direction}`,
        flex && 'webos-spacer--flex',
        debug && 'webos-spacer--debug',
        invisible && 'webos-spacer--invisible',
        className,
      ].filter(Boolean).join(' ');

      return classes;
    }, [direction, flex, debug, invisible, className]);

    // 合并样式
    const spacerStyle = useMemo(() => {
      const mergedStyle: React.CSSProperties = {
        ...style,
      };

      if (flex) {
        mergedStyle.flex = '1 1 auto';
      } else {
        switch (direction) {
          case 'horizontal':
            mergedStyle.width = `${actualSize}px`;
            mergedStyle.height = '1px';
            mergedStyle.display = 'inline-block';
            break;
          case 'vertical':
            mergedStyle.height = `${actualSize}px`;
            mergedStyle.width = '100%';
            break;
          case 'both':
            mergedStyle.width = `${actualSize}px`;
            mergedStyle.height = `${actualSize}px`;
            break;
        }
      }

      if (minSize !== undefined) {
        if (direction === 'horizontal' || direction === 'both') {
          mergedStyle.minWidth = `${minSize}px`;
        }
        if (direction === 'vertical' || direction === 'both') {
          mergedStyle.minHeight = `${minSize}px`;
        }
      }

      if (maxSize !== undefined) {
        if (direction === 'horizontal' || direction === 'both') {
          mergedStyle.maxWidth = `${maxSize}px`;
        }
        if (direction === 'vertical' || direction === 'both') {
          mergedStyle.maxHeight = `${maxSize}px`;
        }
      }

      return mergedStyle;
    }, [actualSize, direction, flex, minSize, maxSize, style]);

    return (
      <div
        ref={ref}
        className={spacerClasses}
        style={spacerStyle}
        aria-hidden="true"
        {...restProps}
      >
        {children}
      </div>
    );
  }
);

Spacer.displayName = 'Spacer';

// ============================================
// Preset Spacer Components
// ============================================

/** 超小间距 */
export const Spacer2XS: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="2xs" {...props} />
);

/** 小间距 */
export const SpacerXS: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="xs" {...props} />
);

/** 标准间距 */
export const SpacerSM: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="sm" {...props} />
);

/** 中等间距 */
export const SpacerMD: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="md" {...props} />
);

/** 大间距 */
export const SpacerLG: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="lg" {...props} />
);

/** 超大间距 */
export const SpacerXL: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="xl" {...props} />
);

/** 特大间距 */
export const Spacer2XL: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="2xl" {...props} />
);

/** 巨大间距 */
export const Spacer3XL: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="3xl" {...props} />
);

/** 超巨大间距 */
export const Spacer4XL: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="4xl" {...props} />
);

// ============================================
// Flex Spacer Component
// ============================================

export interface FlexSpacerProps extends Omit<SpacerProps, 'flex' | 'size' | 'direction'> {
  /** 纵横比 */
  ratio?: number;
}

export const FlexSpacer: React.FC<FlexSpacerProps> = ({ ratio = 1, style, ...props }) => (
  <Spacer
    flex
    style={{
      flex: `${ratio} 1 auto`,
      ...style,
    }}
    {...props}
  />
);

// ============================================
// Inline Spacer Component
// ============================================

export interface InlineSpacerProps extends Omit<SpacerProps, 'direction'> {
  /** 间距尺寸 */
  size?: SpacerSize;
}

export const InlineSpacer: React.FC<InlineSpacerProps> = ({
  size = 'sm',
  style,
  ...props
}) => (
  <span
    className={`webos-inline-spacer webos-inline-spacer--${size}`}
    style={{
      display: 'inline-block',
      width: `${sizeMap[size]}px`,
      ...style,
    }}
    aria-hidden="true"
    {...props}
  />
);

// ============================================
// Box Component (带间距的容器)
// ============================================

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 内边距 */
  p?: SpacerSize | number;
  /** 水平内边距 */
  px?: SpacerSize | number;
  /** 垂直内边距 */
  py?: SpacerSize | number;
  /** 上边距 */
  pt?: SpacerSize | number;
  /** 右边距 */
  pr?: SpacerSize | number;
  /** 下边距 */
  pb?: SpacerSize | number;
  /** 左边距 */
  pl?: SpacerSize | number;
  /** 外边距 */
  m?: SpacerSize | number;
  /** 水平外边距 */
  mx?: SpacerSize | number;
  /** 垂直外边距 */
  my?: SpacerSize | number;
  /** 上外边距 */
  mt?: SpacerSize | number;
  /** 右外边距 */
  mr?: SpacerSize | number;
  /** 下外边距 */
  mb?: SpacerSize | number;
  /** 左外边距 */
  ml?: SpacerSize | number;
  /** 子元素 */
  children?: React.ReactNode;
}

const getSpacingValue = (size: SpacerSize | number): string => {
  if (typeof size === 'number') return `${size}px`;
  return `${sizeMap[size]}px`;
};

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      p,
      px,
      py,
      pt,
      pr,
      pb,
      pl,
      m,
      mx,
      my,
      mt,
      mr,
      mb,
      ml,
      className = '',
      children,
      style,
      ...restProps
    },
    ref
  ) => {
    // 构建类名
    const boxClasses = useMemo(() => {
      const classes = ['webos-box', className].filter(Boolean).join(' ');
      return classes;
    }, [className]);

    // 合并样式
    const boxStyle = useMemo(() => {
      const mergedStyle: React.CSSProperties = { ...style };

      // 内边距
      if (p !== undefined) {
        mergedStyle.padding = getSpacingValue(p);
      }
      if (px !== undefined) {
        const value = getSpacingValue(px);
        mergedStyle.paddingLeft = value;
        mergedStyle.paddingRight = value;
      }
      if (py !== undefined) {
        const value = getSpacingValue(py);
        mergedStyle.paddingTop = value;
        mergedStyle.paddingBottom = value;
      }
      if (pt !== undefined) mergedStyle.paddingTop = getSpacingValue(pt);
      if (pr !== undefined) mergedStyle.paddingRight = getSpacingValue(pr);
      if (pb !== undefined) mergedStyle.paddingBottom = getSpacingValue(pb);
      if (pl !== undefined) mergedStyle.paddingLeft = getSpacingValue(pl);

      // 外边距
      if (m !== undefined) {
        mergedStyle.margin = getSpacingValue(m);
      }
      if (mx !== undefined) {
        const value = getSpacingValue(mx);
        mergedStyle.marginLeft = value;
        mergedStyle.marginRight = value;
      }
      if (my !== undefined) {
        const value = getSpacingValue(my);
        mergedStyle.marginTop = value;
        mergedStyle.marginBottom = value;
      }
      if (mt !== undefined) mergedStyle.marginTop = getSpacingValue(mt);
      if (mr !== undefined) mergedStyle.marginRight = getSpacingValue(mr);
      if (mb !== undefined) mergedStyle.marginBottom = getSpacingValue(mb);
      if (ml !== undefined) mergedStyle.marginLeft = getSpacingValue(ml);

      return mergedStyle;
    }, [p, px, py, pt, pr, pb, pl, m, mx, my, mt, mr, mb, ml, style]);

    return (
      <div ref={ref} className={boxClasses} style={boxStyle} {...restProps}>
        {children}
      </div>
    );
  }
);

Box.displayName = 'Box';

// ============================================
// Stack Component (带间距的堆叠容器)
// ============================================

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 子元素间距 */
  spacing?: SpacerSize | number;
  /** 方向 */
  direction?: 'row' | 'column';
  /** 对齐方式 */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** 分布方式 */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** 是否换行 */
  wrap?: boolean;
  /** 是否内联 */
  inline?: boolean;
  /** 是否分隔 */
  divider?: boolean;
  /** 子元素 */
  children?: React.ReactNode;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      spacing = 'md',
      direction = 'column',
      align = 'stretch',
      justify = 'start',
      wrap = false,
      inline = false,
      divider = false,
      className = '',
      children,
      style,
      ...restProps
    },
    ref
  ) => {
    // 构建类名
    const stackClasses = useMemo(() => {
      const classes = [
        'webos-stack',
        `webos-stack--${direction}`,
        `webos-stack--align-${align}`,
        `webos-stack--justify-${justify}`,
        wrap && 'webos-stack--wrap',
        inline && 'webos-stack--inline',
        divider && 'webos-stack--divider',
        className,
      ].filter(Boolean).join(' ');

      return classes;
    }, [direction, align, justify, wrap, inline, divider, className]);

    // 合并样式
    const stackStyle = useMemo(() => {
      const gapValue = typeof spacing === 'number' ? `${spacing}px` : getSpacingValue(spacing);

      const mergedStyle: React.CSSProperties = {
        display: inline ? 'inline-flex' : 'flex',
        flexDirection: direction,
        alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align,
        justifyContent: justify === 'between' ? 'space-between' : justify === 'around' ? 'space-around' : justify === 'evenly' ? 'space-evenly' : justify === 'start' ? 'flex-start' : justify === 'end' ? 'flex-end' : justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        gap: gapValue,
        ...style,
      };

      return mergedStyle;
    }, [spacing, direction, align, justify, wrap, inline, style]);

    return (
      <div ref={ref} className={stackClasses} style={stackStyle} {...restProps}>
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';

// ============================================
// Exports
// ============================================

export default Spacer;
