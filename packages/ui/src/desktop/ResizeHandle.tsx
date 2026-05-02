/**
 * Resize Handle Component
 * Provides 8-direction resize handles for windows.
 */

import React, { useCallback, useRef } from 'react';

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface ResizeHandleProps {
  direction: ResizeDirection;
  onResize: (direction: ResizeDirection, delta: { x: number; y: number }) => void;
  onResizeEnd: () => void;
  threshold?: number;
}

const DIRECTION_STYLES: Record<ResizeDirection, React.CSSProperties> = {
  n: { top: 0, left: '10%', right: '10%', height: '6px', cursor: 'ns-resize' },
  s: { bottom: 0, left: '10%', right: '10%', height: '6px', cursor: 'ns-resize' },
  e: { right: 0, top: '10%', bottom: '10%', width: '6px', cursor: 'ew-resize' },
  w: { left: 0, top: '10%', bottom: '10%', width: '6px', cursor: 'ew-resize' },
  ne: { top: 0, right: 0, width: '12px', height: '12px', cursor: 'nesw-resize' },
  nw: { top: 0, left: 0, width: '12px', height: '12px', cursor: 'nwse-resize' },
  se: { bottom: 0, right: 0, width: '12px', height: '12px', cursor: 'nwse-resize' },
  sw: { bottom: 0, left: 0, width: '12px', height: '12px', cursor: 'nesw-resize' },
};

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  onResize,
  onResizeEnd,
  threshold: _threshold = 0,
}) => {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  // Mouse Handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      startRef.current = { x: e.clientX, y: e.clientY };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!startRef.current) return;

        const delta = {
          x: moveEvent.clientX - startRef.current.x,
          y: moveEvent.clientY - startRef.current.y,
        };

        onResize(direction, delta);
        startRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      };

      const handleMouseUp = () => {
        startRef.current = null;
        onResizeEnd();

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [direction, onResize, onResizeEnd]
  );

  // Touch Handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();

    const touch = e.touches[0];
    if (!touch) return;

    startRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!startRef.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      e.preventDefault();

      const delta = {
        x: touch.clientX - startRef.current.x,
        y: touch.clientY - startRef.current.y,
      };

      onResize(direction, delta);
      startRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [direction, onResize]
  );

  const handleTouchEnd = useCallback(() => {
    startRef.current = null;
    onResizeEnd();
  }, [onResizeEnd]);

  const isCorner = ['ne', 'nw', 'se', 'sw'].includes(direction);

  return (
    <div
      className={`desktop-resize-handle os-window-resize-handle ${isCorner ? 'corner' : 'edge'}`}
      style={{
        position: 'absolute',
        zIndex: 10,
        touchAction: 'none',
        ...DIRECTION_STYLES[direction],
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};

export default ResizeHandle;
