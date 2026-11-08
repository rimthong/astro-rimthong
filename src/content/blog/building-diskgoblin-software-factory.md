---
title: 'How We Built DiskGoblin: Running a Multi-Agent Software Factory (and What the Benchmarks Showed)'
excerpt: 'Most AI coding demos stop at a single prompt and a toy app. To test how an autonomous software factory actually behaves on systems code, we built DiskGoblin — a Rust and React/D3 disk space analyzer — across 20+ metered agent runs, benchmarking three LLM configurations and our own parallel NVMe engine along the way.'
publishDate: 'Nov 07 2026'
isFeatured: true
featureImage:
  src: '/diskgoblin-app.png'
  alt: DiskGoblin dark native macOS desktop application showing a squarified treemap and ranked directory list
  caption: 'DiskGoblin running as a native macOS app — built end-to-end by an orchestrated software factory across Rust, React, D3, and AppKit/WebKit.'
seo:
  title: 'Building DiskGoblin with an Autonomous Multi-Agent Software Factory'
  description: 'How we built a Rust + React/D3 disk analyzer via an autonomous software factory, plus empirical benchmarks on LLMs and NVMe parallel traversal.'
  image:
    src: '/diskgoblin-app.png'
  pageType: 'article'
---

Everyone has seen the 60-second demo where an AI agent one-shots a Todo app. If you lead engineering teams or build production software, you already know why those demos don't translate to real work: the moment you introduce cross-crate boundaries, OS-level syscalls, concurrency invariants, and strict backwards-compatible schemas, "vibe coding" collapses into an unmaintainable tangle of regressions.

I wanted to test a different question: **What happens when you treat autonomous coding agents not as a chat partner, but as a disciplined software factory?**

