/**
 * @fileoverview Boot Screen UI Component
 * @module @ui/components/Boot/BootUI
 *
 * Pure UI component for the boot screen.
 * Displays logo and spinner when called.
 */

import React from 'react';
import { Spinner } from '../Spinner';
import { OS_NAME, OS_VERSION } from '../../config';

// ============================================================================
// Types
// ============================================================================

interface BootUIProps {
  /** Current progress (0-100) */
  progress: number;
  /** Status text to display */
  statusText: string;
  /** Error message if any */
  error?: string | null;
  /** Retry callback */
  onRetry?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Boot Screen UI Component
 *
 * Pure presentational component that displays:
 * - Large logo
 * - White loading spinner
 * - Status text
 * - Error state with retry option
 *
 * @param {BootUIProps} props - Component props
 * @returns {JSX.Element} Boot screen UI
 */
export const BootUI: React.FC<BootUIProps> = ({
  progress: _progress,
  statusText,
  error,
  onRetry,
}) => {
  // Error State
  if (error) {
    return (
      <div className="os-boot-screen">
        <div className="os-boot-logo">
          <svg width="140" height="50" viewBox="0 0 140 50">
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#ef4444"
              fontSize="28"
              fontFamily="inherit"
              fontWeight="700"
            >
              Error
            </text>
          </svg>
        </div>
        <div className="os-boot-error">{error}</div>
        {onRetry && (
          <button
            className="os-boot-retry"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Normal Boot State
  return (
    <div className="os-boot-screen">
      {/* Logo */}
      <div className="os-boot-logo">
        <svg width="180" height="60" viewBox="0 0 180 60">
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="white"
            fontSize="38"
            fontFamily="inherit"
            fontWeight="700"
            letterSpacing="-1"
          >
            {OS_NAME}
          </text>
        </svg>
      </div>

      {/* Loading Spinner - White */}
      <div className="os-boot-spinner">
        <Spinner size={40} color="white" />
      </div>

      {/* Status Text */}
      <div className="os-boot-text">
        {statusText}
      </div>

      {/* Version Info */}
      <div className="os-boot-version">
        v{OS_VERSION}
      </div>
    </div>
  );
};

export default BootUI;
