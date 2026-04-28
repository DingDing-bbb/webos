/**
 * Boot Screen Component
 *
 * 从 @bootloader 重新导出所有内容
 */

// 从 bootloader 导入（使用相对路径避免模块别名解析问题）
import {
  BootController,
  BootUI,
  BootScreen,
  bootloader,
  setupGlobalErrorHandler,
} from '../../../../bootloader/src/index';

import type {
  BootTask,
  ProgressCallback,
  BootResult,
  BootStatus,
  BootError,
  BootUIProps,
  BootScreenProps,
  BootloaderPlugin,
} from '../../../../bootloader/src/index';

// 重新导出
export { BootController, BootUI, BootScreen, bootloader, setupGlobalErrorHandler };

export type {
  BootTask,
  ProgressCallback,
  BootResult,
  BootStatus,
  BootError,
  BootUIProps,
  BootScreenProps,
  BootloaderPlugin,
};

// 默认导出
export default BootScreen;
