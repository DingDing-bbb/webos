/**
 * @fileoverview Services Layer Types
 * @module @kernel/services/types
 */

/**
 * Base service interface
 */
export interface IService {
  readonly name: string;
  readonly version: string;
  
  init(): Promise<void>;
  destroy(): Promise<void>;
  isReady(): boolean;
}

/**
 * Service status
 */
export type ServiceStatus = 
  | 'stopped'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'error';

/**
 * Service information
 */
export interface ServiceInfo {
  name: string;
  version: string;
  status: ServiceStatus;
  uptime: number;
  error?: string;
}

/**
 * Service manager interface
 */
export interface IServiceManager {
  register(service: IService): void;
  unregister(name: string): boolean;
  get(name: string): IService | null;
  getAll(): IService[];
  init(name: string): Promise<void>;
  destroy(name: string): Promise<void>;
  initAll(): Promise<void>;
  destroyAll(): Promise<void>;
}

/**
 * Event handler type
 */
export type ServiceEventHandler<T = unknown> = (event: T) => void;

/**
 * Subscription
 */
export type Subscription = () => void;
