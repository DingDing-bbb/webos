/**
 * 安全登录界面
 * - root 用户默认隐藏
 * - 单用户直接显示登录按钮
 * - 右下角切换账号功能
 * - 开发模式：支持强制重置系统
 */

import React, { useState, useEffect, useCallback } from 'react';
import { secureUserManager } from '@kernel/core/secureUserManager';

interface SecureLoginScreenProps {
  onLoginSuccess: () => void;
}

// 检测开发模式
const isDevMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('dev') === '1' || params.get('dev') === 'true';
};

// 内嵌的加载动画
const Spinner: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <div style={{ display: 'inline-flex', width: size, height: size }}>
    <svg 
      width={size} 
      height={size} 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      style={{ display: 'block' }}
    >
      <g style={{ transformOrigin: 'center', animation: 'login-spin 2s linear infinite' }}>
        <circle 
          cx="12" cy="12" r="9.5" fill="none" strokeWidth="3" strokeLinecap="round"
          style={{ 
            strokeDasharray: '0 150', strokeDashoffset: '0',
            animation: 'login-dash 1.5s ease-in-out infinite'
          }}
        />
      </g>
    </svg>
    <style>{`
      @keyframes login-spin { 100% { transform: rotate(360deg); } }
      @keyframes login-dash {
        0% { stroke-dasharray: 0 150; stroke-dashoffset: 0; }
        47.5% { stroke-dasharray: 42 150; stroke-dashoffset: -16; }
        95%, 100% { stroke-dasharray: 42 150; stroke-dashoffset: -59; }
      }
    `}</style>
  </div>
);

export const SecureLoginScreen: React.FC<SecureLoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visibleUsers, setVisibleUsers] = useState<Array<{ username: string; displayName: string; isRoot: boolean }>>([]);
  const [showUserInput, setShowUserInput] = useState(false);
  const [showSwitchAccount, setShowSwitchAccount] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setDevMode(isDevMode());
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const userList = await secureUserManager.getUserList(false);
    const totalCount = await secureUserManager.getTotalUserCount();
    
    setVisibleUsers(userList);
    
    if (userList.length === 1) {
      setUsername(userList[0].username);
      setShowUserInput(false);
      setShowSwitchAccount(totalCount > userList.length);
    } else if (userList.length === 0) {
      setShowUserInput(true);
      setShowSwitchAccount(false);
    } else {
      setShowUserInput(true);
      setShowSwitchAccount(false);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter username');
      return;
    }
    
    if (!password) {
      setError('Please enter password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await secureUserManager.login(username, password);
      
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Login failed');
        setPassword('');
      }
    } catch (err) {
      setError('An error occurred during login');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  }, [username, password, onLoginSuccess]);

  const handleSwitchAccount = () => {
    setShowUserInput(true);
    setShowSwitchAccount(false);
    setUsername('');
    setPassword('');
    setError('');
  };

  const selectUser = (selectedUsername: string) => {
    setUsername(selectedUsername);
    setShowUserInput(false);
    setTimeout(() => {
      const passwordInput = document.getElementById('login-password');
      passwordInput?.focus();
    }, 100);
  };

  // 开发模式：强制重置系统
  const handleResetSystem = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    setIsResetting(true);
    setError('');

    try {
      // 清除所有 IndexedDB 数据
      await secureUserManager.resetAndReinit();
      
      // 清除 localStorage
      localStorage.clear();
      
      // 清除 IndexedDB 数据库
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
      
      // 刷新页面
      window.location.reload();
    } catch (err) {
      setError('Reset failed: ' + (err instanceof Error ? err.message : String(err)));
      setIsResetting(false);
    }
  };

  const isSingleUserMode = visibleUsers.length === 1 && !showUserInput;

  return (
    <div className="os-lock-screen">
      {/* 壁纸背景 */}
      <div className="os-wallpaper os-wallpaper-lock" />
      
      {/* 开发模式标识 */}
      {devMode && (
        <div className="os-lock-dev-badge">
          ⚠️ DEV MODE
        </div>
      )}
      
      {/* 锁屏内容 */}
      <div className="os-lock-content">
        {/* 系统Logo */}
        <div className="os-lock-logo">
          <svg width="60" height="24" viewBox="0 0 60 24">
            <text 
              x="50%" 
              y="50%" 
              dominantBaseline="middle" 
              textAnchor="middle"
              fill="currentColor"
              fontSize="18"
              fontWeight="300"
            >
              {__OS_NAME__}
            </text>
          </svg>
        </div>

        {/* 单用户模式：显示用户头像和名称 */}
        {isSingleUserMode && (
          <div className="os-lock-single-user">
            <div className="os-lock-avatar large">
              {visibleUsers[0]?.displayName?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="os-lock-username-display">
              {visibleUsers[0]?.displayName || visibleUsers[0]?.username}
            </div>
          </div>
        )}

        {/* 多用户模式：用户选择器 */}
        {!isSingleUserMode && visibleUsers.length > 1 && !showUserInput && (
          <div className="os-lock-user-section">
            <div className="os-lock-user-list">
              {visibleUsers.map(user => (
                <button
                  key={user.username}
                  className="os-lock-user-item"
                  onClick={() => selectUser(user.username)}
                  type="button"
                >
                  <span className="os-lock-avatar">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </span>
                  <span className="os-lock-username">{user.displayName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 登录表单 */}
        <form className="os-lock-form" onSubmit={handleSubmit}>
          {showUserInput && (
            <div className="os-lock-field">
              <input
                type="text"
                className="os-lock-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                autoFocus
              />
            </div>
          )}
          
          <div className="os-lock-field">
            <input
              id="login-password"
              type="password"
              className="os-lock-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              autoFocus={isSingleUserMode}
            />
          </div>

          {error && (
            <div className="os-lock-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="os-lock-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner size={20} />
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Login
              </>
            )}
          </button>
        </form>

        {/* 安全提示 */}
        <div className="os-lock-security-hint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Protected by PBKDF2 100K + AES-256-GCM
        </div>
      </div>

      {/* 时间显示 */}
      <div className="os-lock-time">
        <div className="os-lock-time-display">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="os-lock-date-display">
          {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* 右下角切换账号按钮 */}
      {showSwitchAccount && (
        <button 
          className="os-lock-switch-account"
          onClick={handleSwitchAccount}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Switch Account
        </button>
      )}

      {/* 开发模式：重置按钮 */}
      {devMode && (
        <button 
          className={`os-lock-reset-btn ${showResetConfirm ? 'confirm' : ''}`}
          onClick={handleResetSystem}
          type="button"
          disabled={isResetting}
        >
          {isResetting ? (
            <Spinner size={16} />
          ) : showResetConfirm ? (
            '⚠️ Click again to confirm reset'
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
              Reset System
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default SecureLoginScreen;
