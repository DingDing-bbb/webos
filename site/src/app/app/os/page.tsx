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
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - IE/Edge legacy property
    navigator.msMaxTouchPoints > 0
  );
}

// 检测iOS设备
function detectIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// 全局iOS干扰操作禁用样式
const iOSPreventionStyles = `
  /* 全局禁用iOS干扰操作 */
  .os-container {
    /* 禁用iOS橡皮筋效果 */
    overscroll-behavior: none;
    -webkit-overflow-scrolling: auto;
    
    /* 禁用iOS双击缩放 */
    touch-action: manipulation;
    
    /* 禁用iOS长按选择和呼叫菜单 */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    
    /* 禁用iOS点击高亮 */
    -webkit-tap-highlight-color: transparent;
    
    /* 禁用文本大小调整 */
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    
    /* 防止页面整体滚动 */
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
  }
  
  /* 允许输入框正常选择文本 */
  .os-container input,
  .os-container textarea,
  .os-container [contenteditable="true"] {
    -webkit-user-select: text;
    user-select: text;
    -webkit-touch-callout: default;
  }
  
  /* 允许可滚动区域滚动 */
  .os-container .os-scrollable,
  .os-container .os-window-content,
  .os-container [data-scrollable="true"] {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    touch-action: pan-y pan-x;
  }
  
  /* 窗口触摸支持 */
  .os-container .os-window,
  .os-container .desktop-window {
    touch-action: none;
  }
  
  /* 窗口标题栏触摸拖动 */
  .os-container .os-window-header,
  .os-container .desktop-window-titlebar {
    touch-action: none;
    cursor: grab;
  }
  
  .os-container .os-window-header:active,
  .os-container .desktop-window-titlebar:active {
    cursor: grabbing;
  }
  
  /* 缩放手柄触摸支持 */
  .os-container .os-window-resize-handle,
  .os-container .desktop-resize-handle {
    touch-action: none;
  }
  
  /* 桌面图标触摸优化 */
  .os-container .os-desktop-icon {
    touch-action: manipulation;
  }
  
  /* 任务栏触摸优化 */
  .os-container .os-taskbar-item,
  .os-container .taskbar-item {
    touch-action: manipulation;
  }
  
  /* 按钮和可点击元素 */
  .os-container button,
  .os-container [role="button"],
  .os-container .os-btn {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  
  /* 触摸设备增大触摸区域 */
  .os-touch-mode .desktop-resize-handle {
    min-width: 20px;
    min-height: 20px;
  }
  
  /* 触摸反馈 */
  @media (hover: none) {
    .os-container button:active,
    .os-container [role="button"]:active,
    .os-container .os-btn:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
    
    /* 禁用hover状态 - 触摸设备没有hover */
    .os-container button:hover,
    .os-container [role="button"]:hover,
    .os-container a:hover {
      background-color: inherit;
    }
  }
`;

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
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 检测设备类型
    setIsTouchDevice(detectTouchDevice());
    setIsIOS(detectIOS());

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

  // 阻止iOS默认的触摸行为
  useEffect(() => {
    if (!isIOS) return;

    const preventDefaultTouch = (e: TouchEvent) => {
      // 双指缩放
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    // 阻止双指缩放
    document.addEventListener('touchstart', preventDefaultTouch, { passive: false });
    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    
    // 阻止手势事件
    // @ts-expect-error - gesture events are not in the type definitions
    document.addEventListener('gesturestart', preventGesture, { passive: false });
    // @ts-expect-error - gesture events are not in the type definitions
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    // @ts-expect-error - gesture events are not in the type definitions
    document.addEventListener('gestureend', preventGesture, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefaultTouch);
      document.removeEventListener('touchmove', preventDefaultTouch);
      // @ts-expect-error - gesture events are not in the type definitions
      document.removeEventListener('gesturestart', preventGesture);
      // @ts-expect-error - gesture events are not in the type definitions
      document.removeEventListener('gesturechange', preventGesture);
      // @ts-expect-error - gesture events are not in the type definitions
      document.removeEventListener('gestureend', preventGesture);
    };
  }, [isIOS]);

  if (!ready || !Component) {
    return <LoadingScreen />;
  }

  return (
    <div 
      className={`os-container ${isTouchDevice ? 'os-touch-mode os-tablet-mode' : 'os-desktop-mode'}`}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden'
      }}
    >
      {/* 注入iOS干扰操作禁用样式 */}
      <style dangerouslySetInnerHTML={{ __html: iOSPreventionStyles }} />
      <Component />
    </div>
  );
}
