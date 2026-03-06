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
      if (saved) {
        const data = JSON.parse(saved);
        this.oobeComplete = data.oobeComplete ?? false;
        this.bootComplete = true;
      }
    } catch {
      // 忽略错误
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        oobeComplete: this.oobeComplete
      }));
    } catch {
      // 忽略错误
    }
  }

  isComplete(): boolean {
    return this.bootComplete;
  }

  isOOBEComplete(): boolean {
    return this.oobeComplete;
  }

  completeOOBE(): void {
    this.oobeComplete = true;
    this.bootComplete = true;
    this.saveState();
  }

  reset(): void {
    this.bootComplete = false;
    this.oobeComplete = false;
    localStorage.removeItem(this.storageKey);
  }
}
