/**
 * 终端图标
 */
import React from 'react';
import type { IconProps } from '../../registry';

export const TerminalIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    style={style}
  >
    {/* 终端窗口背景 */}
    <rect
      x="4"
      y="8"
      width="40"
      height="32"
      rx="4"
      fill="#1E1E1E"
      stroke="#3C3C3C"
      strokeWidth="2"
    />
    {/* 窗口按钮 */}
    <circle cx="12" cy="15" r="3" fill="#FF5F57"/>
    <circle cx="21" cy="15" r="3" fill="#FEBC2E"/>
    <circle cx="30" cy="15" r="3" fill="#28C840"/>
    {/* 命令行 */}
    <path
      d="M12 26L18 32L12 38"
      stroke="#4EC9B0"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 38H34"
      stroke="#D4D4D4"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* 光标 */}
    <rect x="34" y="36" width="2" height="4" fill="#AEAFAD"/>
  </svg>
);

export default TerminalIcon;
