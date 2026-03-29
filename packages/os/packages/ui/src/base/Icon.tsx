/**
 * WebOS Icon Component
 * 统一的图标组件，支持 Lucide 图标库和自定义 SVG
 */

import React, { forwardRef, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';

// ============================================
// Types
// ============================================

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'inherit';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  /** Lucide 图标名称 */
  name?: string;
  /** 自定义 SVG 路径 */
  path?: string;
  /** 图标尺寸 */
  size?: IconSize | number;
  /** 预设颜色 */
  color?: IconColor;
  /** 自定义颜色 */
  customColor?: string;
  /** 旋转角度 (deg) */
  rotate?: number;
  /** 是否旋转动画 */
  spin?: boolean;
  /** 是否脉冲动画 */
  pulse?: boolean;
  /** 线条粗细 */
  strokeWidth?: number | string;
  /** 填充颜色 */
  fill?: string;
  /** 无障碍标签 */
  label?: string;
  /** 是否保持原色 */
  inheritColor?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 点击事件 */
  onClick?: React.MouseEventHandler<SVGElement>;
}

// ============================================
// Constants
// ============================================

const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
};

const colorMap: Record<IconColor, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--text-secondary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
  inherit: 'currentColor',
};

// ============================================
// Icon Component
// ============================================

export const Icon = forwardRef<SVGElement, IconProps>(
  (
    {
      name,
      path,
      size = 'md',
      color = 'inherit',
      customColor,
      rotate = 0,
      spin = false,
      pulse = false,
      strokeWidth = 2,
      fill = 'none',
      label,
      inheritColor = false,
      className = '',
      style,
      onClick,
      ...restProps
    },
    ref
  ) => {
    // 计算实际尺寸
    const actualSize = useMemo(() => {
      if (typeof size === 'number') return size;
      return sizeMap[size];
    }, [size]);

    // 计算实际颜色
    const actualColor = useMemo(() => {
      if (customColor) return customColor;
      if (inheritColor) return 'currentColor';
      return colorMap[color];
    }, [customColor, color, inheritColor]);

    // 构建类名
    const iconClasses = useMemo(() => {
      const classes = [
        'webos-icon',
        spin && 'webos-icon--spin',
        pulse && 'webos-icon--pulse',
        onClick && 'webos-icon--clickable',
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return classes;
    }, [spin, pulse, onClick, className]);

    // 合并样式
    const iconStyle = useMemo(() => {
      const mergedStyle: React.CSSProperties = {
        ...style,
        color: actualColor,
      };

      if (rotate && rotate !== 0) {
        mergedStyle.transform = `rotate(${rotate}deg)`;
      }

      return mergedStyle;
    }, [style, actualColor, rotate]);

    // 无障碍属性
    const ariaProps = useMemo(() => {
      if (label) {
        return {
          'aria-label': label,
          role: 'img',
        };
      }
      return {
        'aria-hidden': true,
      };
    }, [label]);

    // 渲染 Lucide 图标
    if (name) {
      const LucideIcon = (LucideIcons as Record<string, React.FC<LucideIcons.LucideProps>>)[name];

      if (!LucideIcon) {
        console.warn(`[WebOS Icon] Icon "${name}" not found in Lucide icons`);
        return null;
      }

      return (
        <LucideIcon
          ref={ref as React.Ref<SVGSVGElement>}
          size={actualSize}
          strokeWidth={strokeWidth}
          color={actualColor}
          className={iconClasses}
          style={iconStyle}
          onClick={onClick}
          {...ariaProps}
          {...restProps}
        />
      );
    }

    // 渲染自定义 SVG
    if (path) {
      return (
        <svg
          ref={ref as React.Ref<SVGSVGElement>}
          className={iconClasses}
          style={iconStyle}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill={fill}
          stroke={actualColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          onClick={onClick}
          {...ariaProps}
          {...restProps}
        >
          <path d={path} />
        </svg>
      );
    }

    // 无有效图标
    console.warn('[WebOS Icon] Either "name" or "path" prop is required');
    return null;
  }
);

Icon.displayName = 'Icon';

// ============================================
// Icon Stack Component (图标叠加)
// ============================================

export interface IconStackProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 叠加尺寸 */
  size?: IconSize | number;
  /** 子图标 */
  children: React.ReactNode;
}

export const IconStack: React.FC<IconStackProps> = ({
  size = 'md',
  children,
  className = '',
  ...restProps
}) => {
  const actualSize = typeof size === 'number' ? size : sizeMap[size];

  return (
    <span
      className={`webos-icon-stack ${className}`}
      style={{ width: actualSize, height: actualSize }}
      {...restProps}
    >
      {children}
    </span>
  );
};

IconStack.displayName = 'IconStack';

// ============================================
// Preset Icons (预设图标组件)
// ============================================

interface PresetIconProps extends Omit<IconProps, 'name'> {
  size?: IconSize | number;
  color?: IconColor;
}

// 创建预设图标组件的工厂函数
function createPresetIcon(iconName: string, displayName: string) {
  const PresetIcon = forwardRef<SVGElement, PresetIconProps>((props, ref) => (
    <Icon ref={ref} name={iconName} {...props} />
  ));
  PresetIcon.displayName = displayName;
  return PresetIcon;
}

// 常用图标预设
export const Icons = {
  // 箭头类
  ArrowLeft: createPresetIcon('ArrowLeft', 'ArrowLeftIcon'),
  ArrowRight: createPresetIcon('ArrowRight', 'ArrowRightIcon'),
  ArrowUp: createPresetIcon('ArrowUp', 'ArrowUpIcon'),
  ArrowDown: createPresetIcon('ArrowDown', 'ArrowDownIcon'),
  ChevronLeft: createPresetIcon('ChevronLeft', 'ChevronLeftIcon'),
  ChevronRight: createPresetIcon('ChevronRight', 'ChevronRightIcon'),
  ChevronUp: createPresetIcon('ChevronUp', 'ChevronUpIcon'),
  ChevronDown: createPresetIcon('ChevronDown', 'ChevronDownIcon'),

  // 操作类
  Plus: createPresetIcon('Plus', 'PlusIcon'),
  Minus: createPresetIcon('Minus', 'MinusIcon'),
  X: createPresetIcon('X', 'XIcon'),
  Check: createPresetIcon('Check', 'CheckIcon'),
  Edit: createPresetIcon('Edit', 'EditIcon'),
  Trash: createPresetIcon('Trash', 'TrashIcon'),
  Copy: createPresetIcon('Copy', 'CopyIcon'),
  Save: createPresetIcon('Save', 'SaveIcon'),

  // 状态类
  Loading: createPresetIcon('Loader', 'LoadingIcon'),
  Success: createPresetIcon('CheckCircle', 'SuccessIcon'),
  Warning: createPresetIcon('AlertTriangle', 'WarningIcon'),
  Error: createPresetIcon('XCircle', 'ErrorIcon'),
  Info: createPresetIcon('Info', 'InfoIcon'),

  // 媒体类
  Play: createPresetIcon('Play', 'PlayIcon'),
  Pause: createPresetIcon('Pause', 'PauseIcon'),
  Volume: createPresetIcon('Volume2', 'VolumeIcon'),
  Mute: createPresetIcon('VolumeX', 'MuteIcon'),

  // 系统类
  Home: createPresetIcon('Home', 'HomeIcon'),
  Settings: createPresetIcon('Settings', 'SettingsIcon'),
  User: createPresetIcon('User', 'UserIcon'),
  Search: createPresetIcon('Search', 'SearchIcon'),
  Menu: createPresetIcon('Menu', 'MenuIcon'),
  MoreVertical: createPresetIcon('MoreVertical', 'MoreVerticalIcon'),
  MoreHorizontal: createPresetIcon('MoreHorizontal', 'MoreHorizontalIcon'),

  // 文件类
  File: createPresetIcon('File', 'FileIcon'),
  Folder: createPresetIcon('Folder', 'FolderIcon'),
  Download: createPresetIcon('Download', 'DownloadIcon'),
  Upload: createPresetIcon('Upload', 'UploadIcon'),

  // 通知类
  Bell: createPresetIcon('Bell', 'BellIcon'),
  Message: createPresetIcon('MessageCircle', 'MessageIcon'),

  // 眼睛类
  Eye: createPresetIcon('Eye', 'EyeIcon'),
  EyeOff: createPresetIcon('EyeOff', 'EyeOffIcon'),

  // 其他
  Star: createPresetIcon('Star', 'StarIcon'),
  Heart: createPresetIcon('Heart', 'HeartIcon'),
  Calendar: createPresetIcon('Calendar', 'CalendarIcon'),
  Clock: createPresetIcon('Clock', 'ClockIcon'),
  Lock: createPresetIcon('Lock', 'LockIcon'),
  Unlock: createPresetIcon('Unlock', 'UnlockIcon'),
  ExternalLink: createPresetIcon('ExternalLink', 'ExternalLinkIcon'),
  Refresh: createPresetIcon('RefreshCw', 'RefreshIcon'),
  Filter: createPresetIcon('Filter', 'FilterIcon'),
  Sort: createPresetIcon('ArrowUpDown', 'SortIcon'),
};

// ============================================
// Type-safe Icon Name List
// ============================================

export type LucideIconName = keyof typeof LucideIcons;

export const iconNames: LucideIconName[] = Object.keys(LucideIcons) as LucideIconName[];

// ============================================
// Exports
// ============================================

export default Icon;
