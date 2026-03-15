/**
 * 首次密码设置界面
 * 用于OOBE阶段设置系统密码
 */

import React, { useState, useCallback } from 'react';
import { secureUserManager } from '@kernel/core/secureUserManager';

interface PasswordSetupProps {
  onComplete: (success: boolean) => void;
  skipPassword?: boolean; // 是否允许跳过密码设置
}

export const PasswordSetup: React.FC<PasswordSetupProps> = ({ 
  onComplete,
  skipPassword = true 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 检查密码强度
  const checkPasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;
    return strength;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  const getStrengthLabel = (): { label: string; color: string } => {
    if (passwordStrength <= 1) return { label: 'Weak', color: '#f44336' };
    if (passwordStrength <= 2) return { label: 'Fair', color: '#ff9800' };
    if (passwordStrength <= 3) return { label: 'Good', color: '#2196f3' };
    return { label: 'Strong', color: '#4caf50' };
  };

  const validateForm = (): boolean => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }

    if (username.length < 2) {
      setError('Username must be at least 2 characters');
      return false;
    }

    if (!/^[a-z_][a-z0-9_-]*$/i.test(username)) {
      setError('Username contains invalid characters');
      return false;
    }

    // 如果设置了密码，验证密码
    if (password) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // 如果没有设置密码，使用用户名作为默认密码（不推荐但允许）
      const actualPassword = password || username + '_default_' + Date.now();
      
      const result = await secureUserManager.createFirstUser(
        username.trim(),
        actualPassword,
        { displayName: displayName.trim() || username.trim() }
      );

      if (result.success) {
        onComplete(true);
      } else {
        setError(result.error || 'Failed to create user');
      }
    } catch (err) {
      setError('An error occurred during setup');
    } finally {
      setIsLoading(false);
    }
  }, [username, password, confirmPassword, displayName, onComplete]);

  const handleSkip = useCallback(async () => {
    // 创建一个默认用户，没有密码保护
    setIsLoading(true);
    try {
      const defaultUsername = 'user';
      const defaultPassword = 'user_' + Date.now();
      
      const result = await secureUserManager.createFirstUser(
        defaultUsername,
        defaultPassword,
        { displayName: 'User' }
      );

      if (result.success) {
        onComplete(true);
      } else {
        setError(result.error || 'Failed to create default user');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [onComplete]);

  return (
    <div className="os-password-setup">
      <div className="os-password-setup-header">
        <h2>Create Your Account</h2>
        <p>This will be the administrator account for your system</p>
      </div>

      <form className="os-password-setup-form" onSubmit={handleSubmit}>
        {/* 用户名 */}
        <div className="os-password-field">
          <label>Username</label>
          <input
            type="text"
            className="os-password-input"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          <span className="os-password-hint">
            Letters, numbers, underscore, and hyphen only
          </span>
        </div>

        {/* 显示名称 */}
        <div className="os-password-field">
          <label>Display Name <span className="os-optional">(optional)</span></label>
          <input
            type="text"
            className="os-password-input"
            placeholder="Your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* 密码 */}
        <div className="os-password-field">
          <label>
            Password 
            {skipPassword && <span className="os-optional">(recommended)</span>}
          </label>
          <div className="os-password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="os-password-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              className="os-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          
          {/* 密码强度指示器 */}
          {password && (
            <div className="os-password-strength">
              <div className="os-password-strength-bar">
                <div 
                  className="os-password-strength-fill"
                  style={{ 
                    width: `${(passwordStrength / 5) * 100}%`,
                    background: getStrengthLabel().color 
                  }}
                />
              </div>
              <span style={{ color: getStrengthLabel().color }}>
                {getStrengthLabel().label}
              </span>
            </div>
          )}
        </div>

        {/* 确认密码 */}
        {password && (
          <div className="os-password-field">
            <label>Confirm Password</label>
            <input
              type="password"
              className="os-password-input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            {confirmPassword && password !== confirmPassword && (
              <span className="os-password-error">Passwords do not match</span>
            )}
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="os-password-error-block">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* 提交按钮 */}
        <div className="os-password-actions">
          <button 
            type="submit" 
            className="os-password-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="os-password-spinner" />
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {skipPassword && !password && (
            <button
              type="button"
              className="os-password-skip"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip for now (not recommended)
            </button>
          )}
        </div>
      </form>

      {/* 安全提示 */}
      <div className="os-password-security-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <div>
          <strong>Your data is encrypted</strong>
          <p>Password is hashed with PBKDF2 (100,000 iterations) and stored with AES-256-GCM encryption.</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordSetup;
