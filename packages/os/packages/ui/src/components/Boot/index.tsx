/**
 * Boot Screen Component
 * 
 * 从 @bootloader 重新导出
 */

export { 
  BootController, 
  BootUI, 
  BootScreen,
  bootloader,
  setupGlobalErrorHandler,
  BootManager
} from '@bootloader';

export type { 
  BootResult, 
  ProgressCallback,
  BootStatus,
  BootError,
  BootUIProps,
  BootScreenProps,
  BootloaderPlugin,
  BootTask
} from '@bootloader';

export default BootScreen;
