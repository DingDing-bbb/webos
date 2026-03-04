// OOBE (Out-of-Box Experience) 组件 - 首次启动向导

import React, { useState, useEffect } from 'react';
import type { LocaleConfig } from '@kernel/types';

interface OOBEData {
  username: string;
  password: string;
  language: string;
  systemName: string;
  tabletMode: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface OOBEProps {
  onComplete: (data: OOBEData) => void;
}

const steps = ['welcome', 'language', 'theme', 'user', 'mode', 'complete'] as const;
type Step = typeof steps[number];

export const OOBE: React.FC<OOBEProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState<OOBEData>({
    username: '',
    password: '',
    language: 'en',
    systemName: '',
    tabletMode: false,
    theme: 'system'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locales, setLocales] = useState<LocaleConfig[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // 检测是否为触摸设备
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(touchSupport);
    
    // 如果是触摸设备，默认开启平板模式
    if (touchSupport) {
      setFormData(prev => ({ ...prev, tabletMode: true }));
    }
    
    if (window.webos) {
      setLocales(window.webos.i18n.getAvailableLocales());
      // 设置初始语言
      const currentLocale = window.webos.i18n.getCurrentLocale();
      if (currentLocale) {
        setFormData(prev => ({ ...prev, language: currentLocale }));
      }
      
      // 监听语言变化，强制重新渲染
      const unsubscribe = window.webos.i18n.onLocaleChange(() => {
        forceUpdate(n => n + 1);
      });
      return unsubscribe;
    }
  }, []);

