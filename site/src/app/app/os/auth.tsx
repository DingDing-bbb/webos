// 认证阶段 - 自己导入需要的模块
import { LockScreen } from '@ui';
import { OOBE } from '@oobe';

interface AuthStageProps {
  type: 'oobe' | 'lock';
  users?: Array<{ username: string; displayName: string }>;
  systemName?: string;
}

export function AuthStage({ type, users = [], systemName = 'WebOS' }: AuthStageProps) {
  if (type === 'oobe') {
    return (
      <OOBE
        onComplete={(data) => {
          localStorage.setItem('webos-last-username', data.username);
          localStorage.setItem('webos-last-displayname', data.username);
          if (data.theme) {
            localStorage.setItem('webos-theme', data.theme);
          }
          if (window.webos) {
            window.webos.i18n.setLocale(data.language);
            if (data.systemName) {
              window.webos.config.setSystemName(data.systemName);
            }
            window.webos.boot.completeOOBE();
          }
          window.location.reload();
        }}
      />
    );
  }

  return (
    <LockScreen
      users={users}
      systemName={systemName}
      onLogin={async (username, password) => {
        const secure = (window.webos?.user as any)?.secure;
        if (secure) {
          const result = await secure.login(username, password);
          if (result.success) {
            localStorage.setItem('webos-last-username', username);
            window.location.reload();
          }
          return result;
        }
        localStorage.setItem('webos-last-username', username);
        window.location.reload();
        return { success: true };
      }}
    />
  );
}
