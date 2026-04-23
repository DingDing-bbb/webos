'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ============================================================================
// Types
// ============================================================================
type Lang = 'zh' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'ru';
type Theme = 'light' | 'dark';

const VALID_LANGS: Lang[] = ['zh', 'zh-TW', 'en', 'ja', 'ko', 'ru'];
// Sidebar item translations per language
const SIDEBAR_I18N: Record<Lang, Record<string, string>> = {
  zh: {
    'getting-started': '快速开始',
    'app-config': '应用配置',
    hooks: 'React Hooks',
    api: 'API 参考',
    cli: 'CLI 命令',
  },
  'zh-TW': {
    'getting-started': '快速開始',
    'app-config': '應用配置',
    hooks: 'React Hooks',
    api: 'API 參考',
    cli: 'CLI 命令',
  },
  en: {
    'getting-started': 'Getting Started',
    'app-config': 'App Config',
    hooks: 'React Hooks',
    api: 'API Reference',
    cli: 'CLI Commands',
  },
  ja: {
    'getting-started': 'はじめに',
    'app-config': 'アプリ設定',
    hooks: 'React Hooks',
    api: 'API リファレンス',
    cli: 'CLI コマンド',
  },
  ko: {
    'getting-started': '시작하기',
    'app-config': '앱 설정',
    hooks: 'React Hooks',
    api: 'API 참조',
    cli: 'CLI 명령어',
  },
  ru: {
    'getting-started': 'Начало работы',
    'app-config': 'Конфигурация',
    hooks: 'React Hooks',
    api: 'Справочник API',
    cli: 'CLI команды',
  },
};

// Sidebar data (static, matches index.json)
const SIDEBAR_ITEMS = [
  { id: 'getting-started', order: 1 },
  { id: 'app-config', order: 2 },
  { id: 'hooks', order: 3 },
  { id: 'api', order: 4 },
  { id: 'cli', order: 5 },
];

// ============================================================================
// i18n
// ============================================================================
const i18n = {
  zh: {
    nav: { intro: '介绍', docs: '文档', app: '启动', github: 'GitHub' },
    sidebar: { main: '文档' },
    footer: '© 2026 WebOS. MIT License.',
    back: '← 返回首页',
  },
  'zh-TW': {
    nav: { intro: '介紹', docs: '文檔', app: '啟動', github: 'GitHub' },
    sidebar: { main: '文檔' },
    footer: '© 2026 WebOS. MIT License.',
    back: '← 返回首頁',
  },
  en: {
    nav: { intro: 'Intro', docs: 'Docs', app: 'Launch', github: 'GitHub' },
    sidebar: { main: 'Documentation' },
    footer: '© 2026 WebOS. MIT License.',
    back: '← Back to Home',
  },
  ja: {
    nav: { intro: '紹介', docs: 'ドキュメント', app: '起動', github: 'GitHub' },
    sidebar: { main: 'ドキュメント' },
    footer: '© 2026 WebOS. MIT License.',
    back: '← ホームに戻る',
  },
  ko: {
    nav: { intro: '소개', docs: '문서', app: '실행', github: 'GitHub' },
    sidebar: { main: '문서' },
    footer: '© 2026 WebOS. MIT License.',
    back: '← 홈으로 돌아가기',
  },
  ru: {
    nav: { intro: 'Введение', docs: 'Документация', app: 'Запуск', github: 'GitHub' },
    sidebar: { main: 'Документация' },
    footer: '© 2026 WebOS. MIT License.',
    back: '← На главную',
  },
} as const;

// ============================================================================
// Icons
// ============================================================================
const SunIcon = memo(() => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="18"
    height="18"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
));

const MoonIcon = memo(() => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="18"
    height="18"
  >
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
));

const GitHubIcon = memo(() => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
));

const MenuIcon = memo(() => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="20"
    height="20"
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
));

const CloseIcon = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
));

// ============================================================================
// Layout Component
// ============================================================================
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>('zh');
  const [theme, setTheme] = useState<Theme>('light');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isDark = theme === 'dark';
  const t = i18n[lang];

  // Extract current slug from pathname
  const currentSlug = pathname?.split('/docs/')[1]?.replace(/\/$/, '') || 'getting-started';

  useEffect(() => {
    const savedLang = localStorage.getItem('webos-lang') as Lang;
    const savedTheme = localStorage.getItem('webos-theme') as Theme;
    if (savedLang && VALID_LANGS.includes(savedLang)) setLang(savedLang);
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) setTheme(savedTheme);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLangChange = useCallback((newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('webos-lang', newLang);
  }, []);

  const handleThemeChange = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('webos-theme', newTheme);
  }, [theme]);

  return (
    <div className={`docs-page ${isDark ? 'dark' : 'light'}`} suppressHydrationWarning>
      {/* Header */}
      <header className="docs-header">
        <div className="docs-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 28 }}>
            {isMobile && (
              <button className="mobile-menu-btn icon-btn" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </button>
            )}
            <a href="/intro" className="docs-logo">
              WebOS
            </a>
            {!isMobile && (
              <nav className="docs-nav">
                <a href="/intro">{t.nav.intro}</a>
                <span>{t.nav.docs}</span>
                <a href="/app">{t.nav.app}</a>
              </nav>
            )}
          </div>
          <div className="docs-actions">
            <a
              href="https://github.com/DingDing-bbb/webos"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn"
              title={t.nav.github}
            >
              <GitHubIcon />
            </a>
            <button onClick={handleThemeChange} className="icon-btn">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <select
              value={lang}
              onChange={(e) => handleLangChange(e.target.value as Lang)}
              className="lang-select"
            >
              <option value="zh">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="ru">Русский</option>
            </select>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-drawer" onClick={() => setMobileOpen(false)}>
          <aside onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span>{t.sidebar.main}</span>
              <button className="icon-btn" onClick={() => setMobileOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            {SIDEBAR_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={`/docs/${item.id}`}
                className={`sidebar-btn ${currentSlug === item.id ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {SIDEBAR_I18N[lang][item.id] || item.id}
              </Link>
            ))}
          </aside>
        </div>
      )}

      {/* Body */}
      <div style={{ display: 'flex', paddingTop: 56, flex: 1 }}>
        {/* Sidebar */}
        {!isMobile && (
          <aside className="sidebar">
            <p className="sidebar-title">{t.sidebar.main}</p>
            {SIDEBAR_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={`/docs/${item.id}`}
                className={`sidebar-btn ${currentSlug === item.id ? 'active' : ''}`}
              >
                {SIDEBAR_I18N[lang][item.id] || item.id}
              </Link>
            ))}

            <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <a href="/" className="sidebar-btn" style={{ color: 'var(--text-muted)' }}>
                {t.back}
              </a>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            marginLeft: isMobile ? 0 : 240,
          }}
        >
          <main className="main-content">
            <div className="content-wrapper">
              <div className="breadcrumb">
                <a href="/docs">{t.nav.docs}</a>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span>{SIDEBAR_I18N[lang][currentSlug] || currentSlug}</span>
              </div>
              <div className="doc-content">{children}</div>
            </div>
          </main>

          <footer className="docs-footer">
            <p>{t.footer}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
