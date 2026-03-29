'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AGREEMENT_KEY = 'webos-agreement-accepted';

// 动态导入 OS 组件
export default function OSPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'loading' | 'ready' | 'error'>('checking');
  const [OSComponent, setOSComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 检查是否已同意协议
    const accepted = localStorage.getItem(AGREEMENT_KEY);
    if (accepted !== 'true') {
      router.push('/app');
      return;
    }

    setStatus('loading');

    // 动态导入 OS 组件
    import('./WebOSApp')
      .then((mod) => {
        setOSComponent(() => mod.default);
        setStatus('ready');
      })
      .catch((err) => {
        console.error('Failed to load OS:', err);
        setError(err.message);
        setStatus('error');
      });
  }, [router]);

  if (status === 'checking' || status === 'loading') {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading WebOS...</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>Please wait while the system loads</div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px', color: '#ff6b6b' }}>Failed to load WebOS</div>
          <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '24px' }}>{error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (OSComponent) {
    return <OSComponent />;
  }

  return null;
}
