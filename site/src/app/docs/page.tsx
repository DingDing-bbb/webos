'use client';

import { useState, useEffect, useCallback, useTransition, memo, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type DocID = 'framework' | 'sdk-overview' | 'sdk-quickstart' | 'sdk-structure' | 'sdk-manifest' | 'sdk-api' | 'sdk-install' | 'sdk-permissions' | 'sdk-examples' | 'sdk-publish' | 'sdk-bestpractices' | 'dev' | 'license';
type Lang = 'zh' | 'zh-TW' | 'en';
type Theme = 'light' | 'dark';

const allDocIDs: DocID[] = [
  'framework', 'sdk-overview', 'sdk-quickstart', 'sdk-structure', 'sdk-manifest',
  'sdk-api', 'sdk-install', 'sdk-permissions', 'sdk-examples', 'sdk-publish', 'sdk-bestpractices', 'dev', 'license'
];

const defaultDocID: DocID = 'framework';

const i18n = {
  zh: {
    nav: { intro: '介绍', docs: '文档', app: '启动', github: 'GitHub' },
    sidebar: { main: '文档', framework: 'UI 框架', sdk: '应用开发 SDK', dev: '开发者插件', license: '开源协议' },
    titles: {
      'framework': 'UI 框架', 'sdk-overview': '概述', 'sdk-quickstart': '快速开始',
      'sdk-structure': '应用结构', 'sdk-manifest': '应用清单', 'sdk-api': 'API 参考',
      'sdk-install': '安装方法', 'sdk-permissions': '权限系统', 'sdk-examples': '示例代码',
      'sdk-publish': '发布应用', 'sdk-bestpractices': '最佳实践', 'dev': '开发者插件', 'license': 'MIT 开源协议'
    },
    breadcrumb: { docs: '文档' },
    articleNav: { prev: '上一篇', next: '下一篇' },
    onThisPage: '本页内容',
    footer: '© 2026 WebOS. MIT License.',
    copy: '复制',
    copied: '已复制',
  },
  'zh-TW': {
    nav: { intro: '介紹', docs: '文檔', app: '啟動', github: 'GitHub' },
    sidebar: { main: '文檔', framework: 'UI 框架', sdk: '應用開發 SDK', dev: '開發者插件', license: '開源協議' },
    titles: {
      'framework': 'UI 框架', 'sdk-overview': '概述', 'sdk-quickstart': '快速開始',
      'sdk-structure': '應用結構', 'sdk-manifest': '應用清單', 'sdk-api': 'API 參考',
      'sdk-install': '安裝方法', 'sdk-permissions': '權限系統', 'sdk-examples': '示例代碼',
      'sdk-publish': '發布應用', 'sdk-bestpractices': '最佳實踐', 'dev': '開發者插件', 'license': 'MIT 開源協議'
    },
    breadcrumb: { docs: '文檔' },
    articleNav: { prev: '上一篇', next: '下一篇' },
    onThisPage: '本頁內容',
    footer: '© 2026 WebOS. MIT License.',
    copy: '複製',
    copied: '已複製',
  },
  en: {
    nav: { intro: 'Intro', docs: 'Docs', app: 'Launch', github: 'GitHub' },
    sidebar: { main: 'Documentation', framework: 'UI Framework', sdk: 'App SDK', dev: 'Developer Plugin', license: 'License' },
    titles: {
      'framework': 'UI Framework', 'sdk-overview': 'Overview', 'sdk-quickstart': 'Quick Start',
      'sdk-structure': 'App Structure', 'sdk-manifest': 'Manifest', 'sdk-api': 'API Reference',
      'sdk-install': 'Installation', 'sdk-permissions': 'Permissions', 'sdk-examples': 'Examples',
      'sdk-publish': 'Publishing', 'sdk-bestpractices': 'Best Practices', 'dev': 'Developer Plugin', 'license': 'MIT License'
    },
    breadcrumb: { docs: 'Documentation' },
    articleNav: { prev: 'Previous', next: 'Next' },
    onThisPage: 'On This Page',
    footer: '© 2026 WebOS. MIT License.',
    copy: 'Copy',
    copied: 'Copied',
  },
} as const;

const SunIcon = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
));

