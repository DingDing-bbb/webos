# WebOS

<p align="center">
  <strong>A Modern Web-Based Operating System</strong>
</p>

<p align="center">
  <em>Experience a desktop-like operating system running entirely in your browser</em>
</p>

---

## Overview

WebOS is a single-page application that simulates a complete desktop operating system experience. Built with modern web technologies, it provides a secure, responsive, and feature-rich environment with encrypted data storage and multi-user support.

## Features

### Core System
- **Secure Authentication** - PBKDF2 100K iterations + AES-256-GCM encryption
- **Encrypted Storage** - SQLite database encrypted and stored in IndexedDB
- **Multi-User Support** - Root and standard user accounts with permission system
- **File System** - Unix-like in-memory file system with permissions

### User Experience
- **Boot Animation** - Elegant loading sequence with system initialization
- **OOBE (Out-of-Box Experience)** - First-time setup wizard
- **Lock Screen** - Secure lock screen with user selection
- **Window Management** - Drag, resize, minimize, maximize windows
- **Taskbar** - Application launcher and system tray

### Built-in Applications
- **File Manager** - Browse and manage files
- **Terminal** - Command-line interface
- **Settings** - System configuration
- **Clock** - Date and time display

### Internationalization
- English (en)
- Simplified Chinese (zh-CN)
- Traditional Chinese (zh-TW)

## Architecture

```
webos/
├── src/
│   └── index.tsx              # Application entry point
│
├── packages/
│   ├── kernel/                # Core system services
│   │   ├── core/
│   │   │   ├── crypto.ts           # Encryption utilities
│   │   │   ├── encryptedDatabase.ts # SQLite + IndexedDB
│   │   │   ├── secureUserManager.ts # User authentication
│   │   │   └── api.ts              # window.webos API
│   │   ├── fs/                     # File system
│   │   └── app-manager/            # Application registry
│   │
│   ├── ui/                    # UI components
│   │   ├── Boot/               # Boot screen
│   │   ├── LockScreen/         # Lock screen & login
│   │   ├── Desktop/            # Desktop environment
│   │   ├── Taskbar/            # Taskbar
│   │   └── Spinner/            # Loading animation
│   │
│   ├── oobe/                  # First-time setup wizard
│   ├── bootloader/            # System integrity check
│   ├── recovery/              # Recovery mode
│   ├── i18n/                  # Internationalization
│   ├── tablet/                # Touch device support
│   │
│   └── apps/                  # Built-in applications
│       ├── com.os.settings/
│       ├── com.os.filemanager/
│       ├── com.os.terminal/
│       └── com.os.clock/
│
├── public/
│   └── wasm/                  # WebAssembly modules
│
└── docs/                      # Documentation
```

## Quick Start

```bash
# Install dependencies
bun install

# Development mode
bun run dev

# Production build
bun run build

# Lint code
bun run lint
```

## System API

```typescript
// Window Management
window.webos.window.open(appId, options)
window.webos.window.close(windowId)
window.webos.window.focus(windowId)

// File System
window.webos.fs.read(path)
window.webos.fs.write(path, content)
window.webos.fs.mkdir(path)
window.webos.fs.readdir(path)

// Notifications
window.webos.notify.show(title, message, options)

// User Management
window.webos.user.getCurrentUser()
window.webos.user.requestPrivilege(reason)

// System
window.webos.system.reboot()
window.webos.system.shutdown()
```

## Security

### Data Encryption
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Storage**: Encrypted SQLite database in IndexedDB

### Authentication
- Password hashing with unique salt per user
- Session management with automatic lock
- Root account hidden by default

### Development Mode
Add `?dev=1` to URL for development features:
- System reset option
- Debug logging
- Skip authentication (if configured)

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Bun |
| Framework | React 18 |
| Language | TypeScript |
| Build | Webpack 5 |
| Database | sql.js (SQLite in WASM) |
| Encryption | Web Crypto API |
| Styles | CSS Modules |

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

> **Note**: Web Crypto API and IndexedDB are required.

## License

MIT License - See [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/DingDing-bbb">DingDing-bbb</a>
</p>
