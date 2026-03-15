/**
 * @fileoverview I/O Types
 * @module @kernel/executive/io/types
 */

import type { Handle } from '../types';

/**
 * Major I/O functions
 */
export type MajorFunction = 
  | 'CREATE'
  | 'CLOSE'
  | 'READ'
  | 'WRITE'
  | 'DEVICE_CONTROL'
  | 'INTERNAL_DEVICE_CONTROL'
  | 'SHUTDOWN'
  | 'FLUSH_BUFFERS'
  | 'QUERY_INFORMATION'
  | 'SET_INFORMATION';

/**
 * Device types
 */
export type DeviceType = 
  | 'FILE_SYSTEM'
  | 'DISK'
  | 'NETWORK'
  | 'SERIAL'
  | 'PARALLEL'
  | 'DISPLAY'
  | 'KEYBOARD'
  | 'MOUSE'
  | 'AUDIO';

/**
 * I/O status block
 */
export interface IOStatusBlock {
  status: number;
  information: number;
}

/**
 * File information classes
 */
export type FileInformationClass = 
  | 'FileBasicInformation'
  | 'FileStandardInformation'
  | 'FileNameInformation'
  | 'FilePositionInformation'
  | 'FileAllocationInformation'
  | 'FileEndOfFileInformation';