To find out, I built **[DiskGoblin](/projects/diskgoblin)** ([GitHub](https://github.com/RimCorp/DiskGoblin)) — a strictly read-only, symlink-safe, hard-link deduplicated disk space analyzer in Rust with a terminal CLI, a localhost web bridge, and a dark native macOS desktop app built with React and `d3-hierarchy`.

And because I don't trust anecdotes without telemetry, we built the factory's own evaluation harness (`factory_eval`) directly into the repository. Every single task dispatched to an agent was logged as a schema-validated JSON record tracking active wall-clock seconds, token consumption, cache hit rates, compile/test failures, repair loops, and API cost.

Here is how we set up the factory, how we orchestrated the build, and what both our **LLM factory benchmarks** and our **Apple M2 Pro NVMe systems benchmarks** actually told us.

---

## 1. The Setup: Architecture First, Agents Second

The biggest mistake people make with coding agents is handing them a vague goal and letting them invent the architecture mid-flight. In a real engineering org, you don't ask five developers to write code in parallel before agreeing on interfaces.

Before a single line of Rust or TypeScript was written (`M0`), we froze the entire engineering charter in the repository:

1. **The Execution Contract (`AGENTS.md`):** Every coding agent operating in the repo had to obey a strict operating contract:
   - **Strict Scope Containment:** An agent may only create or modify the exact files listed in its assigned issue's `## Scope` section. Touching an out-of-scope file is an automatic rejection.
   - **Crate Boundary Enforcement (`ADR-001`):** `diskgoblin-core` is a pure library crate. It is forbidden from depending on `clap`, reading CLI args, or printing to `stdout`/`stderr`.
   - **Safety by Default (`ADR-003`):** DiskGoblin is strictly read-only. Calling `std::fs::remove_file` or `remove_dir_all` on scanned paths is banned, and traversal must exclusively use `std::fs::symlink_metadata` (`lstat`) so symlink loops can never hang the scanner.
   - **Dependency Discipline:** Zero new crates in `Cargo.toml` or packages in `package.json` unless explicitly authorized by the issue spec.
   - **Mandatory Quality Gates:** No agent can open a PR until `cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets -- -D warnings`, and `cargo test --workspace --all-targets` pass with zero warnings.
2. **Six Architecture Decision Records (`ADR-001` to `ADR-006`):** Covering workspace layout, `lstat` vs. `stat`, `(dev, ino)` hard-link deduplication, cooperative `CancelToken` throttling, parallel traversal gates, and desktop visualization boundaries.
3. **18 Atomic, Dependency-Ordered Issues (`DG-001` to `DG-018`):** Each issue had explicit acceptance criteria, allowed file sets, and deterministic verification commands across four milestones:
   - **M0 (Foundation):** Workspace & CI (`DG-001`), Core Domain & Unix Metadata (`DG-002`), Synthetic Test Fixtures (`DG-003`).
   - **M1 (Sequential Engine & CLI):** Byte Formatting (`DG-004`), Sequential Scanner (`DG-005`), Bottom-Up Tree Aggregator & Hard-Link Dedup (`DG-006`), Cooperative Cancellation & 50ms Throttled Progress (`DG-007`), Versioned JSON Schema (`DG-008`), CLI Parser & Table Renderer (`DG-009`), E2E CLI Integration Tests (`DG-010`).
   - **M2 (Performance & Correctness Oracles):** Criterion Benchmarks (`DG-011`), Rayon Parallel Traversal Engine & SSD Study (`DG-012`), `proptest` Equivalence Suite (`DG-013`).
   - **M3 & M4 (Desktop App & Factory Evaluation):** Tauri 2 IPC Backend (`DG-014`), React + D3 Squarified Treemap (`DG-015`), Toolbar, Rankings & Vitest Suite (`DG-016`), `factory_eval` Telemetry Tool (`DG-017`), and the 20-Run Comparative Study (`DG-018`) — followed by unified `--ui` bridge (`DG-019`) and the dark native macOS redesign (`DG-020`).

### How Orchestration Worked in Practice

Instead of running agents in a shared working directory where they step on each other's git state, the orchestrator dispatched each issue into an **isolated Git worktree** (`/tmp/worktrees/DG-XXX-...`) branched off `main`, paired with a pre-warmed offline Cargo dependency cache (`/tmp/dg009-cargo-home`).

Whenever two issues had disjoint write sets and satisfied dependencies in the DAG — for instance, `DG-014` (Rust desktop IPC backend) and `DG-017` (`factory_eval` CLI evaluator), or `DG-015` (D3 treemap) and `DG-017` — we ran them concurrently in separate worktrees, verified their gates independently, and merged them sequentially through GitHub Pull Requests.

---

## 2. Benchmarking the Factory: Three Agent Configurations Across 20 Runs

We evaluated three distinct **Harness × Model** configurations across the first 20 recorded runs:

- **Configuration A:** `Codex CLI 0.166.0` × `openai/gpt-6.1-sol` (9 runs)
- **Configuration B:** `OpenCode v2.2.5` × `openrouter/deepseek/deepseek-v4.1-flash-1017` (9 runs)
- **Configuration C:** `OpenCode v2.2.5` × `openrouter/z-ai/glm-5.3-flash` (2 runs)

Here is the verbatim summary table generated by running `cargo run -p diskgoblin-cli --bin factory_eval -- docs/experiments/runs/` against the repository's run ledger:

| Harness | Provider / Model | Attempted | First-Pass % | Eventual % | Median Active Min | Mean Active Min | Mean Cost ($) | Total Tokens | Mean Repairs |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `codex` | `openai / gpt-6.1-sol` | 9 | 88.9% | 100.0% | 1.8 | 2.4 | $0.00 *(sub)* | 4,390,023 | 0.00 |
| `opencode` | `deepseek / deepseek-v4.1-flash-1017` | 9 | 88.9% | 100.0% | 2.6 | 2.6 | $0.03 | 764,569 | 0.11 |
| `opencode` | `z-ai / glm-5.3-flash` | 2 | 0.0% | 100.0% | 4.8 | 4.8 | $0.06 | 373,618 | 1.00 |

*(Note on token & cost accounting: Configuration A ran under a subscription plan with cached input tokens included in its 4.39M total — achieving a 92.8% prompt cache hit rate — whereas OpenCode reported uncached input tokens separately from its 12.2M cached token reads at a 95.6% cache hit rate. Under a sensitivity model of $1/M uncached input, $0.10/M cached input, and $5/M output, Configuration A's imputed cost is roughly **$0.12 per accepted PR** vs. Configuration B's metered **$0.03 per accepted PR**.)*

### Head-to-Head Paired Experiments: `DG-004` vs. `DG-005`

Because routing complex concurrency tasks to `gpt-6.1-sol` and bounded tasks to `deepseek-v4.1-flash` introduces a task-selection confounder, we also ran **controlled three-way head-to-head comparisons** from identical starting commit SHAs and identical `AGENTS.md` / issue specifications on two representative tasks:

1. **`DG-004` (Pure Logic — IEC/SI Byte Formatting, Percentage & ASCII Bar Renderer)**
2. **`DG-005` (Systems I/O — Symlink-Safe Sequential Directory Scanner & Mount Boundary Pruning)**

| Task | Config A (`gpt-6.1-sol`) | Config B (`deepseek-v4.1-flash`) | Config C (`glm-5.3-flash`) | Takeaway |
| :--- | :--- | :--- | :--- | :--- |
| **`DG-004` (Pure Logic)** | `73 s` · 0 repairs · 10 tool calls | **`63 s` · 0 repairs · $0.013** | `194 s` · 1 repair · $0.036 | **B wins:** 1.16× faster than A at just 1.3 cents. C took 3.08× B's time and 2.80× B's cost. |
| **`DG-005` (Systems I/O)** | **`106 s` · 0 repairs · 9 tool calls** | `156 s` · 0 repairs · $0.044 | `382 s` · 1 repair · $0.086 | **A wins:** 1.47× faster than B with 5.5× fewer tool calls. C took 3.60× A's time and needed a repair loop. |

### Three Lessons from the Factory Telemetry

1. **Retire underperforming models early with paired probes:** On both paired tasks, `glm-5.3-flash` (Config C) hit compile/Clippy errors requiring repair loops, ran **2.45–3.08× slower** than `deepseek-v4.1-flash` in the exact same OpenCode harness, and cost **2.14× more** in API spend ($0.122 vs. $0.057 across the pair). Two controlled probes were enough evidence to retire Config C after `DG-005`.
2. **Hybrid routing is the sweet spot:**
   - For **stateful systems programming, concurrency, and cross-boundary IPC** (`DG-005` scanner, `DG-006` bottom-up tree aggregator + hard-link deduplication in `108s`, `DG-007` cooperative cancellation in `163s`, `DG-012` Rayon parallel traversal in `417s`, and `DG-014` Tauri IPC in `237s`), `Codex CLI + gpt-6.1-sol` was rock-solid — averaging just 13 tool calls per issue with zero code repair loops.
   - For **bounded modules, property test suites, benchmarks, and React/D3 UI components** (`DG-003` fixtures, `DG-004` formatting, `DG-008` JSON schema in `58s`, `DG-011` Criterion benchmarks, `DG-013` `proptest` suite, `DG-015` & `DG-016` React + D3 treemap and Vitest suite), `OpenCode + deepseek-v4.1-flash` delivered **100% eventual acceptance at ~$0.03 per PR**.
3. **Environment skew matters as much as model quality:** When we cataloged all failure modes across the cohort, the most interesting friction wasn't a model hallucination — it was **toolchain version skew**. Our local macOS environment ran `rustc 1.85.0`, while GitHub Actions CI ran `rustc 1.99.0`, which introduced a strict new lint (`clippy::manual_is_multiple_of`) that failed CI on unsigned modulo checks (`entries_seen % 256 == 0`). Updating our power-of-two throttling checks to bitwise masks (`entries_seen & 255 == 0`) resolved the CI gate cleanly and gave us a concrete rule for future factory specs: **always pin `rust-toolchain.toml` so local and CI linters cannot drift.**

---

## 3. Benchmarking the Code: When Parallel NVMe Traversal Helps (and When It Hurts)

One of my favorite moments in the project came during Milestone 2 (`DG-012`).

It's a common reflex in Rust to slap `rayon` onto a directory walker and assume 8 threads will be 8× faster than 1 thread. When we wrote `ADR-005` during the planning phase, we set an explicit empirical rule: **we would only switch the CLI default from `--threads 1` to parallel if a multi-threaded worker count achieved at least a `1.5×` speedup across all three canonical filesystem topologies** (wide trees, deep trees, and hard-link heavy trees).

First, we had to solve a subtle correctness bug that plagues naive parallel disk analyzers: **non-deterministic hard-link attribution**. If two directories share hard-linked files (`st_nlink > 1`), whichever thread visits an inode `(dev, ino)` first claims its byte size, while the second thread counts `0` bytes. If worker threads race, directory sizes jitter between runs!

Our solution in `DG-012` was **parallel discovery with canonical lexicographical replay**:
- Worker threads concurrently execute `read_dir` and `lstat`, sorting sibling entries per directory.
- Results are replayed in deterministic depth-first order on the aggregator thread, guaranteeing that `ScanReport` outputs from `--threads 1`, `--threads 2`, `--threads 4`, and `--threads 8` are **100% identical** (verified across randomized trees by our `DG-013` `proptest` suite).

Then we ran our Criterion benchmark suite (`cargo bench -p diskgoblin-core`) on an Apple M2 Pro (10 cores, internal Apple AP0512Z NVMe SSD on APFS):

| Fixture Topology | 1 Thread (Sequential) | 2 Threads | 4 Threads | 8 Threads | Peak Speedup |
| :--- | ---: | ---: | ---: | ---: | :--- |
| **`wide_tree`** *(50 sibling dirs × 200 files)* | `39.04 ms` | `23.53 ms` *(1.66×)* | `20.94 ms` *(1.86×)* | **`17.15 ms`** | **2.28×** *(at 8 threads)* |
| **`deep_tree`** *(20 nested levels × 125 files)* | `11.36 ms` | `8.26 ms` *(1.38×)* | `8.27 ms` *(1.37×)* | **`8.16 ms`** | **1.39×** *(at 8 threads)* |
| **`hardlink_cache_tree`** *(2k files + 3k hard links)* | `35.26 ms` | **`23.02 ms`** | `26.85 ms` *(1.31×)* | `24.36 ms` *(1.45×)* | **1.53×** *(at 2 threads)* |

Look closely at those three rows:

- **Wide trees love parallelism (`2.28×` speedup):** With 50 independent sibling directories, 8 Rayon workers overlap `read_dir` and `lstat` syscalls across the NVMe queue, cutting scan time from `39.0 ms` to `17.1 ms`.
- **Deep trees hit Amdahl's Law (`1.39×` speedup):** You cannot enumerate depth `d + 1` until you have discovered its parent directory at depth `d`. Adding more than 2 threads buys almost nothing (`8.26 ms` at 2 threads vs. `8.16 ms` at 8 threads).
- **Hard-link heavy trees peak at 2 threads (`1.53×`) and *regress* at 4 threads (`1.31×`):** When thousands of directory entries point to shared inodes inside just two parent directories, throwing 4–8 concurrent `lstat` workers at the same directories creates APFS/VFS lock contention and scheduling overhead that outweighs the parallel I/O gain.

Because no single thread count cleared the `1.5×` bar across all three topologies, **the factory followed `ADR-005` and kept `--threads 1` as the honest CLI default**, while exposing `-j 0` (auto-parallel) and `-j N` for users scanning wide project trees. That is the kind of engineering discipline you only get when you bake empirical gates into your specifications.

---

## 4. From Functional Prototype to Dark Native macOS Utility

Our initial desktop milestones (`DG-014`–`DG-016`) produced a clean, tested React + D3 treemap and top-items table. But when we stepped back and used it against real directories, we noticed two things:
1. We wanted the flexibility to run visual mode either straight from the terminal (`diskgoblin --ui /path`) **or** as a standalone native macOS application (`DiskGoblin.app`) with its own window and icon — without forcing a 350-crate GUI compile during headless CI tests.
2. Visually and ergonomically, a disk utility needs high-contrast dark surfaces, stable item colors, and a strict separation between **whole-scan totals**, the **currently viewed folder**, and the **selected item inspector**.

![DiskGoblin Native macOS App Interface](/diskgoblin-app.png)

In two final passes (`DG-019` and `DG-020`), we used a structured **Architect Brief → Coding Brief → Visual Reference** workflow to ship:
- **A 3-Tier Frontend Adapter (`ipc.ts`):** The exact same React UI automatically talks to native Tauri IPC when present, a zero-dependency Rust `std::net::TcpListener` bridge (`127.0.0.1`) in `--ui` and native WebKit mode, or a deterministic `/mock/home` fixture inside headless `vitest` runs.
- **Scoped Immediate-Child Visualization:** Both the squarified treemap and the right-hand `Largest items` panel (`Folders` / `Files` tabs) scope strictly to the immediate children of the viewed folder, using the viewed folder's byte total as the bar denominator so percentages never lie or double-count descendants.
- **Native macOS Packaging (`DiskGoblin.app`):** A lightweight Swift `AppKit` + `WKWebView` host wraps the Rust engine and production frontend bundle into a native macOS `.app` with native traffic-light window controls, custom `AppIcon.icns`, native Finder folder picking, and one-click **Reveal in Finder** (`open -R`).

---

## Key Takeaways if You're Building Your Own Software Factory

1. **The spec and `AGENTS.md` are the product:** Agents amplify whatever structure is in the repository. When crate boundaries, read-only rules, allowed file scopes, and verification commands are explicit, agents regularly one-shot nontrivial Rust concurrency and UI tasks in 1–3 minutes.
2. **Don't use a sledgehammer for every nail:** Pair a top-tier reasoning harness/model (`Codex CLI + gpt-6.1-sol`) for architecture, stateful I/O, and concurrency with a fast, penny-per-PR model (`OpenCode + deepseek-v4.1-flash`) for bounded modules, property tests, and UI work.
3. **Measure your agents the same way you measure your code:** Adding `factory_eval` and JSON run records took one issue (`DG-017`), and it immediately paid for itself by showing us which model to retire (`glm-5.3-flash`), where our prompt cache hits were landing (`>92%`), and where local-vs-CI toolchain drift was costing us cycles.

You can explore the full source code, ADRs, benchmark studies, and all 20+ agent telemetry records in the **[DiskGoblin repository on GitHub](https://github.com/RimCorp/DiskGoblin)**, or check out the **[DiskGoblin project page](/projects/diskgoblin)**. If you're looking to set up pragmatic agentic workflows or software factory pipelines for your own engineering team, [get in touch](/contact).
