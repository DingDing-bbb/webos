'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useTheme, Lang } from '../../components/useTheme';

// ============================================================================
// Sidebar i18n
// ============================================================================
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

const FOOTER_I18N: Record<Lang, { docs: string; back: string; footer: string }> = {
  zh: { docs: '文档', back: '← 返回首页', footer: '© 2026 WebOS. MIT License.' },
  'zh-TW': { docs: '文檔', back: '← 返回首頁', footer: '© 2026 WebOS. MIT License.' },
  en: { docs: 'Docs', back: '← Back to Home', footer: '© 2026 WebOS. MIT License.' },
  ja: { docs: 'ドキュメント', back: '← ホームに戻る', footer: '© 2026 WebOS. MIT License.' },
  ko: { docs: '문서', back: '← 홈으로 돌아가기', footer: '© 2026 WebOS. MIT License.' },
  ru: { docs: 'Документация', back: '← На главную', footer: '© 2026 WebOS. MIT License.' },
};

const SIDEBAR_ITEMS = [
  { id: 'getting-started' },
  { id: 'app-config' },
  { id: 'hooks' },
  { id: 'api' },
  { id: 'cli' },
];

// ============================================================================
// Icons
// ============================================================================
const CloseIcon = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
));

// ============================================================================
// Layout
// ============================================================================
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, theme, mounted, setLang, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const currentSlug = pathname?.split('/docs/')[1]?.replace(/\/$/, '') || 'getting-started';
  const t = FOOTER_I18N[lang];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }} suppressHydrationWarning>
        <Navbar
          active="docs"
          lang={lang}
          onLangChange={setLang}
          theme={theme}
          onThemeChange={toggleTheme}
        />
      </div>
    );
  }

  const sidebarContent = (
    <>
      <p className="docs-sidebar-title">{t.docs}</p>
      {SIDEBAR_ITEMS.map((item) => (
        <Link
          key={item.id}
          href={`/docs/${item.id}`}
          className={`sidebar-link ${currentSlug === item.id ? 'active' : ''}`}
          onClick={() => setMobileOpen(false)}
        >
          {SIDEBAR_I18N[lang][item.id] || item.id}
        </Link>
      ))}
      <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <Link href="/intro" className="sidebar-link" style={{ color: 'var(--text-muted)' }}>
          {t.back}
        </Link>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        active="docs"
        lang={lang}
        onLangChange={setLang}
        theme={theme}
        onThemeChange={toggleTheme}
        isMobile={isMobile}
        onMenuClick={isMobile ? () => setMobileOpen(true) : undefined}
      />

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span>{t.docs}</span>
              <button className="icon-btn" onClick={() => setMobileOpen(false)} aria-label="关闭">
                <CloseIcon />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="docs-body">
        {!isMobile && <aside className="docs-sidebar">{sidebarContent}</aside>}

        <div className="docs-main">
          <main className="docs-content-area">
            <div className="breadcrumb">
              <Link href="/docs">{t.docs}</Link>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ color: 'var(--text)' }}>
                {SIDEBAR_I18N[lang][currentSlug] || currentSlug}
              </span>
            </div>
            {children}
          </main>
          <footer className="page-footer">
            <p>{t.footer}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
