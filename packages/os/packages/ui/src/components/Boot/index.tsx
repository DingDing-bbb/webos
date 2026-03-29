/**
 * Boot Screen Component
 * 
 * 从 @bootloader 重新导出所有内容
 */

// 从 bootloader 导入
import { 
  BootController,
  BootUI,
  BootScreen,
  bootloader,
  setupGlobalErrorHandler,
  BootManager
} from '@bootloader';

import type { 
  BootTask,
  ProgressCallback, 
  BootResult,
  BootStatus,
  BootError,
  BootUIProps,
  BootScreenProps,
  BootloaderPlugin
} from '@bootloader';

// 重新导出
export { 
  BootController,
  BootUI,
  BootScreen,
  bootloader,
  setupGlobalErrorHandler,
  BootManager
};

export type { 
  BootTask,
  ProgressCallback, 
  BootResult,
  BootStatus,
  BootError,
  BootUIProps,
  BootScreenProps,
  BootloaderPlugin
};

// 默认导出
export default BootScreen;
