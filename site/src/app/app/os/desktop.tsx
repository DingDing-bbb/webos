// 桌面阶段 - 自己导入需要的模块
import { useEffect, useState, useCallback } from 'react';
import { Desktop, Taskbar, StartMenu, NotificationContainer, ErrorDialogContainer, BlueScreenContainer } from '@ui';
import { getRegisteredApps } from '@apps';
import type { WindowState } from '@kernel/types';
import React from 'react';

interface DesktopStageProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export function DesktopStage({ containerRef }: DesktopStageProps) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState({ type: 'soft' as const });

  // 获取应用列表
  const apps = getRegisteredApps();

  // 更新窗口列表
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.webos) {
        setWindows(window.webos.window.getAll());
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // 加载设置
  useEffect(() => {
    const saved = localStorage.getItem('webos-wallpaper-type');
    if (saved) setWallpaper({ type: saved as 'soft' | 'animated' | 'sunrise' | 'ocean' | 'forest' });
  }, []);

  // 打开应用
  const openApp = useCallback((appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app || !window.webos) return;

    const container = document.createElement('div');
    container.style.cssText = 'width:100%;height:100%';

    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(container);
      root.render(React.createElement(app.component));

      window.webos!.window.open(appId, {
        title: window.webos!.t(app.nameKey) || app.name,
        width: app.defaultWidth || 700,
        height: app.defaultHeight || 450,
        appId,
        content: container
      });
    });
  }, [apps]);

  // 桌面图标
  const desktopApps = apps.map(app => ({
    id: app.id,
    name: window.webos?.t(app.nameKey) || app.name,
    icon: React.createElement(app.icon, { size: 48 }),
    onOpen: () => openApp(app.id)
  }));

  // 开始菜单应用
  const startApps = apps.map(app => ({
    id: app.id,
    name: window.webos?.t(app.nameKey) || app.name,
    icon: React.createElement(app.icon, { size: 24 }),
    onClick: () => openApp(app.id)
  }));

  const taskbarHeight = 48;

  return (
    <>
      <Desktop apps={desktopApps} wallpaper={wallpaper}>
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            inset: 0,
            bottom: taskbarHeight,
            overflow: 'hidden',
          }}
        />
      </Desktop>

      <Taskbar
        windows={windows}
        onWindowClick={(id) => {
          window.webos?.window.focus(id);
          if (windows.find(w => w.id === id)?.isMinimized) {
            window.webos?.window.restore(id);
          }
        }}
        onStartClick={() => setStartOpen(p => !p)}
        isStartMenuOpen={startOpen}
      />

      <StartMenu
        isOpen={startOpen}
        onClose={() => setStartOpen(false)}
        apps={startApps}
        onSettings={() => openApp('com.os.settings')}
        onShutdown={() => window.location.reload()}
      />

      <NotificationContainer />
      <ErrorDialogContainer />
      <BlueScreenContainer />
    </>
  );
}
