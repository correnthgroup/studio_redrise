# BOOT

Read this first for RedRise tasks.

## Active Sources Of Truth

- Product architecture: `docs/01_PRODUCT_ARCHITECTURE_MAP_v1.md`.
- UI references: `docs/02_UI_BLOCKS_REFERENCE_MAP_v1.md`.
- Roadmap: `docs/03_ROADMAP_v1.md`.
- PRD index: `docs/04_PRD_INDEX_v1.md`.
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
- Create Space Wizard and Space role assignment with typed mock data.
- Process List and Process Canvas with typed mock data.
- Actions observability screen with typed mock data.

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

- Semantic layer uses OpenRouter (qwen-2.5-72b, ~$0.0005 per full pass). OPENROUTER_API_KEY in .env.local.
- `cluster-only` does not respect `GRAPHIFY_OUT` env var — use `--graph docs/graphify-out/graph.json` flag instead.
- Final Supabase business persistence for Spaces/Process/Actions/Workstation is pending.
- Legacy backend artifacts remain preserved until cleanup PRD.
