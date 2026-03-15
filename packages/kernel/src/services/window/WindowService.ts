/**
 * @fileoverview Window Service - Window Management
 * @module @kernel/services/window/WindowService
 */

import type { IService, ServiceStatus, Subscription } from '../types';

export interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  zIndex: number;
  appId?: string;
}

export interface WindowOptions {
  title?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  appId?: string;
}

/**
 * WindowService manages application windows
 */
export class WindowService implements IService {
  readonly name = 'window';
  readonly version = '1.0.0';
  
  private status: ServiceStatus = 'stopped';
  private windows = new Map<string, WindowState>();
  private activeWindowId: string | null = null;
  private nextZIndex = 1;
  private listeners: Set<() => void> = new Set();
  
  async init(): Promise<void> { this.status = 'running'; }
  async destroy(): Promise<void> { this.status = 'stopped'; }
  isReady(): boolean { return this.status === 'running'; }
  getStatus(): ServiceStatus { return this.status; }
  
  open(options: WindowOptions): string {
    const id = `window-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const window: WindowState = {
      id,
      title: options.title ?? 'Window',
      x: options.x ?? 100,
      y: options.y ?? 100,
      width: options.width ?? 800,
      height: options.height ?? 600,
      minWidth: options.minWidth ?? 200,
      minHeight: options.minHeight ?? 150,
      isMinimized: false,
      isMaximized: false,
      isActive: false,
      zIndex: this.nextZIndex++,
      appId: options.appId,
    };
    
    this.windows.set(id, window);
    this.focus(id);
    return id;
  }
  
  close(windowId: string): void {
    this.windows.delete(windowId);
    if (this.activeWindowId === windowId) {
      this.activeWindowId = null;
    }
    this.notifyListeners();
  }
  
  minimize(windowId: string): void {
    const window = this.windows.get(windowId);
    if (window) {
      window.isMinimized = true;
      this.notifyListeners();
    }
  }
  
  maximize(windowId: string): void {
    const window = this.windows.get(windowId);
    if (window) {
      window.isMaximized = true;
      this.notifyListeners();
    }
  }
  
  restore(windowId: string): void {
    const window = this.windows.get(windowId);
    if (window) {
      window.isMinimized = false;
      window.isMaximized = false;
      this.notifyListeners();
    }
  }
  
  focus(windowId: string): void {
    const window = this.windows.get(windowId);
    if (!window) return;
    
    if (this.activeWindowId) {
      const prevActive = this.windows.get(this.activeWindowId);
      if (prevActive) prevActive.isActive = false;
    }
    
    window.isActive = true;
    window.zIndex = this.nextZIndex++;
    this.activeWindowId = windowId;
    this.notifyListeners();
  }
  
  get(windowId: string): WindowState | null {
    return this.windows.get(windowId) ?? null;
  }
  
  getAll(): WindowState[] {
    return Array.from(this.windows.values());
  }
  
  getActive(): WindowState | null {
    return this.activeWindowId ? this.windows.get(this.activeWindowId) ?? null : null;
  }
  
  subscribe(listener: () => void): Subscription {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(l => { try { l(); } catch { } });
  }
}

export const windowService = new WindowService();
