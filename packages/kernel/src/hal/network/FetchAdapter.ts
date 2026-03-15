/**
 * @fileoverview Fetch API network adapter implementation
 * @module @kernel/hal/network
 * 
 * Provides a network adapter using the browser's Fetch API.
 * Supports streaming, interceptors, and various request options.
 */

import { NetworkAdapter } from './NetworkAdapter';
import type {
  NetworkCapabilities,
  NetworkRequestOptions,
  NetworkResponse,
  NetworkConnection,
  NetworkConnectionOptions,
  NetworkAdapterOptions,
  NetworkProgressEvent,
} from './types';
import { NetworkError, NetworkTimeoutError, NetworkConnectionError } from './types';

/**
 * Fetch adapter options
 */
export interface FetchAdapterOptions extends NetworkAdapterOptions {
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
 * Network adapter implementation using the Fetch API
 * 
 * @example
 * ```typescript
 * const network = new FetchAdapter({
 *   baseURL: 'https://api.example.com',
 *   defaultHeaders: { 'Content-Type': 'application/json' }
 * });
 * 
 * await network.init();
 * const response = await network.get('/users');
 * const data = await response.json();
 * ```
 */
export class FetchAdapter extends NetworkAdapter {
  readonly name = 'fetch-adapter';

  /**
   * Storage capabilities for Fetch API
   */
  readonly capabilities: NetworkCapabilities = {
    supported: true,
    realtime: false, // Fetch doesn't support WebSocket
    p2p: false,
    streaming: true,
    interceptors: true,
    maxConnections: Infinity,
    online: navigator.onLine,
  };

  /**
   * Enable retry on failure
   */
  private readonly _retry: boolean;

  /**
   * Maximum retry attempts
   */
  private readonly _maxRetries: number;

  /**
   * Retry delay in milliseconds
   */
  private readonly _retryDelay: number;

  /**
   * Active abort controllers for cancellation
   */
  private _activeControllers: Map<string, AbortController> = new Map();

  /**
   * Create a new Fetch adapter
   * @param options - Adapter options
   */
  constructor(options: FetchAdapterOptions = {}) {
    super(options);
    this._retry = options.retry ?? false;
    this._maxRetries = options.maxRetries ?? 3;
    this._retryDelay = options.retryDelay ?? 1000;
  }

  /**
   * Make an HTTP request
   * @param url - Request URL
   * @param options - Request options
   */
  async request(
    url: string,
    options: NetworkRequestOptions = {}
  ): Promise<NetworkResponse> {
    this._ensureInitialized();

    const fullURL = this._buildURL(url);
    const timeout = options.timeout ?? this._defaultTimeout;

    return this._executeWithRetry(async () => {
      return this._executeRequest(fullURL, options, timeout);
    });
  }

  /**
   * Open a real-time connection
   * Note: Fetch adapter doesn't support WebSocket connections
   * @param url - Connection URL
   * @param options - Connection options
   */
  async connect(
    url: string,
    _options?: NetworkConnectionOptions
  ): Promise<NetworkConnection> {
    throw new NetworkConnectionError(
      'Fetch adapter does not support real-time connections. Use a WebSocket adapter instead.',
      url
    );
  }

  /**
   * Cancel all pending requests
   */
  cancelAll(): void {
    this._activeControllers.forEach((controller, id) => {
      controller.abort();
      this._log(`Cancelled request: ${id}`);
    });
    this._activeControllers.clear();
  }

  /**
   * Cancel a specific request
   * @param requestId - Request ID to cancel
   */
  cancel(requestId: string): boolean {
    const controller = this._activeControllers.get(requestId);
    if (controller) {
      controller.abort();
      this._activeControllers.delete(requestId);
      this._log(`Cancelled request: ${requestId}`);
      return true;
    }
    return false;
  }

  /**
   * Execute a request with retry logic
   * @param fn - Request function
   */
  private async _executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    if (!this._retry) {
      return fn();
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this._maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on timeout or abort
        if (
          lastError instanceof NetworkTimeoutError ||
          lastError.name === 'AbortError'
        ) {
          throw lastError;
        }

        this._log(`Request attempt ${attempt} failed:`, lastError.message);

        if (attempt < this._maxRetries) {
          await this._delay(this._retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute a single request
   * @param url - Full URL
   * @param options - Request options
   * @param timeout - Timeout in milliseconds
   */
  private async _executeRequest(
    url: string,
    options: NetworkRequestOptions,
    timeout: number
  ): Promise<NetworkResponse> {
    // Create abort controller
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const controller = new AbortController();
    this._activeControllers.set(requestId, controller);

    // Create timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      // Build request
      const headers = this._buildHeaders(options.headers);
      const requestInit: RequestInit = {
        method: options.method ?? 'GET',
        headers,
        body: options.body,
        mode: options.mode,
        credentials: options.credentials,
        cache: options.cache,
        redirect: options.redirect,
        referrerPolicy: options.referrerPolicy,
        signal: options.signal
          ? this._combineSignals(controller.signal, options.signal)
          : controller.signal,
      };

      let request = new Request(url, requestInit);

      // Apply request interceptors
      request = await this._applyRequestInterceptors(request);

      this._log(`${request.method} ${url}`);

      // Execute request
      const startTime = performance.now();
      let response = await fetch(request);
      const duration = performance.now() - startTime;

      // Apply response interceptors
      response = await this._applyResponseInterceptors(response, request);

      this._log(`${request.method} ${url} -> ${response.status} (${duration.toFixed(2)}ms)`);

      // Check for success
      if (!response.ok) {
        throw new NetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          url,
          response.status
        );
      }

      return this._createNetworkResponse(response);
    } catch (error) {
      if (error instanceof NetworkError) {
        throw error;
      }

      const err = error instanceof Error ? error : new Error(String(error));

      if (err.name === 'AbortError') {
        throw new NetworkTimeoutError(url, timeout);
      }

      throw new NetworkError(`Request failed: ${err.message}`, url, undefined, err);
    } finally {
      clearTimeout(timeoutId);
      this._activeControllers.delete(requestId);
    }
  }

  /**
   * Combine multiple abort signals
   * @param signals - Signals to combine
   */
  private _combineSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener('abort', () => controller.abort());
    }

    return controller.signal;
  }

  /**
   * Create a NetworkResponse from a Fetch Response
   * @param response - Fetch Response
   */
  private _createNetworkResponse(response: Response): NetworkResponse {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      ok: response.ok,
      url: response.url,
      type: response.type as NetworkResponse['type'],
      text: () => response.text(),
      json: <T>() => response.json() as Promise<T>,
      arrayBuffer: () => response.arrayBuffer(),
      blob: () => response.blob(),
      formData: () => response.formData(),
    };
  }

  /**
   * Ensure the adapter is initialized
   * @throws {NetworkError} If not initialized
   */
  private _ensureInitialized(): void {
    if (!this._initialized) {
      throw new NetworkError('Network adapter not initialized', '');
    }
  }

  /**
   * Implementation-specific destruction
   */
  protected async _doDestroy(): Promise<void> {
    await super._doDestroy();
    this.cancelAll();
  }

  /**
   * Check if Fetch API is available
   */
  static isAvailable(): boolean {
    return typeof fetch === 'function';
  }
}
