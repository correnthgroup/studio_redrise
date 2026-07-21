# BOOT

Read this first for RedRise tasks.

## Active Sources Of Truth

- Product architecture: `docs/product/01_PRODUCT_ARCHITECTURE_MAP_v1.md`.
- UI references: `docs/product/02_UI_BLOCKS_REFERENCE_MAP_v1.md`.
- Roadmap: `docs/product/03_ROADMAP_v1.md`.
- PRD index: `docs/product/04_PRD_INDEX_v1.md`.
- Router: `AGENTS.md` and `memory/INDEX.md`.

These files win over older code, graph output, migrations, or memory.

## Current Stack

- Next.js 16 App Router, React 19, TypeScript.
- Tailwind CSS v4.
- shadcn primitives in `src/components/ui/`.
- Sonner for default toast feedback.
- Recharts for current chart UI.
- Supabase Auth reused for foundation auth.
- npm package manager.

## Implemented Scope

- Auth screens: `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`.
- Organization-scoped shell: `/:organizationSlug/...`.
- App Shell, Sidebar, Breadcrumb, Notification Popover, Organization Switcher.
- Workstation Root: `/:organizationSlug/workstation`.
- Spaces Overview: `/:organizationSlug/workstation/spaces`.
- Functional Space create/edit/archive and role assignment through the in-memory repository.
- Functional Process and Canvas CRUD through async ports and the in-memory adapter.
- Deterministic runtime, runtime-derived Actions/metrics, cancellation foundation, and audit-preserving retry.

## Current Entry Points

- Root layout: `src/app/layout.tsx`.
- Root redirect: `src/app/page.tsx`.
- Auth domain: `src/domains/auth/`.
- App shell: `src/components/layout/`.
- Workstation domain: `src/domains/workstation/`.
- Authenticated route group: `src/app/(app)/[organizationSlug]/`.

## Current Invariants

- Authenticated routes are organization-scoped.
- Sidebar and breadcrumb are present on authenticated screens.
- No visible Separator between breadcrumb/header and content.
- Collapsed sidebar shows icons with tooltips; logo click expands it.
- Use Dialogs/Modals, not side panels.
- Keep Sonner visual defaults.
- Page files compose domain components; business UI belongs in `src/domains/`.
- Domain data must not be persisted in `localStorage`.

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
.\scripts\graphify-semantic.ps1 -Force           # semantic layer via OpenRouter (qwen-2.5-72b)
```

## Known Blockers

- Semantic extraction uses the central wrapper and `CORRENTH_GRAPHIFY_OPENROUTER_API_KEY` from the user environment. No Graphify credential belongs in `.env.local`.
- RedRise Graphify output is canonical at `docs/graphify-out/`; use that path for cluster/query operations.
- Durable Supabase/PostgreSQL and worker adapters are pending; the UI contract is complete against memory.
- CML is external and global-only; the thin server adapter is present and becomes live when the official SDK package and server-side `CML_API_BASE_URL`/`CML_CONSUMER_ACCESS_TOKEN` are provisioned.
- Legacy backend artifacts remain preserved until cleanup PRD.
