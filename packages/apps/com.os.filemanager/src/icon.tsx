/**
 * 文件管理器图标 - 简洁版
 */
import React from 'react';
import type { IconProps } from '../../types';

export const FileManagerIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    style={style}
  >
    <path d="M4 12C4 9.79 5.79 8 8 8H18L22 12H40C42.21 12 44 13.79 44 16V36C44 38.21 42.21 40 40 40H8C5.79 40 4 38.21 4 36V12Z" fill="#FFC107"/>
    <path d="M4 16H44V36C44 38.21 42.21 40 40 40H8C5.79 40 4 38.21 4 36V16Z" fill="#FFD54F"/>
  </svg>
);

export default FileManagerIcon;
