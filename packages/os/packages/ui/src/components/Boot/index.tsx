/**
 * @fileoverview Boot Screen Component
 * @module @ui/components/Boot
 *
 * Exports both the logic controller and UI component separately.
 * Use BootController for logic, BootUI for rendering.
 *
 * @example
 * ```tsx
 * // Separate logic and UI
 * import { BootController, BootUI } from '@ui/components/Boot';
 *
 * const controller = new BootController();
 * controller.setProgressHandler((task, progress) => {
 *   setStatusText(task);
 *   setProgress(progress);
 * });
 *
 * // Render UI separately
 * <BootUI progress={progress} statusText={statusText} />
 *
 * // Run boot sequence
 * const result = await controller.run();
 * ```
 *
 * @example
 * ```tsx
 * // Combined usage (for convenience)
 * import { BootScreen } from '@ui/components/Boot';
 *
 * <BootScreen onComplete={() => setShowDesktop(true)} />
 * ```
 */

export { BootController } from './BootController';
export type { BootResult, ProgressCallback } from './BootController';

export { BootUI } from './BootUI';

// ============================================================================
// Combined Component (for convenience)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { BootController } from './BootController';
import { BootUI } from './BootUI';

interface BootScreenProps {
  /** Callback when boot sequence completes */
  onComplete: () => void;
  /** Whether to show UI (default: true) */
  showUI?: boolean;
}

/**
 * Combined Boot Screen Component
 *
 * Combines BootController and BootUI for simple usage.
 * For more control, use BootController and BootUI separately.
 *
 * @param {BootScreenProps} props - Component props
 * @returns {JSX.Element | null} Boot screen UI or null if showUI is false
 */
export const BootScreen: React.FC<BootScreenProps> = ({
  onComplete,
  showUI = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Starting...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new BootController();

    controller.setProgressHandler((task, prog) => {
      setStatusText(task);
      setProgress(prog);
    });

    controller.run().then((result) => {
      if (result.success) {
        setStatusText('Welcome!');
        setProgress(100);
        setTimeout(onComplete, 200);
      } else {
        setError(result.error || 'Unknown error');
        setStatusText(`Error: ${result.error}`);
      }
    });
  }, [onComplete]);

  if (!showUI) {
    return null;
  }

  return (
    <BootUI
      progress={progress}
      statusText={statusText}
      error={error}
      onRetry={() => window.location.reload()}
    />
  );
};

export default BootScreen;
