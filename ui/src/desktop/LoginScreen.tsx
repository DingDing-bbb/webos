/**
 * @fileoverview Login Screen Component
 * @module @ui/desktop/LoginScreen
 *
 * A professional login screen with:
 * - User selection
 * - Password input
 * - Power options
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface LoginUser {
  /** User ID */
  id: string;
  /** Username */
  username: string;
  /** Display name */
  displayName?: string;
  /** User avatar */
  avatar?: React.ReactNode;
  /** User role */
  role?: string;
  /** Whether this is a guest user */
  isGuest?: boolean;
}

export interface LoginScreenProps {
  /** Available users */
  users: LoginUser[];
  /** Background image URL */
  backgroundImage?: string;
  /** Called when user logs in */
  onLogin: (userId: string, password: string) => Promise<boolean> | boolean;
  /** Called when power action is triggered */
  onPower?: (action: 'sleep' | 'restart' | 'shutdown') => void;
  /** System name */
  systemName?: string;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

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

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const PowerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
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

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  backgroundImage,
  onLogin,
  onPower,
  systemName = 'WebOS',
  className = '',
}) => {
  // ========================================
  // State
  // ========================================
  const [selectedUser, setSelectedUser] = useState<LoginUser | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const inputRef = useRef<HTMLInputElement>(null);
  const powerMenuRef = useRef<HTMLDivElement>(null);

  // ========================================
  // Effects
  // ========================================
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedUser && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedUser]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (powerMenuRef.current && !powerMenuRef.current.contains(e.target as Node)) {
        setShowPowerMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-select first user if only one
  useEffect(() => {
    const regularUsers = users.filter((u) => !u.isGuest);
    if (regularUsers.length === 1 && !selectedUser) {
      setSelectedUser(regularUsers[0]);
    }
  }, [users, selectedUser]);

  // ========================================
  // Handlers
  // ========================================
  const handleUserSelect = useCallback((user: LoginUser) => {
    setSelectedUser(user);
    setPassword('');
    setError('');
  }, []);

  const handleBack = useCallback(() => {
    setSelectedUser(null);
    setPassword('');
    setError('');
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedUser) return;

      // Guest users don't need password
      if (selectedUser.isGuest) {
        const success = await onLogin(selectedUser.id, '');
        if (!success) {
          setError('Login failed');
        }
        return;
      }

      if (!password.trim()) {
        setError('Please enter a password');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const success = await onLogin(selectedUser.id, password);
        if (!success) {
          setError('Incorrect password');
          setPassword('');
        }
      } catch {
        setError('Login failed');
        setPassword('');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedUser, password, onLogin]
  );

  const handlePowerAction = useCallback(
    (action: 'sleep' | 'restart' | 'shutdown') => {
      onPower?.(action);
      setShowPowerMenu(false);
    },
    [onPower]
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
  const regularUsers = users.filter((u) => !u.isGuest);
  const guestUsers = users.filter((u) => u.isGuest);

  return (
    <div
      className={`desktop-loginscreen ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {/* Background Overlay */}
      <div className="desktop-loginscreen-overlay" />

      {/* Content */}
      <div className="desktop-loginscreen-content">
        {/* Clock */}
        {!selectedUser && (
          <div className="desktop-loginscreen-clock">
            <div className="desktop-loginscreen-time">{formatTime(currentTime)}</div>
            <div className="desktop-loginscreen-date">{formatDate(currentTime)}</div>
          </div>
        )}

        {/* User Selection */}
        {!selectedUser ? (
          <div className="desktop-loginscreen-users">
            <div className="desktop-loginscreen-title">{systemName}</div>

            <div className="desktop-loginscreen-users-grid">
              {regularUsers.map((user) => (
                <button
                  key={user.id}
                  className="desktop-loginscreen-user"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="desktop-loginscreen-user-avatar">
                    {user.avatar || <UserIcon />}
                  </div>
                  <div className="desktop-loginscreen-user-name">
                    {user.displayName || user.username}
                  </div>
                  {user.role && <div className="desktop-loginscreen-user-role">{user.role}</div>}
                </button>
              ))}
            </div>

            {/* Guest Users */}
            {guestUsers.length > 0 && (
              <div className="desktop-loginscreen-guests">
                {guestUsers.map((user) => (
                  <button
                    key={user.id}
                    className="desktop-loginscreen-guest"
                    onClick={() => handleUserSelect(user)}
                  >
                    Guest
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Password Screen */
          <div className="desktop-loginscreen-password">
            <button className="desktop-loginscreen-back" onClick={handleBack}>
              <BackIcon />
            </button>

            <div className="desktop-loginscreen-user-avatar large">
              {selectedUser.avatar || <UserIcon />}
            </div>

            <div className="desktop-loginscreen-user-name large">
              {selectedUser.displayName || selectedUser.username}
            </div>

            {!selectedUser.isGuest ? (
              <form className="desktop-loginscreen-form" onSubmit={handleSubmit}>
                <div className="desktop-loginscreen-password-input-wrapper">
                  <input
                    ref={inputRef}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    disabled={isLoading}
                    className="desktop-loginscreen-password-input"
                  />
                  <button type="submit" className="desktop-loginscreen-submit" disabled={isLoading}>
                    {isLoading ? <span className="desktop-loginscreen-spinner" /> : <ArrowIcon />}
                  </button>
                </div>

                {error && <div className="desktop-loginscreen-error">{error}</div>}

                <div className="desktop-loginscreen-hint">Press Enter to login</div>
              </form>
            ) : (
              <button
                className="desktop-loginscreen-guest-login"
                onClick={() => onLogin(selectedUser.id, '')}
              >
                Login as Guest
              </button>
            )}
          </div>
        )}
      </div>

      {/* Power Menu */}
      <div ref={powerMenuRef} className="desktop-loginscreen-power">
        <button
          className="desktop-loginscreen-power-btn"
          onClick={() => setShowPowerMenu(!showPowerMenu)}
        >
          <PowerIcon />
        </button>

        {showPowerMenu && (
          <div className="desktop-loginscreen-power-menu">
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
  );
};

export default LoginScreen;
