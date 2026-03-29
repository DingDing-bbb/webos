/**
 * @fileoverview OOBE (Out-of-Box Experience) Component
 * @module @oobe
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getOOBETranslation, getOOBELocales, type OOBETranslations } from '../locales';
import { secureUserManager } from '@kernel/core/secureUserManager';

// 系统配置
const OS_NAME = typeof __OS_NAME__ !== 'undefined' ? __OS_NAME__ : 'WebOS';
declare const __OS_NAME__: string | undefined;

// 类型
interface OOBEData {
  username: string;
  password: string;
  language: string;
  systemName: string;
  tabletMode: boolean;
  theme: 'light' | 'dark';
}

interface OOBEProps {
  onComplete: (data: OOBEData) => Promise<void>;
}

type Step = 'welcome' | 'language' | 'theme' | 'user' | 'mode' | 'complete';

// 语言配置
interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
}

// ============================================================================
// OOBE Component
// ============================================================================

export const OOBE: React.FC<OOBEProps> = ({ onComplete }) => {
  // 状态
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [locale, setLocale] = useState('en');
  const [formData, setFormData] = useState<OOBEData>({
    username: '',
    password: '',
    language: 'en',
    systemName: '',
    tabletMode: false,
    theme: 'light',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locales] = useState<LocaleConfig[]>(getOOBELocales);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 翻译函数
  const t = useCallback((key: keyof OOBETranslations): string => {
    return getOOBETranslation(locale, key);
  }, [locale]);

  // 步骤配置
  const steps = useMemo<Step[]>(() => ['welcome', 'language', 'theme', 'user', 'mode', 'complete'], []);

  // 初始化
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(touchSupport);
    
    if (touchSupport) {
      setFormData(prev => ({ ...prev, tabletMode: true }));
    }
    
    // 尝试获取系统语言
    if (window.webos) {
      const currentLocale = window.webos.i18n.getCurrentLocale();
      if (currentLocale) {
        setLocale(currentLocale);
        setFormData(prev => ({ ...prev, language: currentLocale }));
      }
    }
  }, []);

  // 应用主题
  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  // 验证
  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'user') {
      if (!formData.username.trim()) {
        newErrors.username = t('usernameRequired');
      }
      
      if (formData.password) {
        if (formData.password.length < 4) {
          newErrors.password = t('passwordTooShort');
        }
        if (formData.password !== confirmPassword) {
          newErrors.confirmPassword = t('passwordMismatch');
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData.username, formData.password, confirmPassword, t]);

  // 导航
  const goToStep = useCallback((step: Step) => {
    setCurrentStep(step);
    setErrors({});
  }, []);

  const handleNext = useCallback(() => {
    if (!validateStep()) return;
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1] as Step);
    }
  }, [currentStep, validateStep, goToStep, steps]);

  const handleBack = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1] as Step);
    }
  }, [currentStep, goToStep, steps]);

  // 完成
  const handleComplete = useCallback(async () => {
    if (isSubmitting) return;
    
    if (!validateStep()) return;
    
    setIsSubmitting(true);

    try {
      // 创建用户
      if (formData.username.trim()) {
        try {
          await secureUserManager.createFirstUser(
            formData.username.trim(),
            formData.password || '',
            { displayName: formData.username.trim() }
          );
          console.log('[OOBE] User created successfully');
        } catch (error) {
          console.error('[OOBE] Failed to create user:', error);
        }
      }

      // 保存设置
      if (formData.tabletMode) {
        document.documentElement.classList.add('os-tablet-mode');
        localStorage.setItem('webos-tablet-mode', 'true');
      }

      localStorage.setItem('webos-theme', formData.theme);
      
      if (window.webos) {
        window.webos.config.set('theme', formData.theme);
        if (formData.systemName.trim()) {
          window.webos.config.setSystemName(formData.systemName.trim());
        }
      }

      await onComplete(formData);
    } catch (error) {
      console.error('[OOBE] Complete error:', error);
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, validateStep, onComplete]);

  // 渲染步骤指示器
  const renderStepIndicator = () => (
    <div className="os-oobe-steps">
      {steps.slice(0, -1).map((step) => (
        <div
          key={step}
          className={`os-oobe-step ${currentStep === step ? 'active' : ''} ${
            steps.indexOf(currentStep) > steps.indexOf(step) ? 'completed' : ''
          }`}
        />
      ))}
    </div>
  );

  // 渲染欢迎页
  const renderWelcome = () => (
    <div className="os-oobe-welcome">
      <svg width="140" height="50" viewBox="0 0 140 50">
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="currentColor"
          fontSize="32"
          fontWeight="700"
          letterSpacing="-1"
        >
          {OS_NAME}
        </text>
      </svg>
      <p className="os-oobe-welcome-desc">{t('welcomeDesc')}</p>
    </div>
  );

  // 渲染语言选择
  const renderLanguage = () => (
    <div className="os-oobe-content">
      <div className="os-oobe-field">
        <label className="os-oobe-label">{t('selectLanguage')}</label>
        <select
          className="os-oobe-select"
          value={locale}
          onChange={(e) => {
            const newLocale = e.target.value;
            setLocale(newLocale);
            setFormData(prev => ({ ...prev, language: newLocale }));
          }}
        >
          {locales.map((loc) => (
            <option key={loc.code} value={loc.code}>
              {loc.nativeName} ({loc.name})
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // 渲染主题选择
  const renderTheme = () => (
    <div className="os-oobe-content">
      <p className="os-oobe-field-desc">{t('themeDesc')}</p>
      
      {(['light', 'dark'] as const).map((themeValue) => (
        <div
          key={themeValue}
          className={`os-oobe-mode-card ${formData.theme === themeValue ? 'selected' : ''}`}
          onClick={() => {
            setFormData(prev => ({ ...prev, theme: themeValue }));
            applyTheme(themeValue);
          }}
        >
          <div className="os-oobe-mode-radio" />
          <div>
            <div className="os-oobe-mode-label">
              {t(themeValue === 'light' ? 'themeLight' : 'themeDark')}
            </div>
            <div className="os-oobe-mode-desc">
              {t(themeValue === 'light' ? 'themeLightDesc' : 'themeDarkDesc')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染用户表单
  const renderUserForm = () => (
    <div className="os-oobe-content">
      <div className="os-oobe-field">
        <label className="os-oobe-label">{t('setUsername')}</label>
        <input
          type="text"
          className="os-oobe-input"
          placeholder={t('usernamePlaceholder')}
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          autoFocus
        />
        {errors.username && <div className="os-oobe-error">{errors.username}</div>}
      </div>

      <div className="os-oobe-field">
        <label className="os-oobe-label">
          {t('setPassword')} <span className="os-oobe-optional">({t('optional')})</span>
        </label>
        <input
          type="password"
          className="os-oobe-input"
          placeholder={t('passwordPlaceholder')}
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        />
        {errors.password && <div className="os-oobe-error">{errors.password}</div>}
      </div>

      {formData.password && (
        <div className="os-oobe-field">
          <label className="os-oobe-label">{t('confirmPassword')}</label>
          <input
            type="password"
            className="os-oobe-input"
            placeholder={t('confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && <div className="os-oobe-error">{errors.confirmPassword}</div>}
        </div>
      )}

      <div className="os-oobe-field">
        <label className="os-oobe-label">
          {t('setSystemName')} <span className="os-oobe-optional">({t('optional')})</span>
        </label>
        <input
          type="text"
          className="os-oobe-input"
          placeholder={t('systemNamePlaceholder')}
          value={formData.systemName}
          onChange={(e) => setFormData(prev => ({ ...prev, systemName: e.target.value }))}
        />
      </div>
    </div>
  );

  // 渲染模式选择
  const renderMode = () => (
    <div className="os-oobe-content">
      <p className="os-oobe-field-desc">{t('modeDesc')}</p>

      <div
        className={`os-oobe-mode-card ${!formData.tabletMode ? 'selected' : ''}`}
        onClick={() => setFormData(prev => ({ ...prev, tabletMode: false }))}
      >
        <div className="os-oobe-mode-radio" />
        <div>
          <div className="os-oobe-mode-label">{t('desktopMode')}</div>
          <div className="os-oobe-mode-desc">{t('desktopModeDesc')}</div>
        </div>
      </div>

      <div
        className={`os-oobe-mode-card ${formData.tabletMode ? 'selected' : ''}`}
        onClick={() => setFormData(prev => ({ ...prev, tabletMode: true }))}
      >
        <div className="os-oobe-mode-radio" />
        <div>
          <div className="os-oobe-mode-label">{t('tabletMode')}</div>
          <div className="os-oobe-mode-desc">{t('tabletModeDesc')}</div>
        </div>
      </div>

      {isTouchDevice && (
        <div className="os-oobe-touch-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          {t('touchDeviceDetected')}
        </div>
      )}
    </div>
  );

  // 渲染完成页
  const renderComplete = () => (
    <div className="os-oobe-complete">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="os-oobe-check-icon"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      <p className="os-oobe-complete-desc">{t('ready')}</p>
    </div>
  );

  // 渲染当前步骤
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome': return renderWelcome();
      case 'language': return renderLanguage();
      case 'theme': return renderTheme();
      case 'user': return renderUserForm();
      case 'mode': return renderMode();
      case 'complete': return renderComplete();
      default: return null;
    }
  };

  // 获取标题
  const getTitle = (): string => {
    const titles: Record<Step, keyof OOBETranslations> = {
      welcome: 'welcome',
      language: 'selectLanguage',
      theme: 'selectTheme',
      user: 'userSetup',
      mode: 'selectMode',
      complete: 'allSet',
    };
    return t(titles[currentStep]);
  };

  const isFirstStep = currentStep === 'welcome';
  const isLastStep = currentStep === 'complete';

  return (
    <div className="os-oobe">
      <div className="os-oobe-container">
        {renderStepIndicator()}

        <div className="os-oobe-header">
          <h1 className="os-oobe-title">{getTitle()}</h1>
        </div>

        {renderStep()}

        <div className="os-oobe-actions">
          {!isFirstStep && (
            <button className="os-oobe-btn" onClick={handleBack} type="button">
              {t('back')}
            </button>
          )}

          {isLastStep ? (
            <button
              className="os-oobe-btn primary"
              onClick={handleComplete}
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
              ) : t('start')}
            </button>
          ) : (
            <button className="os-oobe-btn primary" onClick={handleNext} type="button">
              {t('next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OOBE;