  const t = (key: string): string => {
    return window.webos?.t(key) || key;
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'user') {
      if (!formData.username.trim()) {
        newErrors.username = t('oobe.usernameRequired');
      }
      if (!formData.password) {
        newErrors.password = t('oobe.passwordRequired');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleComplete = () => {
    // 保存平板模式设置
    if (formData.tabletMode) {
      document.documentElement.classList.add('os-tablet-mode');
      localStorage.setItem('webos-tablet-mode', 'true');
    }
    // 保存主题设置
    localStorage.setItem('webos-theme', formData.theme);
    if (window.webos) {
      window.webos.config.set('theme', formData.theme);
    }
    onComplete(formData);
  };

  const renderStepIndicator = () => (
    <div className="os-oobe-steps">
      {steps.map((step, index) => (
        <div
          key={step}
          className={`os-oobe-step ${
            steps.indexOf(currentStep) === index ? 'active' : ''
          } ${
            steps.indexOf(currentStep) > index ? 'completed' : ''
          }`}
        />
      ))}
    </div>
  );

  const renderWelcome = () => (
    <div className="os-oobe-content">
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <svg width="80" height="30" viewBox="0 0 80 30">
          <text 
            x="50%" 
            y="50%" 
            dominantBaseline="middle" 
            textAnchor="middle"
            fill="currentColor"
            fontSize="20"
            fontWeight="300"
          >
            {__OS_NAME__}
          </text>
        </svg>
        <p style={{ marginTop: '1rem', color: 'var(--os-color-text-secondary)' }}>
          {t('oobe.welcomeDesc')}
        </p>
      </div>
    </div>
  );

  const renderUserForm = () => (
    <div className="os-oobe-content">
      <div className="os-oobe-field">
        <label className="os-oobe-label">{t('oobe.setUsername')}</label>
        <input
          type="text"
          className="os-oobe-input"
          placeholder={t('oobe.usernamePlaceholder')}
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          autoFocus
        />
        {errors.username && (
          <div className="os-oobe-error">{errors.username}</div>
        )}
      </div>
      
      <div className="os-oobe-field">
        <label className="os-oobe-label">{t('oobe.setPassword')}</label>
        <input
          type="password"
          className="os-oobe-input"
          placeholder={t('oobe.passwordPlaceholder')}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        {errors.password && (
          <div className="os-oobe-error">{errors.password}</div>
        )}
      </div>

      <div className="os-oobe-field">
        <label className="os-oobe-label">{t('oobe.setSystemName')}</label>
        <input
          type="text"
          className="os-oobe-input"
          placeholder={t('oobe.systemNamePlaceholder')}
          value={formData.systemName}
          onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
        />
      </div>
    </div>
  );

  const renderLanguageSelect = () => (
    <div className="os-oobe-content">
      <div className="os-oobe-field">
        <label className="os-oobe-label">{t('oobe.selectLanguage')}</label>
        <select
          className="os-oobe-select"
          value={formData.language}
          onChange={(e) => {
            const newLocale = e.target.value;
            setFormData({ ...formData, language: newLocale });
            // 实时切换语言
            if (window.webos) {
              window.webos.i18n.setLocale(newLocale);
            }
          }}
        >
          {locales.map((locale) => (
            <option key={locale.code} value={locale.code}>
              {locale.nativeName} ({locale.name})
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderThemeSelect = () => {
    const themes = [
      { id: 'light', icon: '☀️', label: t('settings.themeLight'), desc: t('oobe.themeLightDesc') },
      { id: 'dark', icon: '🌙', label: t('settings.themeDark'), desc: t('oobe.themeDarkDesc') },
      { id: 'system', icon: '💻', label: t('settings.themeSystem'), desc: t('oobe.themeSystemDesc') }
    ] as const;

    return (
      <div className="os-oobe-content">
        <div className="os-oobe-field">
          <label className="os-oobe-label">{t('oobe.selectTheme')}</label>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--os-color-text-secondary)', 
            marginBottom: '16px' 
          }}>
            {t('oobe.themeDesc')}
          </p>
          
          {themes.map((themeItem) => (
            <div
              key={themeItem.id}
              className={`os-oobe-mode-card ${formData.theme === themeItem.id ? 'selected' : ''}`}
              onClick={() => {
                setFormData({ ...formData, theme: themeItem.id });
                // 实时预览主题
                applyTheme(themeItem.id);
              }}
            >
              <div className="os-oobe-mode-radio" />
              <div>
                <div style={{ fontWeight: 500, fontSize: '16px' }}>{themeItem.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--os-color-text-secondary)', marginTop: '4px' }}>
                  {themeItem.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 应用主题
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  };

  const renderModeSelect = () => (
    <div className="os-oobe-content">
      <div className="os-oobe-field">
        <label className="os-oobe-label">{t('oobe.selectMode')}</label>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--os-color-text-secondary)', 
          marginBottom: '16px' 
        }}>
          {t('oobe.modeDesc')}
        </p>
        
        {/* 桌面模式 */}
        <div
          className={`os-oobe-mode-card ${!formData.tabletMode ? 'selected' : ''}`}
          onClick={() => setFormData({ ...formData, tabletMode: false })}
        >
          <div className="os-oobe-mode-radio" />
          <div>
            <div style={{ fontWeight: 500, fontSize: '16px' }}>{t('oobe.desktopMode')}</div>
            <div style={{ fontSize: '12px', color: 'var(--os-color-text-secondary)', marginTop: '4px' }}>
              {t('oobe.desktopModeDesc')}
            </div>
          </div>
        </div>
        
        {/* 平板模式 */}
        <div
          className={`os-oobe-mode-card ${formData.tabletMode ? 'selected' : ''}`}
          onClick={() => setFormData({ ...formData, tabletMode: true })}
        >
          <div className="os-oobe-mode-radio" />
          <div>
            <div style={{ fontWeight: 500, fontSize: '16px' }}>{t('oobe.tabletMode')}</div>
            <div style={{ fontSize: '12px', color: 'var(--os-color-text-secondary)', marginTop: '4px' }}>
              {t('oobe.tabletModeDesc')}
            </div>
          </div>
        </div>
        
        {isTouchDevice && (
          <p style={{ 
            fontSize: '12px', 
            color: 'var(--os-color-primary)', 
            marginTop: '12px',
            textAlign: 'center'
          }}>
            {t('oobe.touchDeviceDetected')}
          </p>
        )}
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="os-oobe-content">
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p style={{ marginTop: '1rem', color: 'var(--os-color-text-secondary)' }}>
          {t('oobe.start')}
        </p>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcome();
      case 'language':
        return renderLanguageSelect();
      case 'theme':
        return renderThemeSelect();
      case 'user':
        return renderUserForm();
      case 'mode':
        return renderModeSelect();
      case 'complete':
        return renderComplete();
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'welcome': return t('oobe.welcome');
      case 'language': return t('oobe.selectLanguage');
      case 'theme': return t('oobe.selectTheme');
      case 'user': return t('oobe.setUsername');
      case 'mode': return t('oobe.selectMode');
      case 'complete': return t('oobe.start');
      default: return '';
    }
  };

  const isFirstStep = currentStep === 'welcome';
  const isLastStep = currentStep === 'complete';

  return (
    <div className="os-oobe">
      {/* OOBE 壁纸层 */}
      <div className="os-wallpaper os-wallpaper-oobe" />
      
      <div className="os-oobe-container">
        {renderStepIndicator()}
        
        <div className="os-oobe-header">
          <h1 className="os-oobe-title">{getStepTitle()}</h1>
        </div>

        {renderStep()}

        <div className="os-oobe-actions">
          {!isFirstStep && (
            <button className="os-oobe-btn" onClick={handleBack}>
              {t('oobe.back')}
            </button>
          )}
          
          {isLastStep ? (
            <button className="os-oobe-btn primary" onClick={handleComplete}>
              {t('oobe.start')}
            </button>
          ) : (
            <button className="os-oobe-btn primary" onClick={handleNext}>
              {t('oobe.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OOBE;
