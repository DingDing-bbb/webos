'use client'

import { useState, useEffect } from 'react'

// 翻译配置
const translations = {
  en: {
    nav: { intro: 'Intro', docs: 'Docs', app: 'App' },
    hero: {
      badge: 'Open Source',
      title: 'WebOS',
      subtitle: 'A complete web-based operating system built with React & Next.js',
      description: 'Experience a full-featured desktop environment in your browser. Features include window management, file system, built-in apps, themes, and more.',
      launch: 'Launch WebOS',
      github: 'View on GitHub'
    },
    features: {
      title: 'Features',
      subtitle: 'Everything you need for a modern web desktop',
      items: [
        { icon: '🖥️', title: 'Desktop Environment', desc: 'Full window management, taskbar, start menu, and desktop icons' },
        { icon: '📁', title: 'File System', desc: 'Virtual file system with encrypted storage powered by SQLite WASM' },
        { icon: '🎨', title: 'UI Components', desc: '100+ professionally designed components for building apps' },
        { icon: '📱', title: 'Touch Support', desc: 'Full touch and tablet mode support with gestures' },
        { icon: '🔒', title: 'Security', desc: 'AES-256 encryption for user data and secure authentication' },
        { icon: '🌍', title: 'i18n', desc: 'Multi-language support with easy localization' }
      ]
    },
    apps: {
      title: 'Built-in Apps',
      subtitle: 'Productivity apps ready to use',
      items: [
        { icon: '🌐', name: 'Browser', desc: 'Web browser with tabs' },
        { icon: '📁', name: 'Files', desc: 'File manager' },
        { icon: '⚙️', name: 'Settings', desc: 'System settings' },
        { icon: '🕐', name: 'Clock', desc: 'Clock & alarms' },
        { icon: '💻', name: 'Terminal', desc: 'Command line' }
      ]
    },
    tech: {
      title: 'Tech Stack',
      subtitle: 'Built with modern technologies'
    },
    footer: {
      copyright: '© 2024 WebOS. MIT License.',
      made: 'Made with ❤️ by DingDing-bbb'
    }
  },
  zh: {
    nav: { intro: '介绍', docs: '文档', app: '应用' },
    hero: {
      badge: '开源项目',
      title: 'WebOS',
      subtitle: '基于 React 和 Next.js 构建的完整网页操作系统',
      description: '在浏览器中体验完整的桌面环境。包括窗口管理、文件系统、内置应用、主题系统等功能。',
      launch: '启动 WebOS',
      github: '查看 GitHub'
    },
    features: {
      title: '核心功能',
      subtitle: '现代化网页桌面所需的一切',
      items: [
        { icon: '🖥️', title: '桌面环境', desc: '完整的窗口管理、任务栏、开始菜单和桌面图标' },
        { icon: '📁', title: '文件系统', desc: '基于 SQLite WASM 的虚拟文件系统，支持加密存储' },
        { icon: '🎨', title: 'UI 组件库', desc: '100+ 专业设计的组件，用于构建应用程序' },
        { icon: '📱', title: '触屏支持', desc: '完整的触控和平板模式支持，包含手势操作' },
        { icon: '🔒', title: '安全加密', desc: 'AES-256 加密用户数据，安全的身份验证' },
        { icon: '🌍', title: '国际化', desc: '多语言支持，轻松本地化' }
      ]
    },
    apps: {
      title: '内置应用',
      subtitle: '开箱即用的生产力应用',
      items: [
        { icon: '🌐', name: '浏览器', desc: '多标签网页浏览' },
        { icon: '📁', name: '文件管理器', desc: '文件浏览管理' },
        { icon: '⚙️', name: '设置', desc: '系统设置中心' },
        { icon: '🕐', name: '时钟', desc: '时钟和闹钟' },
        { icon: '💻', name: '终端', desc: '命令行工具' }
      ]
    },
    tech: {
      title: '技术栈',
      subtitle: '基于现代技术构建'
    },
    footer: {
      copyright: '© 2024 WebOS. MIT 许可证',
      made: '由 DingDing-bbb 用 ❤️ 打造'
    }
  },
  tw: {
    nav: { intro: '介紹', docs: '文檔', app: '應用' },
    hero: {
      badge: '開源專案',
      title: 'WebOS',
      subtitle: '基於 React 和 Next.js 構建的完整網頁作業系統',
      description: '在瀏覽器中體驗完整的桌面環境。包括視窗管理、檔案系統、內建應用、佈景主題等功能。',
      launch: '啟動 WebOS',
      github: '查看 GitHub'
    },
    features: {
      title: '核心功能',
      subtitle: '現代化網頁桌面所需的一切',
      items: [
        { icon: '🖥️', title: '桌面環境', desc: '完整的視窗管理、工作列、開始功能表和桌面圖示' },
        { icon: '📁', title: '檔案系統', desc: '基於 SQLite WASM 的虛擬檔案系統，支援加密儲存' },
        { icon: '🎨', title: 'UI 組件庫', desc: '100+ 專業設計的組件，用於構建應用程式' },
        { icon: '📱', title: '觸控支援', desc: '完整的觸控和平板模式支援，包含手勢操作' },
        { icon: '🔒', title: '安全加密', desc: 'AES-256 加密使用者資料，安全的身份驗證' },
        { icon: '🌍', title: '國際化', desc: '多語言支援，輕鬆本地化' }
      ]
    },
    apps: {
      title: '內建應用',
      subtitle: '開箱即用的生產力應用',
      items: [
        { icon: '🌐', name: '瀏覽器', desc: '多分頁網頁瀏覽' },
        { icon: '📁', name: '檔案管理員', desc: '檔案瀏覽管理' },
        { icon: '⚙️', name: '設定', desc: '系統設定中心' },
        { icon: '🕐', name: '時鐘', desc: '時鐘和鬧鐘' },
        { icon: '💻', name: '終端機', desc: '命令列工具' }
      ]
    },
    tech: {
      title: '技術棧',
      subtitle: '基於現代技術構建'
    },
    footer: {
      copyright: '© 2024 WebOS. MIT 授權條款',
      made: '由 DingDing-bbb 用 ❤️ 打造'
    }
  }
}

