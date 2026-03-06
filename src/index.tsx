// WebOS 主入口

import React from 'react';
import { createRoot } from 'react-dom/client';
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

// 初始化 WebOS API
import { initWebOS } from '@kernel';
initWebOS();

// 初始化更新管理器
updateManager.init();

// 监听开始菜单滑动事件
window.addEventListener('tablet:openStartMenu', () => {
  window.dispatchEvent(new CustomEvent('startmenu:toggle'));
});

// 锁屏组件（简化版）
const SimpleLockScreen: React.FC<{
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
}> = ({ onLogin }) => {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [selectedUser, setSelectedUser] = React.useState<{ username: string; displayName: string } | null>(null);
  const [showUserList, setShowUserList] = React.useState(false);

  // 获取用户列表
  const users = React.useMemo(() => {
    return window.webos?.user.getRealUsers() || [];
  }, []);

  // 默认选择第一个用户
  React.useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser({
        username: users[0].username,
        displayName: users[0].displayName || users[0].username
      });
    }
  }, [users, selectedUser]);

  // 更新时间
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await onLogin(selectedUser.username, password);
      if (!result.success) {
        setError(result.error || 'Login failed');
        setPassword('');
      }
    } catch {
      setError('An error occurred during login');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && password) {
      handleLogin();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 99998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* 时间显示 */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', opacity: selectedUser ? 0.3 : 1 }}>
        <div style={{ 
          fontSize: '5rem', 
          fontWeight: 200, 
          color: 'white', 
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          lineHeight: 1
        }}>
          {formatTime(currentTime)}
        </div>
        <div style={{ 
          fontSize: '1.25rem', 
          color: 'rgba(255,255,255,0.8)', 
          marginTop: '0.5rem',
          textShadow: '0 1px 5px rgba(0,0,0,0.3)'
        }}>
          {formatDate(currentTime)}
        </div>
      </div>

      {/* 点击提示或登录面板 */}
      {!selectedUser ? (
        <div 
          onClick={() => users.length > 0 && setSelectedUser({
            username: users[0].username,
            displayName: users[0].displayName || users[0].username
          })}
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.9rem',
            marginTop: '2rem',
            cursor: 'pointer',
            padding: '1rem 2rem',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.2)'
          }}
        >
          Click to sign in
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem 3rem',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)'
        }}>
          {/* 用户头像 */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            border: '3px solid rgba(255, 255, 255, 0.2)'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>

          {/* 用户名 */}
          <div style={{
            fontSize: '1.5rem',
            color: 'white',
            marginBottom: '1.5rem'
          }}>
            {selectedUser.displayName}
          </div>

          {/* 密码输入 */}
          <div style={{ width: '280px', marginBottom: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0 1rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '0.875rem 0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
                  {showPassword ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div style={{ color: '#ff6b6b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* 登录按钮 */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading || !password}
            style={{
              width: '280px',
              padding: '0.875rem',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: isLoading || !password ? 'not-allowed' : 'pointer',
              opacity: !password ? 0.6 : 1
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* 多用户切换 */}
          {users.length > 1 && (
            <button
              type="button"
              onClick={() => setShowUserList(!showUserList)}
              style={{
                marginTop: '1rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.8)',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Switch User
            </button>
          )}

          {/* 用户列表 */}
          {showUserList && users.length > 1 && (
            <div style={{
              marginTop: '1rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '0.5rem',
              minWidth: '200px'
            }}>
              {users.map(user => (
                <button
                  key={user.username}
                  type="button"
                  onClick={() => {
                    setSelectedUser({
                      username: user.username,
                      displayName: user.displayName || user.username
                    });
                    setShowUserList(false);
                    setPassword('');
                    setError(null);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem 1rem',
                    background: selectedUser?.username === user.username ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  {user.displayName || user.username}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 系统信息 */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        display: 'flex',
        gap: '1rem',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '0.75rem'
      }}>
        <span>{__OS_NAME__}</span>
        <span>v{__OS_VERSION__}</span>
      </div>

      {/* 重启按钮 */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2rem'
      }}>
        <button
          type="button"
          onClick={() => window.location.reload()}
          title="Restart"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// 应用组件
const App: React.FC = () => {
  const [bootStatus, setBootStatus] = React.useState<BootStatus>(bootloader.getStatus());
  const [bootComplete, setBootComplete] = React.useState(false);
  const [showOOBE, setShowOOBE] = React.useState(false);
  const [showRecovery, setShowRecovery] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [windows, setWindows] = React.useState<WindowState[]>([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = React.useState(false);
  const [isTabletMode, setIsTabletMode] = React.useState(initialTabletMode);
  const windowContainerRef = React.useRef<HTMLDivElement | null>(null);

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

  // 检查 OOBE 状态
  React.useEffect(() => {
    if (bootComplete && window.webos) {
      const oobeDone = window.webos.boot.isOOBEComplete();
      if (!oobeDone) {
        setShowOOBE(true);
      } else {
        // 尝试自动登录
        const result = window.webos.user.tryAutoLogin();
        if (result.success) {
          setIsLoggedIn(true);
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

  // 处理 OOBE 完成
  const handleOOBEComplete = (data: { username: string; password: string; language: string; systemName?: string; tabletMode?: boolean }) => {
    if (window.webos) {
      // 创建用户账户
      const result = window.webos.user.createUser(data.username, data.password, { isRoot: false });
      if (result.success) {
        // 创建root用户
        window.webos.user.createUser('root', data.password, { isRoot: true });
        // 登录用户
        window.webos.user.login(data.username, data.password);
        setIsLoggedIn(true);
      }
      
      // 设置语言
      window.webos.i18n.setLocale(data.language);
      
      // 设置系统名称
      if (data.systemName) {
        window.webos.config.setSystemName(data.systemName);
      }
      
      // 完成OOBE
      window.webos.boot.completeOOBE();
    }

    if (data.tabletMode !== undefined) {
      localStorage.setItem('webos-tablet-mode', String(data.tabletMode));
      applyTabletMode(data.tabletMode);
      setIsTabletMode(data.tabletMode);
    }

    setShowOOBE(false);
  };

  // 处理登录
  const handleLogin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!window.webos) {
      return { success: false, error: 'System not initialized' };
    }

    const result = window.webos.user.login(username, password);
    if (result.success) {
      setIsLoggedIn(true);
    }
    return result;
  };

  // 处理锁屏
  const handleLock = () => {
    if (window.webos) {
      window.webos.user.logout();
    }
    setIsLoggedIn(false);
  };

  // 处理关机
  const handleShutdown = () => {
    handleLock();
    bootloader.reset();
    window.location.reload();
  };

  // 打开应用
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

  // 开始菜单应用列表
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

  // 渲染登录界面
  if (!isLoggedIn) {
    return <SimpleLockScreen onLogin={handleLogin} />;
  }

  const taskbarHeight = isTabletMode ? 56 : 48;

  // 渲染桌面
  return (
    <>
      <div
        ref={(el) => {
          if (el && window.webos) {
            (window.webos as { setWindowContainer?: (el: HTMLDivElement) => void }).setWindowContainer?.(el);
            windowContainerRef.current = el;
          }
        }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: taskbarHeight, overflow: 'hidden' }}
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
        onLock={handleLock}
        onShutdown={handleShutdown}
      />
      
      <NotificationContainer />
      
      <ErrorDialogContainer />
      <BlueScreenContainer />

      {/* 更新通知 */}
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
