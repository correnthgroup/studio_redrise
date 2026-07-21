# RedRise

RedRise is a Next.js App Router application for building deterministic AI operations inside organization-scoped workstations.

## Current Scope

Implemented foundation:

- Auth screens: `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`.
- Organization-scoped app shell: `/:organizationSlug/...`.
- Sidebar, breadcrumb, notification popover, and organization switcher.
- Workstation Root: `/:organizationSlug/workstation`.
- Spaces Overview: `/:organizationSlug/workstation/spaces`.
- Create Space Dialog Wizard and Space role assignment with typed mock data.

Not implemented yet:

- Process List, Process Canvas, node creation, triggers, scheduler, Actions Kanban, Agents, Settings persistence, and final Supabase business logic.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| UI | React 19, TypeScript, Tailwind CSS v4 |
| Primitives | shadcn/ui under `src/components/ui/` |
| Forms | Zod |
| Toasts | Sonner |
| Charts | Recharts |
| Tables | shadcn table primitives, TanStack available for later |
| Backend | Supabase Auth currently reused; legacy backend preserved until cleanup PRD |
| Package manager | npm |

## Architecture

```txt
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   └── (app)/[organizationSlug]/
│       ├── workstation/
│       │   ├── page.tsx
│       │   └── spaces/page.tsx
│       ├── agents/
│       ├── documentation/
│       ├── settings/
│       ├── projects/
│       ├── support/
│       └── feedbacks/
├── components/
│   ├── layout/
│   ├── providers/
│   └── ui/
└── domains/
    ├── auth/
    └── workstation/
```

## Source Of Truth

- `docs/product/01_PRODUCT_ARCHITECTURE_MAP_v1.md`
- `docs/product/02_UI_BLOCKS_REFERENCE_MAP_v1.md`
- `docs/product/03_ROADMAP_v1.md`
- `docs/product/04_PRD_INDEX_v1.md`
- `AGENTS.md`
- `memory/BOOT.md`
- `memory/INDEX.md`
- `memory/modules/*.md`

Older guides and previous PRD update files were removed to avoid conflicting instructions.

## Commands

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test:e2e
python -m graphify update . --force
```

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CML_API_BASE_URL=
CML_CONSUMER_ACCESS_TOKEN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
APP_BASE_URL=
```

## Notes

- `src/components/ui/` is only for shadcn primitives.
- Domain behavior belongs in `src/domains/`.
- No side panels are allowed by default; use Dialogs/Modals.
- Sonner uses default visual styling.
- Legacy Supabase migrations/functions/libs remain preserved but are not current product truth until explicitly reused.
