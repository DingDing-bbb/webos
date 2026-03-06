/**
 * 时钟图标 - 简洁版
 */
import React from 'react';
import type { IconProps } from '../../registry';

export const ClockIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    style={style}
  >
    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
    <path d="M24 12V24L32 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default ClockIcon;
