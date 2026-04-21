'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AGREEMENT_KEY = 'webos-agreement-accepted';

// 注入全局变量（必须在组件加载前执行）
if (typeof globalThis !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__OS_NAME__ = 'WebOS';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__OS_VERSION__ = '0.0.1';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__BUILD_TIME__ = new Date().toISOString();
}

// 检测触屏设备
function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// 加载界面
function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );
}

export default function OSPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(detectTouchDevice());

    if (localStorage.getItem(AGREEMENT_KEY) !== 'true') {
      router.replace('/app');
      return;
    }

    import('./main').then((mod) => {
      setComponent(() => mod.default);
      setReady(true);
    });
  }, [router]);

  if (!ready || !Component) {
    return <LoadingScreen />;
  }

  return (
    <div
      className={`os-container ${isTouchDevice ? 'os-touch-mode' : 'os-desktop-mode'}`}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
      }}
    >
      <Component />
    </div>
  );
}
