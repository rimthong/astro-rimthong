---
title: DiskGoblin — Read-Only Disk Space Analyzer
featureImage:
  src: '/diskgoblin-app.png'
  alt: DiskGoblin dark native macOS desktop application showing an interactive squarified treemap and ranked directory list
  caption: DiskGoblin running as a native macOS desktop utility — interactive squarified treemap on the left, immediate-child rankings on the right, and a Finder inspector below.
seo:
  title: DiskGoblin — Rust Disk Space Analyzer & Software Factory Case Study
  description: A strictly read-only, symlink-safe disk space analyzer in Rust with a fast CLI and dark native macOS treemap UI, built via an autonomous software factory.
  image:
    src: '/diskgoblin-app.png'
---

> **See what's gobblin' your disk space — from the terminal to the treemap.**

**DiskGoblin** is a fast, strictly read-only disk usage analyzer written in Rust. It pairs a scriptable terminal CLI with an interactive dark desktop application built on React, TypeScript, `d3-hierarchy`, and a native macOS `WKWebView` / Tauri 2 architecture.

Beyond being a daily-driver utility for inspecting bloated caches, build artifacts, and media folders, DiskGoblin was designed as a **production testbed for an autonomous software factory** — complete with an embedded telemetry evaluator (`factory_eval`) that audited every agent run from initial Cargo workspace setup to the final desktop UI.

- **Source Code:** [github.com/RimCorp/DiskGoblin](https://github.com/RimCorp/DiskGoblin)
- **Engineering Deep Dive:** [How We Built DiskGoblin: Running a Multi-Agent Software Factory (and What the Benchmarks Actually Showed)](/blog/building-diskgoblin-software-factory)

---

## What It Does

Most disk analyzers force a trade-off: either you get a fast terminal tool (`du`, `ncdu`) that's hard to visually parse across deep hierarchies, or a heavy GUI utility that wants full-disk deletion permissions and miscounts hard-linked package caches (`pnpm`, Git object stores, Time Machine snapshots).

DiskGoblin solves both problems around four strict invariants:

1. **Strictly Read-Only by Construction:** DiskGoblin never deletes, truncates, or mutates user files. It inspects filesystem metadata exclusively via `std::fs::symlink_metadata` (`lstat`) and never follows symbolic links into recursive cycles.
2. **Dual Physical & Logical Accounting:** Every file and directory simultaneously tracks **physical disk allocation** (`st_blocks * 512` on Unix — accurate for sparse files and APFS/ext4 block allocation) and **logical apparent size** (`st_size`). In the desktop UI, toggling between `Allocated` and `Apparent` recomputes the entire treemap, rankings, and percentage bars in memory without rescanning the disk.
3. **Hard-Link Deduplication:** Unix files with `st_nlink > 1` are tracked by `(dev, ino)` identity and counted once toward directory totals and top-file rankings, with deterministic lexicographical first-encounter attribution.
4. **Deterministic Parallel Traversal:** When run with multiple worker threads (`-j 0` or `-j N`), a bounded Rayon worker pool overlaps directory enumeration and `lstat` syscalls, then replays sorted sibling trees in canonical depth-first order so totals, hard-link attribution, and top-K rankings are **bit-for-bit identical** to single-threaded runs.

---

## Three Ways to Run One Engine

All three execution modes share the exact same pure-Rust `diskgoblin-core` scanning engine and a 3-tier frontend adapter (`ipc.ts`):

| Mode | Command | Best For |
| :--- | :--- | :--- |
| **1. Terminal CLI & JSON** | `diskgoblin /path --top 20` *(or `--json`)* | SSH sessions, shell pipelines (`jq`), CI artifact size checks |
| **2. CLI Visual Bridge** | `diskgoblin --ui /path` | Launching an interactive treemap straight from the terminal over a zero-dependency `127.0.0.1` HTTP bridge |
| **3. Native macOS App** | `open DiskGoblin.app` | Standalone dark desktop utility with native macOS window controls, folder picker dialog, and **Reveal in Finder** |

### Designing the Dark Desktop Workspace

The visual interface was designed around a clear five-part information model so numbers never silently change meaning as you explore:

- **Whole-Scan Header Summary:** Always reports the root scan totals (`733 MiB scanned · 8 files · 14 folders · 0 errors`), keeping your global bearings while you drill into subdirectories.
- **Immediate-Child Treemap & Ranked List:** Both the left-hand squarified treemap and the right-hand `Largest items` panel (`Folders` / `Files` tabs) are scoped to the **currently viewed folder**. Every percentage bar uses the viewed folder's total size as its denominator, eliminating descendant double-counting.
- **Separate Selection vs. Navigation:** Single-clicking any tile or list row selects it into the bottom **Inspector Bar** (showing its full monospace path, measured size, and a one-click **Reveal in Finder** button). Double-clicking (or pressing `Enter`) drills into a folder instantaneously in memory without triggering a new filesystem scan.

---

## Architecture at a Glance

The repository is structured as a strict boundary-enforced workspace:

- **`crates/diskgoblin-core`:** Pure Rust library containing domain models, Unix/fallback metadata extraction, sequential and Rayon parallel scanners, bottom-up tree aggregation, cooperative `CancelToken` (`< 100 ms` cancellation latency), 50 ms throttled progress reporting, versioned JSON schema (`schema_version: 1`), and the `factory_metrics` telemetry validator. Zero CLI or GUI dependencies.
- **`crates/diskgoblin-cli`:** Thin binary wrapper (`clap` argument parser, ASCII table renderer, `SIGINT` handler, dependency-free `std::net::TcpListener` `--ui` bridge) plus the `factory_eval` benchmark reporter.
- **`apps/diskgoblin-desktop`:** React 18 + TypeScript + `d3-hierarchy` frontend paired with a `src-tauri` backend and a native macOS `AppKit` + `WKWebView` bundle builder (`npm run package:macos`).

---

## Built by an Autonomous Software Factory

DiskGoblin wasn't vibe-coded in an unstructured chat loop. Before a single line of Rust was written, we authored a complete engineering charter:

- An execution contract ([`AGENTS.md`](https://github.com/RimCorp/DiskGoblin/blob/main/AGENTS.md)) enforcing scope containment, read-only safety, panic hygiene, and mandatory pre-PR quality gates (`cargo fmt --check`, `cargo clippy -D warnings`, `cargo test`, `proptest`, and `vitest`).
- **6 Architecture Decision Records (`ADR-001`–`ADR-006`)** locking down crate boundaries, `lstat` traversal, hard-link deduplication, cooperative cancellation, and the empirical benchmark threshold required to enable parallel traversal by default.
- **18 atomic GitHub issues (`DG-001`–`DG-018`)** dispatched across isolated Git worktrees to multiple coding agents and models (**Codex CLI + `gpt-6.1-sol`**, **OpenCode + `deepseek-v4.1-flash-1017`**, and **OpenCode + `glm-5.3-flash`**).

Want to see how the models stacked up against each other — and why our Criterion NVMe benchmarks convinced us to keep single-threaded traversal as the CLI default? **[Read the full engineering post here &rarr;](/blog/building-diskgoblin-software-factory)**
