/**
 * @fileoverview Notify Service - System Notifications
 * @module @kernel/services/notify
 */

import type { IService, ServiceStatus, Subscription } from '../types';

export interface NotifyOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number; // ms, 0 = permanent
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration: number;
  actions: Array<{ label: string; onClick: () => void }>;
  createdAt: Date;
  read: boolean;
}

/**
 * NotifyService handles system notifications
 */
export class NotifyService implements IService {
  readonly name = 'notify';
  readonly version = '1.0.0';
  
  private status: ServiceStatus = 'stopped';
  private notifications = new Map<string, Notification>();
  private container: HTMLElement | null = null;
  private listeners: Set<() => void> = new Set();
  
  async init(): Promise<void> { this.status = 'running'; }
  async destroy(): Promise<void> { this.status = 'stopped'; }
  isReady(): boolean { return this.status === 'running'; }
  getStatus(): ServiceStatus { return this.status; }
  
  setContainer(container: HTMLElement): void {
    this.container = container;
  }
  
  show(title: string, message: string, options?: NotifyOptions): string {
    const id = `notify-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const notification: Notification = {
      id,
      title,
      message,
      type: options?.type ?? 'info',
      duration: options?.duration ?? 5000,
      actions: options?.actions ?? [],
      createdAt: new Date(),
      read: false,
    };
    
    this.notifications.set(id, notification);
    this.notifyListeners();
    
    // Auto dismiss
    if (notification.duration > 0) {
      setTimeout(() => this.dismiss(id), notification.duration);
    }
    
    return id;
  }
  
  dismiss(id: string): boolean {
    const result = this.notifications.delete(id);
    if (result) {
      this.notifyListeners();
    }
    return result;
  }
  
  dismissAll(): void {
    this.notifications.clear();
    this.notifyListeners();
  }
  
  markRead(id: string): boolean {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
      return true;
    }
    return false;
  }
  
  get(id: string): Notification | null {
    return this.notifications.get(id) ?? null;
  }
  
  getAll(): Notification[] {
    return Array.from(this.notifications.values());
  }
  
  getUnread(): Notification[] {
    return this.getAll().filter(n => !n.read);
  }
  
  getCount(): number {
    return this.notifications.size;
  }
  
  subscribe(listener: () => void): Subscription {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(l => { try { l(); } catch { } });
  }
}

export const notifyService = new NotifyService();
