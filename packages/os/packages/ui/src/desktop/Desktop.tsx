/**
 * @fileoverview Desktop Component
 * @module @ui/desktop/Desktop
 *
 * A professional desktop environment with:
 * - Icon arrangement
 * - Selection box
 * - Context menu
 * - Wallpaper support
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DesktopIcon, DesktopIconItem } from './DesktopIcon';
import { ContextMenu, ContextMenuItem } from './ContextMenu';

// ============================================================================
// Types
// ============================================================================

export type WallpaperType = 'image' | 'video' | 'gradient' | 'solid';

export interface WallpaperConfig {
  /** Wallpaper type */
  type: WallpaperType;
  /** Image URL (for image type) */
  imageUrl?: string;
  /** Video URL (for video type) */
  videoUrl?: string;
  /** Gradient colors (for gradient type) */
  gradient?: string[];
  /** Solid color (for solid type) */
  color?: string;
  /** No animation */
  noAnimation?: boolean;
}

export interface DesktopProps {
  /** Desktop icons */
  icons?: DesktopIconItem[];
  /** Wallpaper configuration */
  wallpaper?: WallpaperConfig;
  /** Context menu items for desktop */
  contextMenuItems?: ContextMenuItem[];
  /** Called when icon is opened */
  onIconOpen?: (id: string) => void;
  /** Called when icon is selected */
  onIconSelect?: (ids: string[]) => void;
  /** Children (typically windows) */
  children?: React.ReactNode;
  /** Custom className */
  className?: string;
}

interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

// ============================================================================
// Wallpaper Component
// ============================================================================

const Wallpaper: React.FC<{ config: WallpaperConfig }> = ({ config }) => {
  const { type, imageUrl, videoUrl, gradient, color } = config;

  if (type === 'video' && videoUrl) {
    return (
      <div className="desktop-wallpaper video">
        <video src={videoUrl} autoPlay loop muted playsInline />
      </div>
    );
  }

  if (type === 'image' && imageUrl) {
    return (
      <div className="desktop-wallpaper image" style={{ backgroundImage: `url(${imageUrl})` }} />
    );
  }

  if (type === 'gradient' && gradient) {
    return (
      <div
        className="desktop-wallpaper gradient"
        style={{ background: `linear-gradient(135deg, ${gradient.join(', ')})` }}
      />
    );
  }

  if (type === 'solid' && color) {
    return <div className="desktop-wallpaper solid" style={{ backgroundColor: color }} />;
  }

  // Default gradient
  return (
    <div
      className="desktop-wallpaper gradient default"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    />
  );
};

// ============================================================================
// Component
// ============================================================================

export const Desktop: React.FC<DesktopProps> = ({
  icons = [],
  wallpaper = { type: 'gradient' },
  contextMenuItems = [],
  onIconOpen,
  onIconSelect,
  children,
  className = '',
}) => {
  // ========================================
  // State
  // ========================================
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());
  const [contextMenuState, setContextMenuState] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
  } | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({});

  const desktopRef = useRef<HTMLDivElement>(null);

  // ========================================
  // Initialize icon positions
  // ========================================
  useEffect(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const gridX = 100;
    const gridY = 110;
    const paddingX = 20;
    const paddingY = 20;

    icons.forEach((icon, index) => {
      const col = Math.floor(index / 10);
      const row = index % 10;
      positions[icon.id] = {
        x: paddingX + col * gridX,
        y: paddingY + row * gridY,
      };
    });

    setIconPositions(positions);
  }, [icons]);

  // ========================================
  // Icon Selection
  // ========================================
  const handleIconSelect = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();

      setSelectedIcons((prev) => {
        let newSelection: Set<string>;

        if (e.ctrlKey || e.metaKey) {
          // Toggle selection
          newSelection = new Set(prev);
          if (newSelection.has(id)) {
            newSelection.delete(id);
          } else {
            newSelection.add(id);
          }
        } else {
          // Single selection
          newSelection = new Set([id]);
        }

        const ids = Array.from(newSelection);
        onIconSelect?.(ids);
        return newSelection;
      });
    },
    [onIconSelect]
  );

  const handleDesktopClick = useCallback(() => {
    setSelectedIcons(new Set());
    onIconSelect?.([]);
  }, [onIconSelect]);

  // ========================================
  // Selection Box
  // ========================================
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.desktop-icon')) return;

    setSelectionBox({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!selectionBox) return;

      setSelectionBox({
        ...selectionBox,
        currentX: e.clientX,
        currentY: e.clientY,
      });
    },
    [selectionBox]
  );

  const handleMouseUp = useCallback(() => {
    if (!selectionBox) return;

    // Calculate selection
    const rect = {
      left: Math.min(selectionBox.startX, selectionBox.currentX),
      right: Math.max(selectionBox.startX, selectionBox.currentX),
      top: Math.min(selectionBox.startY, selectionBox.currentY),
      bottom: Math.max(selectionBox.startY, selectionBox.currentY),
    };

    // Find icons within selection
    const selected = new Set<string>();
    icons.forEach((icon) => {
      const pos = iconPositions[icon.id];
      if (!pos) return;

      // Check if icon is within selection box
      if (
        pos.x >= rect.left &&
        pos.x + 80 <= rect.right &&
        pos.y >= rect.top &&
        pos.y + 90 <= rect.bottom
      ) {
        selected.add(icon.id);
      }
    });

    setSelectedIcons(selected);
    onIconSelect?.(Array.from(selected));
    setSelectionBox(null);
  }, [selectionBox, icons, iconPositions, onIconSelect]);

  // ========================================
  // Context Menu
  // ========================================
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuState({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuState(null);
  }, []);

  // ========================================
  // Icon Open
  // ========================================
  const handleIconOpen = useCallback(
    (id: string) => {
      onIconOpen?.(id);
    },
    [onIconOpen]
  );

  // ========================================
  // Render
  // ========================================
  const selectionBoxRect = selectionBox
    ? {
        left: Math.min(selectionBox.startX, selectionBox.currentX),
        top: Math.min(selectionBox.startY, selectionBox.currentY),
        width: Math.abs(selectionBox.currentX - selectionBox.startX),
        height: Math.abs(selectionBox.currentY - selectionBox.startY),
      }
    : null;

  return (
    <div
      ref={desktopRef}
      className={`desktop ${className}`}
      onClick={handleDesktopClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Wallpaper */}
      <Wallpaper config={wallpaper} />

      {/* Desktop Icons */}
      <div className="desktop-icons">
        {icons.map((icon) => (
          <DesktopIcon
            key={icon.id}
            icon={icon}
            position={iconPositions[icon.id] || { x: 0, y: 0 }}
            isSelected={selectedIcons.has(icon.id)}
            onSelect={handleIconSelect}
            onOpen={handleIconOpen}
            onDragEnd={(pos) => {
              setIconPositions((prev) => ({
                ...prev,
                [icon.id]: pos,
              }));
            }}
          />
        ))}
      </div>

      {/* Selection Box */}
      {selectionBoxRect && (
        <div
          className="desktop-selection-box"
          style={{
            left: selectionBoxRect.left,
            top: selectionBoxRect.top,
            width: selectionBoxRect.width,
            height: selectionBoxRect.height,
          }}
        />
      )}

      {/* Windows Layer */}
      {children}

      {/* Context Menu */}
      {contextMenuState?.isOpen && (
        <ContextMenu
          x={contextMenuState.x}
          y={contextMenuState.y}
          items={contextMenuItems}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
};

export default Desktop;
