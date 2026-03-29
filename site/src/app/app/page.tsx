'use client';

import { useState, useEffect } from 'react';

// 协议同意状态存储 key
const AGREEMENT_KEY = 'webos-agreement-accepted';

// 完整的三语言内容
const i18n = {
  zh: {
    nav: { intro: '介绍', docs: '文档', app: '启动' },
    title: '用户协议',
    subtitle: '使用 WebOS 前，请仔细阅读以下协议',
    sections: {
      tos: { title: '服务条款' },
      privacy: { title: '隐私政策' },
      license: { title: '开源许可' },
      disclaimer: { title: '免责声明' },
    },
    tosContent: `## 1. 服务说明

WebOS 是一款基于 Web 技术的模拟操作系统，运行在浏览器环境中。本服务仅供学习、研究和娱乐目的使用，不提供真实操作系统的功能。

## 2. 用户责任

您应当合法使用本服务，不得利用本服务进行任何违法活动。您理解并同意，本服务的所有数据存储在浏览器本地，清除浏览器数据将导致数据丢失。

## 3. 知识产权

WebOS 的源代码以 MIT 许可证开源。您可以自由使用、修改和分发本软件，但需保留原始版权声明。

## 4. 服务变更

我们保留随时修改、暂停或终止服务的权利，恕不另行通知。

## 5. 协议更新

本协议可能会不定期更新，继续使用即表示接受更新后的条款。`,
    privacyContent: `## 1. 数据收集

WebOS 是一款完全本地化的应用，我们不收集任何用户数据。

## 2. 本地存储

所有用户数据存储在浏览器本地（LocalStorage、IndexedDB），包括：
- 用户设置和偏好
- 虚拟文件系统内容
- 应用程序数据

这些数据仅存在于您的设备上，不会传输到任何服务器。

## 3. 第三方服务

WebOS 不集成任何第三方分析、广告或追踪服务。

## 4. 数据安全

由于数据存储在本地，请定期备份重要数据，避免在公共设备上存储敏感信息。`,
    licenseContent: `## MIT License

Copyright (c) 2024-2026 WebOS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## 第三方开源库

本项目使用了以下开源库：
- React - MIT License
- Next.js - MIT License
- TypeScript - Apache 2.0 License
- Tailwind CSS - MIT License`,
    disclaimerContent: `## 1. 免责声明

WebOS 是一个模拟操作系统项目，不提供真实操作系统的功能。本软件按"原样"提供，不提供任何形式的保证。

## 2. 责任限制

在任何情况下，开发者和贡献者均不对因使用本软件而产生的任何损害承担责任，包括但不限于数据丢失、利润损失等。

## 3. 风险承担

使用本软件的风险由您自行承担。建议定期备份重要数据，不要在此系统中存储敏感个人信息。`,
    checkbox: '我已阅读并同意以上协议',
    accept: '同意并继续',
    footer: '© 2026 WebOS. MIT License.',
  },
  'zh-TW': {
    nav: { intro: '介紹', docs: '文檔', app: '啟動' },
    title: '用戶協議',
    subtitle: '使用 WebOS 前，請仔細閱讀以下協議',
    sections: {
      tos: { title: '服務條款' },
      privacy: { title: '隱私政策' },
      license: { title: '開源許可' },
      disclaimer: { title: '免責聲明' },
    },
    tosContent: `## 1. 服務說明

WebOS 是一款基於 Web 技術的模擬操作系統，運行在瀏覽器環境中。本服務僅供學習、研究和娛樂目的使用，不提供真實操作系統的功能。

## 2. 用戶責任

您應當合法使用本服務，不得利用本服務進行任何違法活動。您理解並同意，本服務的所有數據存儲在瀏覽器本地，清除瀏覽器數據將導致數據丟失。

## 3. 知識產權

WebOS 的源代碼以 MIT 許可證開源。您可以自由使用、修改和分發本軟件，但需保留原始版權聲明。

## 4. 服務變更

我們保留隨時修改、暫停或終止服務的權利，恕不另行通知。

## 5. 協議更新

本協議可能會不定期更新，繼續使用即表示接受更新後的條款。`,
    privacyContent: `## 1. 數據收集

WebOS 是一款完全本地化的應用，我們不收集任何用戶數據。

## 2. 本地存儲

所有用戶數據存儲在瀏覽器本地（LocalStorage、IndexedDB），包括：
- 用戶設置和偏好
- 虛擬文件系統內容
- 應用程序數據

這些數據僅存在於您的設備上，不會傳輸到任何服務器。

## 3. 第三方服務

WebOS 不集成任何第三方分析、廣告或追蹤服務。

## 4. 數據安全

由於數據存儲在本地，請定期備份重要數據，避免在公共設備上存儲敏感信息。`,
    licenseContent: `## MIT License

Copyright (c) 2024-2026 WebOS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## 第三方開源庫

本項目使用了以下開源庫：
- React - MIT License
- Next.js - MIT License
- TypeScript - Apache 2.0 License
- Tailwind CSS - MIT License`,
    disclaimerContent: `## 1. 免責聲明

WebOS 是一個模擬操作系統項目，不提供真實操作系統的功能。本軟件按"原樣"提供，不提供任何形式的保證。

## 2. 責任限制

在任何情況下，開發者和貢獻者均不對因使用本軟件而產生的任何損害承擔責任，包括但不限於數據丟失、利潤損失等。

## 3. 風險承擔

使用本軟件的風險由您自行承擔。建議定期備份重要數據，不要在此系統中存儲敏感個人信息。`,
    checkbox: '我已閱讀並同意以上協議',
    accept: '同意並繼續',
    footer: '© 2026 WebOS. MIT License.',
  },
  en: {
    nav: { intro: 'Intro', docs: 'Docs', app: 'Launch' },
    title: 'User Agreement',
    subtitle: 'Please read the following agreements before using WebOS',
    sections: {
      tos: { title: 'Terms of Service' },
      privacy: { title: 'Privacy Policy' },
      license: { title: 'Open Source License' },
      disclaimer: { title: 'Disclaimer' },
    },
    tosContent: `## 1. Service Description

WebOS is a simulated operating system based on web technologies, running in a browser environment. This service is for learning, research, and entertainment purposes only and does not provide real operating system functionality.

## 2. User Responsibilities

You shall use this service legally and not engage in any illegal activities. You understand and agree that all data is stored locally in the browser, and clearing browser data will result in data loss.

## 3. Intellectual Property

WebOS source code is open-sourced under the MIT License. You are free to use, modify, and distribute this software, provided you retain the original copyright notice.

## 4. Service Changes

We reserve the right to modify, suspend, or terminate the service at any time without notice.

## 5. Agreement Updates

This agreement may be updated from time to time. Continued use constitutes acceptance of the updated terms.`,
    privacyContent: `## 1. Data Collection

WebOS is a fully localized application. We do not collect any user data.

## 2. Local Storage

All user data is stored locally in the browser (LocalStorage, IndexedDB), including:
- User settings and preferences
- Virtual file system contents
- Application data

This data exists only on your device and is never transmitted to any server.

## 3. Third-Party Services

WebOS does not integrate any third-party analytics, advertising, or tracking services.

## 4. Data Security

Since data is stored locally, please back up important data regularly and avoid storing sensitive information on public devices.`,
    licenseContent: `## MIT License

Copyright (c) 2024-2026 WebOS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Third-Party Libraries

This project uses the following open-source libraries:
- React - MIT License
- Next.js - MIT License
- TypeScript - Apache 2.0 License
- Tailwind CSS - MIT License`,
    disclaimerContent: `## 1. Disclaimer

WebOS is a simulated operating system project and does not provide real operating system functionality. This software is provided "as is" without any warranty.

## 2. Limitation of Liability

In no event shall the developers and contributors be liable for any damages arising from the use of this software, including but not limited to data loss or loss of profits.

## 3. Risk Assumption

You assume all risks associated with using this software. We recommend backing up important data regularly and not storing sensitive personal information in this system.`,
    checkbox: 'I have read and agree to the above agreements',
    accept: 'Agree & Continue',
    footer: '© 2026 WebOS. MIT License.',
  },
};

