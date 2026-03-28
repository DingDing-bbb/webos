/**
 * @fileoverview Radio Component - 单选按钮组件
 * @module @ui/input/Radio
 *
 * Features:
 * - RadioGroup 封装
 * - 按钮样式
 * - 卡片样式
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

export type RadioVariant = 'default' | 'button' | 'card';

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> {
  /** 是否选中 */
  checked?: boolean;
  /** 标签 */
  label?: ReactNode;
  /** 值 */
  value: string | number;
  /** 变体样式 */
  variant?: RadioVariant;
  /** 描述（用于卡片样式） */
  description?: string;
  /** 图标（用于卡片样式） */
  icon?: ReactNode;
  /** 选中状态改变回调 */
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface RadioGroupProps {
  /** 选中的值 */
  value?: string | number;
  /** 默认选中的值 */
  defaultValue?: string | number;
  /** 值改变回调 */
  onChange?: (value: string | number) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 子元素 */
  children?: ReactNode;
  /** 是否垂直排列 */
  vertical?: boolean;
  /** 变体样式 */
  variant?: RadioVariant;
  /** 名称 */
  name?: string;
  /** 自定义类名 */
  className?: string;
}

export interface RadioOption {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
  description?: string;
  icon?: ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface RadioGroupContextValue {
  name?: string;
  value: string | number | undefined;
  disabled?: boolean;
  variant?: RadioVariant;
  onChange: (value: string | number) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

// ============================================================================
// Radio Component
// ============================================================================

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      checked: propChecked,
      label,
      value,
      variant = 'default',
      description,
      icon,
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

    const groupContext = useContext(RadioGroupContext);

    // Determine checked state
    let isChecked: boolean;
    if (groupContext) {
      isChecked = groupContext.value === value;
    } else if (propChecked !== undefined) {
      isChecked = propChecked;
    } else {
      isChecked = false;
    }

    const actualVariant = groupContext?.variant || variant;
    const isDisabled = disabled || groupContext?.disabled;

    // Handle change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (groupContext) {
          groupContext.onChange(value);
        } else {
          onChange?.(true, e);
        }
      },
      [groupContext, value, onChange]
    );

    // Render based on variant
    if (actualVariant === 'button') {
      return (
        <label
          className={[
            'webos-radio-button',
            isChecked && 'webos-radio-button--checked',
            isDisabled && 'webos-radio-button--disabled',
            className,
          ].filter(Boolean).join(' ')}
        >
          <input
            ref={ref}
            type="radio"
            id={id}
            className="webos-sr-only"
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            value={value}
            name={groupContext?.name || rest.name}
            {...rest}
          />
          {label}
        </label>
      );
    }

    if (actualVariant === 'card') {
      return (
        <label
          className={[
            'webos-radio-card',
            isChecked && 'webos-radio-card--checked',
            isDisabled && 'webos-radio-card--disabled',
            className,
          ].filter(Boolean).join(' ')}
        >
          <input
            ref={ref}
            type="radio"
            id={id}
            className="webos-sr-only"
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            value={value}
            name={groupContext?.name || rest.name}
            {...rest}
          />
          {icon && <div className="webos-radio-card-icon">{icon}</div>}
          {label && <div className="webos-radio-card-label">{label}</div>}
          {description && (
            <div className="webos-radio-card-description">{description}</div>
          )}
        </label>
      );
    }

    // Default variant
    const wrapperClasses = [
      'webos-radio-wrapper',
      isChecked && 'webos-radio-wrapper--checked',
      isDisabled && 'webos-radio-wrapper--disabled',
      className,
    ].filter(Boolean).join(' ');

    return (
      <label className={wrapperClasses}>
        <span className="webos-radio">
          <input
            ref={ref}
            type="radio"
            id={id}
            className="webos-radio-input"
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            value={value}
            name={groupContext?.name || rest.name}
            {...rest}
          />
          <span className="webos-radio-indicator" />
        </span>
        {label !== undefined && <span className="webos-radio-label">{label}</span>}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

// ============================================================================
// RadioGroup Component
// ============================================================================

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value: propValue,
  defaultValue,
  onChange,
  disabled = false,
  children,
  vertical = false,
  variant = 'default',
  name,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState<string | number | undefined>(
    defaultValue
  );

  const isControlled = propValue !== undefined;
  const currentValue = isControlled ? propValue : internalValue;

  // Handle value change
  const handleChange = useCallback(
    (newValue: string | number) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  // Build class names
  const groupClasses = [
    'webos-radio-group',
    vertical && 'webos-radio-group--vertical',
    className,
  ].filter(Boolean).join(' ');

  const contextValue: RadioGroupContextValue = {
    name,
    value: currentValue,
    disabled,
    variant,
    onChange: handleChange,
  };

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div className={groupClasses} role="radiogroup" aria-label="Radio group">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

export default Radio;
