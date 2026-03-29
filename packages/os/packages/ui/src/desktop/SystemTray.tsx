/**
 * @fileoverview System Tray Component
 * @module @ui/desktop/SystemTray
 *
 * A system tray with:
 * - Icon list
 * - Popup panel
 * - Notification area
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface TrayIcon {
  /** Icon ID */
  id: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Tooltip text */
  tooltip?: string;
  /** Badge/indicator */
  badge?: string | number;
  /** Whether icon is active */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Custom panel content */
  panel?: React.ReactNode;
}

export interface Notification {
  /** Notification ID */
  id: string;
  /** Application name */
  app: string;
  /** Title */
  title: string;
  /** Message body */
  message?: string;
  /** Icon */
  icon?: React.ReactNode;
  /** Timestamp */
  timestamp?: Date;
  /** Whether notification is unread */
  isUnread?: boolean;
  /** Action buttons */
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Click handler */
  onClick?: () => void;
}

export interface SystemTrayProps {
  /** Tray icons */
  icons?: TrayIcon[];
  /** Notifications */
  notifications?: Notification[];
  /** Called when notification is cleared */
  onClearNotifications?: () => void;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ClearAllIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const SystemTray: React.FC<SystemTrayProps> = ({
  icons = [],
  notifications = [],
  onClearNotifications,
  className = '',
}) => {
  // ========================================
  // State
  // ========================================
  const [showOverflow, setShowOverflow] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const trayRef = useRef<HTMLDivElement>(null);

  // ========================================
  // Effects
  // ========================================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setActivePanel(null);
        setShowNotifications(false);
        setShowOverflow(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ========================================
  // Computed
  // ========================================
  const visibleIcons = icons.slice(0, 4);
  const overflowIcons = icons.slice(4);
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  // ========================================
  // Handlers
  // ========================================
  const handleIconClick = useCallback(
    (icon: TrayIcon) => {
      if (icon.panel) {
        setActivePanel(activePanel === icon.id ? null : icon.id);
      } else {
        icon.onClick?.();
      }
    },
    [activePanel]
  );

  // ========================================
  // Render
  // ========================================
  return (
    <div ref={trayRef} className={`desktop-system-tray ${className}`}>
      {/* Tray Icons */}
      <div className="desktop-system-tray-icons">
        {visibleIcons.map((icon) => (
          <button
            key={icon.id}
            className={`desktop-system-tray-icon ${icon.isActive ? 'active' : ''} ${activePanel === icon.id ? 'panel-open' : ''}`}
            onClick={() => handleIconClick(icon)}
            title={icon.tooltip}
          >
            {icon.icon}
            {icon.badge && <span className="desktop-system-tray-badge">{icon.badge}</span>}
          </button>
        ))}

        {/* Overflow Button */}
        {overflowIcons.length > 0 && (
          <button
            className={`desktop-system-tray-overflow ${showOverflow ? 'active' : ''}`}
            onClick={() => setShowOverflow(!showOverflow)}
          >
            <ChevronIcon />
          </button>
        )}

        {/* Notification Button */}
        <button
          className={`desktop-system-tray-notification ${showNotifications ? 'active' : ''}`}
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <BellIcon />
          {unreadCount > 0 && <span className="desktop-system-tray-badge">{unreadCount}</span>}
        </button>
      </div>

      {/* Overflow Panel */}
      {showOverflow && (
        <div className="desktop-system-tray-overflow-panel">
          <div className="desktop-system-tray-acrylic" />
          {overflowIcons.map((icon) => (
            <button
              key={icon.id}
              className={`desktop-system-tray-icon ${icon.isActive ? 'active' : ''}`}
              onClick={() => {
                handleIconClick(icon);
                setShowOverflow(false);
              }}
              title={icon.tooltip}
            >
              {icon.icon}
              {icon.badge && <span className="desktop-system-tray-badge">{icon.badge}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Icon Panel */}
      {activePanel && (
        <div className="desktop-system-tray-panel">
          <div className="desktop-system-tray-acrylic" />
          {icons.find((i) => i.id === activePanel)?.panel}
        </div>
      )}

      {/* Notification Panel */}
      {showNotifications && (
        <div className="desktop-system-tray-notifications">
          <div className="desktop-system-tray-acrylic" />
          <div className="desktop-system-tray-notifications-header">
            <span>Notifications</span>
            {notifications.length > 0 && (
              <button onClick={onClearNotifications}>
                <ClearAllIcon />
                Clear All
              </button>
            )}
          </div>
          <div className="desktop-system-tray-notifications-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`desktop-system-tray-notification-item ${notification.isUnread ? 'unread' : ''}`}
                  onClick={notification.onClick}
                >
                  <div className="desktop-system-tray-notification-icon">{notification.icon}</div>
                  <div className="desktop-system-tray-notification-content">
                    <div className="desktop-system-tray-notification-app">{notification.app}</div>
                    <div className="desktop-system-tray-notification-title">
                      {notification.title}
                    </div>
                    {notification.message && (
                      <div className="desktop-system-tray-notification-message">
                        {notification.message}
                      </div>
                    )}
                    {notification.actions && (
                      <div className="desktop-system-tray-notification-actions">
                        {notification.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick();
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className="desktop-system-tray-notification-dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      notification.onDismiss?.();
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="desktop-system-tray-notifications-empty">No new notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemTray;
