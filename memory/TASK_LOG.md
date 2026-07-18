# TASK_LOG

## 2026-07-09 - Context Memory Layer (PRD-CML-001)

- Created `memory/modules/context-memory.md` with scope, entry points, invariants, and env config for the Context Memory Layer.
- Updated `memory/INDEX.md` to route the Context Memory domain.
- Added Supabase migrations 048-052: pgvector, documents/chunks/summaries, entities/relations, context_queries/context_packs, RLS policies scoped by `organization_id`.
- Created `src/domains/context/` with TS types, markdown reader, chunker, hash, embedding provider interface + OpenRouter impl, hybrid search TS client, context pack builder, and MCP tool definitions.
- Added `scripts/ingest-markdown.mjs` (CLI ingestion with deny list for secrets) and `scripts/mcp/correnth-context.mjs` (JSON-RPC MCP wrapper).
- Implemented RS-CONTEXT screen at `/:organizationSlug/context` with 6 tabs (Indexed Documents, Search Console, Context Pack Builder, Entities & Relations, Ingestion Jobs, Errors/Reindex Queue) — Dialogs only, Sonner feedback.
- Added Context Memory entry under RedScale in the sidebar.
- Added unit tests for chunker, hash, hybrid score, and context pack formatter.
- Added Playwright E2E test for the full index → search → pack flow.

## Validation

- `npm run typecheck`: passed.
- `npm run build`: passed (`/[organizationSlug]/context` + 8 API routes generated).
- `npm run lint`: no errors in context files (pre-existing repo warnings unrelated).
- `npm run test:unit`: 8/8 passed.

## 2026-07-09 - Context Memory Layer Functional Rollout

- Linked to remote Supabase project `vsaropewydcjsvplpugx`.
- Enabled pgvector 0.8.0 extension (`create extension if not exists vector`).
- Applied migrations 049-053 manually via `supabase db query --linked` because the local CLI reported the remote state as out of sync.
- Discovered and worked around two Postgres quirks:
  1. `extensions.vector` schema not present in this project — migrations rewritten to use `public.vector` (the schema where the extension actually lives).
  2. `RETURNS TABLE` + `LANGUAGE SQL` + jsonb column fails to infer types when source tables are empty. Switched all three RPCs (`context_vector_search`, `context_text_search`, `context_hybrid_search`) to `LANGUAGE plpgsql` with `RETURN QUERY`.
  3. Column ordering in `RETURN QUERY SELECTs` is positional; realigned with `RETURNS TABLE` declarations to silence `42804` type-mismatch errors.
  4. `chunk_id` is ambiguous inside the hybrid CTE because it matches both a PL/pgSQL parameter and a column. Aliased the final SELECT columns to avoid the conflict.
- Updated `v_documents_pending` so missing summaries (default-off feature) no longer flags documents as pending.
- Seeded 14 entities (RedRise, RedScale, Workstation, WS-ACTIONS, WS-SPACES, WS-PROCESS, Work Order, Context Pack, Agent Registry, Reviewer/Frontend/Backend Agents, OpenRouter) and 12 relations (implements / defines / belongs_to / uses / references) in workspace `w18we0`.
- Ran `npm run ingest:ctx` against `docs/external/correnth-prds/`, `docs/`, and `memory/` — 31 documents, 711 chunks, **zero null embeddings**. Cleaned up graphify-out artifacts that were picked up by the recursive ingest.
- Verified `v_documents_pending` returns 0 rows post-cleanup.
- Smoke-tested hybrid_search via SQL (returns 5+ ranked chunks for the query "WS-ACTIONS").
- Smoke-tested all 5 MCP tools via JSON-RPC over stdio:
  - `search_context` returns ranked chunks.
  - `get_context_pack` returns PRD §9 formatted markdown and persists `context_queries` + `context_packs`.
  - `register_decision` upserts a decision document + summary row idempotently.
  - `list_project_decisions` returns the decision just registered.
  - `get_document` returns chunks for a given document.

## Validation

- `node --test tests/unit/context-memory.test.mjs`: 8/8 pass.
- `supabase db query` smoke tests for hybrid + text search: pass.
- MCP smoke tests over stdio: all 5 tools respond correctly.

## Blockers

- TS `context_queries` and `context_packs` rows are now being written by the MCP path — UI reads via service-role `supabaseServerClient` are unaffected, but if a future PRD-RS-006 introduces row-level scoping for `register_decision` we will need to update `052_context_memory_rls.sql` accordingly.
- `WORKSPACE_ID` env is shared between CLI ingest and the MCP wrapper. The Next.js UI derives `workspace_id` from `organizationSlug` in the URL. Aligning both paths is the responsibility of the deployment env (`WORKSPACE_ID=w18we0` is the current default for this project).

## 2026-07-08 - Semantic Layer Migration

- Moved `graphify-out/` from project root to `docs/graphify-out/`.
- Installed Ollama locally with `qwen2.5:3b` and `qwen2.5-coder:7b` models.
- Rewrote `scripts/graphify-semantic.ps1` to use Ollama backend with `--token-budget 4000`.
- Updated `.gitignore` and `.claudeignore` to reflect new `docs/graphify-out/` path.
- Added `GRAPHIFY_OUT=docs/graphify-out` to `.env.example` and `.env.local`.
- Updated `AGENTS.md` Memory Economics section with Ollama backend, query-first rules, and "Updating the Semantic Layer" instructions.
- Updated `memory/BOOT.md` and `memory/INDEX.md` with new commands and paths.
- Cleaned up stray sub-graphs from previous OpenRouter semantic pass.
- Confirmed graphify has built-in `openrouter` backend (reads `OPENROUTER_API_KEY`).
- Confirmed `GRAPHIFY_OUT` env var works for extract/write, but `cluster-only` hardcodes `graphify-out/` path (use `--graph` flag for custom location).

