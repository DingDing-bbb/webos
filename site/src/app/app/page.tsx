'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useTheme, Lang } from '../../components/useTheme';

// ============================================================================
// Types
// ============================================================================
type TabKey = 'tos' | 'privacy' | 'license' | 'disclaimer';

const AGREEMENT_KEY = 'webos-agreement-accepted';

// ============================================================================
// i18n — 完整六语
// ============================================================================
const i18n = {
  zh: {
    nav: { intro: '介绍', docs: '文档', app: '启动' },
    title: '用户协议',
    subtitle: '使用 WebOS 前，请仔细阅读以下协议',
    tabs: { tos: '服务条款', privacy: '隐私政策', license: '开源许可', disclaimer: '免责声明' },
    checkbox: '我已阅读并同意以上协议',
    accept: '同意并继续',
    footer: '© 2026 WebOS. MIT License.',
    content: {
      tos: [
        {
          heading: '1. 服务说明',
          body: 'WebOS 是一款基于 Web 技术的模拟操作系统，运行在浏览器环境中。本服务仅供学习、研究和娱乐目的使用，不提供真实操作系统的功能。',
        },
        {
          heading: '2. 用户责任',
          body: '您应当合法使用本服务，不得利用本服务进行任何违法活动。您理解并同意，本服务的所有数据存储在浏览器本地，清除浏览器数据将导致数据丢失。',
        },
        {
          heading: '3. 知识产权',
          body: 'WebOS 的源代码以 MIT 许可证开源。您可以自由使用、修改和分发本软件，但需保留原始版权声明。',
        },
        { heading: '4. 服务变更', body: '我们保留随时修改、暂停或终止服务的权利，恕不另行通知。' },
        {
          heading: '5. 协议更新',
          body: '本协议可能会不定期更新，继续使用即表示接受更新后的条款。',
        },
      ],
      privacy: [
        { heading: '1. 数据收集', body: 'WebOS 是一款完全本地化的应用，我们不收集任何用户数据。' },
        {
          heading: '2. 本地存储',
          body: '所有用户数据存储在浏览器本地（LocalStorage、IndexedDB），包括用户设置和偏好、虚拟文件系统内容、应用程序数据。这些数据仅存在于您的设备上，不会传输到任何服务器。',
        },
        { heading: '3. 第三方服务', body: 'WebOS 不集成任何第三方分析、广告或追踪服务。' },
        {
          heading: '4. 数据安全',
          body: '由于数据存储在本地，请定期备份重要数据，避免在公共设备上存储敏感信息。',
        },
      ],
      license: [
        {
          heading: 'MIT License',
          body: 'Copyright (c) 2024-2026 WebOS Contributors. Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.',
        },
        {
          heading: '第三方开源库',
          body: 'React (MIT) · Next.js (MIT) · TypeScript (Apache 2.0) · Tailwind CSS (MIT)',
        },
      ],
      disclaimer: [
        {
          heading: '1. 免责声明',
          body: 'WebOS 是一个模拟操作系统项目，不提供真实操作系统的功能。本软件按"原样"提供，不提供任何形式的保证。',
        },
        {
          heading: '2. 责任限制',
          body: '在任何情况下，开发者和贡献者均不对因使用本软件而产生的任何损害承担责任，包括但不限于数据丢失、利润损失等。',
        },
        {
          heading: '3. 风险承担',
          body: '使用本软件的风险由您自行承担。建议定期备份重要数据，不要在此系统中存储敏感个人信息。',
        },
      ],
    },
  },
  'zh-TW': {
    nav: { intro: '介紹', docs: '文檔', app: '啟動' },
    title: '用戶協議',
    subtitle: '使用 WebOS 前，請仔細閱讀以下協議',
    tabs: { tos: '服務條款', privacy: '隱私政策', license: '開源許可', disclaimer: '免責聲明' },
    checkbox: '我已閱讀並同意以上協議',
    accept: '同意並繼續',
    footer: '© 2026 WebOS. MIT License.',
    content: {
      tos: [
        {
          heading: '1. 服務說明',
          body: 'WebOS 是一款基於 Web 技術的模擬操作系統，運行在瀏覽器環境中。本服務僅供學習、研究和娛樂目的使用，不提供真實操作系統的功能。',
        },
        {
          heading: '2. 用戶責任',
          body: '您應當合法使用本服務，不得利用本服務進行任何違法活動。您理解並同意，本服務的所有數據存儲在瀏覽器本地，清除瀏覽器數據將導致數據丟失。',
        },
        {
          heading: '3. 知識產權',
          body: 'WebOS 的源代碼以 MIT 許可證開源。您可以自由使用、修改和分發本軟件，但需保留原始版權聲明。',
        },
        { heading: '4. 服務變更', body: '我們保留隨時修改、暫停或終止服務的權利，恕不另行通知。' },
        {
          heading: '5. 協議更新',
          body: '本協議可能會不定期更新，繼續使用即表示接受更新後的條款。',
        },
      ],
      privacy: [
        { heading: '1. 數據收集', body: 'WebOS 是一款完全本地化的應用，我們不收集任何用戶數據。' },
        {
          heading: '2. 本地存儲',
          body: '所有用戶數據存儲在瀏覽器本地，包括用戶設置和偏好、虛擬文件系統內容、應用程序數據。這些數據僅存在於您的設備上，不會傳輸到任何服務器。',
        },
        { heading: '3. 第三方服務', body: 'WebOS 不集成任何第三方分析、廣告或追蹤服務。' },
        {
          heading: '4. 數據安全',
          body: '由於數據存儲在本地，請定期備份重要數據，避免在公共設備上存儲敏感信息。',
        },
      ],
      license: [
        {
          heading: 'MIT License',
          body: 'Copyright (c) 2024-2026 WebOS Contributors. 本軟件以 MIT 許可證開源，可自由使用、修改和分發。',
        },
        {
          heading: '第三方開源庫',
          body: 'React (MIT) · Next.js (MIT) · TypeScript (Apache 2.0) · Tailwind CSS (MIT)',
        },
      ],
      disclaimer: [
        {
          heading: '1. 免責聲明',
          body: 'WebOS 是一個模擬操作系統項目，不提供真實操作系統的功能。本軟件按"原樣"提供，不提供任何形式的保證。',
        },
        {
          heading: '2. 責任限制',
          body: '在任何情況下，開發者和貢獻者均不對因使用本軟件而產生的任何損害承擔責任。',
        },
        { heading: '3. 風險承擔', body: '使用本軟件的風險由您自行承擔。建議定期備份重要數據。' },
      ],
    },
  },
  en: {
    nav: { intro: 'Intro', docs: 'Docs', app: 'Launch' },
    title: 'User Agreement',
    subtitle: 'Please read the following agreements before using WebOS',
    tabs: { tos: 'Terms', privacy: 'Privacy', license: 'License', disclaimer: 'Disclaimer' },
    checkbox: 'I have read and agree to the above agreements',
    accept: 'Agree & Continue',
    footer: '© 2026 WebOS. MIT License.',
    content: {
      tos: [
        {
          heading: '1. Service Description',
          body: 'WebOS is a simulated operating system based on web technologies, running in a browser environment. This service is for learning, research, and entertainment purposes only.',
        },
        {
          heading: '2. User Responsibilities',
          body: 'You shall use this service legally and not engage in any illegal activities. All data is stored locally in the browser; clearing browser data will result in data loss.',
        },
        {
          heading: '3. Intellectual Property',
          body: 'WebOS source code is open-sourced under the MIT License. You are free to use, modify, and distribute this software, provided you retain the original copyright notice.',
        },
        {
          heading: '4. Service Changes',
          body: 'We reserve the right to modify, suspend, or terminate the service at any time without notice.',
        },
        {
          heading: '5. Agreement Updates',
          body: 'This agreement may be updated from time to time. Continued use constitutes acceptance of the updated terms.',
        },
      ],
      privacy: [
        {
          heading: '1. Data Collection',
          body: 'WebOS is a fully localized application. We do not collect any user data.',
        },
        {
          heading: '2. Local Storage',
          body: 'All user data is stored locally (LocalStorage, IndexedDB), including settings, virtual file system contents, and application data. This data is never transmitted to any server.',
        },
        {
          heading: '3. Third-Party Services',
          body: 'WebOS does not integrate any third-party analytics, advertising, or tracking services.',
        },
        {
          heading: '4. Data Security',
          body: 'Since data is stored locally, please back up important data regularly and avoid storing sensitive information on public devices.',
        },
      ],
      license: [
        {
          heading: 'MIT License',
          body: 'Copyright (c) 2024-2026 WebOS Contributors. Permission is hereby granted, free of charge, to deal in the Software without restriction.',
        },
        {
          heading: 'Third-Party Libraries',
          body: 'React (MIT) · Next.js (MIT) · TypeScript (Apache 2.0) · Tailwind CSS (MIT)',
        },
      ],
      disclaimer: [
        {
          heading: '1. Disclaimer',
          body: 'WebOS is a simulated operating system project and does not provide real operating system functionality. This software is provided "as is" without any warranty.',
        },
        {
          heading: '2. Limitation of Liability',
          body: 'In no event shall the developers and contributors be liable for any damages arising from the use of this software.',
        },
        {
          heading: '3. Risk Assumption',
          body: 'You assume all risks associated with using this software. We recommend backing up important data regularly.',
        },
      ],
    },
  },
  ja: {
    nav: { intro: '紹介', docs: 'ドキュメント', app: '起動' },
    title: '利用規約',
    subtitle: 'WebOSをご利用の前に、以下の規約をお読みください',
    tabs: {
      tos: '利用規約',
      privacy: 'プライバシー',
      license: 'ライセンス',
      disclaimer: '免責事項',
    },
    checkbox: '上記の規約を読み、同意します',
    accept: '同意して続行',
    footer: '© 2026 WebOS. MIT License.',
    content: {
      tos: [
        {
          heading: '1. サービス説明',
          body: 'WebOSはWeb技術に基づくシミュレートされたオペレーティングシステムで、ブラウザ環境で動作します。学習、研究、娯楽目的のみにご利用ください。',
        },
        {
          heading: '2. ユーザーの責任',
          body: '本サービスを合法的にご利用ください。すべてのデータはブラウザにローカル保存され、ブラウザデータを消去するとデータが失われます。',
        },
        {
          heading: '3. 知的財産',
          body: 'WebOSのソースコードはMITライセンスでオープンソース化されています。元の著作権表示を保持することを条件に、自由に使用、変更、配布できます。',
        },
        {
          heading: '4. サービス変更',
          body: '予告なくサービスを変更、一時停止、または終了する権利を留保します。',
        },
        {
          heading: '5. 規約更新',
          body: '本規約は随時更新される場合があります。引き続きご利用いただくことで、更新された規約に同意したものとみなされます。',
        },
      ],
      privacy: [
        {
          heading: '1. データ収集',
          body: 'WebOSは完全にローカル化されたアプリケーションであり、ユーザーデータを収集しません。',
        },
        {
          heading: '2. ローカルストレージ',
          body: 'すべてのユーザーデータはブラウザにローカル保存され、サーバーに送信されることはありません。',
        },
        {
          heading: '3. サードパーティサービス',
          body: 'WebOSはサードパーティの分析、広告、追跡サービスを統合していません。',
        },
        {
          heading: '4. データセキュリティ',
          body: 'データはローカルに保存されるため、重要なデータは定期的にバックアップしてください。',
        },
      ],
      license: [
        {
          heading: 'MIT License',
          body: 'Copyright (c) 2024-2026 WebOS Contributors. MITライセンスの下でオープンソース化されています。',
        },
        {
          heading: 'サードパーティライブラリ',
          body: 'React (MIT) · Next.js (MIT) · TypeScript (Apache 2.0) · Tailwind CSS (MIT)',
        },
      ],
      disclaimer: [
        {
          heading: '1. 免責事項',
          body: 'WebOSはシミュレートされたOSプロジェクトであり、実際のOS機能を提供しません。本ソフトウェアは「現状のまま」提供されます。',
        },
        {
          heading: '2. 責任制限',
          body: '開発者と貢献者は、本ソフトウェアの使用によって生じるいかなる損害についても責任を負いません。',
        },
        {
          heading: '3. リスク負担',
          body: '本ソフトウェアの使用に伴うリスクはすべてユーザーが負担します。',
        },
      ],
    },
  },
  ko: {
    nav: { intro: '소개', docs: '문서', app: '실행' },
    title: '사용자 동의',
    subtitle: 'WebOS를 사용하기 전에 다음 약관을 읽어주세요',
    tabs: { tos: '서비스 약관', privacy: '개인정보', license: '라이선스', disclaimer: '면책 조항' },
    checkbox: '위 약관을 읽고 동의합니다',
    accept: '동의하고 계속',
    footer: '© 2026 WebOS. MIT License.',
    content: {
      tos: [
        {
          heading: '1. 서비스 설명',
          body: 'WebOS는 웹 기술을 기반으로 한 시뮬레이션 운영 체제로, 브라우저 환경에서 실행됩니다. 학습, 연구 및 엔터테인먼트 목적으로만 사용하십시오.',
        },
        {
          heading: '2. 사용자 책임',
          body: '본 서비스를 합법적으로 사용하십시오. 모든 데이터는 브라우저에 로컬로 저장되며, 브라우저 데이터를 지우면 데이터가 손실됩니다.',
        },
        {
          heading: '3. 지적 재산',
          body: 'WebOS 소스 코드는 MIT 라이선스로 오픈 소스입니다. 원래의 저작권 표시를 유지하는 조건으로 자유롭게 사용, 수정, 배포할 수 있습니다.',
        },
        {
          heading: '4. 서비스 변경',
          body: '사전 통지 없이 서비스를 수정, 일시 중단 또는 종료할 권리를 보유합니다.',
        },
        {
          heading: '5. 약관 업데이트',
          body: '본 약관은 수시로 업데이트될 수 있습니다. 계속 사용하면 업데이트된 약관에 동의하는 것으로 간주됩니다.',
        },
      ],
      privacy: [
        {
          heading: '1. 데이터 수집',
          body: 'WebOS는 완전히 로컬화된 애플리케이션입니다. 사용자 데이터를 수집하지 않습니다.',
        },
        {
          heading: '2. 로컬 저장',
          body: '모든 사용자 데이터는 브라우저에 로컬로 저장되며 서버로 전송되지 않습니다.',
        },
        {
          heading: '3. 타사 서비스',
          body: 'WebOS는 타사 분석, 광고 또는 추적 서비스를 통합하지 않습니다.',
        },
        {
          heading: '4. 데이터 보안',
          body: '데이터가 로컬에 저장되므로 중요한 데이터를 정기적으로 백업하십시오.',
        },
      ],
      license: [
        {
          heading: 'MIT License',
          body: 'Copyright (c) 2024-2026 WebOS Contributors. MIT 라이선스로 오픈 소스입니다.',
        },
        {
          heading: '타사 라이브러리',
          body: 'React (MIT) · Next.js (MIT) · TypeScript (Apache 2.0) · Tailwind CSS (MIT)',
        },
      ],
      disclaimer: [
        {
          heading: '1. 면책 조항',
          body: 'WebOS는 시뮬레이션 OS 프로젝트이며 실제 OS 기능을 제공하지 않습니다. 본 소프트웨어는 "있는 그대로" 제공됩니다.',
        },
        {
          heading: '2. 책임 제한',
          body: '개발자와 기여자는 본 소프트웨어 사용으로 인해 발생하는 어떠한 손해에도 책임을 지지 않습니다.',
        },
        {
          heading: '3. 위험 부담',
          body: '본 소프트웨어 사용과 관련된 모든 위험은 사용자가 부담합니다.',
        },
      ],
    },
  },
  ru: {
    nav: { intro: 'Введение', docs: 'Документация', app: 'Запуск' },
    title: 'Пользовательское соглашение',
    subtitle: 'Пожалуйста, прочитайте следующие соглашения перед использованием WebOS',
    tabs: {
      tos: 'Условия',
      privacy: 'Конфиденциальность',
      license: 'Лицензия',
      disclaimer: 'Отказ',
    },
    checkbox: 'Я прочитал(а) и согласен(на) с вышеуказанными соглашениями',
    accept: 'Принять и продолжить',
    footer: '© 2026 WebOS. MIT License.',
    content: {
      tos: [
        {
          heading: '1. Описание сервиса',
          body: 'WebOS — имитация операционной системы на базе веб-технологий, работающая в браузере. Сервис предназначен только для обучения, исследований и развлечений.',
        },
        {
          heading: '2. Ответственность пользователя',
          body: 'Вы должны использовать сервис на законных основаниях. Все данные хранятся локально в браузере; очистка данных браузера приведёт к их потере.',
        },
        {
          heading: '3. Интеллектуальная собственность',
          body: 'Исходный код WebOS открыт под лицензией MIT. Вы можете свободно использовать, изменять и распространять данное ПО с сохранением оригинального уведомления об авторских правах.',
        },
        {
          heading: '4. Изменения сервиса',
          body: 'Мы оставляем за собой право изменять, приостанавливать или прекращать сервис в любое время без уведомления.',
        },
        {
          heading: '5. Обновления соглашения',
          body: 'Данное соглашение может периодически обновляться. Продолжение использования означает принятие обновлённых условий.',
        },
      ],
      privacy: [
        {
          heading: '1. Сбор данных',
          body: 'WebOS — полностью локальное приложение. Мы не собираем никаких пользовательских данных.',
        },
        {
          heading: '2. Локальное хранилище',
          body: 'Все данные хранятся локально (LocalStorage, IndexedDB) и никогда не передаются на серверы.',
        },
        {
          heading: '3. Сторонние сервисы',
          body: 'WebOS не интегрирует сторонние сервисы аналитики, рекламы или отслеживания.',
        },
        {
          heading: '4. Безопасность данных',
          body: 'Поскольку данные хранятся локально, регулярно создавайте резервные копии важных данных.',
        },
      ],
      license: [
        {
          heading: 'MIT License',
          body: 'Copyright (c) 2024-2026 WebOS Contributors. Исходный код открыт под лицензией MIT.',
        },
        {
          heading: 'Сторонние библиотеки',
          body: 'React (MIT) · Next.js (MIT) · TypeScript (Apache 2.0) · Tailwind CSS (MIT)',
        },
      ],
      disclaimer: [
        {
          heading: '1. Отказ от ответственности',
          body: 'WebOS — проект имитации ОС, не предоставляющий функциональности реальной ОС. ПО предоставляется «как есть» без каких-либо гарантий.',
        },
        {
          heading: '2. Ограничение ответственности',
          body: 'Разработчики и участники не несут ответственности за любые убытки, возникшие в результате использования данного ПО.',
        },
        {
          heading: '3. Принятие рисков',
          body: 'Все риски, связанные с использованием данного ПО, вы принимаете на себя.',
        },
      ],
    },
  },
} as const;

