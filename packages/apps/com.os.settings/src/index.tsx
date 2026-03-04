/**
 * 设置应用
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './styles.css';
import { SettingsIcon } from './icon';
import type { LocaleConfig } from '@kernel/types';
import type { WallpaperType } from '@ui';

interface SettingsProps {
  windowId?: string;
}

type SettingsSection = 'system' | 'language' | 'display' | 'wallpaper' | 'recovery' | 'about';

export const Settings: React.FC<SettingsProps> = () => {
  const [currentSection, setCurrentSection] = useState<SettingsSection>('system');
  const [systemName, setSystemName] = useState(__OS_NAME__);
  const [currentLocale, setCurrentLocale] = useState('en');
  const [locales, setLocales] = useState<LocaleConfig[]>([]);
  const [tabletMode, setTabletMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  
  const [wallpaperType, setWallpaperType] = useState<WallpaperType>('soft');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const t = useCallback((key: string): string => {
    return window.webos?.t(key) || key;
  }, []);

  useEffect(() => {
    if (window.webos) {
      setSystemName(window.webos.config.getSystemName());
      setCurrentLocale(window.webos.i18n.getCurrentLocale());
      setLocales(window.webos.i18n.getAvailableLocales());
    }
    
    const savedTabletMode = localStorage.getItem('webos-tablet-mode');
    if (savedTabletMode) setTabletMode(savedTabletMode === 'true');
    
    const savedTheme = localStorage.getItem('webos-theme');
    if (savedTheme) setTheme(savedTheme as 'light' | 'dark' | 'system');
    
    const savedWallpaperType = localStorage.getItem('webos-wallpaper-type') as WallpaperType;
    if (savedWallpaperType) setWallpaperType(savedWallpaperType);
  }, []);

  const handleSystemNameChange = (name: string) => {
    setSystemName(name);
    window.webos?.config.setSystemName(name);
  };

  const handleLanguageChange = (locale: string) => {
    setCurrentLocale(locale);
    window.webos?.i18n.setLocale(locale);
    window.location.reload();
  };

  const handleTabletModeChange = (enabled: boolean) => {
    setTabletMode(enabled);
    localStorage.setItem('webos-tablet-mode', String(enabled));
    if (enabled) {
      document.documentElement.classList.add('os-tablet-mode');
    } else {
      document.documentElement.classList.remove('os-tablet-mode');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('webos-theme', newTheme);
    const html = document.documentElement;
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
  };

  const handleWallpaperChange = (type: WallpaperType) => {
    setWallpaperType(type);
    localStorage.setItem('webos-wallpaper-type', type);
    window.dispatchEvent(new CustomEvent('wallpaper:change', { detail: { type } }));
  };

  const handleResetSystem = async () => {
    localStorage.clear();
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
    }
    setShowConfirmReset(false);
    window.location.reload();
  };

  const navItems: { id: SettingsSection; label: string }[] = [
    { id: 'system', label: t('settings.system') },
    { id: 'language', label: t('settings.language') },
    { id: 'display', label: t('settings.display') },
    { id: 'wallpaper', label: t('settings.wallpaper') },
    { id: 'recovery', label: t('settings.recovery') },
    { id: 'about', label: t('settings.about') },
  ];

  const renderNavItem = (item: typeof navItems[0]) => (
    <div
      key={item.id}
      onClick={() => setCurrentSection(item.id)}
      className={`settings-nav-item ${currentSection === item.id ? 'active' : ''}`}
    >
      <span>{item.label}</span>
    </div>
  );

  const renderSystemSection = () => (
    <div className="settings-section">
      <h2 className="settings-title">{t('settings.system')}</h2>
      
      <div className="settings-group">
        <label className="settings-label">{t('settings.systemName')}</label>
        <input
          type="text"
          className="settings-input"
          value={systemName}
          onChange={(e) => handleSystemNameChange(e.target.value)}
        />
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.tabletMode')}</label>
        <div className="settings-toggle" onClick={() => handleTabletModeChange(!tabletMode)}>
          <div className={`toggle-track ${tabletMode ? 'active' : ''}`}>
            <div className="toggle-thumb" />
          </div>
          <span>{tabletMode ? t('common.enabled') : t('common.disabled')}</span>
        </div>
      </div>
    </div>
  );

  const renderLanguageSection = () => (
    <div className="settings-section">
      <h2 className="settings-title">{t('settings.language')}</h2>
      
      <div className="settings-group">
        <label className="settings-label">{t('settings.selectLanguage')}</label>
        <div className="language-list">
          {locales.map((locale) => (
            <div
              key={locale.code}
              className={`language-item ${currentLocale === locale.code ? 'selected' : ''}`}
              onClick={() => handleLanguageChange(locale.code)}
            >
              <div className={`radio ${currentLocale === locale.code ? 'checked' : ''}`} />
              <div className="language-info">
                <div className="language-native">{locale.nativeName}</div>
                <div className="language-name">{locale.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDisplaySection = () => (
    <div className="settings-section">
      <h2 className="settings-title">{t('settings.display')}</h2>
      
      <div className="settings-group">
        <label className="settings-label">{t('settings.theme')}</label>
        <div className="theme-options">
          {(['light', 'dark', 'system'] as const).map(themeValue => (
            <div
              key={themeValue}
              className={`theme-item ${theme === themeValue ? 'selected' : ''}`}
              onClick={() => handleThemeChange(themeValue)}
            >
              <span>{t(`settings.theme${themeValue.charAt(0).toUpperCase() + themeValue.slice(1)}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWallpaperSection = () => (
    <div className="settings-section">
      <h2 className="settings-title">{t('settings.wallpaper')}</h2>
      
      <div className="settings-group">
        <label className="settings-label">{t('settings.wallpaperPreset')}</label>
        <div className="wallpaper-grid">
          {['soft', 'animated', 'sunrise', 'ocean', 'forest'].map(type => (
            <div
              key={type}
              className={`wallpaper-thumbnail wallpaper-thumbnail-${type} ${wallpaperType === type ? 'selected' : ''}`}
              onClick={() => handleWallpaperChange(type as WallpaperType)}
            >
              <span>{t(`settings.wallpaper${type.charAt(0).toUpperCase() + type.slice(1)}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecoverySection = () => (
    <div className="settings-section">
      <h2 className="settings-title">{t('settings.recovery')}</h2>
      
      <div className="settings-group warning">
        <label className="settings-label">{t('settings.resetSystem')}</label>
        <p className="settings-hint">{t('settings.resetWarning')}</p>
        
        {!showConfirmReset ? (
          <button className="settings-button danger" onClick={() => setShowConfirmReset(true)}>
            {t('settings.resetSystem')}
          </button>
        ) : (
          <div className="confirm-reset">
            <p>{t('settings.resetConfirm')}</p>
            <div className="confirm-buttons">
              <button className="settings-button secondary" onClick={() => setShowConfirmReset(false)}>
                {t('common.cancel')}
              </button>
              <button className="settings-button danger" onClick={handleResetSystem}>
                {t('settings.confirmReset')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAboutSection = () => (
    <div className="settings-section">
      <h2 className="settings-title">{t('settings.about')}</h2>
      
      <div className="about-info">
        <div className="info-row">
          <span>{t('about.systemName')}</span>
          <span>{systemName}</span>
        </div>
        <div className="info-row">
          <span>{t('about.version')}</span>
          <span>{__OS_VERSION__}</span>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'system': return renderSystemSection();
      case 'language': return renderLanguageSection();
      case 'display': return renderDisplaySection();
      case 'wallpaper': return renderWallpaperSection();
      case 'recovery': return renderRecoverySection();
      case 'about': return renderAboutSection();
      default: return renderSystemSection();
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-nav">
        <div className="settings-nav-header">
          <span>{t('app.settings')}</span>
        </div>
        <div className="settings-nav-list">
          {navItems.map(renderNavItem)}
        </div>
      </div>

      <div className="settings-content">
        {renderContent()}
      </div>
    </div>
  );
};

// 应用信息
export const appInfo = {
  id: 'com.os.settings',
  name: 'Settings',
  nameKey: 'app.settings',
  description: 'System settings',
  version: '1.0.0',
  category: 'system' as const,
  icon: SettingsIcon,
  component: Settings,
  defaultWidth: 800,
  defaultHeight: 500,
  minWidth: 600,
  minHeight: 400,
  singleton: true,
};

export default Settings;
