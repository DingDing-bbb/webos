/**
 * @webos/wallpapers
 * WebOS Wallpaper System
 * 
 * This package provides the wallpaper registry and type definitions
 * for the WebOS desktop environment.
 * 
 * @example
 * ```typescript
 * import { wallpaperRegistry, DEFAULT_WALLPAPER_ID } from '@webos/wallpapers';
 * 
 * // Get all wallpapers
 * const wallpapers = wallpaperRegistry.getAll();
 * 
 * // Get a specific wallpaper
 * const wallpaper = wallpaperRegistry.getById('catgirl-animated');
 * 
 * // Get wallpapers by category
 * const animeWallpapers = wallpaperRegistry.getByCategory('anime');
 * ```
 */

// Types
export type {
  WallpaperType,
  WallpaperCategory,
  WallpaperFit,
  WallpaperMetadata,
  StaticWallpaper,
  AnimatedWallpaper,
  VideoWallpaper,
  Wallpaper,
  WallpaperSettings,
  WallpaperManager,
} from './types';

// Registry
export {
  systemWallpapers,
  wallpaperRegistry,
  DEFAULT_WALLPAPER_ID,
  defaultWallpaperSettings,
} from './registry';

// Re-export registry class for advanced usage
export { wallpaperRegistry as WallpaperRegistry } from './registry';
