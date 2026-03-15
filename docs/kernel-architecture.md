# WebOS Kernel Architecture Restructure Plan

## Executive Summary

This document outlines a comprehensive plan to restructure the WebOS kernel from its current flat, mixed structure to a layered Windows NT-inspired architecture. The new design provides clear separation of concerns, better testability, and improved maintainability.

---

## 1. Current State Analysis

### 1.1 Existing Structure

```
packages/kernel/
├── src/
│   ├── core/                          # Mixed modules (problematic)
│   │   ├── userManager.ts             # User management
│   │   ├── secureUserManager.ts       # Secure user management
│   │   ├── windowManager.ts           # Window management
│   │   ├── crypto.ts                  # Cryptographic utilities
│   │   ├── secureStorage.ts           # Secure storage (IndexedDB)
│   │   ├── encryptedDatabase.ts       # SQL cipher database
│   │   ├── persistentFileSystem.ts    # Encrypted file system
│   │   ├── errorHandler.ts            # Error handling
│   │   ├── api.ts                     # API aggregation
│   │   ├── resourceLoader.ts          # Resource loading
│   │   └── managers/                  # Sub-managers
│   │       ├── i18nManager.ts
│   │       ├── configManager.ts
│   │       ├── notifyManager.ts
│   │       ├── timeManager.ts
│   │       ├── bootManager.ts
│   │       └── updateManager.ts
│   ├── hooks/                         # React hooks (misplaced)
│   │   └── useTranslation.ts
│   ├── types.ts                       # Type definitions
│   └── index.ts                       # Entry point
├── fs/                                # Nested package (confusing)
│   └── src/
│       ├── core/
│       │   ├── FileSystem.ts
│       │   ├── Node.ts
│       │   └── Permissions.ts
│       ├── types.ts
│       └── index.ts
└── app-manager/                       # Nested package (confusing)
    └── src/
        ├── registry.tsx
        ├── types.ts
        └── index.ts
```

### 1.2 Identified Problems

| Issue | Description | Impact |
|-------|-------------|--------|
| Mixed modules | `core/` contains unrelated managers (user, window, crypto, etc.) | Hard to navigate, unclear responsibilities |
| Nested packages | `fs/` and `app-manager/` are separate packages inside kernel | Confusing imports, circular dependencies |
| No layering | Everything is at the same abstraction level | No clear dependency direction |
| Misplaced concerns | React hooks in kernel, UI in core modules | Tight coupling, hard to test |
| Monolithic API | `api.ts` aggregates everything in one place | Hard to extend, implicit dependencies |

---

## 2. Target Architecture

### 2.1 Layered Design (NT-Inspired)

