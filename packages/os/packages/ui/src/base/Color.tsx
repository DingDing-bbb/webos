/**
 * WebOS Color Component
 * 颜色选择器和调色板展示组件
 */

import React, { forwardRef, useState, useCallback, useMemo, useRef, useEffect } from 'react';

// ============================================
// Types
// ============================================

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv';

export interface ColorValue {
  hex: string;
  rgb: { r: number; g: number; b: number; a?: number };
  hsl: { h: number; s: number; l: number; a?: number };
  hsv: { h: number; s: number; v: number; a?: number };
}

export interface ColorSwatchProps {
  /** 颜色值 */
  color: string;
  /** 尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 是否圆角 */
  rounded?: boolean;
  /** 是否圆形 */
  circle?: boolean;
  /** 边框 */
  border?: boolean;
  /** 是否可选 */
  selectable?: boolean;
  /** 是否选中 */
  selected?: boolean;
  /** 点击回调 */
  onClick?: (color: string) => void;
  /** 颜色名称 */
  name?: string;
  /** 是否显示复制按钮 */
  copyable?: boolean;
  /** 自定义类名 */
  className?: string;
}

export interface ColorPickerProps {
  /** 当前颜色 */
  value?: string;
  /** 颜色变化回调 */
  onChange?: (color: string, colorValue: ColorValue) => void;
  /** 默认颜色 */
  defaultValue?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示透明度滑块 */
  showAlpha?: boolean;
  /** 是否显示预设颜色 */
  showPresets?: boolean;
  /** 预设颜色列表 */
  presets?: string[];
  /** 颜色格式 */
  format?: ColorFormat;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
}

export interface ColorPaletteProps {
  /** 调色板名称 */
  name?: string;
  /** 颜色列表 */
  colors: Array<{ name: string; value: string }>;
  /** 列数 */
  columns?: number;
  /** 色块尺寸 */
  swatchSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 是否显示颜色名称 */
  showNames?: boolean;
  /** 是否显示颜色值 */
  showValues?: boolean;
  /** 是否可复制 */
  copyable?: boolean;
  /** 选择回调 */
  onSelect?: (color: string, name: string) => void;
  /** 自定义类名 */
  className?: string;
}

// ============================================
// Color Utilities
// ============================================

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function parseColor(color: string): ColorValue {
  // 简单处理 hex 格式
  const hex = color.startsWith('#') ? color : `#${color}`;
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  return { hex, rgb, hsl, hsv };
}

// ============================================
// Color Swatch Component
// ============================================

