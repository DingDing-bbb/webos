/**
 * 启动界面 UI 组件
 *
 * 显示真正的启动过程：
 * - Logo
 * - 加载动画
 * - 状态文本
 * - 进度条
 */

import React from 'react';

// ============================================================================
// Types
// ============================================================================

export interface BootUIProps {
  progress: number;
  statusText: string;
  error?: string | null;
  onRetry?: () => void;
}

// ============================================================================
// Spinner Component
// ============================================================================

function Spinner({ size = 40, color = 'white' }: { size?: number; color?: string }) {
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
}

// ============================================================================
// BootUI Component
// ============================================================================

export const BootUI: React.FC<BootUIProps> = ({ progress, statusText, error, onRetry }) => {
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
          <button className="os-boot-retry" onClick={onRetry} type="button">
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
            WebOS
          </text>
        </svg>
      </div>

      {/* 加载动画 */}
      <div className="os-boot-spinner">
        <Spinner size={40} color="white" />
      </div>

      {/* 状态文本 */}
      <div className="os-boot-text">{statusText}</div>

      {/* 进度条 */}
      <div className="os-boot-progress">
        <div className="os-boot-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* 版本信息 */}
      <div className="os-boot-version">v0.0.1</div>

      {/* 内联样式 */}
      <style>{`
        .os-boot-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .os-boot-logo {
          margin-bottom: 32px;
        }

        .os-boot-spinner {
          margin-bottom: 24px;
        }

        .os-boot-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 16px;
          min-height: 20px;
        }

        .os-boot-progress {
          width: 200px;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .os-boot-progress-bar {
          height: 100%;
          background: white;
          transition: width 0.3s ease;
        }

        .os-boot-version {
          position: absolute;
          bottom: 20px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }

        .os-boot-error {
          margin-top: 16px;
          padding: 8px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 4px;
          color: #ef4444;
          font-size: 14px;
          max-width: 300px;
          text-align: center;
        }

        .os-boot-retry {
          margin-top: 16px;
          padding: 10px 24px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 13px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .os-boot-retry:hover {
          background: rgba(255, 255, 255, 0.2);
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
