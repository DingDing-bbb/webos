/**
 * @fileoverview Start Menu Component
 * @module @ui/desktop/StartMenu
 *
 * A professional start menu with:
 * - Pinned apps
 * - All apps list
 * - Search functionality
 * - Power options
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useStartMenu } from '../hooks/useStartMenu';
import { defaultConfigManager } from '../config/startMenu.config';

// ============================================================================
// Types
// ============================================================================

export interface StartMenuApp {
  /** Application ID */
  id: string;
  /** Display name */
  name: string;
  /** Application icon */
  icon?: React.ReactNode;
  /** Whether app is pinned */
  isPinned?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface StartMenuProps {
  /** Whether the menu is open */
  isOpen: boolean;
  /** Called when menu closes */
  onClose: () => void;
  /** All available applications */
  apps?: StartMenuApp[];
  /** Pinned application IDs */
  pinnedAppIds?: string[];
  /** Called when an app is launched */
  onAppLaunch?: (appId: string) => void;
  /** Called when settings is clicked */
  onSettings?: () => void;
  /** Called when power option is clicked */
  onPower?: (action: 'sleep' | 'restart' | 'shutdown') => void;
  /** Current user info */
  user?: {
    name: string;
    avatar?: React.ReactNode;
  };
  /** Custom className */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PowerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const DefaultAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </svg>
);

const SleepIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const RestartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const ShutdownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  apps = [],
  pinnedAppIds = [],
  onAppLaunch,
  onSettings,
  onPower,
  user,
  className = '',
}) => {
  // ========================================
  // State & Configuration
  // ========================================
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // 使用配置系统（如果未提供apps）
  const useConfigSystem = apps.length === 0 || pinnedAppIds.length === 0;
  const {
    state: configState,
    data: configData,
    actions: configActions,
    error: configError,
    loading: configLoading
  } = useStartMenu({
    onAppLaunch,
    onSettings,
    onPower,
    user
  });
  
  // 本地状态（当使用配置系统时）
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localShowPowerMenu, setLocalShowPowerMenu] = useState(false);
  const [localShowAllApps, setLocalShowAllApps] = useState(false);
  
  // 计算实际使用的值
  const searchQuery = useConfigSystem ? configState.searchQuery : localSearchQuery;
  const setSearchQuery = useConfigSystem ? configActions.setSearchQuery : setLocalSearchQuery;
  const showPowerMenu = useConfigSystem ? configState.showPowerMenu : localShowPowerMenu;
  const setShowPowerMenu = useConfigSystem ? configActions.togglePowerMenu : setLocalShowPowerMenu;
  const showAllApps = useConfigSystem ? (configState.currentView === 'all') : localShowAllApps;
  const setShowAllApps = useConfigSystem ? 
    (show: boolean) => configActions.switchView(show ? 'all' : 'pinned') : 
    setLocalShowAllApps;
  
  // 计算应用列表
  const allApps = useConfigSystem ? configData.apps : apps;
  const pinnedApps = useConfigSystem ? configData.pinnedApps : 
    apps.filter((app) => pinnedAppIds.includes(app.id) || app.isPinned);
  const recommendedApps = useConfigSystem ? configData.recommendedApps : [];
  const recentApps = useConfigSystem ? configData.recentApps : [];
  const searchResults = useConfigSystem ? configData.searchResults :
    (searchQuery ? allApps.filter((app) => app.name.toLowerCase().includes(searchQuery.toLowerCase())) : null);
  
  // 处理程序
  const handleAppClick = useCallback(
    (appId: string) => {
      if (useConfigSystem) {
        configActions.launchApp(appId);
      } else {
        onAppLaunch?.(appId);
        onClose();
      }
    },
    [useConfigSystem, configActions, onAppLaunch, onClose]
  );
  
  const handlePowerAction = useCallback(
    (action: 'sleep' | 'restart' | 'shutdown') => {
      if (useConfigSystem) {
        configActions.performPowerAction(action);
      } else {
        onPower?.(action);
        setLocalShowPowerMenu(false);
      }
    },
    [useConfigSystem, configActions, onPower]
  );

  // ========================================
  // Effects
  // ========================================
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setShowPowerMenu(false);
      if (useConfigSystem) {
        configActions.switchView('pinned');
      } else {
        setLocalShowAllApps(false);
      }
      setTimeout(() => searchInputRef.current?.focus(), 100);
      
      // 如果使用配置系统，打开菜单时刷新数据
      if (useConfigSystem) {
        configActions.openMenu();
      }
    } else {
      // 如果使用配置系统，关闭菜单时清理状态
      if (useConfigSystem) {
        configActions.closeMenu();
      }
    }
  }, [isOpen, useConfigSystem, configActions]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // ========================================
  // Computed Values
  // ========================================
  // 这些值已经在上面计算过了

  // ========================================
  // Handlers
  // ========================================
  const handleAppClick = useCallback(
    (appId: string) => {
      onAppLaunch?.(appId);
      onClose();
    },
    [onAppLaunch, onClose]
  );

  const handlePowerAction = useCallback(
    (action: 'sleep' | 'restart' | 'shutdown') => {
      onPower?.(action);
      setShowPowerMenu(false);
    },
    [onPower]
  );

  // ========================================
  // Render
  // ========================================
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="desktop-start-menu-backdrop" onClick={onClose} />

      {/* Menu */}
      <div ref={menuRef} className={`desktop-start-menu ${className}`}>
        {/* Acrylic Background */}
        <div className="desktop-start-menu-acrylic" />

        {/* Search Box */}
        <div className="desktop-start-menu-search">
          <SearchIcon />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search apps, settings, and files"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content */}
        <div className="desktop-start-menu-content">
          {searchResults ? (
            // Search Results
            <div className="desktop-start-menu-section">
              <div className="desktop-start-menu-section-title">Search Results</div>
              <div className="desktop-start-menu-apps">
                {searchResults.length > 0 ? (
                  searchResults.map((app) => (
                    <button
                      key={app.id}
                      className="desktop-start-menu-app"
                      onClick={() => handleAppClick(app.id)}
                    >
                      <span className="desktop-start-menu-app-icon">
                        {app.icon || <DefaultAppIcon />}
                      </span>
                      <span className="desktop-start-menu-app-name">{app.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="desktop-start-menu-no-results">No results found</div>
                )}
              </div>
            </div>
          ) : showAllApps ? (
            // All Apps View
            <div className="desktop-start-menu-section">
              <button className="desktop-start-menu-back" onClick={() => setShowAllApps(false)}>
                ← Back
              </button>
              <div className="desktop-start-menu-section-title">All Apps</div>
              <div className="desktop-start-menu-apps all-apps">
                {allApps.map((app) => (
                  <button
                    key={app.id}
                    className="desktop-start-menu-app"
                    onClick={() => handleAppClick(app.id)}
                  >
                    <span className="desktop-start-menu-app-icon">
                      {app.icon || <DefaultAppIcon />}
                    </span>
                    <span className="desktop-start-menu-app-name">{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Default View: Pinned + All Apps Button
            <>
              <div className="desktop-start-menu-section">
                <div className="desktop-start-menu-section-header">
                  <span className="desktop-start-menu-section-title">Pinned</span>
                  <button
                    className="desktop-start-menu-all-apps-btn"
                    onClick={() => setShowAllApps(true)}
                  >
                    All Apps →
                  </button>
                </div>
                <div className="desktop-start-menu-apps pinned">
                  {pinnedApps.length > 0 ? (
                    pinnedApps.map((app) => (
                      <button
                        key={app.id}
                        className="desktop-start-menu-app"
                        onClick={() => handleAppClick(app.id)}
                      >
                        <span className="desktop-start-menu-app-icon">
                          {app.icon || <DefaultAppIcon />}
                        </span>
                        <span className="desktop-start-menu-app-name">{app.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="desktop-start-menu-empty">No pinned apps</div>
                  )}
                </div>
              </div>

              <div className="desktop-start-menu-section">
                <div className="desktop-start-menu-section-title">Recommended</div>
                <div className="desktop-start-menu-recommended">
                  {/* Placeholder for recent files/apps */}
                  <div className="desktop-start-menu-empty">No recent items</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="desktop-start-menu-footer">
          {/* User Profile */}
          <button className="desktop-start-menu-user">
            <span className="desktop-start-menu-user-avatar">{user?.avatar || <UserIcon />}</span>
            <span className="desktop-start-menu-user-name">{user?.name || 'User'}</span>
          </button>

          {/* Settings & Power */}
          <div className="desktop-start-menu-footer-actions">
            <button
              className="desktop-start-menu-footer-btn"
              onClick={() => {
                onSettings?.();
                onClose();
              }}
              title="Settings"
            >
              <SettingsIcon />
            </button>

            <div className="desktop-start-menu-power-container">
              <button
                className="desktop-start-menu-footer-btn"
                onClick={() => setShowPowerMenu(!showPowerMenu)}
                title="Power"
              >
                <PowerIcon />
              </button>

              {showPowerMenu && (
                <div className="desktop-start-menu-power-menu">
                  <button onClick={() => handlePowerAction('sleep')}>
                    <SleepIcon />
                    <span>Sleep</span>
                  </button>
                  <button onClick={() => handlePowerAction('restart')}>
                    <RestartIcon />
                    <span>Restart</span>
                  </button>
                  <button onClick={() => handlePowerAction('shutdown')}>
                    <ShutdownIcon />
                    <span>Shut Down</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StartMenu;
