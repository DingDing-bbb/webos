/**
 * @fileoverview Notify Types
 * @module @kernel/services/notify/types
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationPosition {
  x: number;
  y: number;
}

export interface NotificationOptions {
  type?: NotificationType;
  duration?: number;
  persistent?: boolean;
}
