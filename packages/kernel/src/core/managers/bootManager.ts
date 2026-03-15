/**
 * Boot Manager - 启动管理
 */

export class BootManager {
  private bootComplete = false;
  private oobeComplete = false;
  private storageKey = 'webos-boot';

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      console.log('[BootManager] Loading state:', saved);
      if (saved) {
        const data = JSON.parse(saved);
        this.oobeComplete = data.oobeComplete ?? false;
        this.bootComplete = true;
        console.log('[BootManager] State loaded - oobeComplete:', this.oobeComplete);
      } else {
        console.log('[BootManager] No saved state found');
      }
    } catch (e) {
      console.error('[BootManager] Failed to load state:', e);
    }
  }

  private saveState(): void {
    try {
      const state = JSON.stringify({
        oobeComplete: this.oobeComplete
      });
      console.log('[BootManager] Saving state:', state);
      localStorage.setItem(this.storageKey, state);
      console.log('[BootManager] State saved successfully');
    } catch (e) {
      console.error('[BootManager] Failed to save state:', e);
    }
  }

  isComplete(): boolean {
    return this.bootComplete;
  }

  isOOBEComplete(): boolean {
    console.log('[BootManager] isOOBEComplete called, returning:', this.oobeComplete);
    return this.oobeComplete;
  }

  completeOOBE(): void {
    console.log('[BootManager] completeOOBE called');
    this.oobeComplete = true;
    this.bootComplete = true;
    this.saveState();
    console.log('[BootManager] OOBE completed, oobeComplete:', this.oobeComplete);
  }

  reset(): void {
    this.bootComplete = false;
    this.oobeComplete = false;
    localStorage.removeItem(this.storageKey);
    console.log('[BootManager] State reset');
  }
}
