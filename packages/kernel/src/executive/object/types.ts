/**
 * @fileoverview Object Types
 * @module @kernel/executive/object/types
 */

import type { Handle, KernelObjectType } from '../types';

/**
 * Re-export from parent
 */
export type { Handle, KernelObjectType } from '../types';

/**
 * Object attribute flags
 */
export type ObjectAttribute = 
  | 'permanent'      // Object won't be deleted on close
  | 'exclusive'      // Object can only be opened once
  | 'inherit'        // Handle inherited by child processes
  ;

/**
 * Object information
 */
export interface ObjectInfo {
  handle: Handle;
  type: KernelObjectType;
  name?: string;
  refCount: number;
  attributes: ObjectAttribute[];
  createdAt: Date;
}
