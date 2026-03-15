/**
 * @fileoverview OOBE (Out-of-Box Experience) Component
 * @module @oobe
 *
 * First-time setup wizard for WebOS.
 * Guides users through initial configuration steps.
 *
 * @flow
 * ```
 * Welcome → Language → Theme → User Setup → Mode → Complete
 *    ↓         ↓         ↓        ↓         ↓        ↓
 *  Greeting  Locale   Visuals  Account   UX Mode   Finish
 * ```
 *
 * @example
 * ```tsx
 * import { OOBE } from '@oobe';
 *
 * <OOBE
 *   onComplete={(data) => {
 *     console.log('Setup complete:', data);
 *     // Initialize user session
 *   }}
 * />
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { LocaleConfig } from '@kernel/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Data collected during OOBE
 */
interface OOBEData {
  /** User's chosen username */
  username: string;
  /** User's password (optional) */
  password: string;
  /** Selected language code */
  language: string;
  /** Custom system name */
  systemName: string;
  /** Whether to use tablet mode */
  tabletMode: boolean;
  /** Visual theme preference */
  theme: 'light' | 'dark' | 'system';
}

/**
 * OOBE component props
 */
interface OOBEProps {
  /** Called when setup is complete */
  onComplete: (data: OOBEData) => Promise<void>;
}

/**
 * Available setup steps
 */
const STEPS = ['welcome', 'language', 'theme', 'user', 'mode', 'complete'] as const;
type Step = (typeof STEPS)[number];

// ============================================================================
// Spinner Component
// ============================================================================

/**
 * Inline loading spinner with smooth animation.
 */
const SpinnerSVG: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = 'currentColor',
}) => (
  <div style={{ display: 'inline-flex', width: size, height: size }}>
    <svg
      width={size}
      height={size}
      stroke={color}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <g style={{ transformOrigin: 'center', animation: 'oobe-spin 2s linear infinite' }}>
        <circle
          cx="12"
          cy="12"
          r="9.5"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            strokeDasharray: '0 150',
            strokeDashoffset: '0',
            animation: 'oobe-dash 1.5s ease-in-out infinite',
          }}
        />
      </g>
    </svg>
    <style>{`
      @keyframes oobe-spin {
        100% { transform: rotate(360deg); }
      }
      @keyframes oobe-dash {
        0% { stroke-dasharray: 0 150; stroke-dashoffset: 0; }
        47.5% { stroke-dasharray: 42 150; stroke-dashoffset: -16; }
        95%, 100% { stroke-dasharray: 42 150; stroke-dashoffset: -59; }
      }
    `}</style>
  </div>
);

// ============================================================================
// OOBE Component
// ============================================================================

/**
 * Out-of-Box Experience Wizard
 *
 * Walks users through:
 * 1. Welcome screen
 * 2. Language selection
 * 3. Theme preference
 * 4. User account creation
 * 5. Mode selection (desktop/tablet)
 * 6. Completion
 */
