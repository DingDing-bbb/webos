/**
 * @fileoverview Widget Component
 * @module @ui/desktop/Widget
 *
 * A desktop widget with:
 * - Draggable
 * - Resizable
 * - Acrylic effect
 */

import React, { useState, useRef, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetProps {
  /** Widget ID */
  id: string;
  /** Widget title */
  title?: string;
  /** Widget icon */
  icon?: React.ReactNode;
  /** Initial size */
  initialSize?: WidgetSize;
  /** Minimum size */
  minSize?: WidgetSize;
  /** Maximum size */
  maxSize?: WidgetSize;
  /** Initial position */
  initialPosition?: WidgetPosition;
  /** Whether widget is draggable */
  draggable?: boolean;
  /** Whether widget is resizable */
  resizable?: boolean;
  /** Whether widget can be collapsed */
  collapsible?: boolean;
  /** Acrylic effect intensity */
  acrylicIntensity?: number;
  /** Widget content */
  children: React.ReactNode;
  /** Called when position changes */
  onPositionChange?: (position: WidgetPosition) => void;
  /** Called when size changes */
  onSizeChange?: (size: WidgetSize) => void;
  /** Called when widget is closed */
  onClose?: () => void;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CollapseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const Widget: React.FC<WidgetProps> = ({
  id: _id,
  title,
  icon,
  initialSize = { width: 300, height: 200 },
  minSize = { width: 200, height: 150 },
  maxSize,
  initialPosition = { x: 100, y: 100 },
  draggable = true,
  resizable = true,
  collapsible = true,
  acrylicIntensity = 0.6,
  children,
  onPositionChange,
  onSizeChange,
  onClose,
  className = '',
}) => {
  // ========================================
  // State
  // ========================================
  const [position, setPosition] = useState<WidgetPosition>(initialPosition);
  const [size, setSize] = useState<WidgetSize>(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // ========================================
  // Drag Handlers
  // ========================================
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (!draggable || isCollapsed) return;

      e.preventDefault();
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

        const newX = Math.max(0, dragStartRef.current.posX + deltaX);
        const newY = Math.max(0, dragStartRef.current.posY + deltaY);

        setPosition({ x: newX, y: newY });
        onPositionChange?.({ x: newX, y: newY });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [draggable, isCollapsed, position, onPositionChange]
  );

  // ========================================
  // Resize Handlers
  // ========================================
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!resizable || isCollapsed) return;

      e.preventDefault();
      e.stopPropagation();

      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height,
      };
      setIsResizing(true);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizeStartRef.current) return;

        let newWidth = resizeStartRef.current.width + (moveEvent.clientX - resizeStartRef.current.x);
        let newHeight = resizeStartRef.current.height + (moveEvent.clientY - resizeStartRef.current.y);

        // Clamp to min/max
        newWidth = Math.max(minSize.width, Math.min(maxSize?.width ?? Infinity, newWidth));
        newHeight = Math.max(minSize.height, Math.min(maxSize?.height ?? Infinity, newHeight));

        setSize({ width: newWidth, height: newHeight });
        onSizeChange?.({ width: newWidth, height: newHeight });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        resizeStartRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [resizable, isCollapsed, size, minSize, maxSize, onSizeChange]
  );

  // ========================================
  // Collapse Handler
  // ========================================
  const handleToggleCollapse = useCallback(() => {
    if (!collapsible) return;
    setIsCollapsed(!isCollapsed);
  }, [collapsible, isCollapsed]);

  // ========================================
  // Render
  // ========================================
  return (
    <div
      ref={widgetRef}
      className={`desktop-widget ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${isCollapsed ? 'collapsed' : ''} ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: isCollapsed ? 'auto' : size.height,
        '--acrylic-intensity': acrylicIntensity,
      } as React.CSSProperties}
    >
      {/* Acrylic Background */}
      <div className="desktop-widget-acrylic" />

      {/* Header */}
      {(title || icon || onClose || collapsible) && (
        <div className="desktop-widget-header" onMouseDown={handleDragStart}>
          <div className="desktop-widget-header-left">
            {icon && <span className="desktop-widget-icon">{icon}</span>}
            {title && <span className="desktop-widget-title">{title}</span>}
          </div>

          <div className="desktop-widget-header-actions">
            {collapsible && (
              <button
                className="desktop-widget-action"
                onClick={handleToggleCollapse}
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
              </button>
            )}
            {onClose && (
              <button className="desktop-widget-action close" onClick={onClose} title="Close">
                <CloseIcon />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {!isCollapsed && <div className="desktop-widget-content">{children}</div>}

      {/* Resize Handle */}
      {resizable && !isCollapsed && (
        <div className="desktop-widget-resize-handle" onMouseDown={handleResizeStart} />
      )}
    </div>
  );
};

export default Widget;
