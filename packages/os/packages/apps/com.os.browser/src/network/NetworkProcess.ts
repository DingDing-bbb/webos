/**
 * Network Process - 网络进程
 * 
 * 处理所有网络请求，包括HTTP/HTTPS、重定向、缓存、Cookie
 * 基于Fetch API实现
 */

import { ipcBus } from '../ipc/MessageBus';
import type { 
  NetworkRequestLog, 
  FetchRequestMessage, 
  FetchResponseMessage,
  FetchErrorMessage,
  ResourceLoadedMessage,
  IPCMessage 
} from '../ipc/messages';

interface CacheEntry {
  response: Response;
  body: string;
  contentType: string;
  timestamp: number;
  maxAge: number;
}

interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

/**
 * Network Process - 网络进程
 * 单例模式
 */
export class NetworkProcess {
  private static instance: NetworkProcess;
  
  private cache: Map<string, CacheEntry> = new Map();
  private cookies: Map<string, Cookie[]> = new Map();
  private requestLog: NetworkRequestLog[] = [];
  private activeRequests: Map<string, AbortController> = new Map();
  private unsubscribers: (() => void)[] = [];
  
  private maxCacheSize: number = 100;
  private maxLogSize: number = 1000;
  private defaultUserAgent: string = 'WebOS/1.0 Browser';

  private constructor() {
    this.init();
  }

  static getInstance(): NetworkProcess {
    if (!NetworkProcess.instance) {
      NetworkProcess.instance = new NetworkProcess();
    }
    return NetworkProcess.instance;
  }

  private init(): void {
    // 监听fetch请求
    this.unsubscribers.push(
      ipcBus.on('network:fetch-request', this.handleFetchRequest.bind(this))
    );
    
    // 监听取消请求
    this.unsubscribers.push(
      ipcBus.on('network:cancel-request', this.handleCancelRequest.bind(this))
    );

    // 监听清除缓存
    this.unsubscribers.push(
      ipcBus.on('network:clear-cache', this.handleClearCache.bind(this))
    );

    // 监听清除Cookie
    this.unsubscribers.push(
      ipcBus.on('network:clear-cookies', this.handleClearCookies.bind(this))
    );

    // 监听获取网络日志
    this.unsubscribers.push(
      ipcBus.on('devtools:get-network-log', this.handleGetNetworkLog.bind(this))
    );

    // 监听清除网络日志
    this.unsubscribers.push(
      ipcBus.on('devtools:clear-network-log', this.handleClearNetworkLog.bind(this))
    );
  }

