/**
 * @fileoverview Window Component
 * @module @ui/desktop/Window
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ResizeHandle, ResizeDirection } from './ResizeHandle';

export type WindowState = 'normal' | 'minimized' | 'maximized';

export interface WindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  zIndex?: number;
  isActive?: boolean;
  state?: WindowState;
  resizable?: boolean;
  draggable?: boolean;
  showMinimize?: boolean;
  showMaximize?: boolean;
  acrylicIntensity?: number;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
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
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M2 2l8 8M10 2l-8 8" />
  </svg>
);

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
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [restorePosition, setRestorePosition] = useState<Position>(initialPosition);
  const [restoreSize, setRestoreSize] = useState<Size>(initialSize);

  const windowRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const touchStartRef = useRef<{
    x: number;
    y: number;
    posX: number;
    posY: number;
    time: number;
  } | null>(null);
  const lastTapRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    if (state === 'maximized') {
      setRestorePosition(position);
      setRestoreSize(size);
      setPosition({ x: 0, y: 0 });
      setSize({
        width: window.innerWidth,
        height: window.innerHeight - 48,
      });
    } else if (state === 'normal' && restorePosition && restoreSize) {
      setPosition(restorePosition);
      setSize(restoreSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Mouse drag
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

  // Touch drag
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest('.desktop-window-controls')) return;
      if (!draggable || state === 'maximized') return;

      const touch = e.touches[0];
      if (!touch) return;

      e.preventDefault();
      onFocus?.();

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        posX: position.x,
        posY: position.y,
        time: Date.now(),
      };
    },
    [draggable, state, position, onFocus]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      e.preventDefault();

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        if (!isDragging) {
          setIsDragging(true);
          onDragStart?.();
        }

        const newX = touchStartRef.current.posX + deltaX;
        const newY = Math.max(0, touchStartRef.current.posY + deltaY);

        setPosition({ x: newX, y: newY });
        onPositionChange?.({ x: newX, y: newY });
      }
    },
    [isDragging, onDragStart, onPositionChange]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch || !touchStartRef.current) {
        touchStartRef.current = null;
        return;
      }

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = Date.now() - touchStartRef.current.time;

      // Double tap to maximize
      if (distance < 10 && duration < 300) {
        const now = Date.now();
        const lastTap = lastTapRef.current;

        if (
          lastTap &&
          now - lastTap.time < 300 &&
          Math.abs(touch.clientX - lastTap.x) < 30 &&
          Math.abs(touch.clientY - lastTap.y) < 30
        ) {
          if (showMaximize && draggable) {
            onMaximize?.();
          }
          lastTapRef.current = null;
        } else {
          lastTapRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: now,
          };
        }
      }

      if (isDragging) {
        setIsDragging(false);
        onDragEnd?.();
      }

      touchStartRef.current = null;
    },
    [isDragging, showMaximize, draggable, onMaximize, onDragEnd]
  );

  const handleResize = useCallback(
    (direction: ResizeDirection, delta: { x: number; y: number }) => {
      if (state === 'maximized') return;

      setIsResizing(true);

      setSize((prev) => {
        let newWidth = prev.width;
        let newHeight = prev.height;

        if (direction.includes('e')) {
          newWidth = Math.max(
            minSize.width,
            Math.min(maxSize?.width ?? Infinity, prev.width + delta.x)
          );
        }
        if (direction.includes('w')) {
          newWidth = Math.max(
            minSize.width,
            Math.min(maxSize?.width ?? Infinity, prev.width - delta.x)
          );
          if (newWidth !== prev.width) {
            setPosition((p) => ({ ...p, x: p.x + delta.x }));
          }
        }

        if (direction.includes('s')) {
          newHeight = Math.max(
            minSize.height,
            Math.min(maxSize?.height ?? Infinity, prev.height + delta.y)
          );
        }
        if (direction.includes('n')) {
          newHeight = Math.max(
            minSize.height,
            Math.min(maxSize?.height ?? Infinity, prev.height - delta.y)
          );
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

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleMinimize = useCallback(() => {
    onMinimize?.();
  }, [onMinimize]);

  const handleMaximize = useCallback(() => {
    onMaximize?.();
  }, [onMaximize]);

  const handleTitleBarDoubleClick = useCallback(() => {
    if (showMaximize && draggable) {
      onMaximize?.();
    }
  }, [showMaximize, draggable, onMaximize]);

  if (state === 'minimized') {
    return null;
  }

  const isMaximized = state === 'maximized';

  return (
    <div
      ref={windowRef}
      className={`desktop-window ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${className}`}
      style={
        {
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          zIndex,
          '--acrylic-intensity': acrylicIntensity,
        } as React.CSSProperties
      }
      onMouseDown={() => onFocus?.()}
    >
      <div className="desktop-window-acrylic" />
      <div className="desktop-window-shadow" />

      <div
        className="desktop-window-titlebar os-window-header"
        onMouseDown={handleDragMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleTitleBarDoubleClick}
        style={{
          touchAction: 'none',
          cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
      >
        <div className="desktop-window-titlebar-content">
          {icon && <span className="desktop-window-icon">{icon}</span>}
          <span className="desktop-window-title">{title}</span>
        </div>

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

      <div className="desktop-window-content">{children}</div>

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
