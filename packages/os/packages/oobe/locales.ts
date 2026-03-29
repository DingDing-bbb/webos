/**
 * OOBE 专用翻译
 * 独立于系统翻译，便于维护
 */

export type OOBETranslations = {
  // 欢迎
  'welcome': string;
  'welcomeDesc': string;
  
  // 语言
  'selectLanguage': string;
  
  // 主题
  'selectTheme': string;
  'themeDesc': string;
  'themeLight': string;
  'themeDark': string;
  'themeLightDesc': string;
  'themeDarkDesc': string;
  
  // 用户设置
  'userSetup': string;
  'setUsername': string;
  'usernamePlaceholder': string;
  'usernameRequired': string;
  'setPassword': string;
  'passwordPlaceholder': string;
  'confirmPassword': string;
  'confirmPasswordPlaceholder': string;
  'passwordMismatch': string;
  'passwordTooShort': string;
  'optional': string;
  'setSystemName': string;
  'systemNamePlaceholder': string;
  
  // 模式选择
  'selectMode': string;
  'modeDesc': string;
  'desktopMode': string;
  'desktopModeDesc': string;
  'tabletMode': string;
  'tabletModeDesc': string;
  'touchDeviceDetected': string;
  
  // 完成
  'allSet': string;
  'ready': string;
  
  // 按钮
  'next': string;
  'back': string;
  'start': string;
};

export const oobeLocales: Record<string, OOBETranslations> = {
  'en': {
    // 欢迎
    'welcome': 'Welcome to WebOS',
    'welcomeDesc': "Let's set up your system in a few quick steps.",
    
    // 语言
    'selectLanguage': 'Select Language',
    
    // 主题
    'selectTheme': 'Choose Theme',
    'themeDesc': 'Select your preferred appearance.',
    'themeLight': 'Light',
    'themeDark': 'Dark',
    'themeLightDesc': 'Light appearance for daytime use',
    'themeDarkDesc': 'Dark appearance for low light',
    
    // 用户设置
    'userSetup': 'Create Your Account',
    'setUsername': 'Username',
    'usernamePlaceholder': 'Enter your username',
    'usernameRequired': 'Please enter a username',
    'setPassword': 'Password',
    'passwordPlaceholder': 'Enter a password (optional)',
    'confirmPassword': 'Confirm Password',
    'confirmPasswordPlaceholder': 'Re-enter password',
    'passwordMismatch': 'Passwords do not match',
    'passwordTooShort': 'Password must be at least 4 characters',
    'optional': 'optional',
    'setSystemName': 'System Name',
    'systemNamePlaceholder': 'My Computer',
    
    // 模式选择
    'selectMode': 'Select Mode',
    'modeDesc': 'Choose the experience that fits your device.',
    'desktopMode': 'Desktop Mode',
    'desktopModeDesc': 'Optimized for mouse and keyboard.',
    'tabletMode': 'Tablet Mode',
    'tabletModeDesc': 'Optimized for touch screens.',
    'touchDeviceDetected': 'Touch device detected. Tablet mode recommended.',
    
    // 完成
    'allSet': 'All Set!',
    'ready': 'Your system is ready. Click to start exploring!',
    
    // 按钮
    'next': 'Continue',
    'back': 'Back',
    'start': 'Get Started',
  },
  
  'zh-CN': {
    // 欢迎
    'welcome': '欢迎使用 WebOS',
    'welcomeDesc': '让我们快速设置您的系统。',
    
    // 语言
    'selectLanguage': '选择语言',
    
    // 主题
    'selectTheme': '选择主题',
    'themeDesc': '选择您喜欢的界面外观。',
    'themeLight': '浅色',
    'themeDark': '深色',
    'themeLightDesc': '适合白天使用的浅色外观',
    'themeDarkDesc': '适合暗光环境的深色外观',
    
    // 用户设置
    'userSetup': '创建账户',
    'setUsername': '用户名',
    'usernamePlaceholder': '请输入用户名',
    'usernameRequired': '请输入用户名',
    'setPassword': '密码',
    'passwordPlaceholder': '请输入密码（可选）',
    'confirmPassword': '确认密码',
    'confirmPasswordPlaceholder': '请再次输入密码',
    'passwordMismatch': '两次输入的密码不一致',
    'passwordTooShort': '密码至少需要4个字符',
    'optional': '可选',
    'setSystemName': '系统名称',
    'systemNamePlaceholder': '我的电脑',
    
    // 模式选择
    'selectMode': '选择模式',
    'modeDesc': '选择适合您设备的操作模式。',
    'desktopMode': '桌面模式',
    'desktopModeDesc': '针对鼠标和键盘优化。',
    'tabletMode': '平板模式',
    'tabletModeDesc': '针对触摸屏优化。',
    'touchDeviceDetected': '检测到触摸设备，建议使用平板模式。',
    
    // 完成
    'allSet': '设置完成！',
    'ready': '系统已就绪，点击开始使用！',
    
    // 按钮
    'next': '继续',
    'back': '返回',
    'start': '开始使用',
  },
  
  'zh-TW': {
    // 歡迎
    'welcome': '歡迎使用 WebOS',
    'welcomeDesc': '讓我們快速設定您的系統。',
    
    // 語言
    'selectLanguage': '選擇語言',
    
    // 主題
    'selectTheme': '選擇主題',
    'themeDesc': '選擇您喜歡的介面外觀。',
    'themeLight': '淺色',
    'themeDark': '深色',
    'themeLightDesc': '適合白天使用的淺色外觀',
    'themeDarkDesc': '適合暗光環境的深色外觀',
    
    // 使用者設定
    'userSetup': '建立帳戶',
    'setUsername': '使用者名稱',
    'usernamePlaceholder': '請輸入使用者名稱',
    'usernameRequired': '請輸入使用者名稱',
    'setPassword': '密碼',
    'passwordPlaceholder': '請輸入密碼（選填）',
    'confirmPassword': '確認密碼',
    'confirmPasswordPlaceholder': '請再次輸入密碼',
    'passwordMismatch': '兩次輸入的密碼不一致',
    'passwordTooShort': '密碼至少需要4個字元',
    'optional': '選填',
    'setSystemName': '系統名稱',
    'systemNamePlaceholder': '我的電腦',
    
    // 模式選擇
    'selectMode': '選擇模式',
    'modeDesc': '選擇適合您裝置的操作模式。',
    'desktopMode': '桌面模式',
    'desktopModeDesc': '針對滑鼠和鍵盤最佳化。',
    'tabletMode': '平板模式',
    'tabletModeDesc': '針對觸控螢幕最佳化。',
    'touchDeviceDetected': '偵測到觸控裝置，建議使用平板模式。',
    
    // 完成
    'allSet': '設定完成！',
    'ready': '系統已就緒，點擊開始使用！',
    
    // 按鈕
    'next': '繼續',
    'back': '返回',
    'start': '開始使用',
  }
};

// 获取翻译
export function getOOBETranslation(locale: string, key: keyof OOBETranslations): string {
  return oobeLocales[locale]?.[key] || oobeLocales['en']?.[key] || key;
}

// 获取可用的 OOBE 语言列表
export function getOOBELocales() {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' }
  ];
}
