// 桌面组件

import React, { useRef, useEffect } from 'react';

// 壁纸类型
export type WallpaperType = 'soft' | 'image' | 'video' | 'animated' | 'oobe' | 'sunrise' | 'ocean' | 'forest';

// 壁纸配置
export interface WallpaperConfig {
  type: WallpaperType;
  imageUrl?: string;
  videoUrl?: string;
  noAnimation?: boolean;
}

// 桌面图标
export interface DesktopIconItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  onDoubleClick: () => void;
}

interface DesktopProps {
  icons?: DesktopIconItem[];
  children?: React.ReactNode;
  apps?: DesktopIconItem[];  // 新增：从注册中心获取的应用列表
  onOpenApp?: (appId: string, title: string) => void;
  wallpaper?: WallpaperConfig;
}

// 壁纸组件
const Wallpaper: React.FC<{ config: WallpaperConfig }> = ({ config }) => {
  const { type, imageUrl, videoUrl, noAnimation } = config;
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [type, videoUrl]);
  
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
  
  const imageStyle = type === 'image' && imageUrl 
    ? { '--wallpaper-image': `url(${imageUrl})` } as React.CSSProperties 
    : {};
  
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
  apps, // 使用apps参数
  onOpenApp,
  wallpaper = { type: 'soft' } 
}) => {
  // 优先使用apps，其次使用icons
  const displayIcons = apps || icons || [];

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

export default Desktop;
