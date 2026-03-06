// 用户管理核心模块
// 提供用户创建、删除、修改、认证等功能

import type { User, UserRole, Permission, UserSession } from '../types';

// 存储键
const USERS_STORAGE_KEY = 'webos-users';
const SESSION_STORAGE_KEY = 'webos-session';
const TEMP_USER_KEY = 'webos-temp-user';

/**
 * 用户管理器
 * 负责用户的创建、认证、权限管理等
 */
export class UserManager {
  private users: Map<string, User> = new Map();
  private currentSession: UserSession | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.loadSession();
  }

  // ==================== 用户存储 ====================

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([username, user]) => {
          this.users.set(username, this.deserializeUser(user as Record<string, unknown>));
        });
      }
    } catch (error) {
      console.error('[UserManager] Failed to load users from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data: Record<string, ReturnType<typeof this.serializeUser>> = {};
      this.users.forEach((user, username) => {
        data[username] = this.serializeUser(user);
      });
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[UserManager] Failed to save users to storage:', error);
    }
  }

  private serializeUser(user: User): Record<string, unknown> {
    return {
      ...user,
      createdAt: user.createdAt?.toISOString(),
      lastLogin: user.lastLogin?.toISOString()
    };
  }

  private deserializeUser(data: Record<string, unknown>): User {
    return {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt as string) : undefined,
      lastLogin: data.lastLogin ? new Date(data.lastLogin as string) : undefined
    } as User;
  }

  // ==================== 会话管理 ====================

  private loadSession(): void {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const user = this.users.get(data.username);
        if (user) {
          this.currentSession = {
            user,
            loginTime: new Date(data.loginTime),
            isTemporary: data.isTemporary || false
          };
        }
      }
    } catch {
      // 忽略错误
    }
  }

  private saveSession(): void {
    if (this.currentSession) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        username: this.currentSession.user.username,
        loginTime: this.currentSession.loginTime.toISOString(),
        isTemporary: this.currentSession.isTemporary
      }));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  // ==================== 用户创建 ====================

  /**
   * 创建新用户
   */
  createUser(
    username: string,
    password: string,
    options?: {
      role?: UserRole;
      isRoot?: boolean;
      permissions?: Permission[];
      displayName?: string;
    }
  ): { success: boolean; user?: User; error?: string } {
    // 验证用户名
    if (!username || username.length < 2) {
      return { success: false, error: 'Username must be at least 2 characters' };
    }

    if (!/^[a-z_][a-z0-9_-]*$/i.test(username)) {
      return { success: false, error: 'Username contains invalid characters' };
    }

    // 检查用户是否已存在
    if (this.users.has(username)) {
      return { success: false, error: 'User already exists' };
    }

    // 验证密码
    if (!password || password.length < 1) {
      return { success: false, error: 'Password is required' };
    }

    // 确定角色
    const role: UserRole = options?.role || (options?.isRoot ? 'root' : 'user');

    // 确定权限
    const permissions: Permission[] = options?.permissions || this.getDefaultPermissions(role);

    const user: User = {
      username,
      password: this.hashPasswordLegacy(password),
      role,
      isRoot: options?.isRoot || role === 'root',
      homeDir: role === 'root' ? '/root' : `/home/${username}`,
      permissions,
      displayName: options?.displayName || username,
      createdAt: new Date(),
      isTemporary: false
    };

    this.users.set(username, user);
    this.saveToStorage();
    this.notifyListeners();

    return { success: true, user };
  }

  /**
   * 获取角色默认权限
   */
  private getDefaultPermissions(role: UserRole): Permission[] {
    const permissionSets: Record<UserRole, Permission[]> = {
      root: [
        'read:files', 'write:files', 'delete:files',
        'read:settings', 'write:settings',
        'read:users', 'write:users', 'delete:users',
        'execute:commands', 'admin:system'
      ],
      admin: [
        'read:files', 'write:files', 'delete:files',
        'read:settings', 'write:settings',
        'read:users', 'write:users',
        'execute:commands'
      ],
      user: [
        'read:files', 'write:files',
        'read:settings',
        'execute:commands'
      ],
      guest: [
        'read:files', 'read:settings'
      ]
    };

    return permissionSets[role] || permissionSets.user;
  }

  // ==================== 临时账户 ====================

  /**
   * 创建临时账户（初始化失败时使用）
   */
  createTemporaryUser(reason: string = 'System initialization failed'): User {
    const tempUsername = `temp_${Date.now()}`;
    const tempPassword = this.generateRandomPassword();

    const user: User = {
      username: tempUsername,
      password: this.hashPasswordLegacy(tempPassword),
      role: 'guest',
      isRoot: false,
      homeDir: '/tmp/guest',
      permissions: this.getDefaultPermissions('guest'),
      displayName: 'Temporary User',
      createdAt: new Date(),
      isTemporary: true,
      temporaryReason: reason
    };

    this.users.set(tempUsername, user);
    this.saveToStorage();

    // 存储临时用户信息以便显示
    localStorage.setItem(TEMP_USER_KEY, JSON.stringify({
      username: tempUsername,
      password: tempPassword,
      reason,
      createdAt: new Date().toISOString()
    }));

    return user;
  }

  /**
   * 检查是否有临时账户
   */
  hasTemporaryUser(): boolean {
    return localStorage.getItem(TEMP_USER_KEY) !== null;
  }

  /**
   * 获取临时账户信息
   */
  getTemporaryUserInfo(): { username: string; password: string; reason: string } | null {
    try {
      const saved = localStorage.getItem(TEMP_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // 忽略错误
    }
    return null;
  }

  /**
   * 清除临时账户
   */
  clearTemporaryUser(): void {
    const tempInfo = this.getTemporaryUserInfo();
    if (tempInfo) {
      this.users.delete(tempInfo.username);
      this.saveToStorage();
    }
    localStorage.removeItem(TEMP_USER_KEY);

    if (this.currentSession?.isTemporary) {
      this.logout();
    }
  }

  // ==================== 认证 ====================

  // 登录失败计数
  private loginAttempts: Map<string, { count: number; lockedUntil: number | null }> = new Map();
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 5 * 60 * 1000; // 5分钟

  /**
   * 登录（同步密码验证）
   */
  login(username: string, password: string): { success: boolean; error?: string } {
    // 检查是否被锁定
    const attemptInfo = this.loginAttempts.get(username);
    if (attemptInfo?.lockedUntil && Date.now() < attemptInfo.lockedUntil) {
      const remaining = Math.ceil((attemptInfo.lockedUntil - Date.now()) / 60000);
      return { success: false, error: `Account locked. Try again in ${remaining} minutes.` };
    }

    const user = this.users.get(username);

    if (!user) {
      this.recordLoginFailure(username);
      return { success: false, error: 'Invalid username or password' };
    }

    // 使用同步密码验证（legacy格式）
    const isValid = this.hashPasswordLegacy(password) === user.password;

    if (!isValid) {
      this.recordLoginFailure(username);
      return { success: false, error: 'Invalid username or password' };
    }

    // 登录成功，清除失败记录
    this.loginAttempts.delete(username);

    // 更新最后登录时间
    user.lastLogin = new Date();
    this.users.set(username, user);
    this.saveToStorage();

    // 创建会话
    this.currentSession = {
      user,
      loginTime: new Date(),
      isTemporary: user.isTemporary || false
    };
    this.saveSession();
    this.notifyListeners();

    return { success: true };
  }

  /**
   * 记录登录失败
   */
  private recordLoginFailure(username: string): void {
    const info = this.loginAttempts.get(username) || { count: 0, lockedUntil: null };
    info.count++;
    
    if (info.count >= this.MAX_LOGIN_ATTEMPTS) {
      info.lockedUntil = Date.now() + this.LOCKOUT_DURATION;
    }
    
    this.loginAttempts.set(username, info);
  }

  /**
   * 迁移用户密码到新格式
   */
  private async migrateUserPassword(user: User, password: string): Promise<void> {
    user.password = await this.hashPassword(password);
    this.users.set(user.username, user);
    this.saveToStorage();
  }

  /**
   * 检查账户是否被锁定
   */
  isAccountLocked(username: string): { locked: boolean; remainingMinutes?: number } {
    const info = this.loginAttempts.get(username);
    if (info?.lockedUntil && Date.now() < info.lockedUntil) {
      return {
        locked: true,
        remainingMinutes: Math.ceil((info.lockedUntil - Date.now()) / 60000)
      };
    }
    return { locked: false };
  }

  /**
   * 重置账户锁定状态（需要管理员权限）
   */
  unlockAccount(username: string): boolean {
    this.loginAttempts.delete(username);
    return true;
  }

  /**
   * 登出
   */
  logout(): void {
    this.currentSession = null;
    this.saveSession();
    this.notifyListeners();
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn(): boolean {
    return this.currentSession !== null;
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  /**
   * 获取当前会话
   */
  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  // ==================== 用户管理 ====================

  /**
   * 获取所有用户
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * 获取用户
   */
  getUser(username: string): User | null {
    return this.users.get(username) || null;
  }

  /**
   * 更新用户
   */
  updateUser(
    username: string,
    updates: Partial<Pick<User, 'displayName' | 'password' | 'permissions' | 'role'>>
  ): { success: boolean; error?: string } {
    const user = this.users.get(username);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // 不允许修改临时用户
    if (user.isTemporary) {
      return { success: false, error: 'Cannot modify temporary user' };
    }

    // 更新字段
    if (updates.displayName) user.displayName = updates.displayName;
    if (updates.password) user.password = this.hashPasswordLegacy(updates.password);
    if (updates.permissions) user.permissions = updates.permissions;
    if (updates.role) {
      user.role = updates.role;
      user.isRoot = updates.role === 'root';
      user.permissions = this.getDefaultPermissions(updates.role);
    }

    this.users.set(username, user);
    this.saveToStorage();
    this.notifyListeners();

    return { success: true };
  }

  /**
   * 删除用户
   */
  deleteUser(username: string): { success: boolean; error?: string } {
    // 不允许删除 root 用户
    if (username === 'root') {
      return { success: false, error: 'Cannot delete root user' };
    }

    // 不允许删除当前登录的用户
    if (this.currentSession?.user.username === username) {
      return { success: false, error: 'Cannot delete currently logged in user' };
    }

    const deleted = this.users.delete(username);
    if (!deleted) {
      return { success: false, error: 'User not found' };
    }

    this.saveToStorage();
    this.notifyListeners();

    return { success: true };
  }

  /**
   * 修改密码
   */
  changePassword(
    username: string,
    oldPassword: string,
    newPassword: string
  ): { success: boolean; error?: string } {
    const user = this.users.get(username);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!this.verifyPassword(oldPassword, user.password)) {
      return { success: false, error: 'Invalid old password' };
    }

    user.password = this.hashPasswordLegacy(newPassword);
    this.users.set(username, user);
    this.saveToStorage();

    return { success: true };
  }

  // ==================== 权限检查 ====================

  /**
   * 检查当前用户是否有指定权限
   */
  hasPermission(permission: Permission): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // root 用户拥有所有权限
    if (user.role === 'root') return true;

    return user.permissions.includes(permission);
  }

  /**
   * 检查当前用户是否是 root
   */
  isRoot(): boolean {
    return this.getCurrentUser()?.role === 'root';
  }

  /**
   * 检查当前用户是否是管理员
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'root' || user?.role === 'admin';
  }

  /**
   * 检查是否是临时会话
   */
  isTemporarySession(): boolean {
    return this.currentSession?.isTemporary || false;
  }

  // ==================== 密码处理 ====================

  private PASSWORD_SALT = 'webos_secure_salt_2024';

  /**
   * 安全密码哈希 - 使用 Web Crypto API (SHA-256)
   */
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + this.PASSWORD_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    // 转换为十六进制字符串
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * 验证密码（异步）
   */
  private async verifyPasswordAsync(password: string, hashedPassword: string): Promise<boolean> {
    const newHash = await this.hashPassword(password);
    return newHash === hashedPassword;
  }

  /**
   * 验证密码（同步，用于向后兼容旧格式）
   */
  private verifyPassword(password: string, hashedPassword: string): boolean {
    // 检测新格式（64字符十六进制）
    if (/^[a-f0-9]{64}$/.test(hashedPassword)) {
      // 新格式需要异步验证，      console.warn('[UserManager] New password format requires async verification');
      return false;
    }
    // 旧格式兼容
    return this.hashPasswordLegacy(password) === hashedPassword;
  }

  /**
   * 旧版密码哈希（向后兼容）
   */
  private hashPasswordLegacy(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const salt = 'webos_salt_2024';
    let salted = password + salt;
    let hash2 = 0;
    for (let i = 0; i < salted.length; i++) {
      hash2 = ((hash2 << 5) - hash2) + salted.charCodeAt(i);
      hash2 = hash2 & hash2;
    }
    return `${hash}_${hash2}`;
  }

  /**
   * 生成随机密码
   */
  private generateRandomPassword(length: number = 12): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // ==================== 事件 ====================

  /**
   * 订阅用户状态变化
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  // ==================== 初始化检查 ====================

  /**
   * 检查系统是否已初始化（是否有用户）
   */
  isInitialized(): boolean {
    return this.users.size > 0;
  }

  /**
   * 检查是否有正式账户（非临时）
   */
  hasUsers(): boolean {
    return Array.from(this.users.values()).some(u => !u.isTemporary);
  }

  /**
   * 获取所有正式账户（非临时）
   */
  getRealUsers(): User[] {
    return Array.from(this.users.values()).filter(u => !u.isTemporary);
  }

  /**
   * 尝试自动恢复会话
   * 返回是否成功恢复
   */
  tryAutoLogin(): { success: boolean; error?: string } {
    // 如果有保存的会话，尝试恢复
    if (this.currentSession && this.currentSession.user) {
      return { success: true };
    }

    // 如果只有一个正式用户，检查是否有保存的会话
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const user = this.users.get(data.username);
        if (user && !user.isTemporary) {
          this.currentSession = {
            user,
            loginTime: new Date(data.loginTime),
            isTemporary: false
          };
          this.notifyListeners();
          return { success: true };
        }
      } catch {
        // 忽略解析错误
      }
    }

    return { success: false, error: 'No valid session to restore' };
  }

  /**
   * 检查 OOBE 是否已完成
   */
  isOOBEComplete(): boolean {
    // 至少有一个非临时用户
    return Array.from(this.users.values()).some(u => !u.isTemporary);
  }

  /**
   * 重置所有用户数据
   */
  reset(): void {
    this.users.clear();
    this.currentSession = null;
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(TEMP_USER_KEY);
    this.notifyListeners();
  }
}

// 导出单例
export const userManager = new UserManager();
