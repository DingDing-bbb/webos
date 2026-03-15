# Packages

Core system packages that form the foundation of WebOS.

## Package Overview

| Package | Description |
|---------|-------------|
| `kernel` | Core system services, API, and security layer |
| `ui` | Reusable UI components and visual elements |
| `i18n` | Internationalization and localization |
| `oobe` | Out-of-box experience (first-time setup) |
| `bootloader` | System integrity verification |
| `recovery` | Error recovery and fallback mode |
| `tablet` | Touch and tablet device support |
| `apps` | Built-in system applications |

## Boot Sequence

```
┌─────────────────────────────────────────────────────────────┐
│                     BOOT SEQUENCE                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. bootloader                                              │
│     ├── Service Worker registration                         │
│     ├── System integrity check                              │
│     ├── Core module verification                            │
│     └── Cache warm-up                                       │
│                                                             │
│  2. recovery (on failure)                                   │
│     └── Display recovery interface                          │
│                                                             │
│  3. kernel                                                  │
│     ├── Initialize Web Crypto API                           │
│     ├── Load encrypted database                             │
│     └── Expose window.webos API                             │
│                                                             │
│  4. lockscreen / oobe                                       │
│     ├── Check existing users                                │
│     ├── Show login (if users exist)                         │
│     └── Show OOBE (if first run)                            │
│                                                             │
│  5. desktop                                                 │
│     └── Initialize desktop environment                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Graph

```
bootloader
    └── (no dependencies)

recovery
    └── bootloader

kernel
    └── (no dependencies)

i18n
    └── kernel (types)

ui
    └── kernel (types)

oobe
    ├── kernel
    └── ui

apps
    ├── kernel
    ├── ui
    └── i18n
```

## Error Recovery

When critical errors occur, the system provides multiple recovery options:

| Error Type | Behavior |
|------------|----------|
| Syntax Error | Auto-enter recovery mode |
| Module Load Failure | Display error, allow retry |
| Network Error | Prompt to check connection |
| Cache Error | Offer system reset |
| Database Corruption | Restore from backup or reset |

## Development

Each package can be developed independently:

```bash
# Run from project root
bun run dev

# Lint all packages
bun run lint
```

## Contributing

When adding new packages:
1. Follow the existing directory structure
2. Include a README.md with documentation
3. Export types in `index.ts`
4. Maintain backward compatibility
