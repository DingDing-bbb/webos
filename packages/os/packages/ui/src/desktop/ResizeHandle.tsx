/**
 * @fileoverview Resize Handle Component
 * @module @ui/desktop/ResizeHandle
 *
 * Provides 8-direction resize handles for windows.
 */

import React, { useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface ResizeHandleProps {
  /** Resize direction */
  direction: ResizeDirection;
  /** Called during resize with delta movement */
  onResize: (direction: ResizeDirection, delta: { x: number; y: number }) => void;
  /** Called when resize ends */
  onResizeEnd: () => void;
  /** Minimum distance before resize starts */
  threshold?: number;
}

// ============================================================================
// Constants
// ============================================================================

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

// ============================================================================
// Component
// ============================================================================

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  onResize,
  onResizeEnd,
  threshold: _threshold = 0,
}) => {
  const startRef = useRef<{ x: number; y: number } | null>(null);

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

  const isCorner = ['ne', 'nw', 'se', 'sw'].includes(direction);

  return (
    <div
      className={`desktop-resize-handle ${isCorner ? 'corner' : 'edge'}`}
      style={{
        position: 'absolute',
        zIndex: 10,
        ...DIRECTION_STYLES[direction],
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

export default ResizeHandle;
