/**
 * @fileoverview Security Manager - Authentication and Authorization
 * @module @kernel/executive/security/SecurityManager
 */

import type { SecurityToken, UserRole, Permission, ACL } from '../types';

/**
 * SecurityManager handles authentication and authorization.
 */
export class SecurityManager {
  private currentToken: SecurityToken | null = null;
  private tokens = new Map<string, SecurityToken>();
  
  /**
   * Create a security token
   */
  createToken(options: {
    userId: string;
    userName: string;
    displayName: string;
    role: UserRole;
    groups?: string[];
    privileges?: string[];
    sessionId: string;
    expiresAt?: Date;
  }): SecurityToken {
    const tokenId = this.generateTokenId();
    const token: SecurityToken = {
      tokenId,
      userId: options.userId,
      userName: options.userName,
      displayName: options.displayName,
      role: options.role,
      groups: options.groups ?? [],
      privileges: options.privileges ?? this.getDefaultPrivileges(options.role),
      sessionId: options.sessionId,
      createdAt: new Date(),
      expiresAt: options.expiresAt,
    };
    
    this.tokens.set(tokenId, token);
    return token;
  }
  
  /**
   * Set current security context
   */
  setToken(token: SecurityToken | null): void {
    this.currentToken = token;
  }
  
  /**
   * Get current security context
   */
  getToken(): SecurityToken | null {
    return this.currentToken;
  }
  
  /**
   * Check if current user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentToken !== null;
  }
  
  /**
   * Check if current user has a role
   */
  hasRole(role: UserRole): boolean {
    if (!this.currentToken) return false;
    return this.currentToken.role === role;
  }
  
  /**
   * Check if current user is root
   */
  isRoot(): boolean {
    return this.hasRole('root');
  }
  
  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('root') || this.hasRole('admin');
  }
  
  /**
   * Check if current user has a privilege
   */
  hasPrivilege(privilege: string): boolean {
    if (!this.currentToken) return false;
    return this.currentToken.privileges.includes(privilege);
  }
  
  /**
   * Check access against ACL
   */
  checkAccess(acl: ACL, access: 'read' | 'write' | 'execute'): boolean {
    if (!this.currentToken) return false;
    
    // Root has all access
    if (this.currentToken.role === 'root') return true;
    
    // Check owner access
    if (acl.owner === this.currentToken.userId) {
      const mode = acl.mode;
      const ownerBits = mode.substring(0, 3);
      return this.checkModeBits(ownerBits, access);
    }
    
    // Check group access
    if (this.currentToken.groups.includes(acl.group)) {
      const mode = acl.mode;
      const groupBits = mode.substring(3, 6);
      return this.checkModeBits(groupBits, access);
    }
    
    // Check other access
    const otherBits = acl.mode.substring(6, 9);
    return this.checkModeBits(otherBits, access);
  }
  
  /**
   * Check mode bits
   */
  private checkModeBits(bits: string, access: 'read' | 'write' | 'execute'): boolean {
    switch (access) {
      case 'read':
        return bits[0] === 'r';
      case 'write':
        return bits[1] === 'w';
      case 'execute':
        return bits[2] === 'x';
      default:
        return false;
    }
  }
  
  /**
   * Get default privileges for role
   */
  private getDefaultPrivileges(role: UserRole): string[] {
    const privileges: Record<UserRole, string[]> = {
      root: [
        'read:files', 'write:files', 'delete:files',
        'read:settings', 'write:settings',
        'read:users', 'write:users', 'delete:users',
        'execute:commands', 'admin:system',
      ],
      admin: [
        'read:files', 'write:files', 'delete:files',
        'read:settings', 'write:settings',
        'read:users', 'write:users',
        'execute:commands',
      ],
      user: [
        'read:files', 'write:files',
        'read:settings',
        'execute:commands',
      ],
      guest: [
        'read:files',
        'read:settings',
      ],
    };
    return privileges[role] ?? [];
  }
  
  /**
   * Generate unique token ID
   */
  private generateTokenId(): string {
    return `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * Invalidate a token
   */
  invalidateToken(tokenId: string): boolean {
    return this.tokens.delete(tokenId);
  }
  
  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.tokens.clear();
    this.currentToken = null;
  }
}

// Singleton instance
export const securityManager = new SecurityManager();
