// WebOS 主入口

import React from 'react';
import { createRoot } from 'react-dom/client';
import { initWebOS } from '@kernel';
import { BootScreen, Desktop, Taskbar, StartMenu, NotificationContainer, ErrorDialogContainer, BlueScreenContainer, UpdateNotification } from '@ui';
import type { WallpaperConfig, WallpaperType } from '@ui';
import { OOBE } from '@oobe';
import { bootloader, setupGlobalErrorHandler } from '@bootloader';
import { RecoveryMode } from '@recovery';
import type { WindowState } from '@kernel/types';
import type { BootStatus } from '@bootloader';
import { getRegisteredApps } from '@apps';
import { updateManager, type UpdateStatus } from '@kernel';

// 设置全局错误处理
setupGlobalErrorHandler();

// 初始化 WebOS API
initWebOS();

// 初始化更新管理器
updateManager.init();

// 简单的平板模式检测
const checkTabletMode = (): boolean => {
  const saved = localStorage.getItem('webos-tablet-mode');
  if (saved !== null) {
    return saved === 'true';
  }
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return isTouch;
};

// 应用平板模式样式
const applyTabletMode = (enabled: boolean) => {
  if (enabled) {
    document.documentElement.classList.add('os-tablet-mode');
  } else {
    document.documentElement.classList.remove('os-tablet-mode');
  }
};

// 初始化
const initialTabletMode = checkTabletMode();
applyTabletMode(initialTabletMode);

// 监听开始菜单滑动事件
window.addEventListener('tablet:openStartMenu', () => {
  window.dispatchEvent(new CustomEvent('startmenu:toggle'));
});

