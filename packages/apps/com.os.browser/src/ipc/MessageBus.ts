/**
 * IPC Message Bus - 进程间通信消息总线
 * 
 * 基于EventTarget实现的进程间通信，确保消息序列化传输
 */

import type { IPCMessage, ProcessType } from './messages';

type MessageHandler = (message: IPCMessage) => void;

interface PendingRequest {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

/**
 * IPC消息总线
 * 模拟进程间通信，使用EventTarget作为底层传输
 */
export class IPCBus extends EventTarget {
  private static instance: IPCBus;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private requestTimeout: number = 30000;
  private messageIdCounter: number = 0;

  private constructor() {
    super();
  }

  static getInstance(): IPCBus {
    if (!IPCBus.instance) {
      IPCBus.instance = new IPCBus();
    }
    return IPCBus.instance;
  }

  /**
   * 生成唯一消息ID
   */
  generateId(): string {
    return `msg_${Date.now()}_${++this.messageIdCounter}`;
  }

  /**
   * 发送消息（不等待响应）
   */
  send(message: IPCMessage): void {
    // 确保消息可序列化
    try {
      JSON.stringify(message);
    } catch (e) {
      console.error('[IPC] Message is not serializable:', message, e);
      throw new Error('Message must be serializable');
    }

    // 派发自定义事件
    const event = new CustomEvent('ipc-message', { 
      detail: message,
      bubbles: false,
      cancelable: false
    });
    
    this.dispatchEvent(event);

    // 同时派发特定类型的消息事件
    const typeEvent = new CustomEvent(`ipc-${message.type}`, {
      detail: message,
      bubbles: false,
      cancelable: false
    });
    this.dispatchEvent(typeEvent);
  }

  /**
   * 发送消息并等待响应
   */
  async sendAndWait<T = unknown>(message: IPCMessage): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = message.id || this.generateId();
      message.id = id;

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`IPC request timeout: ${message.type}`));
      }, this.requestTimeout);

      this.pendingRequests.set(id, {
        resolve: resolve as (result: unknown) => void,
        reject,
        timeout
      });

      this.send(message);
    });
  }

  /**
   * 响应消息
   */
  respond(requestId: string, response: unknown): void {
    const pending = this.pendingRequests.get(requestId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(requestId);
      pending.resolve(response);
    }
  }

  /**
   * 响应错误
   */
  respondError(requestId: string, error: Error): void {
    const pending = this.pendingRequests.get(requestId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(requestId);
      pending.reject(error);
    }
  }

  /**
   * 注册消息处理器
   */
  on(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // 创建事件监听器
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<IPCMessage>;
      handler(customEvent.detail);
    };

    this.addEventListener(`ipc-${type}`, listener);

    // 返回取消订阅函数
    return () => {
      this.handlers.get(type)?.delete(handler);
      this.removeEventListener(`ipc-${type}`, listener);
    };
  }

  /**
   * 注册一次性消息处理器
   */
  once(type: string, handler: MessageHandler): () => void {
    let unsubscribe: (() => void) | null = null;
    
    const wrappedHandler = (message: IPCMessage) => {
      if (unsubscribe) {
        unsubscribe();
      }
      handler(message);
    };

    unsubscribe = this.on(type, wrappedHandler);
    return unsubscribe;
  }

  /**
   * 取消所有订阅
   */
  clear(): void {
    this.handlers.clear();
    this.pendingRequests.forEach((pending) => {
      clearTimeout(pending.timeout);
    });
    this.pendingRequests.clear();
  }
}

// 导出单例
export const ipcBus = IPCBus.getInstance();
