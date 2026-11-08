---
title: 'DiskGoblin: Read-Only Disk Space Analyzer'
featureImage:
  src: '/diskgoblin-app.png'
  alt: 'DiskGoblin macOS desktop app displaying a dark squarified treemap on the left, ranked child folders on the right, and an item inspector bar at the bottom'
  caption: 'DiskGoblin running as a macOS desktop app on a demonstration workspace, showing whole-scan totals at the top, immediate-child treemap tiles and ranked items in the center, and the item inspector below.'
seo:
  title: 'DiskGoblin: Read-Only Disk Space Analyzer'
  description: 'A read-only disk space analyzer for finding which folders and files occupy disk space from a desktop interface or the terminal.'
  image:
    src: '/diskgoblin-app.png'
---

**DiskGoblin** helps you see which folders and files are taking up disk space, using either a dark desktop interface or the terminal. It is strictly read-only, so you can inspect large project trees, caches, and media folders without risking accidental deletion or modification.

Source code is currently private while I prepare it for release. For the story of how I built and benchmarked the project with coding agents, read **[Building DiskGoblin with Coding Agents](/blog/building-diskgoblin-software-factory)**.

---

## Features

- **Read-only scanning:** DiskGoblin never deletes, truncates, or modifies scanned files. Traversal uses `std::fs::symlink_metadata` (`lstat`) so symbolic links are recorded without following them into directory cycles, and unreadable directories are logged as non-fatal scan errors rather than aborting the run.
- **Allocated and apparent size views:** Every scan records both physical disk allocation and logical byte length (`st_size`). Switching between Allocated and Apparent in the toolbar updates the treemap, rankings, and percentage bars in memory without rescanning the disk. On Unix systems, physical allocation is calculated from `st_blocks * 512`; on non-Unix fallback builds, allocated size falls back to apparent byte length.
- **Hard-link-aware accounting:** On Unix filesystems, files with `st_nlink > 1` are tracked by device and inode identity `(dev, ino)` and counted once toward directory totals and largest-file rankings. When parallel scanning (`-j N`) is enabled, discovered entries are replayed in canonical lexicographical order so first-encounter attribution matches single-threaded scans on the same directory state.
- **Interactive treemap and ranked items:** The visual workspace pairs a squarified treemap with a ranked list of immediate child folders and files, letting you compare relative proportions visually or scan sorted byte totals side by side.

---

## Workspace Layout

The visual interface organizes scan data into three distinct regions so totals and percentages stay consistent as you drill into subdirectories:

- **Whole-scan totals:** The top summary line keeps the root scan metrics visible (total bytes scanned, file count, folder count, and error count) even when you navigate deeper into the tree.
- **Viewed-folder contents:** Both the treemap and the Largest items list (with Folders and Files tabs) show only the immediate children of the folder you are currently viewing. Each item's percentage bar uses the viewed folder's byte total as its denominator, avoiding double-counting nested descendants.
- **Selected-item details:** Single-clicking a treemap tile or list row loads that item into the bottom inspector bar with its full path, measured size, and a Reveal in Finder action. Double-clicking a folder (or pressing Enter) navigates into it in memory without rescanning the filesystem.

---

## Execution Modes and Availability

In the current codebase, three execution modes share the same Rust scanning engine and web frontend:

| Mode | Command | Description |
| :--- | :--- | :--- |
| **Terminal CLI** | `diskgoblin /path --top 20` | Prints human-readable ASCII summary tables or versioned JSON (`--json`) for scripts and terminal sessions. |
| **Browser Visual Mode** | `diskgoblin --ui /path` | Starts a localhost HTTP server on `127.0.0.1` and opens the dark React and `d3-hierarchy` interface in your default web browser. |
| **macOS Desktop App** | `open DiskGoblin.app` | Packages the CLI engine and compiled web UI inside a lightweight `AppKit` and `WKWebView` macOS application window with native folder-picker and Finder integration. |

The repository also includes a Tauri 2 command backend under `apps/diskgoblin-desktop/src-tauri` that exposes the same scan, cancel, and progress IPC contract; its native shell dependencies are currently feature-gated in `Cargo.toml` while the `AppKit` and `WKWebView` bundle serves as the primary macOS desktop build. Public binaries and source releases are not yet published.

---

## Architecture and How It Was Built

DiskGoblin is organized as a Rust and TypeScript workspace: `crates/diskgoblin-core` implements the platform metadata layer, sequential and Rayon parallel scanners, bottom-up tree aggregator, cooperative cancellation token, and JSON schema without CLI or GUI dependencies; `crates/diskgoblin-cli` provides the command-line binary and localhost `--ui` server; and `apps/diskgoblin-desktop` contains the React 18, TypeScript, and `d3-hierarchy` frontend along with the macOS packaging scripts.

I built DiskGoblin to test how coding agents perform when given upfront architecture boundaries, explicit file-scope rules, and automated verification gates, while logging run telemetry across 20 implementation tasks. Read the full retrospective and benchmark analysis in **[Building DiskGoblin with Coding Agents](/blog/building-diskgoblin-software-factory)**.
