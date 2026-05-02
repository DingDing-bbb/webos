'use client';

import { useEffect, useState, useCallback } from 'react';
import { bootloader, type BootStatus } from '@webos/drivers';

type Stage = 'boot' | 'recovery' | 'oobe' | 'lock' | 'desktop';

const defaultBootStatus: BootStatus = { stage: 'idle', progress: 0, message: '' };

export function useOSState() {
  const [stage, setStage] = useState<Stage>('boot');
  const [bootProgress, setBootProgress] = useState(0);
  const [bootMessage, setBootMessage] = useState('Starting...');
  const [users, setUsers] = useState<Array<{ username: string; displayName: string }>>([]);
  const [systemName, setSystemName] = useState('WebOS');
  const [bootStatus, setBootStatus] = useState<BootStatus>(defaultBootStatus);

  // 订阅 bootloader 状态
  useEffect(() => {
    const unsubscribe = bootloader.subscribe((status) => {
      setBootStatus(status);
      setBootProgress(status.progress);
      setBootMessage(status.message || 'Starting...');

      if (status.stage === 'error') {
        setStage('recovery');
      } else if (status.stage === 'success') {
        determineNextStage();
      }
    });
    return unsubscribe;
  }, []);

  // 启动
  useEffect(() => {
    const current = bootloader.getStatus();
    if (current.stage === 'idle') {
      bootloader.boot();
    }
  }, []);

  // 决定启动后的阶段
  const determineNextStage = useCallback(() => {
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
    if (savedUsername) {
      const savedDisplayName = localStorage.getItem('webos-last-displayname') || savedUsername;
      setUsers([{ username: savedUsername, displayName: savedDisplayName }]);
      setStage('lock');
    } else {
      setStage('desktop');
    }
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setStage('desktop');
  }, []);

  const handleRetry = useCallback(async () => {
    setStage('boot');
    setBootProgress(0);
    setBootMessage('Retrying...');
    const success = await bootloader.boot();
    if (!success) setStage('recovery');
  }, []);

  const handleRecoverFromCache = useCallback(async () => {
    window.location.reload();
  }, []);

  return {
    stage,
    bootStatus,
    bootProgress,
    bootMessage,
    props: {
      boot: { complete: () => {} },
      auth: { users, systemName, onLoginSuccess: handleLoginSuccess },
      recovery: { status: bootStatus, onRetry: handleRetry, onRecoverFromCache: handleRecoverFromCache },
    },
  };
}
