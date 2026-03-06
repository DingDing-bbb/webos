// 资源预加载器

export interface LoadTask {
  name: string;
  type: 'font' | 'style' | 'script' | 'image';
  url?: string;
  loaded: boolean;
  error?: string;
}

class ResourceLoader {
  private tasks: LoadTask[] = [];
  private onProgress?: (loaded: number, total: number) => void;

  // 预加载关键字体
  async preloadFonts(): Promise<void> {
    // 等待文档字体加载完成
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  }

  // 预加载样式
  async preloadStyles(): Promise<void> {
    // 样式已通过 CSS 加载
    return Promise.resolve();
  }

  // 设置进度回调
  setProgressHandler(handler: (loaded: number, total: number) => void) {
    this.onProgress = handler;
  }

  // 加载所有资源
  async loadAll(): Promise<void> {
    const total = this.tasks.length;
    let loaded = 0;

    for (const task of this.tasks) {
      try {
        if (task.type === 'font') {
          await document.fonts.ready;
        }
        task.loaded = true;
      } catch (error: unknown) {
        task.error = (error as Error).message;
      }
      
      loaded++;
      this.onProgress?.(loaded, total);
    }
  }

  // 获取加载状态
  getStatus(): { loaded: number; total: number; tasks: LoadTask[] } {
    return {
      loaded: this.tasks.filter(t => t.loaded).length,
      total: this.tasks.length,
      tasks: this.tasks
    };
  }
}

export const resourceLoader = new ResourceLoader();
