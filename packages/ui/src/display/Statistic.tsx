/**
 * @fileoverview Statistic Component
 * @module @ui/display/Statistic
 *
 * A statistic component with animated numbers,
 * prefix/suffix support, and formatting.
 *
 * @example
 * ```tsx
 * import { Statistic } from '@webos/ui/display';
 *
 * <Statistic
 *   title="Total Users"
 *   value={112893}
 *   prefix={<UserIcon />}
 *   suffix="users"
 *   precision={0}
 * />
 * ```
 */

import React, { useEffect, useRef, useState, forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface StatisticProps {
  /** Statistic title */
  title?: React.ReactNode;
  /** Statistic value */
  value?: number | string;
  /** Decimal precision */
  precision?: number;
  /** Prefix node */
  prefix?: React.ReactNode;
  /** Suffix node */
  suffix?: React.ReactNode;
  /** Value formatter */
  formatter?: (value: number | string) => React.ReactNode;
  /** Number animation */
  animation?: boolean;
  /** Animation duration (ms) */
  animationDuration?: number;
  /** Animation delay (ms) */
  animationDelay?: number;
  /** Decimal separator */
  decimalSeparator?: string;
  /** Group separator */
  groupSeparator?: string;
  /** Loading state */
  loading?: boolean;
  /** Value style */
  valueStyle?: React.CSSProperties;
  /** Title style */
  titleStyle?: React.CSSProperties;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Click handler */
  onClick?: () => void;
}

export interface StatisticGroupProps {
  /** Children (Statistic components) */
  children?: React.ReactNode;
  /** Direction */
  direction?: 'horizontal' | 'vertical';
  /** Gap between items */
  gap?: number;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export interface CountdownProps {
  /** Countdown title */
  title?: React.ReactNode;
  /** Target time (timestamp or Date) */
  value?: number | Date;
  /** Format string */
  format?: string;
  /** Countdown finish callback */
  onFinish?: () => void;
  /** Custom render */
  render?: (timeData: TimeData) => React.ReactNode;
  /** Prefix */
  prefix?: React.ReactNode;
  /** Suffix */
  suffix?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

interface TimeData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatNumber(
  value: number,
  precision?: number,
  decimalSeparator = '.',
  groupSeparator = ','
): string {
  // Round to precision
  const fixed = precision !== undefined ? value.toFixed(precision) : String(value);
  const [intPart, decPart] = fixed.split('.');

  // Add group separators
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);

  // Combine parts
  if (decPart) {
    return `${formattedInt}${decimalSeparator}${decPart}`;
  }
  return formattedInt;
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}

// ============================================================================
// Animated Number Hook
// ============================================================================

function useAnimatedNumber(
  value: number,
  animation: boolean,
  duration: number,
  delay: number
): number {
  const [displayValue, setDisplayValue] = useState(animation ? 0 : value);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animation) {
      setDisplayValue(value);
      return;
    }

    const startAnimation = () => {
      startValueRef.current = displayValue;
      startTimeRef.current = null;

      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuad(progress);

        const currentValue =
          startValueRef.current + (value - startValueRef.current) * easedProgress;

        setDisplayValue(currentValue);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    const timeout = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- displayValue is derived from value and animation state, including it would cause infinite loop
  }, [value, animation, duration, delay]);

  return displayValue;
}

// ============================================================================
// Countdown Hook
// ============================================================================

