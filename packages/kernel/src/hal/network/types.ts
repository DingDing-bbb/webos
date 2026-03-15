/**
 * @fileoverview Network adapter types and interfaces
 * @module @kernel/hal/network
 * 
 * Provides type definitions for network adapters that abstract browser
 * networking APIs (Fetch, WebSocket, WebRTC).
 */

import type { HALAdapter, AdapterCapabilities, HALEvent, HALEventEmitter } from '../types';

/**
 * Describes the capabilities of a network adapter
 */
export interface NetworkCapabilities extends AdapterCapabilities {
  /**
   * Whether real-time connections (WebSocket) are supported
   */
  realtime: boolean;

  /**
   * Whether peer-to-peer connections (WebRTC) are supported
   */
  p2p: boolean;

  /**
   * Whether streaming responses are supported
   */
  streaming: boolean;

  /**
   * Whether request/response interceptors are supported
   */
  interceptors: boolean;

  /**
   * Maximum concurrent connections
   */
  maxConnections: number;

  /**
   * Whether the network is currently online
   */
  online: boolean;
}

/**
 * Network request options
 */
export interface NetworkRequestOptions {
  /**
   * HTTP method
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

  /**
   * Request headers
   */
  headers?: Record<string, string>;

  /**
   * Request body
   */
  body?: string | ArrayBuffer | FormData | URLSearchParams | Blob;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;

  /**
   * CORS mode
   */
  mode?: 'cors' | 'no-cors' | 'same-origin';

  /**
   * Credentials mode
   */
  credentials?: 'include' | 'same-origin' | 'omit';

  /**
   * Cache mode
   */
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';

  /**
   * Redirect mode
   */
  redirect?: 'follow' | 'error' | 'manual';

  /**
   * Referrer policy
   */
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 
    'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 
    'strict-origin-when-cross-origin' | 'unsafe-url';

  /**
   * Abort signal for cancellation
   */
  signal?: AbortSignal;

  /**
   * Progress callback
   */
  onProgress?: (event: NetworkProgressEvent) => void;
}

/**
 * Network response wrapper
 */
export interface NetworkResponse {
  /**
   * Response status code
   */
  status: number;

  /**
   * Response status text
   */
  statusText: string;

  /**
   * Response headers
   */
  headers: Record<string, string>;

  /**
   * Whether the response was successful (status 200-299)
   */
  ok: boolean;

  /**
   * Response URL (after redirects)
   */
  url: string;

  /**
   * Response type
   */
  type: 'basic' | 'cors' | 'default' | 'error' | 'opaque' | 'opaqueredirect';

  /**
   * Get response as text
   */
  text(): Promise<string>;

  /**
   * Get response as JSON
   */
  json<T = unknown>(): Promise<T>;

  /**
   * Get response as ArrayBuffer
   */
  arrayBuffer(): Promise<ArrayBuffer>;

  /**
   * Get response as Blob
   */
  blob(): Promise<Blob>;

  /**
   * Get response as FormData
   */
  formData(): Promise<FormData>;
}

/**
 * Network connection state
 */
export type NetworkConnectionState = 
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'disconnected'
  | 'error';

/**
 * Network connection options
 */
export interface NetworkConnectionOptions {
  /**
   * Connection protocols
   */
  protocols?: string[];

  /**
   * Connection timeout in milliseconds
   */
  timeout?: number;

  /**
   * Reconnect on disconnect
   */
  autoReconnect?: boolean;

  /**
   * Maximum reconnect attempts
   */
  maxReconnectAttempts?: number;

  /**
   * Reconnect delay in milliseconds
   */
  reconnectDelay?: number;

  /**
   * Binary message format
   */
  binaryType?: 'blob' | 'arraybuffer';
}

/**
 * Network connection interface
 */
export interface NetworkConnection {
  /**
   * Connection ID
   */
  readonly id: string;

  /**
   * Connection URL
   */
  readonly url: string;

  /**
   * Current connection state
   */
  readonly state: NetworkConnectionState;

  /**
   * Event emitter for connection events
   */
  readonly events: HALEventEmitter<NetworkEventData>;

  /**
   * Send data through the connection
   * @param data - Data to send
   */
  send(data: string | ArrayBuffer | Blob): void;

  /**
   * Close the connection
   * @param code - Close code
   * @param reason - Close reason
   */
  close(code?: number, reason?: string): void;

  /**
   * Wait for connection to be established
   */
  waitForConnection(): Promise<void>;
}

/**
 * Network event types
 */
export type NetworkEventType = 
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'message'
  | 'reconnecting'
  | 'online'
  | 'offline';

/**
 * Network event data union type
 */
export type NetworkEventData = 
  | NetworkConnectionEvent
  | NetworkMessageEvent
  | NetworkErrorEvent
  | NetworkStateEvent;

/**
 * Network event interface
 */
export interface NetworkEvent<T = unknown> extends HALEvent<T> {
  type: NetworkEventType;
}

