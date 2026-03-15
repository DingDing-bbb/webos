/**
 * Boot Manager - 启动管理
 * 
 * 负责 OOBE 状态持久化，确保首次设置完成后不会重复运行。
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
      console.log('[BootManager] Loading state from localStorage:', saved);
      
      if (saved) {
        const data = JSON.parse(saved);
        this.oobeComplete = Boolean(data.oobeComplete);
        this.bootComplete = true;
        console.log('[BootManager] State loaded successfully - oobeComplete:', this.oobeComplete, 'bootComplete:', this.bootComplete);
      } else {
        console.log('[BootManager] No saved state found - first time boot');
        this.bootComplete = false;
        this.oobeComplete = false;
      }
    } catch (e) {
      console.error('[BootManager] Failed to load state:', e);
      // 重置为默认值
      this.bootComplete = false;
      this.oobeComplete = false;
    }
  }

  private saveState(): void {
    try {
      const state = JSON.stringify({
        oobeComplete: this.oobeComplete,
        bootComplete: this.bootComplete,
        timestamp: new Date().toISOString()
      });
      console.log('[BootManager] Saving state to localStorage:', state);
      localStorage.setItem(this.storageKey, state);
      
      // 验证保存是否成功
      const verified = localStorage.getItem(this.storageKey);
      if (verified) {
        const verifiedData = JSON.parse(verified);
        console.log('[BootManager] State saved and verified successfully - oobeComplete:', verifiedData.oobeComplete);
      } else {
        console.error('[BootManager] State verification failed - localStorage item not found after save');
      }
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
    console.log('[BootManager] completeOOBE called - marking OOBE as complete');
    this.oobeComplete = true;
    this.bootComplete = true;
    this.saveState();
    console.log('[BootManager] OOBE completed - oobeComplete:', this.oobeComplete);
  }

  reset(): void {
    console.log('[BootManager] Reset called - clearing all state');
    this.bootComplete = false;
    this.oobeComplete = false;
    try {
      localStorage.removeItem(this.storageKey);
      console.log('[BootManager] State reset successfully');
    } catch (e) {
      console.error('[BootManager] Failed to remove state from localStorage:', e);
    }
  }
}
