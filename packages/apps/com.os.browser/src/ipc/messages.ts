/**
 * IPC Message Types - 进程间通信消息类型定义
 * 
 * 所有消息必须序列化为普通对象，不允许传递函数引用或共享状态
 */

// ============================================
// 基础消息类型
// ============================================

export type ProcessType = 'browser' | 'network' | 'renderer' | 'gpu';

export interface BaseMessage {
  id: string;
  type: string;
  from: ProcessType;
  to: ProcessType | ProcessType[];
  tabId?: string;
  timestamp: number;
}

// ============================================
// Browser -> Renderer 消息
// ============================================

export interface NavigateMessage extends BaseMessage {
  type: 'browser:navigate';
  url: string;
}

export interface ExecuteScriptMessage extends BaseMessage {
  type: 'browser:execute-script';
  script: string;
}

export interface ReloadMessage extends BaseMessage {
  type: 'browser:reload';
  ignoreCache?: boolean;
}

export interface StopLoadingMessage extends BaseMessage {
  type: 'browser:stop-loading';
}

export interface GoBackMessage extends BaseMessage {
  type: 'browser:go-back';
}

export interface GoForwardMessage extends BaseMessage {
  type: 'browser:go-forward';
}

export interface MouseEventMessage extends BaseMessage {
  type: 'browser:mouse-event';
  eventType: 'click' | 'mousedown' | 'mouseup' | 'mousemove';
  x: number;
  y: number;
  button: number;
}

export interface KeyEventMessage extends BaseMessage {
  type: 'browser:key-event';
  eventType: 'keydown' | 'keyup' | 'keypress';
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface ScrollEventMessage extends BaseMessage {
  type: 'browser:scroll-event';
  deltaX: number;
  deltaY: number;
}

export interface ResizeEventMessage extends BaseMessage {
  type: 'browser:resize-event';
  width: number;
  height: number;
}

// ============================================
// Renderer -> Browser 消息
// ============================================

export interface ReadyMessage extends BaseMessage {
  type: 'renderer:ready';
}

export interface TitleChangedMessage extends BaseMessage {
  type: 'renderer:title-changed';
  title: string;
}

export interface URLChangedMessage extends BaseMessage {
  type: 'renderer:url-changed';
  url: string;
}

export interface LoadStartedMessage extends BaseMessage {
  type: 'renderer:load-started';
  url: string;
}

export interface LoadFinishedMessage extends BaseMessage {
  type: 'renderer:load-finished';
  url: string;
  success: boolean;
  error?: string;
}

export interface PaintReadyMessage extends BaseMessage {
  type: 'renderer:paint-ready';
  commands: PaintCommand[];
  width: number;
  height: number;
}

export interface DOMUpdatedMessage extends BaseMessage {
  type: 'renderer:dom-updated';
  domTree: SerializedDOMTree;
}

export interface ConsoleMessage extends BaseMessage {
  type: 'renderer:console';
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  args: unknown[];
}

export interface ScriptResultMessage extends BaseMessage {
  type: 'renderer:script-result';
  resultId: string;
  result: unknown;
  error?: string;
}

// ============================================
// Network 进程消息
// ============================================

export interface FetchRequestMessage extends BaseMessage {
  type: 'network:fetch-request';
  requestId: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export interface FetchResponseMessage extends BaseMessage {
  type: 'network:fetch-response';
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
}

export interface FetchErrorMessage extends BaseMessage {
  type: 'network:fetch-error';
  requestId: string;
  error: string;
}

export interface ResourceLoadedMessage extends BaseMessage {
  type: 'network:resource-loaded';
  requestId: string;
  resourceType: 'document' | 'stylesheet' | 'script' | 'image' | 'font' | 'other';
  url: string;
  size: number;
  duration: number;
  status: number;
}

// ============================================
// DevTools 消息
// ============================================

export interface GetDOMTreeMessage extends BaseMessage {
  type: 'devtools:get-dom-tree';
}

export interface GetComputedStyleMessage extends BaseMessage {
  type: 'devtools:get-computed-style';
  nodeId: string;
}

export interface SetStyleMessage extends BaseMessage {
  type: 'devtools:set-style';
  nodeId: string;
  property: string;
  value: string;
}

export interface GetNetworkLogMessage extends BaseMessage {
  type: 'devtools:get-network-log';
}

export interface ClearNetworkLogMessage extends BaseMessage {
  type: 'devtools:clear-network-log';
}

export interface ExecuteConsoleMessage extends BaseMessage {
  type: 'devtools:execute-console';
  script: string;
}

// ============================================
// 绘制命令
// ============================================

export type PaintCommand = 
  | { type: 'fillRect'; x: number; y: number; w: number; h: number; color: string }
  | { type: 'strokeRect'; x: number; y: number; w: number; h: number; color: string; width: number }
  | { type: 'fillText'; text: string; x: number; y: number; font: string; color: string; maxWidth?: number }
  | { type: 'drawImage'; imageId: string; x: number; y: number; w: number; h: number; sx?: number; sy?: number; sw?: number; sh?: number }
  | { type: 'clip'; path: string }
  | { type: 'save' }
  | { type: 'restore' }
  | { type: 'translate'; x: number; y: number }
  | { type: 'scale'; x: number; y: number }
  | { type: 'fillPath'; path: string; color: string }
  | { type: 'strokePath'; path: string; color: string; width: number };

// ============================================
// 序列化DOM树
// ============================================

export interface SerializedDOMNode {
  id: string;
  tagName?: string;
  nodeType: number;
  nodeName: string;
  nodeValue?: string;
  attributes?: Record<string, string>;
  children?: SerializedDOMNode[];
  computedStyle?: Record<string, string>;
  layout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface SerializedDOMTree {
  root: SerializedDOMNode;
}

// ============================================
// 联合类型
// ============================================

export type IPCMessage = 
  | NavigateMessage
  | ExecuteScriptMessage
  | ReloadMessage
  | StopLoadingMessage
  | GoBackMessage
  | GoForwardMessage
  | MouseEventMessage
  | KeyEventMessage
  | ScrollEventMessage
  | ResizeEventMessage
  | ReadyMessage
  | TitleChangedMessage
  | URLChangedMessage
  | LoadStartedMessage
  | LoadFinishedMessage
  | PaintReadyMessage
  | DOMUpdatedMessage
  | ConsoleMessage
  | ScriptResultMessage
  | FetchRequestMessage
  | FetchResponseMessage
  | FetchErrorMessage
  | ResourceLoadedMessage
  | GetDOMTreeMessage
  | GetComputedStyleMessage
  | SetStyleMessage
  | GetNetworkLogMessage
  | ClearNetworkLogMessage
  | ExecuteConsoleMessage;

// ============================================
// 网络请求日志
// ============================================

export interface NetworkRequestLog {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  requestBody?: string;
  status: number;
  statusText: string;
  responseHeaders: Record<string, string>;
  responseBody?: string;
  startTime: number;
  endTime: number;
  duration: number;
  resourceType: 'document' | 'stylesheet' | 'script' | 'image' | 'font' | 'other';
  size: number;
}
