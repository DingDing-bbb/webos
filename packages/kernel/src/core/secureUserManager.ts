/**
 * @fileoverview Secure User Management System
 * @module @kernel/core/secureUserManager
 *
 * Manages user authentication, sessions, and permissions with full encryption.
 * Integrates with the encrypted database for secure credential storage.
 *
 * @features
 * - Multi-user support with role-based access control
 * - Secure password hashing (PBKDF2 100K iterations)
 * - Session management with automatic locking
 * - Permission system for fine-grained access control
 * - Root account hidden by default for security
 *
 * @example
 * ```typescript
 * import { secureUserManager } from '@kernel/core/secureUserManager';
 *
 * // Check system state
 * const isLocked = secureUserManager.isLocked();
 * const hasDb = await secureUserManager.hasDatabase();
 *
 * // First-time setup
 * const result = await secureUserManager.createFirstUser('alice', 'password');
 *
 * // Login
 * const loginResult = await secureUserManager.login('alice', 'password');
 *
 * // Get current user
 * const user = secureUserManager.getCurrentUser();
 * ```
 */

import type { User, UserRole, Permission, UserSession } from '../types';
import {
  hashPassword,
  verifyPassword,
  isCryptoAvailable,
} from './crypto';
import {
  initDatabase,
  saveDatabase,
  databaseExists,
  isUnlocked,
  closeDatabase,
  deleteDatabase,
  runSql,
  querySql,
  getStats,
} from './encryptedDatabase';
import { persistentFileSystem } from './persistentFileSystem';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Current state of the user manager
 */
export interface SecureUserManagerState {
  /** Whether the manager has been initialized */
  isInitialized: boolean;
  /** Whether the system is locked (requires authentication) */
  isLocked: boolean;
  /** Whether any users exist in the database */
  hasUsers: boolean;
  /** Currently authenticated user, if any */
  currentUser: User | null;
}

/**
 * Result of a login attempt
 */
export interface LoginResult {
  /** Whether login was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Whether database unlock is required */
  requiresUnlock?: boolean;
}

/**
 * Internal representation of a user database row
 */
interface UserRow {
  username: string;
  password_hash: string;
  password_salt: string;
  role: string;
  is_root: number;
  home_dir: string;
  permissions: string;
  display_name: string;
  created_at: string;
  last_login: string | null;
  is_temporary: number;
  temporary_reason: string | null;
}

// ============================================================================
// Secure User Manager Class
// ============================================================================

/**
 * Manages user authentication and authorization.
 *
 * This class is a singleton - use the exported `secureUserManager` instance.
 *
 * @example
 * ```typescript
 * import { secureUserManager } from '@kernel/core/secureUserManager';
 *
 * // Subscribe to state changes
 * const unsubscribe = secureUserManager.subscribe(() => {
 *   console.log('State changed:', secureUserManager.getState());
 * });
 *
 * // Later: unsubscribe
 * unsubscribe();
 * ```
 */
class SecureUserManager {
  /** Current active session */
  private currentSession: UserSession | null = null;

  /** Master key for database operations (memory only) */
  private masterKey: string | null = null;

  /** State change listeners */
  private listeners: Set<() => void> = new Set();

  /** Whether the manager has completed initialization */
  private _isReady: boolean = false;

  /** Whether the system is currently locked */
  private _isLocked: boolean = true;

  constructor() {
    // Initialization is deferred to avoid async constructor
  }

  /**
   * Initializes the user manager.
   * Checks for existing database and sets the locked state.
   *
   * @internal
   */
  private async init(): Promise<void> {
    try {
      if (!isCryptoAvailable()) {
        console.error('[SecureUserManager] Web Crypto API not available');
        return;
      }

      const exists = await databaseExists();
      this._isReady = true;
      this._isLocked = exists;

      console.log('[SecureUserManager] Initialized:', {
        databaseExists: exists,
        isLocked: this._isLocked,
      });

      this.notifyListeners();
    } catch (error) {
      console.error('[SecureUserManager] Initialization failed:', error);
    }
  }

  /**
   * Public initialization method.
   * Called automatically during module import.
   */
  async initialize(): Promise<void> {
    await this.init();
  }

  // ==========================================================================
  // State Query Methods
  // ==========================================================================

