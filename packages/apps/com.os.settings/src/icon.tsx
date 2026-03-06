/**
 * 设置图标 - 简洁版
 */
import React from 'react';
import type { IconProps } from '../../registry';

export const SettingsIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    style={style}
  >
    <path d="M24 30C27.3137 30 30 27.3137 30 24C30 20.6863 27.3137 18 24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M24 4V10M24 38V44M4 24H10M38 24H44M10.1 10.1L14.3 14.3M33.7 33.7L37.9 37.9M37.9 10.1L33.7 14.3M14.3 33.7L10.1 37.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default SettingsIcon;
