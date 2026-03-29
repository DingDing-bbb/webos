/**
 * @fileoverview Boot Screen Component
 * @module @ui/components/Boot
 * 
 * 从 @bootloader 重新导出启动相关组件
 * 保持向后兼容性
 */

// 从 bootloader 重新导出
export { 
  BootController, 
  BootUI, 
  BootScreen,
  LoadingScreen,
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
  BootloaderPlugin
} from '@bootloader';

export default BootScreen;
