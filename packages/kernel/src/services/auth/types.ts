/**
 * @fileoverview Auth Types
 * @module @kernel/services/auth/types
 */

import type { UserRole } from '@kernel/executive/types';

export type { UserRole };

export interface CreateUserOptions {
  displayName?: string;
  role?: UserRole;
  homeDir?: string;
  password: string;
}