/**
 * Connection state event
 */
export interface NetworkConnectionEvent {
  state: NetworkConnectionState;
  url?: string;
}

/**
 * Network message event
 */
export interface NetworkMessageEvent {
  data: string | ArrayBuffer | Blob;
  origin: string;
  timestamp: number;
}

/**
 * Network error event
 */
export interface NetworkErrorEvent {
  error: Error;
  code?: number;
  reason?: string;
}

/**
 * Network state change event
 */
export interface NetworkStateEvent {
  online: boolean;
  connectionType?: string;
  downlink?: number;
  rtt?: number;
}

/**
 * Network progress event for uploads/downloads
 */
export interface NetworkProgressEvent {
  /**
   * Bytes transferred
   */
  loaded: number;

  /**
   * Total bytes (if known)
   */
  total?: number;

  /**
   * Progress percentage (0-100)
   */
  percent?: number;

  /**
   * Transfer direction
   */
  direction: 'upload' | 'download';

  /**
   * Transfer rate in bytes per second
   */
  rate?: number;
}

/**
 * Request interceptor function
 */
export type RequestInterceptor = (
  request: Request
) => Request | Promise<Request>;

/**
 * Response interceptor function
 */
export type ResponseInterceptor = (
  response: Response,
  request: Request
) => Response | Promise<Response>;

/**
 * Network adapter interface
 */
export interface NetworkAdapterInterface extends HALAdapter {
  /**
   * Network adapter capabilities
   */
  readonly capabilities: NetworkCapabilities;

  /**
   * Event emitter for network events
   */
  readonly events: HALEventEmitter<NetworkEventData>;

  /**
   * Make an HTTP request
   * @param url - Request URL
   * @param options - Request options
   */
  request(url: string, options?: NetworkRequestOptions): Promise<NetworkResponse>;

  /**
   * Make a GET request
   * @param url - Request URL
   * @param options - Request options
   */
  get(url: string, options?: Omit<NetworkRequestOptions, 'method' | 'body'>): Promise<NetworkResponse>;

  /**
   * Make a POST request
   * @param url - Request URL
   * @param body - Request body
   * @param options - Request options
   */
  post(url: string, body?: NetworkRequestOptions['body'], options?: Omit<NetworkRequestOptions, 'method'>): Promise<NetworkResponse>;

  /**
   * Make a PUT request
   * @param url - Request URL
   * @param body - Request body
   * @param options - Request options
   */
  put(url: string, body?: NetworkRequestOptions['body'], options?: Omit<NetworkRequestOptions, 'method'>): Promise<NetworkResponse>;

  /**
   * Make a DELETE request
   * @param url - Request URL
   * @param options - Request options
   */
  delete(url: string, options?: Omit<NetworkRequestOptions, 'method' | 'body'>): Promise<NetworkResponse>;

  /**
   * Open a real-time connection
   * @param url - Connection URL
   * @param options - Connection options
   */
  connect(url: string, options?: NetworkConnectionOptions): Promise<NetworkConnection>;

  /**
   * Check if currently online
   */
  isOnline(): boolean;

  /**
   * Add a request interceptor
   * @param interceptor - Interceptor function
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void;

  /**
   * Add a response interceptor
   * @param interceptor - Interceptor function
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void;

  /**
   * Remove a request interceptor
   * @param interceptor - Interceptor function
   */
  removeRequestInterceptor(interceptor: RequestInterceptor): void;

  /**
   * Remove a response interceptor
   * @param interceptor - Interceptor function
   */
  removeResponseInterceptor(interceptor: ResponseInterceptor): void;
}

/**
 * Network adapter options
 */
export interface NetworkAdapterOptions {
  /**
   * Default request timeout in milliseconds
   */
  defaultTimeout?: number;

  /**
   * Base URL for relative requests
   */
  baseURL?: string;

  /**
   * Default headers for all requests
   */
  defaultHeaders?: Record<string, string>;

  /**
   * Enable debug logging
   */
  debug?: boolean;

  /**
   * Maximum concurrent connections
   */
  maxConnections?: number;

  /**
   * Enable automatic retry on failure
   */
  retry?: boolean;

  /**
   * Maximum retry attempts
   */
  maxRetries?: number;

  /**
   * Retry delay in milliseconds
   */
  retryDelay?: number;
}

/**
 * Error thrown when a network operation fails
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly url: string,
    public readonly statusCode?: number,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Error thrown when a network request times out
 */
export class NetworkTimeoutError extends NetworkError {
  constructor(
    url: string,
    public readonly timeout: number
  ) {
    super(`Request timed out after ${timeout}ms`, url);
    this.name = 'NetworkTimeoutError';
  }
}

/**
 * Error thrown when a connection fails
 */
export class NetworkConnectionError extends NetworkError {
  constructor(
    message: string,
    url: string,
    public readonly code?: number,
    public readonly reason?: string
  ) {
    super(message, url);
    this.name = 'NetworkConnectionError';
  }
}
