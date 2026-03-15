/**
 * @fileoverview Boot Screen Component
 * @module @ui/components/Boot
 *
 * Displays the system boot sequence with visual feedback.
 * Handles initialization of core system components in stages.
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
 *
 * @example
 * ```tsx
 * import { BootScreen } from '@ui/components/Boot';
 *
 * <BootScreen onComplete={() => setShowDesktop(true)} />
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Spinner } from '../Spinner';

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
 * Boot stages for visual feedback
 */
type BootStage =
  | 'kernel'
  | 'filesystem'
  | 'services'
  | 'resources'
  | 'desktop'
  | 'complete';

/**
 * Boot screen component props
 */
interface BootScreenProps {
  /** Callback when boot sequence completes */
  onComplete: () => void;
}

// ============================================================================
// System Initializer
// ============================================================================

/**
 * Manages the system initialization sequence.
 *
 * Tasks are executed in order with weighted progress tracking.
 * Each task can optionally verify system state before proceeding.
 */
class SystemInitializer {
  private tasks: InitTask[] = [];
  private completedWeight = 0;
  private totalWeight = 0;
  private onProgress?: (task: string, progress: number) => void;

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
        // Icons are inline, no loading needed
        await this.delay(20);
      },
    });

    this.addTask({
      id: 'resources.styles',
      name: 'Applying system theme...',
      weight: 5,
      execute: async () => {
        const theme = window.webos.config.get<string>('theme');
        if (theme) {
          document.documentElement.setAttribute('data-theme', theme);
        }
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
  setProgressHandler(handler: (task: string, progress: number) => void): void {
    this.onProgress = handler;
  }

  /**
   * Executes all tasks in sequence.
   *
   * @returns Success status and optional error message
   */
  async run(): Promise<{ success: boolean; error?: string }> {
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

// ============================================================================
// Component
// ============================================================================

/**
 * Boot Screen Component
 *
 * Displays a professional boot sequence with:
 * - Animated logo
 * - Loading spinner
 * - Status messages
 * - Error handling with retry option
 *
 * @param {BootScreenProps} props - Component props
 * @returns {JSX.Element} Boot screen UI
 */
export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Starting...');
  const [stage, setStage] = useState<BootStage>('kernel');
  const [error, setError] = useState<string | null>(null);

  /**
   * Maps boot stage to accent color.
   */
  const getStageColor = useCallback((currentStage: BootStage): string => {
    const colors: Record<BootStage, string> = {
      kernel: '#4ade80',     // Green - Core initialization
      filesystem: '#60a5fa', // Blue - Storage operations
      services: '#f472b6',   // Pink - Service loading
      resources: '#fbbf24',  // Yellow - Resource loading
      desktop: '#a78bfa',    // Purple - UI preparation
      complete: '#22d3ee',   // Cyan - Ready
    };
    return colors[currentStage];
  }, []);

  /**
   * Updates the current boot stage based on task name.
   */
  const updateStage = useCallback((taskName: string) => {
    if (taskName.includes('kernel')) setStage('kernel');
    else if (taskName.includes('fs.') || taskName.includes('Mounting')) setStage('filesystem');
    else if (taskName.includes('services.')) setStage('services');
    else if (taskName.includes('resources.')) setStage('resources');
    else if (taskName.includes('desktop.') || taskName.includes('Preparing')) setStage('desktop');
  }, []);

  useEffect(() => {
    const initializer = new SystemInitializer();

    initializer.setProgressHandler((task, prog) => {
      setStatusText(task);
      setProgress(prog);
      updateStage(task);
    });

    initializer.run().then((result) => {
      if (result.success) {
        setStage('complete');
        setStatusText('Welcome!');
        setProgress(100);

        // Brief pause before transitioning
        setTimeout(onComplete, 200);
      } else {
        setError(result.error || 'Unknown error');
        setStatusText(`Error: ${result.error}`);
      }
    });
  }, [onComplete, updateStage]);

  // ========================================
  // Error State
  // ========================================
  if (error) {
    return (
      <div className="os-boot-screen">
        <div className="os-boot-logo">
          <svg width="120" height="40" viewBox="0 0 120 40">
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#ef4444"
              fontSize="24"
              fontFamily="inherit"
              fontWeight="300"
            >
              Error
            </text>
          </svg>
        </div>
        <div className="os-boot-error">{error}</div>
        <button
          className="os-boot-retry"
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '8px 24px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ========================================
  // Normal Boot State
  // ========================================
  return (
    <div className="os-boot-screen">
      {/* Logo */}
      <div
        className="os-boot-logo"
        style={{
          animation: 'boot-fade-in 0.8s ease-out',
        }}
      >
        <svg width="120" height="40" viewBox="0 0 120 40">
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="white"
            fontSize="24"
            fontFamily="inherit"
            fontWeight="300"
            style={{
              opacity: progress / 100,
              transition: 'opacity 0.3s ease',
            }}
          >
            {__OS_NAME__}
          </text>
        </svg>
      </div>

      {/* Loading Spinner */}
      <div
        className="os-boot-spinner"
        style={{
          marginTop: '32px',
          animation: 'boot-fade-in 0.6s ease-out 0.2s both',
        }}
      >
        <Spinner size={48} color={getStageColor(stage)} />
      </div>

      {/* Status Text */}
      <div
        className="os-boot-text"
        style={{
          marginTop: '24px',
          color: getStageColor(stage),
          transition: 'color 0.3s ease',
          animation: 'boot-fade-in 0.6s ease-out 0.4s both',
        }}
      >
        {statusText}
      </div>

      {/* Version Info */}
      <div
        className="os-boot-version"
        style={{
          position: 'absolute',
          bottom: '20px',
          fontSize: '12px',
          opacity: 0.5,
          animation: 'boot-fade-in 0.6s ease-out 0.6s both',
        }}
      >
        v{__OS_VERSION__}
      </div>
    </div>
  );
};

export default BootScreen;
