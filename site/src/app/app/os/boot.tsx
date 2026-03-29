// 启动阶段 - 自己导入需要的模块
import { BootScreen } from '@ui';
import '@ui/styles/index.css';

interface BootStageProps {
  complete: () => void;
}

export function BootStage({ complete }: BootStageProps) {
  return <BootScreen onComplete={complete} />;
}
