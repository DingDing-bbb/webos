// 认证阶段 - 自己导入需要的模块
import { LockScreen } from '@ui';
import { OOBE } from '@oobe';

interface AuthStageProps {
  type: 'oobe' | 'lock';
  users?: Array<{ username: string; displayName: string }>;
  systemName?: string;
  onLoginSuccess?: () => void;
}

export function AuthStage({
  type,
  users = [],
  systemName = 'WebOS',
  onLoginSuccess,
}: AuthStageProps) {
  if (type === 'oobe') {
    return (
      <OOBE
        onComplete={(data) => {
          localStorage.setItem('webos-last-username', data.username);
          localStorage.setItem('webos-last-displayname', data.username);
          if (data.theme) {
            localStorage.setItem('webos-theme', data.theme);
            document.documentElement.setAttribute('data-theme', data.theme);
          }
          if (data.tabletMode !== undefined) {
            localStorage.setItem('webos-tablet-mode', String(data.tabletMode));
            if (data.tabletMode) {
              document.documentElement.classList.add('os-tablet-mode');
            }
          }
          if (window.webos) {
            window.webos.i18n.setLocale(data.language);
            if (data.systemName) {
              window.webos.config.setSystemName(data.systemName);
            }
            window.webos.boot.completeOOBE();
          }
          // OOBE 完成后直接进入桌面，不刷新页面
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }}
      />
    );
  }

  return (
    <LockScreen
      users={users}
      systemName={systemName}
      onLogin={async (username, password) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const secure = (window.webos?.user as any)?.secure;

        if (secure) {
          const result = await secure.login(username, password);
          if (result.success) {
            localStorage.setItem('webos-last-username', username);
            // 登录成功后直接切换到桌面，不刷新页面
            if (onLoginSuccess) {
              onLoginSuccess();
            }
          }
          return result;
        }

        // 没有安全用户管理器，直接登录成功
        localStorage.setItem('webos-last-username', username);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        return { success: true };
      }}
    />
  );
}
