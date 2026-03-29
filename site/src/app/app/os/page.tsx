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

// 加载界面 - 早期版本的启动动画风格
const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15, 100));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="w-16 h-16 mb-6 rounded-xl bg-zinc-800 flex items-center justify-center">
          <span className="text-xl font-semibold text-white">W</span>
        </div>

        {/* 名称 */}
        <h1 className="text-lg font-medium text-white mb-1">WebOS</h1>
        <p className="text-sm text-zinc-500 mb-8">正在启动...</p>

        {/* 进度条 */}
        <div className="w-40 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

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
