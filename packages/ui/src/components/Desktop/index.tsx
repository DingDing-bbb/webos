/**
 * @fileoverview Desktop Environment Component
 * @module @ui/components/Desktop
 *
 * A complete desktop environment with:
 * - Draggable icons with position persistence
 * - Context menu (right-click menu)
 * - Icon selection and multi-select
 * - Wallpaper support (image/video/animated)
 * - Keyboard navigation
 *
 * @example
 * ```tsx
 * import { Desktop } from '@ui/components/Desktop';
 *
 * <Desktop
 *   apps={[
 *     { id: 'settings', name: 'Settings', icon: <SettingsIcon />, onOpen: () => openApp('settings') }
 *   ]}
 *   wallpaper={{ type: 'soft' }}
 * />
 * ```
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Wallpaper type options
 */
export type WallpaperType =
  | 'soft'
  | 'image'
  | 'video'
  | 'animated'
  | 'oobe'
  | 'sunrise'
  | 'ocean'
  | 'forest'
  | 'catgirl-static'
  | 'catgirl-animated';

/**
 * Wallpaper configuration
 */
export interface WallpaperConfig {
  type: WallpaperType;
  imageUrl?: string;
  videoUrl?: string;
  noAnimation?: boolean;
}

/**
 * Desktop icon/app definition
 */
export interface DesktopIconItem {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Handler when icon is opened (double-click) */
  onOpen: () => void;
}

/**
 * Position on desktop grid
 */
interface IconPosition {
  x: number;
  y: number;
}

/**
 * Saved desktop state
 */
interface DesktopState {
  iconPositions: Record<string, IconPosition>;
}

/**
 * Context menu item
 */
interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

/**
 * Context menu position
 */
interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  target: 'desktop' | 'icon';
  iconId?: string;
}

/**
 * Desktop component props
 */
interface DesktopProps {
  /** Application icons to display */
  apps?: DesktopIconItem[];
  /** Legacy prop for icons */
  icons?: DesktopIconItem[];
  /** Wallpaper configuration */
  wallpaper?: WallpaperConfig;
  /** Children (typically windows) */
  children?: React.ReactNode;
}

// ============================================================================
// Constants
// ============================================================================

/** Preset wallpaper URLs */
const PRESET_WALLPAPER_URLS: Record<string, string> = {
  'catgirl-static': '/wallpapers/catgirl-static.png',
  'catgirl-animated': '/wallpapers/catgirl-animated.mp4',
};

/** Grid size for icon snapping */
const GRID_SIZE = 90;
const ICON_WIDTH = 80;
const ICON_HEIGHT = 90;
const PADDING_X = 20;
const PADDING_Y = 20;

/** Local storage key for desktop state */
const STORAGE_KEY = 'webos-desktop-state';

// ============================================================================
// Wallpaper Component
// ============================================================================

