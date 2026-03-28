'use client'

import { useState } from 'react'

// 翻译配置
const translations = {
  en: {
    nav: { intro: 'Intro', docs: 'Docs', app: 'App' },
    title: 'Documentation',
    subtitle: 'Everything you need to know about WebOS',
    search: 'Search documentation...',
    sections: {
      gettingStarted: {
        title: 'Getting Started',
        items: {
          introduction: 'Introduction',
          installation: 'Installation',
          quickStart: 'Quick Start'
        }
      },
      components: {
        title: 'Components',
        items: {
          desktop: 'Desktop',
          window: 'Window',
          taskbar: 'Taskbar',
          startMenu: 'Start Menu',
          contextMenu: 'Context Menu'
        }
      },
      hooks: {
        title: 'Hooks',
        items: {
          useTheme: 'useTheme',
          useMediaQuery: 'useMediaQuery',
          useTranslation: 'useTranslation'
        }
      },
      theming: {
        title: 'Theming',
        items: {
          overview: 'Overview',
          darkMode: 'Dark Mode',
          customThemes: 'Custom Themes'
        }
      },
      api: {
        title: 'API Reference',
        items: {
          kernel: 'Kernel',
          fileSystem: 'File System',
          userManager: 'User Manager'
        }
      }
    },
    content: {
      introduction: {
        title: 'Introduction',
        text: 'WebOS is a complete web-based operating system built with React and Next.js. It provides a full desktop environment in your browser with window management, file system, built-in apps, and more.',
        features: [
          'Full window management with drag, resize, minimize, maximize',
          'Virtual file system with encrypted storage',
          'Built-in applications (Browser, Files, Settings, Terminal)',
          'Theme system with light/dark mode',
          'Multi-language support',
          'Touch and tablet mode support'
        ]
      },
      installation: {
        title: 'Installation',
        text: 'Get started with WebOS in your project.',
        steps: [
          { label: 'Clone the repository', code: 'git clone https://github.com/DingDing-bbb/webos.git' },
          { label: 'Install dependencies', code: 'cd webos\nbun install' },
          { label: 'Start development server', code: 'bun run dev' }
        ]
      },
      quickStart: {
        title: 'Quick Start',
        text: 'WebOS provides multiple entry points for different use cases.',
        routes: [
          { path: '/', desc: 'Redirects to intro page' },
          { path: '/intro', desc: 'Introduction and features overview' },
          { path: '/docs', desc: 'Documentation' },
          { path: '/app', desc: 'WebOS application' }
        ]
      }
    },
    footer: '© 2024 WebOS. MIT License.'
  },
  zh: {
    nav: { intro: '介绍', docs: '文档', app: '应用' },
    title: '文档',
    subtitle: 'WebOS 完整开发文档',
    search: '搜索文档...',
    sections: {
      gettingStarted: {
        title: '快速开始',
        items: {
          introduction: '介绍',
          installation: '安装',
          quickStart: '快速入门'
        }
      },
      components: {
        title: '组件',
        items: {
          desktop: '桌面',
          window: '窗口',
          taskbar: '任务栏',
          startMenu: '开始菜单',
          contextMenu: '右键菜单'
        }
      },
      hooks: {
        title: 'Hooks',
        items: {
          useTheme: 'useTheme',
          useMediaQuery: 'useMediaQuery',
          useTranslation: 'useTranslation'
        }
      },
      theming: {
        title: '主题',
        items: {
          overview: '概述',
          darkMode: '暗色模式',
          customThemes: '自定义主题'
        }
      },
      api: {
        title: 'API 参考',
        items: {
          kernel: '内核',
          fileSystem: '文件系统',
          userManager: '用户管理'
        }
      }
    },
    content: {
      introduction: {
        title: '介绍',
        text: 'WebOS 是一个基于 React 和 Next.js 构建的完整网页操作系统。它在浏览器中提供完整的桌面环境，包括窗口管理、文件系统、内置应用等功能。',
        features: [
          '完整的窗口管理：拖拽、调整大小、最小化、最大化',
          '虚拟文件系统，支持加密存储',
          '内置应用：浏览器、文件管理器、设置、终端',
          '主题系统，支持亮色/暗色模式',
          '多语言支持',
          '触控和平板模式支持'
        ]
      },
      installation: {
        title: '安装',
        text: '在你的项目中开始使用 WebOS。',
        steps: [
          { label: '克隆仓库', code: 'git clone https://github.com/DingDing-bbb/webos.git' },
          { label: '安装依赖', code: 'cd webos\nbun install' },
          { label: '启动开发服务器', code: 'bun run dev' }
        ]
      },
      quickStart: {
        title: '快速入门',
        text: 'WebOS 提供多个入口点用于不同的使用场景。',
        routes: [
          { path: '/', desc: '重定向到介绍页面' },
          { path: '/intro', desc: '介绍和功能概览' },
          { path: '/docs', desc: '文档页面' },
          { path: '/app', desc: 'WebOS 应用' }
        ]
      }
    },
    footer: '© 2024 WebOS. MIT 许可证'
  },
  tw: {
    nav: { intro: '介紹', docs: '文檔', app: '應用' },
    title: '文檔',
    subtitle: 'WebOS 完整開發文檔',
    search: '搜尋文檔...',
    sections: {
      gettingStarted: {
        title: '快速開始',
        items: {
          introduction: '介紹',
          installation: '安裝',
          quickStart: '快速入門'
        }
      },
      components: {
        title: '組件',
        items: {
          desktop: '桌面',
          window: '視窗',
          taskbar: '工作列',
          startMenu: '開始功能表',
          contextMenu: '右鍵功能表'
        }
      },
      hooks: {
        title: 'Hooks',
        items: {
          useTheme: 'useTheme',
          useMediaQuery: 'useMediaQuery',
          useTranslation: 'useTranslation'
        }
      },
      theming: {
        title: '佈景主題',
        items: {
          overview: '概覽',
          darkMode: '暗色模式',
          customThemes: '自訂主題'
        }
      },
      api: {
        title: 'API 參考',
        items: {
          kernel: '核心',
          fileSystem: '檔案系統',
          userManager: '使用者管理'
        }
      }
    },
    content: {
      introduction: {
        title: '介紹',
        text: 'WebOS 是一個基於 React 和 Next.js 構建的完整網頁作業系統。它在瀏覽器中提供完整的桌面環境，包括視窗管理、檔案系統、內建應用等功能。',
        features: [
          '完整的視窗管理：拖曳、調整大小、最小化、最大化',
          '虛擬檔案系統，支援加密儲存',
          '內建應用：瀏覽器、檔案管理員、設定、終端機',
          '佈景主題系統，支援亮色/暗色模式',
          '多語言支援',
          '觸控和平板模式支援'
        ]
      },
      installation: {
        title: '安裝',
        text: '在你的專案中開始使用 WebOS。',
        steps: [
          { label: '複製儲存庫', code: 'git clone https://github.com/DingDing-bbb/webos.git' },
          { label: '安裝相依套件', code: 'cd webos\nbun install' },
          { label: '啟動開發伺服器', code: 'bun run dev' }
        ]
      },
      quickStart: {
        title: '快速入門',
        text: 'WebOS 提供多個進入點用於不同的使用情境。',
        routes: [
          { path: '/', desc: '重新導向至介紹頁面' },
          { path: '/intro', desc: '介紹和功能概覽' },
          { path: '/docs', desc: '文檔頁面' },
          { path: '/app', desc: 'WebOS 應用程式' }
        ]
      }
    },
    footer: '© 2024 WebOS. MIT 授權條款'
  }
}

