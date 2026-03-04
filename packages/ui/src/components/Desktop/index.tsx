// 桌面组件

import React, { useRef, useEffect } from 'react';

// 壁纸类型
export type WallpaperType = 'soft' | 'image' | 'video' | 'animated' | 'oobe' | 'sunrise' | 'ocean' | 'forest';

// 壁纸配置
export interface WallpaperConfig {
  type: WallpaperType;
  imageUrl?: string;   // 图片壁纸 URL
  videoUrl?: string;   // 视频壁纸 URL
  noAnimation?: boolean; // 禁用动画（省电模式）
}

interface DesktopIcon {
  id: string;
  name: string;
  icon: React.ReactNode;
  onDoubleClick: () => void;
}

interface DesktopProps {
  icons?: DesktopIcon[];
  children?: React.ReactNode;
  onOpenApp?: (appId: string, title: string) => void;
  wallpaper?: WallpaperConfig;
}

// 默认图标 SVG
const FolderIcon = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <path d="M4 12C4 9.79 5.79 8 8 8H18L22 12H40C42.21 12 44 13.79 44 16V36C44 38.21 42.21 40 40 40H8C5.79 40 4 38.21 4 36V12Z" fill="#FFC107"/>
    <path d="M4 16H44V36C44 38.21 42.21 40 40 40H8C5.79 40 4 38.21 4 36V16Z" fill="#FFD54F"/>
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <path d="M24 30C27.3137 30 30 27.3137 30 24C30 20.6863 27.3137 18 24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M24 4V10M24 38V44M4 24H10M38 24H44M10.1 10.1L14.3 14.3M33.7 33.7L37.9 37.9M37.9 10.1L33.7 14.3M14.3 33.7L10.1 37.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const TerminalIcon = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <rect x="4" y="8" width="40" height="32" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 20L18 26L12 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 32H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
    <path d="M24 12V24L32 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// 壁纸组件
const Wallpaper: React.FC<{ config: WallpaperConfig }> = ({ config }) => {
  const { type, imageUrl, videoUrl, noAnimation } = config;
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // 视频壁纸自动播放
  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {
        // 自动播放可能被浏览器阻止，静音后重试
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [type, videoUrl]);
  
  // 构建壁纸类名
  const wallpaperClasses = [
    'os-wallpaper',
    type === 'soft' && 'os-wallpaper-soft',
    type === 'image' && 'os-wallpaper-image',
    type === 'video' && 'os-wallpaper-video',
    type === 'animated' && 'os-wallpaper-animated',
    type === 'oobe' && 'os-wallpaper-oobe',
    type === 'sunrise' && 'os-wallpaper-sunrise',
    type === 'ocean' && 'os-wallpaper-ocean',
    type === 'forest' && 'os-wallpaper-forest',
    noAnimation && 'os-wallpaper-no-animation'
  ].filter(Boolean).join(' ');
  
  // 图片壁纸样式
  const imageStyle = type === 'image' && imageUrl 
    ? { '--wallpaper-image': `url(${imageUrl})` } as React.CSSProperties 
    : {};
  
  // 视频壁纸
  if (type === 'video' && videoUrl) {
    return (
      <div className={wallpaperClasses}>
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    );
  }
  
  // 动态壁纸渲染独立色块
  if (type === 'animated') {
    return (
      <div className={wallpaperClasses} style={imageStyle}>
        <div className="wallpaper-blobs">
          <div className="wallpaper-blob wallpaper-blob-1" />
          <div className="wallpaper-blob wallpaper-blob-2" />
          <div className="wallpaper-blob wallpaper-blob-3" />
          <div className="wallpaper-blob wallpaper-blob-4" />
          <div className="wallpaper-blob wallpaper-blob-5" />
        </div>
      </div>
    );
  }
  
  return <div className={wallpaperClasses} style={imageStyle} />;
};

export const Desktop: React.FC<DesktopProps> = ({ 
  icons, 
  children, 
  onOpenApp,
  wallpaper = { type: 'soft' } 
}) => {
  // 默认桌面图标 - 使用 onOpenApp 回调
  const defaultIcons: DesktopIcon[] = onOpenApp ? [
    {
      id: 'com.os.filemanager',
      name: 'Files',
      icon: <FolderIcon />,
      onDoubleClick: () => onOpenApp('com.os.filemanager', 'File Manager')
    },
    {
      id: 'com.os.terminal',
      name: 'Terminal',
      icon: <TerminalIcon />,
      onDoubleClick: () => onOpenApp('com.os.terminal', 'Terminal')
    },
    {
      id: 'com.os.settings',
      name: 'Settings',
      icon: <SettingsIcon />,
      onDoubleClick: () => onOpenApp('com.os.settings', 'Settings')
    },
    {
      id: 'com.os.clock',
      name: 'Clock',
      icon: <ClockIcon />,
      onDoubleClick: () => onOpenApp('com.os.clock', 'Clock')
    }
  ] : [];

  const displayIcons = icons || defaultIcons;

  return (
    <div className="os-desktop">
      {/* 壁纸层 */}
      <Wallpaper config={wallpaper} />
      
      {/* 桌面图标层 */}
      <div className="os-desktop-icons">
        {displayIcons.map((icon) => (
          <div
            key={icon.id}
            className="os-desktop-icon"
            onDoubleClick={icon.onDoubleClick}
            tabIndex={0}
            role="button"
            aria-label={icon.name}
          >
            <div className="os-desktop-icon-image">
              {icon.icon}
            </div>
            <span className="os-desktop-icon-label">{icon.name}</span>
          </div>
        ))}
      </div>
      
      {/* 窗口层 */}
      {children}
    </div>
  );
};

export { FolderIcon, SettingsIcon, TerminalIcon, ClockIcon };