const MoonIcon = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
));

const GitHubIcon = memo(() => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
));

const ChevronLeft = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
));

const ChevronRight = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
    <path d="M9 18l6-6-6-6"/>
  </svg>
));

const CopyIcon = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
));

const CheckIcon = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
));

const MenuIcon = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
    <path d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
));

const CloseIcon = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
));

const CodeBlock = memo(function CodeBlock({ code, lang, isDark }: { code: string; lang: Lang; isDark: boolean }) {
  const [copied, setCopied] = useState(false);
  const t = i18n[lang];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className={`code-block ${isDark ? 'dark' : 'light'}`}>
      <button onClick={handleCopy} className="copy-btn">
        {copied ? <CheckIcon /> : <CopyIcon />} {copied ? t.copied : t.copy}
      </button>
      <pre><code>{code}</code></pre>
    </div>
  );
});

const translate = (lang: Lang, zh: string, zhTW: string, en: string) => {
  if (lang === 'zh') return zh;
  if (lang === 'zh-TW') return zhTW;
  return en;
};

function DocContent({ docID, lang, isDark }: { docID: DocID; lang: Lang; isDark: boolean }) {
  const c = (zh: string, zhTW: string, en: string) => translate(lang, zh, zhTW, en);
  
  const docs: Record<string, React.ReactNode> = {
    'framework': (
      <>
        <section id="overview">
          <p className="doc-lead">{c('WebOS UI 框架是专为 Web 操作系统设计的组件库，提供完整的桌面环境 UI 组件。作为独立的 npm 包发布，可单独使用。', 'WebOS UI 框架是專為 Web 操作系統設計的組件庫，提供完整的桌面環境 UI 組件。作為獨立的 npm 包發布，可單獨使用。', 'WebOS UI Framework is a component library designed for web operating systems, providing complete desktop UI components. Published as a standalone npm package.')}</p>
        </section>
        <section id="design">
          <h2>{c('设计系统', '設計系統', 'Design System')}</h2>
          <p>{c('支持 Classic 和 Modern 两种风格。', '支持 Classic 和 Modern 兩種風格。', 'Supports Classic and Modern styles.')}</p>
          <div className="card-grid">
            <div className="card">
              <h4>Classic</h4>
              <ul><li>{c('方正边角', '方正邊角', 'Square corners')}</li><li>{c('简约动画', '簡約動畫', 'Simple animations')}</li></ul>
            </div>
            <div className="card">
              <h4>Modern</h4>
              <ul><li>{c('圆角设计', '圓角設計', 'Rounded corners')}</li><li>{c('毛玻璃效果', '毛玻璃效果', 'Glassmorphism')}</li></ul>
            </div>
          </div>
        </section>
        <section id="components">
          <h2>{c('组件列表', '組件列表', 'Components')}</h2>
          <div className="tag-list">
            {['Button', 'Modal', 'Input', 'Table', 'Tabs', 'Toast', 'Desktop', 'Window', 'Taskbar'].map(name => <span key={name} className="tag">{name}</span>)}
          </div>
          <CodeBlock code={`import { Button, Modal, Desktop } from '@webos/ui';

<Button variant="primary">Primary</Button>
<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  Content
</Modal>`} lang={lang} isDark={isDark} />
        </section>
        <section id="packages">
          <h2>{c('包结构', '包結構', 'Package Structure')}</h2>
          <CodeBlock code={`packages/os/packages/ui/
├── src/
│   ├── base/          # Button, Input, etc.
│   ├── desktop/       # Window, Taskbar, etc.
│   ├── feedback/      # Modal, Toast, etc.
│   ├── layout/        # Flex, Grid, etc.
│   └── theme/
└── package.json`} lang={lang} isDark={isDark} />
        </section>
      </>
    ),
    'sdk-overview': (
      <>
        <p className="doc-lead">{c('WebOS 应用开发 SDK 是独立的 npm 包，基于 React 技术栈，支持 TypeScript。', 'WebOS 應用開發 SDK 是獨立的 npm 包，基於 React 技術棧，支持 TypeScript。', 'WebOS App SDK is a standalone npm package built on React with TypeScript support.')}</p>
        <section id="features">
          <h2>{c('核心特性', '核心特性', 'Features')}</h2>
          <div className="card-grid">
            {[c('完整的 API 支持', '完整的 API 支持', 'Complete API'), c('标准化打包格式', '標準化打包格式', 'Standard Package'), c('权限管理系统', '權限管理系統', 'Permissions'), c('国际化支持', '國際化支持', 'i18n Support')].map((item, i) => <div key={i} className="card small">{item}</div>)}
          </div>
        </section>
        <section id="tech">
          <h2>{c('技术栈', '技術棧', 'Tech Stack')}</h2>
          <ul><li><strong>React 19</strong></li><li><strong>TypeScript</strong></li><li><strong>CSS Variables</strong></li></ul>
        </section>
        <section id="packages">
          <h2>{c('SDK 包结构', 'SDK 包結構', 'SDK Package Structure')}</h2>
          <CodeBlock code={`packages/os/packages/
├── kernel/           # @webos/kernel
├── apps/             # 内置应用示例
│   ├── com.os.clock/
│   ├── com.os.settings/
│   └── com.os.terminal/
└── i18n/             # @webos/i18n`} lang={lang} isDark={isDark} />
        </section>
      </>
    ),
    'sdk-quickstart': (
      <>
        <section id="step1">
          <h2>1. {c('创建项目', '創建項目', 'Create Project')}</h2>
          <CodeBlock code={`mkdir -p com.example.hello/src
cd com.example.hello`} lang={lang} isDark={isDark} />
        </section>
        <section id="step2">
          <h2>2. {c('创建清单', '創建清單', 'Create Manifest')}</h2>
          <CodeBlock code={`{
  "id": "com.example.hello",
  "name": "Hello World",
  "version": "1.0.0",
  "permissions": ["storage"],
  "defaultWidth": 400,
  "defaultHeight": 300
}`} lang={lang} isDark={isDark} />
        </section>
        <section id="step3">
          <h2>3. {c('创建组件', '創建組件', 'Create Component')}</h2>
          <CodeBlock code={`import React, { useState } from 'react';

const HelloApp = () => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Hello WebOS!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Click</button>
    </div>
  );
};

export default HelloApp;`} lang={lang} isDark={isDark} />
        </section>
      </>
    ),
    'sdk-install': (
      <>
        <section id="store">
          <h2>{c('应用商店', '應用商店', 'App Store')}</h2>
          <CodeBlock code={`await window.webos.appStore.install('com.example.myapp');`} lang={lang} isDark={isDark} />
        </section>
        <section id="sideload">
          <h2>{c('侧载安装', '側載安裝', 'Sideloading')}</h2>
          <p>{c('将 .webosapp 文件直接安装到系统。', '將 .webosapp 文件直接安裝到系統。', 'Directly install .webosapp files.')}</p>
          <CodeBlock code={`const file = await window.webos.fs.pickFile({ accept: '.webosapp' });
await window.webos.appManager.installFromFile(file);`} lang={lang} isDark={isDark} />
        </section>
        <section id="url">
          <h2>URL {c('安装', '安裝', 'Install')}</h2>
          <CodeBlock code={`await window.webos.appManager.installFromUrl('https://example.com/app.webosapp');`} lang={lang} isDark={isDark} />
        </section>
      </>
    ),
    'sdk-api': (
      <>
        <section id="window">
          <h2>{c('窗口 API', '窗口 API', 'Window API')}</h2>
          <CodeBlock code={`const id = window.webos.window.open(appId, { title: 'Window' });
window.webos.window.close(id);
window.webos.window.minimize(id);
window.webos.window.maximize(id);`} lang={lang} isDark={isDark} />
        </section>
        <section id="fs">
          <h2>{c('文件系统 API', '文件系統 API', 'File System API')}</h2>
          <CodeBlock code={`const content = await window.webos.fs.read('/documents/note.txt');
await window.webos.fs.write('/documents/note.txt', blob);
await window.webos.fs.mkdir('/documents/new');
const files = await window.webos.fs.list('/documents');`} lang={lang} isDark={isDark} />
        </section>
        <section id="storage">
          <h2>{c('存储 API', '存儲 API', 'Storage API')}</h2>
          <CodeBlock code={`window.webos.storage.set('key', 'value');
const value = window.webos.storage.get('key');
window.webos.storage.remove('key');`} lang={lang} isDark={isDark} />
        </section>
        <section id="notify">
          <h2>{c('通知 API', '通知 API', 'Notification API')}</h2>
          <CodeBlock code={`window.webos.notification.show({
  title: '提示',
  message: '操作完成',
  type: 'success'
});`} lang={lang} isDark={isDark} />
        </section>
      </>
    ),
    'license': (
      <>
        <section id="mit">
          <h2>MIT License</h2>
          <div className="license-block">
            <p>Copyright (c) 2024-2026 WebOS Contributors</p>
            <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
            <p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
            <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
          </div>
        </section>
        <section id="third">
          <h2>{c('第三方开源库', '第三方開源庫', 'Third-Party Libraries')}</h2>
          <ul><li>React - MIT License</li><li>Next.js - MIT License</li><li>TypeScript - Apache 2.0 License</li><li>Tailwind CSS - MIT License</li><li>sql.js - MIT License</li></ul>
        </section>
      </>
    ),
  };

  return docs[docID] || <p>{c('内容编写中...', '內容編寫中...', 'Coming soon...')}</p>;
}