export const OOBE: React.FC<OOBEProps> = ({ onComplete }) => {
  // ========================================
  // State
  // ========================================
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState<OOBEData>({
    username: '',
    password: '',
    language: 'en',
    systemName: '',
    tabletMode: false,
    theme: 'system',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locales, setLocales] = useState<LocaleConfig[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [, forceUpdate] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  // ========================================
  // Initialization
  // ========================================
  useEffect(() => {
    // Detect touch device
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(touchSupport);

    // Enable tablet mode by default on touch devices
    if (touchSupport) {
      setFormData((prev) => ({ ...prev, tabletMode: true }));
    }

    if (window.webos) {
      // Load available locales
      setLocales(window.webos.i18n.getAvailableLocales());

      // Set initial language
      const currentLocale = window.webos.i18n.getCurrentLocale();
      if (currentLocale) {
        setFormData((prev) => ({ ...prev, language: currentLocale }));
      }

      // Subscribe to locale changes
      const unsubscribe = window.webos.i18n.onLocaleChange(() => {
        forceUpdate((n) => n + 1);
      });

      return unsubscribe;
    }
    return undefined;
  }, []);

  // ========================================
  // Helpers
  // ========================================

  /**
   * Translation helper
   */
  const t = useCallback((key: string): string => {
    return window.webos?.t(key) || key;
  }, []);

  /**
   * Validates current step
   */
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

  /**
   * Applies theme immediately for preview
   */
  const applyTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, []);

  // ========================================
  // Navigation
  // ========================================

  const handleNext = useCallback(() => {
    if (!validateStep()) return;

    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1];
      if (nextStep) setCurrentStep(nextStep);
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = STEPS[currentIndex - 1];
      if (prevStep) setCurrentStep(prevStep);
    }
  }, [currentStep]);

  const handleComplete = useCallback(async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      // Save tablet mode preference
      if (formData.tabletMode) {
        document.documentElement.classList.add('os-tablet-mode');
        localStorage.setItem('webos-tablet-mode', 'true');
      }

      // Save theme preference
      localStorage.setItem('webos-theme', formData.theme);
      if (window.webos) {
        window.webos.config.set('theme', formData.theme);
      }

      await onComplete(formData);
    } catch (error) {
      console.error('[OOBE] Complete error:', error);
      setIsCompleting(false);
    }
  }, [formData, isCompleting, onComplete]);

  // ========================================
  // Step Renderers
  // ========================================

  const renderStepIndicator = () => (
    <div className="os-oobe-steps">
      {STEPS.map((step, index) => (
        <div
          key={step}
          className={`os-oobe-step ${
            STEPS.indexOf(currentStep) === index ? 'active' : ''
          } ${STEPS.indexOf(currentStep) > index ? 'completed' : ''}`}
        />
      ))}
    </div>
  );

  const renderWelcome = () => (
    <div className="os-oobe-content">
      <div className="os-oobe-welcome">
        <svg width="120" height="45" viewBox="0 0 120 45">
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="currentColor"
            fontSize="28"
            fontWeight="300"
            letterSpacing="-1"
          >
            {__OS_NAME__}
          </text>
        </svg>
        <p className="os-oobe-welcome-desc">{t('oobe.welcomeDesc')}</p>
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
            // Apply language immediately
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
      {
        id: 'light' as const,
        icon: '☀️',
        label: t('settings.themeLight'),
        desc: t('oobe.themeLightDesc'),
      },
      {
        id: 'dark' as const,
        icon: '🌙',
        label: t('settings.themeDark'),
        desc: t('oobe.themeDarkDesc'),
      },
      {
        id: 'system' as const,
        icon: '💻',
        label: t('settings.themeSystem'),
        desc: t('oobe.themeSystemDesc'),
      },
    ];

    return (
      <div className="os-oobe-content">
        <div className="os-oobe-field">
          <label className="os-oobe-label">{t('oobe.selectTheme')}</label>
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
      </div>
    );
  };

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
          {t('oobe.setPassword')}
          <span className="os-oobe-optional">({t('oobe.optional')})</span>
        </label>
        <input
          type="password"
          className="os-oobe-input"
          placeholder={t('oobe.passwordPlaceholder')}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        {errors.password && <div className="os-oobe-error">{errors.password}</div>}
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

  const renderModeSelect = () => (
    <div className="os-oobe-content">
      <div className="os-oobe-field">
        <label className="os-oobe-label">{t('oobe.selectMode')}</label>
        <p className="os-oobe-field-desc">{t('oobe.modeDesc')}</p>

        {/* Desktop Mode */}
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

        {/* Tablet Mode */}
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
          <p className="os-oobe-touch-hint">{t('oobe.touchDeviceDetected')}</p>
        )}
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="os-oobe-content">
      <div className="os-oobe-complete">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="os-oobe-check-icon"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p className="os-oobe-complete-desc">{t('oobe.start')}</p>
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
    const titles: Record<Step, string> = {
      welcome: t('oobe.welcome'),
      language: t('oobe.selectLanguage'),
      theme: t('oobe.selectTheme'),
      user: t('oobe.setUsername'),
      mode: t('oobe.selectMode'),
      complete: t('oobe.ready'),
    };
    return titles[currentStep];
  };

  // ========================================
  // Render
  // ========================================
  const isFirstStep = currentStep === 'welcome';
  const isLastStep = currentStep === 'complete';

  return (
    <div className="os-oobe">
      {/* Background Wallpaper */}
      <div className="os-wallpaper os-wallpaper-oobe" />

      {/* Main Container */}
      <div className="os-oobe-container">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Header */}
        <div className="os-oobe-header">
          <h1 className="os-oobe-title">{getStepTitle()}</h1>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="os-oobe-actions">
          {!isFirstStep && (
            <button className="os-oobe-btn" onClick={handleBack} type="button">
              {t('oobe.back')}
            </button>
          )}

          {isLastStep ? (
            <button
              className="os-oobe-btn primary"
              onClick={handleComplete}
              disabled={isCompleting}
              type="button"
            >
              {isCompleting ? (
                <SpinnerSVG size={20} color="currentColor" />
              ) : (
                t('oobe.start')
              )}
            </button>
          ) : (
            <button className="os-oobe-btn primary" onClick={handleNext} type="button">
              {t('oobe.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OOBE;
