/**
 * 时钟图标
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
    {/* 时钟背景 */}
    <circle
      cx="24"
      cy="24"
      r="20"
      fill="#E3F2FD"
      stroke="#2196F3"
      strokeWidth="2"
    />
    {/* 刻度 */}
    <circle cx="24" cy="8" r="2" fill="#2196F3"/>
    <circle cx="24" cy="40" r="2" fill="#2196F3"/>
    <circle cx="8" cy="24" r="2" fill="#2196F3"/>
    <circle cx="40" cy="24" r="2" fill="#2196F3"/>
    {/* 时针 */}
    <line
      x1="24"
      y1="24"
      x2="24"
      y2="16"
      stroke="#1565C0"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* 分针 */}
    <line
      x1="24"
      y1="24"
      x2="32"
      y2="24"
      stroke="#1976D2"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* 中心点 */}
    <circle cx="24" cy="24" r="2.5" fill="#0D47A1"/>
  </svg>
);

export default ClockIcon;
