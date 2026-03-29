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

// 加载界面 - 只显示加载圈，没有进度条
function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
      {/* 加载圈 */}
      <div 
        className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"
        style={{
          animation: 'spin 1s linear infinite'
        }}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function OSPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (localStorage.getItem(AGREEMENT_KEY) !== 'true') {
      router.replace('/app');
      return;
    }

    // 动态导入确保全局变量已注入
    import('./main').then((mod) => {
      setComponent(() => mod.default);
      setReady(true);
    });
  }, [router]);

  if (!ready || !Component) {
    return <LoadingScreen />;
  }

  return <Component />;
}
