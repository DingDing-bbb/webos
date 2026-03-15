/**
 * @fileoverview Input Component
 * @module @ui/components/Input
 *
 * A flexible input component with support for various sizes, states,
 * prefix/suffix icons, and clearable functionality.
 */

import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useCallback,
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import './styles.css';

// ============================================
// Types
// ============================================

export type InputSize = 'sm' | 'md' | 'lg';
export type InputStatus = 'default' | 'error' | 'success';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'suffix'> {
  /** Input size */
  size?: InputSize;
  /** Input status */
  status?: InputStatus;
  /** Prefix element (icon or text) */
  prefix?: ReactNode;
  /** Suffix element (icon or text) */
  suffix?: ReactNode;
  /** Show clear button when has value */
  clearable?: boolean;
  /** Allow only specified input pattern */
  allowClear?: boolean;
  /** Custom class name */
  className?: string;
  /** Container class name */
  wrapperClassName?: string;
  /** On clear callback */
  onClear?: () => void;
}

export interface InputRef {
  /** Focus the input */
  focus: () => void;
  /** Blur the input */
  blur: () => void;
  /** Clear the input */
  clear: () => void;
  /** Get the native input element */
  nativeElement: HTMLInputElement | null;
}

// ============================================
// Component
// ============================================

export const Input = forwardRef<InputRef, InputProps>(
  (
    {
      size = 'md',
      status = 'default',
      prefix,
      suffix,
      clearable = false,
      disabled = false,
      readOnly = false,
      className = '',
      wrapperClassName = '',
      value,
      defaultValue,
      onChange,
      onClear,
      ...restProps
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : defaultValue;

    // Expose methods
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        if (inputRef.current) {
          inputRef.current.value = '';
          const event = new Event('input', { bubbles: true });
          inputRef.current.dispatchEvent(event);
        }
      },
      nativeElement: inputRef.current,
    }));

    // Handle clear
    const handleClear = useCallback(() => {
      if (disabled || readOnly) return;

      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.focus();

        // Trigger onChange for controlled components
        const event = {
          target: inputRef.current,
          currentTarget: inputRef.current,
        } as React.ChangeEvent<HTMLInputElement>;

        onChange?.(event);
        onClear?.();
      }
    }, [disabled, readOnly, onChange, onClear]);

    // Build class names
    const wrapperClasses = [
      'input',
      `input--${size}`,
      status !== 'default' && `input--${status}`,
      disabled && 'input--disabled',
      readOnly && 'input--readonly',
      prefix && 'input--has-prefix',
      (suffix || clearable) && 'input--has-suffix',
      wrapperClassName,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = ['input__field', className].filter(Boolean).join(' ');

    // Show clear button
    const showClear = clearable && !disabled && !readOnly && currentValue;

    return (
      <div className={wrapperClasses}>
        {prefix && <span className="input__prefix">{prefix}</span>}
        <input
          ref={inputRef}
          className={inputClasses}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          aria-invalid={status === 'error'}
          aria-disabled={disabled}
          aria-readonly={readOnly}
          {...restProps}
        />
        {showClear && (
          <button
            type="button"
            className="input__clear"
            onClick={handleClear}
            tabIndex={-1}
            aria-label="Clear input"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </button>
        )}
        {suffix && !showClear && <span className="input__suffix">{suffix}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
