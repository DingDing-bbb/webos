'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type DocID = 'framework' | 'sdk-overview' | 'sdk-quickstart' | 'sdk-structure' | 'sdk-manifest' | 'sdk-api' | 'sdk-install' | 'sdk-permissions' | 'sdk-examples' | 'sdk-publish' | 'sdk-bestpractices' | 'dev' | 'license';
type Lang = 'zh' | 'zh-TW' | 'en';
type Theme = 'light' | 'dark';

const allDocIDs: DocID[] = [
  'framework', 'sdk-overview', 'sdk-quickstart', 'sdk-structure', 'sdk-manifest',
  'sdk-api', 'sdk-install', 'sdk-permissions', 'sdk-examples', 'sdk-publish', 'sdk-bestpractices', 'dev', 'license'
];

const defaultDocID: DocID = 'framework';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
    <path d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

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
};

function CodeBlock({ code, lang, theme }: { code: string; lang: Lang; theme: Theme }) {
  const [copied, setCopied] = useState(false);
  const t = i18n[lang];
  const isDark = theme === 'dark';

  return (
    <div style={{ position: 'relative', margin: '20px 0', borderRadius: '12px', overflow: 'hidden', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
      <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        style={{ position: 'absolute', top: '10px', right: '10px', padding: '6px 10px', background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '6px', color: copied ? '#22c55e' : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'), fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {copied ? <CheckIcon /> : <CopyIcon />} {copied ? t.copied : t.copy}
      </button>
      <pre style={{ padding: '20px', margin: 0, overflow: 'auto', fontSize: '13px', lineHeight: 1.6, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function getDocContent(docID: DocID, lang: Lang, theme: Theme): { content: React.ReactNode; toc: { id: string; title: string }[] } {
  const isZh = lang === 'zh';
  const isZhTW = lang === 'zh-TW';
  const c = (zh: string, zhTW: string, en: string) => isZh ? zh : isZhTW ? zhTW : en;
  const isDark = theme === 'dark';
  const textStyle = { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' };
  const h2Style = { fontSize: '22px', fontWeight: 600, marginTop: '40px', marginBottom: '16px' };
  const cardStyle = { padding: '20px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: '12px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` };
  
  if (docID === 'framework') {
    return {
      toc: [
        { id: 'overview', title: c('概述', '概述', 'Overview') },
        { id: 'design', title: c('设计系统', '設計系統', 'Design System') },
        { id: 'components', title: c('组件', '組件', 'Components') },
        { id: 'packages', title: c('包结构', '包結構', 'Package Structure') },
      ],
      content: (
        <>
          <section id="overview">
            <p style={{ fontSize: '16px', ...textStyle, lineHeight: 1.7, marginBottom: '24px' }}>
              {c('WebOS UI 框架是专为 Web 操作系统设计的组件库，提供完整的桌面环境 UI 组件。作为独立的 npm 包发布，可单独使用。', 'WebOS UI 框架是專為 Web 操作系統設計的組件庫，提供完整的桌面環境 UI 組件。作為獨立的 npm 包發布，可單獨使用。', 'WebOS UI Framework is a component library designed for web operating systems, providing complete desktop UI components. Published as a standalone npm package.')}
            </p>
          </section>
          <section id="design">
            <h2 style={h2Style}>{c('设计系统', '設計系統', 'Design System')}</h2>
            <p style={{ ...textStyle, marginBottom: '20px' }}>
              {c('支持 Classic 和 Modern 两种风格。', '支持 Classic 和 Modern 兩種風格。', 'Supports Classic and Modern styles.')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={cardStyle}>
                <h4 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '10px' }}>Classic</h4>
                <ul style={{ ...textStyle, fontSize: '14px', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li>{c('方正边角', '方正邊角', 'Square corners')}</li>
                  <li>{c('简约动画', '簡約動畫', 'Simple animations')}</li>
                </ul>
              </div>
              <div style={cardStyle}>
                <h4 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '10px' }}>Modern</h4>
                <ul style={{ ...textStyle, fontSize: '14px', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li>{c('圆角设计', '圓角設計', 'Rounded corners')}</li>
                  <li>{c('毛玻璃效果', '毛玻璃效果', 'Glassmorphism')}</li>
                </ul>
              </div>
            </div>
          </section>
          <section id="components">
            <h2 style={h2Style}>{c('组件列表', '組件列表', 'Components')}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
              {['Button', 'Modal', 'Input', 'Table', 'Tabs', 'Toast', 'Desktop', 'Window', 'Taskbar'].map(name => (
                <span key={name} style={{ padding: '8px 14px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: '8px', fontSize: '14px', ...textStyle }}>{name}</span>
              ))}
            </div>
            <CodeBlock code={`import { Button, Modal, Desktop } from '@webos/ui';

<Button variant="primary">Primary</Button>
<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  Content
</Modal>`} lang={lang} theme={theme} />
          </section>
          <section id="packages">
            <h2 style={h2Style}>{c('包结构', '包結構', 'Package Structure')}</h2>
            <CodeBlock code={`packages/os/packages/ui/
├── src/
│   ├── base/          # Button, Input, etc.
│   ├── desktop/       # Window, Taskbar, etc.
│   ├── feedback/      # Modal, Toast, etc.
│   ├── layout/        # Flex, Grid, etc.
│   └── theme/
└── package.json`} lang={lang} theme={theme} />
          </section>
        </>
      ),
    };
  }
  
  if (docID === 'sdk-overview') {
    return {
      toc: [{ id: 'features', title: c('核心特性', '核心特性', 'Features') }, { id: 'tech', title: c('技术栈', '技術棧', 'Tech Stack') }, { id: 'packages', title: c('SDK 包', 'SDK 包', 'SDK Packages') }],
      content: (
        <>
          <p style={{ fontSize: '16px', ...textStyle, lineHeight: 1.7, marginBottom: '24px' }}>
            {c('WebOS 应用开发 SDK 是独立的 npm 包，基于 React 技术栈，支持 TypeScript。', 'WebOS 應用開發 SDK 是獨立的 npm 包，基於 React 技術棧，支持 TypeScript。', 'WebOS App SDK is a standalone npm package built on React with TypeScript support.')}
          </p>
          <section id="features">
            <h2 style={h2Style}>{c('核心特性', '核心特性', 'Features')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {[c('完整的 API 支持', '完整的 API 支持', 'Complete API'), c('标准化打包格式', '標準化打包格式', 'Standard Package'), c('权限管理系统', '權限管理系統', 'Permissions'), c('国际化支持', '國際化支持', 'i18n Support')].map((item, i) => (
                <div key={i} style={{ ...cardStyle, padding: '16px', fontSize: '14px' }}>{item}</div>
              ))}
            </div>
          </section>
          <section id="tech">
            <h2 style={h2Style}>{c('技术栈', '技術棧', 'Tech Stack')}</h2>
            <ul style={{ ...textStyle, paddingLeft: '22px', lineHeight: 2 }}>
              <li><strong>React 19</strong></li>
              <li><strong>TypeScript</strong></li>
              <li><strong>CSS Variables</strong></li>
            </ul>
          </section>
          <section id="packages">
            <h2 style={h2Style}>{c('SDK 包结构', 'SDK 包結構', 'SDK Package Structure')}</h2>
            <CodeBlock code={`packages/os/packages/
├── kernel/           # @webos/kernel
├── apps/             # 内置应用示例
│   ├── com.os.clock/
│   ├── com.os.settings/
│   └── com.os.terminal/
└── i18n/             # @webos/i18n`} lang={lang} theme={theme} />
          </section>
        </>
      ),
    };
  }
  
  if (docID === 'sdk-quickstart') {
    return {
      toc: [
        { id: 'step1', title: c('创建项目', '創建項目', 'Create Project') },
        { id: 'step2', title: c('配置清单', '配置清單', 'Manifest') },
        { id: 'step3', title: c('编写代码', '編寫代碼', 'Write Code') },
      ],
      content: (
        <>
          <section id="step1">
            <h2 style={{ ...h2Style, marginTop: '24px' }}>1. {c('创建项目', '創建項目', 'Create Project')}</h2>
            <CodeBlock code={`mkdir -p com.example.hello/src
cd com.example.hello`} lang={lang} theme={theme} />
          </section>
          <section id="step2">
            <h2 style={{ ...h2Style, marginTop: '32px' }}>2. {c('创建清单', '創建清單', 'Create Manifest')}</h2>
            <CodeBlock code={`{
  "id": "com.example.hello",
  "name": "Hello World",
  "version": "1.0.0",
  "permissions": ["storage"],
  "defaultWidth": 400,
  "defaultHeight": 300
}`} lang={lang} theme={theme} />
          </section>
          <section id="step3">
            <h2 style={{ ...h2Style, marginTop: '32px' }}>3. {c('创建组件', '創建組件', 'Create Component')}</h2>
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

export default HelloApp;`} lang={lang} theme={theme} />
          </section>
        </>
      ),
    };
  }
  
  if (docID === 'sdk-install') {
    return {
      toc: [
        { id: 'store', title: c('应用商店', '應用商店', 'App Store') },
        { id: 'sideload', title: c('侧载安装', '側載安裝', 'Sideloading') },
        { id: 'url', title: 'URL 安装' },
      ],
      content: (
        <>
          <section id="store">
            <h2 style={{ ...h2Style, marginTop: '24px' }}>{c('应用商店', '應用商店', 'App Store')}</h2>
            <CodeBlock code={`await window.webos.appStore.install('com.example.myapp');`} lang={lang} theme={theme} />
          </section>
          <section id="sideload">
            <h2 style={{ ...h2Style, marginTop: '32px' }}>{c('侧载安装', '側載安裝', 'Sideloading')}</h2>
            <p style={{ ...textStyle, marginBottom: '16px' }}>{c('将 .webosapp 文件直接安装到系统。', '將 .webosapp 文件直接安裝到系統。', 'Directly install .webosapp files.')}</p>
            <CodeBlock code={`const file = await window.webos.fs.pickFile({ accept: '.webosapp' });
await window.webos.appManager.installFromFile(file);`} lang={lang} theme={theme} />
          </section>
          <section id="url">
            <h2 style={{ ...h2Style, marginTop: '32px' }}>URL {c('安装', '安裝', 'Install')}</h2>
            <CodeBlock code={`await window.webos.appManager.installFromUrl('https://example.com/app.webosapp');`} lang={lang} theme={theme} />
          </section>
        </>
      ),
    };
  }
  
  if (docID === 'sdk-api') {
    return {
      toc: [
        { id: 'window', title: c('窗口 API', '窗口 API', 'Window API') },
        { id: 'fs', title: c('文件系统', '文件系統', 'File System') },
        { id: 'storage', title: c('存储', '存儲', 'Storage') },
        { id: 'notify', title: c('通知', '通知', 'Notification') },
      ],
      content: (
        <>
          <section id="window">
            <h2 style={{ ...h2Style, marginTop: '24px' }}>{c('窗口 API', '窗口 API', 'Window API')}</h2>
            <CodeBlock code={`const id = window.webos.window.open(appId, { title: 'Window' });
window.webos.window.close(id);
window.webos.window.minimize(id);
window.webos.window.maximize(id);`} lang={lang} theme={theme} />
          </section>
          <section id="fs">
            <h2 style={{ ...h2Style, marginTop: '32px' }}>{c('文件系统 API', '文件系統 API', 'File System API')}</h2>
            <CodeBlock code={`const content = await window.webos.fs.read('/documents/note.txt');
await window.webos.fs.write('/documents/note.txt', blob);
await window.webos.fs.mkdir('/documents/new');
const files = await window.webos.fs.list('/documents');`} lang={lang} theme={theme} />
          </section>
          <section id="storage">
            <h2 style={{ ...h2Style, marginTop: '32px' }}>{c('存储 API', '存儲 API', 'Storage API')}</h2>
            <CodeBlock code={`window.webos.storage.set('key', 'value');
const value = window.webos.storage.get('key');
window.webos.storage.remove('key');`} lang={lang} theme={theme} />
          </section>
          <section id="notify">
            <h2 style={{ ...h2Style, marginTop: '32px' }}>{c('通知 API', '通知 API', 'Notification API')}</h2>
            <CodeBlock code={`window.webos.notification.show({
  title: '提示',
  message: '操作完成',
  type: 'success'
});`} lang={lang} theme={theme} />
          </section>
        </>
      ),
    };
  }
  
  if (docID === 'license') {
    return {
      toc: [{ id: 'mit', title: 'MIT License' }, { id: 'third', title: c('第三方库', '第三方庫', 'Third-Party') }],
      content: (
        <>
          <section id="mit">
            <h2 style={{ ...h2Style, marginTop: '24px' }}>MIT License</h2>
            <div style={{ padding: '24px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: '12px', fontSize: '13px', lineHeight: 1.8, ...textStyle, fontFamily: 'ui-monospace, monospace' }}>
              <p style={{ marginBottom: '16px' }}>Copyright (c) 2024-2026 WebOS Contributors</p>
              <p style={{ marginBottom: '16px' }}>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
              <p style={{ marginBottom: '16px' }}>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
              <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
            </div>
          </section>
          <section id="third">
            <h2 style={h2Style}>{c('第三方开源库', '第三方開源庫', 'Third-Party Libraries')}</h2>
            <ul style={{ ...textStyle, paddingLeft: '22px', lineHeight: 2 }}>
              <li>React - MIT License</li>
              <li>Next.js - MIT License</li>
              <li>TypeScript - Apache 2.0 License</li>
              <li>Tailwind CSS - MIT License</li>
              <li>sql.js - MIT License</li>
            </ul>
          </section>
        </>
      ),
    };
  }
  
  return { toc: [], content: <p style={textStyle}>{c('内容编写中...', '內容編寫中...', 'Coming soon...')}</p> };
}

export default function DocsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [lang, setLang] = useState<Lang>('zh');
  const [theme, setTheme] = useState<Theme>('light');
  const [opacity, setOpacity] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const sectionParam = searchParams.get('section');
  const currentDocID: DocID = allDocIDs.includes(sectionParam as DocID) ? sectionParam as DocID : defaultDocID;
  
  const t = i18n[lang];
  const currentIndex = allDocIDs.indexOf(currentDocID);
  const prevDoc = currentIndex > 0 ? allDocIDs[currentIndex - 1] : null;
  const nextDoc = currentIndex < allDocIDs.length - 1 ? allDocIDs[currentIndex + 1] : null;
  const { content, toc } = getDocContent(currentDocID, lang, theme);
  
  const sdkDocs = allDocIDs.filter(id => id.startsWith('sdk-'));
  
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
  
  const handleLangChange = (newLang: Lang) => { setLang(newLang); localStorage.setItem('webos-lang', newLang); };
  const handleThemeChange = () => { const newTheme = theme === 'dark' ? 'light' : 'dark'; setTheme(newTheme); localStorage.setItem('webos-theme', newTheme); };
  
  const navigateToDoc = useCallback((docID: DocID) => {
    setOpacity(0);
    setTimeout(() => {
      router.push(docID === defaultDocID ? '/docs' : `/docs?section=${docID}`, { scroll: false });
      setTimeout(() => { setOpacity(1); window.scrollTo({ top: 0, behavior: 'auto' }); }, 50);
    }, 100);
  }, [router]);
  
  useEffect(() => {
    setOpacity(0);
    const timer = setTimeout(() => setOpacity(1), 50);
    return () => clearTimeout(timer);
  }, [currentDocID, lang]);
  
  const isDark = theme === 'dark';
  const bg = isDark ? '#0a0a0c' : '#fafafa';
  const text = isDark ? '#ffffff' : '#1a1a1a';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const headerBg = isDark ? 'rgba(10,10,12,0.8)' : 'rgba(255,255,255,0.8)';

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: bg }} />;
  }
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, color: text, fontFamily: 'system-ui, -apple-system, sans-serif', overscrollBehavior: 'none' }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '56px', background: headerBg, backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '28px' }}>
            {isMobile && (
              <button onClick={() => setMobileOpen(true)} style={{ padding: '8px', background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer' }}>
                <MenuIcon />
              </button>
            )}
            <a href="/intro" style={{ fontSize: '17px', fontWeight: 600, color: text, textDecoration: 'none' }}>WebOS</a>
            {!isMobile && (
              <nav style={{ display: 'flex', gap: '24px' }}>
                <a href="/intro" style={{ fontSize: '14px', color: textMuted, textDecoration: 'none' }}>{t.nav.intro}</a>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{t.nav.docs}</span>
                <a href="/app" style={{ fontSize: '14px', color: textMuted, textDecoration: 'none' }}>{t.nav.app}</a>
              </nav>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a href="https://github.com/webos/webos" target="_blank" rel="noopener noreferrer" style={{ padding: '8px', color: textMuted, display: 'flex', alignItems: 'center', textDecoration: 'none' }} title={t.nav.github}>
              <GitHubIcon />
            </a>
            <button onClick={handleThemeChange} style={{ padding: '8px', background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer' }}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <select value={lang} onChange={(e) => handleLangChange(e.target.value as Lang)} style={{ padding: '6px 12px', background: cardBg, border: `1px solid ${border}`, borderRadius: '8px', color: text, fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
              <option value="zh" style={{ background: bg }}>简体中文</option>
              <option value="zh-TW" style={{ background: bg }}>繁體中文</option>
              <option value="en" style={{ background: bg }}>English</option>
            </select>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileOpen(false)}>
          <aside style={{ width: '280px', height: '100%', padding: '24px', background: bg, overflow: 'auto', overscrollBehavior: 'contain' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '15px', fontWeight: 500 }}>{t.sidebar.main}</span>
              <button onClick={() => setMobileOpen(false)} style={{ padding: '4px', background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer' }}><CloseIcon /></button>
            </div>
            {allDocIDs.map(id => (
              <button key={id} onClick={() => { navigateToDoc(id); setMobileOpen(false); }} style={{ width: '100%', padding: '12px 14px', background: currentDocID === id ? cardBg : 'transparent', border: 'none', borderRadius: '8px', color: currentDocID === id ? text : textMuted, fontSize: '14px', textAlign: 'left', cursor: 'pointer', marginBottom: '4px' }}>
                {t.titles[id]}
              </button>
            ))}
          </aside>
        </div>
      )}

      <div style={{ display: 'flex', paddingTop: '56px', flex: 1 }}>
        {!isMobile && (
          <aside style={{ width: '240px', position: 'fixed', top: '56px', left: 0, bottom: 0, padding: '28px 20px', overflow: 'auto', overscrollBehavior: 'contain', borderRight: `1px solid ${border}`, background: bg }}>
            <p style={{ fontSize: '12px', color: textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontWeight: 500 }}>{t.sidebar.main}</p>
            <button onClick={() => navigateToDoc('framework')} style={{ width: '100%', padding: '10px 14px', background: currentDocID === 'framework' ? cardBg : 'transparent', border: 'none', borderRadius: '8px', color: currentDocID === 'framework' ? text : textMuted, fontSize: '14px', textAlign: 'left', cursor: 'pointer', marginBottom: '4px' }}>{t.sidebar.framework}</button>
            <div style={{ marginTop: '20px', marginBottom: '12px', padding: '10px 14px', color: textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.sidebar.sdk}</div>
            {sdkDocs.map(id => (
              <button key={id} onClick={() => navigateToDoc(id)} style={{ width: '100%', padding: '8px 14px 8px 24px', background: currentDocID === id ? cardBg : 'transparent', border: 'none', borderRadius: '6px', color: currentDocID === id ? text : textMuted, fontSize: '14px', textAlign: 'left', cursor: 'pointer', marginBottom: '2px' }}>{t.titles[id]}</button>
            ))}
            <button onClick={() => navigateToDoc('dev')} style={{ width: '100%', padding: '10px 14px', background: currentDocID === 'dev' ? cardBg : 'transparent', border: 'none', borderRadius: '8px', color: currentDocID === 'dev' ? text : textMuted, fontSize: '14px', textAlign: 'left', cursor: 'pointer', marginTop: '20px', marginBottom: '4px' }}>{t.sidebar.dev}</button>
            <button onClick={() => navigateToDoc('license')} style={{ width: '100%', padding: '10px 14px', background: currentDocID === 'license' ? cardBg : 'transparent', border: 'none', borderRadius: '8px', color: currentDocID === 'license' ? text : textMuted, fontSize: '14px', textAlign: 'left', cursor: 'pointer' }}>{t.sidebar.license}</button>
          </aside>
        )}

        <main style={{ flex: 1, marginLeft: isMobile ? 0 : '240px', marginRight: isMobile ? 0 : '200px', padding: isMobile ? '28px 20px' : '40px 56px', maxWidth: '820px', opacity, transition: 'opacity 0.1s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px' }}>
            <a href="/docs" style={{ color: textMuted, textDecoration: 'none' }}>{t.breadcrumb.docs}</a>
            <span style={{ color: textMuted }}>/</span>
            <span style={{ color: text }}>{t.titles[currentDocID]}</span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '28px', letterSpacing: '-0.5px' }}>{t.titles[currentDocID]}</h1>

          <div style={{ lineHeight: 1.7 }}>{content}</div>

          <nav style={{ display: 'flex', justifyContent: 'space-between', marginTop: '56px', paddingTop: '28px', borderTop: `1px solid ${border}` }}>
            {prevDoc ? (
              <button onClick={() => navigateToDoc(prevDoc)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '16px 20px', background: 'transparent', border: `1px solid ${border}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'left', minWidth: '180px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: textMuted, fontSize: '13px', marginBottom: '6px' }}><ChevronLeft />{t.articleNav.prev}</span>
                <span style={{ color: text, fontSize: '15px', fontWeight: 500 }}>{t.titles[prevDoc]}</span>
              </button>
            ) : <div />}
            {nextDoc ? (
              <button onClick={() => navigateToDoc(nextDoc)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '16px 20px', background: 'transparent', border: `1px solid ${border}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'right', minWidth: '180px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: textMuted, fontSize: '13px', marginBottom: '6px' }}>{t.articleNav.next}<ChevronRight /></span>
                <span style={{ color: text, fontSize: '15px', fontWeight: 500 }}>{t.titles[nextDoc]}</span>
              </button>
            ) : <div />}
          </nav>
        </main>

        {!isMobile && toc.length > 0 && (
          <aside style={{ width: '180px', position: 'fixed', top: '56px', right: 0, bottom: 0, padding: '100px 16px 32px', overflow: 'auto', overscrollBehavior: 'contain' }}>
            <p style={{ fontSize: '12px', color: textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontWeight: 500 }}>{t.onThisPage}</p>
            {toc.map(item => (
              <a key={item.id} href={`#${item.id}`} style={{ display: 'block', padding: '6px 10px', color: textMuted, fontSize: '13px', textDecoration: 'none', borderRadius: '6px', marginBottom: '2px' }}>{item.title}</a>
            ))}
          </aside>
        )}
      </div>

      <footer style={{ marginLeft: isMobile ? 0 : '240px', marginRight: isMobile ? 0 : '200px', padding: '28px', borderTop: `1px solid ${border}`, textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: textMuted }}>{t.footer}</p>
      </footer>
    </div>
  );
}
