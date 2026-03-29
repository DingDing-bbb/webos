// 错误处理系统 - 应用级错误弹窗 + 系统级蓝屏恢复

export type ErrorLevel = 'app' | 'system';

export interface AppError {
  id: string;
  code: string;
  message: string;
  details?: string;
  appId?: string;
  windowId?: string;
  timestamp: Date;
  stack?: string;
  recovered: boolean;
}

export interface SystemError {
  id: string;
  code: string;
  message: string;
  details?: string;
  source?: string;
  line?: number;
  column?: number;
  timestamp: Date;
  stack?: string;
}

interface ErrorState {
  appErrors: AppError[];
  systemErrors: SystemError[];
  systemErrorCount: number;
  lastSystemErrorTime: number | null;
  isInBlueScreen: boolean;
}

// 错误代码定义
export const ErrorCodes = {
  // 应用错误 (1xxx)
  APP_CRASH: 'ERR_1001',
  APP_TIMEOUT: 'ERR_1002',
  APP_MEMORY: 'ERR_1003',
  APP_PERMISSION: 'ERR_1004',
  APP_NOT_FOUND: 'ERR_1005',
  APP_DEPENDENCY: 'ERR_1006',

  // 系统错误 (2xxx)
  KERNEL_PANIC: 'ERR_2001',
  MEMORY_EXHAUSTED: 'ERR_2002',
  STORAGE_FULL: 'ERR_2003',
  SERVICE_CRASH: 'ERR_2004',
  RENDER_FAILURE: 'ERR_2005',
  CRITICAL_MODULE: 'ERR_2006',

  // 文件系统错误 (3xxx)
  FS_CORRUPTED: 'ERR_3001',
  FS_PERMISSION: 'ERR_3002',
  FS_NOT_FOUND: 'ERR_3003',

  // 网络错误 (4xxx)
  NETWORK_OFFLINE: 'ERR_4001',
  NETWORK_TIMEOUT: 'ERR_4002',
} as const;

// 系统错误阈值配置
const SYSTEM_ERROR_THRESHOLD = 3; // 连续错误次数
const ERROR_WINDOW_MS = 60000; // 1分钟内的错误计数窗口

class ErrorHandler {
  private state: ErrorState = {
    appErrors: [],
    systemErrors: [],
    systemErrorCount: 0,
    lastSystemErrorTime: null,
    isInBlueScreen: false,
  };

  private listeners: Set<(state: ErrorState) => void> = new Set();
  private errorIdCounter = 0;
  private blueScreenCallback: (() => void) | null = null;
  private recoveryCallback: (() => void) | null = null;