const TOC_ITEMS: Record<string, { id: string; titleKey: [string, string, string] }[]> = {
  'framework': [
    { id: 'overview', titleKey: ['概述', '概述', 'Overview'] },
    { id: 'design', titleKey: ['设计系统', '設計系統', 'Design System'] },
    { id: 'components', titleKey: ['组件', '組件', 'Components'] },
    { id: 'packages', titleKey: ['包结构', '包結構', 'Package Structure'] },
  ],
  'sdk-overview': [
    { id: 'features', titleKey: ['核心特性', '核心特性', 'Features'] },
    { id: 'tech', titleKey: ['技术栈', '技術棧', 'Tech Stack'] },
    { id: 'packages', titleKey: ['SDK 包', 'SDK 包', 'SDK Packages'] },
  ],
  'sdk-quickstart': [
    { id: 'step1', titleKey: ['创建项目', '創建項目', 'Create Project'] },
    { id: 'step2', titleKey: ['配置清单', '配置清單', 'Manifest'] },
    { id: 'step3', titleKey: ['编写代码', '編寫代碼', 'Write Code'] },
  ],
  'sdk-install': [
    { id: 'store', titleKey: ['应用商店', '應用商店', 'App Store'] },
    { id: 'sideload', titleKey: ['侧载安装', '側載安裝', 'Sideloading'] },
    { id: 'url', titleKey: ['URL 安装', 'URL 安裝', 'URL Install'] },
  ],
  'sdk-api': [
    { id: 'window', titleKey: ['窗口 API', '窗口 API', 'Window API'] },
    { id: 'fs', titleKey: ['文件系统', '文件系統', 'File System'] },
    { id: 'storage', titleKey: ['存储', '存儲', 'Storage'] },
    { id: 'notify', titleKey: ['通知', '通知', 'Notification'] },
  ],
  'license': [
    { id: 'mit', titleKey: ['MIT License', 'MIT License', 'MIT License'] },
    { id: 'third', titleKey: ['第三方库', '第三方庫', 'Third-Party'] },
  ],
};

