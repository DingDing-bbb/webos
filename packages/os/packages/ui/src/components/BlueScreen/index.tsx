// 系统蓝屏组件 - 连续三次系统错误后显示

import React, { useState, useEffect } from 'react';
import type { SystemError } from '@kernel/core/errorHandler';

// 系统配置（Turbopack 不支持 DefinePlugin）
const OS_NAME = typeof __OS_NAME__ !== 'undefined' ? __OS_NAME__ : 'WebOS';
const OS_VERSION = typeof __OS_VERSION__ !== 'undefined' ? __OS_VERSION__ : '0.0.1';
const BUILD_TIME = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString();

declare const __OS_NAME__: string | undefined;
declare const __OS_VERSION__: string | undefined;
declare const __BUILD_TIME__: string | undefined;

interface BlueScreenProps {
  errors: SystemError[];
  errorCount: number;
  onRecover: () => void;
  onReset: () => void;
}

// SVG 图标
const SadIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.8 }}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const ResetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

export const BlueScreen: React.FC<BlueScreenProps> = ({ 
  errors, 
  errorCount, 
  onRecover, 
  onReset 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  // 最新错误
  const latestError = errors[errors.length - 1];

  // 模拟进度条
  useEffect(() => {
    if (isRecovering) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isRecovering]);

  const handleRecover = () => {
    setIsRecovering(true);
    setTimeout(() => {
      onRecover();
    }, 2000);
  };

  // 生成错误摘要（包含时间格式化函数）
  const errorSummary = `
A problem has been detected and ${OS_NAME} has been shut down to prevent damage.

ERROR_CODE: ${latestError?.code || 'UNKNOWN'}

${latestError?.message || 'An unknown system error occurred.'}

${latestError?.source ? `Error source: ${latestError.source}${latestError.line ? `:${latestError.line}` : ''}` : ''}

Technical Information:

*** STOP: ${latestError?.code || '0x00000000'}

*** Error Count: ${errorCount}

${errors.slice(-3).map((e, i) => `[${i + 1}] ${e.code}: ${e.message}`).join('\n')}

If this is the first time you've seen this error screen,
restart your system. If this screen appears again, follow
these steps:

- Check to make sure any new hardware or software is properly installed.
- If problems continue, disable or remove any newly installed hardware or software.
- Try recovering your system from a saved state.

Advanced troubleshooting:
- Press F8 to enter Safe Mode (not available in this version)
- Contact system administrator for assistance
  `.trim();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#0078d7',
      color: '#fff',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      padding: '10% 15%',
      overflow: 'auto',
      zIndex: 99999
    }}>
      {/* 恢复进度条 */}
      {isRecovering && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: '#fff',
            transition: 'width 0.05s linear'
          }} />
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <SadIcon />
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: 300,
            letterSpacing: '1px'
          }}>
            Your system ran into a problem
          </h1>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '16px',
            opacity: 0.8
          }}>
            This is a system-level error that requires attention.
          </p>
        </div>
      </div>

      {/* 错误代码 */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '16px 20px',
        marginBottom: '24px',
        fontFamily: 'Consolas, monospace',
        fontSize: '14px'
      }}>
        <div style={{ marginBottom: '8px', opacity: 0.7 }}>
          Error Code:
        </div>
        <div style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '2px' }}>
          {latestError?.code || 'ERR_UNKNOWN'}
        </div>
        <div style={{ marginTop: '12px', opacity: 0.8 }}>
          {latestError?.message}
        </div>
      </div>

      {/* 错误计数 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '24px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '12px 20px',
          background: 'rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ fontSize: '36px', fontWeight: 600 }}>{errorCount}</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Consecutive Errors</div>
        </div>
        <div style={{ flex: 1, opacity: 0.8, fontSize: '14px', lineHeight: 1.6 }}>
          The system encountered {errorCount} consecutive errors within a short period.
          <br />
          This could indicate a serious problem with your system configuration or hardware.
        </div>
      </div>

      {/* 错误详情 */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: '#fff',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '13px',
          marginBottom: showDetails ? '16px' : '24px'
        }}
      >
        {showDetails ? 'Hide' : 'Show'} Error Details
      </button>

      {showDetails && (
        <pre style={{
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '16px',
          marginBottom: '24px',
          fontFamily: 'Consolas, monospace',
          fontSize: '12px',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {errorSummary}
        </pre>
      )}

      {/* 操作按钮 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '20px'
      }}>
        <button
          onClick={handleRecover}
          disabled={isRecovering}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 24px',
            background: '#fff',
            color: '#0078d7',
            border: 'none',
            cursor: isRecovering ? 'wait' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            opacity: isRecovering ? 0.7 : 1,
            minWidth: '180px'
          }}
        >
          <RefreshIcon />
          {isRecovering ? 'Recovering...' : 'Try to Recover'}
        </button>

        <button
          onClick={onReset}
          disabled={isRecovering}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 24px',
            background: 'transparent',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            cursor: isRecovering ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            minWidth: '180px',
            opacity: isRecovering ? 0.5 : 1
          }}
        >
          <ResetIcon />
          Reset System
        </button>
      </div>

      {/* 帮助信息 */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '15%',
        right: '15%',
        fontSize: '12px',
        opacity: 0.6,
        lineHeight: 1.8
      }}>
        <p style={{ margin: 0 }}>
          For more information about this issue and possible fixes, 
          visit the system documentation or contact your administrator.
        </p>
        <p style={{ margin: '8px 0 0 0', opacity: 0.7 }}>
          {OS_NAME} Version {OS_VERSION} | Build {BUILD_TIME}
        </p>
      </div>

      {/* QR 码占位（模拟） */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '15%',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px'
        }}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            {/* 简化的 QR 码样式 */}
            <rect x="5" y="5" width="15" height="15" fill="#000"/>
            <rect x="40" y="5" width="15" height="15" fill="#000"/>
            <rect x="5" y="40" width="15" height="15" fill="#000"/>
            <rect x="8" y="8" width="9" height="9" fill="#fff"/>
            <rect x="43" y="8" width="9" height="9" fill="#fff"/>
            <rect x="8" y="43" width="9" height="9" fill="#fff"/>
            <rect x="11" y="11" width="3" height="3" fill="#000"/>
            <rect x="46" y="11" width="3" height="3" fill="#000"/>
            <rect x="11" y="46" width="3" height="3" fill="#000"/>
            <rect x="25" y="5" width="5" height="5" fill="#000"/>
            <rect x="30" y="15" width="5" height="5" fill="#000"/>
            <rect x="25" y="25" width="10" height="10" fill="#000"/>
            <rect x="40" y="40" width="15" height="15" fill="#000"/>
            <rect x="45" y="45" width="5" height="5" fill="#fff"/>
          </svg>
        </div>
        <div style={{ fontSize: '11px', opacity: 0.7 }}>
          Scan for help
        </div>
      </div>
    </div>
  );
};

// 蓝屏容器 - 监听蓝屏事件
export const BlueScreenContainer: React.FC = () => {
  const [showBlueScreen, setShowBlueScreen] = useState(false);
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const handleBlueScreen = (e: CustomEvent<{
      error: SystemError;
      errorCount: number;
      allErrors: SystemError[];
    }>) => {
      setErrors(e.detail.allErrors);
      setErrorCount(e.detail.errorCount);
      setShowBlueScreen(true);
    };

    window.addEventListener('webos:blue-screen', handleBlueScreen as EventListener);
    return () => {
      window.removeEventListener('webos:blue-screen', handleBlueScreen as EventListener);
    };
  }, []);

  const handleRecover = () => {
    if (window.webos) {
      (window.webos as { errorHandler?: { recoverFromBlueScreen: () => boolean } }).errorHandler?.recoverFromBlueScreen();
    }
    setShowBlueScreen(false);
    setErrors([]);
    setErrorCount(0);
  };

  const handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (!showBlueScreen) return null;

  return (
    <BlueScreen
      errors={errors}
      errorCount={errorCount}
      onRecover={handleRecover}
      onReset={handleReset}
    />
  );
};

export default BlueScreen;
