'use client';

import { useState } from 'react';

// Icons
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016.01 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.7.8.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
    <path d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const i18n = {
  zh: {
    nav: { intro: '介绍', docs: '文档', app: '启动' },
    sections: {
      framework: 'UI 框架',
      apps: '第三方应用',
      dev: '开发者插件',
    },
    footer: '© 2026 WebOS',
  },
  en: {
    nav: { intro: 'Intro', docs: 'Docs', app: 'Launch' },
    sections: {
      framework: 'UI Framework',
      apps: 'Third-party Apps',
      dev: 'Developer Plugin',
    },
    footer: '© 2026 WebOS',
  },
};

type Lang = 'zh' | 'en';
type Section = 'framework' | 'apps' | 'dev';

// 文档内容
const docContent: Record<Section, { title: string; content: React.ReactNode }> = {
  framework: {
    title: 'UI 框架文档',
    content: (
      <div style={{ lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>概述</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
          WebOS UI 框架是一个专为 Web 操作系统设计的组件库，提供完整的桌面环境 UI 组件、基础 UI 组件和工具函数。
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>设计系统</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>
          WebOS UI 框架采用双层设计系统，支持 Classic 和 Modern 两种风格：
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Classic 风格</h4>
            <ul style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', paddingLeft: '20px' }}>
              <li>方正边角（2px border-radius）</li>
              <li>实心背景</li>
              <li>简约动画</li>
            </ul>
          </div>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Modern 风格</h4>
            <ul style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', paddingLeft: '20px' }}>
              <li>圆角设计（8px border-radius）</li>
              <li>毛玻璃效果</li>
              <li>流畅动画</li>
            </ul>
          </div>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>组件列表</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {['Button 按钮', 'Icon 图标', 'Modal 模态框', 'Input 输入框', 'Select 选择器', 'Table 表格', 'Tabs 标签页', 'Menu 菜单', 'Toast 轻提示', 'Desktop 桌面', 'Window 窗口', 'Taskbar 任务栏', 'StartMenu 开始菜单', 'ContextMenu 右键菜单'].map((item) => (
            <div key={item} style={{ 
              padding: '12px 16px', 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '6px',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.8)',
            }}>
              {item}
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>代码示例</h3>
        <pre style={{ 
          padding: '20px', 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '8px', 
          overflow: 'auto',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.8)',
        }}>
{`import { Button, Modal, Desktop } from '@ui';

// 按钮组件
<Button variant="primary">主按钮</Button>
<Button variant="secondary">次按钮</Button>

// 模态框
<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  内容
</Modal>

// 桌面环境
<Desktop apps={apps} wallpaper={{ type: 'soft' }} />`}
        </pre>
      </div>
    ),
  },
  apps: {
    title: '第三方应用开发',
    content: (
      <div style={{ lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>概述</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
          WebOS 支持安装和运行第三方应用程序。本文档介绍如何开发、打包和发布第三方应用。
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>应用包结构</h3>
        <pre style={{ 
          padding: '20px', 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '8px', 
          overflow: 'auto',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '24px',
        }}>
{`com.example.myapp/
├── appinfo.json      # 应用清单（必需）
├── package.json      # 依赖配置
├── src/
│   ├── index.tsx     # 入口组件
│   ├── icon.tsx      # 图标组件
│   └── styles.css    # 样式文件
└── public/           # 静态资源`}
        </pre>

        <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>应用清单 (appinfo.json)</h3>
        <pre style={{ 
          padding: '20px', 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '8px', 
          overflow: 'auto',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '24px',
        }}>
{`{
  "id": "com.example.myapp",
  "name": "My Application",
  "version": "1.0.0",
  "author": { "name": "Developer" },
  "permissions": ["storage", "network"],
  "defaultWidth": 800,
  "defaultHeight": 600,
  "resizable": true
}`}
        </pre>

        <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>API 示例</h3>
        <pre style={{ 
          padding: '20px', 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '8px', 
          overflow: 'auto',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.8)',
        }}>
{`// 访问 WebOS API
const { fs, notification, i18n } = window.webos;

// 读取文件
const data = await fs.read('/documents/note.txt');

// 显示通知
notification.show({
  title: '提示',
  message: '操作完成',
  type: 'success'
});

// 国际化
const text = i18n.t('myapp.title');`}
        </pre>
      </div>
    ),
  },
  dev: {
    title: '开发者插件',
    content: (
      <div style={{ lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>概述</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
          开发者插件允许在系统启动后强制重置系统，主要用于开发和调试目的。
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>安装方式</h3>
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
            在 OOBE（首次启动向导）界面或正常使用时：
          </p>
          <ol style={{ color: 'rgba(255,255,255,0.6)', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}>按 <code style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>F12</code> 打开开发者工具</li>
            <li style={{ marginBottom: '8px' }}>切换到 <code style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Console</code> 标签</li>
            <li style={{ marginBottom: '8px' }}>输入命令并回车：</li>
          </ol>
          <pre style={{ 
            padding: '16px', 
            background: 'rgba(0,0,0,0.3)', 
            borderRadius: '8px', 
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)',
          }}>
{`webosInstallDevPlugin()`}
          </pre>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>控制台命令</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <code style={{ color: '#10b981', fontSize: '14px' }}>webosCanResetSystem()</code>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '8px' }}>检查插件是否已安装</p>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <code style={{ color: '#f59e0b', fontSize: '14px' }}>webosResetSystem()</code>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '8px' }}>清除所有数据并重启系统（不可逆）</p>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <code style={{ color: '#ef4444', fontSize: '14px' }}>webosUninstallDevPlugin()</code>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '8px' }}>卸载开发者插件</p>
          </div>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>安全说明</h3>
        <ul style={{ color: 'rgba(255,255,255,0.6)', paddingLeft: '24px' }}>
          <li style={{ marginBottom: '8px' }}>插件存储在浏览器 localStorage 中</li>
          <li style={{ marginBottom: '8px' }}>OOBE 阶段可免密安装</li>
          <li style={{ marginBottom: '8px' }}>正常使用阶段需要管理员密码</li>
          <li style={{ marginBottom: '8px' }}>重置会清除所有本地数据</li>
        </ul>
      </div>
    ),
  },
};

