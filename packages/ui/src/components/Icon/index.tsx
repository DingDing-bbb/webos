/**
 * @fileoverview Icon Component
 * @module @ui/components/Icon
 *
 * A flexible icon wrapper component for SVG icons.
 * Supports sizes, colors, rotation, and animations.
 */

import {
  forwardRef,
  useMemo,
  type ReactNode,
  type SVGAttributes,
} from 'react';
import './styles.css';

/* ============================================
   Types
   ============================================ */

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconColor =
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
export type IconRotation = 45 | 90 | 135 | 180 | 225 | 270 | 315;

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'color' | 'ref'> {
  /** Icon size */
  size?: IconSize;
  /** Icon color */
  color?: IconColor;
  /** Rotation in degrees */
  rotate?: IconRotation;
  /** Enable spin animation */
  spin?: boolean;
  /** Enable pulse animation */
  pulse?: boolean;
  /** Make icon interactive (hover effects) */
  interactive?: boolean;
  /** Inline with text */
  inline?: boolean;
  /** Inline at end of text */
  inlineEnd?: boolean;
  /** Accessible label */
  label?: string;
  /** Custom icon element (SVG) */
  children?: ReactNode;
  /** Click handler for interactive icons */
  onClick?: () => void;
  /** Custom class name */
  className?: string;
  /** Custom width (overrides size) */
  width?: number | string;
  /** Custom height (overrides size) */
  height?: number | string;
}

/* ============================================
   Built-in Icon Paths
   ============================================ */

