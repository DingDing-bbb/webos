'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { bootloader, type BootStatus } from '@bootloader';

type Stage = 'boot' | 'recovery' | 'oobe' | 'lock' | 'desktop';

interface OSState {
  stage: Stage;
  bootStatus: BootStatus;
  props: {
    boot: { complete: () => void };
    auth: { users: Array<{ username: string; displayName: string }>; systemName: string };
    desktop: { containerRef: React.RefObject<HTMLDivElement> };
    recovery: {
      status: BootStatus;
      onRetry: () => void;
      onRecoverFromCache: () => void;
    };
  };
}

// 初始启动状态
const initialBootStatus: BootStatus = {
  stage: 'idle',
  progress: 0,
  message: '',
  errors: [],
  canRecover: false
};

export function useOSState(): OSState {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>('boot');
  const [bootStatus, setBootStatus] = useState<BootStatus>(initialBootStatus);
  const [users, setUsers] = useState<Array<{ username: string; displayName: string }>>([]);
  const [systemName, setSystemName] = useState('WebOS');

  // 订阅 bootloader 状态
  useEffect(() => {
    const unsubscribe = bootloader.subscribe((status) => {
      setBootStatus(status);
      if (status.stage === 'recovery') {
        setStage('recovery');
      }
    });
    return unsubscribe;
  }, []);

  // 监听恢复模式事件
  useEffect(() => {
    const handleRecovery = () => setStage('recovery');
    window.addEventListener('bootloader:recovery', handleRecovery);
    return () => window.removeEventListener('bootloader:recovery', handleRecovery);
  }, []);

  // 主启动流程
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
      const success = await bootloader.boot();

      if (!mounted || !success) {
        // bootloader.boot() 返回 false 时，检查是否进入恢复模式
        if (bootloader.isRecoveryMode()) {
          setStage('recovery');
        }
        return;
      }

      // 4. 检查是否有保存的会话状态
      if (window.webos?.fs?.exists('/tmp/.session')) {
        try {
          const content = window.webos.fs.read('/tmp/.session');
          if (content) {
            const session = JSON.parse(content);
            console.log('[OS] Restored session from /tmp:', session);

            // 删除会话文件（一次性使用）
            window.webos.fs.delete('/tmp/.session');

            if (session.systemName) setSystemName(session.systemName);
            if (session.username) {
              setUsers([{
                username: session.username,
                displayName: session.displayName || session.username
              }]);
            }

            // 应用保存的设置
            if (session.theme) {
              document.documentElement.setAttribute('data-theme', session.theme);
            }
            if (session.tabletMode) {
              document.documentElement.classList.add('os-tablet-mode');
            }
            if (session.language && window.webos) {
              window.webos.i18n.setLocale(session.language);
            }

            // 恢复到保存的阶段
            if (mounted) setStage(session.stage || 'desktop');
            return;
          }
        } catch (error) {
          console.error('[OS] Failed to restore session:', error);
        }
      }

      // 5. 正常流程
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

  // 恢复模式 - 重试
  const handleRetry = useCallback(async () => {
    setStage('boot');
    const success = await bootloader.boot();
    if (success) {
      // 重新检查 OOBE 状态
      if (window.webos && !window.webos.boot.isOOBEComplete()) {
        setStage('oobe');
      } else {
        const savedUsername = localStorage.getItem('webos-last-username');
        if (savedUsername) {
          const savedDisplayName = localStorage.getItem('webos-last-displayname') || savedUsername;
          setUsers([{ username: savedUsername, displayName: savedDisplayName || savedUsername }]);
          setStage('lock');
        } else {
          setStage('desktop');
        }
      }
    } else {
      setStage('recovery');
    }
  }, []);

  // 恢复模式 - 从缓存恢复
  const handleRecoverFromCache = useCallback(async () => {
    await bootloader.recoverFromCache();
  }, []);

  return {
    stage,
    bootStatus,
    props: {
      boot: { complete: () => {} },
      auth: { users, systemName },
      desktop: { containerRef },
      recovery: {
        status: bootStatus,
        onRetry: handleRetry,
        onRecoverFromCache: handleRecoverFromCache,
      },
    },
  };
}
