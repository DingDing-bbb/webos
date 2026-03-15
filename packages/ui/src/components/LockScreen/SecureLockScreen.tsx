/**
 * 安全锁屏/登录界面
 * 支持首次设置、密码登录、系统锁定
 */

import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

// ============================================
// 类型定义
// ============================================

export interface SecureLockScreenProps {
  isInitialized: boolean;
  isLocked: boolean;
  users: Array<{
    username: string;
    displayName: string;
    role: string;
  }>;
  onSetup: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onUnlock?: (password: string) => Promise<{ success: boolean; error?: string }>;
  systemName?: string;
}

type ScreenState = 'loading' | 'setup' | 'select-user' | 'enter-password' | 'unlock';

// ============================================
// 组件
// ============================================

export const SecureLockScreen: React.FC<SecureLockScreenProps> = ({
  isInitialized,
  isLocked,
  users,
  onSetup,
  onLogin,
  onUnlock,
  systemName = 'WebOS'
}) => {
  // 状态
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPassword, setShowPassword] = useState(false);

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 根据状态确定显示的界面
  useEffect(() => {
    if (!isInitialized) {
      setScreenState('setup');
    } else if (isLocked) {
      if (users.length === 1) {
        setSelectedUser(users[0].username);
        setScreenState('enter-password');
      } else {
        setScreenState('select-user');
      }
    } else {
      setScreenState('loading');
    }
  }, [isInitialized, isLocked, users]);

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // 处理设置
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证
    if (!username || username.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    if (!/^[a-z_][a-z0-9_-]*$/i.test(username)) {
      setError('Username contains invalid characters');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await onSetup(username, password);
      if (!result.success) {
        setError(result.error || 'Setup failed');
        setIsLoading(false);
      }
      // 成功后由父组件处理状态更新
    } catch (err) {
      setError('Setup failed');
      setIsLoading(false);
    }
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await onLogin(selectedUser, password);
      if (!result.success) {
        setError(result.error || 'Login failed');
        setIsLoading(false);
        setPassword('');
      }
    } catch (err) {
      setError('Login failed');
      setIsLoading(false);
    }
  };

  // 处理解锁
  const _handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUnlock) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await onUnlock(password);
      if (!result.success) {
        setError(result.error || 'Unlock failed');
        setIsLoading(false);
        setPassword('');
      }
    } catch (err) {
      setError('Unlock failed');
      setIsLoading(false);
    }
  };

  // 选择用户
  const handleSelectUser = (userUsername: string) => {
    setSelectedUser(userUsername);
    setScreenState('enter-password');
    setPassword('');
    setError(null);
  };

  // 返回用户选择
  const handleBack = () => {
    setScreenState('select-user');
    setSelectedUser(null);
    setPassword('');
    setError(null);
  };

  // 渲染加载状态
  if (screenState === 'loading') {
    return (
      <div className="lockscreen-container">
        <div className="lockscreen-loading">
          <div className="lockscreen-spinner-large" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // 渲染首次设置界面
  if (screenState === 'setup') {
    return (
      <div className="lockscreen-container">
        <div className="lockscreen-background" />
        <div className="lockscreen-content">
          <div className="lockscreen-setup">
            <div className="lockscreen-setup-header">
              <div className="lockscreen-setup-icon">🔐</div>
              <h1>Welcome to {systemName}</h1>
              <p>Create your administrator account to get started</p>
            </div>

            <form onSubmit={handleSetup} className="lockscreen-setup-form">
              <div className="lockscreen-setup-field">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="lockscreen-input"
                  autoFocus
                  disabled={isLoading}
                />
              </div>

              <div className="lockscreen-setup-field">
                <label>Display Name (optional)</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  className="lockscreen-input"
                  disabled={isLoading}
                />
              </div>

              <div className="lockscreen-setup-field">
                <label>Password</label>
                <div className="lockscreen-password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password (min 6 characters)"
                    className="lockscreen-input"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="lockscreen-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="lockscreen-setup-field">
                <label>Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="lockscreen-input"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="lockscreen-error">{error}</div>
              )}

              <button
                type="submit"
                className="lockscreen-setup-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="lockscreen-loading-inline">
                    <svg className="lockscreen-spinner" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4 31.4" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="lockscreen-setup-info">
              <p>🔒 Your password will be hashed with PBKDF2 (100,000 iterations)</p>
              <p>💾 Data is stored locally using IndexedDB</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 渲染用户选择界面
  if (screenState === 'select-user') {
    return (
      <div className="lockscreen-container">
        <div className="lockscreen-background" />
        <div className="lockscreen-content">
          <div className="lockscreen-user-select">
            <div className="lockscreen-time">
              <div className="lockscreen-time-display">{formatTime(currentTime)}</div>
              <div className="lockscreen-date-display">{formatDate(currentTime)}</div>
            </div>

            <div className="lockscreen-users">
              <div className="lockscreen-users-title">{systemName}</div>
              <div className="lockscreen-users-list">
                {users.map(user => (
                  <div
                    key={user.username}
                    className="lockscreen-user-card"
                    onClick={() => handleSelectUser(user.username)}
                  >
                    <div className="lockscreen-user-avatar">
                      {user.displayName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="lockscreen-user-name">
                      {user.displayName || user.username}
                    </div>
                    {user.role === 'root' && (
                      <div className="lockscreen-user-badge">Admin</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 渲染密码输入界面
  const currentUser = users.find(u => u.username === selectedUser);

  return (
    <div className="lockscreen-container">
      <div className="lockscreen-background" />
      <div className="lockscreen-content">
        <div className="lockscreen-password">
          {users.length > 1 && (
            <button className="lockscreen-back-btn" onClick={handleBack}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="lockscreen-password-user">
            <div className="lockscreen-user-avatar large">
              {currentUser?.displayName?.charAt(0).toUpperCase() 
                || selectedUser?.charAt(0).toUpperCase()}
            </div>
            <div className="lockscreen-user-name">
              {currentUser?.displayName || selectedUser}
            </div>
            {currentUser?.role === 'root' && (
              <div className="lockscreen-user-role">Administrator</div>
            )}
          </div>

          <form onSubmit={handleLogin} className="lockscreen-password-form">
            <div className="lockscreen-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="lockscreen-password-input"
                autoFocus
                disabled={isLoading}
              />
              <button
                type="button"
                className="lockscreen-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            {error && (
              <div className="lockscreen-error">{error}</div>
            )}

            <button 
              type="submit" 
              className="lockscreen-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="lockscreen-loading">
                  <svg className="lockscreen-spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4 31.4" />
                  </svg>
                </span>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </form>

          <div className="lockscreen-hint">
            Press Enter to login
          </div>

          <div className="lockscreen-security-info">
            <span>🔒 PBKDF2 100K iterations</span>
            <span>💾 Local storage</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureLockScreen;
