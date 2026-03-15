/**
 * @fileoverview Checkbox Component
 * @module @ui/components/Checkbox
 *
 * A flexible checkbox component with support for indeterminate state,
 * disabled state, custom icons, and label integration.
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

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onChange'> {
  /** Checkbox size */
  size?: CheckboxSize;
  /** Checked state */
  checked?: boolean;
  /** Default checked state */
  defaultChecked?: boolean;
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom icon for checked state */
  checkedIcon?: ReactNode;
  /** Custom icon for indeterminate state */
  indeterminateIcon?: ReactNode;
  /** On change callback */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CheckboxRef {
  /** Focus the checkbox */
  focus: () => void;
  /** Blur the checkbox */
  blur: () => void;
  /** Check the checkbox */
  check: () => void;
  /** Uncheck the checkbox */
  uncheck: () => void;
  /** Toggle the checkbox */
  toggle: () => void;
  /** Get the native input element */
  nativeElement: HTMLInputElement | null;
}

// ============================================
// Component
// ============================================

export const Checkbox = forwardRef<CheckboxRef, CheckboxProps>(
  (
    {
      size = 'md',
      checked,
      defaultChecked = false,
      indeterminate = false,
      disabled = false,
      label,
      className = '',
      checkedIcon,
      indeterminateIcon,
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
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    // Expose methods
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      check: () => {
        if (inputRef.current) {
          inputRef.current.checked = true;
          const event = { target: inputRef.current } as React.ChangeEvent<HTMLInputElement>;
          onChange?.(true, event);
        }
      },
      uncheck: () => {
        if (inputRef.current) {
          inputRef.current.checked = false;
          const event = { target: inputRef.current } as React.ChangeEvent<HTMLInputElement>;
          onChange?.(false, event);
        }
      },
      toggle: () => {
        if (inputRef.current) {
          inputRef.current.checked = !inputRef.current.checked;
          const event = { target: inputRef.current } as React.ChangeEvent<HTMLInputElement>;
          onChange?.(inputRef.current.checked, event);
        }
      },
      nativeElement: inputRef.current,
    }));

    // Set indeterminate attribute
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked, e);
    };

    // Build class names
    const wrapperClasses = [
      'checkbox',
      `checkbox--${size}`,
      disabled && 'checkbox--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const boxClasses = [
      'checkbox__box',
      (isChecked || indeterminate) && 'checkbox__box--checked',
      indeterminate && 'checkbox__box--indeterminate',
    ]
      .filter(Boolean)
      .join(' ');

    // Default icons
    const defaultCheckIcon = (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );

    const defaultIndeterminateIcon = (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );

    return (
      <label htmlFor={checkboxId} className={wrapperClasses}>
        <input
          ref={inputRef}
          type="checkbox"
          id={checkboxId}
          className="checkbox__input"
          checked={isControlled ? checked : undefined}
          defaultChecked={isControlled ? undefined : defaultChecked}
          disabled={disabled}
          onChange={handleChange}
          aria-checked={indeterminate ? 'mixed' : isChecked}
          aria-disabled={disabled}
          {...restProps}
        />
        <span className={boxClasses}>
          {indeterminate ? (indeterminateIcon || defaultIndeterminateIcon) : isChecked ? (checkedIcon || defaultCheckIcon) : null}
        </span>
        {label && <span className="checkbox__label">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
