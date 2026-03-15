/**
 * @fileoverview Progress Component
 * @module @ui/components/Progress
 *
 * A versatile progress indicator supporting linear bars,
 * circular spinners, and indeterminate states.
 *
 * @example
 * ```tsx
 * import { Progress, CircularProgress } from '@ui/components/Progress';
 *
 * // Linear progress
 * <Progress value={75} showLabel />
 *
 * // Indeterminate
 * <Progress indeterminate />
 *
 * // Circular progress
 * <CircularProgress value={60} />
 * ```
 */

import React from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type ProgressColor = 'primary' | 'success' | 'warning' | 'danger';

export interface ProgressProps {
  /** Current progress value (0-100) */
  value?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Show indeterminate state */
  indeterminate?: boolean;
  /** Show percentage label */
  showLabel?: boolean;
  /** Color variant */
  color?: ProgressColor;
  /** Size of the progress bar */
  size?: 'sm' | 'md' | 'lg';
  /** Show animated stripes */
  striped?: boolean;
  /** Animate stripes */
  animated?: boolean;
  /** Additional class name */
  className?: string;
}

export interface CircularProgressProps {
  /** Current progress value (0-100) */
  value?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Show indeterminate state */
  indeterminate?: boolean;
  /** Show percentage label in center */
  showLabel?: boolean;
  /** Color variant */
  color?: ProgressColor;
  /** Size of the circle in pixels */
  size?: number;
  /** Thickness of the progress stroke */
  thickness?: number;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const getColorClass = (color: ProgressColor): string => {
  return `progress--${color}`;
};

// ============================================================================
// Progress Component (Linear)
// ============================================================================

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  indeterminate = false,
  showLabel = false,
  color = 'primary',
  size = 'md',
  striped = false,
  animated = false,
  className = '',
}) => {
  const percentage = clamp((value / max) * 100, 0, 100);

  return (
    <div
      className={`progress progress--${size} ${getColorClass(color)} ${className}`}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={indeterminate ? undefined : `${Math.round(percentage)}%`}
    >
      <div className="progress__track">
        <div
          className={`progress__fill ${indeterminate ? 'progress__fill--indeterminate' : ''} ${striped ? 'progress__fill--striped' : ''} ${animated ? 'progress__fill--animated' : ''}`}
          style={indeterminate ? undefined : { width: `${percentage}%` }}
        />
      </div>
      {showLabel && !indeterminate && (
        <span className="progress__label">{Math.round(percentage)}%</span>
      )}
    </div>
  );
};

// ============================================================================
// CircularProgress Component
// ============================================================================

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  max = 100,
  indeterminate = false,
  showLabel = false,
  color = 'primary',
  size = 48,
  thickness = 4,
  className = '',
}) => {
  const percentage = clamp((value / max) * 100, 0, 100);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`circular-progress ${getColorClass(color)} ${indeterminate ? 'circular-progress--indeterminate' : ''} ${className}`}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={indeterminate ? undefined : `${Math.round(percentage)}%`}
      style={{ width: size, height: size }}
    >
      <svg
        className="circular-progress__svg"
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="circular-progress__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
        />
        {/* Progress circle */}
        <circle
          className="circular-progress__fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.25 : strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showLabel && !indeterminate && (
        <span className="circular-progress__label">{Math.round(percentage)}%</span>
      )}
    </div>
  );
};

// ============================================================================
// ProgressGroup Component
// ============================================================================

export interface ProgressGroupProps {
  /** Progress items */
  items: Array<{
    value: number;
    label?: string;
    color?: ProgressColor;
  }>;
  /** Maximum value (default: 100) */
  max?: number;
  /** Size of the progress bars */
  size?: 'sm' | 'md' | 'lg';
  /** Show labels */
  showLabels?: boolean;
  /** Additional class name */
  className?: string;
}

export const ProgressGroup: React.FC<ProgressGroupProps> = ({
  items,
  max = 100,
  size = 'md',
  showLabels = true,
  className = '',
}) => {
  return (
    <div className={`progress-group ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="progress-group__item">
          {showLabels && item.label && (
            <div className="progress-group__label">{item.label}</div>
          )}
          <Progress
            value={item.value}
            max={max}
            color={item.color || 'primary'}
            size={size}
          />
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// SegmentedProgress Component
// ============================================================================

export interface SegmentedProgressProps {
  /** Current value */
  value: number;
  /** Total segments */
  total: number;
  /** Color variant */
  color?: ProgressColor;
  /** Size of segments */
  size?: 'sm' | 'md' | 'lg';
  /** Gap between segments */
  gap?: number;
  /** Additional class name */
  className?: string;
}

export const SegmentedProgress: React.FC<SegmentedProgressProps> = ({
  value,
  total,
  color = 'primary',
  size = 'md',
  gap = 4,
  className = '',
}) => {
  const segments = Array.from({ length: total }, (_, i) => i < value);

  return (
    <div
      className={`segmented-progress segmented-progress--${size} ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
      style={{ gap }}
    >
      {segments.map((filled, index) => (
        <div
          key={index}
          className={`segmented-progress__segment ${filled ? 'segmented-progress__segment--filled' : ''} ${getColorClass(color)}`}
        />
      ))}
    </div>
  );
};

// ============================================================================
// Exports
// ============================================================================

export default Progress;
