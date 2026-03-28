/**
 * @fileoverview Window Component
 * @module @ui/desktop/Window
 *
 * A professional window component with:
 * - Title bar with window controls
 * - Minimize/Maximize/Close buttons
 * - Resizable (8 directions)
 * - Draggable
 * - Acrylic/Mica blur effect
 * - Window shadows
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ResizeHandle, ResizeDirection } from './ResizeHandle';

// ============================================================================
// Types
// ============================================================================

export type WindowState = 'normal' | 'minimized' | 'maximized';

export interface WindowProps {
  /** Window ID */
  id: string;
  /** Window title */
  title: string;
  /** Window icon */
  icon?: React.ReactNode;
  /** Initial position */
  initialPosition?: { x: number; y: number };
  /** Initial size */
  initialSize?: { width: number; height: number };
  /** Minimum size */
  minSize?: { width: number; height: number };
  /** Maximum size */
  maxSize?: { width: number; height: number };
  /** Z-index for layering */
  zIndex?: number;
  /** Is window active/focused */
  isActive?: boolean;
  /** Window state */
  state?: WindowState;
  /** Whether window can be resized */
  resizable?: boolean;
  /** Whether window can be dragged */
  draggable?: boolean;
  /** Whether window shows minimize button */
  showMinimize?: boolean;
  /** Whether window shows maximize button */
  showMaximize?: boolean;
  /** Acrylic effect intensity (0-1) */
  acrylicIntensity?: number;
  /** Window content */
  children: React.ReactNode;
  /** Called when window is closed */
  onClose?: () => void;
  /** Called when window is minimized */
  onMinimize?: () => void;
  /** Called when window is maximized/restored */
  onMaximize?: () => void;
  /** Called when window gains focus */
  onFocus?: () => void;
  /** Called when position changes */
  onPositionChange?: (position: { x: number; y: number }) => void;
  /** Called when size changes */
  onSizeChange?: (size: { width: number; height: number }) => void;
  /** Called when drag starts */
  onDragStart?: () => void;
  /** Called when drag ends */
  onDragEnd?: () => void;
  /** Custom className */
  className?: string;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

// ============================================================================
// Icons
// ============================================================================

const MinimizeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <rect x="2" y="5" width="8" height="2" rx="0.5" />
  </svg>
);

const MaximizeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
    <rect x="2" y="2" width="8" height="8" rx="1" />
  </svg>
);

const RestoreIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
    <rect x="3" y="4" width="6" height="6" rx="1" />
    <path d="M4 4V3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H9" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2l8 8M10 2l-8 8" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const Window: React.FC<WindowProps> = ({
  id: _id,
  title,
  icon,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 800, height: 600 },
  minSize = { width: 200, height: 150 },
  maxSize,
  zIndex = 1,
  isActive = false,
  state = 'normal',
  resizable = true,
  draggable = true,
  showMinimize = true,
  showMaximize = true,
  acrylicIntensity = 0.7,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onSizeChange,
  onDragStart,
  onDragEnd,
  className = '',
}) => {
  // ========================================
  // State
  // ========================================
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [restorePosition, setRestorePosition] = useState<Position>(initialPosition);
  const [restoreSize, setRestoreSize] = useState<Size>(initialSize);

  const windowRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  // ========================================
  // Effects
  // ========================================

  // Handle state changes (maximize/minimize)
  // Note: We intentionally only run this when `state` changes, not when position/size changes
  // This prevents infinite loops and ensures the effect only runs on actual state transitions
  useEffect(() => {
    if (state === 'maximized') {
      setRestorePosition(position);
      setRestoreSize(size);
      setPosition({ x: 0, y: 0 });
      setSize({
        width: window.innerWidth,
        height: window.innerHeight - 48, // Account for taskbar
      });
    } else if (state === 'normal' && restorePosition && restoreSize) {
      setPosition(restorePosition);
      setSize(restoreSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ========================================
  // Drag Handlers
  // ========================================
  const handleDragMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!draggable || state === 'maximized') return;

      e.preventDefault();
      onFocus?.();

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };

      setIsDragging(true);
      onDragStart?.();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragStartRef.current) return;

        const deltaX = moveEvent.clientX - dragStartRef.current.x;
        const deltaY = moveEvent.clientY - dragStartRef.current.y;

        const newX = dragStartRef.current.posX + deltaX;
        const newY = Math.max(0, dragStartRef.current.posY + deltaY);

        setPosition({ x: newX, y: newY });
        onPositionChange?.({ x: newX, y: newY });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        onDragEnd?.();
        dragStartRef.current = null;

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [draggable, state, position, onFocus, onPositionChange, onDragStart, onDragEnd]
  );

  // ========================================
  // Resize Handlers
  // ========================================
  const handleResize = useCallback(
    (direction: ResizeDirection, delta: { x: number; y: number }) => {
      if (state === 'maximized') return;

      setIsResizing(true);

      setSize((prev) => {
        let newWidth = prev.width;
        let newHeight = prev.height;

        // Horizontal resize
        if (direction.includes('e')) {
          newWidth = Math.max(minSize.width, Math.min(maxSize?.width ?? Infinity, prev.width + delta.x));
        }
        if (direction.includes('w')) {
          newWidth = Math.max(minSize.width, Math.min(maxSize?.width ?? Infinity, prev.width - delta.x));
          if (newWidth !== prev.width) {
            setPosition((p) => ({ ...p, x: p.x + delta.x }));
          }
        }

        // Vertical resize
        if (direction.includes('s')) {
          newHeight = Math.max(minSize.height, Math.min(maxSize?.height ?? Infinity, prev.height + delta.y));
        }
        if (direction.includes('n')) {
          newHeight = Math.max(minSize.height, Math.min(maxSize?.height ?? Infinity, prev.height - delta.y));
          if (newHeight !== prev.height) {
            setPosition((p) => ({ ...p, y: Math.max(0, p.y + delta.y) }));
          }
        }

        const newSize = { width: newWidth, height: newHeight };
        onSizeChange?.(newSize);
        return newSize;
      });
    },
    [state, minSize, maxSize, onSizeChange]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // ========================================
  // Window Controls
  // ========================================
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleMinimize = useCallback(() => {
    onMinimize?.();
  }, [onMinimize]);

  const handleMaximize = useCallback(() => {
    onMaximize?.();
  }, [onMaximize]);

  // ========================================
  // Double-click to maximize
  // ========================================
  const handleTitleBarDoubleClick = useCallback(() => {
    if (showMaximize && draggable) {
      onMaximize?.();
    }
  }, [showMaximize, draggable, onMaximize]);

  // ========================================
  // Render
  // ========================================
  if (state === 'minimized') {
    return null;
  }

  const isMaximized = state === 'maximized';

  return (
    <div
      ref={windowRef}
      className={`desktop-window ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
        '--acrylic-intensity': acrylicIntensity,
      } as React.CSSProperties}
      onMouseDown={() => onFocus?.()}
    >
      {/* Acrylic Background */}
      <div className="desktop-window-acrylic" />

      {/* Window Shadow */}
      <div className="desktop-window-shadow" />

      {/* Title Bar */}
      <div
        className="desktop-window-titlebar"
        onMouseDown={handleDragMouseDown}
        onDoubleClick={handleTitleBarDoubleClick}
      >
        {/* Title Bar Icon & Text */}
        <div className="desktop-window-titlebar-content">
          {icon && <span className="desktop-window-icon">{icon}</span>}
          <span className="desktop-window-title">{title}</span>
        </div>

        {/* Window Controls */}
        <div className="desktop-window-controls">
          {showMinimize && (
            <button
              className="desktop-window-control desktop-window-minimize"
              onClick={handleMinimize}
              title="Minimize"
            >
              <MinimizeIcon />
            </button>
          )}
          {showMaximize && (
            <button
              className="desktop-window-control desktop-window-maximize"
              onClick={handleMaximize}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
            </button>
          )}
          <button
            className="desktop-window-control desktop-window-close"
            onClick={handleClose}
            title="Close"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="desktop-window-content">{children}</div>

      {/* Resize Handles */}
      {resizable && !isMaximized && (
        <>
          <ResizeHandle direction="n" onResize={handleResize} onResizeEnd={handleResizeEnd} />
          <ResizeHandle direction="s" onResize={handleResize} onResizeEnd={handleResizeEnd} />
          <ResizeHandle direction="e" onResize={handleResize} onResizeEnd={handleResizeEnd} />
          <ResizeHandle direction="w" onResize={handleResize} onResizeEnd={handleResizeEnd} />
          <ResizeHandle direction="ne" onResize={handleResize} onResizeEnd={handleResizeEnd} />
          <ResizeHandle direction="nw" onResize={handleResize} onResizeEnd={handleResizeEnd} />
          <ResizeHandle direction="se" onResize={handleResize} onResizeEnd={handleResizeEnd} />
          <ResizeHandle direction="sw" onResize={handleResize} onResizeEnd={handleResizeEnd} />
        </>
      )}
    </div>
  );
};

export default Window;
