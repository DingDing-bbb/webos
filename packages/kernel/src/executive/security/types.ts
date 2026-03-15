/**
 * @fileoverview Security Types
 * @module @kernel/executive/security/types
 */

import type { UserRole, Permission, ACL as BaseACL } from '../types';

/**
 * Re-export from parent
 */
export type { UserRole, Permission } from '../types';

/**
 * Security context for current execution
 */
export interface SecurityContext {
  token: SecurityToken | null;
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  role: UserRole | null;
  groups: string[];
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean;
  token?: SecurityToken;
  error?: string;
}

/**
 * Authorization request
 */
export interface AuthzRequest {
  resource: string;
  action: 'read' | 'write' | 'execute' | 'delete';
  context?: Record<string, unknown>;
}

/**
 * Authorization decision
 */
export interface AuthzDecision {
  allowed: boolean;
  reason?: string;
  conditions?: Record<string, unknown>;
}