```
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                              │
│  (High-level system services, user-facing APIs)                 │
│  AuthService, FileSystemService, WindowService, NotifyService   │
├─────────────────────────────────────────────────────────────────┤
│                      EXECUTIVE LAYER                             │
│  (Process, Memory, Object, I/O, Security managers)              │
│  ProcessManager, MemoryManager, ObjectManager, IOManager        │
├─────────────────────────────────────────────────────────────────┤
│                       KERNEL LAYER                               │
│  (Low-level primitives, scheduling, synchronization)            │
│  Scheduler, InterruptHandler, Synchronization, TrapHandler      │
├─────────────────────────────────────────────────────────────────┤
│                      HAL (Hardware Abstraction)                  │
│  (Platform-specific adapters for browser APIs)                  │
│  StorageAdapter, NetworkAdapter, DisplayAdapter, InputAdapter   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Dependency Direction

```
Services ──depends on──> Executive ──depends on──> Kernel ──depends on──> HAL
```

**Key Principle:** Upper layers depend on lower layers, never the reverse.

---

## 3. Detailed File Structure

### 3.1 HAL (Hardware Abstraction Layer)

**Location:** `packages/kernel/src/hal/`

```
src/hal/
├── index.ts                    # HAL exports
├── types.ts                    # HAL interfaces
│
├── storage/
│   ├── index.ts               # Storage adapter exports
│   ├── types.ts               # Storage types
│   ├── StorageAdapter.ts      # Abstract base class
│   ├── IndexedDBAdapter.ts    # IndexedDB implementation
│   ├── LocalStorageAdapter.ts # localStorage implementation  
│   ├── OPFSAdapter.ts         # Origin Private File System
│   └── CacheAdapter.ts        # Cache API adapter
│
├── network/
│   ├── index.ts               # Network adapter exports
│   ├── types.ts               # Network types
│   ├── NetworkAdapter.ts      # Abstract base class
│   ├── FetchAdapter.ts        # Fetch API implementation
│   ├── WebSocketAdapter.ts    # WebSocket implementation
│   └── WebRTCAdapter.ts       # WebRTC data channels
│
├── display/
│   ├── index.ts               # Display adapter exports
│   ├── types.ts               # Display types
│   ├── DisplayAdapter.ts      # Abstract base class
│   ├── CanvasAdapter.ts       # Canvas 2D rendering
│   ├── WebGLAdapter.ts        # WebGL rendering
│   └── CSSAdapter.ts          # CSS-based rendering
│
├── input/
│   ├── index.ts               # Input adapter exports
│   ├── types.ts               # Input event types
│   ├── InputAdapter.ts        # Abstract base class
│   ├── MouseAdapter.ts        # Mouse events
│   ├── KeyboardAdapter.ts     # Keyboard events
│   ├── TouchAdapter.ts        # Touch events
│   └── GamepadAdapter.ts      # Gamepad API
│
└── audio/
    ├── index.ts               # Audio adapter exports
    ├── types.ts               # Audio types
    ├── AudioAdapter.ts        # Abstract base class
    └── WebAudioAdapter.ts     # Web Audio API implementation
```

### 3.2 Kernel Layer

**Location:** `packages/kernel/src/kernel/`

```
src/kernel/
├── index.ts                    # Kernel exports
├── types.ts                    # Kernel types
│
├── scheduler/
│   ├── index.ts               # Scheduler exports
│   ├── types.ts               # Task, priority types
│   ├── Scheduler.ts           # Cooperative multitasking scheduler
│   ├── TaskQueue.ts           # Priority queue implementation
│   └── Task.ts                # Task/Process representation
│
├── interrupt/
│   ├── index.ts               # Interrupt handler exports
│   ├── types.ts               # Interrupt types
│   ├── InterruptHandler.ts    # Event routing
│   └── SignalHandler.ts       # Signal handling
│
├── sync/
│   ├── index.ts               # Synchronization exports
│   ├── types.ts               # Sync primitive types
│   ├── Mutex.ts               # Mutual exclusion lock
│   ├── Semaphore.ts           # Counting semaphore
│   ├── Event.ts               # Event/condition variable
│   └── RwLock.ts              # Read-write lock
│
└── trap/
    ├── index.ts               # Trap handler exports
    ├── types.ts               # System call types
    ├── TrapHandler.ts         # System call dispatcher
    └── syscalls.ts            # System call definitions
```

### 3.3 Executive Layer

**Location:** `packages/kernel/src/executive/`

```
src/executive/
├── index.ts                    # Executive exports
├── types.ts                    # Executive types
│
├── process/
│   ├── index.ts               # Process manager exports
│   ├── types.ts               # Process types
│   ├── ProcessManager.ts      # Process creation, lifecycle
│   ├── Process.ts             # Process representation
│   └── ProcessTable.ts        # Process table (PID map)
│
├── memory/
│   ├── index.ts               # Memory manager exports
│   ├── types.ts               # Memory types
│   ├── MemoryManager.ts       # Heap allocation
│   ├── HeapRegion.ts          # Memory region management
│   └── GCHints.ts             # Garbage collection hints
│
├── object/
│   ├── index.ts               # Object manager exports
│   ├── types.ts               # Object types
│   ├── ObjectManager.ts       # Kernel object management
│   ├── HandleTable.ts         # Handle table (per process)
│   └── ReferenceCount.ts      # Reference counting
│
├── io/
│   ├── index.ts               # I/O manager exports
│   ├── types.ts               # I/O types
│   ├── IOManager.ts           # Async I/O coordination
│   ├── DeviceInterface.ts     # Device abstraction
│   ├── AsyncIO.ts             # Async I/O operations
│   └── IRP.ts                 # I/O Request Packet
│
└── security/
    ├── index.ts               # Security manager exports
    ├── types.ts               # Security types
    ├── SecurityManager.ts     # Authentication, authorization
    ├── Token.ts               # Security token
    ├── ACL.ts                 # Access control list
    └── Principal.ts           # User/Group identity
