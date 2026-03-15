// 设置应用 - 完整版

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './styles.css';
import type { LocaleConfig } from '@kernel/types';
import type { WallpaperType } from '@ui';
import type { TaskbarDisplayMode } from '@ui/components/Taskbar';
import { SettingsIcon } from './icon';
import type { AppInfo } from '../../types';

// 更新管理器类型
interface UpdateManager {
  init: () => void;
  checkForUpdate: () => Promise<void>;
  setAutoUpdate: (enabled: boolean) => void;
  getConfig: () => { autoUpdate: boolean };
  subscribe: (callback: (status: { hasUpdate: boolean; isChecking: boolean; isUpdating: boolean; currentVersion: string; latestVersion: string | null }) => void) => () => void;
  getStatus: () => { hasUpdate: boolean; isChecking: boolean; isUpdating: boolean; currentVersion: string; latestVersion: string | null };
}

// 获取更新管理器
const getUpdateManager = (): UpdateManager => {
  return (window as unknown as { updateManager?: UpdateManager }).updateManager || {
    init: () => {},
    checkForUpdate: async () => {},
    setAutoUpdate: () => {},
    getConfig: () => ({ autoUpdate: true }),
    subscribe: () => () => {},
    getStatus: () => ({ hasUpdate: false, isChecking: false, isUpdating: false, currentVersion: '0.0.1-alpha', latestVersion: null })
  };
};

const updateManager = getUpdateManager();

interface SettingsProps {
  windowId?: string;
}

type SettingsSection = 'system' | 'language' | 'datetime' | 'display' | 'wallpaper' | 'storage' | 'recovery' | 'about';

// 预设壁纸列表
const PRESET_WALLPAPERS: { id: WallpaperType; thumbnailClass: string; labelKey: string }[] = [
  { id: 'soft', thumbnailClass: 'wallpaper-thumbnail-soft', labelKey: 'settings.wallpaperSoft' },
  { id: 'animated', thumbnailClass: 'wallpaper-thumbnail-animated', labelKey: 'settings.wallpaperAnimated' },
  { id: 'sunrise', thumbnailClass: 'wallpaper-thumbnail-sunrise', labelKey: 'settings.wallpaperSunrise' },
  { id: 'ocean', thumbnailClass: 'wallpaper-thumbnail-ocean', labelKey: 'settings.wallpaperOcean' },
  { id: 'forest', thumbnailClass: 'wallpaper-thumbnail-forest', labelKey: 'settings.wallpaperForest' },
  { id: 'catgirl-static', thumbnailClass: 'wallpaper-thumbnail-catgirl-static', labelKey: 'settings.wallpaperCatgirlStatic' },
  { id: 'catgirl-animated', thumbnailClass: 'wallpaper-thumbnail-catgirl-animated', labelKey: 'settings.wallpaperCatgirlAnimated' },
];

