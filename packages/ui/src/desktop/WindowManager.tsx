/**
 * @fileoverview Window Manager Component
 * @module @ui/desktop/WindowManager
 *
 * Manages window layering, focus, and animations.
 */

import React, { useState, useCallback, createContext, useContext } from 'react';
import { Window, WindowState, WindowProps } from './Window';

// ============================================================================
// Types
// ============================================================================

export interface ManagedWindow extends Omit<WindowProps, 'state'> {
  /** Unique window ID */
  id: string;
  /** Current window state */
  state: WindowState;
  /** Z-index for layering */
  zIndex: number;
  /** Whether window is focused */
  isFocused: boolean;
}

export interface WindowManagerContextValue {
  /** All managed windows */
  windows: ManagedWindow[];
  /** Open a new window */
  openWindow: (window: Omit<ManagedWindow, 'zIndex' | 'isFocused'>) => void;
  /** Close a window */
  closeWindow: (id: string) => void;
  /** Focus a window */
  focusWindow: (id: string) => void;
  /** Minimize a window */
  minimizeWindow: (id: string) => void;
  /** Maximize/restore a window */
  maximizeWindow: (id: string) => void;
  /** Get the highest z-index */
  getTopZIndex: () => number;
}

// ============================================================================
// Context
// ============================================================================

export const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager must be used within WindowManagerProvider');
  }
  return context;
};

// ============================================================================
// Component
// ============================================================================

export interface WindowManagerProps {
  /** Initial windows */
  initialWindows?: ManagedWindow[];
  /** Base z-index for windows */
  baseZIndex?: number;
  /** Maximum number of windows */
  maxWindows?: number;
  /** Children */
  children?: React.ReactNode;
  /** Render prop for custom window rendering */
  renderWindow?: (window: ManagedWindow) => React.ReactNode;
}

export const WindowManager: React.FC<WindowManagerProps> = ({
  initialWindows = [],
  baseZIndex = 100,
  maxWindows = 50,
  children,
  renderWindow,
}) => {
  // ========================================
  // State
  // ========================================
  const [windows, setWindows] = useState<ManagedWindow[]>(initialWindows);
  const [zIndexCounter, setZIndexCounter] = useState(baseZIndex);

  // ========================================
  // Helper Functions
  // ========================================
  const getTopZIndex = useCallback(() => {
    return zIndexCounter;
  }, [zIndexCounter]);

  // ========================================
  // Window Operations
  // ========================================
  const openWindow = useCallback(
    (window: Omit<ManagedWindow, 'zIndex' | 'isFocused'>) => {
      setWindows((prev) => {
        // Check if window already exists
        const existingIndex = prev.findIndex((w) => w.id === window.id);
        if (existingIndex >= 0) {
          // Focus existing window
          return prev.map((w, i) => ({
            ...w,
            isFocused: i === existingIndex,
            zIndex: i === existingIndex ? zIndexCounter + 1 : w.zIndex,
          }));
        }

        // Check max windows limit
        if (prev.length >= maxWindows) {
          // Close oldest minimized window
          const minimizedIndex = prev.findIndex((w) => w.state === 'minimized');
          if (minimizedIndex >= 0) {
            prev = prev.filter((_, i) => i !== minimizedIndex);
          } else {
            console.warn('Maximum windows reached');
            return prev;
          }
        }

        // Add new window
        const newZIndex = zIndexCounter + 1;
        setZIndexCounter(newZIndex);

        return [
          ...prev.map((w) => ({ ...w, isFocused: false })),
          {
            ...window,
            zIndex: newZIndex,
            isFocused: true,
          },
        ];
      });
    },
    [zIndexCounter, maxWindows]
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        const newZIndex = zIndexCounter + 1;
        setZIndexCounter(newZIndex);

        return prev.map((w) => ({
          ...w,
          isFocused: w.id === id,
          zIndex: w.id === id ? newZIndex : w.zIndex,
        }));
      });
    },
    [zIndexCounter]
  );

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, state: 'minimized' as WindowState, isFocused: false } : w
      )
    );
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              state: (w.state === 'maximized' ? 'normal' : 'maximized') as WindowState,
            }
          : w
      )
    );
  }, []);

  // ========================================
  // Default Window Renderer
  // ========================================
  const defaultRenderWindow = useCallback(
    (win: ManagedWindow) => (
      <Window
        key={win.id}
        id={win.id}
        title={win.title}
        icon={win.icon}
        initialPosition={win.initialPosition}
        initialSize={win.initialSize}
        minSize={win.minSize}
        maxSize={win.maxSize}
        zIndex={win.zIndex}
        isActive={win.isFocused}
        state={win.state}
        resizable={win.resizable}
        draggable={win.draggable}
        showMinimize={win.showMinimize}
        showMaximize={win.showMaximize}
        acrylicIntensity={win.acrylicIntensity}
        onClose={() => closeWindow(win.id)}
        onMinimize={() => minimizeWindow(win.id)}
        onMaximize={() => maximizeWindow(win.id)}
        onFocus={() => focusWindow(win.id)}
        onPositionChange={win.onPositionChange}
        onSizeChange={win.onSizeChange}
        className={win.className}
      >
        {win.children}
      </Window>
    ),
    [closeWindow, minimizeWindow, maximizeWindow, focusWindow]
  );

  // ========================================
  // Context Value
  // ========================================
  const contextValue: WindowManagerContextValue = {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    getTopZIndex,
  };

  // ========================================
  // Render
  // ========================================
  return (
    <WindowManagerContext.Provider value={contextValue}>
      <div className="desktop-window-manager">
        {/* Render all windows */}
        {windows.map((win) => (renderWindow ? renderWindow(win) : defaultRenderWindow(win)))}

        {/* Children (e.g., taskbar) */}
        {children}
      </div>
    </WindowManagerContext.Provider>
  );
};

export default WindowManager;