type Lang = 'zh' | 'zh-TW' | 'en';
type TabKey = 'tos' | 'privacy' | 'license' | 'disclaimer';
type Theme = 'light' | 'dark';

// SVG Icons
const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path d="M9 12h6M9 16h6M9 8h6M5 3h9l5 5v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <rect x="5" y="11" width="14" height="10" rx="2"/>
    <path d="M8 11V7a4 4 0 118 0v4"/>
  </svg>
);

const FileTextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016.01 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.7.8.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

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

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
    <path d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);

// Markdown 渲染
function renderMarkdown(text: string, theme: Theme): React.ReactNode {
  const lines = text.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listKey = 0;
  
  const textColor = theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
  const headingColor = theme === 'dark' ? '#fff' : '#000';

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} style={{ margin: '12px 0', paddingLeft: '24px', color: textColor }}>
          {currentList.map((item, i) => (
            <li key={i} style={{ margin: '6px 0', lineHeight: 1.7 }}>{item.replace(/^- /, '')}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={index} style={{ fontSize: '17px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: headingColor }}>
          {line.replace('## ', '')}
        </h3>
      );
    } else if (line.startsWith('- ')) {
      currentList.push(line);
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      elements.push(
        <p key={index} style={{ margin: '12px 0', lineHeight: 1.7, color: textColor }}>
          {line}
        </p>
      );
    }
  });

  flushList();
  return elements;
}

