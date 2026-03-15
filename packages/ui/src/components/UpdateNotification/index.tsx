/**
 * 更新通知组件
 * 显示应用更新提示
 */

import React from 'react';

// 翻译助手
const t = (key: string): string => {
  return window.webos?.t(key) || key;
};

interface UpdateNotificationProps {
  onUpdate: () => void;
  onSkip: () => void;
  onClose: () => void;
  currentVersion: string;
  latestVersion: string;
  isUpdating: boolean;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  onUpdate,
  onSkip,
  onClose,
  currentVersion,
  latestVersion,
  isUpdating
}) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '60px',
      right: '16px',
      background: 'var(--os-color-bg)',
      border: '1px solid var(--os-color-border)',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 10000,
      maxWidth: '320px',
      animation: 'slideInUp 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--os-color-text)' }}>
            {t('update.newVersion')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--os-color-text-secondary)' }}>
            v{currentVersion} → v{latestVersion}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: 'var(--os-color-text-secondary)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div style={{ 
        fontSize: '13px', 
        color: 'var(--os-color-text-secondary)',
        marginBottom: '16px',
        lineHeight: 1.5
      }}>
        {t('update.ready')}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onSkip}
          disabled={isUpdating}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: '1px solid var(--os-color-border)',
            borderRadius: '6px',
            background: 'var(--os-color-bg-secondary)',
            color: 'var(--os-color-text)',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            opacity: isUpdating ? 0.6 : 1,
            fontSize: '14px'
          }}
        >
          {t('update.remindLater')}
        </button>
        <button
          onClick={onUpdate}
          disabled={isUpdating}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            background: 'var(--os-color-primary)',
            color: 'white',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isUpdating ? (
            <>
              <span style={{
                width: '14px',
                height: '14px',
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}/>
              {t('update.updating')}
            </>
          ) : t('update.updateNow')}
        </button>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UpdateNotification;
