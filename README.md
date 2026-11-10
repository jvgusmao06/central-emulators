# Emulator Hub (Central Emulators)

> A modern emulator hub built using **Tauri v2**, **Rust**, and **React (TypeScript)**.

## Overview

**Central Emulators** acts as a unified frontend and launcher for multiple retro emulators. Instead of bundling emulators directly into this repository, each emulator core is developed, maintained, and released in its own independent repository.

- **Frontend & Launcher:** Built with React 19, TypeScript, and Vite.
- **Backend & Core Management:** Powered by Tauri v2 and Rust (handles emulator downloading, process execution, configuration, and updates).

## Supported / Planned Cores

| Core | Language | Repository | Status |
| :--- | :--- | :--- | :--- |
| **CHIP-8** | C | [jvgusmao06/Chip-8](https://github.com/jvgusmao06/Chip-8) | In Development |
| **Game Boy** | TBD | Planned | Planned |
| **NES** | TBD | Planned | Planned |

## Architecture

```
                    ┌───────────────────────────┐
                    │     Central Emulators     │
                    │   (Tauri v2 + React TS)   │
                    └─────────────┬─────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│   Chip-8 Core     │    │  Game Boy Core    │    │    NES Core       │
│ (Standalone/DLL)  │    │  (Standalone/DLL) │    │  (Standalone/DLL) │
└───────────────────┘    └───────────────────┘    └───────────────────┘
```

- Each emulator is released via GitHub Releases in its dedicated repository.
- The Hub downloads or invokes the respective emulator binary / core on demand.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Rust](https://www.rust-lang.org/) (cargo, rustc)
- [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/) for your operating system

### Setup

```bash
# Install dependencies
npm install

# Run frontend in development mode
npm run dev

# Run full Tauri application
npm run tauri dev

# Build production bundle
npm run tauri build
```