```

### 3.4 Services Layer

**Location:** `packages/kernel/src/services/`

```
src/services/
├── index.ts                    # Services exports
├── types.ts                    # Service types
│
├── auth/
│   ├── index.ts               # Auth service exports
│   ├── types.ts               # Auth types
│   ├── AuthService.ts         # User authentication
│   ├── SessionManager.ts      # Session management
│   └── CredentialStore.ts     # Secure credential storage
│
├── filesystem/
│   ├── index.ts               # Filesystem service exports
│   ├── types.ts               # FS types
│   ├── FileSystemService.ts   # Virtual file system
│   ├── VirtualFS.ts           # VFS layer
│   ├── MountTable.ts          # Mount point registry
│   └── FileSystemNode.ts      # Node representation
│
├── window/
│   ├── index.ts               # Window service exports
│   ├── types.ts               # Window types
│   ├── WindowService.ts       # Window management
│   ├── Compositor.ts          # Window composition
│   ├── Window.ts              # Window representation
│   └── ZOrder.ts              # Z-order management
│
├── notify/
│   ├── index.ts               # Notify service exports
│   ├── types.ts               # Notification types
│   └── NotifyService.ts       # Notification service
│
├── config/
│   ├── index.ts               # Config service exports
│   ├── types.ts               # Config types
│   └── ConfigService.ts       # System configuration
│
├── locale/
│   ├── index.ts               # Locale service exports
│   ├── types.ts               # Locale types
│   └── LocaleService.ts       # i18n, translations
│
└── boot/
    ├── index.ts               # Boot service exports
    ├── types.ts               # Boot types
    └── BootService.ts         # Boot sequence, OOBE
```

---

## 4. Module Responsibilities and Interfaces

### 4.1 HAL Layer

#### StorageAdapter

```typescript
// src/hal/storage/types.ts
export interface StorageCapabilities {
  persistent: boolean;
  encrypted: boolean;
  quota: number | 'unlimited';
  sync: boolean;
}

export interface StorageAdapter {
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
  
  // Transactions (if supported)
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}
```

#### NetworkAdapter

```typescript
// src/hal/network/types.ts
export interface NetworkCapabilities {
  realtime: boolean;
  p2p: boolean;
  streaming: boolean;
}

export interface NetworkAdapter {
  readonly name: string;
  readonly capabilities: NetworkCapabilities;
  
  // Request/Response
  fetch(request: Request): Promise<Response>;
  
  // Real-time (WebSocket/WebRTC)
  connect(url: string): Promise<Connection>;
  
  // Events
  onOnline: EventTarget;
  onOffline: EventTarget;
}
```

#### InputAdapter

```typescript
// src/hal/input/types.ts
export interface InputEvent {
  type: 'mouse' | 'keyboard' | 'touch' | 'gamepad';
  timestamp: number;
  data: MouseEventData | KeyboardEventData | TouchEventData | GamepadEventData;
}

export interface InputAdapter {
  readonly name: string;
  
  // Event subscription
  subscribe(handler: (event: InputEvent) => void): () => void;
  
  // State queries
  getMousePosition(): { x: number; y: number };
  isKeyDown(key: string): boolean;
}
```

### 4.2 Kernel Layer

#### Scheduler

```typescript
// src/kernel/scheduler/types.ts
export type TaskPriority = 'realtime' | 'high' | 'normal' | 'low' | 'idle';
export type TaskState = 'ready' | 'running' | 'blocked' | 'terminated';

