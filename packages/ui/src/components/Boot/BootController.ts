/**
 * @fileoverview Boot Controller - Logic Only
 * @module @ui/components/Boot/BootController
 *
 * Handles system initialization without UI.
 * UI should be rendered separately using BootUI component.
 *
 * @architecture
 * ```
 * Boot Sequence:
 * ┌─────────────────────────────────────────────────────────┐
 * │  Stage 1: Kernel     - Core API initialization          │
 * │  Stage 2: Filesystem - Mount and verify FS structure    │
 * │  Stage 3: Services   - Load i18n, user profiles, time   │
 * │  Stage 4: Resources  - Fonts, icons, theme              │
 * │  Stage 5: Desktop    - Window manager, final prep       │
 * └─────────────────────────────────────────────────────────┘
 * ```
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a single initialization task
 */
interface InitTask {
  /** Unique task identifier */
  id: string;
  /** Human-readable task name */
  name: string;
  /** Weight for progress calculation */
  weight: number;
  /** Task execution function */
  execute: () => Promise<void>;
}

/**
 * Progress callback type
 */
export type ProgressCallback = (task: string, progress: number) => void;

/**
 * Boot result type
 */
export interface BootResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// System Initializer Class
// ============================================================================

/**
 * Manages the system initialization sequence.
 *
 * Tasks are executed in order with weighted progress tracking.
 * Each task can optionally verify system state before proceeding.
 */
export class BootController {
  private tasks: InitTask[] = [];
  private completedWeight = 0;
  private totalWeight = 0;
  private onProgress?: ProgressCallback;

  constructor() {
    this.registerTasks();
  }

  /**
   * Registers all initialization tasks in dependency order.
   */
  private registerTasks(): void {
    // ========================================
    // Stage 1: Kernel Initialization (15%)
    // ========================================
    this.addTask({
      id: 'kernel.init',
      name: 'Initializing kernel...',
      weight: 5,
      execute: async () => {
        if (!window.webos) {
          throw new Error('Kernel initialization failed');
        }
        await this.delay(50);
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
        await this.delay(30);
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
        await this.delay(20);
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
        await this.delay(30);
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
        await this.delay(20);
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
        await this.delay(30);
      },
    });

    this.addTask({
      id: 'services.user',
      name: 'Loading user profiles...',
      weight: 10,
      execute: async () => {
        const bootState = localStorage.getItem('webos-boot');
        if (bootState) {
          await this.delay(20);
        }
        await this.delay(20);
      },
    });

    this.addTask({
      id: 'services.time',
      name: 'Synchronizing time...',
      weight: 5,
      execute: async () => {
        window.webos.time.getCurrent();
        await this.delay(20);
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
        await this.delay(20);
      },
    });

    this.addTask({
      id: 'resources.icons',
      name: 'Loading icon set...',
      weight: 10,
      execute: async () => {
        await this.delay(20);
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
        await this.delay(30);
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

  /**
   * Adds a task to the initialization queue.
   */
  private addTask(task: InitTask): void {
    this.tasks.push(task);
    this.totalWeight += task.weight;
  }

  /**
   * Creates a promise that resolves after a delay.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Sets the progress callback handler.
   */
  setProgressHandler(handler: ProgressCallback): void {
    this.onProgress = handler;
  }

  /**
   * Executes all tasks in sequence.
   *
   * @returns Success status and optional error message
   */
  async run(): Promise<BootResult> {
    this.completedWeight = 0;

    for (const task of this.tasks) {
      try {
        await task.execute();
        this.completedWeight += task.weight;

        if (this.onProgress) {
          const progress = Math.round(
            (this.completedWeight / this.totalWeight) * 100
          );
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