  /**
   * 处理fetch请求
   */
  private async handleFetchRequest(message: IPCMessage): Promise<void> {
    const request = message as FetchRequestMessage;
    const { requestId, url, method, headers, body } = request;
    
    const startTime = Date.now();
    const requestLog: NetworkRequestLog = {
      id: requestId,
      url,
      method,
      headers,
      requestBody: body,
      status: 0,
      statusText: '',
      responseHeaders: {},
      startTime,
      endTime: 0,
      duration: 0,
      resourceType: this.getResourceType(url),
      size: 0
    };

    try {
      // 检查缓存
      const cacheKey = this.getCacheKey(url, method, headers);
      const cached = this.getFromCache(cacheKey);
      
      if (cached && method === 'GET') {
        requestLog.status = 200;
        requestLog.statusText = 'OK (Cached)';
        requestLog.endTime = Date.now();
        requestLog.duration = requestLog.endTime - startTime;
        requestLog.size = cached.body.length;
        this.addRequestLog(requestLog);

        ipcBus.send({
          id: ipcBus.generateId(),
          type: 'network:fetch-response',
          from: 'network',
          to: 'renderer',
          tabId: message.tabId,
          timestamp: Date.now(),
          requestId,
          status: 200,
          statusText: 'OK (Cached)',
          headers: {},
          body: cached.body,
          contentType: cached.contentType
        } as FetchResponseMessage);
        return;
      }

      // 添加Cookie到请求头
      const cookies = this.getCookiesForUrl(url);
      if (cookies.length > 0) {
        headers['Cookie'] = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      }

      // 添加User-Agent
      if (!headers['User-Agent']) {
        headers['User-Agent'] = this.defaultUserAgent;
      }

      // 创建AbortController
      const abortController = new AbortController();
      this.activeRequests.set(requestId, abortController);

      // 发起请求
      const response = await fetch(url, {
        method,
        headers,
        body: body ? body : undefined,
        signal: abortController.signal,
        mode: 'cors',
        credentials: 'include'
      });

      // 移除AbortController
      this.activeRequests.delete(requestId);

      // 读取响应
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const contentType = responseHeaders['content-type'] || 'text/plain';
      let responseBody: string;

      // 根据Content-Type处理响应
      if (contentType.includes('image/')) {
        // 图片转base64
        const blob = await response.blob();
        responseBody = await this.blobToBase64(blob);
      } else {
        // 文本内容
        responseBody = await response.text();
      }

      // 更新请求日志
      requestLog.status = response.status;
      requestLog.statusText = response.statusText;
      requestLog.responseHeaders = responseHeaders;
      requestLog.responseBody = responseBody.substring(0, 10000); // 限制日志大小
      requestLog.endTime = Date.now();
      requestLog.duration = requestLog.endTime - startTime;
      requestLog.size = responseBody.length;
      this.addRequestLog(requestLog);

      // 保存Cookie
      const setCookie = responseHeaders['set-cookie'];
      if (setCookie) {
        this.setCookiesFromHeader(url, setCookie);
      }

      // 缓存GET请求
      if (method === 'GET' && response.status === 200) {
        const maxAge = this.getMaxAge(responseHeaders);
        if (maxAge > 0) {
          this.addToCache(cacheKey, response, responseBody, contentType, maxAge);
        }
      }

      // 发送响应
      ipcBus.send({
        id: ipcBus.generateId(),
        type: 'network:fetch-response',
        from: 'network',
        to: 'renderer',
        tabId: message.tabId,
        timestamp: Date.now(),
        requestId,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        contentType
      } as FetchResponseMessage);

      // 发送资源加载完成通知
      ipcBus.send({
        id: ipcBus.generateId(),
        type: 'network:resource-loaded',
        from: 'network',
        to: 'browser',
        tabId: message.tabId,
        timestamp: Date.now(),
        requestId,
        resourceType: this.getResourceType(url),
        url,
        size: responseBody.length,
        duration: requestLog.duration,
        status: response.status
      } as ResourceLoadedMessage);

    } catch (error: unknown) {
      const err = error as Error;
      
      // 更新请求日志
      requestLog.status = 0;
      requestLog.statusText = 'Error';
      requestLog.endTime = Date.now();
      requestLog.duration = requestLog.endTime - startTime;
      this.addRequestLog(requestLog);

      // 移除AbortController
      this.activeRequests.delete(requestId);

      // 发送错误
      ipcBus.send({
        id: ipcBus.generateId(),
        type: 'network:fetch-error',
        from: 'network',
        to: 'renderer',
        tabId: message.tabId,
        timestamp: Date.now(),
        requestId,
        error: err.message
      } as FetchErrorMessage);
    }
  }

