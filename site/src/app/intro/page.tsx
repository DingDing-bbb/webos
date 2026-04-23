'use client';

import { useState, useEffect } from 'react';

type Lang = 'zh' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'ru';
type Theme = 'light' | 'dark';

const SunIcon = () => (
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
);

const MoonIcon = () => (
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
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const MonitorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="24"
    height="24"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const FolderIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="24"
    height="24"
  >
    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const GlobeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="24"
    height="24"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="24"
    height="24"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const i18n = {
  zh: {
    nav: { intro: '介绍', docs: '文档', app: '启动', github: 'GitHub' },
    hero: {
      badge: '开源项目',
      title: 'WebOS',
      subtitle: '浏览器中的操作系统',
      desc: '基于 React 构建的网页操作系统，提供完整的桌面环境、虚拟文件系统和多任务处理能力。',
      primary: '立即体验',
      secondary: '查看文档',
    },
    features: [
      { icon: 'monitor', title: '桌面环境', desc: '窗口管理、任务栏、开始菜单' },
      { icon: 'folder', title: '文件系统', desc: '虚拟文件系统，本地存储' },
      { icon: 'globe', title: '多语言支持', desc: '内置中英文界面' },
      { icon: 'shield', title: '安全加密', desc: '本地数据加密存储' },
    ],
    tech: { title: '技术栈', items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js'] },
    footer: '© 2026 WebOS. MIT License.',
  },
  'zh-TW': {
    nav: { intro: '介紹', docs: '文檔', app: '啟動', github: 'GitHub' },
    hero: {
      badge: '開源項目',
      title: 'WebOS',
      subtitle: '瀏覽器中的操作系統',
      desc: '基於 React 構建的網頁操作系統，提供完整的桌面環境、虛擬文件系統和多任務處理能力。',
      primary: '立即體驗',
      secondary: '查看文檔',
    },
    features: [
      { icon: 'monitor', title: '桌面環境', desc: '窗口管理、任務欄、開始菜單' },
      { icon: 'folder', title: '文件系統', desc: '虛擬文件系統，本地存儲' },
      { icon: 'globe', title: '多語言支持', desc: '內置中英文界面' },
      { icon: 'shield', title: '安全加密', desc: '本地數據加密存儲' },
    ],
    tech: { title: '技術棧', items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js'] },
    footer: '© 2026 WebOS. MIT License.',
  },
  en: {
    nav: { intro: 'Intro', docs: 'Docs', app: 'Launch', github: 'GitHub' },
    hero: {
      badge: 'Open Source',
      title: 'WebOS',
      subtitle: 'Operating System in Browser',
      desc: 'A web-based operating system built with React, featuring complete desktop environment, virtual file system, and multitasking capabilities.',
      primary: 'Get Started',
      secondary: 'Read Docs',
    },
    features: [
      {
        icon: 'monitor',
        title: 'Desktop Environment',
        desc: 'Window management, taskbar, start menu',
      },
      { icon: 'folder', title: 'File System', desc: 'Virtual file system with local storage' },
      { icon: 'globe', title: 'i18n Support', desc: 'Built-in Chinese and English' },
      { icon: 'shield', title: 'Security', desc: 'Encrypted local storage' },
    ],
    tech: { title: 'Tech Stack', items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js'] },
    footer: '© 2026 WebOS. MIT License.',
  },
  ja: {
    nav: { intro: '紹介', docs: 'ドキュメント', app: '起動', github: 'GitHub' },
    hero: {
      badge: 'オープンソース',
      title: 'WebOS',
      subtitle: 'ブラウザ上のオペレーティングシステム',
      desc: 'Reactで構築されたウェブベースのオペレーティングシステム。デスクトップ環境、仮想ファイルシステム、マルチタスク機能を備えています。',
      primary: '試してみる',
      secondary: 'ドキュメント',
    },
    features: [
      {
        icon: 'monitor',
        title: 'デスクトップ環境',
        desc: 'ウィンドウ管理、タスクバー、スタートメニュー',
      },
      {
        icon: 'folder',
        title: 'ファイルシステム',
        desc: '仮想ファイルシステム、ローカルストレージ',
      },
      { icon: 'globe', title: '多言語対応', desc: '内蔵の多言語インターフェース' },
      { icon: 'shield', title: 'セキュリティ', desc: 'ローカルデータの暗号化保存' },
    ],
    tech: { title: '技術スタック', items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js'] },
    footer: '© 2026 WebOS. MIT License.',
  },
  ko: {
    nav: { intro: '소개', docs: '문서', app: '실행', github: 'GitHub' },
    hero: {
      badge: '오픈 소스',
      title: 'WebOS',
      subtitle: '브라우저 속 운영 체제',
      desc: 'React로 구축된 웹 기반 운영 체제로, 완전한 데스크톱 환경, 가상 파일 시스템 및 멀티태스킹 기능을 제공합니다.',
      primary: '시작하기',
      secondary: '문서 보기',
    },
    features: [
      { icon: 'monitor', title: '데스크톱 환경', desc: '창 관리, 작업 표시줄, 시작 메뉴' },
      { icon: 'folder', title: '파일 시스템', desc: '가상 파일 시스템, 로컬 스토리지' },
      { icon: 'globe', title: '다국어 지원', desc: '내장 다국어 인터페이스' },
      { icon: 'shield', title: '보안', desc: '로컬 데이터 암호화 저장' },
    ],
    tech: { title: '기술 스택', items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js'] },
    footer: '© 2026 WebOS. MIT License.',
  },
  ru: {
    nav: { intro: 'Введение', docs: 'Документация', app: 'Запуск', github: 'GitHub' },
    hero: {
      badge: 'Открытый исходный код',
      title: 'WebOS',
      subtitle: 'Операционная система в браузере',
      desc: 'Веб-операционная система на базе React с полноценной рабочей средой, виртуальной файловой системой и поддержкой многозадачности.',
      primary: 'Попробовать',
      secondary: 'Документация',
    },
    features: [
      {
        icon: 'monitor',
        title: 'Рабочая среда',
        desc: 'Управление окнами, панель задач, меню пуск',
      },
      {
        icon: 'folder',
        title: 'Файловая система',
        desc: 'Виртуальная файловая система, локальное хранилище',
      },
      { icon: 'globe', title: 'Мультиязычность', desc: 'Встроенная многоязычная поддержка' },
      { icon: 'shield', title: 'Безопасность', desc: 'Шифрование локальных данных' },
    ],
    tech: { title: 'Технологии', items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js'] },
    footer: '© 2026 WebOS. MIT License.',
  },
};

const iconMap: Record<string, React.ReactNode> = {
  monitor: <MonitorIcon />,
  folder: <FolderIcon />,
  globe: <GlobeIcon />,
  shield: <ShieldIcon />,
};

export default function IntroPage() {
  const [lang, setLang] = useState<Lang>('zh');
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const t = i18n[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('webos-lang') as Lang;
    const savedTheme = localStorage.getItem('webos-theme') as Theme;
    if (savedLang && ['zh', 'zh-TW', 'en', 'ja', 'ko', 'ru'].includes(savedLang))
      setLang(savedLang);
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) setTheme(savedTheme);
    setMounted(true);
  }, []);

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('webos-lang', newLang);
  };

  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('webos-theme', newTheme);
  };

  const isDark = theme === 'dark';
  const bg = isDark ? '#0a0a0c' : '#fafafa';
  const text = isDark ? '#ffffff' : '#1a1a1a';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const headerBg = isDark ? 'rgba(10,10,12,0.8)' : 'rgba(255,255,255,0.8)';
  const accent = isDark ? '#ffffff' : '#1a1a1a';

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: bg }} />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: bg,
        color: text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: headerBg,
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 24px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a
              href="/"
              style={{ fontSize: '18px', fontWeight: 600, color: text, textDecoration: 'none' }}
            >
              WebOS
            </a>
            <nav style={{ display: 'flex', gap: '24px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: text }}>{t.nav.intro}</span>
              <a
                href="/docs"
                style={{ fontSize: '14px', color: textMuted, textDecoration: 'none' }}
              >
                {t.nav.docs}
              </a>
              <a href="/app" style={{ fontSize: '14px', color: textMuted, textDecoration: 'none' }}>
                {t.nav.app}
              </a>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="https://github.com/webos/webos"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: textMuted,
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
              title={t.nav.github}
            >
              <GitHubIcon />
            </a>
            <button
              onClick={handleThemeChange}
              style={{
                padding: '8px',
                background: 'transparent',
                border: 'none',
                color: textMuted,
                cursor: 'pointer',
                borderRadius: '8px',
              }}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <select
              value={lang}
              onChange={(e) => handleLangChange(e.target.value as Lang)}
              style={{
                padding: '6px 12px',
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: '8px',
                color: text,
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="zh" style={{ background: bg }}>
                简体中文
              </option>
              <option value="zh-TW" style={{ background: bg }}>
                繁體中文
              </option>
              <option value="en" style={{ background: bg }}>
                English
              </option>
              <option value="ja" style={{ background: bg }}>
                日本語
              </option>
              <option value="ko" style={{ background: bg }}>
                한국어
              </option>
              <option value="ru" style={{ background: bg }}>
                Русский
              </option>
            </select>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <section
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '100px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: '100px',
              fontSize: '13px',
              color: textMuted,
              marginBottom: '24px',
            }}
          >
            {t.hero.badge}
          </div>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 700,
              letterSpacing: '-2px',
              marginBottom: '16px',
            }}
          >
            {t.hero.title}
          </h1>
          <p style={{ fontSize: '24px', color: textMuted, marginBottom: '12px', fontWeight: 400 }}>
            {t.hero.subtitle}
          </p>
          <p
            style={{
              fontSize: '16px',
              color: textMuted,
              maxWidth: '480px',
              margin: '0 auto 40px',
              lineHeight: 1.6,
            }}
          >
            {t.hero.desc}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <a
              href="/app"
              style={{
                padding: '14px 32px',
                background: accent,
                color: isDark ? '#000' : '#fff',
                fontSize: '15px',
                fontWeight: 500,
                borderRadius: '12px',
                textDecoration: 'none',
              }}
            >
              {t.hero.primary}
            </a>
            <a
              href="/docs"
              style={{
                padding: '14px 32px',
                background: 'transparent',
                border: `1px solid ${border}`,
                color: text,
                fontSize: '15px',
                fontWeight: 500,
                borderRadius: '12px',
                textDecoration: 'none',
              }}
            >
              {t.hero.secondary}
            </a>
          </div>
        </section>

        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {t.features.map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: '28px',
                  background: cardBg,
                  borderRadius: '16px',
                  border: `1px solid ${border}`,
                }}
              >
                <div style={{ color: textMuted, marginBottom: '16px' }}>
                  {iconMap[feature.icon]}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '8px' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: textMuted, lineHeight: 1.5 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 24px 80px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: textMuted,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '20px',
              fontWeight: 500,
            }}
          >
            {t.tech.title}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {t.tech.items.map((item, i) => (
              <span
                key={i}
                style={{
                  padding: '10px 18px',
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: textMuted,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ borderTop: `1px solid ${border}`, padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: textMuted }}>{t.footer}</p>
      </footer>
    </div>
  );
}
