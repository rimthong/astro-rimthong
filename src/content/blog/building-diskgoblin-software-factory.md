---
title: 'Building DiskGoblin with Coding Agents'
excerpt: 'What I learned building a read-only Rust and React disk space analyzer using coding agents, upfront specifications, paired task comparisons, and NVMe traversal benchmarks.'
publishDate: 'Nov 07 2026'
isFeatured: true
featureImage:
  src: '/diskgoblin-app.png'
  alt: 'DiskGoblin macOS desktop app displaying a dark squarified treemap on the left, ranked child folders on the right, and an item inspector bar at the bottom'
  caption: 'DiskGoblin running as a macOS desktop app on a demonstration workspace, pairing a Rust scanning engine with a dark React and d3-hierarchy interface inside an AppKit and WKWebView window.'
seo:
  title: 'Building DiskGoblin with Coding Agents'
  description: 'A candid look at building DiskGoblin with coding agents, upfront specs, task routing probes, CI toolchain drift, and NVMe traversal benchmarks.'
  image:
    src: '/diskgoblin-app.png'
  pageType: 'article'
---

I built **[DiskGoblin](/projects/diskgoblin)** to answer a practical question: how far can coding agents carry a systems and UI project when I give them explicit module boundaries, file-scope limits, and automated verification checks up front?

