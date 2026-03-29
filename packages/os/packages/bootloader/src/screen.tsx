/**
 * BootScreen - 启动界面组合组件
 * 
 * 执行真正的启动流程：
 * 1. 创建 BootController
 * 2. 执行初始化任务
 * 3. 显示进度和状态
 * 4. 完成后调用 onComplete
 */

import React from 'react';
import { BootController } from './index';
import { BootUI } from './ui';
import type { BootResult } from './index';

// ============================================================================
// Types
// ============================================================================

export interface BootScreenProps {
  onComplete: () => void;
  showUI?: boolean;
}

// ============================================================================
// BootScreen Component
// ============================================================================

export const BootScreen: React.FC<BootScreenProps> = ({
  onComplete,
  showUI = true,
}) => {
  const [progress, setProgress] = React.useState(0);
  const [statusText, setStatusText] = React.useState('Starting...');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // 创建启动控制器
    const controller = new BootController();

    // 设置进度回调
    controller.setProgressHandler((task, prog) => {
      setStatusText(task);
      setProgress(prog);
    });

    // 执行启动任务
    controller.run().then((result: BootResult) => {
      if (result.success) {
        setStatusText('Welcome!');
        setProgress(100);
        // 短暂延迟后完成
        setTimeout(onComplete, 300);
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
