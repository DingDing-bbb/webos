'use client';

import { useEffect, useState, useCallback } from 'react';
import { bootloader, type BootStatus } from '@bootloader';

type Stage = 'boot' | 'recovery' | 'oobe' | 'lock' | 'desktop';

interface OSState {
  stage: Stage;
  bootStatus: BootStatus;
  bootProgress: number;
  bootMessage: string;
  props: {
    boot: { complete: () => void };
    auth: {
      users: Array<{ username: string; displayName: string }>;
      systemName: string;
      onLoginSuccess: () => void;
    };
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
  canRecover: false,
};

export function useOSState(): OSState {
  const [stage, setStage] = useState<Stage>('boot');
  const [bootStatus, setBootStatus] = useState<BootStatus>(initialBootStatus);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootMessage, setBootMessage] = useState('Starting...');
  const [users, setUsers] = useState<Array<{ username: string; displayName: string }>>([]);
  const [systemName, setSystemName] = useState('WebOS');

  // 订阅 bootloader 状态
  useEffect(() => {
    const unsubscribe = bootloader.subscribe((status) => {
      setBootStatus(status);
      setBootProgress(status.progress);
      setBootMessage(status.message || 'Starting...');
      
      if (status.stage === 'recovery') {
        setStage('recovery');
      } else if (status.stage === 'success') {
        // Bootloader 启动成功，决定下一步阶段
        determineNextStage();
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

  // 主启动流程：由Bootloader控制
  useEffect(() => {
    let mounted = true;

    const startBoot = async () => {
      // 如果bootloader尚未启动，则启动它
      const currentStatus = bootloader.getStatus();
      if (currentStatus.stage === 'idle' || currentStatus.stage === 'checking') {
        setBootMessage('Starting bootloader...');
        const success = await bootloader.boot();
        if (!success) {
          // bootloader已处理错误并进入恢复模式
          return;
        }
      }
    };

    startBoot();

    return () => {
      mounted = false;
    };
  }, []);

  // 决定下一步阶段
  const determineNextStage = useCallback(() => {
    // 检查是否有保存的会话状态
    if (window.webos?.fs?.exists('/tmp/.session')) {
      try {
        const content = window.webos.fs.read('/tmp/.session');
        if (content) {
          const session = JSON.parse(content);
          console.log('[OS] Restored session from /tmp:', session);

          window.webos.fs.delete('/tmp/.session');

          if (session.systemName) setSystemName(session.systemName);
          if (session.username) {
            setUsers([
              {
                username: session.username,
                displayName: session.displayName || session.username,
              },
            ]);
          }

          if (session.theme) {
            document.documentElement.setAttribute('data-theme', session.theme);
          }
          if (session.tabletMode) {
            document.documentElement.classList.add('os-tablet-mode');
          }
          if (session.language && window.webos) {
            window.webos.i18n.setLocale(session.language);
          }

          setStage(session.stage || 'desktop');
          return;
        }
      } catch (error) {
        console.error('[OS] Failed to restore session:', error);
      }
    }

    // 正常流程
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
  }, []);

  // 登录成功回调 - 直接切换到桌面，不刷新页面
  const handleLoginSuccess = useCallback(() => {
    console.log('[OS] Login successful, switching to desktop');
    setStage('desktop');
  }, []);

  // 恢复模式 - 重试
  const handleRetry = useCallback(async () => {
    setStage('boot');
    setBootProgress(0);
    setBootMessage('Retrying...');

    // 重新启动 bootloader
    const success = await bootloader.boot();
    if (!success) {
      setStage('recovery');
    }
    // 如果成功，订阅回调会检测到 success 状态并调用 determineNextStage
  }, []);

  // 恢复模式 - 从缓存恢复
  const handleRecoverFromCache = useCallback(async () => {
    await bootloader.recoverFromCache();
  }, []);

  return {
    stage,
    bootStatus,
    bootProgress,
    bootMessage,
    props: {
      boot: { complete: () => {} },
      auth: {
        users,
        systemName,
        onLoginSuccess: handleLoginSuccess,
      },
      recovery: {
        status: bootStatus,
        onRetry: handleRetry,
        onRecoverFromCache: handleRecoverFromCache,
      },
    },
  };
}
