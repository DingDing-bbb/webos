/**
 * @fileoverview Loading Spinner Component
 * @module @ui/components/Spinner
 *
 * A customizable loading spinner with smooth animations.
 * Designed to provide visual feedback during async operations.
 *
 * @example
 * ```tsx
 * import { Spinner } from '@ui/components/Spinner';
 *
 * // Basic usage
 * <Spinner />
 *
 * // With custom size
 * <Spinner size={48} />
 *
 * // With custom color
 * <Spinner color="#ffffff" />
 *
 * // Full page loading
 * <div className="flex items-center justify-center h-screen">
 *   <Spinner size={64} />
 * </div>
 * ```
 */

import React from 'react';

// ============================================================================
// Types
// ============================================================================

interface SpinnerProps {
  /** Spinner diameter in pixels */
  size?: number;
  /** Spinner color (CSS color value) */
  color?: string;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Loading spinner with ring-resize animation.
 *
 * Features:
 * - Smooth ring animation
 * - Customizable size and color
 * - No external dependencies
 * - GPU-accelerated animations
 *
 * @param {SpinnerProps} props - Component props
 * @returns {JSX.Element} Spinner element
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: 'spinner-rotate 1s linear infinite',
      }}
    >
      <style>
        {`
          @keyframes spinner-rotate {
            100% {
              transform: rotate(360deg);
            }
          }
          @keyframes spinner-dash {
            0% {
              stroke-dasharray: 1, 150;
              stroke-dashoffset: 0;
            }
            50% {
              stroke-dasharray: 90, 150;
              stroke-dashoffset: -35;
            }
            100% {
              stroke-dasharray: 90, 150;
              stroke-dashoffset: -124;
            }
          }
        `}
      </style>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        style={{
          animation: 'spinner-dash 1.5s ease-in-out infinite',
        }}
      />
    </svg>
  );
};

/**
 * Inline SVG spinner for cases where CSS animations
 * need to be embedded directly in the component.
 */
export const SpinnerSVG: React.FC<SpinnerProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        {`
          @keyframes spinner-rotate {
            100% { transform: rotate(360deg); }
          }
          @keyframes spinner-dash {
            0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
            50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
            100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
          }
          .spinner-circle { animation: spinner-dash 1.5s ease-in-out infinite; }
          .spinner-svg { animation: spinner-rotate 1s linear infinite; }
        `}
      </style>
      <g className="spinner-svg" style={{ transformOrigin: 'center' }}>
        <circle
          className="spinner-circle"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default Spinner;
