'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useTheme, Lang } from '../../components/useTheme';

// ============================================================================
// i18n
// ============================================================================
const i18n = {
  zh: {
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
} as const;

// ============================================================================
// Feature Icons
// ============================================================================
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

const iconMap: Record<string, React.ReactNode> = {
  monitor: <MonitorIcon />,
  folder: <FolderIcon />,
  globe: <GlobeIcon />,
  shield: <ShieldIcon />,
};

// ============================================================================
// Page
// ============================================================================
export default function IntroPage() {
  const { lang, theme, mounted, setLang, toggleTheme, isDark } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const t = i18n[lang];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        active="intro"
        lang={lang}
        onLangChange={setLang}
        theme={theme}
        onThemeChange={toggleTheme}
        isMobile={isMobile}
      />

      <main style={{ flex: 1, background: 'var(--bg-gradient)' }}>
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-badge">{t.hero.badge}</div>
          <h1 className="hero-title">{t.hero.title}</h1>
          <p className="hero-subtitle">{t.hero.subtitle}</p>
          <p className="hero-desc">{t.hero.desc}</p>
          <div className="hero-actions">
            <a href="/app" className="btn-primary">
              {t.hero.primary}
            </a>
            <a href="/docs" className="btn-secondary">
              {t.hero.secondary}
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="features-grid">
          {t.features.map((feature, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{iconMap[feature.icon]}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </section>

        {/* Tech Stack */}
        <section className="tech-section">
          <p className="tech-label">{t.tech.title}</p>
          <div className="tech-tags">
            {t.tech.items.map((item, i) => (
              <span key={i} className="tech-tag">
                {item}
              </span>
            ))}
          </div>
        </section>
      </main>

      <footer className="page-footer">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
