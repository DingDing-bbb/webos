// 任务栏组件

import React, { useState, useEffect } from 'react';
import type { WindowState } from '@kernel/types';

// 任务栏显示模式
export type TaskbarDisplayMode = 'icon-name' | 'icon-only' | 'name-only';

interface TaskbarProps {
  windows: WindowState[];
  onWindowClick: (windowId: string) => void;
  onStartClick: () => void;
  isStartMenuOpen: boolean;
  displayMode?: TaskbarDisplayMode;
}

const StartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <rect x="2" y="2" width="9" height="9" rx="1" />
    <rect x="13" y="2" width="9" height="9" rx="1" />
    <rect x="2" y="13" width="9" height="9" rx="1" />
    <rect x="13" y="13" width="9" height="9" rx="1" />
  </svg>
);

// 默认应用图标
const DefaultAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="9" x2="15" y2="15" />
    <line x1="15" y1="9" x2="9" y2="15" />
  </svg>
);

// 获取应用图标
const getAppIcon = (appId?: string): React.ReactNode => {
  if (!appId || !window.webos?.apps) return <DefaultAppIcon />;
  const appInfo = window.webos.apps.get(appId);
  if (!appInfo?.icon) return <DefaultAppIcon />;
  // 渲染图标组件
  return React.createElement(appInfo.icon, { size: 16 });
};

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  onWindowClick,
  onStartClick,
  isStartMenuOpen,
  displayMode = 'icon-name',
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // 根据 displayMode 渲染任务栏应用
  const renderTaskbarApp = (win: WindowState) => {
    const showIcon = displayMode === 'icon-name' || displayMode === 'icon-only';
    const showName = displayMode === 'icon-name' || displayMode === 'name-only';

    return (
      <div
        key={win.id}
        className={`os-taskbar-app ${win.isActive ? 'active' : ''} os-taskbar-app-${displayMode}`}
        onClick={() => onWindowClick(win.id)}
        role="button"
        aria-label={win.title}
        title={displayMode === 'icon-only' ? win.title : undefined}
      >
        {showIcon && <span className="os-taskbar-app-icon">{getAppIcon(win.appId)}</span>}
        {showName && <span className="os-taskbar-app-label">{win.title}</span>}
      </div>
    );
  };

  return (
    <div className="os-taskbar">
      <div
        className={`os-taskbar-start ${isStartMenuOpen ? 'active' : ''}`}
        onClick={onStartClick}
        role="button"
        aria-label="Start menu"
        aria-expanded={isStartMenuOpen}
      >
        <div className="os-taskbar-start-icon">
          <StartIcon />
        </div>
        <span className="os-taskbar-start-label">
          {window.webos?.t('taskbar.start') || 'Start'}
        </span>
      </div>

      <div className="os-taskbar-apps">{windows.map(renderTaskbarApp)}</div>

      <div className="os-taskbar-tray">
        <div className="os-taskbar-clock">
          <div className="os-taskbar-clock-time">{formatTime(time)}</div>
          <div className="os-taskbar-clock-date">{formatDate(time)}</div>
        </div>
      </div>
    </div>
  );
};

// 开始菜单组件
interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  apps: Array<{
    id: string;
    name: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }>;
  onSettings: () => void;
  onShutdown: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  apps,
  onSettings,
  onShutdown,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="os-start-menu-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
        }}
      />

      <div className="os-start-menu open">
        <div className="os-start-menu-header">
          <input
            type="text"
            className="os-start-menu-search"
            placeholder={window.webos?.t('taskbar.searchPlaceholder') || 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="os-start-menu-apps">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="os-start-menu-app"
              onClick={() => {
                app.onClick();
                onClose();
              }}
              role="button"
            >
              <div className="os-start-menu-app-icon">{app.icon}</div>
              <span className="os-start-menu-app-name">{app.name}</span>
            </div>
          ))}
        </div>

        <div className="os-start-menu-footer">
          <button
            onClick={() => {
              onSettings();
              onClose();
            }}
          >
            {window.webos?.t('menu.settings') || 'Settings'}
          </button>
          <button onClick={onShutdown}>{window.webos?.t('menu.shutdown') || 'Shut Down'}</button>
        </div>
      </div>
    </>
  );
};
