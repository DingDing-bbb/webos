'use client';

import { useEffect, useState, useRef } from 'react';

type Stage = 'boot' | 'oobe' | 'lock' | 'desktop';

interface OSState {
  stage: Stage;
  props: {
    boot: { complete: () => void };
    auth: { users: Array<{ username: string; displayName: string }>; systemName: string };
    desktop: { containerRef: React.RefObject<HTMLDivElement> };
  };
}

export function useOSState(): OSState {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>('boot');
  const [users, setUsers] = useState<Array<{ username: string; displayName: string }>>([]);
  const [systemName, setSystemName] = useState('WebOS');

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      // 1. 初始化 WebOS API
      const { initWebOS } = await import('@kernel');
      if (!mounted) return;
      initWebOS();

      // 2. 设置窗口容器
      if (containerRef.current && window.webos) {
        window.webos.setWindowContainer(containerRef.current);
      }

      // 3. 运行 bootloader
      const { bootloader } = await import('@bootloader');
      if (!mounted) return;

      const success = await bootloader.boot();

      if (!mounted || !success) return;

      // 4. 检查后续阶段
      if (!window.webos) {
        setStage('desktop');
        return;
      }

      if (!window.webos.boot.isOOBEComplete()) {
        setStage('oobe');
        return;
      }

      setSystemName(window.webos.config.getSystemName() || 'WebOS');

      const savedUsername = localStorage.getItem('webos-last-username');
      const savedDisplayName = localStorage.getItem('webos-last-displayname') || savedUsername;

      if (savedUsername) {
        setUsers([{ username: savedUsername, displayName: savedDisplayName || savedUsername }]);
        setStage('lock');
      } else {
        setStage('desktop');
      }
    };

    boot();

    return () => { mounted = false; };
  }, []);

  return {
    stage,
    props: {
      boot: { complete: () => {} },
      auth: { users, systemName },
      desktop: { containerRef },
    },
  };
}
