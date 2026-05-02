// 应用错误弹窗组件

import React, { useState, useEffect } from 'react';

// AppError 类型定义（原 @kernel/core/errorHandler 已移除）
export interface AppError {
  id: string;
  code: string;
  message: string;
  timestamp: Date;
  appId?: string;
  details?: string;
  stack?: string;
}

interface ErrorDialogProps {
  error: AppError;
  onClose: () => void;
  onRetry?: () => void;
}

// SVG 图标
const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const ErrorDialog: React.FC<ErrorDialogProps> = ({ error, onClose, onRetry }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const copyErrorInfo = async () => {
    const info = `
Error Code: ${error.code}
Message: ${error.message}
Time: ${error.timestamp.toISOString()}
App: ${error.appId || 'Unknown'}
${error.details ? `\nDetails:\n${error.details}` : ''}
${error.stack ? `\nStack:\n${error.stack}` : ''}
    `.trim();

    try {
      await navigator.clipboard.writeText(info);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy error info');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--os-color-bg)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minWidth: '400px',
          maxWidth: '560px',
          overflow: 'hidden',
          animation: 'os-dialog-in 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--os-color-border)',
            background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertIcon />
            <span style={{ fontWeight: 500, fontSize: '14px' }}>
              {window.webos?.t('common.error') || 'Application Error'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 16px' }}>
          {/* Error code badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(211, 47, 47, 0.1)',
              borderRadius: '4px',
              marginBottom: '12px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#d32f2f',
            }}
          >
            <span style={{ fontWeight: 600 }}>{error.code}</span>
          </div>

          {/* Message */}
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '15px',
              lineHeight: 1.5,
              color: 'var(--os-color-text)',
            }}
          >
            {error.message}
          </p>

          {/* Time & App */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              fontSize: '12px',
              color: 'var(--os-color-text-secondary)',
              marginBottom: '16px',
            }}
          >
            <span>Time: {formatTime(error.timestamp)}</span>
            {error.appId && <span>App: {error.appId}</span>}
          </div>

          {/* Toggle details */}
          {(error.details || error.stack) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: 'transparent',
                border: '1px solid var(--os-color-border)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                color: 'var(--os-color-text-secondary)',
                marginBottom: showDetails ? '12px' : 0,
              }}
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          )}

          {/* Details */}
          {showDetails && (error.details || error.stack) && (
            <div
              style={{
                background: 'var(--os-color-bg-secondary)',
                border: '1px solid var(--os-color-border)',
                borderRadius: '4px',
                padding: '12px',
                marginBottom: '12px',
                maxHeight: '150px',
                overflow: 'auto',
              }}
            >
              {error.details && (
                <pre
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: 'var(--os-color-text-secondary)',
                  }}
                >
                  {error.details}
                </pre>
              )}
              {error.stack && (
                <pre
                  style={{
                    margin: 0,
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: 'var(--os-color-text-muted)',
                  }}
                >
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '12px 16px',
            borderTop: '1px solid var(--os-color-border)',
            background: 'var(--os-color-bg-secondary)',
          }}
        >
          <button
            onClick={copyErrorInfo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              border: '1px solid var(--os-color-border)',
              background: 'var(--os-color-bg)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--os-color-text)',
            }}
          >
            <CopyIcon />
            {copied ? 'Copied!' : 'Copy Info'}
          </button>

          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: 'var(--os-color-primary)',
                color: '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Retry
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'var(--os-color-text)',
              color: 'var(--os-color-bg)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// 错误弹窗容器 - 监听错误事件并显示弹窗
export const ErrorDialogContainer: React.FC = () => {
  const [errors, setErrors] = useState<AppError[]>([]);

  useEffect(() => {
    const handleAppError = (e: CustomEvent<AppError>) => {
      setErrors((prev) => [...prev, e.detail]);
    };

    window.addEventListener('webos:app-error', handleAppError as EventListener);
    return () => {
      window.removeEventListener('webos:app-error', handleAppError as EventListener);
    };
  }, []);

  const handleClose = (errorId: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== errorId));
    if (window.webos) {
      (
        window.webos as { errorHandler?: { markAppErrorRecovered: (id: string) => void } }
      ).errorHandler?.markAppErrorRecovered(errorId);
    }
  };

  return (
    <>
      {errors.map((error) => (
        <ErrorDialog key={error.id} error={error} onClose={() => handleClose(error.id)} />
      ))}
    </>
  );
};

export default ErrorDialog;
