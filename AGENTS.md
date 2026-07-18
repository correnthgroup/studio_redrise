# AGENTS

> Operational router for RedRise. If a prompt says `Read AGENTS.md`, `Leia AGENTS.md`, or equivalent, follow this file and execute the task. Do not summarize this file unless explicitly asked.

## Execution Rule

1. Classify the task.
2. Read `memory/BOOT.md` and `memory/INDEX.md`.
3. Read the relevant v1 docs and memory module.
4. Execute the requested task.
5. Report outcome, changed files, validation, and blockers.

## Current Stack

- Next.js 16 App Router with React 19 and TypeScript.
- Tailwind CSS v4 through `@tailwindcss/postcss`.
- shadcn primitives in `src/components/ui/`.
- Layout components in `src/components/layout/`.
- Domain code in `src/domains/`.
- Supabase Auth is reused for foundation auth; final business persistence is pending.
- Package manager: npm.
- Knowledge graph: `graphifyy[openai]` (Python, AST-only default, OpenRouter opt-in).

## Active Sources Of Truth

- Product architecture: `docs/01_PRODUCT_ARCHITECTURE_MAP_v1.md`.
- UI references: `docs/02_UI_BLOCKS_REFERENCE_MAP_v1.md`.
- Roadmap: `docs/03_ROADMAP_v1.md`.
- PRD index: `docs/04_PRD_INDEX_v1.md`.
- Memory startup: `memory/BOOT.md`.
- Memory router: `memory/INDEX.md`.

When older code, graph output, migrations, or memory conflict with these files, these files win.

