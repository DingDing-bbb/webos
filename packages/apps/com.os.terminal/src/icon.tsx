/**
 * 终端图标 - 简洁版
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
    <rect x="4" y="8" width="40" height="32" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 20L18 26L12 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 32H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default TerminalIcon;
