// 桌面组件

import React, { useRef, useEffect } from 'react';

// 壁纸类型
export type WallpaperType = 'soft' | 'image' | 'video' | 'animated' | 'oobe' | 'sunrise' | 'ocean' | 'forest' | 'catgirl-static' | 'catgirl-animated';

// 预设壁纸 URL（本地路径）
const PRESET_WALLPAPER_URLS = {
  'catgirl-static': '/wallpapers/catgirl-static.png',
  'catgirl-animated': '/wallpapers/catgirl-animated.mp4'
};

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
  wallpaper?: WallpaperConfig;
}

// 壁纸组件
const Wallpaper: React.FC<{ config: WallpaperConfig }> = ({ config }) => {
  const { type, imageUrl, videoUrl, noAnimation } = config;
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // 视频类型包括 'video' 和 'catgirl-animated'
    if ((type === 'video' || type === 'catgirl-animated') && videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [type]);
  
  // 处理预设壁纸
  const actualImageUrl = type === 'catgirl-static' ? PRESET_WALLPAPER_URLS['catgirl-static'] : imageUrl;
  const actualVideoUrl = type === 'catgirl-animated' ? PRESET_WALLPAPER_URLS['catgirl-animated'] : videoUrl;
  
  // 判断是否为视频类型壁纸
  const isVideoType = type === 'video' || type === 'catgirl-animated';
  // 判断是否为图片类型壁纸
  const isImageType = type === 'image' || type === 'catgirl-static';
  
  const wallpaperClasses = [
    'os-wallpaper',
    type === 'soft' && 'os-wallpaper-soft',
    isImageType && 'os-wallpaper-image',
    isVideoType && 'os-wallpaper-video',
    type === 'animated' && 'os-wallpaper-animated',
    type === 'oobe' && 'os-wallpaper-oobe',
    type === 'sunrise' && 'os-wallpaper-sunrise',
    type === 'ocean' && 'os-wallpaper-ocean',
    type === 'forest' && 'os-wallpaper-forest',
    noAnimation && 'os-wallpaper-no-animation'
  ].filter(Boolean).join(' ');
  
  const imageStyle = isImageType && actualImageUrl 
    ? { '--wallpaper-image': `url(${actualImageUrl})` } as React.CSSProperties 
    : {};
  
  if (isVideoType && actualVideoUrl) {
    return (
      <div className={wallpaperClasses}>
        <video
          ref={videoRef}
          src={actualVideoUrl}
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
  apps,
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