DiskGoblin is a read-only disk space analyzer written in Rust with a React and `d3-hierarchy` visual interface. It runs either as a terminal CLI, in a local browser via `diskgoblin --ui`, or as a macOS desktop app (`DiskGoblin.app`) that hosts the web interface inside an `AppKit` and `WKWebView` window. The source code, ADRs, and benchmark records are available on **[GitHub](https://github.com/RimCorp/DiskGoblin)**.

To keep track of how the agents actually performed, I included a small evaluation tool (`factory_eval`) in the workspace and logged JSON run records for 20 agent executions across 16 implementation tasks. Here is how I structured the project, where I had to step in, and what the agent telemetry and filesystem benchmarks showed.

---

## 1. Defining Boundaries and Acceptance Criteria Before Implementation

Rather than using a single agent for everything, I separated the **architect and orchestrator** role from the **implementation coding agents**. Working with Gemini Argon in Antigravity as the architect and orchestrator, I defined the architecture document, six Architecture Decision Records (ADRs), an agent operating contract (`AGENTS.md`), and dependency-ordered issue specs before dispatching any implementation work. Every issue defined the objective, the exact files the coding agent was allowed to create or modify, what was out of scope, and the verification commands required before opening a pull request:

```bash
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace --all-targets
```

Four architectural rules shaped the codebase from the start:

- **Strict crate boundaries:** `crates/diskgoblin-core` is a pure library crate. It cannot depend on `clap`, read command-line flags, or write to `stdout` or `stderr`.
- **Read-only traversal:** Calling `std::fs::remove_file` or `std::fs::remove_dir_all` on scanned paths is prohibited. Directory traversal must use `std::fs::symlink_metadata` (`lstat`) rather than following symbolic links.
- **Dependency discipline:** Agents could not add crates to `Cargo.toml` or packages to `package.json` unless authorized by the issue specification.
- **Isolated worktrees:** Each task ran in its own Git worktree (`/tmp/worktrees/DG-XXX-...`) branched from `main`, using a pre-warmed local Cargo cache so tasks with disjoint file scopes could run in parallel without stepping on each other.

Upfront specs reduced ambiguity, though they did not eliminate human design adjustments. For example, during DG-002 (core domain models and Unix metadata extraction), the initial issue text suggested storing non-UTF-8 filenames as raw `OsString` values while also requiring standard `std::fs::symlink_metadata` calls, which expect `Path` or `PathBuf`. Because `PathBuf` wraps an `OsString` directly without UTF-8 loss on Unix, I updated the specification to allow `PathBuf` in the domain structs while preserving a raw-bytes round-trip test.

---

## 2. What the Small Agent Experiment Suggested About Task Routing

While Gemini Argon handled orchestration, worktree setup, and gate verification, the implementation tasks themselves were dispatched to three coding-agent configurations across the first 16 recorded issues (DG-001 through DG-015, plus DG-017, for 20 total runs):

- **Configuration A (Harder systems & concurrency coding tasks):** Codex CLI 0.166.0 with openai/gpt-6.1-sol (9 runs)
- **Configuration B (Bounded module, benchmark & UI coding tasks):** OpenCode v2.2.5 with openrouter/deepseek/deepseek-v4.1-flash-1017 (9 runs)
- **Configuration C (Paired comparison probe):** OpenCode v2.2.5 with openrouter/z-ai/glm-5.3-flash (2 runs)

To test all three configurations under matched conditions before routing the rest of the backlog, I ran two three-way comparisons from the same starting commits and specifications:

1. **DG-004 (Formatting logic):** IEC and SI byte formatting, percentage calculations, and ASCII progress bars.
2. **DG-005 (Filesystem traversal):** Symlink-safe sequential directory scanning, mount-boundary checks, and permission error collection.

| Task | Config A (gpt-6.1-sol) | Config B (deepseek-v4.1-flash-1017) | Config C (glm-5.3-flash) | Observation |
| :--- | :--- | :--- | :--- | :--- |
| **DG-004 (Formatting logic)** | 73 s active, 0 repairs, 10 tool calls (Subscription; per-run cost unavailable) | 63 s active, 0 repairs, 20 tool calls ($0.013 metered) | 194 s active, 1 repair, 26 tool calls ($0.036 metered) | Config B finished fastest at $0.013 metered API cost. Config C needed a repair loop after an initial test failure. |
| **DG-005 (Filesystem I/O)** | 106 s active, 0 repairs, 9 tool calls (Subscription; per-run cost unavailable) | 156 s active, 0 repairs, 50 tool calls ($0.044 metered) | 382 s active, 1 repair, 47 tool calls ($0.086 metered) | Config A finished in 106 s with 9 tool calls. Config B passed on the first attempt with more exploration steps. |

A few caveats apply to these numbers:

- **Small sample size and task-assignment confounding:** The two paired tasks only have one run per configuration (`n = 1` per cell), so they are directional probes rather than a general model benchmark. Across the remaining issues, I intentionally routed tasks based on complexity, which confounds aggregate comparisons across the 20-run cohort.
- **What "active minutes" measures:** Active time in `factory_eval` records the wall-clock seconds between launching an agent in a prepared worktree and the agent finishing its local verification gates (minus rate-limit pauses, which were zero). It excludes the time I spent writing specifications, setting up worktrees, reviewing pull requests, waiting for GitHub Actions CI, and directing the later UI redesigns (DG-016, DG-018, DG-019, and DG-020 were not part of the 20-run telemetry ledger).
- **Metered vs. subscription costs:** Configurations B and C ran through OpenRouter with metered per-run billing ($0.274 total across 9 runs for Config B, or $0.030 per run; $0.122 total across 2 runs for Config C, or $0.061 per run). Configuration A ran under a subscription plan that did not expose per-run dollar charges. In the appendix below, I include a separate sensitivity estimate showing what Configuration A's token volume would cost under hypothetical API pricing, but metered and imputed figures should not be read as identical measurements.

These results informed my routing choices for the rest of this project. After Config C required repair loops and took more than twice as long as Config B on both probes, I stopped using Config C. I routed the stateful filesystem, concurrency, cancellation, and IPC tasks (such as DG-006 bottom-up tree aggregation, DG-007 cooperative cancellation, DG-012 Rayon parallel traversal, and DG-014 Tauri commands) to Config A, and assigned bounded modules, Criterion benchmarks, `proptest` suites, and initial React components (such as DG-008, DG-011, DG-013, and DG-015) to Config B.

---

## 3. Toolchain Differences Between Local Development and CI

Every recorded run eventually passed local verification, but one recurring friction point had nothing to do with model reasoning: compiler version drift between my local machine and GitHub Actions.

Local worktrees ran `rustc 1.85.0`, whereas the GitHub Actions Linux runner installed a newer stable toolchain (`rustc 1.99.0`). On DG-007 (cooperative cancellation and progress throttling), the agent wrote `entries_seen % 256 == 0` to check cancellation every 256 entries. That expression passed `cargo clippy --workspace --all-targets -- -D warnings` locally on 1.85.0, but failed in CI under `rustc 1.99.0`, which introduced the `clippy::manual_is_multiple_of` lint. Calling `.is_multiple_of(256)` was not an option either, because that method did not exist on `rustc 1.85.0`.

Switching power-of-two checks to a bitwise mask (`entries_seen & 255 == 0`) satisfied both compiler versions. The same local-versus-CI lint gap appeared again on DG-017 before I standardized the check. For future multi-agent repositories, pinning a `rust-toolchain.toml` file in the first commit is a simple way to keep local pre-flight checks aligned with CI.

---

## 4. Why Benchmark Results Led Us to Retain Sequential Traversal as the Default

When planning Milestone 2 (DG-012), I wanted to avoid assuming that adding Rayon threads automatically improves disk scanning across every directory shape. In ADR-005, I set an explicit threshold before any benchmark code was written: multi-threaded traversal would only replace `--threads 1` as the default if a parallel worker count achieved at least a 1.5x speedup across all three synthetic benchmark topologies (`wide_tree`, `deep_tree`, and `hardlink_cache_tree`) without correctness regressions.

Parallelizing a hard-link-aware scanner also requires careful ordering. On Unix, when multiple directory entries share an inode (`st_nlink > 1`), DiskGoblin counts the physical blocks on the first encounter of `(dev, ino)` and attributes zero additional bytes to subsequent hard links. If worker threads aggregate directories in nondeterministic completion order, byte totals shift between folders from run to run.

To keep parallel scans deterministic, the scanner in DG-012 uses Rayon workers to run `read_dir` and `lstat` in parallel and sort each directory's entries lexicographically, then replays the discovered tree in canonical depth-first order during aggregation. On our synthetic multi-branch fixtures and randomized `proptest` directory trees (DG-013), `--threads 1`, `--threads 2`, `--threads 4`, and `--threads 8` produced identical `ScanReport` structures once `duration_ms` was normalized.

Running Criterion (`cargo bench -p diskgoblin-core --bench scanner_bench`) on an Apple M2 Pro (10 cores, 16 GB RAM, internal APFS NVMe SSD) produced these median timings:

| Fixture Topology | 1 Thread (Sequential) | 2 Threads | 4 Threads | 8 Threads | Peak Speedup vs. 1 Thread |
| :--- | ---: | ---: | ---: | ---: | :--- |
| **`wide_tree`** (50 dirs x 200 files, 10,000 files) | 39.037 ms | 23.532 ms (1.66x) | 20.935 ms (1.86x) | 17.145 ms (2.28x) | 2.28x at 8 threads |
| **`deep_tree`** (20 nested levels x 125 files, 2,500 files) | 11.356 ms | 8.258 ms (1.38x) | 8.268 ms (1.37x) | 8.156 ms (1.39x) | 1.39x at 8 threads |
| **`hardlink_cache_tree`** (2,000 files + 3,000 hard links) | 35.263 ms | 23.016 ms (1.53x) | 26.847 ms (1.31x) | 24.359 ms (1.45x) | 1.53x at 2 threads |

The three topologies behaved very differently:

- **Wide trees scaled well (2.28x at 8 threads):** With 50 sibling directories at the root, worker threads could overlap `read_dir` and `lstat` calls across independent subtrees, reducing median scan time from 39.037 ms to 17.145 ms.
- **Deep chains hit serial dependency limits (1.39x peak):** Because depth `d + 1` cannot be opened until its parent directory at depth `d` is read, adding workers beyond 2 threads yielded negligible gains (8.258 ms at 2 threads vs. 8.156 ms at 8 threads).
- **Hard-link-dense directories peaked at 2 threads (1.53x) and slowed down at 4 threads (1.31x):** In `hardlink_cache_tree`, 5,000 entries sit inside only two parent directories (`store/` and `links/`). A plausible explanation is that once more than two workers contend on metadata calls across a small number of parent directories, APFS/VFS lock contention and Rayon scheduling overhead outweigh the parallel I/O gain, though confirming the exact kernel bottleneck would require lock profiling beyond wall-clock Criterion timings.

Because no single thread count cleared the 1.5x threshold across all three topologies, we followed ADR-005 and kept `--threads 1` as the default CLI setting while exposing `-j 0` (automatic thread pool) and `-j N` for wide directory trees.

---

## 5. Turning the Functional Prototype into the Dark Desktop App

The initial UI tasks (DG-014 through DG-016) produced a working React and `d3-hierarchy` treemap backed by a Tauri 2 command layer in `apps/diskgoblin-desktop/src-tauri` (with native Tauri shell crates feature-gated in `Cargo.toml` so headless CI tests could compile the Rust command bindings without system GUI libraries).

When I ran that prototype against real folders, two practical gaps stood out: I wanted a way to launch the visual interface directly from the CLI (`diskgoblin --ui`) or as a standalone macOS app bundle without a heavy native build step, and the initial light-themed layout blurred the distinction between whole-scan totals, the currently viewed subfolder, and the selected item.

<figure class="my-8">
  <button
    type="button"
    class="group relative block w-full cursor-zoom-in rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    aria-label="Enlarge DiskGoblin macOS desktop app screenshot"
    aria-haspopup="dialog"
    data-lightbox-src="/diskgoblin-app.png"
    data-lightbox-alt="DiskGoblin macOS desktop app displaying a dark squarified treemap on the left, ranked child folders on the right, and an item inspector bar at the bottom"
    data-lightbox-caption="DiskGoblin running as a macOS desktop app on a demonstration workspace, showing whole-scan totals at the top, immediate-child treemap tiles and ranked items in the center, and the item inspector below."
  >
    <img src="/diskgoblin-app.png" alt="DiskGoblin macOS desktop app displaying a dark squarified treemap on the left, ranked child folders on the right, and an item inspector bar at the bottom" class="w-full h-auto rounded-2xl shadow-md transition duration-200 group-hover:shadow-lg" loading="lazy" decoding="async" />
    <span class="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 group-hover:text-primary">
      Click or press Enter to enlarge screenshot
    </span>
  </button>
</figure>

To close those gaps, I prepared a visual design reference and two follow-up specifications (DG-019 and DG-020):

- **Three-tier frontend transport (`ipc.ts`):** The React frontend detects at runtime whether to call Tauri IPC, connect to the CLI's dependency-free `std::net::TcpListener` HTTP bridge on `127.0.0.1` (`diskgoblin --ui`), or fall back to an deterministic in-memory dataset during `vitest` component tests.
- **`AppKit` and `WKWebView` macOS packaging (`DiskGoblin.app`):** A compact Swift host launches the bundled `diskgoblin-engine` binary on an ephemeral localhost port and renders the compiled React and `d3-hierarchy` frontend inside a dark `WKWebView` window, providing native macOS window management, folder selection, and Reveal in Finder (`open -R`) without implying that the workspace itself is built from native AppKit widgets.
- **Scoped folder math and selection:** The top summary bar stays pinned to the root scan totals, while the treemap and the Largest items list (Folders and Files tabs) display only the immediate children of the viewed directory, using the viewed directory's byte total as the percentage denominator. Single-clicking inspects an item in the bottom bar; double-clicking navigates into a folder in memory.

---

## Practical Lessons

1. **Put architectural invariants in executable gates, not chat instructions:** Encoding crate boundaries, `lstat`-only traversal, and formatting/Clippy checks in `AGENTS.md` and CI caught integration issues before code review.
2. **Use small paired tasks to calibrate routing on your own repo:** Running two representative tasks across candidate configurations was enough to spot a poor fit early and decide how to split systems work and bounded module work for the rest of the backlog.
3. **Separate agent active time from end-to-end engineering time:** Fast agent execution (median 1.8 to 2.6 active minutes on accepted tasks) only worked because I invested time up front in specifications, fixture design, and review.
4. **Pin toolchains before running autonomous checks:** Aligning local and CI compiler versions avoids wasted repair cycles on newly introduced lints.

For a closer look at DiskGoblin's features and execution modes, visit the **[DiskGoblin project page](/projects/diskgoblin)**. If you are exploring structured agent workflows for your own engineering team, you can read more on my **[services page](/services)** or **[get in touch](/contact)**.

---

<details class="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
<summary class="cursor-pointer font-semibold text-slate-900">Appendix: Telemetry Methodology, Cost Assumptions, and Cohort Summary Table</summary>

### Scope of Recorded Telemetry

The telemetry ledger (`docs/experiments/runs/*.json`) contains 20 schema-validated records covering 16 issues: DG-001 through DG-015 and DG-017. Four tasks (DG-004 and DG-005) include paired comparison runs across all three configurations (`16 + 4 = 20` runs). Later UI tasks (DG-016, DG-018, DG-019, and DG-020) were verified through the same test and build gates but were not logged in the 20-run comparative study.

### Cohort Summary (`factory_eval`)

| Harness | Provider / Model | Attempted | First-Pass % | Eventual % | Median Active Min | Mean Active Min | Cost Basis | Total Tokens Reported | Mean Repairs |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | :--- | ---: | ---: |
| Codex CLI 0.166.0 | openai/gpt-6.1-sol | 9 | 88.9% | 100.0% | 1.8 | 2.4 | Subscription; per-run cost unavailable | 4,390,023 | 0.00 |
| OpenCode v2.2.5 | openrouter/deepseek/deepseek-v4.1-flash-1017 | 9 | 88.9% | 100.0% | 2.6 | 2.6 | $0.030 metered mean ($0.274 total) | 764,569 uncached (+12,213,560 cached) | 0.11 |
| OpenCode v2.2.5 | openrouter/z-ai/glm-5.3-flash | 2 | 0.0% | 100.0% | 4.8 | 4.8 | $0.061 metered mean ($0.122 total) | 373,618 uncached (+4,295,127 cached) | 1.00 |

*(Note: In Configuration A, the single non-first-pass run was DG-002, where I clarified the `PathBuf` vs. `OsString` specification requirement mid-flight rather than an automated compile/test repair loop. In Configuration B, DG-003 required one self-repair iteration after an initial test failure.)*

### Token Accounting and Cost Estimation Assumptions

The two harnesses report input tokens differently:

- **Codex CLI (Configuration A):** `tokens_input` (4,321,150 across 9 runs) includes `tokens_cached_input` (4,009,728, or 92.8% cache hit rate), leaving 311,422 uncached input tokens and 68,873 output tokens. Because Configuration A ran on a subscription account without per-run billing records and actual list tariffs were not archived in the telemetry logs, per-run dollar costs are marked unavailable. As an illustrative sensitivity calculation only, pricing 311,422 uncached input tokens at $1.00/M, 4,009,728 cached input tokens at $0.10/M, and 68,873 output tokens at $5.00/M yields an estimated $1.06 total ($0.117 per run).
- **OpenCode (Configurations B and C):** `tokens_input` reports uncached input tokens separately from `tokens_cached_input`, and `estimated_cost_usd` records the metered OpenRouter API charge for each run.

### Cancellation Latency Note

Cooperative cancellation (`CancelToken`) was verified in automated integration tests to abort active scans within 100 ms on synthetic local filesystem fixtures by checking the atomic flag every 256 visited entries and before descending into subdirectories. Because standard POSIX `read_dir` and `lstat` calls are synchronous, cancellation cannot preempt an individual kernel syscall that is already blocked on an unresponsive network mount until that syscall returns.

</details>
