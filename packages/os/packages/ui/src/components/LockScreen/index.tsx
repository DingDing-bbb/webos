/**
 * @fileoverview Lock Screen Component
 * @module @ui/components/LockScreen
 *
 * A professional lock screen with user selection and authentication.
 * Inspired by modern desktop operating systems (macOS, Windows 11).
 *
 * @features
 * - Real-time clock display
 * - User avatar with initials
 * - Smooth animations and transitions
 * - Password input with visual feedback
 * - Development mode for system reset
 *
 * @example
 * ```tsx
 * import { LockScreen } from '@ui/components/LockScreen';
 *
 * <LockScreen
 *   users={[
 *     { username: 'alice', displayName: 'Alice' },
 *     { username: 'bob', displayName: 'Bob' }
 *   ]}
 *   onLogin={async (username, password) => {
 *     const success = await authenticate(username, password);
 *     return { success };
 *   }}
 *   systemName="WebOS"
 * />
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

/**
 * User information displayed on the lock screen
 */
interface LockScreenUser {
  /** Unique username */
  username: string;
  /** Display name for UI */
  displayName?: string;
  /** User role (affects styling) */
  role?: string;
  /** Whether this is a temporary/guest user */
  isTemporary?: boolean;
}

/**
 * Lock screen component props
 */
export interface LockScreenProps {
  /** List of users to display */
  users: LockScreenUser[];
  /** Authentication handler */
  onLogin: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  /** Optional guest login handler */
  onGuestLogin?: () => void;
  /** System name displayed on the lock screen */
  systemName?: string;
  /** System reset handler (development mode) */
  onReset?: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if development mode is enabled via URL parameter.
 *
 * @returns {boolean} True if ?dev=1 or ?dev=true
 */
const isDevMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('dev') === '1' || params.get('dev') === 'true';
};

// ============================================================================
// Component
// ============================================================================

/**
 * Lock Screen Component
 *
 * Provides a secure authentication interface with:
 * - Time and date display
 * - User selection carousel
 * - Password input with validation
 * - Error handling and retry
 *
 * @param {LockScreenProps} props - Component props
 * @returns {JSX.Element} Lock screen UI
 */
export const LockScreen: React.FC<LockScreenProps> = ({
  users,
  onLogin,
  onGuestLogin,
  systemName = 'WebOS',
  onReset,
}) => {
  // ========================================
  // State
  // ========================================
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // ========================================
  // Effects
  // ========================================

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check development mode on mount
  useEffect(() => {
    setDevMode(isDevMode());
  }, []);

  // Auto-select first non-temporary user
  useEffect(() => {
    const realUsers = users.filter((u) => !u.isTemporary);
    if (realUsers.length === 1 && !selectedUser) {
      setSelectedUser(realUsers[0].username);
    }
  }, [users, selectedUser]);

  // ========================================
  // Handlers
  // ========================================

  /**
   * Handles user selection and shows password field.
   */
  const handleUserClick = useCallback((username: string) => {
    setSelectedUser(username);
    setShowPasswordField(true);
    setPassword('');
    setError(null);
  }, []);

  /**
   * Returns to user selection view.
   */
  const handleBack = useCallback(() => {
    setShowPasswordField(false);
    setPassword('');
    setError(null);
  }, []);

  /**
   * Handles form submission and authentication.
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUser) return;

      setIsLoggingIn(true);
      setError(null);

      // Brief delay for UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      const result = await onLogin(selectedUser, password);

      if (!result.success) {
        setError(result.error || 'Login failed');
        setIsLoggingIn(false);
      }
      // Success is handled by parent component
    },
    [selectedUser, password, onLogin]
  );

  /**
   * Handles system reset in development mode.
   */
  const handleReset = useCallback(async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    setIsResetting(true);
    setError(null);

    try {
      if (onReset) {
        await onReset();
      } else {
        // Default reset logic
        localStorage.clear();
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        }
        window.location.reload();
      }
    } catch (err) {
      setError('Reset failed: ' + (err instanceof Error ? err.message : String(err)));
      setIsResetting(false);
    }
  }, [showResetConfirm, onReset]);

  // ========================================
  // Formatters
  // ========================================

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Filter out temporary users
  const realUsers = users.filter((u) => !u.isTemporary);

  // ========================================
  // Render
  // ========================================

  return (
    <div className="lockscreen-container">
      {/* Background Gradient */}
      <div className="lockscreen-background" />

      {/* Development Mode Badge */}
      {devMode && <div className="lockscreen-dev-badge">⚠️ DEV MODE</div>}

      {/* Main Content */}
      <div className="lockscreen-content">
        {!showPasswordField ? (
          // ========================================
          // User Selection View
          // ========================================
          <div className="lockscreen-user-select">
            {/* Clock Display */}
            <div className="lockscreen-time">
              <div className="lockscreen-time-display">{formatTime(currentTime)}</div>
              <div className="lockscreen-date-display">{formatDate(currentTime)}</div>
            </div>

            {/* User List */}
            <div className="lockscreen-users">
              <div className="lockscreen-users-title">{systemName}</div>
              <div className="lockscreen-users-list">
                {realUsers.map((user, index) => (
                  <div
                    key={user.username}
                    className="lockscreen-user-card"
                    onClick={() => handleUserClick(user.username)}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div className="lockscreen-user-avatar">
                      {user.displayName?.charAt(0).toUpperCase() ||
                        user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="lockscreen-user-name">
                      {user.displayName || user.username}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guest Login Option */}
            {onGuestLogin && (
              <button className="lockscreen-guest-btn" onClick={onGuestLogin}>
                Login as Guest
              </button>
            )}
          </div>
        ) : (
          // ========================================
          // Password Input View
          // ========================================
          <div className="lockscreen-password">
            {/* Back Button */}
            <button
              className="lockscreen-back-btn"
              onClick={handleBack}
              type="button"
              aria-label="Back to user selection"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Selected User Display */}
            <div className="lockscreen-password-user">
              <div className="lockscreen-user-avatar large">
                {realUsers.find((u) => u.username === selectedUser)?.displayName
                  ?.charAt(0)
                  .toUpperCase() || selectedUser?.charAt(0).toUpperCase()}
              </div>
              <div className="lockscreen-user-name">
                {realUsers.find((u) => u.username === selectedUser)?.displayName || selectedUser}
              </div>
            </div>

            {/* Password Form */}
            <form onSubmit={handleSubmit} className="lockscreen-password-form">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="lockscreen-password-input"
                autoFocus
                disabled={isLoggingIn}
                autoComplete="current-password"
              />

              {/* Error Message */}
              {error && (
                <div className="lockscreen-error" role="alert">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="lockscreen-submit-btn"
                disabled={isLoggingIn}
                aria-label={isLoggingIn ? 'Logging in...' : 'Login'}
              >
                {isLoggingIn ? (
                  <span className="lockscreen-loading">
                    <svg className="lockscreen-spinner" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="31.4 31.4"
                      />
                    </svg>
                  </span>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </form>

            {/* Keyboard Hint */}
            <div className="lockscreen-hint">Press Enter to login</div>
          </div>
        )}
      </div>

      {/* Development Mode Reset Button */}
      {devMode && (
        <button
          className={`lockscreen-reset-btn ${showResetConfirm ? 'confirm' : ''}`}
          onClick={handleReset}
          type="button"
          disabled={isResetting}
        >
          {isResetting ? (
            <span className="lockscreen-loading">
              <svg className="lockscreen-spinner" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="31.4 31.4"
                />
              </svg>
            </span>
          ) : showResetConfirm ? (
            '⚠️ Click again to confirm reset'
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Reset System
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default LockScreen;
