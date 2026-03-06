// 任务栏组件

import React, { useState, useEffect } from 'react';
import type { WindowState } from '@kernel/types';

interface TaskbarProps {
  windows: WindowState[];
  onWindowClick: (windowId: string) => void;
  onStartClick: () => void;
  isStartMenuOpen: boolean;
}

const StartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <rect x="2" y="2" width="9" height="9" rx="1"/>
    <rect x="13" y="2" width="9" height="9" rx="1"/>
    <rect x="2" y="13" width="9" height="9" rx="1"/>
    <rect x="13" y="13" width="9" height="9" rx="1"/>
  </svg>
);

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  onWindowClick,
  onStartClick,
  isStartMenuOpen
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

      <div className="os-taskbar-apps">
        {windows.map((win) => (
          <div
            key={win.id}
            className={`os-taskbar-app ${win.isActive ? 'active' : ''}`}
            onClick={() => onWindowClick(win.id)}
            role="button"
            aria-label={win.title}
          >
            <span className="os-taskbar-app-label">{win.title}</span>
          </div>
        ))}
      </div>

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
  onShutdown
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = apps.filter(app =>
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
          zIndex: 9998
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
              <div className="os-start-menu-app-icon">
                {app.icon}
              </div>
              <span className="os-start-menu-app-name">{app.name}</span>
            </div>
          ))}
        </div>

        <div className="os-start-menu-footer">
          <button onClick={() => { onSettings(); onClose(); }}>
            {window.webos?.t('menu.settings') || 'Settings'}
          </button>
          <button onClick={onShutdown}>
            {window.webos?.t('menu.shutdown') || 'Shut Down'}
          </button>
        </div>
      </div>
    </>
  );
};
