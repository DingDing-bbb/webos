// 桌面阶段 - 自己导入需要的模块
import { useEffect, useState, useCallback, useRef } from 'react';
import { Desktop, Taskbar, StartMenu, NotificationContainer, ErrorDialogContainer, BlueScreenContainer } from '@ui';
import { getRegisteredApps } from '@apps';
import type { WindowState } from '@kernel/types';
import React from 'react';

interface DesktopStageProps {
  containerRef?: React.RefObject<HTMLDivElement>;
}

export function DesktopStage({ containerRef: _externalRef }: DesktopStageProps) {
  // 使用内部 ref 作为窗口容器
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = _externalRef || internalContainerRef;
  
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState({ type: 'soft' as const });

  // 获取应用列表
  const apps = getRegisteredApps();

  // 设置窗口容器 - 在组件挂载后立即设置
  useEffect(() => {
    const setContainer = () => {
      if (containerRef.current) {
        console.log('[Desktop] Container element:', containerRef.current);
        if (window.webos) {
          console.log('[Desktop] Setting window container via webos API');
          window.webos.setWindowContainer(containerRef.current);
        } else {
          console.warn('[Desktop] window.webos not available');
        }
      } else {
        console.warn('[Desktop] containerRef.current is null, retrying...');
        // 重试
        setTimeout(setContainer, 100);
      }
    };
    
    // 延迟一帧确保 DOM 已挂载
    requestAnimationFrame(setContainer);
  }, [containerRef]);

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
    if (!app) {
      console.error('[Desktop] App not found:', appId);
      return;
    }
    
    if (!window.webos) {
      console.error('[Desktop] window.webos not available');
      return;
    }

    console.log('[Desktop] Opening app:', appId);
    
    // 创建容器
    const container = document.createElement('div');
    container.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;';

    // 动态导入 createRoot
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(container);
      root.render(React.createElement(app.component));

      // 打开窗口
      const windowId = window.webos!.window.open({
        title: window.webos!.t(app.nameKey) || app.name,
        width: app.defaultWidth || 700,
        height: app.defaultHeight || 450,
        appId,
        content: container
      });
      
      console.log('[Desktop] Window opened with ID:', windowId);
    }).catch(err => {
      console.error('[Desktop] Failed to create root:', err);
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
