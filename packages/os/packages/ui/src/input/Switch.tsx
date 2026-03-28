/**
 * @fileoverview Switch Component - 开关组件
 * @module @ui/input/Switch
 *
 * Features:
 * - 加载状态
 * - 自定义图标
 * - 尺寸变体 (sm, md, lg)
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

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange' | 'size'> {
  /** 是否选中 */
  checked?: boolean;
  /** 默认是否选中 */
  defaultChecked?: boolean;
  /** 尺寸 */
  size?: SwitchSize;
  /** 加载状态 */
  loading?: boolean;
  /** 选中时的图标 */
  checkedIcon?: ReactNode;
  /** 未选中时的图标 */
  uncheckedIcon?: ReactNode;
  /** 标签 */
  label?: ReactNode;
  /** 选中状态改变回调 */
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
}

// ============================================================================
// Icons
// ============================================================================

const LoadingIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: 'switch-spin 1s linear infinite' }}
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      checked: propChecked,
      defaultChecked = false,
      size = 'md',
      loading = false,
      checkedIcon,
      uncheckedIcon,
      label,
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

    // Determine if controlled
    const isControlled = propChecked !== undefined;
    const isChecked = isControlled ? propChecked : internalChecked;
    const isDisabled = disabled || loading;

    // Handle change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked = e.target.checked;

        if (!isControlled) {
          setInternalChecked(newChecked);
        }

        onChange?.(newChecked, e);
      },
      [isControlled, onChange]
    );

    // Build class names
    const wrapperClasses = [
      'webos-switch-wrapper',
      isChecked && 'webos-switch-wrapper--checked',
      isDisabled && 'webos-switch-wrapper--disabled',
      className,
    ].filter(Boolean).join(' ');

    const switchClasses = [
      'webos-switch',
      `webos-switch--${size}`,
      loading && 'webos-switch--loading',
    ].filter(Boolean).join(' ');

    // Render thumb content
    const renderThumbContent = () => {
      if (loading) {
        return <LoadingIcon />;
      }
      if (isChecked && checkedIcon) {
        return checkedIcon;
      }
      if (!isChecked && uncheckedIcon) {
        return uncheckedIcon;
      }
      return null;
    };

    return (
      <label className={wrapperClasses}>
        <span className={switchClasses}>
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className="webos-switch-input"
            role="switch"
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            aria-checked={isChecked}
            aria-disabled={isDisabled}
            aria-busy={loading}
            {...rest}
          />
          <span className="webos-switch-thumb">
            {renderThumbContent()}
          </span>
        </span>
        {label !== undefined && <span className="webos-switch-label">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