  /**
   * Checks if an encrypted database exists.
   *
   * @returns {Promise<boolean>} True if database exists
   *
   * @example
   * ```typescript
   * if (await secureUserManager.hasDatabase()) {
   *   // Show login screen
   * } else {
   *   // Show OOBE
   * }
   * ```
   */
  async hasDatabase(): Promise<boolean> {
    return databaseExists();
  }

  /**
   * Checks if the database has any users.
   * Requires the database to be unlocked first.
   *
   * @returns {Promise<boolean>} True if users exist
   */
  async isInitialized(): Promise<boolean> {
    if (!isUnlocked()) return false;
    const stats = getStats();
    return stats.userCount > 0;
  }

  /**
   * Synchronous check for existing database.
   *
   * @returns {boolean} True if database exists (from cached state)
   */
  hasDatabaseSync(): boolean {
    return this._isReady && this._isLocked;
  }

  /**
   * Checks if the system is locked.
   *
   * @returns {boolean} True if authentication is required
   */
  isLocked(): boolean {
    return this._isLocked;
  }

  /**
   * Checks if a user is currently logged in.
   *
   * @returns {boolean} True if there's an active session
   */
  isLoggedIn(): boolean {
    return this.currentSession !== null && !this._isLocked;
  }

  /**
   * Checks if the manager is ready.
   *
   * @returns {boolean} True if initialization is complete
   */
  isReady(): boolean {
    return this._isReady;
  }

  /**
   * Gets the currently authenticated user.
   *
   * @returns {User | null} Current user or null if not logged in
   */
  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  /**
   * Gets the current session.
   *
   * @returns {UserSession | null} Current session or null
   */
  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  // ==========================================================================
  // Database Initialization and Unlock
  // ==========================================================================