// 时区列表
const TIMEZONES = [
  { id: 'UTC-12', name: 'UTC-12:00', label: 'Baker Island' },
  { id: 'UTC-11', name: 'UTC-11:00', label: 'Samoa' },
  { id: 'UTC-10', name: 'UTC-10:00', label: 'Hawaii' },
  { id: 'UTC-9', name: 'UTC-09:00', label: 'Alaska' },
  { id: 'UTC-8', name: 'UTC-08:00', label: 'Pacific Time (LA)' },
  { id: 'UTC-7', name: 'UTC-07:00', label: 'Mountain Time (Denver)' },
  { id: 'UTC-6', name: 'UTC-06:00', label: 'Central Time (Chicago)' },
  { id: 'UTC-5', name: 'UTC-05:00', label: 'Eastern Time (New York)' },
  { id: 'UTC-4', name: 'UTC-04:00', label: 'Atlantic Time' },
  { id: 'UTC-3', name: 'UTC-03:00', label: 'Brazil, Argentina' },
  { id: 'UTC-2', name: 'UTC-02:00', label: 'Mid-Atlantic' },
  { id: 'UTC-1', name: 'UTC-01:00', label: 'Azores' },
  { id: 'UTC+0', name: 'UTC+00:00', label: 'London, Dublin' },
  { id: 'UTC+1', name: 'UTC+01:00', label: 'Paris, Berlin, Rome' },
  { id: 'UTC+2', name: 'UTC+02:00', label: 'Cairo, Athens' },
  { id: 'UTC+3', name: 'UTC+03:00', label: 'Moscow, Istanbul' },
  { id: 'UTC+4', name: 'UTC+04:00', label: 'Dubai' },
  { id: 'UTC+5', name: 'UTC+05:00', label: 'Karachi' },
  { id: 'UTC+5:30', name: 'UTC+05:30', label: 'Mumbai, New Delhi' },
  { id: 'UTC+6', name: 'UTC+06:00', label: 'Dhaka' },
  { id: 'UTC+7', name: 'UTC+07:00', label: 'Bangkok, Jakarta' },
  { id: 'UTC+8', name: 'UTC+08:00', label: 'Beijing, Shanghai, Taipei' },
  { id: 'UTC+9', name: 'UTC+09:00', label: 'Tokyo, Seoul' },
  { id: 'UTC+10', name: 'UTC+10:00', label: 'Sydney, Melbourne' },
  { id: 'UTC+11', name: 'UTC+11:00', label: 'Solomon Islands' },
  { id: 'UTC+12', name: 'UTC+12:00', label: 'Auckland, Fiji' },
];

// 日期格式
const DATE_FORMATS = [
  { id: 'YYYY-MM-DD', label: '2026-03-05' },
  { id: 'DD/MM/YYYY', label: '05/03/2026' },
  { id: 'MM/DD/YYYY', label: '03/05/2026' },
  { id: 'DD-MM-YYYY', label: '05-03-2026' },
];

// 时间格式
const TIME_FORMATS = [
  { id: '24h', label: '24-hour (14:30)' },
  { id: '12h', label: '12-hour (2:30 PM)' },
];

