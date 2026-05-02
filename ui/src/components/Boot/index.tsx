/**
 * Boot Screen Component
 *
 * 从 @webos/drivers 重新导出启动相关组件
 */

export { BootController, BootUI, BootScreen } from '@webos/drivers';
export type { BootResult, ProgressCallback } from '@webos/drivers';
export { bootloader, setupGlobalErrorHandler } from '@webos/drivers';

export default BootScreen;