type LangKey = 'en' | 'zh' | 'tw'
type SectionKey = 'introduction' | 'installation' | 'quickStart'

export function DocsPage() {
  const [lang, setLang] = useState<LangKey>('zh')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState<SectionKey>('introduction')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const t = translations[lang]
  const isDark = theme === 'dark'
  
  // 样式配置
  const styles = {
    bg: isDark ? '#0f172a' : '#f8fafc',
    bgSecondary: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#1e293b',
    muted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    accent: '#3b82f6',
    accentBg: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
    codeBg: isDark ? '#1e293b' : '#f1f5f9',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
  }

  const content = t.content[activeSection]

  return (
    <main style={{ 
      minHeight: '100vh', 
      background: styles.bg, 
      color: styles.text,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 顶部导航 */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        padding: '0 32px',
        background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(248,250,252,0.95)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${styles.border}`,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            WebOS Docs
          </h1>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="/intro" style={{ color: styles.muted, textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}>{t.nav.intro}</a>
            <a href="/docs" style={{ color: styles.accent, textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>{t.nav.docs}</a>
            <a href="/app" style={{ color: styles.muted, textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}>{t.nav.app}</a>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* 搜索框 */}
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder={t.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '240px',
                padding: '8px 16px',
                paddingLeft: '36px',
                background: styles.cardBg,
                border: `1px solid ${styles.border}`,
                borderRadius: '8px',
                color: styles.text,
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: styles.muted }}>🔍</span>
          </div>
          
          {/* 语言选择 */}
          <select 
            value={lang} 
            onChange={e => setLang(e.target.value as LangKey)} 
            style={{
              background: styles.cardBg,
              color: styles.text,
              border: `1px solid ${styles.border}`,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="zh">简体中文</option>
            <option value="tw">繁體中文</option>
            <option value="en">English</option>
          </select>
          
          {/* 主题切换 */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            style={{
              background: styles.cardBg,
              border: `1px solid ${styles.border}`,
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          
          {/* 侧边栏切换 */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: styles.text
            }}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* 主内容区 */}
      <div style={{ display: 'flex', paddingTop: '64px', flex: 1 }}>
        {/* 侧边栏 */}
        <aside style={{
          width: sidebarOpen ? '280px' : '0',
          minWidth: sidebarOpen ? '280px' : '0',
          background: styles.bgSecondary,
          borderRight: `1px solid ${styles.border}`,
          padding: sidebarOpen ? '24px 0' : '0',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          position: 'sticky',
          top: '64px',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto'
        }}>
          {sidebarOpen && (
            <div>
              {Object.entries(t.sections).map(([sectionKey, section]) => (
                <div key={sectionKey} style={{ marginBottom: '24px' }}>
                  <div style={{
                    padding: '8px 24px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: styles.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {section.title}
                  </div>
                  {Object.entries(section.items).map(([itemKey, item]) => (
                    <div
                      key={itemKey}
                      onClick={() => setActiveSection(itemKey as SectionKey)}
                      style={{
                        padding: '10px 24px',
                        cursor: 'pointer',
                        color: activeSection === itemKey ? styles.accent : styles.text,
                        background: activeSection === itemKey ? styles.accentBg : 'transparent',
                        borderRight: activeSection === itemKey ? `2px solid ${styles.accent}` : '2px solid transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* 内容区 */}
        <article style={{
          flex: 1,
          padding: '48px 64px',
          maxWidth: '900px',
          overflowY: 'auto'
        }}>
          {/* 标题 */}
          <h1 style={{
            fontSize: '42px',
            fontWeight: '700',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {content.title}
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: styles.muted,
            marginBottom: '48px',
            lineHeight: 1.7
          }}>
            {content.text}
          </p>

          {/* 功能列表 */}
          {'features' in content && content.features && (
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                {lang === 'en' ? 'Features' : lang === 'zh' ? '功能特点' : '功能特點'}
              </h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {content.features.map((feature: string, i: number) => (
                  <li key={i} style={{
                    padding: '16px',
                    background: styles.cardBg,
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: `1px solid ${styles.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ color: '#22c55e' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 安装步骤 */}
          {'steps' in content && content.steps && (
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                {lang === 'en' ? 'Installation Steps' : lang === 'zh' ? '安装步骤' : '安裝步驟'}
              </h2>
              {content.steps.map((step: { label: string; code: string }, i: number) => (
                <div key={i} style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '14px', color: styles.muted, marginBottom: '8px' }}>
                    {i + 1}. {step.label}
                  </div>
                  <pre style={{
                    background: styles.codeBg,
                    padding: '16px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    overflow: 'auto',
                    border: `1px solid ${styles.border}`
                  }}>
                    <code>{step.code}</code>
                  </pre>
                </div>
              ))}
            </section>
          )}

          {/* 路由表格 */}
          {'routes' in content && content.routes && (
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                {lang === 'en' ? 'Routes' : lang === 'zh' ? '路由' : '路由'}
              </h2>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: styles.cardBg,
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ background: styles.codeBg }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: `1px solid ${styles.border}` }}>Path</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: `1px solid ${styles.border}` }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {content.routes.map((route: { path: string; desc: string }, i: number) => (
                    <tr key={i}>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${styles.border}`, fontFamily: 'monospace', color: styles.accent }}>
                        {route.path}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${styles.border}`, color: styles.muted }}>
                        {route.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* 快速导航 */}
          <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '64px',
            paddingTop: '32px',
            borderTop: `1px solid ${styles.border}`
          }}>
            <button
              onClick={() => {
                const sections = Object.keys(t.content) as SectionKey[]
                const currentIndex = sections.indexOf(activeSection)
                if (currentIndex > 0) setActiveSection(sections[currentIndex - 1])
              }}
              style={{
                padding: '12px 20px',
                background: styles.cardBg,
                border: `1px solid ${styles.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                color: styles.text
              }}
            >
              ← {lang === 'en' ? 'Previous' : lang === 'zh' ? '上一页' : '上一頁'}
            </button>
            <button
              onClick={() => {
                const sections = Object.keys(t.content) as SectionKey[]
                const currentIndex = sections.indexOf(activeSection)
                if (currentIndex < sections.length - 1) setActiveSection(sections[currentIndex + 1])
              }}
              style={{
                padding: '12px 20px',
                background: styles.cardBg,
                border: `1px solid ${styles.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                color: styles.text
              }}
            >
              {lang === 'en' ? 'Next' : lang === 'zh' ? '下一页' : '下一頁'} →
            </button>
          </nav>
        </article>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        borderTop: `1px solid ${styles.border}`,
        color: styles.muted,
        fontSize: '14px'
      }}>
        {t.footer}
      </footer>
    </main>
  )
}

export default DocsPage
