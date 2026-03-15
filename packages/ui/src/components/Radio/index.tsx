/**
 * @fileoverview Radio Component
 * @module @ui/components/Radio
 *
 * A flexible radio component with RadioGroup wrapper,
 * button style variants, and disabled state support.
 */

import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  createContext,
  useContext,
  useState,
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import './styles.css';

// ============================================
// Types
// ============================================

export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioVariant = 'default' | 'button';

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onChange'> {
  /** Radio size */
  size?: RadioSize;
  /** Radio variant */
  variant?: RadioVariant;
  /** Checked state */
  checked?: boolean;
  /** Default checked state */
  defaultChecked?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: ReactNode;
  /** Custom class name */
  className?: string;
  /** On change callback */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface RadioRef {
  /** Focus the radio */
  focus: () => void;
  /** Blur the radio */
  blur: () => void;
  /** Select the radio */
  select: () => void;
  /** Get the native input element */
  nativeElement: HTMLInputElement | null;
}

export interface RadioGroupProps {
  /** Radio group name */
  name: string;
  /** Selected value */
  value?: string | number;
  /** Default selected value */
  defaultValue?: string | number;
  /** Radio size */
  size?: RadioSize;
  /** Radio variant */
  variant?: RadioVariant;
  /** Disabled state for all radios */
  disabled?: boolean;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Custom class name */
  className?: string;
  /** On change callback */
  onChange?: (value: string | number) => void;
  /** Children (Radio components) */
  children: ReactNode;
}

export interface RadioGroupRef {
  /** Get selected value */
  getValue: () => string | number | undefined;
  /** Set selected value */
  setValue: (value: string | number) => void;
  /** Focus the selected radio */
  focus: () => void;
}

// ============================================
// Radio Group Context
// ============================================

interface RadioGroupContextValue {
  name: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  size?: RadioSize;
  variant?: RadioVariant;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroup() {
  return useContext(RadioGroupContext);
}

// ============================================
// Radio Component
// ============================================

export const Radio = forwardRef<RadioRef, RadioProps>(
  (
    {
      size = 'md',
      variant = 'default',
      checked,
      defaultChecked = false,
      disabled = false,
      label,
      className = '',
      onChange,
      value,
      name: propName,
      id,
      ...restProps
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const groupContext = useRadioGroup();

    // Use context values if provided
    const groupValue = groupContext?.value;
    const groupOnChange = groupContext?.onChange;
    const groupName = groupContext?.name || propName;
    const groupSize = groupContext?.size || size;
    const groupVariant = groupContext?.variant || variant;
    const groupDisabled = groupContext?.disabled || disabled;

    const isControlled = checked !== undefined || groupValue !== undefined;
    const isChecked = isControlled
      ? groupValue !== undefined
        ? String(groupValue) === String(value)
        : checked
      : defaultChecked;

    // Generate unique ID
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    // Expose methods
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      select: () => {
        if (inputRef.current) {
          inputRef.current.checked = true;
          if (value !== undefined && groupOnChange && (typeof value === 'string' || typeof value === 'number')) {
            groupOnChange(value);
          } else {
            const event = { target: inputRef.current } as React.ChangeEvent<HTMLInputElement>;
            onChange?.(true, event);
          }
        }
      },
      nativeElement: inputRef.current,
    }));

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value !== undefined && groupOnChange && (typeof value === 'string' || typeof value === 'number')) {
        groupOnChange(value);
      }
      onChange?.(e.target.checked, e);
    };

    // Build class names
    const wrapperClasses = [
      'radio',
      `radio--${groupSize}`,
      `radio--${groupVariant}`,
      groupDisabled && 'radio--disabled',
      isChecked && 'radio--checked',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const circleClasses = [
      'radio__circle',
      isChecked && 'radio__circle--checked',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label htmlFor={radioId} className={wrapperClasses}>
        <input
          ref={inputRef}
          type="radio"
          id={radioId}
          className="radio__input"
          name={groupName}
          value={value}
          checked={isControlled ? isChecked : undefined}
          defaultChecked={isControlled ? undefined : defaultChecked}
          disabled={groupDisabled}
          onChange={handleChange}
          aria-checked={isChecked}
          aria-disabled={groupDisabled}
          {...restProps}
        />
        {groupVariant === 'default' ? (
          <span className={circleClasses}>
            <span className="radio__dot" />
          </span>
        ) : (
          <span className="radio__button">
            {label}
          </span>
        )}
        {groupVariant === 'default' && label && (
          <span className="radio__label">{label}</span>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

// ============================================
// Radio Group Component
// ============================================

export const RadioGroup = forwardRef<RadioGroupRef, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue,
      size = 'md',
      variant = 'default',
      disabled = false,
      direction = 'horizontal',
      className = '',
      onChange,
      children,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = value !== undefined;
    const selectedValue = isControlled ? value : internalValue;

    // Expose methods
    useImperativeHandle(ref, () => ({
      getValue: () => selectedValue,
      setValue: (newValue: string | number) => {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
      },
      focus: () => {
        const selectedRadio = containerRef.current?.querySelector('input:checked');
        if (selectedRadio) {
          (selectedRadio as HTMLInputElement).focus();
        } else {
          const firstRadio = containerRef.current?.querySelector('input');
          firstRadio?.focus();
        }
      },
    }));

    // Handle value change
    const handleChange = (newValue: string | number) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    // Build class names
    const groupClasses = [
      'radio-group',
      `radio-group--${direction}`,
      variant === 'button' && 'radio-group--button',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={containerRef} className={groupClasses} role="radiogroup">
        <RadioGroupContext.Provider
          value={{
            name,
            value: selectedValue,
            onChange: handleChange,
            size,
            variant,
            disabled,
          }}
        >
          {children}
        </RadioGroupContext.Provider>
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export default Radio;
