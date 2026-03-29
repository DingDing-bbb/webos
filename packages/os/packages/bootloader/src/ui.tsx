/**
 * @fileoverview Boot UI Components
 * @module @bootloader/ui
 * 
 * 启动界面 UI 组件
 */

import React from 'react';

// ============================================================================
// Types
// ============================================================================

export interface BootUIProps {
  /** 当前进度 (0-100) */
  progress: number;
  /** 状态文本 */
  statusText: string;
  /** 错误消息 */
  error?: string | null;
  /** 重试回调 */
  onRetry?: () => void;
}

export interface BootScreenProps {
  /** 启动完成回调 */
  onComplete: () => void;
  /** 是否显示 UI */
  showUI?: boolean;
}

// ============================================================================
// Spinner Component
// ============================================================================

interface SpinnerProps {
  size?: number;
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 40, color = 'white' }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid rgba(255, 255, 255, 0.2)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'os-boot-spin 0.8s linear infinite',
      }}
    />
  );
};

// ============================================================================
// BootUI Component
// ============================================================================

/**
 * 启动界面 UI 组件
 * 
 * 显示:
 * - 大型 Logo
 * - 白色加载动画
 * - 状态文本
 * - 错误状态和重试选项
 */
export const BootUI: React.FC<BootUIProps> = ({
  progress: _progress,
  statusText,
  error,
  onRetry,
}) => {
  // 获取系统名称和版本
  const osName = (typeof globalThis !== 'undefined' 
    ? (globalThis as unknown as { __OS_NAME__?: string }).__OS_NAME__ 
    : null) || 'WebOS';
  const osVersion = (typeof globalThis !== 'undefined' 
    ? (globalThis as unknown as { __OS_VERSION__?: string }).__OS_VERSION__ 
    : null) || '0.0.1';

  // 错误状态
  if (error) {
    return (
      <div className="os-boot-screen">
        <div className="os-boot-logo">
          <svg width="140" height="50" viewBox="0 0 140 50">
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#ef4444"
              fontSize="28"
              fontFamily="inherit"
              fontWeight="700"
            >
              Error
            </text>
          </svg>
        </div>
        <div className="os-boot-error">{error}</div>
        {onRetry && (
          <button
            className="os-boot-retry"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // 正常启动状态
  return (
    <div className="os-boot-screen">
      {/* Logo */}
      <div className="os-boot-logo">
        <svg width="180" height="60" viewBox="0 0 180 60">
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="white"
            fontSize="38"
            fontFamily="inherit"
            fontWeight="700"
            letterSpacing="-1"
          >
            {osName}
          </text>
        </svg>
      </div>

      {/* 加载动画 */}
      <div className="os-boot-spinner">
        <Spinner size={40} color="white" />
      </div>

      {/* 状态文本 */}
      <div className="os-boot-text">
        {statusText}
      </div>

      {/* 版本信息 */}
      <div className="os-boot-version">
        v{osVersion}
      </div>
    </div>
  );
};

// ============================================================================
// LoadingScreen Component (早期版本风格)
// ============================================================================

/**
 * 加载界面 - 早期版本的启动动画
 * 
 * 显示 W Logo + 进度条
 */
export const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15, 100));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="os-loading-screen">
      <div className="os-loading-content">
        {/* Logo */}
        <div className="os-loading-logo">
          <span className="os-loading-logo-text">W</span>
        </div>

        {/* 名称 */}
        <h1 className="os-loading-title">WebOS</h1>
        <p className="os-loading-subtitle">正在启动...</p>

        {/* 进度条 */}
        <div className="os-loading-progress-bar">
          <div
            className="os-loading-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 内联样式 */}
      <style>{`
        .os-loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #09090b;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .os-loading-content {
          text-align: center;
        }
        
        .os-loading-logo {
          width: 64px;
          height: 64px;
          margin-bottom: 24px;
          border-radius: 12px;
          background: #27272a;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .os-loading-logo-text {
          font-size: 20px;
          font-weight: 600;
          color: white;
        }
        
        .os-loading-title {
          font-size: 18px;
          font-weight: 500;
          color: white;
          margin: 0 0 4px 0;
        }
        
        .os-loading-subtitle {
          font-size: 14px;
          color: #71717a;
          margin: 0 0 32px 0;
        }
        
        .os-loading-progress-bar {
          width: 160px;
          height: 4px;
          background: #27272a;
          border-radius: 9999px;
          overflow: hidden;
        }
        
        .os-loading-progress-fill {
          height: 100%;
          background: white;
          transition: width 150ms ease;
        }
        
        @keyframes os-boot-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BootUI;
