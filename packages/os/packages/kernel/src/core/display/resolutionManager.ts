/**
 * @fileoverview Resolution Manager - VMware-style dynamic resolution adjustment
 * @module @kernel/core/display/resolutionManager
 *
 * Provides real-time resolution adjustment similar to VMware Tools:
 * - Auto-detects viewport/container size changes
 * - Dynamically adjusts system resolution
 * - Supports manual resolution selection
 * - DPI scaling support
 */

// ============================================================================
// Types
// ============================================================================

export interface Resolution {
  width: number;
  height: number;
}

export interface DisplayMode {
  resolution: Resolution;
  refreshRate: number;
  scaling: number; // 1.0 = 100%, 1.25 = 125%, etc.
}

export interface ResolutionPreset {
  name: string;
  resolution: Resolution;
  aspectRatio: string;
  recommended?: boolean;
}

export type ResolutionChangeCallback = (mode: DisplayMode) => void;

export interface ResolutionManagerConfig {
  autoAdjust: boolean;
  minResolution: Resolution;
  maxResolution: Resolution;
  preferredScaling: number;
}

// ============================================================================
// Constants
// ============================================================================

/** Common resolution presets */
export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { name: 'HD', resolution: { width: 1280, height: 720 }, aspectRatio: '16:9' },
  { name: 'HD+', resolution: { width: 1600, height: 900 }, aspectRatio: '16:9' },
  {
    name: 'Full HD',
    resolution: { width: 1920, height: 1080 },
    aspectRatio: '16:9',
    recommended: true,
  },
  { name: 'WUXGA', resolution: { width: 1920, height: 1200 }, aspectRatio: '16:10' },
  { name: 'QHD', resolution: { width: 2560, height: 1440 }, aspectRatio: '16:9' },
  { name: 'WQHD+', resolution: { width: 2560, height: 1600 }, aspectRatio: '16:10' },
  { name: '4K UHD', resolution: { width: 3840, height: 2160 }, aspectRatio: '16:9' },
  // 4:3 aspect ratios
  { name: 'XGA', resolution: { width: 1024, height: 768 }, aspectRatio: '4:3' },
  { name: 'SXGA', resolution: { width: 1280, height: 1024 }, aspectRatio: '5:4' },
  { name: 'UXGA', resolution: { width: 1600, height: 1200 }, aspectRatio: '4:3' },
];

/** Scaling presets */
export const SCALING_PRESETS = [
  { value: 1.0, label: '100%', description: '推荐 (大多数显示器)' },
  { value: 1.25, label: '125%', description: '适合小屏幕' },
  { value: 1.5, label: '150%', description: '适合高DPI显示器' },
  { value: 1.75, label: '175%', description: '适合4K显示器' },
  { value: 2.0, label: '200%', description: '适合小尺寸4K' },
];

/** Default configuration */
const DEFAULT_CONFIG: ResolutionManagerConfig = {
  autoAdjust: true,
  minResolution: { width: 800, height: 600 },
  maxResolution: { width: 4096, height: 2160 },
  preferredScaling: 1.0,
};

// ============================================================================
// Resolution Manager Class
// ============================================================================

class ResolutionManager {
  private currentMode: DisplayMode;
  private config: ResolutionManagerConfig;
  private callbacks: Set<ResolutionChangeCallback> = new Set();
  private resizeObserver: ResizeObserver | null = null;
  private containerElement: HTMLElement | null = null;
  private debounceTimer: number | null = null;
  private readonly DEBOUNCE_MS = 100;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.currentMode = {
      resolution: { width: window.innerWidth, height: window.innerHeight },
      refreshRate: 60,
      scaling: 1.0,
    };