function useCountdown(
  targetTime: number | Date | undefined,
  onFinish?: () => void
): TimeData | null {
  const [timeData, setTimeData] = useState<TimeData | null>(null);

  useEffect(() => {
    if (!targetTime) {
      setTimeData(null);
      return;
    }

    const target = typeof targetTime === 'number' ? targetTime : targetTime.getTime();

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      if (diff === 0) {
        onFinish?.();
        setTimeData({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const milliseconds = diff % 1000;

      setTimeData({ days, hours, minutes, seconds, milliseconds });
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onFinish]);

  return timeData;
}

// ============================================================================
// Statistic Component
// ============================================================================

export const Statistic = forwardRef<HTMLDivElement, StatisticProps>(
  (
    {
      title,
      value = 0,
      precision,
      prefix,
      suffix,
      formatter,
      animation = false,
      animationDuration = 1000,
      animationDelay = 0,
      decimalSeparator = '.',
      groupSeparator = ',',
      loading = false,
      valueStyle,
      titleStyle,
      className = '',
      style,
      onClick,
    },
    ref
  ) => {
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const animatedValue = useAnimatedNumber(
      numValue,
      animation && typeof value === 'number',
      animationDuration,
      animationDelay
    );

    const displayValue = animation ? animatedValue : numValue;

    const formattedValue =
      formatter?.(value) ?? formatNumber(displayValue, precision, decimalSeparator, groupSeparator);

    const statisticClasses = ['ui-statistic', onClick ? 'clickable' : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={statisticClasses} style={style} onClick={onClick}>
        {title && (
          <div className="ui-statistic-title" style={titleStyle}>
            {title}
          </div>
        )}
        <div className="ui-statistic-content" style={valueStyle}>
          {loading ? (
            <span className="ui-statistic-loading">--</span>
          ) : (
            <>
              {prefix && <span className="ui-statistic-prefix">{prefix}</span>}
              <span className="ui-statistic-value">{formattedValue}</span>
              {suffix && <span className="ui-statistic-suffix">{suffix}</span>}
            </>
          )}
        </div>
      </div>
    );
  }
);

Statistic.displayName = 'Statistic';

// ============================================================================
// Statistic Group
// ============================================================================

export const StatisticGroup: React.FC<StatisticGroupProps> = ({
  children,
  direction = 'horizontal',
  gap = 16,
  className = '',
  style,
}) => {
  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: `${gap}px`,
    ...style,
  };

  return (
    <div className={`ui-statistic-group ${className}`} style={groupStyle}>
      {children}
    </div>
  );
};

// ============================================================================
// Countdown Component
// ============================================================================

const defaultFormat = 'HH:mm:ss';

export const Countdown = forwardRef<HTMLDivElement, CountdownProps>(
  (
    {
      title,
      value,
      format = defaultFormat,
      onFinish,
      render,
      prefix,
      suffix,
      loading = false,
      className = '',
      style,
    },
    ref
  ) => {
    const timeData = useCountdown(value, onFinish);

    const formatCountdown = (data: TimeData | null, formatStr: string): string => {
      if (!data) return '';

      let result = formatStr;

      // Replace format tokens
      result = result.replace(/DD/g, String(data.days).padStart(2, '0'));
      result = result.replace(/D/g, String(data.days));
      result = result.replace(/HH/g, String(data.hours).padStart(2, '0'));
      result = result.replace(/H/g, String(data.hours));
      result = result.replace(/mm/g, String(data.minutes).padStart(2, '0'));
      result = result.replace(/m/g, String(data.minutes));
      result = result.replace(/ss/g, String(data.seconds).padStart(2, '0'));
      result = result.replace(/s/g, String(data.seconds));
      result = result.replace(/SSS/g, String(data.milliseconds).padStart(3, '0'));
      result = result.replace(/SS/g, String(data.milliseconds).padStart(2, '0').slice(0, 2));
      result = result.replace(/S/g, String(data.milliseconds).charAt(0));

      return result;
    };

    const renderContent = () => {
      if (loading) {
        return <span className="ui-countdown-loading">--:--:--</span>;
      }

      if (render && timeData) {
        return render(timeData);
      }

      return (
        <>
          {prefix && <span className="ui-countdown-prefix">{prefix}</span>}
          <span className="ui-countdown-value">{formatCountdown(timeData, format)}</span>
          {suffix && <span className="ui-countdown-suffix">{suffix}</span>}
        </>
      );
    };

    return (
      <div ref={ref} className={`ui-countdown ${className}`} style={style}>
        {title && <div className="ui-countdown-title">{title}</div>}
        <div className="ui-countdown-content">{renderContent()}</div>
      </div>
    );
  }
);

Countdown.displayName = 'Countdown';

// ============================================================================
// Timer Component
// ============================================================================

export interface TimerProps {
  /** Timer title */
  title?: React.ReactNode;
  /** Start time (timestamp or Date) */
  startTime?: number | Date;
  /** Auto start */
  autoStart?: boolean;
  /** Format string */
  format?: string;
  /** Prefix */
  prefix?: React.ReactNode;
  /** Suffix */
  suffix?: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export const Timer: React.FC<TimerProps> = ({
  title,
  startTime,
  autoStart = true,
  format = 'HH:mm:ss',
  prefix,
  suffix,
  className = '',
  style,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, _setIsRunning] = useState(autoStart);
  const startRef = useRef<number>(
    startTime ? (typeof startTime === 'number' ? startTime : startTime.getTime()) : Date.now()
  );

  useEffect(() => {
    if (!isRunning) return;

    const update = () => {
      setElapsed(Date.now() - startRef.current);
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatElapsed = (ms: number, formatStr: string): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let result = formatStr;
    result = result.replace(/HH/g, String(hours).padStart(2, '0'));
    result = result.replace(/H/g, String(hours));
    result = result.replace(/mm/g, String(minutes).padStart(2, '0'));
    result = result.replace(/m/g, String(minutes));
    result = result.replace(/ss/g, String(seconds).padStart(2, '0'));
    result = result.replace(/s/g, String(seconds));

    return result;
  };

  return (
    <div className={`ui-timer ${className}`} style={style}>
      {title && <div className="ui-timer-title">{title}</div>}
      <div className="ui-timer-content">
        {prefix && <span className="ui-timer-prefix">{prefix}</span>}
        <span className="ui-timer-value">{formatElapsed(elapsed, format)}</span>
        {suffix && <span className="ui-timer-suffix">{suffix}</span>}
      </div>
    </div>
  );
};

export default Statistic;
