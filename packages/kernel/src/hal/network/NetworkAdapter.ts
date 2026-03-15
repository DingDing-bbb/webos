/**
 * @fileoverview Abstract base class for network adapters
 * @module @kernel/hal/network
 * 
 * Provides the foundation for all network adapter implementations,
 * defining common interfaces and shared functionality.
 */

import type {
  NetworkAdapterInterface,
  NetworkCapabilities,
  NetworkRequestOptions,
  NetworkResponse,
  NetworkConnection,
  NetworkConnectionOptions,
  NetworkEventData,
  RequestInterceptor,
  ResponseInterceptor,
  NetworkAdapterOptions,
} from './types';

import type { HALEventEmitter, EventSubscription, HALEventHandler } from '../types';
import { HALInitializationError, HALEvent } from '../types';

/**
 * Simple event emitter implementation for network events
 */
class NetworkEventEmitter implements HALEventEmitter<NetworkEventData> {
  private _handlers: Set<HALEventHandler<NetworkEventData>> = new Set();
  private _onceHandlers: Set<HALEventHandler<NetworkEventData>> = new Set();
  private _idCounter = 0;

  subscribe(handler: HALEventHandler<NetworkEventData>): EventSubscription {
    this._handlers.add(handler);
    const id = `network-sub-${++this._idCounter}`;
    return {
      id,
      dispose: () => this._handlers.delete(handler),
    };
  }

  on(handler: HALEventHandler<NetworkEventData>): EventSubscription {
    return this.subscribe(handler);
  }

  once(handler: HALEventHandler<NetworkEventData>): EventSubscription {
    this._onceHandlers.add(handler);
    const id = `network-once-${++this._idCounter}`;
    return {
      id,
      dispose: () => this._onceHandlers.delete(handler),
    };
  }

  unsubscribe(handler: HALEventHandler<NetworkEventData>): void {
    this._handlers.delete(handler);
    this._onceHandlers.delete(handler);
  }

  off(handler: HALEventHandler<NetworkEventData>): void {
    this.unsubscribe(handler);
  }

  emit(event: HALEvent<NetworkEventData>): void {
    // Call regular handlers
    this._handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('Network event handler error:', error);
      }
    });

    // Call and remove once handlers
    this._onceHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('Network event handler error:', error);
      }
    });
    this._onceHandlers.clear();
  }

  subscriberCount(): number {
    return this._handlers.size + this._onceHandlers.size;
  }
}