export const Settings: React.FC<SettingsProps> = () => {
  const [currentSection, setCurrentSection] = useState<SettingsSection>('system');
  const [systemName, setSystemName] = useState(__OS_NAME__);
  const [currentLocale, setCurrentLocale] = useState('en');
  const [locales, setLocales] = useState<LocaleConfig[]>([]);
  const [timezone, setTimezone] = useState('UTC+8');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [tabletMode, setTabletMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [fontSize, setFontSize] = useState('medium');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 50 * 1024 * 1024 });
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<{ isChecking: boolean; lastCheckTime: number | null }>({
    isChecking: false,
    lastCheckTime: null
  });
  
  // 壁纸状态
  const [wallpaperType, setWallpaperType] = useState<WallpaperType>('soft');
  const [customWallpaper, setCustomWallpaper] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // 任务栏显示模式
  const [taskbarDisplayMode, setTaskbarDisplayMode] = useState<TaskbarDisplayMode>('icon-name');

  const t = useCallback((key: string): string => {
    return window.webos?.t(key) || key;
  }, []);

  useEffect(() => {
    if (window.webos) {
      setSystemName(window.webos.config.getSystemName());
      setCurrentLocale(window.webos.i18n.getCurrentLocale());
      setLocales(window.webos.i18n.getAvailableLocales());
    }
    
    // 加载保存的设置
    const savedTimezone = localStorage.getItem('webos-timezone');
    if (savedTimezone) setTimezone(savedTimezone);
    
    const savedDateFormat = localStorage.getItem('webos-dateFormat');
    if (savedDateFormat) setDateFormat(savedDateFormat);
    
    const savedTimeFormat = localStorage.getItem('webos-timeFormat');
    if (savedTimeFormat) setTimeFormat(savedTimeFormat);
    
    const savedTabletMode = localStorage.getItem('webos-tablet-mode');
    if (savedTabletMode) setTabletMode(savedTabletMode === 'true');
    
    const savedTheme = localStorage.getItem('webos-theme');
    if (savedTheme) setTheme(savedTheme as 'light' | 'dark' | 'system');
    
    const savedFontSize = localStorage.getItem('webos-fontSize');
    if (savedFontSize) setFontSize(savedFontSize);
    
    // 加载壁纸设置
    const savedWallpaperType = localStorage.getItem('webos-wallpaper-type') as WallpaperType;
    if (savedWallpaperType) setWallpaperType(savedWallpaperType);
    
    const savedCustomWallpaper = localStorage.getItem('webos-wallpaper-custom');
    if (savedCustomWallpaper) {
      try {
        setCustomWallpaper(JSON.parse(savedCustomWallpaper));
      } catch {
        // ignore
      }
    }
    
    // 加载任务栏显示模式
    const savedTaskbarMode = localStorage.getItem('webos-taskbar-display-mode') as TaskbarDisplayMode;
    if (savedTaskbarMode) setTaskbarDisplayMode(savedTaskbarMode);
    
    // 加载自动更新设置
    const savedAutoUpdate = localStorage.getItem('webos-auto-update');
    if (savedAutoUpdate !== null) {
      const enabled = savedAutoUpdate === 'true';
      setAutoUpdateEnabled(enabled);
      updateManager.setAutoUpdate(enabled);
    } else {
      // 使用默认值
      setAutoUpdateEnabled(updateManager.getConfig().autoUpdate);
    }
    
    // 加载上次检查更新时间
    const savedLastCheckTime = localStorage.getItem('webos-last-check-time');
    if (savedLastCheckTime) {
      setUpdateStatus(prev => ({ ...prev, lastCheckTime: parseInt(savedLastCheckTime, 10) }));
    }
    
    // 计算存储使用
    calculateStorage();
  }, []);

  const calculateStorage = () => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        total += localStorage.getItem(key)?.length || 0;
      }
    }
    total *= 2; // UTF-16
    setStorageInfo({ used: total, total: 50 * 1024 * 1024 });
  };

  const handleSystemNameChange = (name: string) => {
    setSystemName(name);
    window.webos?.config.setSystemName(name);
  };

  const handleLanguageChange = (locale: string) => {
    setCurrentLocale(locale);
    window.webos?.i18n.setLocale(locale);
    window.location.reload();
  };

  const handleTimezoneChange = (tz: string) => {
    setTimezone(tz);
    localStorage.setItem('webos-timezone', tz);
  };

  const handleDateFormatChange = (format: string) => {
    setDateFormat(format);
    localStorage.setItem('webos-dateFormat', format);
  };

  const handleTimeFormatChange = (format: string) => {
    setTimeFormat(format);
    localStorage.setItem('webos-timeFormat', format);
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
    applyTheme(newTheme);
  };

  const applyTheme = (newTheme: string) => {
    const html = document.documentElement;
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    localStorage.setItem('webos-fontSize', size);
    const sizes: Record<string, string> = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    document.documentElement.style.fontSize = sizes[size] || '16px';
  };

  // 壁纸设置
  const handleWallpaperChange = (type: WallpaperType) => {
    setWallpaperType(type);
    setCustomWallpaper(null);
    localStorage.setItem('webos-wallpaper-type', type);
    localStorage.removeItem('webos-wallpaper-custom');
    // 触发壁纸更新事件
    window.dispatchEvent(new CustomEvent('wallpaper:change', { 
      detail: { type } 
    }));
  };

  const handleFileUpload = (type: 'image' | 'video') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const customWallpaperData = { type, url };
      setCustomWallpaper(customWallpaperData);
      setWallpaperType('image'); // 使用 image 类型，但 URL 可能是视频
      localStorage.setItem('webos-wallpaper-type', type === 'video' ? 'video' : 'image');
      localStorage.setItem('webos-wallpaper-custom', JSON.stringify(customWallpaperData));
      
      // 触发壁纸更新事件
      window.dispatchEvent(new CustomEvent('wallpaper:change', { 
        detail: { 
          type: type === 'video' ? 'video' : 'image', 
          url 
        } 
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomWallpaper = () => {
    setCustomWallpaper(null);
    setWallpaperType('soft');
    localStorage.setItem('webos-wallpaper-type', 'soft');
    localStorage.removeItem('webos-wallpaper-custom');
    window.dispatchEvent(new CustomEvent('wallpaper:change', { 
      detail: { type: 'soft' } 
    }));
  };

  // 任务栏显示模式设置
  const handleTaskbarDisplayModeChange = (mode: TaskbarDisplayMode) => {
    setTaskbarDisplayMode(mode);
    localStorage.setItem('webos-taskbar-display-mode', mode);
    // 触发任务栏显示模式更新事件
    window.dispatchEvent(new CustomEvent('taskbar:display-mode-change', { 
      detail: { mode } 
    }));
  };

  const handleCheckUpdate = async () => {
    if (updateStatus.isChecking) return;
    
    setUpdateStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      await updateManager.checkForUpdate();
    } finally {
      const now = Date.now();
      localStorage.setItem('webos-last-check-time', String(now));
      setUpdateStatus({ isChecking: false, lastCheckTime: now });
    }
  };

  const handleClearCache = () => {
    // 清除缓存但保留重要设置
    const importantKeys = ['webos-boot', 'webos-config', 'webos-timezone', 'webos-theme', 'webos-tablet-mode', 'webos-wallpaper-type', 'webos-wallpaper-custom'];
    const preserved: Record<string, string> = {};
    
    importantKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) preserved[key] = value;
    });
    
    localStorage.clear();
    
    Object.entries(preserved).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    // 清除 caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    calculateStorage();
    window.webos?.notify.show(t('settings.cacheCleared'), t('settings.cacheClearedDesc'));
  };

  const handleResetSystem = async () => {
    // 清除所有数据
    localStorage.clear();
    sessionStorage.clear();
    
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
      }
    }
    
    setShowConfirmReset(false);
    window.location.reload();
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // 导航项
  const navItems: { id: SettingsSection; icon: React.ReactNode; label: string }[] = [
    { id: 'system', icon: <SystemIcon />, label: t('settings.system') },
    { id: 'language', icon: <LanguageIcon />, label: t('settings.language') },
    { id: 'datetime', icon: <DateTimeIcon />, label: t('settings.dateTime') },
    { id: 'display', icon: <DisplayIcon />, label: t('settings.display') },
    { id: 'wallpaper', icon: <WallpaperIcon />, label: t('settings.wallpaper') },
    { id: 'storage', icon: <StorageIcon />, label: t('settings.storage') },
    { id: 'recovery', icon: <RecoveryIcon />, label: t('settings.recovery') },
    { id: 'about', icon: <AboutIcon />, label: t('settings.about') },
  ];

  const renderNavItem = (item: typeof navItems[0]) => (
    <div
      key={item.id}
      onClick={() => setCurrentSection(item.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        cursor: 'pointer',
        background: currentSection === item.id ? 'rgba(0, 120, 212, 0.1)' : 'transparent',
        borderLeft: currentSection === item.id ? '3px solid var(--os-color-primary)' : '3px solid transparent',
        transition: 'all 0.15s ease'
      }}
    >
      {item.icon}
      <span>{item.label}</span>
    </div>
  );

  // 系统设置
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
          placeholder={__OS_NAME__}
        />
        <p className="settings-hint">{t('settings.systemNameHint')}</p>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.tabletMode')}</label>
        <div className="settings-toggle" onClick={() => handleTabletModeChange(!tabletMode)}>
          <div className={`toggle-track ${tabletMode ? 'active' : ''}`}>
            <div className="toggle-thumb" />
          </div>
          <span className="toggle-label">{tabletMode ? t('common.enabled') : t('common.disabled')}</span>
        </div>
        <p className="settings-hint">{t('settings.tabletModeHint')}</p>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.autoUpdate')}</label>
        <div className="settings-toggle" onClick={() => {
          const newEnabled = !autoUpdateEnabled;
          setAutoUpdateEnabled(newEnabled);
          updateManager.setAutoUpdate(newEnabled);
        }}>
          <div className={`toggle-track ${autoUpdateEnabled ? 'active' : ''}`}>
            <div className="toggle-thumb" />
          </div>
          <span className="toggle-label">{autoUpdateEnabled ? t('common.enabled') : t('common.disabled')}</span>
        </div>
        <p className="settings-hint">{t('settings.autoUpdateHint')}</p>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.currentVersion')}</label>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginTop: '8px'
        }}>
          <span style={{ 
            fontFamily: 'monospace',
            fontSize: '14px',
            color: 'var(--os-color-text)'
          }}>
            v{__OS_VERSION__}
          </span>
          <button
            className="settings-button secondary"
            onClick={handleCheckUpdate}
            disabled={updateStatus.isChecking}
            style={{
              padding: '6px 12px',
              fontSize: '13px'
            }}
          >
            {updateStatus.isChecking ? t('settings.checking') : t('settings.checkUpdate')}
          </button>
        </div>
        {updateStatus.lastCheckTime && (
          <p className="settings-hint" style={{ marginTop: '4px' }}>
            {t('settings.lastCheckTime')}: {new Date(updateStatus.lastCheckTime).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );

  // 语言设置
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

  // 日期时间设置
  const renderDateTimeSection = () => (
    <div className="settings-section">
      <h2 className="settings-title">{t('settings.dateTime')}</h2>
      
      <div className="settings-group">
        <label className="settings-label">{t('settings.timezone')}</label>
        <select
          className="settings-select"
          value={timezone}
          onChange={(e) => handleTimezoneChange(e.target.value)}
        >
          {TIMEZONES.map(tz => (
            <option key={tz.id} value={tz.id}>
              {tz.name} - {tz.label}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.dateFormat')}</label>
        <div className="radio-group">
          {DATE_FORMATS.map(format => (
            <div
              key={format.id}
              className={`radio-item ${dateFormat === format.id ? 'selected' : ''}`}
              onClick={() => handleDateFormatChange(format.id)}
            >
              <div className={`radio ${dateFormat === format.id ? 'checked' : ''}`} />
              <span>{format.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.timeFormat')}</label>
        <div className="radio-group">
          {TIME_FORMATS.map(format => (
            <div
              key={format.id}
              className={`radio-item ${timeFormat === format.id ? 'selected' : ''}`}
              onClick={() => handleTimeFormatChange(format.id)}
            >
              <div className={`radio ${timeFormat === format.id ? 'checked' : ''}`} />
              <span>{format.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.currentTime')}</label>
        <div className="time-preview">
          {formatCurrentTime()}
        </div>
      </div>
    </div>
  );

  const formatCurrentTime = () => {
    const now = new Date();
    const dateStr = dateFormat
      .replace('YYYY', now.getFullYear().toString())
      .replace('MM', (now.getMonth() + 1).toString().padStart(2, '0'))
      .replace('DD', now.getDate().toString().padStart(2, '0'));
    
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    if (timeFormat === '24h') {
      return `${dateStr} ${hours}:${minutes}`;
    } else {
      const h = hours % 12 || 12;
      const ampm = hours < 12 ? 'AM' : 'PM';
      return `${dateStr} ${h}:${minutes} ${ampm}`;
    }
  };

  // 显示设置
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
              <div className={`theme-preview ${themeValue}`}>
                {themeValue === 'light' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                )}
                {themeValue === 'dark' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
                {themeValue === 'system' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                )}
              </div>
              <span>{t('settings.theme' + themeValue.charAt(0).toUpperCase() + themeValue.slice(1))}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.fontSize')}</label>
        <div className="font-size-options">
          {(['small', 'medium', 'large', 'xlarge'] as const).map(size => (
            <div
              key={size}
              className={`font-size-item ${fontSize === size ? 'selected' : ''}`}
              onClick={() => handleFontSizeChange(size)}
            >
              <span style={{ fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : size === 'xlarge' ? '22px' : '16px' }}>
                Aa
              </span>
              <span className="font-size-label">{t('settings.fontSize' + size.charAt(0).toUpperCase() + size.slice(1))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 任务栏显示模式 */}
      <div className="settings-group">
        <label className="settings-label">{t('settings.taskbarDisplayMode')}</label>
        <p className="settings-hint">{t('settings.taskbarDisplayModeHint')}</p>
        <div className="radio-group" style={{ marginTop: '12px' }}>
          {([
            { id: 'icon-name', label: t('settings.taskbarModeIconName') },
            { id: 'icon-only', label: t('settings.taskbarModeIconOnly') },
            { id: 'name-only', label: t('settings.taskbarModeNameOnly') }
          ] as const).map(mode => (
            <div
              key={mode.id}
              className={`radio-item ${taskbarDisplayMode === mode.id ? 'selected' : ''}`}
              onClick={() => handleTaskbarDisplayModeChange(mode.id)}
            >
              <div className={`radio ${taskbarDisplayMode === mode.id ? 'checked' : ''}`} />
              <span>{mode.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 壁纸设置
  const renderWallpaperSection = () => (
    <div className="settings-section">
      <h2 className="settings-title">{t('settings.wallpaper')}</h2>
      <p className="settings-hint" style={{ marginTop: '-8px', marginBottom: '16px' }}>
        {t('settings.wallpaperDesc')}
      </p>
      
      {/* 预设壁纸 */}
      <div className="settings-group">
        <label className="settings-label">{t('settings.wallpaperPreset')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
          {PRESET_WALLPAPERS.map(wp => (
            <div
              key={wp.id}
              className={`wallpaper-thumbnail ${wp.thumbnailClass} ${wallpaperType === wp.id && !customWallpaper ? 'selected' : ''}`}
              onClick={() => handleWallpaperChange(wp.id)}
            >
              <span className="wallpaper-thumbnail-label">{t(wp.labelKey)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 自定义壁纸 */}
      <div className="settings-group">
        <label className="settings-label">{t('settings.wallpaperCustom')}</label>
        <p className="settings-hint">{t('settings.wallpaperSupportedFormats')}</p>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          {/* 上传图片按钮 */}
          <div 
            className="wallpaper-thumbnail wallpaper-thumbnail-custom"
            onClick={() => imageInputRef.current?.click()}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="wallpaper-thumbnail-label">{t('settings.wallpaperUploadImage')}</span>
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileUpload('image')}
          />
          
          {/* 上传视频按钮 */}
          <div 
            className="wallpaper-thumbnail wallpaper-thumbnail-custom"
            onClick={() => videoInputRef.current?.click()}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <span className="wallpaper-thumbnail-label">{t('settings.wallpaperUploadVideo')}</span>
          </div>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm"
            style={{ display: 'none' }}
            onChange={handleFileUpload('video')}
          />
        </div>

        {/* 当前自定义壁纸预览 */}
        {customWallpaper && (
          <div style={{ marginTop: '16px' }}>
            <label className="settings-label">{t('settings.wallpaperCurrent')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <div 
                className="wallpaper-thumbnail selected"
                style={{ 
                  backgroundImage: customWallpaper.type === 'image' ? `url(${customWallpaper.url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {customWallpaper.type === 'video' && (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                )}
                <span className="wallpaper-thumbnail-label">
                  {customWallpaper.type === 'image' ? 'Image' : 'Video'}
                </span>
              </div>
              <button 
                className="settings-button secondary"
                onClick={handleRemoveCustomWallpaper}
              >
                {t('settings.wallpaperRemove')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 存储设置
  const renderStorageSection = () => (
    <div className="settings-section">
      <h2 className="settings-title">{t('settings.storage')}</h2>
      
      <div className="settings-group">
        <label className="settings-label">{t('settings.storageUsage')}</label>
        <div className="storage-bar">
          <div 
            className="storage-used" 
            style={{ width: `${(storageInfo.used / storageInfo.total) * 100}%` }}
          />
        </div>
        <div className="storage-info">
          <span>{t('settings.used')}: {formatBytes(storageInfo.used)}</span>
          <span>{t('settings.available')}: {formatBytes(storageInfo.total - storageInfo.used)}</span>
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.cacheManagement')}</label>
        <p className="settings-hint">{t('settings.cacheHint')}</p>
        <button className="settings-button secondary" onClick={handleClearCache}>
          {t('settings.clearCache')}
        </button>
      </div>
    </div>
  );

  // 恢复设置
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
            <p className="confirm-text">{t('settings.resetConfirm')}</p>
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

      <div className="settings-group">
        <label className="settings-label">{t('settings.restartSystem')}</label>
        <p className="settings-hint">{t('settings.restartHint')}</p>
        <button className="settings-button" onClick={() => window.location.reload()}>
          {t('settings.restart')}
        </button>
      </div>
    </div>
  );

  // 关于
  const renderAboutSection = () => (
    <div className="settings-section">
      <h2 className="settings-title">{t('settings.about')}</h2>
      
      <div className="about-header">
        <svg width="64" height="24" viewBox="0 0 64 24">
          <text 
            x="50%" 
            y="50%" 
            dominantBaseline="middle" 
            textAnchor="middle"
            fill="currentColor"
            fontSize="20"
            fontWeight="300"
          >
            {systemName}
          </text>
        </svg>
      </div>

      <div className="about-info">
        <div className="info-row">
          <span className="info-label">{t('about.systemName')}</span>
          <span className="info-value">{systemName}</span>
        </div>
        <div className="info-row">
          <span className="info-label">{t('about.version')}</span>
          <span className="info-value">{__OS_VERSION__}</span>
        </div>
        <div className="info-row">
          <span className="info-label">{t('about.buildTime')}</span>
          <span className="info-value">{__BUILD_TIME__}</span>
        </div>
        <div className="info-row">
          <span className="info-label">{t('about.kernel')}</span>
          <span className="info-value">WebOS Kernel v0.0.1-alpha</span>
        </div>
        <div className="info-row">
          <span className="info-label">{t('about.userInterface')}</span>
          <span className="info-value">React 19 + TypeScript</span>
        </div>
      </div>

      <div className="about-copyright">
        <p>© {new Date().getFullYear()} WebOS Project</p>
        <p>{t('about.openSource')}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'system': return renderSystemSection();
      case 'language': return renderLanguageSection();
      case 'datetime': return renderDateTimeSection();
      case 'display': return renderDisplaySection();
      case 'wallpaper': return renderWallpaperSection();
      case 'storage': return renderStorageSection();
      case 'recovery': return renderRecoverySection();
      case 'about': return renderAboutSection();
      default: return null;
    }
  };

  return (
    <div className="settings-container">
      {/* 左侧导航 */}
      <div className="settings-nav">
        <div className="settings-nav-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <span>{t('app.settings')}</span>
        </div>
        <div className="settings-nav-list">
          {navItems.map(renderNavItem)}
        </div>
      </div>

      {/* 右侧内容 */}
      <div className="settings-content">
        {renderContent()}
      </div>
    </div>
  );
};

// 图标组件
const SystemIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const LanguageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const DateTimeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const DisplayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const WallpaperIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const StorageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);

const RecoveryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

const AboutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

// 应用信息 - 放在组件定义之后
export const appInfo: AppInfo = {
  id: 'com.os.settings',
  name: 'Settings',
  nameKey: 'app.settings',
  description: 'System settings and preferences',
  descriptionKey: 'app.settings.desc',
  version: '1.0.0',
  category: 'system',
  icon: SettingsIcon,
  component: Settings,
  defaultWidth: 800,
  defaultHeight: 550,
  minWidth: 600,
  minHeight: 400,
  resizable: true,
  singleton: true
};

export default Settings;