export interface Task {
  id: number;
  name: string;
  priority: TaskPriority;
  state: TaskState;
  entry: () => Promise<void> | void;
  parent?: number;
  children: number[];
}

// src/kernel/scheduler/Scheduler.ts
export interface Scheduler {
  // Task management
  createTask(name: string, entry: () => Promise<void>, priority?: TaskPriority): number;
  terminateTask(id: number): boolean;
  
  // Scheduling
  schedule(): void;
  yield(): Promise<void>;
  sleep(ms: number): Promise<void>;
  
  // Queries
  getCurrentTask(): Task | null;
  getTask(id: number): Task | null;
  getAllTasks(): Task[];
}
```

#### Synchronization Primitives

```typescript
// src/kernel/sync/types.ts
export interface Mutex {
  lock(): Promise<void>;
  tryLock(): boolean;
  unlock(): void;
  isLocked(): boolean;
}

export interface Semaphore {
  acquire(): Promise<void>;
  tryAcquire(): boolean;
  release(): void;
  getCount(): number;
}

export interface KernelEvent {
  wait(): Promise<void>;
  signal(): void;
  broadcast(): void;
  isSet(): boolean;
}
```

### 4.3 Executive Layer

#### ProcessManager

```typescript
// src/executive/process/types.ts
export interface ProcessInfo {
  pid: number;
  name: string;
  path: string;
  args: string[];
  env: Record<string, string>;
  cwd: string;
  uid: string;
  gid: string;
  startTime: Date;
  status: 'running' | 'stopped' | 'zombie';
}

// src/executive/process/ProcessManager.ts
export interface ProcessManager {
  // Process creation
  fork(): number;
  exec(path: string, args?: string[]): Promise<number>;
  spawn(options: ProcessSpawnOptions): number;
  
  // Process control
  kill(pid: number, signal?: number): boolean;
  wait(pid: number): Promise<number>;
  
  // Queries
  getpid(): number;
  getppid(): number;
  getProcess(pid: number): ProcessInfo | null;
  listProcesses(): ProcessInfo[];
}
```

#### ObjectManager

```typescript
// src/executive/object/types.ts
export type KernelObjectType = 
  | 'process'
  | 'thread'
  | 'file'
  | 'device'
  | 'event'
  | 'mutex'
  | 'semaphore';

export interface KernelObject {
  type: KernelObjectType;
  refCount: number;
  createdAt: Date;
}

// src/executive/object/ObjectManager.ts
export interface ObjectManager {
  // Object creation
  createObject<T extends KernelObject>(type: KernelObjectType, data: T): number;
  
  // Handle operations
  duplicateHandle(sourcePid: number, handle: number, targetPid: number): number;
  closeHandle(pid: number, handle: number): boolean;
  
  // Reference counting
  reference(handle: number): void;
  dereference(handle: number): void;
  
  // Queries
  getObject<T>(handle: number): T | null;
  getType(handle: number): KernelObjectType | null;
}
```

#### SecurityManager

```typescript
// src/executive/security/types.ts
export interface SecurityToken {
  userId: string;
  userName: string;
  groups: string[];
  privileges: string[];
  sessionId: string;
}

export interface ACL {
  owner: string;
  group: string;
  mode: string; // Unix-style permissions
}

// src/executive/security/SecurityManager.ts
export interface SecurityManager {
  // Authentication
  authenticate(username: string, password: string): Promise<SecurityToken>;
  logout(): void;
  
  // Token management
  getCurrentToken(): SecurityToken | null;
  impersonate(token: SecurityToken): void;
  revertToSelf(): void;
  
