'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AGREEMENT_KEY = 'webos-agreement-accepted';

// 注入全局变量（必须在组件加载前执行）
if (typeof globalThis !== 'undefined') {
  (globalThis as any).__OS_NAME__ = 'WebOS';
  (globalThis as any).__OS_VERSION__ = '0.0.1';
  (globalThis as any).__BUILD_TIME__ = new Date().toISOString();
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
    return (
      <div style={{
        width: '100vw', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        color: '#fff', fontFamily: 'system-ui',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🖥️</div>
          <div style={{ marginTop: 16 }}>WebOS</div>
        </div>
      </div>
    );
  }

  return <Component />;
}
