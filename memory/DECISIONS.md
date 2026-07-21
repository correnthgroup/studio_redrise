# DECISIONS

## Active Decisions

- The active product source is `docs/product/01_PRODUCT_ARCHITECTURE_MAP_v1.md`.
- The active UI source is `docs/product/02_UI_BLOCKS_REFERENCE_MAP_v1.md`.
- The active roadmap source is `docs/product/03_ROADMAP_v1.md`.
- The active PRD source is `docs/product/04_PRD_INDEX_v1.md`.
- Authenticated routing uses `src/app/(app)/[organizationSlug]/`.
- Auth routes are `/sign-in`, `/sign-up`, `/forgot-password`, and `/reset-password`.
- Legacy `/login` and `/signup` redirect to the new auth routes.
- Domain code belongs under `src/domains/`.
- `src/components/ui/` is reserved for shadcn primitives.
- App Shell components belong under `src/components/layout/`.
- Sidebar collapsed state must allow expansion by clicking the RedRise logo.
- Creation/configuration flows use Dialogs/Modals, not side panels.
- Sonner must keep default visual styling.
- Supabase Auth is reused now; final business persistence is pending.
- Legacy Supabase migrations/functions/libs are preserved until explicit cleanup.
- PRD-079 must remove unused backend/docs/memory/code after final v1 architecture stabilizes.

## Implemented Decisions

- Auth split layout uses a local GradientBlinds-style visual.
- App Shell uses RedRise navigation, Notification Popover, Organization Switcher, and global breadcrumb.
- Workstation Root uses dashboard-style cards, chart, shortcuts, and action table with typed mock data.
- Spaces uses usage cards, metric strip, table, Create Space Wizard, Add Member Dialog, and Role Assignment Dialog with typed mock data.
