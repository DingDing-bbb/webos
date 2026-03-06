/**
 * 锁屏/登录界面组件
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

export const LockScreen: React.FC<LockScreenProps> = ({
  users,
  onLogin,
  isTemporarySession,
  temporaryUserInfo
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(
    users.length === 1 ? users[0] : null
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserSelector, setShowUserSelector] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    } catch {
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

  const showLoginPanel = selectedUser !== null;

  // 点击屏幕显示登录面板
  const handleScreenClick = () => {
    if (!showLoginPanel && users.length > 0) {
      setSelectedUser(users[0]);
    }
    setShowUserSelector(false);
  };

  // 选择用户
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowUserSelector(false);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 99998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        cursor: !showLoginPanel ? 'pointer' : 'default'
      }}
      onClick={!showLoginPanel ? handleScreenClick : undefined}
    >
      {/* 时间显示 */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', opacity: showLoginPanel ? 0.3 : 1 }}>
        <div style={{ 
          fontSize: '5rem', 
          fontWeight: 200, 
          color: 'white', 
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          lineHeight: 1
        }}>
          {formatTime(currentTime)}
        </div>
        <div style={{ 
          fontSize: '1.25rem', 
          color: 'rgba(255,255,255,0.8)', 
          marginTop: '0.5rem',
          textShadow: '0 1px 5px rgba(0,0,0,0.3)'
        }}>
          {formatDate(currentTime)}
        </div>
      </div>

      {/* 临时会话警告 */}
      {isTemporarySession && temporaryUserInfo && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.25rem',
          background: 'rgba(255, 180, 0, 0.2)',
          border: '1px solid rgba(255, 180, 0, 0.4)',
          borderRadius: '8px',
          color: 'white',
          fontSize: '0.875rem',
          marginBottom: '1.5rem'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>{temporaryUserInfo.reason}</span>
        </div>
      )}

      {/* 点击提示 */}
      {!showLoginPanel && (
        <div style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.9rem',
          marginTop: '2rem',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          Click anywhere to sign in
        </div>
      )}

      {/* 登录面板 */}
      {showLoginPanel && selectedUser && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem 3rem',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}>
          {/* 用户头像 */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            userSelect: 'none'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>

          {/* 用户名 */}
          <div style={{
            fontSize: '1.5rem',
            color: 'white',
            marginBottom: '1.5rem',
            userSelect: 'none'
          }}>
            {selectedUser.displayName || selectedUser.username}
          </div>

          {/* 密码输入 */}
          <div style={{ width: '280px', marginBottom: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0 1rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '0.875rem 0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
                  {showPassword ? (
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
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div style={{ color: '#ff6b6b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* 登录按钮 */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading || !password}
            style={{
              width: '280px',
              padding: '0.875rem',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: isLoading || !password ? 'not-allowed' : 'pointer',
              opacity: !password ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px'
            }}
          >
            {isLoading ? (
              <span style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(0,0,0,0.2)',
                borderTopColor: '#333',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
            ) : (
              'Sign in'
            )}
          </button>
        </div>
      )}

      {/* 用户选择器 - 左下角 */}
      {users.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '2rem'
        }}>
          {showUserSelector ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              padding: '0.5rem',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              backdropFilter: 'blur(20px)',
              minWidth: '180px'
            }}>
              {users.map((user) => (
                <button
                  type="button"
                  key={user.username}
                  onClick={() => handleSelectUser(user)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.75rem',
                    background: selectedUser?.username === user.username ? 'rgba(255,255,255,0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{user.displayName || user.username}</span>
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUserSelector(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
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
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        display: 'flex',
        gap: '1rem',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '0.75rem'
      }}>
        <span>{__OS_NAME__}</span>
        <span>v{__OS_VERSION__}</span>
      </div>

      {/* 电源按钮 */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2rem'
      }}>
        <button
          type="button"
          onClick={() => window.location.reload()}
          title="Restart"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LockScreen;
