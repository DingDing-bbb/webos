/**
 * 锁屏/登录界面组件
 * 用于系统锁定或用户登录
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '@kernel/types';

interface LockScreenProps {
  users: User[];
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGuestLogin?: () => void;
  isTemporarySession?: boolean;
  temporaryUserInfo?: { username: string; password: string; reason: string } | null;
}

// SVG 图标
const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const UserIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {visible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

export const LockScreen: React.FC<LockScreenProps> = ({
  users,
  onLogin,
  onGuestLogin,
  isTemporarySession,
  temporaryUserInfo
}) => {
  // 如果只有一个用户，默认选中
  const [selectedUser, setSelectedUser] = useState<User | null>(
    users.length === 1 ? users[0] : null
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserSelector, setShowUserSelector] = useState(false);

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 点击任意位置进入密码输入
  const handleScreenClick = () => {
    if (!selectedUser && users.length > 0) {
      setSelectedUser(users[0]);
    }
    setShowUserSelector(false);
  };

  const handleLogin = useCallback(async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await onLogin(selectedUser.username, password);
      
      if (!result.success) {
        setError(result.error || 'Login failed');
        setPassword('');
      }
    } catch (err) {
      setError('An error occurred during login');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser, password, onLogin]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // 是否显示密码输入界面
  const showLoginPanel = selectedUser !== null;

  // 选择用户
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowUserSelector(false);
  };

  return (
    <div className="os-lock-screen" onClick={handleScreenClick}>
      {/* 背景壁纸 */}
      <div className="os-wallpaper os-wallpaper-lock" />

      {/* 主内容 */}
      <div className="os-lock-content">
        {/* 时间显示 - 始终显示 */}
        <div className="os-lock-time" style={{ opacity: showLoginPanel ? 0.3 : 1 }}>
          <div className="os-lock-clock">{formatTime(currentTime)}</div>
          <div className="os-lock-date">{formatDate(currentTime)}</div>
        </div>

        {/* 临时会话警告 */}
        {isTemporarySession && temporaryUserInfo && (
          <div className="os-lock-warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>{temporaryUserInfo.reason}</span>
          </div>
        )}

        {/* 提示点击 */}
        {!showLoginPanel && (
          <div className="os-lock-hint" style={{ userSelect: 'none' }}>
            Click anywhere to sign in
          </div>
        )}

        {/* 登录面板 */}
        {showLoginPanel && selectedUser && (
          <div className="os-lock-user-panel" onClick={(e) => e.stopPropagation()}>
            {/* 用户头像 */}
            <div className="os-lock-avatar" style={{ userSelect: 'none' }}>
              <UserIcon />
            </div>

            {/* 用户名 */}
            <div className="os-lock-username" style={{ userSelect: 'none' }}>
              {selectedUser.displayName || selectedUser.username}
            </div>

            {/* 密码输入 */}
            <div className="os-lock-password-container">
              <div className="os-lock-password-wrapper">
                <LockIcon />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="os-lock-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="os-lock-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="os-lock-error">
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="button"
              className="os-lock-login-btn"
              onClick={handleLogin}
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <span className="os-lock-spinner" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        )}

        {/* 用户选择器 - 左下角 */}
        {users.length > 1 && (
          <div className="os-lock-user-selector" onClick={(e) => e.stopPropagation()}>
            {showUserSelector ? (
              <div className="os-lock-user-dropdown">
                {users.map((user) => (
                  <button
                    type="button"
                    key={user.username}
                    className={`os-lock-user-option ${selectedUser?.username === user.username ? 'active' : ''}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="os-lock-user-option-avatar">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <span>{user.displayName || user.username}</span>
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                className="os-lock-switch-user-btn"
                onClick={() => setShowUserSelector(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Switch User</span>
              </button>
            )}
          </div>
        )}

        {/* 系统信息 */}
        <div className="os-lock-system-info">
          <span>{__OS_NAME__}</span>
          <span>v{__OS_VERSION__}</span>
        </div>
      </div>

      {/* 电源选项 */}
      <div className="os-lock-power" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="os-lock-power-btn"
          onClick={() => window.location.reload()}
          title="Restart"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LockScreen;