export default function AppPage() {
  const [lang, setLang] = useState<Lang>('zh');
  const [theme, setTheme] = useState<Theme>('light');
  const [activeTab, setActiveTab] = useState<TabKey>('tos');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const t = i18n[lang];

  // 初始化
  useEffect(() => {
    const savedLang = localStorage.getItem('webos-lang') as Lang;
    const savedTheme = localStorage.getItem('webos-theme') as Theme;
    const accepted = localStorage.getItem(AGREEMENT_KEY);

    if (savedLang && ['zh', 'zh-TW', 'en'].includes(savedLang)) setLang(savedLang);
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) setTheme(savedTheme);

    // 如果已同意协议，直接跳转到OS
    if (accepted === 'true') {
      window.location.href = '/os/index.html';
      return;
    }

    setIsLoading(false);

    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 保存设置
  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('webos-lang', newLang);
  };

  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('webos-theme', newTheme);
  };

  const handleAccept = () => {
    if (!agreed) return;
    localStorage.setItem(AGREEMENT_KEY, 'true');
    // 直接跳转到OS
    window.location.href = '/os/index.html';
  };

  // 主题颜色
  const colors = {
    dark: {
      bg: '#0a0a0c',
      bgGradient: 'linear-gradient(180deg, #0a0a0c 0%, #151520 50%, #0a0a0c 100%)',
      card: 'rgba(255,255,255,0.03)',
      cardHover: 'rgba(255,255,255,0.06)',
      border: 'rgba(255,255,255,0.08)',
      text: '#fff',
      textMuted: 'rgba(255,255,255,0.5)',
      headerBg: 'rgba(10, 10, 12, 0.8)',
    },
    light: {
      bg: '#f5f5f7',
      bgGradient: 'linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 50%, #f5f5f7 100%)',
      card: 'rgba(0,0,0,0.02)',
      cardHover: 'rgba(0,0,0,0.04)',
      border: 'rgba(0,0,0,0.08)',
      text: '#1d1d1f',
      textMuted: 'rgba(0,0,0,0.5)',
      headerBg: 'rgba(245, 245, 247, 0.8)',
    },
  };
  
  const c = colors[theme];
  const tabs: TabKey[] = ['tos', 'privacy', 'license', 'disclaimer'];
  const contentMap: Record<TabKey, string> = {
    tos: t.tosContent,
    privacy: t.privacyContent,
    license: t.licenseContent,
    disclaimer: t.disclaimerContent,
  };

  const iconMap: Record<TabKey, React.ReactNode> = {
    tos: <DocumentIcon />,
    privacy: <LockIcon />,
    license: <FileTextIcon />,
    disclaimer: <AlertIcon />,
  };

  // 加载中
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: c.bgGradient,
        color: c.text,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      }}>
        <div style={{ fontSize: '18px', opacity: 0.6 }}>Loading...</div>
      </div>
    );
  }

  // 协议页面
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: c.bgGradient,
      color: c.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      overscrollBehavior: 'none',
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: c.headerBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${c.border}`,
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 16px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px' }}>
            <a href="/intro" style={{ fontSize: '18px', fontWeight: 600, color: c.text, textDecoration: 'none' }}>
              WebOS
            </a>
            {!isMobile && (
              <nav style={{ display: 'flex', gap: '20px' }}>
                <a href="/intro" style={{ fontSize: '13px', color: c.textMuted, textDecoration: 'none' }}>{t.nav.intro}</a>
                <a href="/docs" style={{ fontSize: '13px', color: c.textMuted, textDecoration: 'none' }}>{t.nav.docs}</a>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{t.nav.app}</span>
              </nav>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a 
              href="https://github.com/webos/webos" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ padding: '8px', color: c.textMuted, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              title="GitHub"
            >
              <GithubIcon />
            </a>
            <button onClick={handleThemeChange} style={{ padding: '8px', background: 'transparent', border: 'none', color: c.textMuted, cursor: 'pointer', borderRadius: '6px' }}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <select value={lang} onChange={(e) => handleLangChange(e.target.value as Lang)}
              style={{ padding: '6px 10px', background: c.card, border: `1px solid ${c.border}`, borderRadius: '6px', color: c.text, fontSize: '13px', cursor: 'pointer' }}>
              <option value="zh" style={{ background: c.bg }}>简体中文</option>
              <option value="zh-TW" style={{ background: c.bg }}>繁體中文</option>
              <option value="en" style={{ background: c.bg }}>English</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '24px 16px', width: '100%' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '6px' }}>{t.title}</h1>
          <p style={{ fontSize: '14px', color: c.textMuted }}>{t.subtitle}</p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '20px',
          padding: '4px',
          background: c.card,
          borderRadius: '10px',
          border: `1px solid ${c.border}`,
        }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: isMobile ? '10px 8px' : '10px 16px',
                background: activeTab === tab ? c.cardHover : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: activeTab === tab ? c.text : c.textMuted,
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {isMobile ? iconMap[tab] : t.sections[tab].title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          background: c.card,
          border: `1px solid ${c.border}`,
          borderRadius: '10px',
          padding: '20px 24px',
          marginBottom: '20px',
          maxHeight: '320px',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}>
          {renderMarkdown(contentMap[activeTab], theme)}
        </div>

        {/* Checkbox & Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            cursor: 'pointer',
            padding: '14px 20px',
            background: c.card,
            border: agreed ? '1px solid rgba(16, 185, 129, 0.5)' : `1px solid ${c.border}`,
            borderRadius: '10px',
            transition: 'border-color 0.15s',
          }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: '2px', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', color: c.text }}>{t.checkbox}</span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!agreed}
            style={{
              padding: '14px 40px',
              background: agreed ? (theme === 'dark' ? '#fff' : '#1d1d1f') : c.card,
              color: agreed ? (theme === 'dark' ? '#000' : '#fff') : c.textMuted,
              fontSize: '15px',
              fontWeight: 500,
              borderRadius: '8px',
              border: 'none',
              cursor: agreed ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {t.accept}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: c.textMuted }}>{t.footer}</p>
      </footer>
    </div>
  );
}