## Validation

- `python -m graphify update . --force`: passed (3342 nodes, 5755 edges).
- `graphify extract . --backend openrouter --model qwen/qwen-2.5-72b-instruct`: passed (33 INFERRED edges, 5732 EXTRACTED edges).
- `graphify cluster-only`: passed (315 communities).
- `graphify query "what connects auth to the database?"`: passed (24 nodes, all EXTRACTED edges).

## Blockers

- `cluster-only` ignores `GRAPHIFY_OUT` env var — use `--graph docs/graphify-out/graph.json` flag.
- Full project semantic pass takes ~2-3 minutes via OpenRouter (acceptable).

## 2026-07-07 - Memory Economics

- Added `.claudeignore` excluding `graph.json` and `graphify-out/` to protect prompt cache from graphify writes.
- Switched `pyproject.toml` extra from `graphifyy[gemini]` to `graphifyy[openai]`.
- Documented OpenRouter env vars in `.env.example` (`OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL`).
- Added the Memory Economics section to `AGENTS.md` (code map, human-curated memory, work memory, task log; query-first rule; cache protection; backend policy).
- Updated `memory/BOOT.md` and `memory/INDEX.md` to point to the new graphify commands and to the Memory Economics section.
- Reinforced the query-first rule: prefer `graphify query` / `graphify path` / `graphify explain` over `Read` / `Grep` for cross-file questions.

## Validation

- `python -m graphify update . --force`: pending in next validation step.

## Blockers

- None new. OpenRouter key only needed for the optional `graphify extract ./docs --backend openai` semantic pass; AST-only default remains zero-token.

## 2026-07-07 - WS-ACTIONS

- Read `docs/05_WS_ACTIONS_SESSION_SPEC_v1.md` and implemented `WS-ACTIONS` at `/:organizationSlug/workstation/actions`.
- Added Actions typed mock data for `process_runs` and `node_runs` with Process/Space metadata.
- Added Actions filters for Space, Process, Status, Date Range, and Search.
- Added observational Kanban with Plan, Prepare, Execute, and Result columns.
- Added Run History table with row actions, pagination, sorting, filtering, visibility, and row selection.
- Added Action Details Dialog using the `dialog-11` split layout direction with Overview, Steps, Result, and Metadata sections.
- Moved Data Table helper components to shared Workstation components and updated Process table imports.

## Validation

- `npm run typecheck`: passed.
- `npm run build`: passed.
- `python -m graphify update . --force`: passed structural update; semantic doc update still needs an LLM API key.

## Blockers

- Realtime persistence, retry execution, manual runtime transitions, RBAC, and Supabase business persistence remain pending.

## 2026-07-07 - WS-PROCESS

- Implemented Process List at `/:organizationSlug/workstation/process` with typed mock data.
- Added TanStack Data Table behavior for Process row actions, pagination, sorting, filtering, column visibility, and row selection.
- Added reusable Process table helpers for sortable column headers, pagination, and view options.
- Implemented Create Process Dialog using the `dialog-11` layout direction with Zod validation and Sonner feedback.
- Implemented ReactFlow Process Canvas at `/:organizationSlug/workstation/process/:processId/canvas`.
- Added typed mock model for Process nodes, node connections, and node runs.
- Added collapsible internal canvas Node menu with New, Delete, Edit, and Select actions plus shortcut labels.
- Added Node configuration Dialog sections: Identity, Instruction, Input, Tool/Execution, Output, Error Handling, Review.
- Refactored Create Space Dialog to the `dialog-11` layout direction while preserving existing validation and role assignment rules.
- Fixed Base UI dropdown runtime error by placing Process dropdown labels inside `DropdownMenuGroup`.

## Validation

- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run lint`: failed on generated `.next` files and pre-existing lint issues in layout/mobile/i18n files; no blocking type/build issue found for WS-PROCESS.
- `python -m graphify update . --force`: passed structural update; semantic doc update still needs an LLM API key.

## Blockers

- Supabase business persistence for Spaces, Process, Nodes, Node Connections, and Node Runs remains pending.
- Actions/Node Runs, token cost, Agents Analytics, and Process versioning remain outside the MVP.

## 2026-07-06 - Foundation through WS-SPACES

- Consolidated active source docs to `docs/01-04`.
- Removed legacy documentation pointers and old PRD update files.
- Implemented Auth foundation: Sign In, Sign Up, Forgot Password, Reset Password.
- Implemented organization-scoped App Shell under `src/app/(app)/[organizationSlug]/`.
- Implemented Sidebar, Breadcrumb, Notification Popover, and Organization Switcher.
- Implemented Workstation Root with shortcuts, summary cards, usage chart, and live actions table using typed mock data.
- Implemented Spaces Overview with usage cards, metrics strip, Spaces table, Create Space Wizard, Add Member Dialog, and Role Assignment Dialog.
- Removed old `(dashboard)` route files and old root-level layout/sidebar/auth/dashboard components.
- Fixed Base UI dropdown runtime error by placing dropdown labels inside dropdown groups.
- Fixed collapsed sidebar expansion by allowing the RedRise logo to expand the sidebar.
- Fixed Base UI uncontrolled Collapsible warning by controlling sidebar menu open state with `open/onOpenChange` instead of route-derived `defaultOpen`.

## Validation

- `npm run typecheck`: passed after App Shell fix, documentation cleanup, and legacy route removal.
- `npm run build`: passed after App Shell fix, documentation cleanup, and legacy route removal.
- `python -m graphify update . --force`: passed after cleanup.

## Blockers

- Full graph rebuild still needs an LLM API key.
- Supabase business persistence for Workstation/Spaces remains pending.
