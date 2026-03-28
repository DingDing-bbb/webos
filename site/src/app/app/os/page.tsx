'use client';

import { useEffect, useState } from 'react';

const AGREEMENT_KEY = 'webos-agreement-accepted';

export default function OSPage() {
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'not-accepted'>('checking');

  useEffect(() => {
    // 检查是否已同意协议
    const accepted = localStorage.getItem(AGREEMENT_KEY);

    if (accepted === 'true') {
      setStatus('redirecting');
      // OS 静态文件已复制到 public/os，直接跳转
      window.location.href = '/os/index.html';
    } else {
      setStatus('not-accepted');
      // 未同意协议，重定向到 /app
      window.location.href = '/app';
    }
  }, []);

  if (status === 'checking') {
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
          <div style={{ fontSize: '18px' }}>Loading WebOS...</div>
        </div>
      </div>
    );
  }

  if (status === 'redirecting') {
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
          <div style={{ fontSize: '18px' }}>Entering WebOS...</div>
        </div>
      </div>
    );
  }

  return null;
}
