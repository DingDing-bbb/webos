/**
 * @fileoverview Progress Overlay Component
 * @module @ui/feedback/ProgressOverlay
 *
 * Progress overlay for showing determinate or indeterminate progress.
 * Displays a semi-transparent overlay with progress indicator.
 *
 * @example
 * ```tsx
 * import { ProgressOverlay } from '@ui/feedback';
 *
 * // Determinate progress
 * <ProgressOverlay
 *   visible={true}
 *   progress={75}
 *   message="Uploading files..."
 * />
 *
 * // Indeterminate progress
 * <ProgressOverlay
 *   visible={true}
 *   indeterminate
 *   message="Processing..."
 * />
 * ```
 */

import React, { useEffect, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ProgressOverlayProps {
  /** Whether overlay is visible */
  visible: boolean;
  /** Progress value (0-100) for determinate progress */
  progress?: number;
  /** Whether to show indeterminate progress */
  indeterminate?: boolean;
  /** Message to display */
  message?: React.ReactNode;
  /** Sub message for additional details */
  subMessage?: React.ReactNode;
  /** Whether to show cancel button */
  cancellable?: boolean;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
  /** Background opacity (0-1) */
  backgroundOpacity?: number;
  /** Z-index */
  zIndex?: number;
  /** Whether to block content interaction */
  blockContent?: boolean;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ProgressOverlay: React.FC<ProgressOverlayProps> = ({
  visible,
  progress = 0,
  indeterminate = false,
  message,
  subMessage,
  cancellable = false,
  onCancel,
  backgroundOpacity = 0.85,
  zIndex,
  blockContent = true,
  className = '',
}) => {
  // Handle body scroll lock
  useEffect(() => {
    if (visible && blockContent) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [visible, blockContent]);

  // Normalize progress to 0-100 range
  const normalizedProgress = useMemo(() => {
    return Math.max(0, Math.min(100, progress));
  }, [progress]);

  if (!visible) return null;

  return (
    <div
      className={`progress-overlay ${className}`}
      style={{
        '--background-opacity': backgroundOpacity,
        zIndex: zIndex || 'var(--z-modal)',
      } as React.CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-labelledby={message ? 'progress-message' : undefined}
      aria-valuenow={indeterminate ? undefined : normalizedProgress}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
    >
      <div className="progress-overlay__content">
        {/* Progress Ring */}
        <div className={`progress-overlay__ring ${indeterminate ? 'progress-overlay__ring--indeterminate' : ''}`}>
          <svg viewBox="0 0 100 100" className="progress-overlay__svg">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeOpacity="0.15"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - normalizedProgress / 100)}`}
              className="progress-overlay__progress"
            />
          </svg>

          {/* Progress text for determinate */}
          {!indeterminate && (
            <div className="progress-overlay__percentage">
              {Math.round(normalizedProgress)}%
            </div>
          )}

          {/* Spinner for indeterminate */}
          {indeterminate && (
            <div className="progress-overlay__spinner">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
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
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div id="progress-message" className="progress-overlay__message">
            {message}
          </div>
        )}

        {/* Sub message */}
        {subMessage && (
          <div className="progress-overlay__sub-message">
            {subMessage}
          </div>
        )}

        {/* Cancel button */}
        {cancellable && onCancel && (
          <button
            className="progress-overlay__cancel"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Progress Bar Variant
// ============================================================================

export interface ProgressBarOverlayProps {
  visible: boolean;
  progress?: number;
  indeterminate?: boolean;
  message?: React.ReactNode;
  subMessage?: React.ReactNode;
  cancellable?: boolean;
  onCancel?: () => void;
  backgroundOpacity?: number;
  zIndex?: number;
  className?: string;
}

export const ProgressBarOverlay: React.FC<ProgressBarOverlayProps> = ({
  visible,
  progress = 0,
  indeterminate = false,
  message,
  subMessage,
  cancellable = false,
  onCancel,
  backgroundOpacity = 0.85,
  zIndex,
  className = '',
}) => {
  // Handle body scroll lock
  useEffect(() => {
    if (visible) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [visible]);

  const normalizedProgress = useMemo(() => {
    return Math.max(0, Math.min(100, progress));
  }, [progress]);

  if (!visible) return null;

  return (
    <div
      className={`progress-bar-overlay ${className}`}
      style={{
        '--background-opacity': backgroundOpacity,
        zIndex: zIndex || 'var(--z-modal)',
      } as React.CSSProperties}
      role="dialog"
      aria-modal="true"
    >
      <div className="progress-bar-overlay__content">
        {message && (
          <div className="progress-bar-overlay__message">
            {message}
          </div>
        )}

        <div className={`progress-bar-overlay__bar ${indeterminate ? 'progress-bar-overlay__bar--indeterminate' : ''}`}>
          <div
            className="progress-bar-overlay__fill"
            style={{ width: `${normalizedProgress}%` }}
          />
        </div>

        <div className="progress-bar-overlay__info">
          {subMessage && (
            <span className="progress-bar-overlay__sub-message">{subMessage}</span>
          )}
          {!indeterminate && (
            <span className="progress-bar-overlay__percentage">
              {Math.round(normalizedProgress)}%
            </span>
          )}
        </div>

        {cancellable && onCancel && (
          <button
            className="progress-bar-overlay__cancel"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Compact Progress Component
// ============================================================================

export interface CompactProgressProps {
  progress?: number;
  indeterminate?: boolean;
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
  className?: string;
}

export const CompactProgress: React.FC<CompactProgressProps> = ({
  progress = 0,
  indeterminate = false,
  size = 'medium',
  showPercentage = true,
  className = '',
}) => {
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  const sizeMap = {
    small: { ring: 32, text: '0.75rem' },
    medium: { ring: 48, text: '0.875rem' },
    large: { ring: 64, text: '1rem' },
  };

  const { ring: ringSize, text: textSize } = sizeMap[size];

  return (
    <div className={`compact-progress compact-progress--${size} ${className}`}>
      <div
        className={`compact-progress__ring ${indeterminate ? 'compact-progress__ring--indeterminate' : ''}`}
        style={{ width: ringSize, height: ringSize }}
      >
        <svg viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeOpacity="0.15"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - normalizedProgress / 100)}`}
            className="compact-progress__progress"
          />
        </svg>
        {showPercentage && !indeterminate && (
          <span className="compact-progress__text" style={{ fontSize: textSize }}>
            {Math.round(normalizedProgress)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressOverlay;
