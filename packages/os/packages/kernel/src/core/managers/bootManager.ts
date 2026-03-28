/**
 * Boot Manager - 启动管理
 */

export class BootManager {
  private bootComplete = false;
  private oobeComplete = false;
  private storageKey = 'webos-boot';
  private oobeStorageKey = 'webos-oobe-complete'; // 额外的备份键

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      // 检查主存储
      const saved = localStorage.getItem(this.storageKey);
      // 检查备份存储
      const backup = localStorage.getItem(this.oobeStorageKey);

      console.log('[BootManager] Loading state:', saved, 'backup:', backup);

      if (saved) {
        const data = JSON.parse(saved);
        this.oobeComplete = data.oobeComplete ?? false;
        this.bootComplete = true;
      }

      // 如果备份存在，也认为OOBE已完成
      if (backup === 'true') {
        this.oobeComplete = true;
        this.bootComplete = true;
      }

      console.log('[BootManager] State loaded - oobeComplete:', this.oobeComplete);
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
      // 同时保存到备份键
      localStorage.setItem(this.oobeStorageKey, String(this.oobeComplete));
      console.log('[BootManager] State saved successfully');
    } catch (e) {
      console.error('[BootManager] Failed to save state:', e);
    }
  }

  isComplete(): boolean {
    return this.bootComplete;
  }

  isOOBEComplete(): boolean {
    // 再次检查localStorage，确保实时获取状态
    const backup = localStorage.getItem(this.oobeStorageKey);
    if (backup === 'true') {
      this.oobeComplete = true;
    }
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
    localStorage.removeItem(this.oobeStorageKey);
    console.log('[BootManager] State reset');
  }
}
