/**
 * @fileoverview Desktop Icon Component
 * @module @ui/desktop/DesktopIcon
 *
 * A desktop icon with:
 * - Icon + label
 * - Selection state
 * - Double-click to open
 * - Drag support
 */

import React, { useState, useRef, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface DesktopIconItem {
  /** Unique icon ID */
  id: string;
  /** Display name */
  name: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Custom className */
  className?: string;
}

export interface DesktopIconProps {
  /** Icon data */
  icon: DesktopIconItem;
  /** Position on desktop */
  position: { x: number; y: number };
  /** Whether icon is selected */
  isSelected: boolean;
  /** Called when icon is selected */
  onSelect: (id: string, e: React.MouseEvent) => void;
  /** Called when icon is opened (double-click) */
  onOpen: (id: string) => void;
  /** Called when drag ends */
  onDragEnd?: (position: { x: number; y: number }) => void;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  icon,
  position,
  isSelected,
  onSelect,
  onOpen,
  onDragEnd,
  className = '',
}) => {
  // ========================================
  // State
  // ========================================
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const iconRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  // ========================================
  // Handlers
  // ========================================
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;

      e.stopPropagation();
      onSelect(icon.id, e);

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };

      setIsDragging(true);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragStartRef.current) return;

        const deltaX = moveEvent.clientX - dragStartRef.current.x;
        const deltaY = moveEvent.clientY - dragStartRef.current.y;

        setDragOffset({ x: deltaX, y: deltaY });
      };

      const handleMouseUp = () => {
        if (dragStartRef.current) {
          const newX = dragStartRef.current.posX + dragOffset.x;
          const newY = dragStartRef.current.posY + dragOffset.y;

          if (Math.abs(dragOffset.x) > 5 || Math.abs(dragOffset.y) > 5) {
            onDragEnd?.({ x: newX, y: newY });
          }
        }

        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
        dragStartRef.current = null;

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [icon.id, position, onSelect, onDragEnd, dragOffset]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(icon.id, e);
    },
    [icon.id, onSelect]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpen(icon.id);
    },
    [icon.id, onOpen]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(icon.id, e);
    },
    [icon.id, onSelect]
  );

  // ========================================
  // Render
  // ========================================
  const displayPosition = isDragging
    ? {
        x: position.x + dragOffset.x,
        y: position.y + dragOffset.y,
      }
    : position;

  return (
    <div
      ref={iconRef}
      className={`desktop-icon ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${icon.className} ${className}`}
      style={{
        left: displayPosition.x,
        top: displayPosition.y,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      tabIndex={0}
      role="button"
      aria-label={icon.name}
    >
      <div className="desktop-icon-image">{icon.icon}</div>
      <span className="desktop-icon-label">{icon.name}</span>
    </div>
  );
};

export default DesktopIcon;