// 应用组件
const App: React.FC = () => {
  const [bootStatus, setBootStatus] = React.useState<BootStatus>(bootloader.getStatus());
  const [bootComplete, setBootComplete] = React.useState(false);
  const [oobeComplete, setOobeComplete] = React.useState(false);
  const [showOOBE, setShowOOBE] = React.useState(false);
  const [showRecovery, setShowRecovery] = React.useState(false);
  const [windows, setWindows] = React.useState<WindowState[]>([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = React.useState(false);
  const [isTabletMode, setIsTabletMode] = React.useState(initialTabletMode);
  const windowContainerRef = React.useRef<HTMLDivElement | null>(null);

  const [initError, setInitError] = React.useState<{ message: string; canRetry: boolean } | null>(null);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const [wallpaperConfig, setWallpaperConfig] = React.useState<WallpaperConfig>({ type: 'soft' });

  // 更新状态
  const [updateStatus, setUpdateStatus] = React.useState<UpdateStatus>(updateManager.getStatus());
  const [showUpdateNotification, setShowUpdateNotification] = React.useState(false);

  // 获取所有已注册的应用
  const registeredApps = React.useMemo(() => getRegisteredApps(), []);

  // 订阅更新状态
  React.useEffect(() => {
    return updateManager.subscribe((status) => {
      setUpdateStatus(status);
      if (status.hasUpdate && !updateManager.getConfig().autoUpdate) {
        setShowUpdateNotification(true);
      }
    });
  }, []);

  // 订阅 bootloader 状态
  React.useEffect(() => {
    const unsubscribe = bootloader.subscribe((status) => {
      setBootStatus(status);
      if (status.stage === 'recovery') {
        setShowRecovery(true);
      }
    });
    return unsubscribe;
  }, []);

  // 监听恢复模式事件
  React.useEffect(() => {
    const handleRecovery = () => setShowRecovery(true);
    window.addEventListener('bootloader:recovery', handleRecovery);
    return () => window.removeEventListener('bootloader:recovery', handleRecovery);
  }, []);

  // 监听开始菜单滑动事件
  React.useEffect(() => {
    const handleToggle = () => setIsStartMenuOpen(prev => !prev);
    window.addEventListener('startmenu:toggle', handleToggle);
    return () => window.removeEventListener('startmenu:toggle', handleToggle);
  }, []);

  // 检查 OOBE 状态和用户账户
  React.useEffect(() => {
    if (bootComplete && window.webos && !window.webos.boot.isOOBEComplete()) {
      setShowOOBE(true);
    } else if (bootComplete) {
      setOobeComplete(true);
      
      if (window.webos) {
        const autoLoginResult = window.webos.user.tryAutoLogin();
        
        if (!autoLoginResult.success) {
          if (!window.webos.user.hasUsers()) {
            const tempUser = window.webos.user.createTemporaryUser('System initialization failed');
            window.webos.user.login(tempUser.username, '');
            
            setInitError({
              message: 'Failed to load user data. Using temporary session.',
              canRetry: true
            });
          }
        }
      }
    }
  }, [bootComplete]);

  // 加载壁纸设置
  React.useEffect(() => {
    const savedType = localStorage.getItem('webos-wallpaper-type') as WallpaperType;
    const savedCustom = localStorage.getItem('webos-wallpaper-custom');
    
    if (savedType) {
      if (savedCustom && (savedType === 'image' || savedType === 'video')) {
        try {
          const custom = JSON.parse(savedCustom);
          setWallpaperConfig({
            type: custom.type,
            imageUrl: custom.type === 'image' ? custom.url : undefined,
            videoUrl: custom.type === 'video' ? custom.url : undefined
          });
        } catch {
          setWallpaperConfig({ type: savedType });
        }
      } else {
        setWallpaperConfig({ type: savedType });
      }
    }
  }, [oobeComplete]);

  // 监听壁纸更改事件
  React.useEffect(() => {
    const handleWallpaperChange = (e: CustomEvent<{ type: WallpaperType; url?: string }>) => {
      const { type, url } = e.detail;
      if (type === 'video' && url) {
        setWallpaperConfig({ type: 'video', videoUrl: url });
      } else if (type === 'image' && url) {
        setWallpaperConfig({ type: 'image', imageUrl: url });
      } else {
        setWallpaperConfig({ type });
      }
    };
    window.addEventListener('wallpaper:change', handleWallpaperChange as EventListener);
    return () => window.removeEventListener('wallpaper:change', handleWallpaperChange as EventListener);
  }, []);

  // 更新窗口列表
  React.useEffect(() => {
    const updateWindows = () => {
      if (window.webos) {
        setWindows(window.webos.window.getAll());
      }
    };
    const interval = setInterval(updateWindows, 100);
    return () => clearInterval(interval);
  }, []);

  // 为新窗口启用触摸支持（平板模式）
  React.useEffect(() => {
    if (!isTabletMode || !windowContainerRef.current) return;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const header = target.closest('.os-window-header');
      if (!header) return;
      if (target.closest('.os-window-controls')) return;
      
      const windowEl = header.closest('.os-window') as HTMLElement;
      if (!windowEl) return;
      
      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;
      const startLeft = windowEl.offsetLeft;
      const startTop = windowEl.offsetTop;
      
      windowEl.classList.add('os-window-dragging');
      
      const handleTouchMove = (moveEvent: TouchEvent) => {
        const moveTouch = moveEvent.touches[0];
        const deltaX = moveTouch.clientX - startX;
        const deltaY = moveTouch.clientY - startY;
        
        windowEl.style.left = (startLeft + deltaX) + 'px';
        windowEl.style.top = (startTop + deltaY) + 'px';
      };
      
      const handleTouchEnd = () => {
        windowEl.classList.remove('os-window-dragging');
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd);
    };

    windowContainerRef.current.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    return () => {
      windowContainerRef.current?.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isTabletMode, oobeComplete]);

  // 处理 OOBE 完成
  const handleOOBEComplete = (data: { username: string; password: string; language: string; systemName?: string; tabletMode?: boolean }) => {
    if (window.webos) {
      const webos = window.webos as {
        createUser?: (username: string, password: string, isRoot?: boolean) => void;
        login?: (username: string, password: string) => boolean;
        i18n: { setLocale: (locale: string) => void };
        config: { setSystemName: (name: string) => void };
        boot: { completeOOBE: () => void };
      };
      webos.createUser?.(data.username, data.password);
      webos.createUser?.('root', data.password, true);
      webos.login?.(data.username, data.password);
      webos.i18n.setLocale(data.language);
      if (data.systemName) {
        window.webos.config.setSystemName(data.systemName);
      }
      window.webos.boot.completeOOBE();
    }
    
    if (data.tabletMode !== undefined) {
      localStorage.setItem('webos-tablet-mode', String(data.tabletMode));
      applyTabletMode(data.tabletMode);
      setIsTabletMode(data.tabletMode);
    }
    
    setShowOOBE(false);
    setOobeComplete(true);
  };

  // 打开应用 - 使用注册中心
  const openApp = (appId: string) => {
    const appInfo = registeredApps.find(app => app.id === appId);
    if (!appInfo || !window.webos) return;

    const container = document.createElement('div');
    container.style.cssText = 'width:100%;height:100%';
    
    const root = createRoot(container);
    root.render(React.createElement(appInfo.component));

    const width = isTabletMode 
      ? Math.min(appInfo.defaultWidth || 700, window.innerWidth - 40) 
      : appInfo.defaultWidth || 700;
    const height = isTabletMode 
      ? Math.min(appInfo.defaultHeight || 450, window.innerHeight - 100) 
      : appInfo.defaultHeight || 450;

    window.webos.window.open(appId, {
      title: window.webos.t(appInfo.nameKey) || appInfo.name,
      width,
      height,
      appId,
      content: container
    });
  };

  // 处理窗口点击
  const handleWindowClick = (windowId: string) => {
    window.webos?.window.focus(windowId);
    const win = windows.find(w => w.id === windowId);
    if (win?.isMinimized) {
      window.webos?.window.restore(windowId);
    }
  };

  // 处理关机
  const handleShutdown = () => {
    (window.webos?.boot as { reset?: () => void }).reset?.();
    window.location.reload();
  };

  // 处理恢复模式操作
  const handleRetry = async () => {
    setShowRecovery(false);
    const success = await bootloader.boot();
    if (success) {
      setBootComplete(true);
    } else {
      setShowRecovery(true);
    }
  };

  const handleRecoverFromCache = async () => {
    await bootloader.recoverFromCache();
  };

  const handleReset = async () => {
    await bootloader.resetSystem();
  };

  // 重试初始化
  const handleRetryInit = async () => {
    if (!window.webos) return;
    
    setIsRetrying(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (window.webos.user.hasUsers()) {
      window.webos.user.clearTemporaryUser();
      window.webos.user.logout();
      setInitError(null);
    } else {
      setInitError({
        message: 'No user account found. Please reset the system.',
        canRetry: false
      });
    }
    
    setIsRetrying(false);
  };

  // 关闭错误提示
  const handleCloseInitError = () => {
    setInitError(null);
  };

  // 开始菜单应用列表 - 从注册中心获取
  const startMenuApps = registeredApps.map(app => ({
    id: app.id,
    name: window.webos?.t(app.nameKey) || app.name,
    icon: React.createElement(app.icon, { size: 24 }),
    onClick: () => openApp(app.id)
  }));

  // 渲染恢复模式
  if (showRecovery) {
    return (
      <RecoveryMode
        status={bootStatus}
        onRetry={handleRetry}
        onReset={handleReset}
        onRecoverFromCache={handleRecoverFromCache}
      />
    );
  }

  // 渲染启动画面
  if (!bootComplete) {
    return (
      <BootScreen 
        onComplete={async () => {
          const success = await bootloader.boot();
          if (success) {
            setBootComplete(true);
          }
        }} 
      />
    );
  }

  // 渲染 OOBE
  if (showOOBE) {
    return <OOBE onComplete={handleOOBEComplete} />;
  }

  const taskbarHeight = isTabletMode ? 56 : 48;

  // 渲染桌面
  return (
    <>
      {initError && (
        <div className="os-init-error-banner">
          <div className="os-init-error-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="os-init-error-message">{initError.message}</span>
            {initError.canRetry && (
              <button
                className="os-init-error-retry"
                onClick={handleRetryInit}
                disabled={isRetrying}
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
            )}
            <button className="os-init-error-close" onClick={handleCloseInitError}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div
        ref={(el) => {
          if (el && window.webos) {
            (window.webos as { setWindowContainer?: (el: HTMLDivElement) => void }).setWindowContainer?.(el);
            windowContainerRef.current = el;
          }
        }}
        style={{ position: 'absolute', top: initError ? 48 : 0, left: 0, right: 0, bottom: taskbarHeight, overflow: 'hidden', transition: 'top 0.3s ease' }}
      />
      
      <Desktop 
        apps={registeredApps.map(app => ({
          id: app.id,
          name: window.webos?.t(app.nameKey) || app.name,
          icon: React.createElement(app.icon, { size: 48 }),
          onDoubleClick: () => openApp(app.id)
        }))}
        wallpaper={wallpaperConfig}
      />
      
      <Taskbar
        windows={windows}
        onWindowClick={handleWindowClick}
        onStartClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        isStartMenuOpen={isStartMenuOpen}
      />
      
      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        apps={startMenuApps}
        onSettings={() => openApp('com.os.settings')}
        onShutdown={handleShutdown}
      />
      
      <NotificationContainer />
      
      <ErrorDialogContainer />
      <BlueScreenContainer />

      {/* 更新通知 - 仅在生产环境显示 */}
      {showUpdateNotification && updateStatus.hasUpdate && (
        <UpdateNotification
          currentVersion={updateStatus.currentVersion}
          latestVersion={updateStatus.latestBuildTime || updateStatus.currentVersion}
          isUpdating={updateStatus.isUpdating}
          onUpdate={() => updateManager.applyUpdate()}
          onSkip={() => {
            updateManager.skipUpdate();
            setShowUpdateNotification(false);
          }}
          onClose={() => setShowUpdateNotification(false)}
        />
      )}
    </>
  );
};

// 渲染应用
const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
