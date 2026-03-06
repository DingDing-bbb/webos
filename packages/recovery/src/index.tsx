// Recovery Mode - 恢复模式
// 当系统检测到严重错误时进入此模式

import React, { useState } from 'react';
import type { BootError, BootStatus } from '@bootloader';

interface RecoveryModeProps {
  status: BootStatus;
  onRetry: () => void;
  onReset: () => void;
  onRecoverFromCache: () => void;
}

// SVG 图标组件
const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const PackageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const NetworkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
    <line x1="6" y1="6" x2="6.01" y2="6"/>
    <line x1="6" y1="18" x2="6.01" y2="18"/>
  </svg>
);

const CacheIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);

const RuntimeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

export const RecoveryMode: React.FC<RecoveryModeProps> = ({
  status,
  onRetry,
  onReset,
  onRecoverFromCache
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // 获取错误类型图标
  const getErrorIcon = (type: BootError['type']): React.ReactNode => {
    switch (type) {
      case 'syntax': return <WarningIcon />;
      case 'module': return <PackageIcon />;
      case 'network': return <NetworkIcon />;
      case 'cache': return <CacheIcon />;
      case 'runtime': return <RuntimeIcon />;
      case 'warning': return <BellIcon />;
      default: return <ErrorIcon />;
    }
  };

  // 获取错误类型描述
  const getErrorTypeLabel = (type: BootError['type']): string => {
    switch (type) {
      case 'syntax': return 'Syntax Error';
      case 'module': return 'Module Error';
      case 'network': return 'Network Error';
      case 'cache': return 'Cache Error';
      case 'runtime': return 'Runtime Error';
      case 'warning': return 'Warning';
      default: return 'Unknown Error';
    }
  };

  // 格式化时间
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString();
  };

  // 计算错误统计
  const errorStats = {
    total: status.errors.length,
    syntax: status.errors.filter(e => e.type === 'syntax').length,
    module: status.errors.filter(e => e.type === 'module').length,
    network: status.errors.filter(e => e.type === 'network').length
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1a1a 100%)',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Logo */}
      <div style={{
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <svg width="80" height="40" viewBox="0 0 80 40">
          <text 
            x="50%" 
            y="50%" 
            dominantBaseline="middle" 
            textAnchor="middle"
            fill="#f44336"
            fontSize="24"
            fontWeight="300"
          >
            {__OS_NAME__}
          </text>
        </svg>
        <div style={{
          color: '#f44336',
          fontSize: '14px',
          marginTop: '10px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Recovery Mode
        </div>
      </div>

      {/* 错误摘要 */}
      <div style={{
        background: 'rgba(244, 67, 54, 0.1)',
        border: '1px solid rgba(244, 67, 54, 0.3)',
        borderRadius: '8px',
        padding: '20px 30px',
        marginBottom: '30px',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h2 style={{
          margin: '0 0 15px 0',
          fontSize: '18px',
          color: '#f44336'
        }}>
          System Error Detected
        </h2>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '15px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {errorStats.total}
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>Total Errors</div>
          </div>
          {errorStats.syntax > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#ff9800' }}>
                {errorStats.syntax}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>Syntax</div>
            </div>
          )}
          {errorStats.module > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#e91e63' }}>
                {errorStats.module}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>Module</div>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#888',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {showDetails ? 'Hide' : 'Show'} Error Details
        </button>
      </div>

      {/* 错误详情 */}
      {showDetails && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {status.errors.map((error, index) => (
            <div
              key={index}
              style={{
                borderBottom: index < status.errors.length - 1 
                  ? '1px solid rgba(255,255,255,0.1)' 
                  : 'none',
                padding: '10px 0'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '5px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>{getErrorIcon(error.type)}</span>
                <span style={{ 
                  color: '#f44336',
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  {getErrorTypeLabel(error.type)}
                </span>
                <span style={{
                  color: '#666',
                  fontSize: '11px',
                  marginLeft: 'auto'
                }}>
                  {formatTime(error.timestamp)}
                </span>
              </div>
              
              <div style={{
                color: '#ccc',
                fontSize: '13px',
                marginBottom: '5px'
              }}>
                {error.message}
              </div>
              
              {error.file && (
                <div style={{
                  color: '#888',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}>
                  {error.file}
                  {error.line && `:${error.line}`}
                  {error.column && `:${error.column}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 恢复选项 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
        width: '100%'
      }}>
        {status.canRecover && (
          <>
            <button
              onClick={onRecoverFromCache}
              style={{
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '15px 20px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RefreshIcon /> Restore from Cache
            </button>

            <button
              onClick={onRetry}
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '15px 20px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PlayIcon /> Retry Boot
            </button>
          </>
        )}

        <button
          onClick={onReset}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '15px 20px',
            color: '#f44336',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ResetIcon /> Reset System (Clear All Data)
        </button>
      </div>

      {/* 帮助信息 */}
      <div style={{
        marginTop: '30px',
        color: '#666',
        fontSize: '12px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <p>If the system cannot boot properly, you can:</p>
        <ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>Try restoring from cache</li>
          <li>Check your network connection</li>
          <li>Clear browser cache and reload</li>
          <li>Reset system to factory defaults</li>
        </ol>
      </div>

      {/* 版本信息 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        color: '#444',
        fontSize: '11px'
      }}>
        {__OS_NAME__} v{__OS_VERSION__} | Recovery Mode
      </div>
    </div>
  );
};

export default RecoveryMode;
