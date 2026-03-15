// 文件系统包入口

// 导出类型
export * from './types';

// 导出核心类
export { FileSystem, fileSystem } from './core/FileSystem';

// 导出节点工具
export {
  createNode,
  toDirEntry,
  calculateDirSize,
  cloneNode,
  touch,
  setContent,
  getContent,
  addChild,
  removeChild,
  getChild,
  getChildren,
  isEmptyDir
} from './core/Node';

// 导出权限工具
export {
  parsePermissions,
  formatPermissions,
  checkPermission,
  isValidPermission,
  permissionToOctal,
  octalToPermission,
  DEFAULT_DIR_PERMS,
  DEFAULT_FILE_PERMS,
  DEFAULT_EXEC_PERMS
} from './core/Permissions';
