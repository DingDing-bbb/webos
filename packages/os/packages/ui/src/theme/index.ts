/**
 * WebOS UI Framework - Theme System
 * Modern Glassmorphism Design with Acrylic Effects
 */

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor =
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal';
export type BlurIntensity = 'low' | 'medium' | 'high' | 'ultra';

export interface ThemeConfig {
  mode: ThemeMode;
  accent: AccentColor;
  blurIntensity: BlurIntensity;
  transparency: number; // 0-100
  animations: boolean;
  noiseTexture: boolean;
  acrylicEnabled: boolean;
  micaEnabled: boolean;
}

// Visual effects configuration
export interface VisualEffectsConfig {
  taskbarThumbnails: boolean;
  windowAnimations: boolean;
  menuFadeSlide: boolean;
  comboBoxSlide: boolean;
  smoothScroll: boolean;
  fontSmoothing: boolean;
  peekEnabled: boolean;
  taskbarAnimations: boolean;
  dragWindowContent: boolean;
  showThumbnails: boolean;
  transparentSelection: boolean;
  windowShadows: boolean;
  menuFadeOnClose: boolean;
  tooltipAnimations: boolean;
  cursorShadows: boolean;
  iconLabelShadows: boolean;
  minMaxAnimations: boolean;
}

// Default configurations
export const defaultThemeConfig: ThemeConfig = {
  mode: 'dark',
  accent: 'blue',
  blurIntensity: 'high',
  transparency: 70,
  animations: true,
  noiseTexture: true,
  acrylicEnabled: true,
  micaEnabled: true,
};

export const defaultVisualEffects: VisualEffectsConfig = {
  taskbarThumbnails: true,
  windowAnimations: true,
  menuFadeSlide: true,
  comboBoxSlide: true,
  smoothScroll: true,
  fontSmoothing: true,
  peekEnabled: true,
  taskbarAnimations: true,
  dragWindowContent: true,
  showThumbnails: true,
  transparentSelection: true,
  windowShadows: true,
  menuFadeOnClose: true,
  tooltipAnimations: true,
  cursorShadows: true,
  iconLabelShadows: true,
  minMaxAnimations: true,
};

// Accent color definitions
export const accentColors: Record<AccentColor, { primary: string; light: string; dark: string }> = {
  blue: { primary: '#0078d4', light: '#429ce3', dark: '#005a9e' },
  purple: { primary: '#8764b8', light: '#a78bd4', dark: '#6b4d99' },
  pink: { primary: '#e3008c', light: '#f066b0', dark: '#b4006f' },
  red: { primary: '#d13438', light: '#e56a6d', dark: '#a4262c' },
  orange: { primary: '#ff8c00', light: '#ffab40', dark: '#e07000' },
  yellow: { primary: '#ffb900', light: '#ffd35c', dark: '#d49a00' },
  green: { primary: '#107c10', light: '#2da02d', dark: '#0b5c0b' },
  teal: { primary: '#00b294', light: '#33c9af', dark: '#008f75' },
};

// Blur intensity values
export const blurIntensities: Record<string, string> = {
  low: '12px',
  medium: '25px',
  high: '40px',
  ultra: '80px',
};

// Theme manager class
export class ThemeManager {
  private config: ThemeConfig;
  private effects: VisualEffectsConfig;
  private listeners: Set<(config: ThemeConfig) => void> = new Set();
  private effectListeners: Set<(effects: VisualEffectsConfig) => void> = new Set();

  constructor() {
    this.config = this.loadConfig();
    this.effects = this.loadEffects();
    this.applyTheme();
    this.applyEffects();
  }

