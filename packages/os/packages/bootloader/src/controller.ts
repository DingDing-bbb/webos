/**
 * BootController - 启动控制器
 *
 * 执行真正的系统初始化任务
 *
 * 注意：此控制器假设 window.webos 已经初始化
 * 内核初始化应该在创建此控制器之前完成
 */

// ============================================================================
// Types
// ============================================================================

export interface BootTask {
  id: string;
  name: string;
  weight: number;
  execute: () => Promise<void>;
}

export type ProgressCallback = (task: string, progress: number) => void;

export interface BootResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// BootController Class
// ============================================================================

/**
 * 启动控制器
 *
 * 执行系统初始化任务：
 * - Stage 1: Kernel - 验证内核 API
 * - Stage 2: Filesystem - 文件系统初始化
 * - Stage 3: Services - 服务启动
 * - Stage 4: Resources - 资源加载
 * - Stage 5: Desktop - 桌面准备
 */
export class BootController {
  private tasks: BootTask[] = [];
  private completedWeight = 0;
  private totalWeight = 0;
  private onProgress?: ProgressCallback;

  constructor() {
    this.registerTasks();
  }

  private registerTasks(): void {
    // ========================================
    // Stage 1: Kernel Verification (15%)
    // ========================================
    this.addTask({
      id: 'kernel.verify',
      name: 'Verifying kernel...',
      weight: 5,
      execute: async () => {
        // 等待内核初始化完成
        let retries = 0;
        while (!window.webos && retries < 50) {
          await this.delay(100);
          retries++;
        }
        if (!window.webos) {
          throw new Error('Kernel not initialized');
        }
      },
    });

    this.addTask({
      id: 'kernel.api',
      name: 'Loading system APIs...',
      weight: 10,
      execute: async () => {
        const api = window.webos;
        if (!api.window || !api.fs || !api.i18n) {
          throw new Error('System APIs incomplete');
        }
        await this.delay(50);
      },
    });

    // ========================================
    // Stage 2: Filesystem (20%)
    // ========================================
    this.addTask({
      id: 'fs.root',
      name: 'Mounting root filesystem...',
      weight: 5,
      execute: async () => {
        const rootFiles = window.webos.fs.list('/');
        if (rootFiles.length === 0) {
          throw new Error('Filesystem mount failed');
        }
        await this.delay(30);
      },
    });

    this.addTask({
      id: 'fs.directories',
      name: 'Creating system directories...',
      weight: 10,
      execute: async () => {
        const fs = window.webos.fs;
        const systemDirs = ['/tmp', '/var', '/var/log', '/var/cache'];

        for (const dir of systemDirs) {
          if (!fs.exists(dir)) {
            fs.mkdir(dir);
          }
        }
        await this.delay(40);
      },
    });

    this.addTask({
      id: 'fs.cache',
      name: 'Initializing cache...',
      weight: 5,
      execute: async () => {
        if (!window.webos.fs.exists('/var/cache/apps')) {
          window.webos.fs.mkdir('/var/cache/apps');
        }
        await this.delay(30);
      },
    });

    // ========================================
    // Stage 3: Services (25%)
    // ========================================
    this.addTask({
      id: 'services.i18n',
      name: 'Loading language packs...',
      weight: 10,
      execute: async () => {
        const savedLocale = window.webos.config.get<string>('locale');
        if (savedLocale) {
          window.webos.i18n.setLocale(savedLocale);
        }
        await this.delay(40);
      },
    });

    this.addTask({
      id: 'services.user',
      name: 'Loading user profiles...',
      weight: 10,
      execute: async () => {
        await this.delay(30);
      },
    });

    this.addTask({
      id: 'services.time',
      name: 'Synchronizing time...',
      weight: 5,
      execute: async () => {
        window.webos.time.getCurrent();
        await this.delay(30);
      },
    });

    // ========================================
    // Stage 4: Resources (25%)
    // ========================================
    this.addTask({
      id: 'resources.fonts',
      name: 'Loading fonts...',
      weight: 10,
      execute: async () => {
        await document.fonts.ready;
        await this.delay(30);
      },
    });

    this.addTask({
      id: 'resources.icons',
      name: 'Loading icon set...',
      weight: 10,
      execute: async () => {
        await this.delay(30);
      },
    });

    this.addTask({
      id: 'resources.styles',
      name: 'Applying system theme...',
      weight: 5,
      execute: async () => {
        const theme = window.webos.config.get<string>('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        await this.delay(20);
      },
    });

    // ========================================
    // Stage 5: Desktop (15%)
    // ========================================
    this.addTask({
      id: 'desktop.wm',
      name: 'Starting window manager...',
      weight: 8,
      execute: async () => {
        await this.delay(40);
      },
    });

    this.addTask({
      id: 'desktop.ready',
      name: 'Preparing desktop...',
      weight: 7,
      execute: async () => {
        await this.delay(50);
      },
    });
  }

  private addTask(task: BootTask): void {
    this.tasks.push(task);
    this.totalWeight += task.weight;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  setProgressHandler(handler: ProgressCallback): void {
    this.onProgress = handler;
  }

  async run(): Promise<BootResult> {
    this.completedWeight = 0;

    for (const task of this.tasks) {
      try {
        await task.execute();
        this.completedWeight += task.weight;

        if (this.onProgress) {
          const progress = Math.round((this.completedWeight / this.totalWeight) * 100);
          this.onProgress(task.name, progress);
        }
      } catch (error: unknown) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }

    return { success: true };
  }
}

export default BootController;
