/**
 * @fileoverview Textarea Component
 * @module @ui/components/Textarea
 *
 * A flexible textarea component with support for auto-resize,
 * min/max rows, character count, and various states.
 */

import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  TextareaHTMLAttributes,
} from 'react';
import './styles.css';

// ============================================
// Types
// ============================================

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaStatus = 'default' | 'error' | 'success';

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  /** Textarea size */
  size?: TextareaSize;
  /** Textarea status */
  status?: TextareaStatus;
  /** Enable auto-resize */
  autoResize?: boolean;
  /** Minimum rows */
  minRows?: number;
  /** Maximum rows */
  maxRows?: number;
  /** Show character count */
  showCount?: boolean;
  /** Maximum character limit */
  maxLength?: number;
  /** Custom class name */
  className?: string;
  /** Container class name */
  wrapperClassName?: string;
  /** On clear callback */
  onClear?: () => void;
}

export interface TextareaRef {
  /** Focus the textarea */
  focus: () => void;
  /** Blur the textarea */
  blur: () => void;
  /** Clear the textarea */
  clear: () => void;
  /** Resize the textarea */
  resize: () => void;
  /** Get the native textarea element */
  nativeElement: HTMLTextAreaElement | null;
}

// ============================================
// Component
// ============================================

export const Textarea = forwardRef<TextareaRef, TextareaProps>(
  (
    {
      size = 'md',
      status = 'default',
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      showCount = false,
      maxLength,
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? String(value) : defaultValue ? String(defaultValue) : '';

    // Expose methods
    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      blur: () => textareaRef.current?.blur(),
      clear: () => {
        if (textareaRef.current) {
          textareaRef.current.value = '';
          const event = new Event('input', { bubbles: true });
          textareaRef.current.dispatchEvent(event);
        }
      },
      resize: () => adjustHeight(),
      nativeElement: textareaRef.current,
    }));

    // Adjust height for auto-resize
    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoResize) return;

      // Reset height to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate min and max heights
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const padding = parseInt(getComputedStyle(textarea).paddingTop) +
                      parseInt(getComputedStyle(textarea).paddingBottom);
      const minHeight = lineHeight * minRows + padding;
      const maxHeight = lineHeight * maxRows + padding;

      // Set new height within bounds
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [autoResize, minRows, maxRows]);

    // Adjust height on value change
    useEffect(() => {
      adjustHeight();
    }, [adjustHeight, value, defaultValue]);

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        adjustHeight();
      }
      onChange?.(e);
    };

    // Build class names
    const wrapperClasses = [
      'textarea',
      `textarea--${size}`,
      status !== 'default' && `textarea--${status}`,
      disabled && 'textarea--disabled',
      readOnly && 'textarea--readonly',
      autoResize && 'textarea--auto-resize',
      showCount && 'textarea--has-count',
      wrapperClassName,
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClasses = ['textarea__field', className].filter(Boolean).join(' ');

    // Character count
    const charCount = currentValue.length;
    const isOverLimit = maxLength !== undefined && charCount > maxLength;

    return (
      <div className={wrapperClasses}>
        <textarea
          ref={textareaRef}
          className={textareaClasses}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          maxLength={maxLength}
          rows={!autoResize ? minRows : undefined}
          aria-invalid={status === 'error'}
          aria-disabled={disabled}
          aria-readonly={readOnly}
          aria-describedby={showCount ? 'textarea-count' : undefined}
          {...restProps}
        />
        {showCount && (
          <div
            id="textarea-count"
            className={['textarea__count', isOverLimit && 'textarea__count--over'].filter(Boolean).join(' ')}
          >
            {maxLength ? `${charCount}/${maxLength}` : charCount}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
