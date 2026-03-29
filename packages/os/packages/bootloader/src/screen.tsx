/**
 * @fileoverview Boot Screen - 组合组件
 * @module @bootloader/screen
 * 
 * 组合 BootController 和 BootUI
 */

import React from 'react';
import { BootController } from './index';
import { BootUI } from './ui';
import type { BootResult } from './index';

// ============================================================================
// Types
// ============================================================================

export interface BootScreenProps {
  /** 启动完成回调 */
  onComplete: () => void;
  /** 是否显示 UI */
  showUI?: boolean;
}

// ============================================================================
// BootScreen Component
// ============================================================================

/**
 * 组合启动界面组件
 * 
 * 组合 BootController 和 BootUI 用于简单使用。
 * 需要更多控制时，请分别使用 BootController 和 BootUI。
 */
export const BootScreen: React.FC<BootScreenProps> = ({
  onComplete,
  showUI = true,
}) => {
  const [progress, setProgress] = React.useState(0);
  const [statusText, setStatusText] = React.useState('Starting...');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new BootController();

    controller.setProgressHandler((task, prog) => {
      setStatusText(task);
      setProgress(prog);
    });

    controller.run().then((result: BootResult) => {
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