const Wallpaper: React.FC<{ config: WallpaperConfig }> = ({ config }) => {
  const { type, imageUrl, videoUrl, noAnimation } = config;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const isVideo = type === 'video' || type === 'catgirl-animated';
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [type]);

  const actualImageUrl =
    type === 'catgirl-static' ? PRESET_WALLPAPER_URLS['catgirl-static'] : imageUrl;
  const actualVideoUrl =
    type === 'catgirl-animated' ? PRESET_WALLPAPER_URLS['catgirl-animated'] : videoUrl;

  const isVideoType = type === 'video' || type === 'catgirl-animated';
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
    noAnimation && 'os-wallpaper-no-animation',
  ]
    .filter(Boolean)
    .join(' ');

  const imageStyle = isImageType && actualImageUrl ? ({ '--wallpaper-image': `url(${actualImageUrl})` } as React.CSSProperties) : {};

  if (isVideoType && actualVideoUrl) {
    return (
      <div className={wallpaperClasses}>
        <video ref={videoRef} src={actualVideoUrl} autoPlay loop muted playsInline />
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

// ============================================================================
// Context Menu Component
// ============================================================================

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="os-context-menu"
      style={{
        left: x,
        top: y,
      }}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return <div key={`divider-${index}`} className="os-context-menu-divider" />;
        }

        return (
          <button
            key={item.id}
            className="os-context-menu-item"
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            disabled={item.disabled}
          >
            {item.icon && <span className="os-context-menu-icon">{item.icon}</span>}
            <span className="os-context-menu-label">{item.label}</span>
            {item.shortcut && <span className="os-context-menu-shortcut">{item.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// Desktop Icon Component
// ============================================================================

interface DesktopIconProps {
  icon: DesktopIconItem;
  position: IconPosition;
  isSelected: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({
  icon,
  position,
  isSelected,
  onSelect,
  onDragStart,
  onDoubleClick,
  onContextMenu,
}) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      ref={iconRef}
      className={`os-desktop-icon ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(icon.id, e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      onMouseDown={(e) => {
        if (e.button === 0) {
          onDragStart(icon.id, e);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(icon.id, e);
        onContextMenu(e);
      }}
      tabIndex={0}
      role="button"
      aria-label={icon.name}
    >
      <div className="os-desktop-icon-image">{icon.icon}</div>
      <span className="os-desktop-icon-label">{icon.name}</span>
    </div>
  );
};

// ============================================================================
// Desktop Component
// ============================================================================

export const Desktop: React.FC<DesktopProps> = ({
  apps,
  icons,
  wallpaper = { type: 'soft' },
  children,
}) => {
  const displayIcons = apps || icons || [];
  const desktopRef = useRef<HTMLDivElement>(null);

  // ========================================
  // State
  // ========================================
  const [iconPositions, setIconPositions] = useState<Record<string, IconPosition>>({});
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    target: 'desktop',
  });

  // Drag state
  const [dragState, setDragState] = useState<{
    iconId: string;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // ========================================
  // Load/Save State
  // ========================================
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: DesktopState = JSON.parse(saved);
        setIconPositions(state.iconPositions || {});
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const saveState = useCallback((positions: Record<string, IconPosition>) => {
    try {
      const state: DesktopState = { iconPositions: positions };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore errors
    }
  }, []);

  // ========================================
  // Icon Position Management
  // ========================================
  const getAutoPosition = useCallback(
    (index: number): IconPosition => {
      if (!desktopRef.current) {
        return { x: PADDING_X, y: PADDING_Y + index * GRID_SIZE };
      }

      const rect = desktopRef.current.getBoundingClientRect();
      const cols = Math.floor((rect.width - PADDING_X * 2) / ICON_WIDTH);
      const col = index % cols;
      const row = Math.floor(index / cols);

      return {
        x: PADDING_X + col * ICON_WIDTH,
        y: PADDING_Y + row * ICON_HEIGHT,
      };
    },
    []
  );

  const getIconPosition = useCallback(
    (id: string, index: number): IconPosition => {
      if (iconPositions[id]) {
        return iconPositions[id];
      }
      return getAutoPosition(index);
    },
    [iconPositions, getAutoPosition]
  );

  const snapToGrid = useCallback((x: number, y: number): IconPosition => {
    const snappedX = Math.round(x / ICON_WIDTH) * ICON_WIDTH + PADDING_X;
    const snappedY = Math.round(y / ICON_HEIGHT) * ICON_HEIGHT + PADDING_Y;

    return {
      x: Math.max(PADDING_X, snappedX),
      y: Math.max(PADDING_Y, snappedY),
    };
  }, []);

  // ========================================
  // Icon Selection
  // ========================================
  const handleIconSelect = useCallback((id: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIcons((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    } else {
      setSelectedIcons(new Set([id]));
    }
  }, []);

  const handleDesktopClick = useCallback(() => {
    setSelectedIcons(new Set());
  }, []);

  // ========================================
  // Icon Dragging
  // ========================================
  const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    const iconElement = (e.target as HTMLElement).closest('.os-desktop-icon');
    if (!iconElement) return;

    const rect = iconElement.getBoundingClientRect();
    const desktopRect = desktopRef.current?.getBoundingClientRect();

    if (!desktopRect) return;

    setDragState({
      iconId: id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  }, []);

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!desktopRef.current) return;

      const desktopRect = desktopRef.current.getBoundingClientRect();
      const newX = e.clientX - desktopRect.left - dragState.offsetX;
      const newY = e.clientY - desktopRect.top - dragState.offsetY;

      const snapped = snapToGrid(newX, newY);

      setIconPositions((prev) => ({
        ...prev,
        [dragState.iconId]: snapped,
      }));
    };

    const handleMouseUp = () => {
      setDragState(null);
      // Save positions after drag
      setIconPositions((prev) => {
        saveState(prev);
        return prev;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, snapToGrid, saveState]);

  // ========================================
  // Context Menu
  // ========================================
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      target: 'desktop',
    });
  }, []);

  const handleIconContextMenu = useCallback(
    (iconId: string, e: React.MouseEvent) => {
      setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        target: 'icon',
        iconId,
      });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // ========================================
  // Context Menu Actions
  // ========================================
  const desktopMenuItems: ContextMenuItem[] = [
    {
      id: 'refresh',
      label: 'Refresh',
      icon: <RefreshIcon />,
      onClick: () => window.location.reload(),
    },
    { id: 'divider-1', label: '', divider: true },
    {
      id: 'new-folder',
      label: 'New Folder',
      icon: <FolderIcon />,
      shortcut: 'Ctrl+Shift+N',
      onClick: () => console.log('New folder'),
    },
    {
      id: 'new-file',
      label: 'New File',
      icon: <FileIcon />,
      onClick: () => console.log('New file'),
    },
    { id: 'divider-2', label: '', divider: true },
    {
      id: 'settings',
      label: 'Display Settings',
      icon: <SettingsIcon />,
      onClick: () => window.webos?.window.open('com.os.settings'),
    },
    {
      id: 'personalize',
      label: 'Personalize',
      icon: <PaletteIcon />,
      onClick: () => console.log('Personalize'),
    },
    { id: 'divider-3', label: '', divider: true },
    {
      id: 'terminal',
      label: 'Open Terminal',
      icon: <TerminalIcon />,
      shortcut: 'Ctrl+Alt+T',
      onClick: () => window.webos?.window.open('com.os.terminal'),
    },
  ];

  const getIconMenuItems = useCallback(
    (iconId: string): ContextMenuItem[] => {
      const icon = displayIcons.find((i) => i.id === iconId);
      return [
        {
          id: 'open',
          label: 'Open',
          icon: <OpenIcon />,
          onClick: () => icon?.onOpen(),
        },
        {
          id: 'open-new-window',
          label: 'Open in New Window',
          icon: <WindowIcon />,
          onClick: () => icon?.onOpen(),
        },
        { id: 'divider-1', label: '', divider: true },
        {
          id: 'pin',
          label: 'Pin to Taskbar',
          icon: <PinIcon />,
          onClick: () => console.log('Pin:', iconId),
        },
        { id: 'divider-2', label: '', divider: true },
        {
          id: 'properties',
          label: 'Properties',
          icon: <InfoIcon />,
          onClick: () => console.log('Properties:', iconId),
        },
      ];
    },
    [displayIcons]
  );

  // ========================================
  // Render
  // ========================================
  return (
    <div
      ref={desktopRef}
      className="os-desktop"
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      {/* Wallpaper Layer */}
      <Wallpaper config={wallpaper} />

      {/* Desktop Icons Layer */}
      <div className="os-desktop-icons">
        {displayIcons.map((icon, index) => (
          <DesktopIcon
            key={icon.id}
            icon={icon}
            position={getIconPosition(icon.id, index)}
            isSelected={selectedIcons.has(icon.id)}
            onSelect={handleIconSelect}
            onDragStart={handleDragStart}
            onDoubleClick={icon.onOpen}
            onContextMenu={(e) => handleIconContextMenu(icon.id, e)}
          />
        ))}
      </div>

      {/* Selection Box (for multi-select) */}
      {/* Could be implemented for drag-to-select */}

      {/* Windows Layer */}
      {children}

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        items={
          contextMenu.target === 'icon' && contextMenu.iconId
            ? getIconMenuItems(contextMenu.iconId)
            : desktopMenuItems
        }
        onClose={closeContextMenu}
      />
    </div>
  );
};

// ============================================================================
// Icon Components
// ============================================================================

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 4v6h-6M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PaletteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

const TerminalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const OpenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const WindowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default Desktop;
