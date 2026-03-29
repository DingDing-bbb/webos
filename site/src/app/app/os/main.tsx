'use client';

// 入口只导入各阶段组件，不导入具体实现
import { BootStage } from './boot';
import { AuthStage } from './auth';
import { DesktopStage } from './desktop';
import { useOSState } from './state';
import { RecoveryMode } from '@recovery';

export default function OSMain() {
  const { stage, bootProgress, bootMessage, props } = useOSState();

  switch (stage) {
    case 'boot':
      return (
        <BootStage 
          progress={bootProgress} 
          message={bootMessage}
          complete={props.boot.complete} 
        />
      );
    case 'recovery':
      return (
        <RecoveryMode
          status={props.recovery.status}
          onRetry={props.recovery.onRetry}
          onRecoverFromCache={props.recovery.onRecoverFromCache}
        />
      );
    case 'oobe':
      return <AuthStage type="oobe" />;
    case 'lock':
      return <AuthStage type="lock" {...props.auth} />;
    case 'desktop':
      return <DesktopStage {...props.desktop} />;
    default:
      return null;
  }
}