  // Authorization
  checkAccess(resource: string, access: 'read' | 'write' | 'execute'): boolean;
  checkPrivilege(privilege: string): boolean;
}
```

### 4.4 Services Layer

#### AuthService

```typescript
// src/services/auth/types.ts
export interface User {
  id: string;
  username: string;
  displayName: string;
  role: 'root' | 'admin' | 'user' | 'guest';
  homeDir: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Session {
  id: string;
  userId: string;
  loginTime: Date;
  expiresAt: Date;
  isTemporary: boolean;
}

// src/services/auth/AuthService.ts
export interface AuthService {
  // User management
  createUser(username: string, password: string, options?: CreateUserOptions): Promise<User>;
  deleteUser(userId: string): Promise<boolean>;
  getUser(userId: string): User | null;
  getAllUsers(): User[];
  
  // Authentication
  login(username: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  
  // Session management
  getCurrentSession(): Session | null;
  getCurrentUser(): User | null;
  isLoggedIn(): boolean;
  
  // Security
  changePassword(oldPassword: string, newPassword: string): Promise<boolean>;
  requestPrivilege(reason: string): Promise<boolean>;
  
  // Events
  onLogin: EventTarget;
  onLogout: EventTarget;
}
```

#### FileSystemService

```typescript
// src/services/filesystem/types.ts
export interface FileSystemNode {
  path: string;
  name: string;
  type: 'file' | 'directory' | 'symlink';
  permissions: string;
  owner: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}

// src/services/filesystem/FileSystemService.ts
export interface FileSystemService {
  // File operations
  read(path: string): Promise<string | null>;
  readBinary(path: string): Promise<Uint8Array | null>;
  write(path: string, content: string | Uint8Array): Promise<boolean>;
  append(path: string, content: string): Promise<boolean>;
  
  // Directory operations
  mkdir(path: string, recursive?: boolean): Promise<boolean>;
  readdir(path: string): Promise<FileSystemNode[]>;
  rmdir(path: string): Promise<boolean>;
  
  // Node operations
  stat(path: string): Promise<FileSystemNode | null>;
  exists(path: string): boolean;
  delete(path: string): Promise<boolean>;
  rename(oldPath: string, newPath: string): Promise<boolean>;
  chmod(path: string, mode: string): Promise<boolean>;
  
  // Watching
  watch(path: string, callback: (event: FSEvent) => void): () => void;
  
  // Path utilities
  resolve(...paths: string[]): string;
  dirname(path: string): string;
  basename(path: string): string;
  extname(path: string): string;
}
```

#### WindowService

```typescript
// src/services/window/types.ts
export interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  zIndex: number;
  appId?: string;
}

export interface WindowOptions {
  title?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  appId?: string;
}

// src/services/window/WindowService.ts
export interface WindowService {
  // Window management
  open(options: WindowOptions): string;
  close(windowId: string): void;
  minimize(windowId: string): void;
  maximize(windowId: string): void;
  restore(windowId: string): void;
  focus(windowId: string): void;
  
  // Queries
  get(windowId: string): WindowState | null;
  getAll(): WindowState[];
  getActive(): WindowState | null;
  