  private loadConfig(): ThemeConfig {
    try {
      const saved = localStorage.getItem('webos-theme-config');
      if (saved) {
        return { ...defaultThemeConfig, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore parse errors, use defaults
    }
    return { ...defaultThemeConfig };
  }

  private loadEffects(): VisualEffectsConfig {
    try {
      const saved = localStorage.getItem('webos-visual-effects');
      if (saved) {
        return { ...defaultVisualEffects, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore parse errors, use defaults
    }
    return { ...defaultVisualEffects };
  }

  private saveConfig(): void {
    localStorage.setItem('webos-theme-config', JSON.stringify(this.config));
  }

  private saveEffects(): void {
    localStorage.setItem('webos-visual-effects', JSON.stringify(this.effects));
  }

  private applyTheme(): void {
    const root = document.documentElement;
    const accent = accentColors[this.config.accent];
    const blur = blurIntensities[this.config.blurIntensity];

    // Apply accent colors
    root.style.setProperty('--color-primary', accent.primary);
    root.style.setProperty('--color-primary-hover', accent.light);
    root.style.setProperty('--color-primary-active', accent.dark);

    // Apply blur intensity
    root.style.setProperty('--blur-lg', blur);

    // Apply transparency
    const alpha = this.config.transparency / 100;
    root.style.setProperty('--bg-acrylic', `rgba(32, 32, 32, ${alpha * 0.7})`);
    root.style.setProperty('--bg-acrylic-light', `rgba(45, 45, 45, ${alpha * 0.65})`);

    // Apply theme mode
    root.setAttribute('data-theme', this.config.mode);

    // Apply animation preference
    root.style.setProperty('--duration-normal', this.config.animations ? '200ms' : '0ms');
    root.style.setProperty('--duration-fast', this.config.animations ? '100ms' : '0ms');

    // Toggle classes
    root.classList.toggle('acrylic-disabled', !this.config.acrylicEnabled);
    root.classList.toggle('mica-disabled', !this.config.micaEnabled);
    root.classList.toggle('noise-disabled', !this.config.noiseTexture);
  }

  private applyEffects(): void {
    const root = document.documentElement;

    // Apply effect toggles as data attributes
    Object.entries(this.effects).forEach(([key, value]) => {
      root.setAttribute(`data-effect-${key}`, value ? 'true' : 'false');
    });

    // Apply specific CSS classes
    root.classList.toggle('effects-window-shadows', this.effects.windowShadows);
    root.classList.toggle('effects-animations', this.effects.windowAnimations);
    root.classList.toggle('effects-smooth-scroll', this.effects.smoothScroll);
    root.classList.toggle('effects-cursor-shadows', this.effects.cursorShadows);
  }

  getConfig(): ThemeConfig {
    return { ...this.config };
  }

  getEffects(): VisualEffectsConfig {
    return { ...this.effects };
  }

  updateConfig(updates: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    this.applyTheme();
    this.listeners.forEach((fn) => fn(this.config));
  }

  updateEffects(updates: Partial<VisualEffectsConfig>): void {
    this.effects = { ...this.effects, ...updates };
    this.saveEffects();
    this.applyEffects();
    this.effectListeners.forEach((fn) => fn(this.effects));
  }

  subscribe(callback: (config: ThemeConfig) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  subscribeEffects(callback: (effects: VisualEffectsConfig) => void): () => void {
    this.effectListeners.add(callback);
    return () => this.effectListeners.delete(callback);
  }

  // Helper to get CSS variable
  getCSSVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // Helper to set CSS variable
  setCSSVar(name: string, value: string): void {
    document.documentElement.style.setProperty(name, value);
  }
}

// Singleton instance
export const themeManager = new ThemeManager();

// React-style hooks for theme
export function useTheme(): {
  config: ThemeConfig;
  updateConfig: (updates: Partial<ThemeConfig>) => void;
} {
  return {
    config: themeManager.getConfig(),
    updateConfig: (updates) => themeManager.updateConfig(updates),
  };
}

export function useVisualEffects(): {
  effects: VisualEffectsConfig;
  updateEffects: (updates: Partial<VisualEffectsConfig>) => void;
} {
  return {
    effects: themeManager.getEffects(),
    updateEffects: (updates) => themeManager.updateEffects(updates),
  };
}

// Export all
export default themeManager;