  /**
   * Creates the first user during OOBE.
   *
   * This method handles several scenarios:
   * 1. No existing database → Create new database and user
   * 2. Existing locked database with correct password → Unlock and check for user
   * 3. Existing locked database with wrong password → Reset and create new
   *
   * @param {string} username - Desired username
   * @param {string} password - User password
   * @param {Object} [options] - Additional options
   * @param {string} [options.displayName] - Display name for the user
   * @returns {Promise<{success: boolean, user?: User, error?: string}>}
   *
   * @example
   * ```typescript
   * const result = await secureUserManager.createFirstUser('alice', 'secure-password', {
   *   displayName: 'Alice'
   * });
   *
   * if (result.success) {
   *   console.log('Created user:', result.user);
   * }
   * ```
   */
  async createFirstUser(
    username: string,
    password: string,
    options?: {
      displayName?: string;
    }
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    // Validate username
    if (!username || username.length < 1) {
      return { success: false, error: 'Username cannot be empty' };
    }

    if (username.length > 50) {
      return { success: false, error: 'Username is too long (max 50 characters)' };
    }

    // Validate password
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.error };
    }

    try {
      const exists = await databaseExists();

      if (exists) {
        // Database exists - try to unlock with provided password
        console.log('[SecureUserManager] Database exists, attempting to unlock...');
        const unlockResult = await initDatabase(password, false);

        if (unlockResult.success) {
          // Check for existing users
          const stats = getStats();
          if (stats.userCount > 0) {
            // Check if this specific user exists
            const users = querySql<UserRow>(
              'SELECT * FROM users WHERE username = ?',
              [username]
            );

            if (users.length > 0) {
              // User exists - log them in
              this.masterKey = password;
              this.currentSession = {
                user: this.rowToUser(users[0]),
                loginTime: new Date(),
                isTemporary: false,
              };
              this._isLocked = false;
              this.notifyListeners();

              console.log('[SecureUserManager] Existing user logged in');
              return { success: true, user: this.currentSession.user };
            }
          }

          // Database unlocked but no matching user - create user
          console.log('[SecureUserManager] Database unlocked, creating user...');
        } else {
          // Wrong password - delete old database and start fresh
          console.log('[SecureUserManager] Wrong password, resetting database...');
          await deleteDatabase();

          // Create new database
          const result = await initDatabase(password, true);
          if (!result.success) {
            return { success: false, error: result.error };
          }
        }
      } else {
        // No database - create new one
        console.log('[SecureUserManager] Creating new database...');
        const result = await initDatabase(password, true);
        if (!result.success) {
          return { success: false, error: result.error };
        }
      }

      // Hash the password
      const { hash, salt } = await hashPassword(password);

      // Create user record
      const now = new Date().toISOString();
      const permissions = JSON.stringify(this.getDefaultPermissions('root'));

      runSql(
        `INSERT INTO users (
          username, password_hash, password_salt, role, is_root, home_dir,
          permissions, display_name, created_at, is_temporary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          username,
          hash,
          salt,
          'root',
          1,
          '/root',
          permissions,
          options?.displayName || username,
          now,
        ]
      );

      // Persist to storage
      await saveDatabase();

      // Create session
      this.masterKey = password;
      this.currentSession = {
        user: {
          username,
          password: hash,
          role: 'root',
          isRoot: true,
          homeDir: '/root',
          permissions: this.getDefaultPermissions('root'),
          displayName: options?.displayName || username,
          createdAt: new Date(now),
          isTemporary: false,
        },
        loginTime: new Date(),
        isTemporary: false,
      };
      this._isLocked = false;

      this.notifyListeners();

      return { success: true, user: this.currentSession.user };
    } catch (error) {
      console.error('[SecureUserManager] Create first user failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Failed to create user: ${errorMessage}` };
    }
  }

  /**
   * Authenticates a user and unlocks the database.
   *
   * @param {string} username - Username to authenticate
   * @param {string} password - User's password
   * @returns {Promise<LoginResult>} Authentication result
   *
   * @example
   * ```typescript
   * const result = await secureUserManager.login('alice', 'password');
   *
   * if (result.success) {
   *   console.log('Logged in as:', secureUserManager.getCurrentUser()?.displayName);
   * } else {
   *   console.error('Login failed:', result.error);
   * }
   * ```
   */
  async login(username: string, password: string): Promise<LoginResult> {
    console.log('[SecureUserManager] Login attempt for:', username);

    try {
      // Unlock database if needed
      if (!isUnlocked()) {
        console.log('[SecureUserManager] Database locked, attempting to unlock...');
        const result = await initDatabase(password, false);

        if (!result.success) {
          console.log('[SecureUserManager] Failed to unlock database:', result.error);
          return { success: false, error: result.error || 'Invalid password' };
        }

        console.log('[SecureUserManager] Database unlocked');
      }

      // Query user
      const users = querySql<UserRow>(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      if (users.length === 0) {
        console.log('[SecureUserManager] User not found:', username);
        return { success: false, error: 'User not found' };
      }

      const userRow = users[0];

      // Verify password
      const valid = await verifyPassword(password, userRow.password_hash, userRow.password_salt);
      if (!valid) {
        console.log('[SecureUserManager] Invalid password for:', username);
        return { success: false, error: 'Invalid password' };
      }

      // Update last login time
      const now = new Date().toISOString();
      runSql(
        'UPDATE users SET last_login = ? WHERE username = ?',
        [now, username]
      );
      await saveDatabase();

      // Create session
      this.masterKey = password;
      this.currentSession = {
        user: this.rowToUser(userRow),
        loginTime: new Date(),
        isTemporary: false,
      };
      this._isLocked = false;

      // Initialize file system for this user
      try {
        await persistentFileSystem.init();
        persistentFileSystem.setCurrentUser({
          username: this.currentSession.user.username,
          isRoot: this.currentSession.user.role === 'root',
        });
        console.log('[SecureUserManager] File system initialized for:', username);
      } catch (fsError) {
        console.error('[SecureUserManager] File system init failed:', fsError);
      }

      this.notifyListeners();

      console.log('[SecureUserManager] Login successful for:', username);
      return { success: true };
    } catch (error) {
      console.error('[SecureUserManager] Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Logs out the current user and locks the system.
   *
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    this.currentSession = null;
    this.masterKey = null;
    this._isLocked = true;
    closeDatabase();
    this.notifyListeners();
  }

  /**
   * Locks the system without fully logging out.
   * User will need to re-authenticate but session info is preserved.
   */
  lock(): void {
    this._isLocked = true;
    this.masterKey = null;
    this.notifyListeners();
  }

  /**
   * Unlocks the system with the user's password.
   *
   * @param {string} password - User's password
   * @returns {Promise<LoginResult>} Unlock result
   */
  async unlock(password: string): Promise<LoginResult> {
    if (!this.currentSession?.user) {
      return { success: false, error: 'No active session' };
    }

    return this.login(this.currentSession.user.username, password);
  }

  // ==========================================================================
  // User Management
  // ==========================================================================

  /**
   * Gets all users from the database.
   *
   * @returns {Promise<User[]>} Array of users
   */
  async getUsers(): Promise<User[]> {
    if (!isUnlocked()) return [];

    const rows = querySql<UserRow>('SELECT * FROM users');
    return rows.map((r) => this.rowToUser(r));
  }

  /**
   * Gets a specific user by username.
   *
   * @param {string} username - Username to find
   * @returns {Promise<User | null>} User or null if not found
   */
  async getUser(username: string): Promise<User | null> {
    if (!isUnlocked()) return null;

    const rows = querySql<UserRow>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows.length > 0 ? this.rowToUser(rows[0]) : null;
  }

  /**
   * Creates a new user (requires admin privileges).
   *
   * @param {string} username - New user's username
   * @param {string} password - New user's password
   * @param {Object} [options] - User options
   * @returns {Promise<{success: boolean, user?: User, error?: string}>}
   */
  async createUser(
    username: string,
    password: string,
    options?: {
      role?: UserRole;
      permissions?: Permission[];
      displayName?: string;
    }
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.isAdmin()) {
      return { success: false, error: 'Permission denied' };
    }

    if (!username || username.length < 1) {
      return { success: false, error: 'Username cannot be empty' };
    }

    // Check for existing user
    const existing = await this.getUser(username);
    if (existing) {
      return { success: false, error: 'User already exists' };
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.error };
    }

    try {
      const { hash, salt } = await hashPassword(password);
      const role = options?.role || 'user';
      const now = new Date().toISOString();
      const permissions = JSON.stringify(
        options?.permissions || this.getDefaultPermissions(role)
      );
      const homeDir = role === 'root' ? '/root' : `/home/${username}`;

      runSql(
        `INSERT INTO users (
          username, password_hash, password_salt, role, is_root, home_dir,
          permissions, display_name, created_at, is_temporary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          username,
          hash,
          salt,
          role,
          role === 'root' ? 1 : 0,
          homeDir,
          permissions,
          options?.displayName || username,
          now,
        ]
      );

      await saveDatabase();
      this.notifyListeners();

      return { success: true, user: (await this.getUser(username)) || undefined };
    } catch (error) {
      console.error('[SecureUserManager] Create user failed:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  /**
   * Changes the current user's password.
   *
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const user = this.getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not logged in' };
    }

    const rows = querySql<UserRow>(
      'SELECT * FROM users WHERE username = ?',
      [user.username]
    );

    if (rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const userRow = rows[0];

    // Verify old password
    const valid = await verifyPassword(oldPassword, userRow.password_hash, userRow.password_salt);
    if (!valid) {
      return { success: false, error: 'Invalid old password' };
    }

    // Validate new password
    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.error };
    }

    try {
      const { hash, salt } = await hashPassword(newPassword);

      runSql(
        'UPDATE users SET password_hash = ?, password_salt = ? WHERE username = ?',
        [hash, salt, user.username]
      );

      await saveDatabase();
      this.masterKey = newPassword;

      return { success: true };
    } catch (error) {
      console.error('[SecureUserManager] Change password failed:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  /**
   * Updates the current user's display name.
   *
   * @param {string} displayName - New display name
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateDisplayName(displayName: string): Promise<{ success: boolean; error?: string }> {
    const user = this.getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not logged in' };
    }

    runSql(
      'UPDATE users SET display_name = ? WHERE username = ?',
      [displayName, user.username]
    );

    await saveDatabase();

    if (this.currentSession) {
      this.currentSession.user.displayName = displayName;
    }

    this.notifyListeners();
    return { success: true };
  }

  /**
   * Deletes a user (cannot delete self or root).
   *
   * @param {string} username - Username to delete
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteUser(username: string): Promise<{ success: boolean; error?: string }> {
    if (this.currentSession?.user.username === username) {
      return { success: false, error: 'Cannot delete current user' };
    }

    const user = await this.getUser(username);
    if (user?.role === 'root') {
      return { success: false, error: 'Cannot delete root user' };
    }

    try {
      runSql('DELETE FROM users WHERE username = ?', [username]);
      await saveDatabase();
      this.notifyListeners();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete user' };
    }
  }

  // ==========================================================================
  // Encrypted Data Storage
  // ==========================================================================

  /**
   * Saves encrypted data to the vault.
   *
   * @param {string} key - Storage key
   * @param {string} data - Data to store
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async saveEncryptedData(
    key: string,
    data: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isUnlocked()) {
      return { success: false, error: 'Database is locked' };
    }

    try {
      const now = new Date().toISOString();

      // Check for existing entry
      const existing = querySql('SELECT key FROM vault WHERE key = ?', [key]);

      if (existing.length > 0) {
        runSql(
          'UPDATE vault SET encrypted_data = ?, updated_at = ? WHERE key = ?',
          [data, now, key]
        );
      } else {
        runSql(
          'INSERT INTO vault (key, encrypted_data, iv, salt, category, updated_at) VALUES (?, ?, "", "", "user-data", ?)',
          [key, data, now]
        );
      }

      await saveDatabase();
      return { success: true };
    } catch (error) {
      console.error('[SecureUserManager] Save encrypted data failed:', error);
      return { success: false, error: 'Failed to save data' };
    }
  }

  /**
   * Retrieves encrypted data from the vault.
   *
   * @param {string} key - Storage key
   * @returns {Promise<string | null>} Stored data or null
   */
  async getEncryptedData(key: string): Promise<string | null> {
    if (!isUnlocked()) return null;

    try {
      const rows = querySql<{ encrypted_data: string }>(
        'SELECT encrypted_data FROM vault WHERE key = ?',
        [key]
      );
      return rows.length > 0 ? rows[0].encrypted_data : null;
    } catch {
      return null;
    }
  }

  // ==========================================================================
  // Permission Checks
  // ==========================================================================

  /**
   * Checks if current user is an admin.
   *
   * @returns {boolean} True if user has admin role
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'root' || user?.role === 'admin';
  }

  /**
   * Checks if current user is root.
   *
   * @returns {boolean} True if user is root
   */
  isRoot(): boolean {
    return this.getCurrentUser()?.role === 'root';
  }

  /**
   * Checks if current user has a specific permission.
   *
   * @param {Permission} permission - Permission to check
   * @returns {boolean} True if user has permission
   */
  hasPermission(permission: Permission): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'root') return true;
    return user.permissions.includes(permission);
  }

  // ==========================================================================
  // System Reset
  // ==========================================================================

  /**
   * Resets the entire system (root only).
   *
   * @param {string} password - Root password for verification
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async resetSystem(password: string): Promise<{ success: boolean; error?: string }> {
    const user = this.getCurrentUser();
    if (!user || user.role !== 'root') {
      return { success: false, error: 'Permission denied' };
    }

    // Verify password
    const rows = querySql<UserRow>(
      'SELECT * FROM users WHERE username = ?',
      [user.username]
    );

    if (rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const valid = await verifyPassword(password, rows[0].password_hash, rows[0].password_salt);
    if (!valid) {
      return { success: false, error: 'Invalid password' };
    }

    try {
      await deleteDatabase();

      this.currentSession = null;
      this.masterKey = null;
      this._isLocked = true;

      this.notifyListeners();

      return { success: true };
    } catch (error) {
      console.error('[SecureUserManager] Reset failed:', error);
      return { success: false, error: 'Reset failed' };
    }
  }

  /**
   * Force resets the system (development mode).
   * No password verification required.
   *
   * @returns {Promise<void>}
   */
  async resetAndReinit(): Promise<void> {
    try {
      await deleteDatabase();
    } catch {
      // Ignore errors
    }

    this.currentSession = null;
    this.masterKey = null;
    this._isReady = true;
    this._isLocked = true;

    this.notifyListeners();
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * Converts a database row to a User object.
   *
   * @param {UserRow} row - Database row
   * @returns {User} User object
   *
   * @internal
   */
  private rowToUser(row: UserRow): User {
    return {
      username: row.username,
      password: row.password_hash,
      role: row.role as UserRole,
      isRoot: row.is_root === 1,
      homeDir: row.home_dir,
      permissions: JSON.parse(row.permissions || '[]'),
      displayName: row.display_name,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      lastLogin: row.last_login ? new Date(row.last_login) : undefined,
      isTemporary: row.is_temporary === 1,
      temporaryReason: row.temporary_reason || undefined,
    };
  }

  /**
   * Gets default permissions for a role.
   *
   * @param {UserRole} role - User role
   * @returns {Permission[]} Default permissions
   *
   * @internal
   */
  private getDefaultPermissions(role: UserRole): Permission[] {
    const permissionSets: Record<UserRole, Permission[]> = {
      root: [
        'read:files',
        'write:files',
        'delete:files',
        'read:settings',
        'write:settings',
        'read:users',
        'write:users',
        'delete:users',
        'execute:commands',
        'admin:system',
      ],
      admin: [
        'read:files',
        'write:files',
        'delete:files',
        'read:settings',
        'write:settings',
        'read:users',
        'write:users',
        'execute:commands',
      ],
      user: ['read:files', 'write:files', 'read:settings', 'execute:commands'],
      guest: ['read:files', 'read:settings'],
    };
    return permissionSets[role] || permissionSets.user;
  }

  /**
   * Validates a password.
   *
   * @param {string} password - Password to validate
   * @returns {{valid: boolean, error?: string}} Validation result
   *
   * @internal
   */
  private validatePassword(password: string): { valid: boolean; error?: string } {
    if (!password || password.length === 0) {
      return { valid: false, error: 'Password cannot be empty' };
    }
    if (password.length > 256) {
      return { valid: false, error: 'Password is too long' };
    }
    return { valid: true };
  }

  // ==========================================================================
  // Event System
  // ==========================================================================

  /**
   * Subscribes to state changes.
   *
   * @param {() => void} callback - Callback function
   * @returns {() => void} Unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = secureUserManager.subscribe(() => {
   *   if (secureUserManager.isLoggedIn()) {
   *     console.log('User logged in');
   *   }
   * });
   *
   * // Later
   * unsubscribe();
   * ```
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notifies all listeners of a state change.
   *
   * @internal
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback();
      } catch (e) {
        console.error('[SecureUserManager] Listener error:', e);
      }
    });
  }

  // ==========================================================================
  // Public State Access
  // ==========================================================================

  /**
   * Gets the current state of the manager.
   *
   * @returns {SecureUserManagerState} Current state
   */
  getState(): SecureUserManagerState {
    return {
      isInitialized: this._isReady,
      isLocked: this._isLocked,
      hasUsers: isUnlocked(),
      currentUser: this.currentSession?.user || null,
    };
  }

  /**
   * Gets the list of users for the lock screen.
   * Excludes root user by default for security.
   *
   * @param {boolean} [includeRoot=false] - Whether to include root user
   * @returns {Promise<Array<{username: string, displayName: string, role: string, isRoot: boolean}>>}
   *
   * @example
   * ```typescript
   * // Get non-root users for login screen
   * const users = await secureUserManager.getUserList();
   *
   * // Include root for admin operations
   * const allUsers = await secureUserManager.getUserList(true);
   * ```
   */
  async getUserList(includeRoot: boolean = false): Promise<
    Array<{
      username: string;
      displayName: string;
      role: string;
      isRoot: boolean;
    }>
  > {
    if (!isUnlocked()) return [];

    const whereClause = includeRoot
      ? 'WHERE is_temporary = 0'
      : 'WHERE is_temporary = 0 AND is_root = 0';

    const rows = querySql<UserRow>(
      `SELECT username, display_name, role, is_root FROM users ${whereClause}`
    );

    return rows.map((u) => ({
      username: u.username,
      displayName: u.display_name,
      role: u.role,
      isRoot: u.is_root === 1,
    }));
  }

  /**
   * Gets the total count of non-temporary users.
   *
   * @returns {Promise<number>} User count
   */
  async getTotalUserCount(): Promise<number> {
    if (!isUnlocked()) return 0;

    const rows = querySql<{ count: number }>(
      'SELECT COUNT(*) as count FROM users WHERE is_temporary = 0'
    );
    return rows[0]?.count || 0;
  }

  /**
   * Checks if a root user exists.
   *
   * @returns {Promise<boolean>} True if root user exists
   */
  async hasRootUser(): Promise<boolean> {
    if (!isUnlocked()) return false;

    const rows = querySql<{ count: number }>(
      'SELECT COUNT(*) as count FROM users WHERE is_root = 1 AND is_temporary = 0'
    );
    return (rows[0]?.count || 0) > 0;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Singleton instance of SecureUserManager.
 * Use this for all user management operations.
 */
export const secureUserManager = new SecureUserManager();

// Auto-initialize
secureUserManager.initialize();
