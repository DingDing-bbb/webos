/**
 * @fileoverview OOBE (Out-of-Box Experience) Component
 * @module @oobe
 *
 * First-time setup wizard for WebOS.
 * Modern design inspired by macOS and Windows 11 setup experience.
 *
 * @example
 * ```tsx
 * <OOBE onComplete={(data) => initializeSystem(data)} />
 * ```
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { LocaleConfig } from '@kernel/types';

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Spinner Component
// ============================================================================

const Spinner: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ animation: 'spin 1s linear infinite' }}
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

// ============================================================================
// OOBE Component
// ============================================================================

export const OOBE: React.FC<OOBEProps> = ({ onComplete }) => {
  // State
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState<OOBEData>({
    username: '',
    password: '',
    language: 'en',
    systemName: '',
    tabletMode: false,
    theme: 'light',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locales, setLocales] = useState<LocaleConfig[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [, forceUpdate] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Steps configuration
  const steps = useMemo<Step[]>(() => ['welcome', 'language', 'theme', 'user', 'mode', 'complete'], []);

  // Cursor light effect for buttons
  const handleButtonMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btn.style.setProperty('--cursor-x', `${x}px`);
    btn.style.setProperty('--cursor-y', `${y}px`);
  }, []);

  const handleButtonMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    btn.style.removeProperty('--cursor-x');
    btn.style.removeProperty('--cursor-y');
  }, []);

  // Initialization
  useEffect(() => {
    // Set initial theme to light on mount
    document.documentElement.setAttribute('data-theme', 'light');

    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(touchSupport);

    if (touchSupport) {
      setFormData((prev) => ({ ...prev, tabletMode: true }));
    }

    if (window.webos) {
      setLocales(window.webos.i18n.getAvailableLocales());
      const currentLocale = window.webos.i18n.getCurrentLocale();
      if (currentLocale) {
        setFormData((prev) => ({ ...prev, language: currentLocale }));
      }

      const unsubscribe = window.webos.i18n.onLocaleChange(() => {
        forceUpdate((n) => n + 1);
      });

      return unsubscribe;
    }
    return undefined;
  }, []);

  // Translation helper
  const t = useCallback((key: string): string => {
    return window.webos?.t(key) || key;
  }, []);

  // Apply theme preview
  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  // Validation
  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'user') {
      if (!formData.username.trim()) {
        newErrors.username = t('oobe.usernameRequired');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData.username, t]);

  // Navigation
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

  const handleComplete = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (formData.tabletMode) {
        document.documentElement.classList.add('os-tablet-mode');
        localStorage.setItem('webos-tablet-mode', 'true');
      }

      localStorage.setItem('webos-theme', formData.theme);
      if (window.webos) {
        window.webos.config.set('theme', formData.theme);
      }

      await onComplete(formData);
    } catch (error) {
      console.error('[OOBE] Complete error:', error);
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, onComplete]);

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="os-oobe-steps">
      {steps.slice(0, -1).map((step) => (
        <div
          key={step}
          className={`os-oobe-step ${
            currentStep === step ? 'active' : ''
          } ${
            steps.indexOf(currentStep) > steps.indexOf(step) ? 'completed' : ''
          }`}
        />
      ))}
    </div>
  );

  // Render welcome screen
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
          {__OS_NAME__}
        </text>
      </svg>
      <p className="os-oobe-welcome-desc">{t('oobe.welcomeDesc')}</p>
    </div>
  );

  // Render language selection
  const renderLanguage = () => (
    <div className="os-oobe-content">
      <div className="os-oobe-field">
        <label className="os-oobe-label">{t('oobe.selectLanguage')}</label>
        <select
          className="os-oobe-select"
          value={formData.language}
          onChange={(e) => {
            const newLocale = e.target.value;
            setFormData({ ...formData, language: newLocale });
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

  // Render theme selection
  const renderTheme = () => {
    const themes: Array<{
      id: 'light' | 'dark';
      label: string;
      desc: string;
    }> = [
      {
        id: 'light',
        label: t('settings.themeLight'),
        desc: t('oobe.themeLightDesc'),
      },
      {
        id: 'dark',
        label: t('settings.themeDark'),
        desc: t('oobe.themeDarkDesc'),
      },
    ];

    return (
      <div className="os-oobe-content">
        <p className="os-oobe-field-desc">{t('oobe.themeDesc')}</p>
        {themes.map((themeItem) => (
          <div
            key={themeItem.id}
            className={`os-oobe-mode-card ${
              formData.theme === themeItem.id ? 'selected' : ''
            }`}
            onClick={() => {
              setFormData({ ...formData, theme: themeItem.id });
              applyTheme(themeItem.id);
            }}
          >
            <div className="os-oobe-mode-radio" />
            <div>
              <div className="os-oobe-mode-label">{themeItem.label}</div>
              <div className="os-oobe-mode-desc">{themeItem.desc}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render user form
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
        {errors.username && <div className="os-oobe-error">{errors.username}</div>}
      </div>

      <div className="os-oobe-field">
        <label className="os-oobe-label">
          {t('oobe.setPassword')}{' '}
          <span className="os-oobe-optional">({t('oobe.optional')})</span>
        </label>
        <input
          type="password"
          className="os-oobe-input"
          placeholder={t('oobe.passwordPlaceholder')}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>

      <div className="os-oobe-field">
        <label className="os-oobe-label">
          {t('oobe.setSystemName')}{' '}
          <span className="os-oobe-optional">({t('oobe.optional')})</span>
        </label>
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

  // Render mode selection
  const renderMode = () => (
    <div className="os-oobe-content">
      <p className="os-oobe-field-desc">{t('oobe.modeDesc')}</p>

      <div
        className={`os-oobe-mode-card ${!formData.tabletMode ? 'selected' : ''}`}
        onClick={() => setFormData({ ...formData, tabletMode: false })}
      >
        <div className="os-oobe-mode-radio" />
        <div>
          <div className="os-oobe-mode-label">{t('oobe.desktopMode')}</div>
          <div className="os-oobe-mode-desc">{t('oobe.desktopModeDesc')}</div>
        </div>
      </div>

      <div
        className={`os-oobe-mode-card ${formData.tabletMode ? 'selected' : ''}`}
        onClick={() => setFormData({ ...formData, tabletMode: true })}
      >
        <div className="os-oobe-mode-radio" />
        <div>
          <div className="os-oobe-mode-label">{t('oobe.tabletMode')}</div>
          <div className="os-oobe-mode-desc">{t('oobe.tabletModeDesc')}</div>
        </div>
      </div>

      {isTouchDevice && (
        <div className="os-oobe-touch-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          {t('oobe.touchDeviceDetected')}
        </div>
      )}
    </div>
  );

  // Render complete screen
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
      <p className="os-oobe-complete-desc">{t('oobe.ready')}</p>
    </div>
  );

  // Render current step content
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcome();
      case 'language':
        return renderLanguage();
      case 'theme':
        return renderTheme();
      case 'user':
        return renderUserForm();
      case 'mode':
        return renderMode();
      case 'complete':
        return renderComplete();
      default:
        return null;
    }
  };

  // Get step title
  const getTitle = (): string => {
    const titles: Record<Step, string> = {
      welcome: t('oobe.welcome'),
      language: t('oobe.selectLanguage'),
      theme: t('oobe.selectTheme'),
      user: t('oobe.userSetup'),
      mode: t('oobe.selectMode'),
      complete: t('oobe.allSet'),
    };
    return titles[currentStep];
  };

  const isFirstStep = currentStep === 'welcome';
  const isLastStep = currentStep === 'complete';

  // Render
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
            <button
              className="os-oobe-btn"
              onClick={handleBack}
              onMouseMove={handleButtonMouseMove}
              onMouseLeave={handleButtonMouseLeave}
              type="button"
            >
              {t('oobe.back')}
            </button>
          )}

          {isLastStep ? (
            <button
              className="os-oobe-btn primary"
              onClick={handleComplete}
              onMouseMove={handleButtonMouseMove}
              onMouseLeave={handleButtonMouseLeave}
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? <Spinner /> : t('oobe.start')}
            </button>
          ) : (
            <button
              className="os-oobe-btn primary"
              onClick={handleNext}
              onMouseMove={handleButtonMouseMove}
              onMouseLeave={handleButtonMouseLeave}
              type="button"
            >
              {t('oobe.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OOBE;
