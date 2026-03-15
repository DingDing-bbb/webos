/**
 * @fileoverview Boot Types
 * @module @kernel/services/boot/types
 */

export type BootStage = 'idle' | 'bios' | 'bootloader' | 'kernel' | 'services' | 'desktop';

export interface BootConfig {
  skipSplash?: boolean;
  debugMode?: boolean;
  safeMode?: boolean;
}
