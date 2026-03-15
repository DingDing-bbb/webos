// WebOS 主入口

import React from 'react';
import { createRoot } from 'react-dom/client';
import { initWebOS } from '@kernel';
import { BootScreen, Desktop, Taskbar, StartMenu, NotificationContainer, ErrorDialogContainer, BlueScreenContainer, UpdateNotification, LockScreen } from '../packages/ui/src';
import type { WallpaperConfig, WallpaperType } from '../packages/ui/src';
import type { TaskbarDisplayMode } from '../packages/ui/src/components/Taskbar';
import { OOBE } from '@oobe';
import { bootloader, setupGlobalErrorHandler } from '@bootloader';
import { RecoveryMode } from '@recovery';
import type { WindowState } from '@kernel/types';
import type { BootStatus } from '@bootloader';
import { getRegisteredApps } from '../packages/apps';
import { updateManager, type UpdateStatus } from '@kernel/core/managers/updateManager';

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
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [showLockScreen, setShowLockScreen] = React.useState(false);
  const [lockScreenUsers, setLockScreenUsers] = React.useState<Array<{ username: string; displayName: string }>>([]);

  const [wallpaperConfig, setWallpaperConfig] = React.useState<WallpaperConfig>({ type: 'soft' });
  const [taskbarDisplayMode, setTaskbarDisplayMode] = React.useState<TaskbarDisplayMode>(() => {
    const saved = localStorage.getItem('webos-taskbar-display-mode');
    return (saved as TaskbarDisplayMode) || 'icon-name';
  });

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
    if (!bootComplete) return;
    
    const checkAuth = async () => {
      if (window.webos && !window.webos.boot.isOOBEComplete()) {
        setShowOOBE(true);
      } else if (bootComplete) {
        setOobeComplete(true);
        
        // 使用安全用户管理器
        const secure = (window.webos?.user as unknown as { 
          secure?: { 
            isReady: () => boolean; 
            isInitialized: () => Promise<boolean>;
            isLocked: () => boolean;
            getCurrentUser: () => { username: string; displayName?: string } | null;
            getUserList: () => Promise<Array<{ username: string; displayName: string }>>;
          } 
        }).secure;
        
        if (!secure || !secure.isReady()) {
          console.warn('[WebOS] Secure user manager not ready');
          // 等待一下再检查
          setTimeout(() => {
            if (window.webos?.user.hasUsers()) {
              const users = window.webos.user.getRealUsers().map(u => ({
                username: u.username,
                displayName: u.displayName || u.username
              }));
              setLockScreenUsers(users);
              setShowLockScreen(true);
            } else {
              // 没有用户，重新 OOBE
              console.warn('[WebOS] No users found, restarting OOBE...');
              window.webos?.boot.reset();
              window.location.reload();
            }
          }, 500);
          return;
        }
        
        // 检查是否有用户
        const hasUsers = await secure.isInitialized();
        
        if (hasUsers) {
          // 数据库已初始化但锁定
          // 从 localStorage 获取保存的用户名（因为数据库锁定时无法查询）
          const savedUsername = localStorage.getItem('webos-last-username');
          const savedDisplayName = localStorage.getItem('webos-last-displayname') || savedUsername;
          
          if (savedUsername) {
            setLockScreenUsers([{
              username: savedUsername,
              displayName: savedDisplayName || savedUsername
            }]);
            console.log('[WebOS] Using saved username for lock screen:', savedUsername);
          } else {
            // 没有保存的用户名，允许手动输入
            setLockScreenUsers([]);
            console.log('[WebOS] No saved username, user will need to enter manually');
          }
          
          // 有用户，检查是否锁定
          if (secure.isLocked()) {
            // 系统锁定，显示登录界面
            setShowLockScreen(true);
          } else {
            // 已解锁（可能是之前保存的会话）
            const currentUser = secure.getCurrentUser();
            if (currentUser) {
              setIsLoggedIn(true);
            } else {
              setShowLockScreen(true);
            }
          }
        } else {
          // 没有用户且 OOBE 已完成，可能是数据损坏
          console.warn('[WebOS] No users found but OOBE marked as complete. Re-initializing...');
          window.webos?.boot.reset();
          window.location.reload();
        }
      }
    };
    
    checkAuth();
  }, [bootComplete]);

  // 加载壁纸设置
  React.useEffect(() => {
    if (!isLoggedIn) return;
    
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
  }, [isLoggedIn]);

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

  // 监听任务栏显示模式更改事件
  React.useEffect(() => {
    const handleTaskbarModeChange = (e: CustomEvent<{ mode: TaskbarDisplayMode }>) => {
      setTaskbarDisplayMode(e.detail.mode);
    };
    window.addEventListener('taskbar:mode-change', handleTaskbarModeChange as EventListener);
    return () => window.removeEventListener('taskbar:mode-change', handleTaskbarModeChange as EventListener);
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
      if (!touch) return;
      
      const startX = touch.clientX;
      const startY = touch.clientY;
      const startLeft = windowEl.offsetLeft;
      const startTop = windowEl.offsetTop;
      
      windowEl.classList.add('os-window-dragging');
      
      const handleTouchMove = (moveEvent: TouchEvent) => {
        const moveTouch = moveEvent.touches[0];
        if (!moveTouch) return;
        
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
  const handleOOBEComplete = async (data: { username: string; password: string; language: string; systemName?: string; tabletMode?: boolean }) => {
    console.log('[WebOS] OOBE completing with data:', { username: data.username, hasPassword: !!data.password });
    
    // 保存用户名到 localStorage 用于锁屏显示（登录前数据库是锁定的）
    localStorage.setItem('webos-last-username', data.username);
    
    // 使用安全用户管理器创建用户
    const secure = (window.webos?.user as unknown as { 
      secure?: { 
        isReady: () => boolean;
        isInitialized: () => Promise<boolean>;
        resetAndReinit: () => Promise<void>;
        createFirstUser: (username: string, password: string, options?: { displayName?: string }) => Promise<{ success: boolean; error?: string }>;
      } 
    }).secure;
    
    // 等待 secure user manager 初始化完成
    if (secure && !secure.isReady()) {
      console.log('[WebOS] Waiting for secure user manager to be ready...');
      // 等待最多 3 秒
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (secure.isReady()) break;
      }
    }
    
    if (secure && secure.isReady()) {
      // 如果用户没设置密码，使用用户名作为默认密码
      const passwordToUse = data.password || data.username;
      
      console.log('[WebOS] Creating first user...');
      
      // 检查是否已经有残留用户数据（之前的失败尝试）
      const alreadyInitialized = await secure.isInitialized();
      if (alreadyInitialized) {
        console.log('[WebOS] Found existing user data, resetting...');
        // 重置并重新初始化
        await secure.resetAndReinit();
        // 等待重新初始化完成
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (secure.isReady()) break;
        }
      }
      
      // 使用安全用户管理器创建首个用户
      const result = await secure.createFirstUser(
        data.username, 
        passwordToUse,
        { displayName: data.username }
      );
      
      if (!result.success) {
        console.error('[WebOS] Failed to create user:', result.error);
        // 显示错误给用户
        alert(`创建用户失败: ${result.error || '未知错误'}`);
        return;
      }
      console.log('[WebOS] First user created successfully');
    } else {
      // 回退到旧的用户管理器
      if (window.webos) {
        window.webos.user.createUser(data.username, data.password || data.username);
        window.webos.user.login(data.username, data.password || data.username);
      }
    }
    
    // 设置语言
    if (window.webos) {
      window.webos.i18n.setLocale(data.language);
      
      // 设置系统名称
      if (data.systemName) {
        window.webos.config.setSystemName(data.systemName);
      }
      
      // 完成 OOBE
      window.webos.boot.completeOOBE();
    }
    
    if (data.tabletMode !== undefined) {
      localStorage.setItem('webos-tablet-mode', String(data.tabletMode));
      applyTabletMode(data.tabletMode);
      setIsTabletMode(data.tabletMode);
    }
    
    setShowOOBE(false);
    setOobeComplete(true);
    setIsLoggedIn(true);
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

  // 处理登录
  const handleLogin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!window.webos) {
      return { success: false, error: 'System not ready' };
    }
    
    // 使用安全用户管理器登录
    const secure = (window.webos.user as unknown as { 
      secure?: { 
        login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
      } 
    }).secure;
    
    if (secure) {
      console.log('[WebOS] Attempting secure login for:', username);
      const result = await secure.login(username, password);
      console.log('[WebOS] Secure login result:', result);
      
      if (result.success) {
        // 保存用户名到 localStorage 用于下次锁屏显示
        localStorage.setItem('webos-last-username', username);
        setShowLockScreen(false);
        setIsLoggedIn(true);
      }
      
      return result;
    } else {
      // 回退到旧的用户管理器
      const result = window.webos.user.login(username, password);
      
      if (result.success) {
        localStorage.setItem('webos-last-username', username);
        setShowLockScreen(false);
        setIsLoggedIn(true);
      }
      
      return result;
    }
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

  // 渲染锁屏
  if (showLockScreen && !isLoggedIn) {
    return (
      <LockScreen
        users={lockScreenUsers}
        onLogin={handleLogin}
        systemName={window.webos?.config.getSystemName() || 'WebOS'}
      />
    );
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
        displayMode={taskbarDisplayMode}
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

      {/* 更新通知 */}
      {showUpdateNotification && updateStatus.hasUpdate && updateStatus.latestVersion && (
        <UpdateNotification
          currentVersion={updateStatus.currentVersion}
          latestVersion={updateStatus.latestVersion}
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
