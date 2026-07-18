# INDEX

Context router for RedRise.

## Always Read

- `AGENTS.md`
- `memory/BOOT.md`
- Relevant v1 doc in `docs/`
- Relevant module in `memory/modules/`

## Domain Routing

| Domain | Read | Inspect |
|---|---|---|
| Auth | `memory/modules/auth.md` | `src/app/(auth)/`, `src/domains/auth/` |
| App Shell/Layout | `memory/modules/settings.md` if settings-adjacent | `src/components/layout/`, `src/app/(app)/[organizationSlug]/layout.tsx` |
| Workstation/Spaces | `memory/modules/workstation.md` | `src/domains/workstation/`, `src/app/(app)/[organizationSlug]/workstation/` |
| Supabase/Auth/backend | `memory/modules/supabase.md` | `src/lib/supabase*.ts`, `supabase/` |
| Context Memory (CML) | `memory/modules/context-memory.md` | `src/domains/context/`, `supabase/migrations/048_*`, `scripts/ingest-markdown.mjs`, `scripts/mcp/correnth-context.mjs`, `src/app/(app)/[organizationSlug]/context/` |
| Validation/deploy | `memory/modules/testing-deploy.md` | `package.json`, `README.md`, graphify outputs |

## Documentation Policy

- Keep docs focused and current.
- Do not recreate `PR_GUIDE.md`, `PROMPT_GUIDE.md`, `updates/prd*.md`, broad legacy product docs, or pointer memory files.
- Update only active docs and focused memory modules.
- `docs/01-04` are the product source of truth.

## End Of Work

- Update affected memory module.
- Update `memory/TASK_LOG.md` with changes, validation, blockers, and graph status.
- Run `npm run typecheck` and `npm run build` for code changes.
- Run `python -m graphify update . --force` after structural changes when feasible.

## Memory Economics

Context engineering lives in `AGENTS.md` under "Memory Economics". Use
`graphify query`/`path`/`explain` for cross-file questions; reach for
`Read`/`Grep` only for local single-file questions. Semantic layer lives in
`docs/graphify-out/`.
