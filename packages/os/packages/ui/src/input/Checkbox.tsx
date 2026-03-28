/**
 * @fileoverview Checkbox Component - 复选框组件
 * @module @ui/input/Checkbox
 *
 * Features:
 * - 不确定状态 (indeterminate)
 * - 禁用状态
 * - 组合使用 (CheckboxGroup)
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
  createContext,
  useContext,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> {
  /** 是否选中 */
  checked?: boolean;
  /** 默认是否选中 */
  defaultChecked?: boolean;
  /** 不确定状态 */
  indeterminate?: boolean;
  /** 标签 */
  label?: ReactNode;
  /** 值 */
  value?: string | number;
  /** 选中状态改变回调 */
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CheckboxGroupProps {
  /** 选中的值列表 */
  value?: Array<string | number>;
  /** 默认选中的值列表 */
  defaultValue?: Array<string | number>;
  /** 选项改变回调 */
  onChange?: (value: Array<string | number>) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 子元素 */
  children?: ReactNode;
  /** 是否垂直排列 */
  vertical?: boolean;
  /** 名称 */
  name?: string;
  /** 自定义类名 */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const MinusIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ============================================================================
// Context
// ============================================================================

interface CheckboxGroupContextValue {
  name?: string;
  value: Array<string | number>;
  disabled?: boolean;
  onChange: (optionValue: string | number, checked: boolean) => void;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

// ============================================================================
// Checkbox Component
// ============================================================================

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked: propChecked,
      defaultChecked = false,
      indeterminate = false,
      label,
      value,
      disabled = false,
      className = '',
      onChange,
      id: propId,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const id = propId || autoId;

    const [internalChecked, setInternalChecked] = useState(defaultChecked);

    const groupContext = useContext(CheckboxGroupContext);

    // Determine if controlled or uncontrolled
    const isControlled = propChecked !== undefined;
    const isGroupControlled = groupContext !== null;

    // Calculate checked state
    let isChecked: boolean;
    if (isGroupControlled && value !== undefined) {
      isChecked = groupContext.value.includes(value);
    } else if (isControlled) {
      isChecked = propChecked;
    } else {
      isChecked = internalChecked;
    }

    const isDisabled = disabled || groupContext?.disabled;

    // Handle change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked = e.target.checked;

        if (!isControlled && !isGroupControlled) {
          setInternalChecked(newChecked);
        }

        if (isGroupControlled && value !== undefined) {
          groupContext.onChange(value, newChecked);
        }

        onChange?.(newChecked, e);
      },
      [isControlled, isGroupControlled, groupContext, value, onChange]
    );

    // Build class names
    const wrapperClasses = [
      'webos-checkbox-wrapper',
      isChecked && 'webos-checkbox-wrapper--checked',
      indeterminate && 'webos-checkbox-wrapper--indeterminate',
      isDisabled && 'webos-checkbox-wrapper--disabled',
      className,
    ].filter(Boolean).join(' ');

    return (
      <label className={wrapperClasses}>
        <span className="webos-checkbox">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className="webos-checkbox-input"
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            value={value}
            name={groupContext?.name || rest.name}
            aria-checked={indeterminate ? 'mixed' : isChecked}
            aria-disabled={isDisabled}
            {...rest}
          />
          <span className="webos-checkbox-indicator">
            {indeterminate ? <MinusIcon /> : <CheckIcon />}
          </span>
        </span>
        {label !== undefined && <span className="webos-checkbox-label">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============================================================================
// CheckboxGroup Component
// ============================================================================

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value: propValue,
  defaultValue = [],
  onChange,
  disabled = false,
  children,
  vertical = false,
  name,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState<Array<string | number>>(defaultValue);

  const isControlled = propValue !== undefined;
  const currentValue = isControlled ? propValue : internalValue;

  // Handle option change
  const handleOptionChange = useCallback(
    (optionValue: string | number, checked: boolean) => {
      let newValue: Array<string | number>;

      if (checked) {
        newValue = [...currentValue, optionValue];
      } else {
        newValue = currentValue.filter((v) => v !== optionValue);
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }

      onChange?.(newValue);
    },
    [isControlled, currentValue, onChange]
  );

  // Build class names
  const groupClasses = [
    'webos-checkbox-group',
    vertical && 'webos-checkbox-group--vertical',
    className,
  ].filter(Boolean).join(' ');

  const contextValue: CheckboxGroupContextValue = {
    name,
    value: currentValue,
    disabled,
    onChange: handleOptionChange,
  };

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      <div className={groupClasses} role="group" aria-label="Checkbox group">
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  );
};

export default Checkbox;