/**
 * Abstract base class for network adapters
 * 
 * Network adapters provide a unified interface for making HTTP requests
 * and managing real-time connections across different browser networking APIs.
 * 
 * @example
 * ```typescript
 * class MyNetworkAdapter extends NetworkAdapter {
 *   // Implement abstract methods
 *   async request(url: string, options?: NetworkRequestOptions): Promise<NetworkResponse> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export abstract class NetworkAdapter implements NetworkAdapterInterface {
  /**
   * Unique name identifier for this adapter
   */
  abstract readonly name: string;

  /**
   * Network adapter capabilities
   */
  abstract readonly capabilities: NetworkCapabilities;

  /**
   * Event emitter for network events
   */
  readonly events: HALEventEmitter<NetworkEventData> = new NetworkEventEmitter();

  /**
   * Whether the adapter is initialized
   */
  protected _initialized = false;

  /**
   * Debug mode flag
   */
  protected readonly _debug: boolean;

  /**
   * Default request timeout
   */
  protected readonly _defaultTimeout: number;

  /**
   * Base URL for relative requests
   */
  protected readonly _baseURL?: string;

  /**
   * Default headers
   */
  protected readonly _defaultHeaders: Record<string, string>;

  /**
   * Request interceptors
   */
  protected _requestInterceptors: RequestInterceptor[] = [];

  /**
   * Response interceptors
   */
  protected _responseInterceptors: ResponseInterceptor[] = [];

  /**
   * Create a new network adapter
   * @param options - Adapter options
   */
  constructor(options: NetworkAdapterOptions = {}) {
    this._debug = options.debug ?? false;
    this._defaultTimeout = options.defaultTimeout ?? 30000;
    this._baseURL = options.baseURL;
    this._defaultHeaders = options.defaultHeaders ?? {};
  }

  /**
   * Initialize the network adapter
   * @throws {HALInitializationError} If initialization fails
   */
  async init(): Promise<void> {
    if (this._initialized) {
      this._log('Already initialized');
      return;
    }

    try {
      await this._doInit();
      this._initialized = true;
      this._setupNetworkListeners();
      this._log('Initialized successfully');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new HALInitializationError(
        `Failed to initialize network adapter: ${err.message}`,
        this.name,
        err
      );
    }
  }

  /**
   * Destroy the adapter and release resources
   */
  async destroy(): Promise<void> {
    if (!this._initialized) {
      return;
    }

    try {
      await this._doDestroy();
      this._initialized = false;
      this._log('Destroyed successfully');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this._log('Error during destroy:', err.message);
      throw err;
    }
  }

  /**
   * Check if the adapter is initialized
   */
  isReady(): boolean {
    return this._initialized;
  }

  /**
   * Make an HTTP request
   * @param url - Request URL
   * @param options - Request options
   */
  abstract request(url: string, options?: NetworkRequestOptions): Promise<NetworkResponse>;

  /**
   * Make a GET request
   * @param url - Request URL
   * @param options - Request options
   */
  async get(
    url: string,
    options?: Omit<NetworkRequestOptions, 'method' | 'body'>
  ): Promise<NetworkResponse> {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   * @param url - Request URL
   * @param body - Request body
   * @param options - Request options
   */
  async post(
    url: string,
    body?: NetworkRequestOptions['body'],
    options?: Omit<NetworkRequestOptions, 'method'>
  ): Promise<NetworkResponse> {
    return this.request(url, { ...options, method: 'POST', body });
  }

  /**
   * Make a PUT request
   * @param url - Request URL
   * @param body - Request body
   * @param options - Request options
   */
  async put(
    url: string,
    body?: NetworkRequestOptions['body'],
    options?: Omit<NetworkRequestOptions, 'method'>
  ): Promise<NetworkResponse> {
    return this.request(url, { ...options, method: 'PUT', body });
  }

  /**
   * Make a DELETE request
   * @param url - Request URL
   * @param options - Request options
   */
  async delete(
    url: string,
    options?: Omit<NetworkRequestOptions, 'method' | 'body'>
  ): Promise<NetworkResponse> {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * Open a real-time connection
   * @param url - Connection URL
   * @param options - Connection options
   */
  abstract connect(
    url: string,
    options?: NetworkConnectionOptions
  ): Promise<NetworkConnection>;

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Add a request interceptor
   * @param interceptor - Interceptor function
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this._requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   * @param interceptor - Interceptor function
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this._responseInterceptors.push(interceptor);
  }

  /**
   * Remove a request interceptor
   * @param interceptor - Interceptor function
   */
  removeRequestInterceptor(interceptor: RequestInterceptor): void {
    const index = this._requestInterceptors.indexOf(interceptor);
    if (index !== -1) {
      this._requestInterceptors.splice(index, 1);
    }
  }

  /**
   * Remove a response interceptor
   * @param interceptor - Interceptor function
   */
  removeResponseInterceptor(interceptor: ResponseInterceptor): void {
    const index = this._responseInterceptors.indexOf(interceptor);
    if (index !== -1) {
      this._responseInterceptors.splice(index, 1);
    }
  }

  /**
   * Build a full URL from base URL and path
   * @param url - URL or path
   */
  protected _buildURL(url: string): string {
    if (this._baseURL && !url.startsWith('http://') && !url.startsWith('https://')) {
      return new URL(url, this._baseURL).toString();
    }
    return url;
  }

  /**
   * Build headers with defaults
   * @param headers - Custom headers
   */
  protected _buildHeaders(headers?: Record<string, string>): Record<string, string> {
    return {
      ...this._defaultHeaders,
      ...headers,
    };
  }

  /**
   * Apply request interceptors
   * @param request - Original request
   */
  protected async _applyRequestInterceptors(request: Request): Promise<Request> {
    let modifiedRequest = request;
    for (const interceptor of this._requestInterceptors) {
      modifiedRequest = await interceptor(modifiedRequest);
    }
    return modifiedRequest;
  }

  /**
   * Apply response interceptors
   * @param response - Original response
   * @param request - Original request
   */
  protected async _applyResponseInterceptors(
    response: Response,
    request: Request
  ): Promise<Response> {
    let modifiedResponse = response;
    for (const interceptor of this._responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse, request);
    }
    return modifiedResponse;
  }

  /**
   * Emit a network event
   * @param type - Event type
   * @param data - Event data
   */
  protected _emitEvent(type: string, data: NetworkEventData): void {
    const event: HALEvent<NetworkEventData> = {
      type,
      timestamp: Date.now(),
      data,
      source: this.name,
    };
    this.events.emit(event);
  }

  /**
   * Setup network connectivity listeners
   */
  protected _setupNetworkListeners(): void {
    window.addEventListener('online', this._handleOnline);
    window.addEventListener('offline', this._handleOffline);
  }

  /**
   * Remove network connectivity listeners
   */
  protected _removeNetworkListeners(): void {
    window.removeEventListener('online', this._handleOnline);
    window.removeEventListener('offline', this._handleOffline);
  }

  /**
   * Handle online event
   */
  private _handleOnline = (): void => {
    this._log('Network online');
    this._emitEvent('online', { online: true });
  };

  /**
   * Handle offline event
   */
  private _handleOffline = (): void => {
    this._log('Network offline');
    this._emitEvent('offline', { online: false });
  };

  /**
   * Log debug messages
   * @param args - Arguments to log
   */
  protected _log(...args: unknown[]): void {
    if (this._debug) {
      console.log(`[${this.name}]`, ...args);
    }
  }

  /**
   * Delay execution
   * @param ms - Milliseconds to delay
   */
  protected _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Implementation-specific initialization
   */
  protected async _doInit(): Promise<void> {
    // Override in subclasses if needed
  }

  /**
   * Implementation-specific destruction
   */
  protected async _doDestroy(): Promise<void> {
    this._removeNetworkListeners();
  }

  /**
   * Check if the network API is available
   */
  static isAvailable(): boolean {
    // Override in subclasses
    return false;
  }
}
