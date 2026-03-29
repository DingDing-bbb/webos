'use client';

// 入口只导入各阶段组件，不导入具体实现
import { BootStage } from './boot';
import { AuthStage } from './auth';
import { DesktopStage } from './desktop';
import { useOSState } from './state';

export default function OSMain() {
  const { stage, props } = useOSState();

  switch (stage) {
    case 'boot':
      return <BootStage {...props.boot} />;
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