const sizeMap = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
};

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  size = 'md',
  rounded = true,
  circle = false,
  border = true,
  selectable = false,
  selected = false,
  onClick,
  name,
  copyable = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(color);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        console.error('Failed to copy color:', err);
      }
    },
    [color]
  );

  const handleClick = useCallback(() => {
    if (selectable && onClick) {
      onClick(color);
    }
  }, [selectable, onClick, color]);

  const swatchClasses = useMemo(() => {
    const classes = [
      'webos-color-swatch',
      `webos-color-swatch--${size}`,
      rounded && 'webos-color-swatch--rounded',
      circle && 'webos-color-swatch--circle',
      border && 'webos-color-swatch--border',
      selectable && 'webos-color-swatch--selectable',
      selected && 'webos-color-swatch--selected',
      copyable && 'webos-color-swatch--copyable',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return classes;
  }, [size, rounded, circle, border, selectable, selected, copyable, className]);

  return (
    <div
      className={swatchClasses}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        backgroundColor: color,
      }}
      onClick={handleClick}
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      aria-label={name || color}
      aria-pressed={selected}
    >
      {copyable && (
        <button
          className="webos-color-swatch__copy"
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy color'}
        >
          {copied ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      )}
      {selected && (
        <span className="webos-color-swatch__check">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </div>
  );
};

// ============================================
// Color Picker Component
// ============================================

const defaultPresets = [
  '#0078d4',
  '#106ebe',
  '#005a9e', // Blue
  '#107c10',
  '#0b5c0b',
  '#2da02d', // Green
  '#d13438',
  '#a4262c',
  '#e56a6d', // Red
  '#ff8c00',
  '#e07000',
  '#ffab40', // Orange
  '#ffb900',
  '#d49a00',
  '#ffd35c', // Yellow
  '#8764b8',
  '#6b4d99',
  '#a78bd4', // Purple
  '#e3008c',
  '#b4006f',
  '#f066b0', // Pink
  '#00b294',
  '#008f75',
  '#33c9af', // Teal
  '#ffffff',
  '#f3f3f3',
  '#e8e8e8', // Light
  '#1a1a1a',
  '#333333',
  '#666666', // Dark
];

export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value,
      onChange,
      defaultValue = '#0078d4',
      disabled = false,
      showAlpha = false,
      showPresets = true,
      presets = defaultPresets,
      format: _format = 'hex',
      size = 'md',
      className = '',
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value || defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    // 同步外部值
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    // 点击外部关闭
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const colorValue = useMemo(() => parseColor(internalValue), [internalValue]);

    const handleColorChange = useCallback(
      (newColor: string) => {
        setInternalValue(newColor);
        if (onChange) {
          onChange(newColor, parseColor(newColor));
        }
      },
      [onChange]
    );

    const handlePresetClick = useCallback(
      (presetColor: string) => {
        handleColorChange(presetColor);
      },
      [handleColorChange]
    );

    const pickerClasses = useMemo(() => {
      const classes = [
        'webos-color-picker',
        `webos-color-picker--${size}`,
        disabled && 'webos-color-picker--disabled',
        isOpen && 'webos-color-picker--open',
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return classes;
    }, [size, disabled, isOpen, className]);

    return (
      <div
        ref={(node) => {
          pickerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={pickerClasses}
      >
        <button
          className="webos-color-picker__trigger"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <ColorSwatch color={internalValue} size={size} rounded border={false} />
          <span className="webos-color-picker__value">{colorValue.hex}</span>
        </button>

        {isOpen && (
          <div className="webos-color-picker__dropdown" role="dialog" aria-label="Color picker">
            {/* Saturation/Brightness Area */}
            <div className="webos-color-picker__saturation">
              <div
                className="webos-color-picker__saturation-bg"
                style={{
                  backgroundColor: `hsl(${colorValue.hsl.h}, 100%, 50%)`,
                }}
              >
                <div className="webos-color-picker__saturation-white" />
                <div className="webos-color-picker__saturation-black" />
              </div>
              <div
                className="webos-color-picker__saturation-pointer"
                style={{
                  left: `${colorValue.hsv.s}%`,
                  top: `${100 - colorValue.hsv.v}%`,
                }}
              />
            </div>

            {/* Hue Slider */}
            <div className="webos-color-picker__hue">
              <div
                className="webos-color-picker__hue-pointer"
                style={{
                  left: `${(colorValue.hsl.h / 360) * 100}%`,
                }}
              />
            </div>

            {/* Alpha Slider */}
            {showAlpha && (
              <div
                className="webos-color-picker__alpha"
                style={{
                  background: `linear-gradient(to right, transparent, ${colorValue.hex})`,
                }}
              >
                <div className="webos-color-picker__alpha-pointer" />
              </div>
            )}

            {/* Input */}
            <div className="webos-color-picker__input-group">
              <input
                type="text"
                value={colorValue.hex}
                onChange={(e) => handleColorChange(e.target.value)}
                className="webos-color-picker__input"
                aria-label="Color value"
              />
            </div>

            {/* Presets */}
            {showPresets && (
              <div className="webos-color-picker__presets">
                {presets.map((preset, index) => (
                  <ColorSwatch
                    key={index}
                    color={preset}
                    size="xs"
                    rounded
                    selectable
                    selected={internalValue.toLowerCase() === preset.toLowerCase()}
                    onClick={() => handlePresetClick(preset)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';

// ============================================
// Color Palette Component
// ============================================

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  name,
  colors,
  columns = 5,
  swatchSize = 'md',
  showNames = false,
  showValues = false,
  copyable = false,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`webos-color-palette ${className}`}>
      {name && (
        <div className="webos-color-palette__header">
          <h4 className="webos-color-palette__name">{name}</h4>
        </div>
      )}
      <div
        className="webos-color-palette__grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {colors.map((color, index) => (
          <div key={index} className="webos-color-palette__item">
            <ColorSwatch
              color={color.value}
              size={swatchSize}
              rounded
              copyable={copyable}
              selectable={!!onSelect}
              onClick={() => onSelect?.(color.value, color.name)}
              name={color.name}
            />
            {(showNames || showValues) && (
              <div className="webos-color-palette__info">
                {showNames && <span className="webos-color-palette__item-name">{color.name}</span>}
                {showValues && (
                  <span className="webos-color-palette__item-value">{color.value}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// Predefined Color Palettes
// ============================================

export const webOSColors: Array<{ name: string; value: string }> = [
  { name: 'Primary', value: '#0078d4' },
  { name: 'Primary Hover', value: '#106ebe' },
  { name: 'Primary Active', value: '#005a9e' },
  { name: 'Success', value: '#107c10' },
  { name: 'Warning', value: '#ff8c00' },
  { name: 'Danger', value: '#d13438' },
  { name: 'Info', value: '#0078d4' },
];

export const grayScale: Array<{ name: string; value: string }> = [
  { name: 'Gray 50', value: '#fafafa' },
  { name: 'Gray 100', value: '#f5f5f5' },
  { name: 'Gray 200', value: '#e5e5e5' },
  { name: 'Gray 300', value: '#d4d4d4' },
  { name: 'Gray 400', value: '#a3a3a3' },
  { name: 'Gray 500', value: '#737373' },
  { name: 'Gray 600', value: '#525252' },
  { name: 'Gray 700', value: '#404040' },
  { name: 'Gray 800', value: '#262626' },
  { name: 'Gray 900', value: '#171717' },
];

// ============================================
// Exports
// ============================================

export default {
  ColorSwatch,
  ColorPicker,
  ColorPalette,
};
