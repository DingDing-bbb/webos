'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 根路由重定向到 /intro
export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/intro');
  }, [router]);
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '18px'
    }}>
      Redirecting...
    </div>
  );
}