  // Events
  onOpen: EventTarget;
  onClose: EventTarget;
  onFocus: EventTarget;
}
```

---

## 5. Layer Dependencies

### 5.1 Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│  SERVICES                                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Auth   │ │   FS    │ │ Window  │ │ Notify  │ │ Config  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
│       │           │           │           │           │         │
└───────┼───────────┼───────────┼───────────┼───────────┼─────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│  EXECUTIVE                                                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Process │ │ Memory  │ │ Object  │ │   I/O   │ │Security │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
│       │           │           │           │           │         │
└───────┼───────────┼───────────┼───────────┼───────────┼─────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│  KERNEL                                                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │ Scheduler │ │ Interrupt │ │   Sync    │ │   Trap    │       │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘       │
│        │             │             │             │               │
└────────┼─────────────┼─────────────┼─────────────┼──────────────┘
         │             │             │             │
         ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│  HAL                                                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Storage │ │ Network │ │ Display │ │  Input  │ │  Audio  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Import Rules

| Layer | Can Import From | Cannot Import From |
|-------|-----------------|-------------------|
| HAL | External packages | Kernel, Executive, Services |
| Kernel | HAL | Executive, Services |
| Executive | Kernel, HAL | Services |
| Services | Executive, Kernel, HAL | UI packages |

### 5.3 Cross-Layer Communication

```typescript
// Example: Service using Executive
// src/services/auth/AuthService.ts
import { SecurityManager } from '@kernel/executive/security';
import { ObjectManager } from '@kernel/executive/object';
import { StorageAdapter } from '@kernel/hal/storage';

export class AuthService {
  constructor(
    private security: SecurityManager,
    private objects: ObjectManager,
    private storage: StorageAdapter
  ) {}
}
```

---

## 6. Migration Plan

### 6.1 Phase 1: Foundation (Week 1-2)

**Goals:**
- Create new directory structure
- Establish HAL layer
- Migrate storage adapters

**Tasks:**

1. Create directory structure
```bash
mkdir -p packages/kernel/src/{hal,kernel,executive,services}
mkdir -p packages/kernel/src/hal/{storage,network,display,input,audio}
mkdir -p packages/kernel/src/kernel/{scheduler,interrupt,sync,trap}
mkdir -p packages/kernel/src/executive/{process,memory,object,io,security}
mkdir -p packages/kernel/src/services/{auth,filesystem,window,notify,config,locale,boot}
```

2. Extract storage adapters from `secureStorage.ts` and `encryptedDatabase.ts`
```typescript
// Migrate to src/hal/storage/IndexedDBAdapter.ts
// Migrate to src/hal/storage/LocalStorageAdapter.ts
```

3. Create HAL type definitions
```typescript
// Create src/hal/types.ts
// Create src/hal/storage/types.ts
// Create src/hal/network/types.ts
```

**Files to Modify:**
- Create: `src/hal/**/*.ts`
- Create: `src/hal/index.ts`

### 6.2 Phase 2: Kernel Layer (Week 3-4)

**Goals:**
- Implement Scheduler
- Implement synchronization primitives
- Create interrupt/signal handling

**Tasks:**

1. Create cooperative scheduler
```typescript
// src/kernel/scheduler/Scheduler.ts
// Migrate concepts from windowManager.ts (event handling)
```

2. Implement sync primitives
```typescript
// src/kernel/sync/Mutex.ts
// src/kernel/sync/Semaphore.ts
// src/kernel/sync/Event.ts
```

3. Create trap handler for system calls
```typescript
// src/kernel/trap/TrapHandler.ts
// src/kernel/trap/syscalls.ts
```

**Files to Migrate:**
- From: `src/core/errorHandler.ts` → `src/kernel/interrupt/`

### 6.3 Phase 3: Executive Layer (Week 5-6)

**Goals:**
- Implement Process Manager
- Implement Object Manager
- Implement Security Manager
- Implement I/O Manager

**Tasks:**

1. Extract Process Manager from app-manager
```typescript
// Migrate from packages/kernel/app-manager/
// To: src/executive/process/
```

2. Create Object Manager with handle tables
```typescript
// src/executive/object/ObjectManager.ts
// src/executive/object/HandleTable.ts
```

3. Migrate security from userManager and secureUserManager
```typescript
// From: src/core/userManager.ts
// From: src/core/secureUserManager.ts
// To: src/executive/security/
```

**Files to Migrate:**
- `src/core/crypto.ts` → `src/executive/security/`
- `src/core/userManager.ts` → `src/services/auth/` (keep in services)
- `src/core/secureUserManager.ts` → `src/services/auth/`

### 6.4 Phase 4: Services Layer (Week 7-8)

**Goals:**
- Implement all services
- Create unified API
- Migrate all managers

**Tasks:**

1. Create AuthService
```typescript
// Migrate from userManager.ts + secureUserManager.ts
// Add session management
```

2. Create FileSystemService
```typescript
// Migrate from fs/ package
// Add VFS layer
```

3. Create WindowService
```typescript
// Migrate from windowManager.ts
// Add compositor abstraction
```

4. Create other services
```typescript
// NotifyService from managers/notifyManager.ts
// ConfigService from managers/configManager.ts
// LocaleService from managers/i18nManager.ts
// BootService from managers/bootManager.ts
```

**Files to Migrate:**
- `packages/kernel/fs/` → `src/services/filesystem/`
- `packages/kernel/app-manager/` → `src/executive/process/` + `src/services/app/`
- `src/core/windowManager.ts` → `src/services/window/`
- `src/core/managers/*.ts` → `src/services/*/`

### 6.5 Phase 5: API Consolidation (Week 9-10)

**Goals:**
- Create clean public API
- Remove old exports
- Update all consumers

**Tasks:**

1. Create new entry point
```typescript
// src/index.ts - New clean exports
export { AuthService } from './services/auth';
export { FileSystemService } from './services/filesystem';
export { WindowService } from './services/window';
// ... etc
```

2. Create API factory
```typescript
// src/api.ts - WebOS API creation
export function createKernel(): KernelAPI {
  // Initialize HAL
  // Initialize Kernel layer
  // Initialize Executive layer
  // Initialize Services layer
  // Return unified API
}
```

3. Update consumers
```typescript
// Update src/index.tsx
// Update packages/apps/
// Update packages/ui/
```

### 6.6 Phase 6: Cleanup and Testing (Week 11-12)

**Goals:**
- Remove old code
- Add comprehensive tests
- Update documentation

**Tasks:**

1. Remove deprecated files
```bash
rm -rf packages/kernel/src/core/
rm -rf packages/kernel/fs/
rm -rf packages/kernel/app-manager/
```

2. Add unit tests
```typescript
// tests/hal/storage/*.test.ts
// tests/kernel/scheduler/*.test.ts
// tests/executive/process/*.test.ts
// tests/services/auth/*.test.ts
```

3. Update documentation
```markdown
// Update README.md
// Create ARCHITECTURE.md
// Create MIGRATION.md for app developers
```

---

## 7. File Migration Mapping

| Current Location | New Location | Notes |
|-----------------|--------------|-------|
| `src/core/crypto.ts` | `src/executive/security/crypto.ts` | |
| `src/core/secureStorage.ts` | `src/hal/storage/IndexedDBAdapter.ts` | Split into adapter |
| `src/core/encryptedDatabase.ts` | `src/hal/storage/EncryptedDatabase.ts` | |
| `src/core/persistentFileSystem.ts` | `src/services/filesystem/PersistentFS.ts` | |
| `src/core/userManager.ts` | `src/services/auth/UserManager.ts` | |
| `src/core/secureUserManager.ts` | `src/services/auth/SecureUserManager.ts` | |
| `src/core/windowManager.ts` | `src/services/window/WindowService.ts` | |
| `src/core/errorHandler.ts` | `src/kernel/interrupt/ErrorHandler.ts` | |
| `src/core/api.ts` | `src/api.ts` | Refactored |
| `src/core/resourceLoader.ts` | `src/executive/io/ResourceLoader.ts` | |
| `src/core/managers/i18nManager.ts` | `src/services/locale/LocaleService.ts` | |
| `src/core/managers/configManager.ts` | `src/services/config/ConfigService.ts` | |
| `src/core/managers/notifyManager.ts` | `src/services/notify/NotifyService.ts` | |
| `src/core/managers/timeManager.ts` | `src/services/time/TimeService.ts` | New |
| `src/core/managers/bootManager.ts` | `src/services/boot/BootService.ts` | |
| `src/core/managers/updateManager.ts` | `src/services/update/UpdateService.ts` | New |
| `fs/src/core/FileSystem.ts` | `src/services/filesystem/VirtualFS.ts` | |
| `fs/src/core/Node.ts` | `src/services/filesystem/Node.ts` | |
| `fs/src/core/Permissions.ts` | `src/executive/security/Permissions.ts` | |
| `app-manager/src/registry.tsx` | `src/executive/process/AppRegistry.ts` | Remove React dependency |
| `src/hooks/useTranslation.ts` | `packages/ui/src/hooks/useTranslation.ts` | Move to UI package |

---

## 8. Backward Compatibility

### 8.1 Legacy API Shim

During migration, provide a compatibility layer:

```typescript
// src/compat/legacy.ts
import { AuthService } from '../services/auth';
import { FileSystemService } from '../services/filesystem';
import { WindowService } from '../services/window';

// Create legacy-compatible API
export function createLegacyAPI() {
  const auth = AuthService.getInstance();
  const fs = FileSystemService.getInstance();
  const window = WindowService.getInstance();
  
  return {
    user: {
      getCurrentUser: () => auth.getCurrentUser(),
      login: (u, p) => auth.login(u, p),
      // ... map all legacy methods
    },
    fs: {
      read: (path) => fs.read(path),
      write: (path, content) => fs.write(path, content),
      // ... map all legacy methods
    },
    window: {
      open: (appId, options) => window.open({ ...options, appId }),
      // ... map all legacy methods
    },
    // ... etc
  };
}
```

### 8.2 Deprecation Timeline

| Version | Status | Notes |
|---------|--------|-------|
| v1.0.0 | New architecture available | Legacy API still default |
| v1.1.0 | Legacy API deprecated | Warnings in console |
| v2.0.0 | Legacy API removed | Clean break |

---

## 9. Testing Strategy

### 9.1 Unit Tests

Each layer should have isolated unit tests:

```
tests/
├── hal/
│   ├── storage/
│   │   ├── IndexedDBAdapter.test.ts
│   │   └── LocalStorageAdapter.test.ts
│   └── network/
│       └── FetchAdapter.test.ts
├── kernel/
│   ├── scheduler/
│   │   └── Scheduler.test.ts
│   └── sync/
│       ├── Mutex.test.ts
│       └── Semaphore.test.ts
├── executive/
│   ├── process/
│   │   └── ProcessManager.test.ts
│   └── security/
│       └── SecurityManager.test.ts
└── services/
    ├── auth/
    │   └── AuthService.test.ts
    └── filesystem/
        └── FileSystemService.test.ts
```

### 9.2 Integration Tests

```
tests/integration/
├── auth-flow.test.ts          # Full auth workflow
├── filesystem-operations.test.ts  # FS operations
└── window-lifecycle.test.ts   # Window creation/destruction
```

### 9.3 E2E Tests

```
tests/e2e/
├── boot-sequence.test.ts      # System boot
├── user-session.test.ts       # Login/logout
└── app-lifecycle.test.ts      # App launch/close
```

---

## 10. Performance Considerations

### 10.1 Lazy Loading

Services should be loaded on demand:

```typescript
// src/services/index.ts
export const services = {
  get auth() {
    return import('./auth').then(m => m.AuthService.getInstance());
  },
  get filesystem() {
    return import('./filesystem').then(m => m.FileSystemService.getInstance());
  },
  // ...
};
```

### 10.2 Dependency Injection

Use DI for testability and flexibility:

```typescript
// src/kernel/Kernel.ts
export class Kernel {
  private hal: HAL;
  private scheduler: Scheduler;
  private services: Map<string, Service>;
  
  constructor(config: KernelConfig) {
    this.hal = config.hal || createDefaultHAL();
    this.scheduler = new Scheduler(this.hal);
  }
}
```

---

## 11. Summary

This restructure transforms the WebOS kernel from a flat, mixed architecture to a clean, layered NT-inspired design:

| Aspect | Before | After |
|--------|--------|-------|
| Structure | Flat, mixed modules | 4 distinct layers |
| Dependencies | Unclear, circular | Unidirectional (top-down) |
| Testability | Hard to isolate | Each layer independently testable |
| Extensibility | Monolithic API | Pluggable services |
| Documentation | Sparse | Comprehensive architecture docs |

The migration is planned over 12 weeks with clear phases, backward compatibility shims, and comprehensive testing at each stage.
