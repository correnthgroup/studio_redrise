# Workstation

## Current behavior

- Organization-scoped under /:organizationSlug/workstation.
- WorkstationRepository, ExecutionRuntime, and AuthorizationPolicy define async ports.
- InMemoryWorkstationAdapter seeds from fixtures but is the only consumer of fixture files.
- WorkstationProvider exposes an observable session snapshot to all screens.
- Reloading resets state; nothing uses localStorage.
- Spaces support create, edit, archive, members, and Space Roles.
- Processes support create, activate, pause, archive, and manual Run.
- Canvas supports Node create, configuration, movement, connection, duplication, and deletion.
- Runtime deterministically simulates Plan, Prepare, Execute, and Result.
- Actions and dashboard metrics derive from actual Process/Node Runs.
- Retry preserves the failed attempt and creates a new auditable attempt.
- React Hook Form + Zod validate creation/configuration forms.
- Capabilities drive visibility and Sonner denial feedback.
- The authenticated Playwright flow covers Space -> Process -> Canvas -> failed Run -> Actions -> Retry.

## Core files

| Concern | Path |
|---|---|
| Ports, capabilities, fixture adapter, runtime | src/domains/workstation/core/workstation.ts |
| Observable provider/hooks | src/domains/workstation/core/workstation-provider.tsx |
| Selectors | src/domains/workstation/core/selectors.ts |
| Workstation UI | src/domains/workstation/components/ |
| Spaces | src/domains/workstation/spaces/ |
| Process and Canvas | src/domains/workstation/process/ |
| Actions and Runs | src/domains/workstation/actions/ |
| Fixture seeds (adapter-only) | src/domains/workstation/**/data/mock-* |

## State transitions

- Process Run: queued -> running -> completed | failed | cancelled.
- Node Run: queued -> planning -> preparing -> executing -> completed | failed | skipped | cancelled.
- Retry creates a new Node Run with incremented attempt and retriedFromNodeRunId.

## Next milestone

- Organization-scoped Supabase/PostgreSQL repository.
- Equivalent RLS capability matrix.
- Durable runtime/outbox worker and Realtime Actions.
- Idempotency, cancellation, recovery, and audit.
- UI and domain contracts must remain unchanged.