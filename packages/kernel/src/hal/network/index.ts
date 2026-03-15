/**
 * @fileoverview Network adapter exports
 * @module @kernel/hal/network
 * 
 * Provides network adapters for HTTP requests and real-time connections in the WebOS kernel.
 */

// Types
export type {
  NetworkCapabilities,
  NetworkAdapterInterface,
  NetworkRequestOptions,
  NetworkResponse,
  NetworkConnection,
  NetworkConnectionState,
  NetworkConnectionOptions,
  NetworkEvent,
  NetworkEventType,
  NetworkEventData,
  NetworkConnectionEvent,
  NetworkMessageEvent,
  NetworkErrorEvent,
  NetworkStateEvent,
  NetworkProgressEvent,
  RequestInterceptor,
  ResponseInterceptor,
  NetworkAdapterOptions,
  FetchAdapterOptions,
} from './types';

// Errors
export {
  NetworkError,
  NetworkTimeoutError,
  NetworkConnectionError,
} from './types';

// Base class
export { NetworkAdapter } from './NetworkAdapter';

// Implementations
export { FetchAdapter } from './FetchAdapter';