  subscribe(listener: (state: ErrorState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.getState()));
  }

  getState(): ErrorState {
    return { ...this.state };
  }

  setCallbacks(blueScreen: () => void, recovery: () => void) {
    this.blueScreenCallback = blueScreen;
    this.recoveryCallback = recovery;
  }

  // 生成错误 ID
  private generateErrorId(): string {
    return `err_${Date.now()}_${++this.errorIdCounter}`;
  }

  // 报告应用级错误
  reportAppError(
    message: string,
    options?: {
      details?: string;
      appId?: string;
      windowId?: string;
      stack?: string;
    }
  ): AppError {
    const error: AppError = {
      id: this.generateErrorId(),
      code: options?.appId
        ? `${ErrorCodes.APP_CRASH}_${options.appId.slice(0, 8).toUpperCase()}`
        : ErrorCodes.APP_CRASH,
      message,
      details: options?.details,
      appId: options?.appId,
      windowId: options?.windowId,
      timestamp: new Date(),
      stack: options?.stack,
      recovered: false,
    };

    this.state.appErrors.push(error);

    // 保持最近 50 条应用错误
    if (this.state.appErrors.length > 50) {
      this.state.appErrors.shift();
    }

    this.notify();

    // 派发事件给 UI
    window.dispatchEvent(
      new CustomEvent('webos:app-error', {
        detail: error,
      })
    );

    console.error(`[App Error] ${error.code}: ${error.message}`);

    return error;
  }

  // 报告系统级错误
  reportSystemError(
    message: string,
    options?: {
      details?: string;
      code?: string;
      source?: string;
      line?: number;
      column?: number;
      stack?: string;
    }
  ): SystemError {
    const now = Date.now();

    // 检查是否在错误窗口内
    if (this.state.lastSystemErrorTime && now - this.state.lastSystemErrorTime < ERROR_WINDOW_MS) {
      this.state.systemErrorCount++;
    } else {
      // 超出窗口，重置计数
      this.state.systemErrorCount = 1;
    }

    this.state.lastSystemErrorTime = now;

    const error: SystemError = {
      id: this.generateErrorId(),
      code: options?.code || ErrorCodes.KERNEL_PANIC,
      message,
      details: options?.details,
      source: options?.source,
      line: options?.line,
      column: options?.column,
      timestamp: new Date(),
      stack: options?.stack,
    };

    this.state.systemErrors.push(error);

    // 保持最近 20 条系统错误
    if (this.state.systemErrors.length > 20) {
      this.state.systemErrors.shift();
    }

    console.error(
      `[System Error] ${error.code}: ${error.message} (count: ${this.state.systemErrorCount})`
    );

    // 检查是否需要进入蓝屏
    if (this.state.systemErrorCount >= SYSTEM_ERROR_THRESHOLD) {
      this.triggerBlueScreen(error);
    }

    this.notify();
    return error;
  }

  // 触发蓝屏
  private triggerBlueScreen(latestError: SystemError) {
    if (this.state.isInBlueScreen) return;

    this.state.isInBlueScreen = true;
    this.notify();

    console.error(
      `[BLUE SCREEN] System halted due to ${SYSTEM_ERROR_THRESHOLD} consecutive errors`
    );

    // 派发蓝屏事件
    window.dispatchEvent(
      new CustomEvent('webos:blue-screen', {
        detail: {
          error: latestError,
          errorCount: this.state.systemErrorCount,
          allErrors: this.state.systemErrors,
        },
      })
    );

    // 调用蓝屏回调
    this.blueScreenCallback?.();
  }

  // 从蓝屏恢复
  recoverFromBlueScreen(): boolean {
    if (!this.state.isInBlueScreen) return false;

    // 重置状态
    this.state.systemErrorCount = 0;
    this.state.lastSystemErrorTime = null;
    this.state.isInBlueScreen = false;

    this.recoveryCallback?.();
    this.notify();

    return true;
  }

  // 标记应用错误已恢复
  markAppErrorRecovered(errorId: string) {
    const error = this.state.appErrors.find((e) => e.id === errorId);
    if (error) {
      error.recovered = true;
      this.notify();
    }
  }

  // 清除错误历史
  clearErrors(level?: ErrorLevel) {
    if (!level || level === 'app') {
      this.state.appErrors = [];
    }
    if (!level || level === 'system') {
      this.state.systemErrors = [];
      this.state.systemErrorCount = 0;
      this.state.lastSystemErrorTime = null;
    }
    this.notify();
  }

  // 获取错误摘要
  getErrorSummary(): {
    totalAppErrors: number;
    totalSystemErrors: number;
    unrecoveredAppErrors: number;
    recentSystemErrors: SystemError[];
  } {
    return {
      totalAppErrors: this.state.appErrors.length,
      totalSystemErrors: this.state.systemErrors.length,
      unrecoveredAppErrors: this.state.appErrors.filter((e) => !e.recovered).length,
      recentSystemErrors: this.state.systemErrors.slice(-5),
    };
  }

  // 判断是否是致命错误
  isFatalError(error: SystemError): boolean {
    const fatalCodes = [
      ErrorCodes.KERNEL_PANIC,
      ErrorCodes.MEMORY_EXHAUSTED,
      ErrorCodes.CRITICAL_MODULE,
    ];
    return fatalCodes.includes(error.code as (typeof fatalCodes)[number]);
  }
}

// 单例
export const errorHandler = new ErrorHandler();

// 应用错误包装器 - 用于包裹应用入口
// 注意：React ErrorBoundary 实现应该在 UI 层
export function wrapAppWithErrorHandler(appId: string): {
  componentDidCatch: (error: Error, errorInfo: { componentStack?: string }) => void;
} {
  return {
    componentDidCatch: (error: Error, errorInfo: { componentStack?: string }) => {
      errorHandler.reportAppError(error.message, {
        details: errorInfo.componentStack,
        appId,
        stack: error.stack,
      });
    },
  };
}

// 创建一个简单的 React ErrorBoundary 类组件辅助函数
export function createErrorBoundary(appId: string): {
  componentDidCatch: (error: Error, errorInfo: { componentStack?: string }) => void;
} {
  return {
    componentDidCatch: (error: Error, errorInfo: { componentStack?: string }) => {
      errorHandler.reportAppError(error.message, {
        details: errorInfo.componentStack,
        appId,
        stack: error.stack,
      });
    },
  };
}

export default errorHandler;
