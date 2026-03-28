'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// 加载界面
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

const WebOSApp = dynamic(() => import('../WebOSApp'), {
  ssr: false,
  loading: LoadingScreen,
});

export default function AppRoute() {
  return <WebOSApp />;
}
