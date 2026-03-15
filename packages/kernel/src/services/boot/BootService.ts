/**
 * @fileoverview Boot Service - System Initialization
 * @module @kernel/services/boot
 */

import type { IService, ServiceStatus, Subscription } from '../types';

export interface BootStatus {
  stage: 'idle' | 'checking' | 'loading' | 'error' | 'recovery' | 'success';
  progress: number;
  message: string;
}

/**
 * BootService manages system boot sequence
 */
export class BootService implements IService {
  readonly name = 'boot';
  readonly version = '1.0.0';
  
  private status: ServiceStatus = 'stopped';
  private bootStatus: BootStatus = {
    stage: 'idle',
    progress: 0,
    message: '',
  };
  private oobeComplete = false;
  private storageKey = 'webos-boot';
  private listeners: Set<() => void> = new Set();
  
  constructor() {
    this.loadState();
  }
  
  private loadState(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        this.oobeComplete = Boolean(data.oobeComplete);
      }
    } catch {
      console.warn('[BootService] Failed to load state');
    }
  }
  
  private saveState(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        oobeComplete: this.oobeComplete,
        timestamp: new Date().toISOString(),
      }));
    } catch {
      console.warn('[BootService] Failed to save state');
    }
  }
  
  async init(): Promise<void> {
    this.status = 'running';
  }
  
  async destroy(): Promise<void> {
    this.status = 'stopped';
  }
  
  isReady(): boolean { return this.status === 'running'; }
  getStatus(): ServiceStatus { return this.status; }
  
  getBootStatus(): BootStatus {
    return { ...this.bootStatus };
  }
  
  setBootStatus(status: Partial<BootStatus>): void {
    this.bootStatus = { ...this.bootStatus, ...status };
    this.notifyListeners();
  }
  
  isOOBEComplete(): boolean {
    return this.oobeComplete;
  }
  
  completeOOBE(): void {
    this.oobeComplete = true;
    this.saveState();
    this.notifyListeners();
  }
  
  reset(): void {
    this.oobeComplete = false;
    localStorage.removeItem(this.storageKey);
    this.notifyListeners();
  }
  
  subscribe(listener: () => void): Subscription {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(l => { try { l(); } catch { } });
  }
}

export const bootService = new BootService();
