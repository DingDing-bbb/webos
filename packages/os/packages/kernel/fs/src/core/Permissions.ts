// 权限管理模块

import type { PermissionBits, Permissions, UserInfo } from '../types';

/**
 * 解析权限字符串为权限位
 * 例如: "rwxr-xr-x" -> [{read:true,write:true,execute:true}, {read:true,write:false,execute:true}, ...]
 */
export function parsePermissions(perm: string): Permissions {
  // 移除类型字符 (d, -, c, etc.)
  const permStr = perm.length === 10 ? perm.substring(1) : perm;

  const result: PermissionBits[] = [];
  for (let i = 0; i < 3; i++) {
    const start = i * 3;
    result.push({
      read: permStr[start] === 'r',
      write: permStr[start + 1] === 'w',
      execute: permStr[start + 2] === 'x',
    });
  }

  return result as Permissions;
}

/**
 * 将权限位转换为字符串
 */
export function formatPermissions(isDir: boolean, perms: Permissions): string {
  const type = isDir ? 'd' : '-';
  return (
    type +
    perms
      .map((p) => (p.read ? 'r' : '-') + (p.write ? 'w' : '-') + (p.execute ? 'x' : '-'))
      .join('')
  );
}

/**
 * 默认权限
 */
export const DEFAULT_DIR_PERMS = 'drwxr-xr-x';
export const DEFAULT_FILE_PERMS = '-rw-r--r--';
export const DEFAULT_EXEC_PERMS = '-rwxr-xr-x';

/**
 * 检查用户是否有指定权限
 */
export function checkPermission(
  permissions: string,
  user: UserInfo | null,
  owner: string,
  access: 'read' | 'write' | 'execute'
): boolean {
  // root 用户有所有权限
  if (user?.isRoot) return true;

  const perms = parsePermissions(permissions);

  // 没有用户信息，使用其他人权限
  if (!user) {
    return perms[2][access];
  }

  // 所有者权限
  if (owner === user.username) {
    return perms[0][access];
  }

  // 其他人权限
  return perms[2][access];
}

/**
 * 验证权限字符串格式
 */
export function isValidPermission(perm: string): boolean {
  return /^[d-lbc][rwx-]{9}$/.test(perm);
}

/**
 * 权限字符串转八进制
 * 例如: "rwxr-xr-x" -> "755"
 */
export function permissionToOctal(perm: string): string {
  const permStr = perm.length === 10 ? perm.substring(1) : perm;
  let result = '';

  for (let i = 0; i < 3; i++) {
    const start = i * 3;
    let val = 0;
    if (permStr[start] === 'r') val += 4;
    if (permStr[start + 1] === 'w') val += 2;
    if (permStr[start + 2] === 'x') val += 1;
    result += val;
  }

  return result;
}

/**
 * 八进制转权限字符串
 * 例如: "755" -> "rwxr-xr-x"
 */
export function octalToPermission(octal: string, isDir: boolean = false): string {
  const prefix = isDir ? 'd' : '-';

  const rwx = (digit: number): string => {
    let result = '';
    result += digit & 4 ? 'r' : '-';
    result += digit & 2 ? 'w' : '-';
    result += digit & 1 ? 'x' : '-';
    return result;
  };

  const digits = octal.padStart(3, '0');
  return (
    prefix +
    rwx(parseInt(digits.charAt(0))) +
    rwx(parseInt(digits.charAt(1))) +
    rwx(parseInt(digits.charAt(2)))
  );
}