// 技术栈图标
const techStack = [
  { name: 'React', color: '#61DAFB' },
  { name: 'Next.js', color: '#000000' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Bun', color: '#000000' },
  { name: 'SQLite', color: '#003B57' },
  { name: 'Tailwind', color: '#06B6D4' }
]

export function IntroPage() {
  const [lang, setLang] = useState<'en' | 'zh' | 'tw'>('zh')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const t = translations[lang]
  const isDark = theme === 'dark'
  
  // 样式变量
  const styles = {
    bg: isDark 
      ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' 
      : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f8fafc 100%)',
    text: isDark ? '#f1f5f9' : '#1e293b',
    muted: isDark ? '#94a3b8' : '#64748b',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
    cardBgHover: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    accent: '#3b82f6',
    accentGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: styles.bg,
      color: styles.text,
      overflow: 'hidden'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
      </div>

      {/* 导航栏 */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 48px',
        background: isDark ? 'rgba(15,23,42,0.8)' : 'rgba(248,250,252,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${styles.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: styles.accentGradient,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            💻
          </div>
          <span style={{ fontWeight: '700', fontSize: '18px' }}>WebOS</span>
        </div>
        
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <a href="/intro" style={{ 
            color: styles.accent, 
            textDecoration: 'none', 
            fontWeight: '600',
            fontSize: '15px'
          }}>{t.nav.intro}</a>
          <a href="/docs" style={{ 
            color: styles.muted, 
            textDecoration: 'none',
            fontSize: '15px',
            transition: 'color 0.2s'
          }}>{t.nav.docs}</a>
          <a href="/app" style={{ 
            color: styles.muted, 
            textDecoration: 'none',
            fontSize: '15px',
            transition: 'color 0.2s'
          }}>{t.nav.app}</a>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={lang} 
            onChange={e => setLang(e.target.value as 'en' | 'zh' | 'tw')} 
            style={{
              background: styles.cardBg,
              color: styles.text,
              border: `1px solid ${styles.border}`,
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="zh">简体中文</option>
            <option value="tw">繁體中文</option>
            <option value="en">English</option>
          </select>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            style={{
              width: '36px',
              height: '36px',
              background: styles.cardBg,
              border: `1px solid ${styles.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 48px 80px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: styles.cardBg,
          border: `1px solid ${styles.border}`,
          borderRadius: '100px',
          fontSize: '13px',
          color: styles.muted,
          marginBottom: '32px'
        }}>
          <span style={{ color: '#22c55e' }}>●</span>
          {t.hero.badge}
        </div>
        
        <h1 style={{
          fontSize: 'clamp(60px, 12vw, 120px)',
          fontWeight: '800',
          marginBottom: '24px',
          background: styles.accentGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease-out'
        }}>
          {t.hero.title}
        </h1>
        
        <p style={{
          fontSize: 'clamp(20px, 3vw, 28px)',
          fontWeight: '600',
          marginBottom: '16px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease-out 0.1s'
        }}>
          {t.hero.subtitle}
        </p>
        
        <p style={{
          fontSize: '16px',
          color: styles.muted,
          maxWidth: '600px',
          lineHeight: 1.7,
          marginBottom: '48px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease-out 0.2s'
        }}>
          {t.hero.description}
        </p>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease-out 0.3s'
        }}>
          <a 
            href="/app" 
            style={{
              padding: '16px 40px',
              background: styles.accentGradient,
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 4px 24px rgba(59,130,246,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            {t.hero.launch} →
          </a>
          <a 
            href="https://github.com/DingDing-bbb/webos" 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '16px 40px',
              background: styles.cardBg,
              color: styles.text,
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              border: `1px solid ${styles.border}`,
              transition: 'background 0.2s'
            }}
          >
            {t.hero.github}
          </a>
        </div>
      </section>

      {/* 功能特性 */}
      <section style={{
        padding: '80px 48px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>{t.features.title}</h2>
          <p style={{ color: styles.muted, fontSize: '18px' }}>{t.features.subtitle}</p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {t.features.items.map((feature, i) => (
            <div 
              key={i}
              style={{
                padding: '32px',
                background: styles.cardBg,
                borderRadius: '16px',
                border: `1px solid ${styles.border}`,
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{feature.title}</h3>
              <p style={{ color: styles.muted, fontSize: '15px', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 内置应用 */}
      <section style={{
        padding: '80px 48px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>{t.apps.title}</h2>
          <p style={{ color: styles.muted, fontSize: '18px' }}>{t.apps.subtitle}</p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {t.apps.items.map((app, i) => (
            <div 
              key={i}
              style={{
                padding: '24px 32px',
                background: styles.cardBg,
                borderRadius: '16px',
                border: `1px solid ${styles.border}`,
                textAlign: 'center',
                minWidth: '160px',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{app.icon}</div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{app.name}</div>
              <div style={{ color: styles.muted, fontSize: '13px' }}>{app.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 技术栈 */}
      <section style={{
        padding: '80px 48px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>{t.tech.title}</h2>
          <p style={{ color: styles.muted, fontSize: '18px' }}>{t.tech.subtitle}</p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {techStack.map((tech, i) => (
            <div 
              key={i}
              style={{
                padding: '16px 28px',
                background: styles.cardBg,
                borderRadius: '12px',
                border: `1px solid ${styles.border}`,
                fontWeight: '600',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: tech.color,
                border: isDark && tech.color === '#000000' ? '1px solid #fff' : 'none'
              }} />
              {tech.name}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '48px',
        textAlign: 'center',
        borderTop: `1px solid ${styles.border}`,
        position: 'relative',
        zIndex: 1
      }}>
        <p style={{ color: styles.muted, marginBottom: '8px' }}>{t.footer.made}</p>
        <p style={{ color: styles.muted, fontSize: '14px' }}>{t.footer.copyright}</p>
      </footer>
    </main>
  )
}

export default IntroPage