const iconPaths: Record<string, ReactNode> = {
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  check: (
    <polyline points="20,6 9,17 4,12" />
  ),
  'chevron-up': (
    <polyline points="18,15 12,9 6,15" />
  ),
  'chevron-down': (
    <polyline points="6,9 12,15 18,9" />
  ),
  'chevron-left': (
    <polyline points="15,18 9,12 15,6" />
  ),
  'chevron-right': (
    <polyline points="9,6 15,12 9,18" />
  ),
  'arrow-up': (
    <line x1="12" y1="19" x2="12" y2="5" />
  ),
  'arrow-down': (
    <line x1="12" y1="5" x2="12" y2="19" />
  ),
  'arrow-left': (
    <line x1="19" y1="12" x2="5" y2="12" />
  ),
  'arrow-right': (
    <line x1="5" y1="12" x2="19" y2="12" />
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  minus: (
    <line x1="5" y1="12" x2="19" y2="12" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  home: (
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  mail: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  heart: (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  ),
  star: (
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  ),
  'info-circle': (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  'alert-circle': (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
  'alert-triangle': (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  loader: (
    <line x1="12" y1="2" x2="12" y2="6" />
  ),
  refresh: (
    <polyline points="23,4 23,10 17,10" />
  ),
  more: (
    <>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </>
  ),
  menu: (
    <>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
  external: (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15,3 21,3 21,9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  trash: (
    <>
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  edit: (
    <>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  ),
  folder: (
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  ),
  file: (
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21,15 16,10 5,21" />
    </>
  ),
  video: (
    <polygon points="23,7 16,12 23,17 23,7" />
  ),
  music: (
    <>
      <circle cx="5.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="15.5" r="2.5" />
      <path d="M8 17V5l12-2v12" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  unlock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </>
  ),
  'wifi-off': (
    <>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </>
  ),
  battery: (
    <>
      <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
      <line x1="23" y1="10" x2="23" y2="14" />
    </>
  ),
  'battery-charging': (
    <>
      <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2.81A2 2 0 0 1 20 8v8a2 2 0 0 1-2 2h-2" />
      <line x1="23" y1="13" x2="23" y2="11" />
      <polyline points="11,6 7,12 13,12 9,18" />
    </>
  ),
  volume: (
    <>
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </>
  ),
  'volume-mute': (
    <>
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </>
  ),
  moon: (
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  ),
  power: (
    <>
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </>
  ),
  maximize: (
    <>
      <polyline points="15,3 21,3 21,9" />
      <polyline points="9,21 3,21 3,15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </>
  ),
  minimize: (
    <>
      <polyline points="4,14 10,14 10,20" />
      <polyline points="20,10 14,10 14,4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </>
  ),
};

/* ============================================
   Component
   ============================================ */

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  (
    {
      size = 'md',
      color = 'default',
      rotate,
      spin = false,
      pulse = false,
      interactive = false,
      inline = false,
      inlineEnd = false,
      label,
      children,
      onClick,
      className = '',
      width,
      height,
      viewBox = '0 0 24 24',
      strokeWidth = 2,
      strokeLinecap = 'round',
      strokeLinejoin = 'round',
      ...rest
    },
    ref
  ) => {
    // Compute class names using BEM
    const classNames = useMemo(() => {
      const classes = ['os-icon', `os-icon--${size}`];

      // Color
      if (color !== 'default') {
        classes.push(`os-icon--${color}`);
      }

      // Rotation
      if (rotate) {
        classes.push(`os-icon--rotate-${rotate}`);
      }

      // Animations
      if (spin) {
        classes.push('os-icon--spin');
      }

      if (pulse) {
        classes.push('os-icon--pulse');
      }

      // Interactive
      if (interactive || onClick) {
        classes.push('os-icon--interactive');
      }

      // Inline
      if (inline) {
        classes.push('os-icon--inline');
      }

      if (inlineEnd) {
        classes.push('os-icon--inline-end');
      }

      // Custom className
      if (className) {
        classes.push(className);
      }

      return classes.join(' ');
    }, [size, color, rotate, spin, pulse, interactive, inline, inlineEnd, onClick, className]);

    // Determine if the icon should be hidden from screen readers
    const shouldHideFromScreenReader = !label;

    return (
      <span className={classNames} aria-hidden={shouldHideFromScreenReader}>
        <svg
          ref={ref}
          className="os-icon__svg"
          viewBox={viewBox}
          width={width}
          height={height}
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
          strokeLinejoin={strokeLinejoin}
          role={label ? 'img' : undefined}
          aria-label={label}
          onClick={onClick}
          {...rest}
        >
          {children}
        </svg>
      </span>
    );
  }
);

Icon.displayName = 'Icon';

/* ============================================
   Icon Presets (Built-in Icons)
   ============================================ */

// Helper function to create typed icon components
function createIconComponent(name: string, children: ReactNode) {
  const IconComponent = forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
    (props, ref) => (
      <Icon ref={ref} {...props}>
        {children}
      </Icon>
    )
  );
  IconComponent.displayName = `Icon.${name}`;
  return IconComponent;
}

// Export built-in icon components
export const IconClose = createIconComponent('Close', iconPaths.close);
export const IconCheck = createIconComponent('Check', iconPaths.check);
export const IconChevronUp = createIconComponent('ChevronUp', iconPaths['chevron-up']);
export const IconChevronDown = createIconComponent('ChevronDown', iconPaths['chevron-down']);
export const IconChevronLeft = createIconComponent('ChevronLeft', iconPaths['chevron-left']);
export const IconChevronRight = createIconComponent('ChevronRight', iconPaths['chevron-right']);
export const IconArrowUp = createIconComponent('ArrowUp', iconPaths['arrow-up']);
export const IconArrowDown = createIconComponent('ArrowDown', iconPaths['arrow-down']);
export const IconArrowLeft = createIconComponent('ArrowLeft', iconPaths['arrow-left']);
export const IconArrowRight = createIconComponent('ArrowRight', iconPaths['arrow-right']);
export const IconPlus = createIconComponent('Plus', iconPaths.plus);
export const IconMinus = createIconComponent('Minus', iconPaths.minus);
export const IconSearch = createIconComponent('Search', iconPaths.search);
export const IconSettings = createIconComponent('Settings', iconPaths.settings);
export const IconHome = createIconComponent('Home', iconPaths.home);
export const IconUser = createIconComponent('User', iconPaths.user);
export const IconMail = createIconComponent('Mail', iconPaths.mail);
export const IconHeart = createIconComponent('Heart', iconPaths.heart);
export const IconStar = createIconComponent('Star', iconPaths.star);
export const IconInfoCircle = createIconComponent('InfoCircle', iconPaths['info-circle']);
export const IconAlertCircle = createIconComponent('AlertCircle', iconPaths['alert-circle']);
export const IconAlertTriangle = createIconComponent('AlertTriangle', iconPaths['alert-triangle']);
export const IconLoader = createIconComponent('Loader', iconPaths.loader);
export const IconRefresh = createIconComponent('Refresh', iconPaths.refresh);
export const IconMore = createIconComponent('More', iconPaths.more);
export const IconMenu = createIconComponent('Menu', iconPaths.menu);
export const IconExternal = createIconComponent('External', iconPaths.external);
export const IconCopy = createIconComponent('Copy', iconPaths.copy);
export const IconTrash = createIconComponent('Trash', iconPaths.trash);
export const IconEdit = createIconComponent('Edit', iconPaths.edit);
export const IconDownload = createIconComponent('Download', iconPaths.download);
export const IconUpload = createIconComponent('Upload', iconPaths.upload);
export const IconFolder = createIconComponent('Folder', iconPaths.folder);
export const IconFile = createIconComponent('File', iconPaths.file);
export const IconImage = createIconComponent('Image', iconPaths.image);
export const IconVideo = createIconComponent('Video', iconPaths.video);
export const IconMusic = createIconComponent('Music', iconPaths.music);
export const IconBell = createIconComponent('Bell', iconPaths.bell);
export const IconCalendar = createIconComponent('Calendar', iconPaths.calendar);
export const IconClock = createIconComponent('Clock', iconPaths.clock);
export const IconLock = createIconComponent('Lock', iconPaths.lock);
export const IconUnlock = createIconComponent('Unlock', iconPaths.unlock);
export const IconWifi = createIconComponent('Wifi', iconPaths.wifi);
export const IconWifiOff = createIconComponent('WifiOff', iconPaths['wifi-off']);
export const IconBattery = createIconComponent('Battery', iconPaths.battery);
export const IconBatteryCharging = createIconComponent('BatteryCharging', iconPaths['battery-charging']);
export const IconVolume = createIconComponent('Volume', iconPaths.volume);
export const IconVolumeMute = createIconComponent('VolumeMute', iconPaths['volume-mute']);
export const IconGlobe = createIconComponent('Globe', iconPaths.globe);
export const IconSun = createIconComponent('Sun', iconPaths.sun);
export const IconMoon = createIconComponent('Moon', iconPaths.moon);
export const IconPower = createIconComponent('Power', iconPaths.power);
export const IconMaximize = createIconComponent('Maximize', iconPaths.maximize);
export const IconMinimize = createIconComponent('Minimize', iconPaths.minimize);

/* ============================================
   Exports
   ============================================ */

export default Icon;
