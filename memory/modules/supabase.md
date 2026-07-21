# Supabase

## Current Behavior

- Supabase Auth is reused for foundation auth.
- PRD-024 Phase 1–2 live on linked remote (Postgres 17.6): migrations `050`–`053` applied (schema, RLS, command RPCs, public `ws_*` wrappers).
- Browser remains SELECT-only; mutations via server actions → `ws_*` SECURITY DEFINER RPCs (idempotency, revision, audit, outbox enqueue).
- Internal tables (`outbox_events`, `idempotency_keys`, `worker_leases`, `dead_letter_events`, `audit_log`, `run_events`) have zero client policies; service role only.
- Rollout flag-gated (`WORKSTATION_DURABLE`, `WORKSTATION_DURABLE_ORGS`, default off). Flag on → layout validates membership via `resolveOrganizationSession` and fails closed.
- Remote has `048_project_plan_limits` not present in local `supabase/migrations/` — migration drift to resolve.
- Legacy 001-047 remain non-canonical product truth. New `audit_log` ≠ legacy `audit_logs`.

## Source Files

| Concern | Path |
|---|---|
| Browser client | `src/lib/supabase.ts` |
| Server client (typed) | `src/lib/supabase-server.ts` |
| DB types (hand-written, mirror of 050/051) | `src/lib/database.types.ts` |
| Rollout flags | `src/lib/flags.ts` |
| Org session resolution | `src/domains/workstation/server/organization-session.ts` |
| Durable migrations | `supabase/migrations/050_*.sql` … `053_*.sql` |
| RLS tests (pgTAP) | `supabase/tests/database/workstation_rls.test.sql` (`npm run test:db` or `node scripts/db/pg-exec.mjs --file ... --tap`) |
| Remote SQL runner | `scripts/db/pg-exec.mjs` (env `SUPABASE_DB_URL` only) |
| ADRs (PRD-024 Phase 0) | `docs/adr/ADR-001..005` |
| Legacy migrations/functions | `supabase/` |

## Pending

- Security review/approval of ADRs (formal P0 gate).
- Resolve missing local `048_project_plan_limits`.
- Apply 052/053 remotely; canary org seed; Phase 3 redaction helper hardening; Phase 4 outbox worker.
- PRD-079 unused backend cleanup.