    // Load saved config
    this.loadConfig();
  }

  // ========================================
  // Initialization
  // ========================================

  /**
   * Initialize the resolution manager
   * @param container The container element to monitor (defaults to document.body)
   */
  init(container?: HTMLElement): void {
    this.containerElement = container || document.body;

    // Set up resize observer
    this.setupResizeObserver();

    // Set initial resolution
    if (this.config.autoAdjust) {
      this.detectAndSetResolution();
    }

    // Apply saved scaling
    this.applyScaling(this.currentMode.scaling);

    console.log('[ResolutionManager] Initialized with resolution:', this.currentMode.resolution);
  }

  /**
   * Set up ResizeObserver to monitor container size changes
   */
  private setupResizeObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      if (!this.config.autoAdjust) return;

      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        // Debounce the resolution change
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = window.setTimeout(() => {
          this.setResolution(width, height, true);
        }, this.DEBOUNCE_MS);
      }
    });

    this.resizeObserver.observe(this.containerElement!);
  }

  // ========================================
  // Resolution Management
  // ========================================

  /**
   * Detect current viewport size and set resolution
   */
  detectAndSetResolution(): void {
    const width = this.containerElement?.clientWidth || window.innerWidth;
    const height = this.containerElement?.clientHeight || window.innerHeight;
    this.setResolution(width, height, true);
  }

  /**
   * Set the display resolution
   * @param width Width in pixels
   * @param height Height in pixels
   * @param isAuto Whether this is an auto-adjustment
   */
  setResolution(width: number, height: number, isAuto: boolean = false): void {
    // Clamp to min/max
    const clampedWidth = Math.max(
      this.config.minResolution.width,
      Math.min(this.config.maxResolution.width, Math.round(width))
    );
    const clampedHeight = Math.max(
      this.config.minResolution.height,
      Math.min(this.config.maxResolution.height, Math.round(height))
    );

    const newResolution = { width: clampedWidth, height: clampedHeight };

    // Check if resolution actually changed
    if (
      newResolution.width === this.currentMode.resolution.width &&
      newResolution.height === this.currentMode.resolution.height
    ) {
      return;
    }

    this.currentMode = {
      ...this.currentMode,
      resolution: newResolution,
    };

    // Apply resolution
    this.applyResolution(newResolution);

    // Save if manual
    if (!isAuto) {
      this.saveConfig();
    }

    // Notify listeners
    this.notifyListeners();

    console.log(
      '[ResolutionManager] Resolution changed to:',
      newResolution,
      isAuto ? '(auto)' : '(manual)'
    );
  }

  /**
   * Set resolution to a preset
   */
  setPresetResolution(preset: ResolutionPreset): void {
    this.config.autoAdjust = false;
    this.setResolution(preset.resolution.width, preset.resolution.height, false);
    this.saveConfig();
  }

  /**
   * Enable/disable auto adjustment
   */
  setAutoAdjust(enabled: boolean): void {
    this.config.autoAdjust = enabled;
    this.saveConfig();

    if (enabled) {
      this.detectAndSetResolution();
    }

    console.log('[ResolutionManager] Auto adjust:', enabled);
  }

  /**
   * Set DPI scaling
   */
  setScaling(scaling: number): void {
    this.currentMode.scaling = scaling;
    this.applyScaling(scaling);
    this.saveConfig();
    this.notifyListeners();
  }

  // ========================================
  // Application
  // ========================================

  /**
   * Apply resolution to the system
   */
  private applyResolution(resolution: Resolution): void {
    // Update CSS custom properties for UI scaling
    document.documentElement.style.setProperty('--os-resolution-width', `${resolution.width}px`);
    document.documentElement.style.setProperty('--os-resolution-height', `${resolution.height}px`);

    // Update viewport meta tag if needed
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        'content',
        `width=${resolution.width}, height=${resolution.height}, initial-scale=1.0`
      );
    }

    // Dispatch custom event for components to react
    window.dispatchEvent(
      new CustomEvent('resolution:change', {
        detail: {
          resolution,
          scaling: this.currentMode.scaling,
          autoAdjust: this.config.autoAdjust,
        },
      })
    );
  }

  /**
   * Apply DPI scaling
   */
  private applyScaling(scaling: number): void {
    document.documentElement.style.setProperty('--os-scaling-factor', String(scaling));
    document.documentElement.style.fontSize = `${16 * scaling}px`;
    document.documentElement.setAttribute('data-scaling', String(scaling));

    // Update meta viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        'content',
        `width=device-width, initial-scale=${1 / scaling}, minimum-scale=${1 / scaling}, maximum-scale=1.0`
      );
    }
  }

  // ========================================
  // Getters
  // ========================================

  /**
   * Get current display mode
   */
  getCurrentMode(): DisplayMode {
    return { ...this.currentMode };
  }

  /**
   * Get current resolution
   */
  getResolution(): Resolution {
    return { ...this.currentMode.resolution };
  }

  /**
   * Get current scaling
   */
  getScaling(): number {
    return this.currentMode.scaling;
  }

  /**
   * Check if auto-adjust is enabled
   */
  isAutoAdjust(): boolean {
    return this.config.autoAdjust;
  }

  /**
   * Get available presets
   */
  getAvailablePresets(): ResolutionPreset[] {
    return RESOLUTION_PRESETS.map((preset) => ({
      ...preset,
      recommended:
        preset.recommended ||
        (preset.resolution.width === 1920 && preset.resolution.height === 1080),
    }));
  }

  /**
   * Get available scaling options
   */
  getAvailableScaling(): typeof SCALING_PRESETS {
    return SCALING_PRESETS;
  }

  /**
   * Get suggested resolution based on viewport
   */
  getSuggestedResolution(): ResolutionPreset | null {
    const currentArea = this.currentMode.resolution.width * this.currentMode.resolution.height;

    // Find the closest preset
    let closest: ResolutionPreset | null = null;
    let minDiff = Infinity;

    for (const preset of RESOLUTION_PRESETS) {
      const presetArea = preset.resolution.width * preset.resolution.height;
      const diff = Math.abs(presetArea - currentArea);

      if (diff < minDiff) {
        minDiff = diff;
        closest = preset;
      }
    }

    return closest;
  }

  // ========================================
  // Persistence
  // ========================================

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    try {
      const data = {
        config: this.config,
        mode: this.currentMode,
      };
      localStorage.setItem('webos-display-config', JSON.stringify(data));
    } catch (e) {
      console.warn('[ResolutionManager] Failed to save config:', e);
    }
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('webos-display-config');
      if (saved) {
        const data = JSON.parse(saved);
        this.config = { ...DEFAULT_CONFIG, ...data.config };
        this.currentMode.scaling = data.mode?.scaling || 1.0;
      }
    } catch (e) {
      console.warn('[ResolutionManager] Failed to load config:', e);
    }
  }

  // ========================================
  // Event Handling
  // ========================================

  /**
   * Subscribe to resolution changes
   */
  subscribe(callback: ResolutionChangeCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Notify all subscribers
   */
  private notifyListeners(): void {
    const mode = this.getCurrentMode();
    this.callbacks.forEach((callback) => {
      try {
        callback(mode);
      } catch (e) {
        console.error('[ResolutionManager] Callback error:', e);
      }
    });
  }

  // ========================================
  // Cleanup
  // ========================================

  /**
   * Destroy the resolution manager
   */
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.callbacks.clear();
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const resolutionManager = new ResolutionManager();

// Export as global for debugging
if (typeof window !== 'undefined') {
  (window as unknown as { webosResolutionManager: ResolutionManager }).webosResolutionManager =
    resolutionManager;
}

export default resolutionManager;
