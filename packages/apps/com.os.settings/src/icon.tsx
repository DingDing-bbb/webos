/**
 * 设置图标
 */
import React from 'react';
import type { IconProps } from '../../registry';

export const SettingsIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <circle cx="24" cy="24" r="8" fill="none"/>
    <path d="M24 4V10M24 38V44M4 24H10M38 24H44"/>
    <path d="M10.1 10.1L14.3 14.3M33.7 33.7L37.9 37.9"/>
    <path d="M37.9 10.1L33.7 14.3M14.3 33.7L10.1 37.9"/>
    {/* 内部装饰 */}
    <circle cx="24" cy="24" r="3" fill="currentColor"/>
  </svg>
);

export default SettingsIcon;
