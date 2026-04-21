/**
 * @fileoverview TextArea Component - 文本域组件
 * @module @ui/input/TextArea
 *
 * Features:
 * - 自动高度调整
 * - 字数限制与计数
 * - 拖拽调整大小
 * - 亚克力背景效果
 * - 完整的键盘交互
 * - 无障碍支持
 */

import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useId,
  TextareaHTMLAttributes,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 自动调整高度 */
  autoHeight?: boolean;
  /** 最小行数 */
  minRows?: number;
  /** 最大行数 */
  maxRows?: number;
  /** 最大字数限制 */
  maxLength?: number;
  /** 是否显示字数统计 */
  showCount?: boolean;
  /** 标签 */
  label?: string;
  /** 辅助文本 */
  helperText?: string;
  /** 状态 */
  status?: 'error' | 'warning' | 'success' | 'default';
  /** 是否禁用调整大小 */
  noResize?: boolean;
  /** 值改变回调 */
  onValueChange?: (value: string) => void;
}

// ============================================================================
// Component
// ============================================================================

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      autoHeight = false,
      minRows = 2,
      maxRows = 6,
      maxLength,
      showCount = false,
      label,
      helperText,
      status = 'default',
      noResize = false,
      className = '',
      disabled,
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

    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    const [internalValue, setInternalValue] = useState<string>((defaultValue as string) || '');

    const isControlled = value !== undefined;
    const currentValue = isControlled ? (value as string) : internalValue;

    // Calculate height based on content
    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoHeight) return;

      textarea.style.height = 'auto';

      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const padding =
        parseInt(getComputedStyle(textarea).paddingTop) +
        parseInt(getComputedStyle(textarea).paddingBottom);

      const minHeight = lineHeight * minRows + padding;
      const maxHeight = lineHeight * maxRows + padding;

      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      textarea.style.height = `${newHeight}px`;
    }, [autoHeight, minRows, maxRows, textareaRef]);

    // Handle value change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;

        if (!isControlled) {
          setInternalValue(newValue);
        }

        onChange?.(e);
        onValueChange?.(newValue);

        if (autoHeight) {
          adjustHeight();
        }
      },
      [isControlled, onChange, onValueChange, autoHeight, adjustHeight]
    );

    // Get status color
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

    // Build class names
    const wrapperClasses = ['webos-textarea-wrapper', className].filter(Boolean).join(' ');

    const textareaClasses = [
      'webos-textarea',
      autoHeight && 'webos-textarea--auto-height',
      noResize && 'webos-textarea--no-resize',
      status !== 'default' && `webos-textarea--${status}`,
    ]
      .filter(Boolean)
      .join(' ');

    // Count display
    const currentLength = currentValue.length;
    const isExceeded = maxLength !== undefined && currentLength > maxLength;

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={id} className="webos-textarea-label" style={{ color: getStatusColor() }}>
            {label}
          </label>
        )}

        <textarea
          ref={textareaRef}
          id={id}
          className={textareaClasses}
          value={currentValue}
          disabled={disabled}
          maxLength={maxLength}
          onChange={handleChange}
          aria-invalid={status === 'error'}
          aria-describedby={helperText ? helperId : undefined}
          rows={minRows}
          {...rest}
        />

        {showCount && (
          <span
            className={['webos-textarea-counter', isExceeded && 'webos-textarea-counter--exceeded']
              .filter(Boolean)
              .join(' ')}
          >
            {currentLength}
            {maxLength && ` / ${maxLength}`}
          </span>
        )}

        {helperText && (
          <span id={helperId} className="webos-textarea-helper" style={{ color: getStatusColor() }}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
