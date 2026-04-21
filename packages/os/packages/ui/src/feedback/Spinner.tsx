/**
 * @fileoverview Spinner Component
 * @module @ui/feedback/Spinner
 *
 * Loading spinner component with multiple styles and sizes.
 * Supports ring, dots, pulse animations and full-screen loading.
 *
 * @example
 * ```tsx
 * import { Spinner, FullscreenSpinner } from '@ui/feedback';
 *
 * // Basic spinner
 * <Spinner />
 *
 * // With custom size and style
 * <Spinner size={48} variant="dots" />
 *
 * // Full-screen loading
 * <FullscreenSpinner loading={isLoading} tip="Loading..." />
 * ```
 */

import React, { useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export type SpinnerVariant = 'ring' | 'dots' | 'pulse' | 'bars' | 'gradient';
export type SpinnerSize = 'small' | 'medium' | 'large';

export interface SpinnerProps {
  /** Spinner variant style */
  variant?: SpinnerVariant;
  /** Spinner size */
  size?: SpinnerSize | number;
  /** Spinner color */
  color?: string;
  /** Additional class name */
  className?: string;
  /** Label for accessibility */
  label?: string;
}

export interface FullscreenSpinnerProps {
  /** Whether loading is active */
  loading: boolean;
  /** Loading tip text */
  tip?: React.ReactNode;
  /** Spinner variant */
  variant?: SpinnerVariant;
  /** Background opacity (0-1) */
  backgroundOpacity?: number;
  /** Z-index */
  zIndex?: number;
  /** Whether content is blocked */
  blockContent?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const SIZE_MAP: Record<SpinnerSize, number> = {
  small: 16,
  medium: 24,
  large: 40,
};

const DEFAULT_COLOR = 'currentColor';

// ============================================================================
// Spinner Components
// ============================================================================

const RingSpinner: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    className="spinner-ring"
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="1s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

const DotsSpinner: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const dotSize = size / 4;
  return (
    <div className="spinner-dots">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="spinner-dots__dot"
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
};

const PulseSpinner: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div
    className="spinner-pulse"
    style={{
      width: size,
      height: size,
      backgroundColor: color,
    }}
  />
);

const BarsSpinner: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const barWidth = size / 8;
  const barHeight = size * 0.6;
  return (
    <div className="spinner-bars">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="spinner-bars__bar"
          style={{
            width: barWidth,
            height: barHeight,
            backgroundColor: color,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

const GradientSpinner: React.FC<{ size: number }> = ({ size }) => (
  <div
    className="spinner-gradient"
    style={{
      width: size,
      height: size,
    }}
  >
    <div className="spinner-gradient__inner" />
  </div>
);

// ============================================================================
// Main Spinner Component
// ============================================================================

export const Spinner: React.FC<SpinnerProps> = ({
  variant = 'ring',
  size = 'medium',
  color = DEFAULT_COLOR,
  className = '',
  label = 'Loading',
}) => {
  const computedSize = typeof size === 'number' ? size : SIZE_MAP[size];
  const computedColor = color;

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner size={computedSize} color={computedColor} />;
      case 'pulse':
        return <PulseSpinner size={computedSize} color={computedColor} />;
      case 'bars':
        return <BarsSpinner size={computedSize} color={computedColor} />;
      case 'gradient':
        return <GradientSpinner size={computedSize} />;
      case 'ring':
      default:
        return <RingSpinner size={computedSize} color={computedColor} />;
    }
  };

  return (
    <div
      className={`spinner spinner--${variant} ${className}`}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      {renderSpinner()}
      <span className="sr-only">{label}</span>
    </div>
  );
};

// ============================================================================
// Fullscreen Spinner Component
// ============================================================================

export const FullscreenSpinner: React.FC<FullscreenSpinnerProps> = ({
  loading,
  tip,
  variant = 'ring',
  backgroundOpacity = 0.8,
  zIndex,
  blockContent = true,
}) => {
  // Handle body scroll lock
  useEffect(() => {
    if (loading && blockContent) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [loading, blockContent]);

  if (!loading) return null;

  return (
    <div
      className="fullscreen-spinner"
      style={
        {
          '--background-opacity': backgroundOpacity,
          zIndex: zIndex || 'var(--z-modal)',
        } as React.CSSProperties
      }
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-label={typeof tip === 'string' ? tip : 'Loading'}
    >
      <div className="fullscreen-spinner__content">
        <Spinner variant={variant} size="large" />
        {tip && <div className="fullscreen-spinner__tip">{tip}</div>}
      </div>
    </div>
  );
};

// ============================================================================
// Loading Wrapper Component
// ============================================================================

export interface LoadingWrapperProps {
  loading: boolean;
  children: React.ReactNode;
  tip?: React.ReactNode;
  spinnerVariant?: SpinnerVariant;
  blur?: boolean;
  className?: string;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loading,
  children,
  tip,
  spinnerVariant = 'ring',
  blur = true,
  className = '',
}) => {
  return (
    <div className={`loading-wrapper ${className}`}>
      {children}
      {loading && (
        <div className={`loading-wrapper__overlay ${blur ? 'loading-wrapper__overlay--blur' : ''}`}>
          <Spinner variant={spinnerVariant} />
          {tip && <div className="loading-wrapper__tip">{tip}</div>}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Button Spinner Component
// ============================================================================

export interface ButtonSpinnerProps {
  loading: boolean;
  children: React.ReactNode;
  spinnerPosition?: 'left' | 'right';
  className?: string;
}

export const ButtonSpinner: React.FC<ButtonSpinnerProps> = ({
  loading,
  children,
  spinnerPosition = 'left',
  className = '',
}) => {
  return (
    <span className={`button-spinner ${loading ? 'button-spinner--loading' : ''} ${className}`}>
      {loading && spinnerPosition === 'left' && (
        <Spinner variant="ring" size="small" className="button-spinner__spinner" />
      )}
      <span className="button-spinner__content">{children}</span>
      {loading && spinnerPosition === 'right' && (
        <Spinner variant="ring" size="small" className="button-spinner__spinner" />
      )}
    </span>
  );
};

export default Spinner;
