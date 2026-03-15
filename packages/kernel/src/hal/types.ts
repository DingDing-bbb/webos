/**
 * @fileoverview HAL (Hardware Abstraction Layer) Types
 * @module @kernel/hal/types
 * 
 * HAL provides abstract interfaces for hardware/browser APIs.
 * All platform-specific code lives here.
 */

// ============================================================================
// Storage Types
// ============================================================================

/**
 * Storage adapter capabilities
 */
export interface StorageCapabilities {
  /** Data persists across sessions */
  persistent: boolean;
  /** Data is encrypted at rest */
  encrypted: boolean;
  /** Storage quota in bytes, or 'unlimited' */
  quota: number | 'unlimited';
  /** Supports synchronous operations */
  sync: boolean;
  /** Supports transactions */
  transactional: boolean;
}

/**
 * Abstract storage adapter interface
 */
export interface IStorageAdapter {
  readonly name: string;
  readonly capabilities: StorageCapabilities;
  
  // Lifecycle
  init(): Promise<void>;
  destroy(): Promise<void>;
  
  // Basic operations
  get(key: string): Promise<Uint8Array | null>;
  set(key: string, value: Uint8Array): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  
  // Bulk operations
  list(prefix?: string): Promise<string[]>;
  clear(): Promise<void>;
  
  // Transactions
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}

// ============================================================================
// Network Types
// ============================================================================

/**
 * Network adapter capabilities
 */
export interface NetworkCapabilities {
  /** Supports real-time communication */
  realtime: boolean;
  /** Supports peer-to-peer */
  p2p: boolean;
  /** Supports streaming */
  streaming: boolean;
}

/**
 * Network connection state
 */
export type ConnectionState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error';

/**
 * Network connection interface
 */
export interface IConnection {
  readonly state: ConnectionState;
  send(data: string | Uint8Array): Promise<void>;
  close(): void;
  onMessage: (handler: (data: string | Uint8Array) => void) => () => void;
  onClose: (handler: () => void) => () => void;
  onError: (handler: (error: Error) => void) => () => void;
}

/**
 * Abstract network adapter interface
 */
export interface INetworkAdapter {
  readonly name: string;
  readonly capabilities: NetworkCapabilities;
  readonly isOnline: boolean;
  
  // Request/Response
  fetch(request: Request): Promise<Response>;
  
  // Real-time
  connect(url: string, protocols?: string[]): Promise<IConnection>;
  
  // Events
  onOnline(handler: () => void): () => void;
  onOffline(handler: () => void): () => void;
}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Input event types
 */
export type InputEventType = 'mouse' | 'keyboard' | 'touch' | 'gamepad';

/**
 * Mouse event data
 */
export interface MouseEventData {
  type: 'move' | 'down' | 'up' | 'click' | 'dblclick' | 'wheel' | 'contextmenu';
  x: number;
  y: number;
  button: number;
  buttons: number;
  deltaX: number;
  deltaY: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

/**
 * Keyboard event data
 */
export interface KeyboardEventData {
  type: 'down' | 'up' | 'press';
  key: string;
  code: string;
  keyCode: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  repeat: boolean;
}

/**
 * Touch point data
 */
export interface TouchPoint {
  identifier: number;
  x: number;
  y: number;
  pageX: number;
  pageY: number;
  force: number;
}

/**
 * Touch event data
 */
export interface TouchEventData {
  type: 'start' | 'move' | 'end' | 'cancel';
  touches: TouchPoint[];
  changedTouches: TouchPoint[];
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

/**
 * Gamepad event data
 */
export interface GamepadEventData {
  type: 'connected' | 'disconnected' | 'button' | 'axis';
  index: number;
  id: string;
  buttons: number[];
  axes: number[];
}

/**
 * Unified input event
 */
export interface InputEvent {
  type: InputEventType;
  timestamp: number;
  target?: EventTarget;
  data: MouseEventData | KeyboardEventData | TouchEventData | GamepadEventData;
  preventDefault: () => void;
  stopPropagation: () => void;
}

/**
 * Abstract input adapter interface
 */
export interface IInputAdapter {
  readonly name: string;
  
  // Event subscription
  subscribe(handler: (event: InputEvent) => void): () => void;
  
  // State queries
  getMousePosition(): { x: number; y: number };
  isKeyDown(key: string): boolean;
  isMouseButtonDown(button: number): boolean;
}

// ============================================================================
// Display Types
// ============================================================================

/**
 * Display capabilities
 */
export interface DisplayCapabilities {
  /** Supports WebGL */
  webgl: boolean;
  /** Supports WebGL 2 */
  webgl2: boolean;
  /** Maximum texture size */
  maxTextureSize: number;
  /** Device pixel ratio */
  devicePixelRatio: number;
}

/**
 * Display mode
 */
export interface DisplayMode {
  width: number;
  height: number;
  refreshRate: number;
}

/**
 * Abstract display adapter interface
 */
export interface IDisplayAdapter {
  readonly name: string;
  readonly capabilities: DisplayCapabilities;
  
  // Canvas management
  createCanvas(width: number, height: number): HTMLCanvasElement;
  destroyCanvas(canvas: HTMLCanvasElement): void;
  
  // Rendering context
  getContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null;
  getContextWebGL(canvas: HTMLCanvasElement): WebGLRenderingContext | null;
  getContextWebGL2(canvas: HTMLCanvasElement): WebGL2RenderingContext | null;
  
  // Display info
  getDisplayModes(): DisplayMode[];
  getCurrentMode(): DisplayMode;
  requestFullscreen(element: HTMLElement): Promise<void>;
  exitFullscreen(): Promise<void>;
}

// ============================================================================
// Audio Types
// ============================================================================

/**
 * Audio capabilities
 */
export interface AudioCapabilities {
  /** Supports Web Audio API */
  webAudio: boolean;
  /** Maximum number of channels */
  maxChannels: number;
  /** Sample rates supported */
  sampleRates: number[];
}

/**
 * Audio node types
 */
export type AudioNodeType = 'source' | 'gain' | 'filter' | 'destination' | 'analyser' | 'panner';

/**
 * Abstract audio adapter interface
 */
export interface IAudioAdapter {
  readonly name: string;
  readonly capabilities: AudioCapabilities;
  
  // Context management
  createContext(): AudioContext;
  destroyContext(context: AudioContext): void;
  
  // Node creation
  createSource(context: AudioContext, buffer?: AudioBuffer): AudioBufferSourceNode;
  createGain(context: AudioContext): GainNode;
  createAnalyser(context: AudioContext): AnalyserNode;
  createPanner(context: AudioContext): PannerNode;
  
  // Decoding
  decodeAudioData(context: AudioContext, buffer: ArrayBuffer): Promise<AudioBuffer>;
}

// ============================================================================
// HAL Manager
// ============================================================================

/**
 * HAL manager interface - provides access to all adapters
 */
export interface IHAL {
  readonly storage: IStorageAdapter;
  readonly network: INetworkAdapter;
  readonly input: IInputAdapter;
  readonly display: IDisplayAdapter;
  readonly audio: IAudioAdapter;
  
  // Initialization
  init(): Promise<void>;
  destroy(): Promise<void>;
}
