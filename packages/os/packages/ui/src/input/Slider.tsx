/**
 * @fileoverview Slider Component - 滑块组件
 * @module @ui/input/Slider
 *
 * Features:
 * - 单值/范围选择
 * - 标记点
 * - 格式化显示
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
} from 'react';

// ============================================================================
// Types
// ============================================================================

export interface SliderMark {
  value: number;
  label?: string;
}

export interface SliderProps {
  /** 当前值（单值） */
  value?: number;
  /** 当前值（范围） */
  values?: [number, number];
  /** 默认值 */
  defaultValue?: number | [number, number];
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否范围选择 */
  range?: boolean;
  /** 标记点 */
  marks?: SliderMark[];
  /** 格式化显示 */
  formatter?: (value: number) => string;
  /** 是否显示tooltip */
  showTooltip?: boolean;
  /** 值改变回调 */
  onChange?: (value: number | [number, number]) => void;
  /** 拖拽结束回调 */
  onAfterChange?: (value: number | [number, number]) => void;
  /** 自定义类名 */
  className?: string;
  /** ID */
  id?: string;
}

// ============================================================================
// Component
// ============================================================================

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value: propValue,
      values: propValues,
      defaultValue = 0,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      range = false,
      marks,
      formatter,
      showTooltip = true,
      onChange,
      onAfterChange,
      className = '',
      id: propId,
    },
    ref
  ) => {
    const autoId = useId();
    const id = propId || autoId;

    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<number | null>(null); // null, 0 (start), 1 (end)
    const [hoveringThumb, setHoveringThumb] = useState<number | null>(null);

    // Handle value state
    const [internalValue, setInternalValue] = useState<number | [number, number]>(
      () => {
        if (range) {
          return Array.isArray(defaultValue)
            ? defaultValue
            : [min, max];
        }
        return defaultValue as number;
      }
    );

    // Determine current value
    const isControlled = range ? propValues !== undefined : propValue !== undefined;
    const currentValue = isControlled
      ? range
        ? propValues!
        : propValue!
      : internalValue;

    // Get individual values
    const getValue = (): [number, number] => {
      if (range) {
        return currentValue as [number, number];
      }
      return [min, currentValue as number];
    };

    const [startValue, endValue] = getValue();
    const percent = ((currentValue as number) - min) / (max - min) * 100;
    const startPercent = (startValue - min) / (max - min) * 100;
    const endPercent = (endValue - min) / (max - min) * 100;

    // Format value for display
    const formatValue = useCallback(
      (val: number) => (formatter ? formatter(val) : String(val)),
      [formatter]
    );

    // Round value to step
    const roundToStep = useCallback(
      (val: number) => {
        const rounded = Math.round((val - min) / step) * step + min;
        return Math.max(min, Math.min(max, rounded));
      },
      [min, max, step]
    );

    // Get value from mouse position
    const getValueFromPosition = useCallback(
      (clientX: number) => {
        if (!sliderRef.current) return 0;

        const rect = sliderRef.current.getBoundingClientRect();
        const percent = (clientX - rect.left) / rect.width;
        const value = min + percent * (max - min);

        return roundToStep(value);
      },
      [min, max, roundToStep]
    );

    // Handle mouse events
    const handleMouseDown = useCallback(
      (thumbIndex: number) => (e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragging(thumbIndex);
      },
      [disabled]
    );

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (isDragging === null) return;

        const newValue = getValueFromPosition(e.clientX);

        if (range) {
          const [currentStart, currentEnd] = currentValue as [number, number];
          let newValues: [number, number];

          if (isDragging === 0) {
            newValues = [Math.min(newValue, currentEnd), currentEnd];
          } else {
            newValues = [currentStart, Math.max(newValue, currentStart)];
          }

          if (!isControlled) {
            setInternalValue(newValues);
          }
          onChange?.(newValues);
        } else {
          if (!isControlled) {
            setInternalValue(newValue);
          }
          onChange?.(newValue);
        }
      },
      [isDragging, range, currentValue, isControlled, getValueFromPosition, onChange]
    );

    const handleMouseUp = useCallback(() => {
      if (isDragging !== null) {
        onAfterChange?.(currentValue);
      }
      setIsDragging(null);
    }, [isDragging, currentValue, onAfterChange]);

    // Handle click on track
    const handleTrackClick = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return;

        const newValue = getValueFromPosition(e.clientX);

        if (range) {
          const [currentStart, currentEnd] = currentValue as [number, number];
          const distToStart = Math.abs(newValue - currentStart);
          const distToEnd = Math.abs(newValue - currentEnd);

          let newValues: [number, number];
          if (distToStart <= distToEnd) {
            newValues = [newValue, currentEnd];
          } else {
            newValues = [currentStart, newValue];
          }

          if (!isControlled) {
            setInternalValue(newValues);
          }
          onChange?.(newValues);
        } else {
          if (!isControlled) {
            setInternalValue(newValue);
          }
          onChange?.(newValue);
        }
      },
      [disabled, range, currentValue, isControlled, getValueFromPosition, onChange]
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (thumbIndex: number) => (e: React.KeyboardEvent) => {
        if (disabled) return;

        const stepSize = step;
        const largeStep = (max - min) / 10;

        let delta: number;
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowUp':
            delta = stepSize;
            break;
          case 'ArrowLeft':
          case 'ArrowDown':
            delta = -stepSize;
            break;
          case 'PageUp':
            delta = largeStep;
            break;
          case 'PageDown':
            delta = -largeStep;
            break;
          case 'Home':
            delta = min - (range ? (currentValue as [number, number])[thumbIndex] : (currentValue as number));
            break;
          case 'End':
            delta = max - (range ? (currentValue as [number, number])[thumbIndex] : (currentValue as number));
            break;
          default:
            return;
        }

        e.preventDefault();

        if (range) {
          const [currentStart, currentEnd] = currentValue as [number, number];
          let newValues: [number, number];

          if (thumbIndex === 0) {
            const newStart = roundToStep(currentStart + delta);
            newValues = [Math.min(newStart, currentEnd), currentEnd];
          } else {
            const newEnd = roundToStep(currentEnd + delta);
            newValues = [currentStart, Math.max(currentStart, newEnd)];
          }

          if (!isControlled) {
            setInternalValue(newValues);
          }
          onChange?.(newValues);
        } else {
          const newValue = roundToStep((currentValue as number) + delta);

          if (!isControlled) {
            setInternalValue(newValue);
          }
          onChange?.(newValue);
        }
      },
      [disabled, step, min, max, range, currentValue, isControlled, roundToStep, onChange]
    );

    // Add/remove event listeners
    React.useEffect(() => {
      if (isDragging !== null) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Build class names
    const wrapperClasses = [
      'webos-slider-wrapper',
      disabled && 'webos-slider-wrapper--disabled',
      className,
    ].filter(Boolean).join(' ');

    // Render thumb
    const renderThumb = (thumbIndex: number, value: number, position: number) => (
      <div
        key={thumbIndex}
        className={[
          'webos-slider-thumb',
          isDragging === thumbIndex && 'webos-slider-thumb--active',
          hoveringThumb === thumbIndex && 'webos-slider-thumb--focus',
          thumbIndex === 0 && 'webos-slider-thumb--start',
          thumbIndex === 1 && 'webos-slider-thumb--end',
        ].filter(Boolean).join(' ')}
        style={{ left: `${position}%` }}
        onMouseDown={handleMouseDown(thumbIndex)}
        onMouseEnter={() => setHoveringThumb(thumbIndex)}
        onMouseLeave={() => setHoveringThumb(null)}
        onKeyDown={handleKeyDown(thumbIndex)}
        tabIndex={disabled ? -1 : 0}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={formatValue(value)}
        aria-disabled={disabled}
      >
        {showTooltip && (
          <div className="webos-slider-tooltip">
            {formatValue(value)}
          </div>
        )}
      </div>
    );

    return (
      <div ref={ref} id={id} className={wrapperClasses}>
        <div
          ref={sliderRef}
          className="webos-slider"
          onClick={handleTrackClick}
        >
          <div className="webos-slider-track" />
          <div
            className="webos-slider-fill"
            style={{
              left: range ? `${startPercent}%` : 0,
              width: range ? `${endPercent - startPercent}%` : `${percent}%`,
            }}
          />

          {range ? (
            <>
              {renderThumb(0, startValue, startPercent)}
              {renderThumb(1, endValue, endPercent)}
            </>
          ) : (
            renderThumb(0, currentValue as number, percent)
          )}
        </div>

        {marks && (
          <div className="webos-slider-marks">
            {marks.map((mark) => {
              const markPercent = (mark.value - min) / (max - min) * 100;
              const isInRange = range
                ? mark.value >= startValue && mark.value <= endValue
                : mark.value <= (currentValue as number);

              return (
                <div
                  key={mark.value}
                  className="webos-slider-mark"
                  style={{ left: `${markPercent}%` }}
                >
                  <div
                    className={[
                      'webos-slider-mark-dot',
                      isInRange && 'webos-slider-mark-dot--active',
                    ].filter(Boolean).join(' ')}
                  />
                  {mark.label && <span>{mark.label}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export default Slider;
