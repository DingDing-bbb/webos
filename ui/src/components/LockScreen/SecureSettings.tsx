/**
 * 安全设置组件
 * 用于用户管理密码和安全设置
 */

import React, { useState, useCallback } from 'react';
import './SecureSettings.css';

// ============================================
// 类型定义
// ============================================

export interface SecureSettingsProps {
  currentUser: {
    username: string;
    displayName: string;
    role: string;
    createdAt?: Date;
    lastLogin?: Date;
  };
  onChangePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdateDisplayName: (displayName: string) => Promise<{ success: boolean; error?: string }>;
  onLogout: () => void;
  onLock?: () => void;
}

// ============================================
// 组件
// ============================================

export const SecureSettings: React.FC<SecureSettingsProps> = ({
  currentUser,
  onChangePassword,
  onUpdateDisplayName,
  onLogout,
  onLock,
}) => {
  // 状态
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // 加载状态
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 消息
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 清除消息
  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  // 更新显示名称
  const handleUpdateDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!displayName.trim()) {
      setErrorMessage('Display name cannot be empty');
      return;
    }

    setIsUpdatingName(true);
    try {
      const result = await onUpdateDisplayName(displayName.trim());
      if (result.success) {
        setSuccessMessage('Display name updated');
      } else {
        setErrorMessage(result.error || 'Failed to update display name');
      }
    } catch {
      setErrorMessage('Failed to update display name');
    }
    setIsUpdatingName(false);
  };

  // 修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // 验证
    if (!oldPassword) {
      setErrorMessage('Current password is required');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await onChangePassword(oldPassword, newPassword);
      if (result.success) {
        setSuccessMessage('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(result.error || 'Failed to change password');
      }
    } catch {
      setErrorMessage('Failed to change password');
    }
    setIsChangingPassword(false);
  };

  // 格式化日期
  const formatDate = (date?: Date) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="secure-settings">
      {/* 标签栏 */}
      <div className="secure-settings-tabs">
        <button
          className={`secure-settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Profile
        </button>
        <button
          className={`secure-settings-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Security
        </button>
      </div>

      {/* 消息 */}
      {successMessage && (
        <div className="secure-settings-message success">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {successMessage}
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      {errorMessage && (
        <div className="secure-settings-message error">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {errorMessage}
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      {/* 内容 */}
      <div className="secure-settings-content">
        {activeTab === 'profile' && (
          <div className="secure-settings-panel">
            {/* 用户信息 */}
            <div className="secure-settings-user-info">
              <div className="secure-settings-avatar">
                {currentUser.displayName?.charAt(0).toUpperCase() ||
                  currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="secure-settings-user-details">
                <div className="secure-settings-username">{currentUser.username}</div>
                <div className="secure-settings-role">{currentUser.role}</div>
              </div>
            </div>

            {/* 显示名称 */}
            <form onSubmit={handleUpdateDisplayName} className="secure-settings-form">
              <label>Display Name</label>
              <div className="secure-settings-field">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  disabled={isUpdatingName}
                />
                <button
                  type="submit"
                  disabled={isUpdatingName || displayName === currentUser.displayName}
                >
                  {isUpdatingName ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>

            {/* 账户信息 */}
            <div className="secure-settings-info">
              <h3>Account Information</h3>
              <dl>
                <dt>Username</dt>
                <dd>{currentUser.username}</dd>

                <dt>Role</dt>
                <dd>{currentUser.role}</dd>

                {currentUser.createdAt && (
                  <>
                    <dt>Created</dt>
                    <dd>{formatDate(currentUser.createdAt)}</dd>
                  </>
                )}

                {currentUser.lastLogin && (
                  <>
                    <dt>Last Login</dt>
                    <dd>{formatDate(currentUser.lastLogin)}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="secure-settings-panel">
            {/* 密码修改 */}
            <div className="secure-settings-section">
              <h3>Change Password</h3>
              <p className="secure-settings-section-desc">
                Your password is hashed with PBKDF2 (100,000 iterations) and stored securely.
              </p>

              <form onSubmit={handleChangePassword} className="secure-settings-form">
                <div className="secure-settings-field-group">
                  <label>Current Password</label>
                  <div className="secure-settings-password-field">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      disabled={isChangingPassword}
                    />
                  </div>
                </div>

                <div className="secure-settings-field-group">
                  <label>New Password</label>
                  <div className="secure-settings-password-field">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                      disabled={isChangingPassword}
                    />
                  </div>
                  {newPassword && newPassword.length < 6 && (
                    <span className="secure-settings-field-hint error">
                      Password must be at least 6 characters
                    </span>
                  )}
                </div>

                <div className="secure-settings-field-group">
                  <label>Confirm New Password</label>
                  <div className="secure-settings-password-field">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={isChangingPassword}
                    />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span className="secure-settings-field-hint error">Passwords do not match</span>
                  )}
                </div>

                <div className="secure-settings-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={showPasswords}
                      onChange={(e) => setShowPasswords(e.target.checked)}
                    />
                    Show passwords
                  </label>
                </div>

                <button
                  type="submit"
                  className="secure-settings-primary-btn"
                  disabled={
                    isChangingPassword ||
                    !oldPassword ||
                    newPassword.length < 6 ||
                    newPassword !== confirmPassword
                  }
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>

            {/* 安全信息 */}
            <div className="secure-settings-section">
              <h3>Security Information</h3>
              <div className="secure-settings-security-info">
                <div className="secure-settings-security-item">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <div>
                    <div className="secure-settings-security-label">Password Hashing</div>
                    <div className="secure-settings-security-value">
                      PBKDF2-SHA256 (100,000 iterations)
                    </div>
                  </div>
                </div>

                <div className="secure-settings-security-item">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <div>
                    <div className="secure-settings-security-label">Data Storage</div>
                    <div className="secure-settings-security-value">IndexedDB (encrypted)</div>
                  </div>
                </div>

                <div className="secure-settings-security-item">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <div>
                    <div className="secure-settings-security-label">Session</div>
                    <div className="secure-settings-security-value">Locked when inactive</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="secure-settings-section">
              <h3>Quick Actions</h3>
              <div className="secure-settings-actions">
                {onLock && (
                  <button className="secure-settings-action-btn lock" onClick={onLock}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Lock System
                  </button>
                )}
                <button className="secure-settings-action-btn logout" onClick={onLogout}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureSettings;
