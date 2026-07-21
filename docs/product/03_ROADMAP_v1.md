# RedRise - Roadmap v1

## Status

The Workstation in-memory reference implementation is the active milestone. RedScale does not exist in RedRise. CML is an external Correnth platform; Graphify remains responsible for repository-specific context.

## Completed

### Foundation and shell

- PRD-000 Foundation Architecture.
- PRD-001 Auth UI Blocks and Supabase Auth foundation.
- PRD-003 App Shell Navigation.
- PRD-004 Organization Selector.
- PRD-005 Notification Bell Base.

### Functional Workstation reference

- PRD-014 through PRD-023.
- Async ports: WorkstationRepository, ExecutionRuntime, and AuthorizationPolicy.
- Observable WorkstationStore through the application provider.
- Fixture-backed InMemoryWorkstationAdapter, with no localStorage.
- Space create, edit, archive, member assignment, and Space Roles.
- Process create, activate, pause, archive, and manual execution.
- Node create, configure, move, connect, duplicate, and delete.
- Deterministic Plan -> Prepare -> Execute -> Result simulation.
- Actions and dashboard metrics derived from actual in-memory Runs.
- Audit-preserving retry with attempt and retriedFromNodeRunId.
- Capability-aware menus and internal Sonner denial feedback.

### RedScale and embedded CML cleanup

- RedScale and Context Memory navigation removed.
- Embedded routes, APIs, MCP, ingestion, domain code, tests, and migrations 048-053 removed.
- Historical task records preserved with a supersession note.
- The only allowed product integration is a thin server-side adapter for the official external SDK.

## Current validation baseline

- npm run lint
- npm run typecheck
- unit/integration tests
- npm run build
- npm run test:e2e
- python -m graphify update . --force

## Next milestone

Implement durable adapters without rewriting the UI:

- New organization-scoped Supabase/PostgreSQL migrations.
- RLS equivalent to the capability matrix.
- Supabase implementation of WorkstationRepository.
- Durable runtime with outbox/worker, idempotency, audit, cancellation, and recovery.
- Realtime Actions projection.
- Server-only CML adapter using @correnth/context-memory/sdk@1.x after the package is available.

Until then, the in-memory adapter is the executable behavioral reference.

## Out of scope for RedRise

- RedScale.
- Local CML persistence, embeddings, retrieval, administration, or fallback.
- Product-specific content in the global CML corpus.
- Domain persistence in localStorage.