// ============================================================================
// Tab Icons
// ============================================================================
const DocumentIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="16"
    height="16"
  >
    <path d="M9 12h6M9 16h6M9 8h6M5 3h9l5 5v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" />
  </svg>
);

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="16"
    height="16"
  >
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 118 0v4" />
  </svg>
);

const FileTextIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="16"
    height="16"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);

const AlertIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="16"
    height="16"
  >
    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

const tabIcons: Record<TabKey, React.ReactNode> = {
  tos: <DocumentIcon />,
  privacy: <LockIcon />,
  license: <FileTextIcon />,
  disclaimer: <AlertIcon />,
};

// ============================================================================
// Page
// ============================================================================
export default function AppPage() {
  const { lang, theme, mounted, setLang, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('tos');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const t = i18n[lang];
  const tabs: TabKey[] = ['tos', 'privacy', 'license', 'disclaimer'];

  useEffect(() => {
    if (localStorage.getItem(AGREEMENT_KEY) === 'true') {
      window.location.href = '/app/os';
      return;
    }
    setIsLoading(false);
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleAccept = () => {
    if (!agreed) return;
    localStorage.setItem(AGREEMENT_KEY, 'true');
    window.location.href = '/app/os';
  };

  if (!mounted || isLoading) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-gradient)',
      }}
    >
      <Navbar
        active="app"
        lang={lang}
        onLangChange={setLang}
        theme={theme}
        onThemeChange={toggleTheme}
        isMobile={isMobile}
      />

      <div className="agreement-container">
        <div className="agreement-header">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        {/* Tabs */}
        <div className="agreement-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`agreement-tab ${activeTab === tab ? 'active' : ''}`}
            >
              {tabIcons[tab]}
              <span>{t.tabs[tab]}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="agreement-content">
          {t.content[activeTab].map((section, i) => (
            <div key={i}>
              <h3>{section.heading}</h3>
              <p>{section.body}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="agreement-actions">
          <label className={`agreement-checkbox ${agreed ? 'checked' : ''}`}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>{t.checkbox}</span>
          </label>
          <button
            onClick={handleAccept}
            className={`btn-accept ${agreed ? 'enabled' : 'disabled'}`}
            disabled={!agreed}
          >
            {t.accept}
          </button>
        </div>
      </div>

      <footer className="page-footer">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
