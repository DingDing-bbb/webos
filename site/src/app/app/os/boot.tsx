// 启动阶段 - 显示启动动画
import { BootUI } from '@bootloader';
import '@ui/styles/index.css';

interface BootStageProps {
  progress?: number;
  message?: string;
  complete?: () => void;
}

export function BootStage({
  progress = 0,
  message = 'Starting...',
  complete: _complete,
}: BootStageProps) {
  return (
    <BootUI progress={progress} statusText={message} onRetry={() => window.location.reload()} />
  );
}
