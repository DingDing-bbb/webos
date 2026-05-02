/**
 * @fileoverview Lock Screen Component
 * @module @ui/desktop/LockScreen
 *
 * A professional lock screen with:
 * - Time display
 * - Password input
 * - Background wallpaper
 * - Blur effect
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface LockScreenProps {
  /** User name */
  userName?: string;
  /** User avatar */
  userAvatar?: React.ReactNode;
  /** Background image URL */
  backgroundImage?: string;
  /** Called when unlocked */
  onUnlock?: (password: string) => Promise<boolean> | boolean;
  /** Show password field */
  showPasswordField?: boolean;
  /** Error message */
  error?: string;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const LockScreen: React.FC<LockScreenProps> = ({
  userName = 'User',
  userAvatar,
  backgroundImage,
  onUnlock,
  showPasswordField: externalShowPasswordField,
  error: externalError,
  className = '',
}) => {
  // ========================================
  // State
  // ========================================
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPasswordField, setShowPasswordField] = useState(externalShowPasswordField ?? false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(externalError ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // ========================================
  // Effects
  // ========================================
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showPasswordField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showPasswordField]);

  useEffect(() => {
    setShowPasswordField(externalShowPasswordField ?? false);
  }, [externalShowPasswordField]);

  useEffect(() => {
    setError(externalError ?? '');
  }, [externalError]);

  // ========================================
  // Handlers
  // ========================================
  const handleScreenClick = useCallback(() => {
    if (!showPasswordField) {
      setShowPasswordField(true);
    }
  }, [showPasswordField]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!password.trim()) {
        setError('Please enter a password');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const success = await onUnlock?.(password);
        if (!success) {
          setError('Incorrect password');
          setPassword('');
        }
      } catch {
        setError('Authentication failed');
        setPassword('');
      } finally {
        setIsLoading(false);
      }
    },
    [password, onUnlock]
  );

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

  // ========================================
  // Render
  // ========================================
  return (
    <div
      className={`desktop-lockscreen ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
      onClick={handleScreenClick}
    >
      {/* Background Overlay */}
      <div className="desktop-lockscreen-overlay" />

      {/* Content */}
      <div className="desktop-lockscreen-content">
        {/* Clock */}
        {!showPasswordField && (
          <div className="desktop-lockscreen-clock">
            <div className="desktop-lockscreen-time">{formatTime(currentTime)}</div>
            <div className="desktop-lockscreen-date">{formatDate(currentTime)}</div>
          </div>
        )}

        {/* User & Password */}
        <div className={`desktop-lockscreen-user ${showPasswordField ? 'expanded' : ''}`}>
          {/* Avatar */}
          <div className="desktop-lockscreen-avatar">{userAvatar || <UserIcon />}</div>

          {/* Username */}
          <div className="desktop-lockscreen-username">{userName}</div>

          {/* Password Field */}
          {showPasswordField && (
            <form className="desktop-lockscreen-password-form" onSubmit={handleSubmit}>
              <div className="desktop-lockscreen-password-input-wrapper">
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={isLoading}
                  className="desktop-lockscreen-password-input"
                />
                <button type="submit" className="desktop-lockscreen-submit" disabled={isLoading}>
                  {isLoading ? <span className="desktop-lockscreen-spinner" /> : <ArrowIcon />}
                </button>
              </div>

              {/* Error Message */}
              {error && <div className="desktop-lockscreen-error">{error}</div>}
            </form>
          )}

          {/* Hint */}
          {!showPasswordField && (
            <div className="desktop-lockscreen-hint">
              <LockIcon />
              <span>Click anywhere to unlock</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