  /**
   * 取消请求
   */
  private handleCancelRequest(message: IPCMessage): void {
    const { requestId } = message as { requestId: string };
    const controller = this.activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * 清除缓存
   */
  private handleClearCache(): void {
    this.cache.clear();
  }

  /**
   * 清除Cookie
   */
  private handleClearCookies(): void {
    this.cookies.clear();
  }

  /**
   * 获取网络日志
   */
  private handleGetNetworkLog(message: IPCMessage): void {
    ipcBus.respond(message.id!, this.requestLog);
  }

  /**
   * 清除网络日志
   */
  private handleClearNetworkLog(): void {
    this.requestLog = [];
  }

  /**
   * 获取资源类型
   */
  private getResourceType(url: string): NetworkRequestLog['resourceType'] {
    const path = url.split('?')[0].toLowerCase();
    
    if (path.endsWith('.css')) return 'stylesheet';
    if (path.endsWith('.js')) return 'script';
    if (/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(path)) return 'image';
    if (/\.(woff|woff2|ttf|otf|eot)$/i.test(path)) return 'font';
    if (/\.(html|htm)$/i.test(path) || !path.includes('.')) return 'document';
    
    return 'other';
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(url: string, method: string, headers: Record<string, string>): string {
    return `${method}:${url}:${JSON.stringify(headers)}`;
  }

  /**
   * 从缓存获取
   */
  private getFromCache(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.maxAge * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    return entry;
  }

  /**
   * 添加到缓存
   */
  private addToCache(key: string, response: Response, body: string, contentType: string, maxAge: number): void {
    // 检查缓存大小
    if (this.cache.size >= this.maxCacheSize) {
      // 删除最旧的条目
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      response,
      body,
      contentType,
      timestamp: Date.now(),
      maxAge
    });
  }

  /**
   * 获取缓存控制max-age
   */
  private getMaxAge(headers: Record<string, string>): number {
    const cacheControl = headers['cache-control'] || '';
    const match = cacheControl.match(/max-age=(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0;
  }

  /**
   * 获取URL对应的Cookie
   */
  private getCookiesForUrl(url: string): Cookie[] {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    const cookies: Cookie[] = [];
    
    this.cookies.forEach((domainCookies, cookieDomain) => {
      if (domain.endsWith(cookieDomain) || cookieDomain.endsWith(domain)) {
        domainCookies.forEach(cookie => {
          if (path.startsWith(cookie.path)) {
            if (!cookie.secure || urlObj.protocol === 'https:') {
              cookies.push(cookie);
            }
          }
        });
      }
    });
    
    return cookies;
  }

  /**
   * 从Set-Cookie头设置Cookie
   */
  private setCookiesFromHeader(url: string, setCookie: string): void {
    const urlObj = new URL(url);
    const defaultDomain = urlObj.hostname;
    
    const cookieStrings = setCookie.split(',').map(s => s.trim());
    
    cookieStrings.forEach(cookieStr => {
      const parts = cookieStr.split(';').map(s => s.trim());
      const [nameValue, ...attributes] = parts;
      const [name, value] = nameValue.split('=');
      
      const cookie: Cookie = {
        name,
        value: value || '',
        domain: defaultDomain,
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax'
      };
      
      attributes.forEach(attr => {
        const [attrName, attrValue] = attr.split('=');
        switch (attrName.toLowerCase()) {
          case 'domain':
            cookie.domain = attrValue || defaultDomain;
            break;
          case 'path':
            cookie.path = attrValue || '/';
            break;
          case 'expires':
            cookie.expires = new Date(attrValue).getTime();
            break;
          case 'max-age':
            cookie.expires = Date.now() + parseInt(attrValue, 10) * 1000;
            break;
          case 'httponly':
            cookie.httpOnly = true;
            break;
          case 'secure':
            cookie.secure = true;
            break;
          case 'samesite':
            cookie.sameSite = (attrValue as 'Strict' | 'Lax' | 'None') || 'Lax';
            break;
        }
      });
      
      // 保存Cookie
      if (!this.cookies.has(cookie.domain)) {
        this.cookies.set(cookie.domain, []);
      }
      
      const domainCookies = this.cookies.get(cookie.domain)!;
      const existingIndex = domainCookies.findIndex(c => c.name === cookie.name);
      
      if (existingIndex >= 0) {
        domainCookies[existingIndex] = cookie;
      } else {
        domainCookies.push(cookie);
      }
    });
  }

  /**
   * Blob转Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 添加请求日志
   */
  private addRequestLog(log: NetworkRequestLog): void {
    this.requestLog.push(log);
    
    // 限制日志大小
    if (this.requestLog.length > this.maxLogSize) {
      this.requestLog.shift();
    }
  }

  /**
   * 获取请求日志
   */
  getRequestLog(): NetworkRequestLog[] {
    return [...this.requestLog];
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.activeRequests.forEach(controller => controller.abort());
    this.activeRequests.clear();
  }
}

// 导出单例
export const networkProcess = NetworkProcess.getInstance();
