'use client';

import React from 'react';

// 导入 WebOS UI 样式
import '@ui/styles/index.css';
import '@ui/theme/acrylic.css';

// 导入 WebOS 内核
import { initWebOS } from '@kernel';
import {
  Desktop,
  Taskbar,
  StartMenu,
  NotificationContainer,
  ErrorDialogContainer,
  BlueScreenContainer,
  UpdateNotification,
  BootScreen,
} from '@ui';
import type { WallpaperConfig, WallpaperType } from '@ui';
import type { TaskbarDisplayMode } from '@ui';
import { LockScreen } from '@ui';
import { OOBE } from '@oobe';
import { bootloader, setupGlobalErrorHandler } from '@bootloader';
import { RecoveryMode } from '@recovery';
import type { WindowState } from '@kernel/types';
import type { BootStatus } from '@bootloader';
import { getRegisteredApps } from '@apps';
import { updateManager, type UpdateStatus } from '@kernel/core/managers/updateManager';

// ============================================================================
// 初始化
// ============================================================================

// 设置全局错误处理
if (typeof window !== 'undefined') {
  setupGlobalErrorHandler();
  initWebOS();
  updateManager.init();
}

// ============================================================================
// 辅助函数
// ============================================================================

const checkTabletMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem('webos-tablet-mode');
  if (saved !== null) {
    return saved === 'true';
  }
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return isTouch;
};

const applyTabletMode = (enabled: boolean) => {
  if (enabled) {
    document.documentElement.classList.add('os-tablet-mode');
  } else {
    document.documentElement.classList.remove('os-tablet-mode');
  }
};

// ============================================================================
// 主应用组件
// ============================================================================

