/**
 * @fileoverview Switch Component
 * @module @ui/components/Switch
 *
 * A toggle switch component with support for sizes,
 * labels for on/off states, disabled state, and loading state.
 */

import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import './styles.css';

// ============================================
// Types
// ============================================

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onChange'> {
  /** Switch size */
  size?: SwitchSize;
  /** Checked state */
  checked?: boolean;
  /** Default checked state */
  defaultChecked?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Label for checked (on) state */
  checkedLabel?: ReactNode;
  /** Label for unchecked (off) state */
  uncheckedLabel?: ReactNode;
  /** Label text (displayed next to switch) */
  label?: ReactNode;
  /** Custom class name */
  className?: string;
  /** On change callback */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface SwitchRef {
  /** Focus the switch */
  focus: () => void;
  /** Blur the switch */
  blur: () => void;
  /** Toggle the switch */
  toggle: () => void;
  /** Turn on the switch */
  check: () => void;
  /** Turn off the switch */
  uncheck: () => void;
  /** Get the native input element */
  nativeElement: HTMLInputElement | null;
}

// ============================================
// Component
// ============================================

export const Switch = forwardRef<SwitchRef, SwitchProps>(
  (
    {
      size = 'md',
      checked,
      defaultChecked = false,
      disabled = false,
      loading = false,
      checkedLabel,
      uncheckedLabel,
      label,
      className = '',
      onChange,
      id,
      ...restProps
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : defaultChecked;

    // Generate unique ID
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

    // Expose methods
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      toggle: () => {
        if (inputRef.current && !disabled && !loading) {
          inputRef.current.checked = !inputRef.current.checked;
          const event = { target: inputRef.current } as React.ChangeEvent<HTMLInputElement>;
          onChange?.(inputRef.current.checked, event);
        }
      },
      check: () => {
        if (inputRef.current && !disabled && !loading) {
          inputRef.current.checked = true;
          const event = { target: inputRef.current } as React.ChangeEvent<HTMLInputElement>;
          onChange?.(true, event);
        }
      },
      uncheck: () => {
        if (inputRef.current && !disabled && !loading) {
          inputRef.current.checked = false;
          const event = { target: inputRef.current } as React.ChangeEvent<HTMLInputElement>;
          onChange?.(false, event);
        }
      },
      nativeElement: inputRef.current,
    }));

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled && !loading) {
        onChange?.(e.target.checked, e);
      }
    };

    // Handle click on track
    const handleTrackClick = () => {
      if (!disabled && !loading) {
        inputRef.current?.click();
      }
    };

    // Build class names
    const wrapperClasses = [
      'switch',
      `switch--${size}`,
      disabled && 'switch--disabled',
      loading && 'switch--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const trackClasses = [
      'switch__track',
      isChecked && 'switch__track--checked',
    ]
      .filter(Boolean)
      .join(' ');

    const thumbClasses = [
      'switch__thumb',
      isChecked && 'switch__thumb--checked',
    ]
      .filter(Boolean)
      .join(' ');

    // Get current label
    const currentLabel = isChecked ? checkedLabel : uncheckedLabel;

    return (
      <label htmlFor={switchId} className={wrapperClasses}>
        <input
          ref={inputRef}
          type="checkbox"
          id={switchId}
          className="switch__input"
          role="switch"
          checked={isControlled ? checked : undefined}
          defaultChecked={isControlled ? undefined : defaultChecked}
          disabled={disabled || loading}
          onChange={handleChange}
          aria-checked={isChecked}
          aria-disabled={disabled || loading}
          {...restProps}
        />
        <span className={trackClasses} onClick={handleTrackClick}>
          <span className={thumbClasses}>
            {loading && (
              <span className="switch__spinner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeDasharray="31.416" strokeLinecap="round" />
                </svg>
              </span>
            )}
          </span>
          {currentLabel && (
            <span className={['switch__label', isChecked && 'switch__label--checked'].filter(Boolean).join(' ')}>
              {currentLabel}
            </span>
          )}
        </span>
        {label && <span className="switch__external-label">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
