/**
 * @fileoverview Input Component - 输入框组件
 * @module @ui/input/Input
 *
 * Features:
 * - 前缀/后缀图标支持
 * - 清除按钮
 * - 密码显示切换
 * - 状态: error, warning, success
 * - 亚克力背景效果
 * - 完整的键盘交互
 * - 无障碍支持
 */

import React, {
  forwardRef,
  useState,
  useCallback,
  useId,
  InputHTMLAttributes,
  ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export type InputStatus = 'error' | 'warning' | 'success' | 'default';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** 输入框状态 */
  status?: InputStatus;
  /** 输入框尺寸 */
  size?: InputSize;
  /** 前缀图标 */
  prefix?: ReactNode;
  /** 后缀图标 */
  suffix?: ReactNode;
  /** 是否显示清除按钮 */
  allowClear?: boolean;
  /** 密码输入时是否显示切换按钮 */
  passwordToggle?: boolean;
  /** 标签 */
  label?: string;
  /** 辅助文本 */
  helperText?: string;
  /** 是否全宽 */
  fullWidth?: boolean;
  /** 值改变回调 */
  onValueChange?: (value: string) => void;
}

// ============================================================================
// Icons
// ============================================================================

const ClearIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      status = 'default',
      size = 'md',
      prefix,
      suffix,
      allowClear = false,
      passwordToggle = false,
      label,
      helperText,
      fullWidth = true,
      className = '',
      disabled,
      type: propType = 'text',
      value,
      defaultValue,
      onChange,
      onValueChange,
      id: propId,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const id = propId || autoId;
    const helperId = `${id}-helper`;

    const [internalValue, setInternalValue] = useState<string>((defaultValue as string) || '');
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? (value as string) : internalValue;
    const isPassword = propType === 'password';
    const inputType = isPassword && showPassword ? 'text' : propType;

    // Status color mapping
    const getStatusColor = () => {
      switch (status) {
        case 'error':
          return 'var(--color-danger)';
        case 'warning':
          return 'var(--color-warning)';
        case 'success':
          return 'var(--color-success)';
        default:
          return undefined;
      }
    };

    // Handle value change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (!isControlled) {
          setInternalValue(newValue);
        }

        onChange?.(e);
        onValueChange?.(newValue);
      },
      [isControlled, onChange, onValueChange]
    );

    // Handle clear
    const handleClear = useCallback(() => {
      if (!isControlled) {
        setInternalValue('');
      }

      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.(syntheticEvent);
      onValueChange?.('');
    }, [isControlled, onChange, onValueChange]);

    // Toggle password visibility
    const togglePassword = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    // Handle focus/blur
    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        rest.onFocus?.(e);
      },
      [rest]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        rest.onBlur?.(e);
      },
      [rest]
    );

    // Build class names
    const wrapperClasses = [
      'webos-input-wrapper',
      prefix && 'webos-input-wrapper--with-prefix',
      (suffix || allowClear || isPassword) && 'webos-input-wrapper--with-suffix',
      fullWidth && 'webos-input-wrapper--full-width',
      isFocused && 'webos-input-wrapper--focused',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      'webos-input',
      `webos-input--${size}`,
      status !== 'default' && `webos-input--${status}`,
    ]
      .filter(Boolean)
      .join(' ');

    const showClearButton = allowClear && currentValue && !disabled;
    const showPasswordToggle = passwordToggle && isPassword && !disabled;

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={id} className="webos-input-label" style={{ color: getStatusColor() }}>
            {label}
          </label>
        )}

        <div style={{ position: 'relative', width: '100%' }}>
          {prefix && (
            <span className="webos-input-prefix" aria-hidden="true">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={inputType}
            className={inputClasses}
            value={currentValue}
            disabled={disabled}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={status === 'error'}
            aria-describedby={helperText ? helperId : undefined}
            {...rest}
          />

          <span className="webos-input-suffix">
            {showClearButton && (
              <button
                type="button"
                className="webos-input-clear webos-input-suffix--clickable"
                onClick={handleClear}
                tabIndex={-1}
                aria-label="清除内容"
              >
                <ClearIcon />
              </button>
            )}

            {showPasswordToggle && (
              <button
                type="button"
                className="webos-input-password-toggle"
                onClick={togglePassword}
                tabIndex={-1}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            )}

            {suffix && !showClearButton && !showPasswordToggle && suffix}
          </span>
        </div>

        {helperText && (
          <span id={helperId} className="webos-input-helper" style={{ color: getStatusColor() }}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
