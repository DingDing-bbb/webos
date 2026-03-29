// 桌面阶段 - 自己导入需要的模块
import { useEffect, useState, useCallback, useRef } from 'react';
import { Desktop, Taskbar, StartMenu, NotificationContainer, ErrorDialogContainer, BlueScreenContainer } from '@ui';
import { getRegisteredApps } from '@apps';
import type { WindowState } from '@kernel/types';
import React from 'react';

export function DesktopStage() {
  // 窗口容器 ref
  const containerRef = useRef<HTMLDivElement>(null);
  // 是否已初始化
  const initializedRef = useRef(false);
  
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState({ type: 'soft' as const });
  const [containerReady, setContainerReady] = useState(false);

  // 获取应用列表
  const apps = getRegisteredApps();

  // 设置窗口容器 - 必须在容器 DOM 挂载后设置
  useEffect(() => {
    if (initializedRef.current) return;
    
    const initContainer = () => {
      if (containerRef.current && window.webos) {
        console.log('[Desktop] Setting window container');
        window.webos.setWindowContainer(containerRef.current);
        initializedRef.current = true;
        setContainerReady(true);
        return true;
      }
      return false;
    };
    
    // 立即尝试
    if (!initContainer()) {
      // 如果失败，使用 MutationObserver 等待容器挂载
      const observer = new MutationObserver(() => {
        if (initContainer()) {
          observer.disconnect();
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      
      // 备用：定时器重试
      const timer = setInterval(() => {
        if (initContainer()) {
          clearInterval(timer);
        }
      }, 50);
      
      return () => {
        observer.disconnect();
        clearInterval(timer);
      };
    }
  }, []);

  // 更新窗口列表
  useEffect(() => {
    if (!containerReady) return;
    
    const updateWindows = () => {
      if (window.webos) {
        setWindows(window.webos.window.getAll());
      }
    };
    
    // 立即更新一次
    updateWindows();
    
    // 定时更新
    const timer = setInterval(updateWindows, 100);
    return () => clearInterval(timer);
  }, [containerReady]);

  // 加载设置
  useEffect(() => {
    const saved = localStorage.getItem('webos-wallpaper-type');
    if (saved) setWallpaper({ type: saved as 'soft' | 'animated' | 'sunrise' | 'ocean' | 'forest' });
  }, []);

  // 打开应用
  const openApp = useCallback((appId: string) => {
    if (!window.webos) {
      console.error('[Desktop] window.webos not available');
      return;
    }
    
    const app = apps.find(a => a.id === appId);
    if (!app) {
      console.error('[Desktop] App not found:', appId);
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
      const windowId = window.webos!.window.open(appId, {
        title: window.webos!.t(app.nameKey) || app.name,
        width: app.defaultWidth || 700,
        height: app.defaultHeight || 450,
        content: container
      });
      
      console.log('[Desktop] Window opened with ID:', windowId);
    }).catch(err => {
      console.error('[Desktop] Failed to create root:', err);
    });
  }, [apps]);

  // 桌面图标 - 符合 DesktopIconItem 接口
  const desktopApps = apps.map(app => ({
    id: app.id,
    name: window.webos?.t(app.nameKey) || app.name,
    icon: React.createElement(app.icon, { size: 48 })
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
      <Desktop icons={desktopApps} wallpaper={wallpaper} onIconOpen={(id) => openApp(id)}>
        <div
          ref={containerRef}
          id="webos-window-container"
          style={{
            position: 'absolute',
            inset: 0,
            bottom: taskbarHeight,
            overflow: 'hidden',
            pointerEvents: 'none',
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
