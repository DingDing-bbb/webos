/**
 * WebOS Button Component
 * 亚克力/毛玻璃设计风格的按钮组件
 */

import React, { forwardRef, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';

// ============================================
// Types
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: ButtonVariant;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 加载状态 */
  loading?: boolean;
  /** 图标名称 (Lucide icon) 或自定义 SVG */
  icon?: string | React.ReactNode;
  /** 图标位置 */
  iconPosition?: 'left' | 'right';
  /** 是否为图标按钮 (无文字) */
  iconOnly?: boolean;
  /** 使用亚克力效果 */
  acrylic?: boolean;
  /** 块级按钮 (100% 宽度) */
  block?: boolean;
  /** 子元素 */
  children?: React.ReactNode;
}

// ============================================
// Constants
// ============================================

const sizeConfig: Record<ButtonSize, { height: string; padding: string; fontSize: string; iconSize: number; gap: string }> = {
  xs: { height: '24px', padding: '6px 8px', fontSize: 'var(--os-font-size-xs)', iconSize: 12, gap: '4px' },
  sm: { height: '32px', padding: '8px 12px', fontSize: 'var(--os-font-size-sm)', iconSize: 14, gap: '6px' },
  md: { height: '40px', padding: '10px 16px', fontSize: 'var(--os-font-size-md)', iconSize: 16, gap: '8px' },
  lg: { height: '48px', padding: '12px 24px', fontSize: 'var(--os-font-size-lg)', iconSize: 18, gap: '10px' },
  xl: { height: '56px', padding: '16px 32px', fontSize: 'var(--os-font-size-xl)', iconSize: 20, gap: '12px' },
};

const iconOnlySizeConfig: Record<ButtonSize, { size: string; iconSize: number }> = {
  xs: { size: '24px', iconSize: 12 },
  sm: { size: '32px', iconSize: 14 },
  md: { size: '40px', iconSize: 16 },
  lg: { size: '48px', iconSize: 18 },
  xl: { size: '56px', iconSize: 20 },
};

// ============================================
// Loading Spinner Component
// ============================================

interface SpinnerProps {
  size: number;
}

const Spinner: React.FC<SpinnerProps> = ({ size }) => (
  <svg
    className="webos-button__spinner"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

// ============================================
// Button Component
// ============================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      iconOnly = false,
      acrylic = false,
      block = false,
      className = '',
      children,
      ...restProps
    },
    ref
  ) => {
    // 处理禁用状态
    const isDisabled = disabled || loading;

    // 获取尺寸配置
    const config = useMemo(() => sizeConfig[size], [size]);
    const iconConfig = useMemo(() => iconOnlySizeConfig[size], [size]);

    // 渲染图标
    const renderIcon = useMemo(() => {
      if (!icon) return null;

      // 如果是字符串，从 Lucide 图标库获取
      if (typeof icon === 'string') {
        const IconComponent = (LucideIcons as Record<string, React.FC<LucideIcons.LucideProps>>)[icon];
        if (!IconComponent) {
          console.warn(`Icon "${icon}" not found in Lucide icons`);
          return null;
        }
        return <IconComponent size={iconOnly ? iconConfig.iconSize : config.iconSize} aria-hidden="true" />;
      }

      // 自定义 React 节点
      return <span className="webos-button__custom-icon" aria-hidden="true">{icon}</span>;
    }, [icon, config.iconSize, iconConfig.iconSize, iconOnly]);

    // 构建类名
    const buttonClasses = useMemo(() => {
      const classes = [
        'webos-button',
        `webos-button--${variant}`,
        `webos-button--${size}`,
      ];

      if (iconOnly) classes.push('webos-button--icon-only');
      if (acrylic) classes.push('webos-button--acrylic');
      if (block) classes.push('webos-button--block');
      if (loading) classes.push('webos-button--loading');
      if (isDisabled) classes.push('webos-button--disabled');
      if (icon && iconPosition === 'right') classes.push('webos-button--icon-right');
      if (className) classes.push(className);

      return classes.join(' ');
    }, [variant, size, iconOnly, acrylic, block, loading, isDisabled, icon, iconPosition, className]);

    // 内联样式
    const buttonStyle = useMemo(() => {
      const style: React.CSSProperties = {};

      if (iconOnly) {
        style.width = iconConfig.size;
        style.height = iconConfig.size;
        style.padding = '0';
      } else {
        style.height = config.height;
        style.padding = `0 ${config.padding.split(' ')[1]}`;
        style.fontSize = config.fontSize;
        style.gap = config.gap;
      }

      return style;
    }, [iconOnly, iconConfig, config]);

    return (
      <button
        ref={ref}
        type="button"
        className={buttonClasses}
        style={buttonStyle}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...restProps}
      >
        {loading && <Spinner size={config.iconSize} />}
        {!loading && icon && iconPosition === 'left' && renderIcon}
        {!iconOnly && children && <span className="webos-button__content">{children}</span>}
        {!loading && icon && iconPosition === 'right' && renderIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================
// Button Group Component
// ============================================

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否垂直排列 */
  vertical?: boolean;
  /** 按钮尺寸 (会覆盖子按钮的 size) */
  size?: ButtonSize;
  /** 按钮变体 (会覆盖子按钮的 variant) */
  variant?: ButtonVariant;
  /** 是否相连 */
  attached?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  vertical = false,
  size,
  variant,
  attached = false,
  className = '',
  children,
  ...restProps
}) => {
  const groupClasses = [
    'webos-button-group',
    vertical ? 'webos-button-group--vertical' : 'webos-button-group--horizontal',
    attached && 'webos-button-group--attached',
    className,
  ].filter(Boolean).join(' ');

  // 克隆子元素并传递 props
  const enhancedChildren = useMemo(() => {
    if (!size && !variant) return children;

    return React.Children.map(children, (child) => {
      if (React.isValidElement<ButtonProps>(child)) {
        return React.cloneElement(child, {
          size: size || child.props.size,
          variant: variant || child.props.variant,
        });
      }
      return child;
    });
  }, [children, size, variant]);

  return (
    <div className={groupClasses} role="group" {...restProps}>
      {enhancedChildren}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';

// ============================================
// IconButton Component
// ============================================

export interface IconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'children'> {
  /** 图标名称或节点 */
  icon: string | React.ReactNode;
  /** 无障碍标签 (必需) */
  'aria-label': string;
  /** 提示文本 */
  tooltip?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, tooltip, 'aria-label': ariaLabel, ...restProps }, ref) => {
    return (
      <Button
        ref={ref}
        icon={icon}
        iconOnly
        aria-label={ariaLabel}
        title={tooltip}
        {...restProps}
      />
    );
  }
);

IconButton.displayName = 'IconButton';

// ============================================
// Exports
// ============================================

export default Button;
