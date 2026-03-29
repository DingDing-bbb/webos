/**
 * @fileoverview Lock Screen Component
 * @module @ui/components/LockScreen
 *
 * A modern lock screen with user selection and authentication.
 * Inspired by macOS and Windows 11 design.
 *
 * @features
 * - Large centered clock display
 * - Clean user selection cards
 * - Smooth animations
 * - Password input with visual feedback
 */

import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

interface LockScreenUser {
  username: string;
  displayName?: string;
  role?: string;
  isTemporary?: boolean;
}

export interface LockScreenProps {
  users: LockScreenUser[];
  onLogin: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  onGuestLogin?: () => void;
  systemName?: string;
  onReset?: () => void;
}

// ============================================================================
// Icons
// ============================================================================

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="lockscreen-spinner" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4 31.4" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

// ============================================================================
// Helper Functions
// ============================================================================

const isDevMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('dev') === '1' || params.get('dev') === 'true';
};

// ============================================================================
// Component
// ============================================================================

export const LockScreen: React.FC<LockScreenProps> = ({
  users,
  onLogin,
  onGuestLogin,
  systemName = 'WebOS',
  onReset,
}) => {
  // State
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Effects
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setDevMode(isDevMode());
  }, []);

  useEffect(() => {
    const realUsers = users.filter((u) => !u.isTemporary);
    if (realUsers.length === 1 && !selectedUser) {
      setSelectedUser(realUsers[0].username);
    }
  }, [users, selectedUser]);

  // Handlers
  const handleUserClick = useCallback((username: string) => {
    setSelectedUser(username);
    setShowPasswordField(true);
    setPassword('');
    setError(null);
  }, []);

  const handleBack = useCallback(() => {
    setShowPasswordField(false);
    setPassword('');
    setError(null);
    setShowResetConfirm(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUser) return;

      setIsLoggingIn(true);
      setError(null);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const result = await onLogin(selectedUser, password);

      if (!result.success) {
        setError(result.error || 'Incorrect password');
        setIsLoggingIn(false);
      }
    },
    [selectedUser, password, onLogin]
  );

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

  // Formatters
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }, []);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const realUsers = users.filter((u) => !u.isTemporary);
  const selectedUserObj = realUsers.find((u) => u.username === selectedUser);

  // Render
  return (
    <div className="lockscreen-container">
      <div className="lockscreen-background" />

      {devMode && <div className="lockscreen-dev-badge">DEV MODE</div>}

      <div className="lockscreen-content">
        {!showPasswordField ? (
          // User Selection View
          <div className="lockscreen-user-select">
            {/* Clock */}
            <div className="lockscreen-time">
              <div className="lockscreen-time-display">{formatTime(currentTime)}</div>
              <div className="lockscreen-date-display">{formatDate(currentTime)}</div>
            </div>

            {/* Users */}
            <div className="lockscreen-users">
              <div className="lockscreen-users-title">{systemName}</div>
              <div className="lockscreen-users-list">
                {realUsers.map((user, index) => (
                  <div
                    key={user.username}
                    className="lockscreen-user-card"
                    onClick={() => handleUserClick(user.username)}
                    style={{ animationDelay: `${index * 0.08}s` }}
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

            {onGuestLogin && (
              <button className="lockscreen-guest-btn" onClick={onGuestLogin}>
                Sign in as guest
              </button>
            )}
          </div>
        ) : (
          // Password Input View
          <div className="lockscreen-password">
            {/* Back Button */}
            <button
              className="lockscreen-back-btn"
              onClick={handleBack}
              type="button"
              aria-label="Back to user selection"
            >
              <ArrowLeftIcon />
              <span>Back</span>
            </button>

            {/* Selected User */}
            <div className="lockscreen-password-user">
              <div className="lockscreen-user-avatar large">
                {selectedUserObj?.displayName?.charAt(0).toUpperCase() ||
                  selectedUser?.charAt(0).toUpperCase()}
              </div>
              <div className="lockscreen-user-name">
                {selectedUserObj?.displayName || selectedUser}
              </div>
            </div>

            {/* Password Form */}
            <form onSubmit={handleSubmit} className="lockscreen-password-form">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="lockscreen-password-input"
                autoFocus
                disabled={isLoggingIn}
                autoComplete="current-password"
              />

              {error && (
                <div className="lockscreen-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="lockscreen-submit-btn"
                disabled={isLoggingIn || !password}
                aria-label={isLoggingIn ? 'Logging in...' : 'Login'}
              >
                {isLoggingIn ? <SpinnerIcon /> : <ArrowRightIcon />}
              </button>
            </form>

            <div className="lockscreen-hint">Press Enter to sign in</div>
          </div>
        )}
      </div>

      {/* Development Reset */}
      {devMode && (
        <button
          className={`lockscreen-reset-btn ${showResetConfirm ? 'confirm' : ''}`}
          onClick={handleReset}
          type="button"
          disabled={isResetting}
        >
          {isResetting ? (
            <SpinnerIcon />
          ) : showResetConfirm ? (
            'Click again to confirm'
          ) : (
            <>
              <TrashIcon />
              Reset System
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default LockScreen;
