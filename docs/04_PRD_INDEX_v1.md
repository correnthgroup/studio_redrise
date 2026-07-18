# RedRise - PRD Index v1

## Status

Active PRD index through the current implementation point.

| PRD ID | Title | Screen IDs | Status |
|---|---|---|---|
| PRD-000 | Foundation Architecture | APP-SHELL | Implemented |
| PRD-001 | Auth UI Blocks and Supabase Auth Foundation | AUTH-SIGNIN, AUTH-SIGNUP, AUTH-FORGOT, AUTH-RESET | Implemented |
| PRD-002 | Create My Business on Signup | AUTH-SIGNUP | Placeholder only |
| PRD-003 | App Shell Navigation | APP-SHELL | Implemented |
| PRD-004 | Organization Selector | APP-SHELL | Implemented with mock data |
| PRD-005 | Notification Bell Base | APP-SHELL | Implemented with mock data |
| PRD-014 | Workstation Root Overview | WS-ROOT | Implemented with mock data |
| PRD-015 | Spaces List | WS-SPACES | Implemented with mock data |
| PRD-016 | Create Space Wizard | WS-SPACES | Implemented with mock data |
| PRD-017 | Space Members and Space Roles | WS-SPACES | Implemented with mock data |
| PRD-018 | Process List | WS-PROCESS-LIST | Implemented with mock data |
| PRD-019 | Create Process Dialog | WS-PROCESS-CREATE | Implemented with mock data |
| PRD-020 | Process Canvas | WS-PROCESS-CANVAS | Implemented with mock data |
| PRD-021 | Actions Live Kanban | WS-ACTIONS | Implemented with mock data |
| PRD-022 | Actions Run History | WS-ACTIONS | Implemented with mock data |
| PRD-023 | Action Details Dialog | WS-ACTIONS | Implemented with mock data |
| PRD-079 | Unused Backend Cleanup | Backend, Supabase, Docs | Pending |

## Current Acceptance Rules

- Every new authenticated page uses the global App Shell and breadcrumb.
- No visible Separator appears between breadcrumb/header and content.
- Creation/configuration flows use Dialogs/Modals.
- Relevant action buttons trigger Sonner feedback.
- Menus without permission should be hidden once RBAC is wired.
- Internal actions without permission should block with a clear Sonner message once RBAC is wired.
- Domain code belongs in `src/domains/`.
- Page files compose domain components and avoid heavy business logic.

## Next PRD Boundary

Do not proceed beyond WS-ACTIONS unless explicitly requested.

Next likely PRD:

```txt
WS-NODE-CREATE, WS-ACTIONS-REALTIME, or AGENTS-MODELS
```

## Cleanup PRD Note

PRD-079 must remove or archive legacy backend, old docs, obsolete memory, unused migrations/queries/functions, and old route groups that are not part of the final v1 architecture.