export default function DocsPage() {
  const [lang, setLang] = useState<Lang>('zh');
  const [section, setSection] = useState<Section>('framework');
  const [mobileOpen, setMobileOpen] = useState(false);

  const t = i18n[lang];
  const sections: Section[] = ['framework', 'apps', 'dev'];

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
        background: 'rgba(10, 10, 10, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                display: 'none',
                padding: '8px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
              }}
            >
              <MenuIcon />
            </button>
            <a href="/intro" style={{ fontSize: '20px', fontWeight: 600, color: '#fff', textDecoration: 'none' }}>
              WebOS
            </a>
            <nav style={{ display: 'flex', gap: '20px' }}>
              <a href="/intro" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                {t.nav.intro}
              </a>
              <span style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>
                {t.nav.docs}
              </span>
              <a href="/app" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                {t.nav.app}
              </a>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="https://github.com/DingDing-bbb/webos"
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '8px', color: 'rgba(255,255,255,0.6)', display: 'flex' }}
            >
              <GithubIcon />
            </a>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
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

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
          }}
          onClick={() => setMobileOpen(false)}
        >
          <aside
            style={{
              width: '280px',
              height: '100%',
              padding: '24px',
              background: '#0a0a0a',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>文档目录</span>
              <button 
                onClick={() => setMobileOpen(false)}
                style={{ padding: '4px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
              >
                <CloseIcon />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sections.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSection(s); setMobileOpen(false); }}
                  style={{
                    padding: '12px 16px',
                    background: section === s ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: section === s ? '#fff' : 'rgba(255,255,255,0.6)',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {t.sections[s]}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* Main Layout */}
      <div style={{ flex: 1, display: 'flex', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Sidebar */}
        <aside style={{
          width: '240px',
          shrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.1)',
          padding: '32px 24px',
          position: 'sticky',
          top: '64px',
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
        }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
            文档
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                style={{
                  padding: '10px 14px',
                  background: section === s ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: section === s ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {t.sections[s]}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, minWidth: 0, padding: '48px 48px 48px 48px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '32px' }}>
            {docContent[section].title}
          </h1>
          {docContent[section].content}

          <footer style={{ marginTop: '64px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
            {t.footer}
          </footer>
        </main>
      </div>
    </div>
  );
}
