/**
 * Wallpaper Types
 * Defines the type system for the WebOS wallpaper system
 */

export type WallpaperType = 'static' | 'animated' | 'video';

export type WallpaperCategory = 
  | 'nature'
  | 'abstract'
  | 'anime'
  | 'minimal'
  | 'gradient'
  | 'custom';

export type WallpaperFit = 
  | 'fill'
  | 'fit'
  | 'stretch'
  | 'tile'
  | 'center'
  | 'span';

export interface WallpaperMetadata {
  /** Unique identifier for the wallpaper */
  id: string;
  /** Display name */
  name: string;
  /** Optional description */
  description?: string;
  /** Author/creator */
  author?: string;
  /** Source URL */
  source?: string;
  /** Categories this wallpaper belongs to */
  categories: WallpaperCategory[];
  /** Whether this is a system default wallpaper */
  isDefault?: boolean;
  /** Whether this wallpaper requires dark mode adjustment */
  supportsDarkMode?: boolean;
  /** Thumbnail URL for preview */
  thumbnail?: string;
  /** Creation timestamp */
  createdAt?: number;
  /** Last modified timestamp */
  updatedAt?: number;
}

export interface StaticWallpaper extends WallpaperMetadata {
  type: 'static';
  /** Path to the static image */
  src: string;
  /** Alternative sources for different resolutions */
  srcSet?: Record<string, string>;
  /** Dominant color for loading placeholder */
  dominantColor?: string;
}

export interface AnimatedWallpaper extends WallpaperMetadata {
  type: 'animated';
  /** Path to the animated image (GIF, WebP) */
  src: string;
  /** Static fallback image */
  fallback?: string;
}

export interface VideoWallpaper extends WallpaperMetadata {
  type: 'video';
  /** Path to the video file */
  src: string;
  /** Video poster image */
  poster?: string;
  /** Static fallback image */
  fallback?: string;
  /** Whether video should loop */
  loop?: boolean;
  /** Whether video should be muted */
  muted?: boolean;
  /** Video playback speed */
  playbackRate?: number;
}

export type Wallpaper = StaticWallpaper | AnimatedWallpaper | VideoWallpaper;

export interface WallpaperSettings {
  /** Currently selected wallpaper ID */
  currentWallpaperId: string;
  /** How the wallpaper should fit the screen */
  fit: WallpaperFit;
  /** Custom position offset (percentage) */
  position?: { x: number; y: number };
  /** Custom scaling factor */
  scale?: number;
  /** Blur effect intensity (0-20px) */
  blur?: number;
  /** Overlay color (for dimming) */
  overlay?: string;
  /** Overlay opacity (0-1) */
  overlayOpacity?: number;
}

export interface WallpaperManager {
  /** Get all available wallpapers */
  getAll(): Wallpaper[];
  /** Get wallpaper by ID */
  getById(id: string): Wallpaper | undefined;
  /** Get default wallpapers */
  getDefaults(): Wallpaper[];
  /** Get wallpapers by category */
  getByCategory(category: WallpaperCategory): Wallpaper[];
  /** Get current wallpaper settings */
  getSettings(): WallpaperSettings;
  /** Set current wallpaper */
  setWallpaper(id: string): void;
  /** Update wallpaper settings */
  updateSettings(settings: Partial<WallpaperSettings>): void;
  /** Add custom wallpaper */
  addCustom(wallpaper: Omit<Wallpaper, 'id' | 'createdAt' | 'updatedAt'>): Wallpaper;
  /** Remove custom wallpaper */
  removeCustom(id: string): boolean;
}
