/**
 * @fileoverview Taskbar Component
 * @module @ui/desktop/Taskbar
 *
 * A professional taskbar with:
 * - Start button
 * - Running applications
 * - System tray
 * - Acrylic effect
 */

import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface TaskbarApp {
  /** Application ID */
  id: string;
  /** Display name */
  name: string;
  /** Application icon */
  icon?: React.ReactNode;
  /** Whether the app is active/focused */
  isActive?: boolean;
  /** Whether the app is running */
  isRunning?: boolean;
  /** Whether the app has unread notifications */
  hasNotification?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface SystemTrayIcon {
  /** Icon ID */
  id: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Tooltip text */
  tooltip?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether icon is active */
  isActive?: boolean;
}

export interface TaskbarProps {
  /** Running/pinned applications */
  apps?: TaskbarApp[];
  /** System tray icons */
  trayIcons?: SystemTrayIcon[];
  /** Called when start button is clicked */
  onStartClick?: () => void;
  /** Whether start menu is open */
  isStartMenuOpen?: boolean;
  /** Display mode for apps */
  displayMode?: 'icon-only' | 'icon-name' | 'name-only';
  /** Taskbar position */
  position?: 'bottom' | 'top' | 'left' | 'right';
  /** Show clock */
  showClock?: boolean;
  /** Acrylic effect intensity */
  acrylicIntensity?: number;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

const StartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <rect x="2" y="2" width="9" height="9" rx="1" />
    <rect x="13" y="2" width="9" height="9" rx="1" />
    <rect x="2" y="13" width="9" height="9" rx="1" />
    <rect x="13" y="13" width="9" height="9" rx="1" />
  </svg>
);

const DefaultAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="9" x2="15" y2="15" />
    <line x1="15" y1="9" x2="9" y2="15" />
  </svg>
);

const WifiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <circle cx="12" cy="20" r="1" fill="currentColor" />
  </svg>
);

const VolumeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const BatteryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
    <line x1="23" y1="10" x2="23" y2="14" />
    <rect x="3" y="8" width="12" height="8" fill="currentColor" rx="1" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const Taskbar: React.FC<TaskbarProps> = ({
  apps = [],
  trayIcons = [],
  onStartClick,
  isStartMenuOpen = false,
  displayMode = 'icon-name',
  position = 'bottom',
  showClock = true,
  acrylicIntensity = 0.7,
  className = '',
}) => {
  // ========================================
  // State
  // ========================================
  const [currentTime, setCurrentTime] = useState(new Date());

  // ========================================
  // Effects
  // ========================================
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ========================================
  // Formatters
  // ========================================
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  // ========================================
  // Default tray icons
  // ========================================
  const defaultTrayIcons: SystemTrayIcon[] = [
    { id: 'wifi', icon: <WifiIcon />, tooltip: 'Network' },
    { id: 'volume', icon: <VolumeIcon />, tooltip: 'Volume' },
    { id: 'battery', icon: <BatteryIcon />, tooltip: 'Battery' },
  ];

  const allTrayIcons = trayIcons.length > 0 ? trayIcons : defaultTrayIcons;

  // ========================================
  // Render
  // ========================================
  const isVertical = position === 'left' || position === 'right';

  return (
    <div
      className={`desktop-taskbar ${position} ${className}`}
      style={{ '--acrylic-intensity': acrylicIntensity } as React.CSSProperties}
    >
      {/* Acrylic Background */}
      <div className="desktop-taskbar-acrylic" />

      {/* Start Button */}
      <button
        className={`desktop-taskbar-start ${isStartMenuOpen ? 'active' : ''}`}
        onClick={onStartClick}
        title="Start"
      >
        <StartIcon />
      </button>

      {/* Divider */}
      <div className="desktop-taskbar-divider" />

      {/* Applications */}
      <div className="desktop-taskbar-apps">
        {apps.map((app) => (
          <button
            key={app.id}
            className={`desktop-taskbar-app ${app.isActive ? 'active' : ''} ${app.isRunning ? 'running' : ''} ${displayMode}`}
            onClick={app.onClick}
            title={app.name}
          >
            <span className="desktop-taskbar-app-icon">{app.icon || <DefaultAppIcon />}</span>
            {displayMode !== 'icon-only' && (
              <span className="desktop-taskbar-app-name">{app.name}</span>
            )}
            {app.hasNotification && <span className="desktop-taskbar-app-notification" />}
            {app.isRunning && <span className="desktop-taskbar-app-indicator" />}
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="desktop-taskbar-tray">
        {/* Tray Icons */}
        <div className="desktop-taskbar-tray-icons">
          {allTrayIcons.map((icon) => (
            <button
              key={icon.id}
              className={`desktop-taskbar-tray-icon ${icon.isActive ? 'active' : ''}`}
              onClick={icon.onClick}
              title={icon.tooltip}
            >
              {icon.icon}
            </button>
          ))}
        </div>

        {/* Clock */}
        {showClock && (
          <div className="desktop-taskbar-clock">
            <div className="desktop-taskbar-clock-time">{formatTime(currentTime)}</div>
            {!isVertical && (
              <div className="desktop-taskbar-clock-date">{formatDate(currentTime)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Taskbar;
