/**
 * Wallpaper Registry
 * Central registry for all system wallpapers
 */

import type { Wallpaper, StaticWallpaper, VideoWallpaper, WallpaperCategory } from './types';

/**
 * Base path for wallpaper assets
 */
const WALLPAPER_BASE = '/wallpapers';

/**
 * System default wallpapers
 */
export const systemWallpapers: Wallpaper[] = [
  // Catgirl Static
  {
    id: 'catgirl-static',
    name: 'Catgirl',
    description: 'A cute catgirl illustration',
    type: 'static',
    src: `${WALLPAPER_BASE}/catgirl-static.png`,
    categories: ['anime'],
    isDefault: true,
    supportsDarkMode: true,
    author: 'Unknown',
  } as StaticWallpaper,

  // Catgirl Animated Video
  {
    id: 'catgirl-animated',
    name: 'Catgirl (Animated)',
    description: 'An animated catgirl live wallpaper',
    type: 'video',
    src: `${WALLPAPER_BASE}/catgirl-animated.mp4`,
    poster: `${WALLPAPER_BASE}/catgirl-static.png`,
    fallback: `${WALLPAPER_BASE}/catgirl-static.png`,
    loop: true,
    muted: true,
    playbackRate: 1,
    categories: ['anime'],
    isDefault: true,
    supportsDarkMode: true,
    author: 'Unknown',
  } as VideoWallpaper,

  // Neko Image
  {
    id: 'neko-image',
    name: 'Neko',
    description: 'A beautiful neko illustration',
    type: 'static',
    src: `${WALLPAPER_BASE}/猫娘图片.png`,
    categories: ['anime'],
    isDefault: true,
    supportsDarkMode: true,
    author: 'Unknown',
  } as StaticWallpaper,

  // Amashiro & Nachoneko Video
  {
    id: 'amashiro-nachoneko',
    name: 'Amashiro & Nachoneko',
    description: 'A beautiful animated wallpaper featuring Amashiro and Nachoneko',
    type: 'video',
    src: `${WALLPAPER_BASE}/甘城&nachoneko.mp4`,
    loop: true,
    muted: true,
    playbackRate: 1,
    categories: ['anime'],
    isDefault: true,
    supportsDarkMode: true,
    author: 'Unknown',
  } as VideoWallpaper,

  // Abstract 1347935
  {
    id: 'abstract-1347935',
    name: 'Abstract Dreams',
    description: 'An abstract artistic wallpaper',
    type: 'static',
    src: `${WALLPAPER_BASE}/1347935.png`,
    categories: ['abstract'],
    isDefault: true,
    supportsDarkMode: true,
    author: 'Unknown',
  } as StaticWallpaper,
];

/**
 * Wallpaper registry class
 */
class WallpaperRegistry {
  private wallpapers: Map<string, Wallpaper> = new Map();
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.initialized) return;
    
    // Register all system wallpapers
    for (const wallpaper of systemWallpapers) {
      this.wallpapers.set(wallpaper.id, wallpaper);
    }
    
    this.initialized = true;
  }

  /**
   * Get all registered wallpapers
   */
  getAll(): Wallpaper[] {
    return Array.from(this.wallpapers.values());
  }

  /**
   * Get wallpaper by ID
   */
  getById(id: string): Wallpaper | undefined {
    return this.wallpapers.get(id);
  }

  /**
   * Get all default wallpapers
   */
  getDefaults(): Wallpaper[] {
    return this.getAll().filter(w => w.isDefault);
  }

  /**
   * Get wallpapers by category
   */
  getByCategory(category: WallpaperCategory): Wallpaper[] {
    return this.getAll().filter(w => w.categories.includes(category));
  }

  /**
   * Register a new wallpaper
   */
  register(wallpaper: Wallpaper): void {
    this.wallpapers.set(wallpaper.id, wallpaper);
  }

  /**
   * Unregister a wallpaper
   */
  unregister(id: string): boolean {
    return this.wallpapers.delete(id);
  }

  /**
   * Check if wallpaper exists
   */
  has(id: string): boolean {
    return this.wallpapers.has(id);
  }

  /**
   * Get count of registered wallpapers
   */
  get count(): number {
    return this.wallpapers.size;
  }
}

/**
 * Global wallpaper registry instance
 */
export const wallpaperRegistry = new WallpaperRegistry();

/**
 * Get the default wallpaper ID
 */
export const DEFAULT_WALLPAPER_ID = 'catgirl-animated';

/**
 * Get default wallpaper settings
 */
export const defaultWallpaperSettings = {
  currentWallpaperId: DEFAULT_WALLPAPER_ID,
  fit: 'fill' as const,
  blur: 0,
  overlayOpacity: 0,
};
