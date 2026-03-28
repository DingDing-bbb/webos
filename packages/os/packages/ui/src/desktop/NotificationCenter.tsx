/**
 * @fileoverview Notification Center Component
 * @module @ui/desktop/NotificationCenter
 *
 * A notification center with:
 * - Notification list
 * - Quick settings toggles
 * - Clear all functionality
 */

import React, { useRef, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface NotificationItem {
  /** Notification ID */
  id: string;
  /** Application name */
  app: string;
  /** App icon */
  appIcon?: React.ReactNode;
  /** Notification title */
  title: string;
  /** Notification message */
  message?: string;
  /** Notification icon */
  icon?: React.ReactNode;
  /** Image attachment */
  image?: string;
  /** Timestamp */
  timestamp?: Date;
  /** Whether notification is unread */
  isUnread?: boolean;
  /** Action buttons */
  actions?: Array<{
    id: string;
    label: string;
    onClick: () => void;
  }>;
  /** Click handler */
  onClick?: () => void;
  /** Dismiss handler */
  onDismiss?: () => void;
}

export interface QuickSetting {
  /** Setting ID */
  id: string;
  /** Setting label */
  label: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Whether setting is active */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Slider value (0-100) */
  value?: number;
  /** Slider change handler */
  onValueChange?: (value: number) => void;
}

export interface NotificationCenterProps {
  /** Whether center is open */
  isOpen: boolean;
  /** Called when center closes */
  onClose: () => void;
  /** Notifications */
  notifications?: NotificationItem[];
  /** Quick settings */
  quickSettings?: QuickSetting[];
  /** Called when all notifications are cleared */
  onClearAll?: () => void;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ClearAllIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const WifiIcon = ({ isActive }: { isActive?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <circle cx="12" cy="20" r="1" fill="currentColor" />
  </svg>
);

const BluetoothIcon = ({ isActive }: { isActive?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="20" height="20">
    <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
  </svg>
);

const AirplaneIcon = ({ isActive }: { isActive?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

const MoonIcon = ({ isActive }: { isActive?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const VolumeHighIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const BrightnessIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// ============================================================================
// Time Formatter
// ============================================================================

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

// ============================================================================
// Component
// ============================================================================

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications = [],
  quickSettings,
  onClearAll,
  className = '',
}) => {
  // ========================================
  // State
  // ========================================
  const centerRef = useRef<HTMLDivElement>(null);

  // Default quick settings
  const defaultQuickSettings: QuickSetting[] = [
    { id: 'wifi', label: 'Wi-Fi', icon: <WifiIcon isActive />, isActive: true },
    { id: 'bluetooth', label: 'Bluetooth', icon: <BluetoothIcon />, isActive: false },
    { id: 'airplane', label: 'Airplane', icon: <AirplaneIcon />, isActive: false },
    { id: 'night', label: 'Night Mode', icon: <MoonIcon />, isActive: false },
  ];

  const settings = quickSettings || defaultQuickSettings;

  // ========================================
  // Effects
  // ========================================
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (centerRef.current && !centerRef.current.contains(e.target as Node)) {
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
  // Render
  // ========================================
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  return (
    <div ref={centerRef} className={`desktop-notification-center ${className}`}>
      {/* Acrylic Background */}
      <div className="desktop-notification-center-acrylic" />

      {/* Content */}
      <div className="desktop-notification-center-content">
        {/* Quick Settings */}
        <div className="desktop-notification-center-quick-settings">
          <div className="desktop-notification-center-quick-grid">
            {settings.map((setting) => (
              <button
                key={setting.id}
                className={`desktop-notification-center-quick-btn ${setting.isActive ? 'active' : ''}`}
                onClick={setting.onClick}
              >
                <span className="desktop-notification-center-quick-icon">{setting.icon}</span>
                <span className="desktop-notification-center-quick-label">{setting.label}</span>
              </button>
            ))}
          </div>

          {/* Sliders */}
          {settings.filter((s) => s.value !== undefined).map((setting) => (
            <div key={`slider-${setting.id}`} className="desktop-notification-center-slider">
              <span className="desktop-notification-center-slider-icon">
                {setting.id === 'brightness' ? <BrightnessIcon /> : <VolumeHighIcon />}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={setting.value}
                onChange={(e) => setting.onValueChange?.(parseInt(e.target.value))}
              />
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="desktop-notification-center-notifications">
          <div className="desktop-notification-center-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="desktop-notification-center-badge">{unreadCount}</span>
            )}
            {notifications.length > 0 && (
              <button className="desktop-notification-center-clear" onClick={onClearAll}>
                <ClearAllIcon />
                Clear All
              </button>
            )}
          </div>

          <div className="desktop-notification-center-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`desktop-notification-center-item ${notification.isUnread ? 'unread' : ''}`}
                  onClick={notification.onClick}
                >
                  {/* App Info */}
                  <div className="desktop-notification-center-item-header">
                    {notification.appIcon && (
                      <span className="desktop-notification-center-item-app-icon">
                        {notification.appIcon}
                      </span>
                    )}
                    <span className="desktop-notification-center-item-app">{notification.app}</span>
                    {notification.timestamp && (
                      <span className="desktop-notification-center-item-time">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="desktop-notification-center-item-content">
                    {notification.icon && (
                      <span className="desktop-notification-center-item-icon">
                        {notification.icon}
                      </span>
                    )}
                    <div className="desktop-notification-center-item-body">
                      <div className="desktop-notification-center-item-title">
                        {notification.title}
                      </div>
                      {notification.message && (
                        <div className="desktop-notification-center-item-message">
                          {notification.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image */}
                  {notification.image && (
                    <div className="desktop-notification-center-item-image">
                      <img src={notification.image} alt="" />
                    </div>
                  )}

                  {/* Actions */}
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="desktop-notification-center-item-actions">
                      {notification.actions.map((action) => (
                        <button
                          key={action.id}
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

                  {/* Dismiss Button */}
                  <button
                    className="desktop-notification-center-item-dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      notification.onDismiss?.();
                    }}
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))
            ) : (
              <div className="desktop-notification-center-empty">
                No new notifications
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