export default function DocsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [lang, setLang] = useState<Lang>('zh');
  const [theme, setTheme] = useState<Theme>('light');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const sectionParam = searchParams.get('section');
  const currentDocID: DocID = allDocIDs.includes(sectionParam as DocID) ? sectionParam as DocID : defaultDocID;
  
  const t = i18n[lang];
  const currentIndex = allDocIDs.indexOf(currentDocID);
  const prevDoc = currentIndex > 0 ? allDocIDs[currentIndex - 1] : null;
  const nextDoc = currentIndex < allDocIDs.length - 1 ? allDocIDs[currentIndex + 1] : null;
  
  const toc = useMemo(() => (TOC_ITEMS[currentDocID] || []).map(item => ({
    id: item.id,
    title: translate(lang, ...item.titleKey),
  })), [currentDocID, lang]);
  
  const sdkDocs = useMemo(() => allDocIDs.filter(id => id.startsWith('sdk-')), []);
  const isDark = theme === 'dark';
  
  useEffect(() => {
    const savedLang = localStorage.getItem('webos-lang') as Lang;
    const savedTheme = localStorage.getItem('webos-theme') as Theme;
    if (savedLang && ['zh', 'zh-TW', 'en'].includes(savedLang)) setLang(savedLang);
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) setTheme(savedTheme);
    setMounted(true);
    
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
  
  const navigateToDoc = useCallback((docID: DocID) => {
    startTransition(() => {
      router.push(docID === defaultDocID ? '/docs' : `/docs?section=${docID}`, { scroll: false });
    });
  }, [router]);

  if (!mounted) {
    return <div className="loading-screen" />;
  }

  return (
    <div className={`docs-page ${isDark ? 'dark' : 'light'}`}>
      <style jsx global>{`
        .docs-page { min-height: 100vh; display: flex; flex-direction: column; font-family: system-ui, -apple-system, sans-serif; overscroll-behavior: none; }
        .docs-page.light { --bg: #fafafa; --text: #1a1a1a; --text-muted: rgba(0,0,0,0.5); --card-bg: rgba(0,0,0,0.02); --border: rgba(0,0,0,0.06); --header-bg: rgba(255,255,255,0.8); --code-bg: rgba(0,0,0,0.03); }
        .docs-page.dark { --bg: #0a0a0c; --text: #ffffff; --text-muted: rgba(255,255,255,0.5); --card-bg: rgba(255,255,255,0.03); --border: rgba(255,255,255,0.06); --header-bg: rgba(10,10,12,0.8); --code-bg: rgba(255,255,255,0.03); }
        .loading-screen { min-height: 100vh; background: var(--bg, #fafafa); }
        .docs-header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 56px; background: var(--header-bg); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px); border-bottom: 1px solid var(--border); }
        .docs-header-inner { max-width: 1400px; margin: 0 auto; padding: 0 24px; height: 100%; display: flex; align-items: center; justify-content: space-between; }
        .docs-logo { font-size: 17px; font-weight: 600; color: var(--text); text-decoration: none; }
        .docs-nav { display: flex; gap: 24px; }
        .docs-nav a { font-size: 14px; color: var(--text-muted); text-decoration: none; }
        .docs-nav span { font-size: 14px; font-weight: 500; color: var(--text); }
        .docs-actions { display: flex; align-items: center; gap: 8px; }
        .icon-btn { padding: 8px; background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; }
        .lang-select { padding: 6px 12px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 13px; cursor: pointer; outline: none; }
        .lang-select option { background: var(--bg); }
        .sidebar { width: 240px; position: fixed; top: 56px; left: 0; bottom: 0; padding: 28px 20px; overflow: auto; overscroll-behavior: contain; border-right: 1px solid var(--border); background: var(--bg); }
        .sidebar-title { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; font-weight: 500; }
        .sidebar-btn { width: 100%; padding: 10px 14px; background: transparent; border: none; border-radius: 8px; color: var(--text-muted); font-size: 14px; text-align: left; cursor: pointer; margin-bottom: 4px; }
        .sidebar-btn.active { background: var(--card-bg); color: var(--text); }
        .sidebar-section { margin-top: 20px; margin-bottom: 12px; padding: 10px 14px; color: var(--text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .sidebar-btn.sub { padding: 8px 14px 8px 24px; border-radius: 6px; margin-bottom: 2px; }
        .main-content { flex: 1; margin-left: 240px; margin-right: 200px; padding: 40px 56px; max-width: 820px; opacity: 1; transition: opacity 0.15s ease; }
        .main-content.pending { opacity: 0.6; }
        .breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; font-size: 13px; }
        .breadcrumb a { color: var(--text-muted); text-decoration: none; }
        .breadcrumb span { color: var(--text); }
        .doc-title { font-size: 32px; font-weight: 700; margin-bottom: 28px; letter-spacing: -0.5px; }
        .doc-lead { font-size: 16px; color: var(--text-muted); line-height: 1.7; margin-bottom: 24px; }
        .doc-content h2 { font-size: 22px; font-weight: 600; margin-top: 40px; margin-bottom: 16px; }
        .doc-content h3 { font-size: 18px; font-weight: 600; margin-top: 32px; margin-bottom: 12px; }
        .doc-content p { color: var(--text-muted); margin-bottom: 16px; line-height: 1.7; }
        .doc-content ul, .doc-content ol { color: var(--text-muted); padding-left: 22px; line-height: 2; margin-bottom: 16px; }
        .doc-content section { margin-bottom: 32px; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .card { padding: 20px; background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border); }
        .card h4 { font-size: 16px; font-weight: 500; margin-bottom: 10px; }
        .card ul { padding-left: 18px; line-height: 1.6; margin: 0; }
        .card.small { padding: 16px; font-size: 14px; }
        .tag-list { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
        .tag { padding: 8px 14px; background: var(--card-bg); border-radius: 8px; font-size: 14px; color: var(--text-muted); }
        .code-block { position: relative; margin: 20px 0; border-radius: 12px; overflow: hidden; background: var(--code-bg); border: 1px solid var(--border); }
        .code-block .copy-btn { position: absolute; top: 10px; right: 10px; padding: 6px 10px; background: transparent; border: 1px solid var(--border); border-radius: 6px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; color: var(--text-muted); }
        .code-block .copy-btn:hover { background: var(--card-bg); }
        .code-block pre { padding: 20px; margin: 0; overflow: auto; font-size: 13px; line-height: 1.6; color: var(--text); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        .license-block { padding: 24px; background: var(--card-bg); border-radius: 12px; font-size: 13px; line-height: 1.8; color: var(--text-muted); font-family: ui-monospace, monospace; }
        .article-nav { display: flex; justify-content: space-between; margin-top: 56px; padding-top: 28px; border-top: 1px solid var(--border); }
        .nav-btn { display: flex; flex-direction: column; padding: 16px 20px; background: transparent; border: 1px solid var(--border); border-radius: 12px; cursor: pointer; min-width: 180px; }
        .nav-btn.prev { align-items: flex-start; text-align: left; }
        .nav-btn.next { align-items: flex-end; text-align: right; }
        .nav-btn .label { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; margin-bottom: 6px; }
        .nav-btn .title { color: var(--text); font-size: 15px; font-weight: 500; }
        .toc-sidebar { width: 180px; position: fixed; top: 56px; right: 0; bottom: 0; padding: 100px 16px 32px; overflow: auto; overscroll-behavior: contain; }
        .toc-title { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; font-weight: 500; }
        .toc-link { display: block; padding: 6px 10px; color: var(--text-muted); font-size: 13px; text-decoration: none; border-radius: 6px; margin-bottom: 2px; }
        .toc-link:hover { background: var(--card-bg); }
        .docs-footer { margin-left: 240px; margin-right: 200px; padding: 28px; border-top: 1px solid var(--border); text-align: center; }
        .docs-footer p { font-size: 13px; color: var(--text-muted); }
        .mobile-menu-btn { display: none; padding: 8px; background: transparent; border: none; color: var(--text-muted); cursor: pointer; }
        .mobile-drawer { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.4); }
        .mobile-drawer aside { width: 280px; height: 100%; padding: 24px; background: var(--bg); overflow: auto; overscroll-behavior: contain; }
        .mobile-drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .mobile-drawer-header span { font-size: 15px; font-weight: 500; }
        @media (max-width: 768px) {
          .docs-nav { display: none; }
          .mobile-menu-btn { display: flex; }
          .sidebar { display: none; }
          .main-content { margin-left: 0; margin-right: 0; padding: 28px 20px; }
          .toc-sidebar { display: none; }
          .docs-footer { margin-left: 0; margin-right: 0; }
        }
      `}</style>
      
      <header className="docs-header">
        <div className="docs-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 28 }}>
            {isMobile && (
              <button className="mobile-menu-btn icon-btn" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </button>
            )}
            <a href="/intro" className="docs-logo">WebOS</a>
            {!isMobile && (
              <nav className="docs-nav">
                <a href="/intro">{t.nav.intro}</a>
                <span>{t.nav.docs}</span>
                <a href="/app">{t.nav.app}</a>
              </nav>
            )}
          </div>
          <div className="docs-actions">
            <a href="https://github.com/webos/webos" target="_blank" rel="noopener noreferrer" className="icon-btn" title={t.nav.github}>
              <GitHubIcon />
            </a>
            <button onClick={handleThemeChange} className="icon-btn">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <select value={lang} onChange={(e) => handleLangChange(e.target.value as Lang)} className="lang-select">
              <option value="zh">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobile-drawer" onClick={() => setMobileOpen(false)}>
          <aside onClick={e => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span>{t.sidebar.main}</span>
              <button className="icon-btn" onClick={() => setMobileOpen(false)}><CloseIcon /></button>
            </div>
            {allDocIDs.map(id => (
              <button key={id} className={`sidebar-btn ${currentDocID === id ? 'active' : ''}`} onClick={() => { navigateToDoc(id); setMobileOpen(false); }}>
                {t.titles[id]}
              </button>
            ))}
          </aside>
        </div>
      )}

      <div style={{ display: 'flex', paddingTop: 56, flex: 1 }}>
        {!isMobile && (
          <aside className="sidebar">
            <p className="sidebar-title">{t.sidebar.main}</p>
            <button className={`sidebar-btn ${currentDocID === 'framework' ? 'active' : ''}`} onClick={() => navigateToDoc('framework')}>{t.sidebar.framework}</button>
            <div className="sidebar-section">{t.sidebar.sdk}</div>
            {sdkDocs.map(id => (
              <button key={id} className={`sidebar-btn sub ${currentDocID === id ? 'active' : ''}`} onClick={() => navigateToDoc(id)}>{t.titles[id]}</button>
            ))}
            <button className={`sidebar-btn ${currentDocID === 'dev' ? 'active' : ''}`} style={{ marginTop: 20 }} onClick={() => navigateToDoc('dev')}>{t.sidebar.dev}</button>
            <button className={`sidebar-btn ${currentDocID === 'license' ? 'active' : ''}`} onClick={() => navigateToDoc('license')}>{t.sidebar.license}</button>
          </aside>
        )}

        <main className={`main-content ${isPending ? 'pending' : ''}`}>
          <div className="breadcrumb">
            <a href="/docs">{t.breadcrumb.docs}</a>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span>{t.titles[currentDocID]}</span>
          </div>

          <h1 className="doc-title">{t.titles[currentDocID]}</h1>

          <div className="doc-content">
            <DocContent docID={currentDocID} lang={lang} isDark={isDark} />
          </div>

          <nav className="article-nav">
            {prevDoc ? (
              <button className="nav-btn prev" onClick={() => navigateToDoc(prevDoc)}>
                <span className="label"><ChevronLeft />{t.articleNav.prev}</span>
                <span className="title">{t.titles[prevDoc]}</span>
              </button>
            ) : <div />}
            {nextDoc ? (
              <button className="nav-btn next" onClick={() => navigateToDoc(nextDoc)}>
                <span className="label">{t.articleNav.next}<ChevronRight /></span>
                <span className="title">{t.titles[nextDoc]}</span>
              </button>
            ) : <div />}
          </nav>
        </main>

        {!isMobile && toc.length > 0 && (
          <aside className="toc-sidebar">
            <p className="toc-title">{t.onThisPage}</p>
            {toc.map(item => (
              <a key={item.id} href={`#${item.id}`} className="toc-link">{item.title}</a>
            ))}
          </aside>
        )}
      </div>

      <footer className="docs-footer">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