const WebOSApp: React.FC = () => {
  // ----------------------------------------
  // 状态管理
  // ----------------------------------------

  // 窗口容器引用
  const windowContainerRef = React.useRef<HTMLDivElement | null>(null);

  const [bootStatus, setBootStatus] = React.useState<BootStatus>(() => {
    if (typeof window === 'undefined') return { stage: 'booting', progress: 0 };
    return bootloader.getStatus();
  });
  const [bootComplete, setBootComplete] = React.useState(false);

  // OOBE状态
  const [showOOBE, setShowOOBE] = React.useState(false);

  // 用户认证状态
  const [showLockScreen, setShowLockScreen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [lockScreenUsers, setLockScreenUsers] = React.useState<
    Array<{ username: string; displayName: string }>
  >([]);

  // 恢复模式状态
  const [showRecovery, setShowRecovery] = React.useState(false);

  // 桌面状态
  const [windows, setWindows] = React.useState<WindowState[]>([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = React.useState(false);
  const [isTabletMode, setIsTabletMode] = React.useState(false);

  // 壁纸状态
  const [wallpaperConfig, setWallpaperConfig] = React.useState<WallpaperConfig>({ type: 'soft' });
  const [taskbarDisplayMode, setTaskbarDisplayMode] =
    React.useState<TaskbarDisplayMode>('icon-name');

  // 更新状态
  const [updateStatus, setUpdateStatus] = React.useState<UpdateStatus>(() => {
    if (typeof window === 'undefined') return { hasUpdate: false };
    return updateManager.getStatus();
  });
  const [showUpdateNotification, setShowUpdateNotification] = React.useState(false);

  // 获取所有已注册的应用
  const registeredApps = React.useMemo(() => getRegisteredApps(), []);

  // ----------------------------------------
  // 初始化
  // ----------------------------------------

  React.useEffect(() => {
    // 初始化平板模式
    const initialTabletMode = checkTabletMode();
    applyTabletMode(initialTabletMode);
    setIsTabletMode(initialTabletMode);

    // 监听开始菜单滑动事件
    const handleTabletStartMenu = () => {
      window.dispatchEvent(new CustomEvent('startmenu:toggle'));
    };
    window.addEventListener('tablet:openStartMenu', handleTabletStartMenu);

    // 读取任务栏显示模式
    const savedMode = localStorage.getItem('webos-taskbar-display-mode');
    if (savedMode) {
      setTaskbarDisplayMode(savedMode as TaskbarDisplayMode);
    }

    return () => {
      window.removeEventListener('tablet:openStartMenu', handleTabletStartMenu);
    };
  }, []);

  // 设置窗口容器 - 需要在 ref 准备好后设置
  React.useEffect(() => {
    if (windowContainerRef.current && window.webos) {
      window.webos.setWindowContainer(windowContainerRef.current);
      console.log('[WebOS] Window container set:', windowContainerRef.current);
    }
  });

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
    const handleToggle = () => setIsStartMenuOpen((prev) => !prev);
    window.addEventListener('startmenu:toggle', handleToggle);
    return () => window.removeEventListener('startmenu:toggle', handleToggle);
  }, []);

  // ----------------------------------------
  // OOBE 和 用户认证流程
  // ----------------------------------------

  React.useEffect(() => {
    if (!bootComplete) return;

    const checkAuth = async () => {
      // 检查OOBE是否完成
      if (window.webos && !window.webos.boot.isOOBEComplete()) {
        console.log('[WebOS] OOBE not complete, showing OOBE');
        setShowOOBE(true);
        return;
      }

      console.log('[WebOS] OOBE complete, checking user auth...');

      // 获取保存的用户名
      const savedUsername = localStorage.getItem('webos-last-username');
      const savedDisplayName = localStorage.getItem('webos-last-displayname') || savedUsername;

      // 检查安全用户管理器
      const secure = (
        window.webos?.user as unknown as {
          secure?: {
            isReady: () => boolean;
            isInitialized: () => Promise<boolean>;
            isLocked: () => boolean;
            getCurrentUser: () => { username: string; displayName?: string } | null;
          };
        }
      ).secure;

      if (secure && secure.isReady()) {
        const hasUsers = await secure.isInitialized();

        if (hasUsers) {
          if (savedUsername) {
            setLockScreenUsers([
              { username: savedUsername, displayName: savedDisplayName || savedUsername },
            ]);
          }

          if (secure.isLocked()) {
            setShowLockScreen(true);
          } else {
            const currentUser = secure.getCurrentUser();
            if (currentUser) {
              setIsLoggedIn(true);
            } else {
              setShowLockScreen(true);
            }
          }
        } else {
          console.log('[WebOS] No user data, skipping login');
          setIsLoggedIn(true);
        }
      } else {
        if (savedUsername) {
          setLockScreenUsers([
            { username: savedUsername, displayName: savedDisplayName || savedUsername },
          ]);
          setShowLockScreen(true);
        } else {
          setIsLoggedIn(true);
        }
      }
    };

    checkAuth();
  }, [bootComplete]);

  // ----------------------------------------
  // 设置加载
  // ----------------------------------------

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
            videoUrl: custom.type === 'video' ? custom.url : undefined,
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
    return () =>
      window.removeEventListener('wallpaper:change', handleWallpaperChange as EventListener);
  }, []);

  // 监听任务栏显示模式更改事件
  React.useEffect(() => {
    const handleTaskbarModeChange = (e: CustomEvent<{ mode: TaskbarDisplayMode }>) => {
      setTaskbarDisplayMode(e.detail.mode);
    };
    window.addEventListener('taskbar:mode-change', handleTaskbarModeChange as EventListener);
    return () =>
      window.removeEventListener('taskbar:mode-change', handleTaskbarModeChange as EventListener);
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

  // ----------------------------------------
  // 事件处理器
  // ----------------------------------------

  const handleOOBEComplete = async (data: {
    username: string;
    password: string;
    language: string;
    systemName?: string;
    tabletMode?: boolean;
    theme?: 'light' | 'dark';
  }) => {
    console.log('[WebOS] OOBE completing...');

    localStorage.setItem('webos-last-username', data.username);
    localStorage.setItem('webos-last-displayname', data.username);

    if (data.theme) {
      localStorage.setItem('webos-theme', data.theme);
      document.documentElement.setAttribute('data-theme', data.theme);
    }

    if (window.webos) {
      window.webos.i18n.setLocale(data.language);

      if (data.systemName) {
        window.webos.config.setSystemName(data.systemName);
      }

      window.webos.boot.completeOOBE();
      console.log('[WebOS] OOBE marked as complete');
    }

    if (data.tabletMode !== undefined) {
      localStorage.setItem('webos-tablet-mode', String(data.tabletMode));
      applyTabletMode(data.tabletMode);
      setIsTabletMode(data.tabletMode);
    }

    setLockScreenUsers([{ username: data.username, displayName: data.username }]);
    setShowOOBE(false);
    setShowLockScreen(true);
    console.log('[WebOS] OOBE complete, showing lock screen');
  };

  const handleLogin = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!window.webos) {
      return { success: false, error: 'System not ready' };
    }

    const secure = (
      window.webos.user as unknown as {
        secure?: {
          login: (
            username: string,
            password: string
          ) => Promise<{ success: boolean; error?: string }>;
        };
      }
    ).secure;

    if (secure) {
      console.log('[WebOS] Attempting secure login for:', username);
      const result = await secure.login(username, password);
      console.log('[WebOS] Secure login result:', result);

      if (result.success) {
        localStorage.setItem('webos-last-username', username);
        setShowLockScreen(false);
        setIsLoggedIn(true);
      }

      return result;
    } else {
      localStorage.setItem('webos-last-username', username);
      setShowLockScreen(false);
      setIsLoggedIn(true);
      return { success: true };
    }
  };

  const openApp = (appId: string) => {
    console.log('[WebOS] openApp called:', appId);
    const appInfo = registeredApps.find((app) => app.id === appId);
    if (!appInfo) {
      console.error('[WebOS] App not found:', appId);
      return;
    }
    if (!window.webos) {
      console.error('[WebOS] window.webos not available');
      return;
    }

    console.log('[WebOS] App info:', appInfo.name);

    const container = document.createElement('div');
    container.style.cssText = 'width:100%;height:100%';

    // 使用 React 18 的 createRoot
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(container);
      root.render(React.createElement(appInfo.component));

      const width = isTabletMode
        ? Math.min(appInfo.defaultWidth || 700, window.innerWidth - 40)
        : appInfo.defaultWidth || 700;
      const height = isTabletMode
        ? Math.min(appInfo.defaultHeight || 450, window.innerHeight - 100)
        : appInfo.defaultHeight || 450;

      console.log('[WebOS] Opening window:', { appId, width, height });
      const windowId = window.webos.window.open(appId, {
        title: window.webos.t(appInfo.nameKey) || appInfo.name,
        width,
        height,
        appId,
        content: container,
      });
      console.log('[WebOS] Window opened:', windowId);
    });
  };

  const handleWindowClick = (windowId: string) => {
    window.webos?.window.focus(windowId);
    const win = windows.find((w) => w.id === windowId);
    if (win?.isMinimized) {
      window.webos?.window.restore(windowId);
    }
  };

  const handleShutdown = () => {
    (window.webos?.boot as { reset?: () => void }).reset?.();
    window.location.reload();
  };

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

  // 开始菜单应用列表
  const startMenuApps = registeredApps.map((app) => ({
    id: app.id,
    name: window.webos?.t(app.nameKey) || app.name,
    icon: React.createElement(app.icon, { size: 24 }),
    onClick: () => openApp(app.id),
  }));

  // ----------------------------------------
  // 渲染
  // ----------------------------------------

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

  if (showOOBE) {
    return <OOBE onComplete={handleOOBEComplete} />;
  }

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

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 窗口容器 - 用于渲染所有应用窗口 */}
      <div
        ref={windowContainerRef}
        className="os-windows-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: taskbarHeight,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      />

      <Desktop
        apps={registeredApps.map((app) => ({
          id: app.id,
          name: window.webos?.t(app.nameKey) || app.name,
          icon: React.createElement(app.icon, { size: 48 }),
          onOpen: () => openApp(app.id),
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
    </div>
  );
};

export default WebOSApp;