## Commands

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test:e2e
python -m graphify update . --force              # AST-only, zero token cost
python -m graphify extract ./docs --backend openai  # optional semantic pass
```

## Current Entry Points

- Root layout: `src/app/layout.tsx`.
- Root redirect: `src/app/page.tsx`.
- Auth routes: `src/app/(auth)/sign-in`, `sign-up`, `forgot-password`, `reset-password`.
- Authenticated layout: `src/app/(app)/[organizationSlug]/layout.tsx`.
- App Shell: `src/components/layout/app-shell.tsx`.
- Sidebar: `src/components/layout/app-sidebar.tsx`.
- Breadcrumb: `src/components/layout/app-breadcrumb.tsx`.
- Notification Popover: `src/components/layout/notification-popover.tsx`.
- Organization Switcher: `src/components/layout/organization-switcher.tsx`.
- Workstation Root: `src/domains/workstation/components/workstation-overview.tsx`.
- Spaces: `src/domains/workstation/spaces/components/spaces-page.tsx`.
- Process: `src/domains/workstation/process/components/process-page.tsx`.
- Process Canvas: `src/domains/workstation/process/components/process-canvas-page.tsx`.
- Actions: `src/domains/workstation/actions/components/actions-page.tsx`.

## Implemented Scope

- PRD-000 Foundation Architecture.
- PRD-001 Auth UI Blocks and Supabase Auth foundation.
- PRD-003 App Shell Navigation.
- PRD-004 Organization Selector.
- PRD-005 Notification Bell Base.
- PRD-014 Workstation Root Overview.
- PRD-015 Spaces List.
- PRD-016 Create Space Wizard.
- PRD-017 Space Members and Space Roles.
- PRD-018 Process List.
- PRD-019 Create Process Dialog.
- PRD-020 Process Canvas.
- PRD-021 Actions Live Kanban.
- PRD-022 Actions Run History.
- PRD-023 Action Details Dialog.

## Current Invariants

- Authenticated routes are organization-scoped: `/:organizationSlug/...`.
- Sidebar and breadcrumb are always present in authenticated screens.
- No visible Separator between breadcrumb/header and useful page content.
- Collapsed sidebar shows icons with tooltips; clicking the logo expands it.
- Menus without permission should be hidden once RBAC is wired.
- Actions without permission should block with a clear Sonner message once RBAC is wired.
- Use Dialogs/Modals, not side panels, for creation/configuration flows.
- Sonner visual styling must remain default.
- Domain data must not be persisted in `localStorage`.

## Documentation Policy

- Do not create broad duplicate guides.
- Update only active docs and focused memory files.
- Legacy docs were removed; do not reintroduce `PR_GUIDE.md`, `PROMPT_GUIDE.md`, or old PRD update files.

## Graphify

- Use graphify for cross-file relationship questions and after structural changes when feasible.
- Structural graph update command: `python -m graphify update . --force`.
- Semantic layer lives in `docs/graphify-out/` (AST + LLM extraction via Ollama local).

## Memory Economics

Context engineering rules for keeping token cost low while preserving enough
information for the agent to act correctly.

### Layers

1. **Code map (long-lived, repo-wide)** - `docs/graphify-out/graph.json` + `GRAPH_REPORT.md`.
   Built locally with tree-sitter AST; **zero LLM tokens**. Queried on demand
   via `graphify query`, `graphify path`, `graphify explain`. This is the only
   map of the codebase the agent needs in context.
2. **Human-curated memory (long-lived, low volume)** - `AGENTS.md`, `memory/BOOT.md`,
   `memory/INDEX.md`, `memory/modules/*.md`, `docs/01-04`. Source of truth for
   architecture, invariants, and routing. Read on session start, never re-read
   in full mid-task.
3. **Work memory (per-session, ephemeral)** - chat transcript, tool outputs,
   intermediate diffs. Compaction is handled by the assistant's auto-compact.
   Do not duplicate this layer in files.
4. **Cross-session task log (append-only)** - `memory/TASK_LOG.md`. Records
   what changed, validation, blockers. Compresses; never grows unbounded.

### Query-first rule

Before reading source files for cross-file questions, prefer:

```bash
graphify query "<question>"            # scoped subgraph
graphify path "A" "B"                  # connection between two concepts
graphify explain "SymbolOrConcept"     # one node, its edges, source
```

Only fall back to `Read`/`Grep` when the question is local to one file or
when the graph has not been built for the area being touched. After
structural changes, run `python -m graphify update . --force`.

### Cache protection

`.claudeignore` excludes `docs/graphify-out/` so writes from graphify do not
invalidate the assistant's prompt cache. Do not commit graph outputs that
should be ignored; do commit `GRAPH_REPORT.md` and `graph.json` for shared
team use.

### Backend policy

- `python -m graphify update . --force` is the default. It is AST-only and
  consumes no LLM tokens.
- For the optional semantic pass on docs, use Ollama local (qwen2.5:3b):
  ```bash
  python -m graphify extract . --backend ollama --token-budget 4000
  ```
  Zero token cost. Runs on your GPU/CPU. Env vars: `OLLAMA_BASE_URL`,
  `OLLAMA_MODEL`. See `.env.example` for the full list.
- For the optional semantic pass on docs, use OpenRouter through the
  OpenAI-compatible backend as a cloud fallback:
  ```bash
  OPENAI_BASE_URL=https://openrouter.ai/api/v1 \
  OPENAI_API_KEY=$OPENROUTER_API_KEY \
  OPENAI_MODEL=openai/gpt-4.1-mini \
  python -m graphify extract ./docs --backend openai
  ```
  Env vars are documented in `.env.example`. Do not default to the
  Gemini backend; OpenRouter is the configured path for this project.

### Updating the Semantic Layer

The semantic layer lives in `docs/graphify-out/` and adds LLM-extracted
relationships (INFERRED edges) on top of the AST-only code graph.

**When to update:**
- After adding or modifying docs in `docs/`, `memory/`, or PRDs
- After major structural refactors that change cross-file relationships
- Before starting a new feature block (to give the agent fresh context)

**Full rebuild (recommended):**
```powershell
.\scripts\graphify-semantic.ps1 -Force
```
This runs `graphify extract . --backend ollama --token-budget 4000` on the
whole project, merges results into `docs/graphify-out/`, cleans up stray
sub-graphs, and re-clusters.

**Incremental update (AST only, zero cost):**
```bash
python -m graphify update . --force
```
Re-extracts only changed code files. No LLM call. Safe to run after every
commit.

**Querying the graph:**
```bash
graphify query "what connects auth to the database?"
graphify path "WorkstationOverview" "Actions"
graphify explain "CreateSpaceDialog"
```
