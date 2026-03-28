/**
 * Browser App Icon
 */

import React from 'react';

export const BrowserIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 背景 */}
    <defs>
      <linearGradient id="browser-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285f4" />
        <stop offset="50%" stopColor="#34a853" />
        <stop offset="100%" stopColor="#fbbc05" />
      </linearGradient>
    </defs>
    
    {/* 圆形背景 */}
    <circle cx="24" cy="24" r="22" fill="url(#browser-grad)" />
    
    {/* 地球仪线条 */}
    <ellipse cx="24" cy="24" rx="10" ry="18" stroke="white" strokeWidth="2" fill="none" opacity="0.9" />
    <line x1="6" y1="24" x2="42" y2="24" stroke="white" strokeWidth="2" opacity="0.9" />
    <ellipse cx="24" cy="24" rx="18" ry="10" stroke="white" strokeWidth="2" fill="none" opacity="0.7" />
    
    {/* 中心点 */}
    <circle cx="24" cy="24" r="3" fill="white" />
  </svg>
);

export default BrowserIcon;
