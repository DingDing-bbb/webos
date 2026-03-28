'use client';

import { useState } from 'react';

// Icons
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016.01 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.7.8.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const i18n = {
  zh: {
    nav: { intro: '介绍', docs: '文档', app: '启动应用' },
    hero: {
      badge: '开源项目',
      title: 'WebOS',
      subtitle: '浏览器中的操作系统',
      desc: '基于 React 构建的网页操作系统，提供完整的桌面环境、虚拟文件系统和多任务处理能力，让您在浏览器中体验原生操作系统的流畅感。',
      primary: '立即体验',
      secondary: '查看文档',
    },
    features: [
      { icon: 'monitor', title: '桌面环境', desc: '窗口管理、任务栏、开始菜单，完整的桌面交互体验' },
      { icon: 'folder', title: '文件系统', desc: '虚拟文件系统支持，数据安全存储在本地' },
      { icon: 'globe', title: '多语言支持', desc: '内置中英文界面，可扩展更多语言' },
      { icon: 'shield', title: '安全加密', desc: '本地数据加密存储，保护您的隐私' },
    ],
    tech: {
      title: '技术栈',
      items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    },
    footer: '© 2026 WebOS. MIT License.',
  },
  en: {
    nav: { intro: 'Intro', docs: 'Docs', app: 'Launch' },
    hero: {
      badge: 'Open Source',
      title: 'WebOS',
      subtitle: 'Operating System in Browser',
      desc: 'A web-based operating system built with React, featuring a complete desktop environment, virtual file system, and multitasking capabilities.',
      primary: 'Get Started',
      secondary: 'Read Docs',
    },
    features: [
      { icon: 'monitor', title: 'Desktop Environment', desc: 'Window management, taskbar, start menu - complete desktop experience' },
      { icon: 'folder', title: 'File System', desc: 'Virtual file system with secure local storage' },
      { icon: 'globe', title: 'i18n Support', desc: 'Built-in Chinese and English, extensible to more languages' },
      { icon: 'shield', title: 'Security', desc: 'Encrypted local storage to protect your privacy' },
    ],
    tech: {
      title: 'Tech Stack',
      items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    },
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
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const t = i18n[lang];

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="/" style={{ 
              fontSize: '20px', 
              fontWeight: 600, 
              color: '#fff', 
              textDecoration: 'none',
              letterSpacing: '-0.5px',
            }}>
              WebOS
            </a>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="/" style={{ 
                fontSize: '14px', 
                color: '#fff', 
                textDecoration: 'none',
                fontWeight: 500,
              }}>
                {t.nav.intro}
              </a>
              <a href="/docs" style={{ 
                fontSize: '14px', 
                color: 'rgba(255,255,255,0.6)', 
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}>
                {t.nav.docs}
              </a>
            </div>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a 
              href="/app" 
              style={{
                padding: '8px 16px',
                background: '#fff',
                color: '#000',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              {t.nav.app}
            </a>
            <a
              href="https://github.com/DingDing-bbb/webos"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px',
                color: 'rgba(255,255,255,0.6)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <GithubIcon />
            </a>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'zh' | 'en')}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="zh" style={{ background: '#1a1a2e', color: '#fff' }}>中文</option>
              <option value="en" style={{ background: '#1a1a2e', color: '#fff' }}>EN</option>
            </select>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 14px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '100px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '24px',
          }}>
            {t.hero.badge}
          </div>
          
          <h1 style={{
            fontSize: '72px',
            fontWeight: 700,
            letterSpacing: '-2px',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {t.hero.title}
          </h1>
          
          <p style={{
            fontSize: '24px',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '12px',
            fontWeight: 400,
          }}>
            {t.hero.subtitle}
          </p>
          
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            {t.hero.desc}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <a 
              href="/app"
              style={{
                padding: '14px 32px',
                background: '#fff',
                color: '#000',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              {t.hero.primary}
            </a>
            <a 
              href="/docs"
              style={{
                padding: '14px 32px',
                background: 'transparent',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '8px',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'background 0.2s, border-color 0.2s',
              }}
            >
              {t.hero.secondary}
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 80px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {t.features.map((feature, i) => (
              <div 
                key={i}
                style={{
                  padding: '32px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  transition: 'background 0.3s, border-color 0.3s',
                }}
              >
                <div style={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  marginBottom: '16px',
                }}>
                  {iconMap[feature.icon]}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#fff',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.6,
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 80px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}>
            {t.tech.title}
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            {t.tech.items.map((item, i) => (
              <span 
                key={i}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.4)',
        }}>
          {t.footer}
        </p>
      </footer>
    </div>
  );
}
