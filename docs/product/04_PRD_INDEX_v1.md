# RedRise - PRD Index v1

## Status

Active through the functional in-memory Workstation milestone.

| PRD ID | Title | Screen IDs | Status |
|---|---|---|---|
| PRD-000 | Foundation Architecture | APP-SHELL | Implemented |
| PRD-001 | Auth UI Blocks and Supabase Auth Foundation | AUTH-* | Implemented |
| PRD-002 | Create My Business on Signup | AUTH-SIGNUP | Placeholder only |
| PRD-003 | App Shell Navigation | APP-SHELL | Implemented |
| PRD-004 | Organization Selector | APP-SHELL | Implemented with fixture adapter |
| PRD-005 | Notification Bell Base | APP-SHELL | Implemented with fixture data |
| PRD-014 | Workstation Root Overview | WS-ROOT | Functional in memory |
| PRD-015 | Spaces List | WS-SPACES | Functional in memory |
| PRD-016 | Create Space Wizard | WS-SPACES | Functional in memory |
| PRD-017 | Space Members and Space Roles | WS-SPACES | Functional in memory |
| PRD-018 | Process List | WS-PROCESS-LIST | Functional in memory |
| PRD-019 | Create Process Dialog | WS-PROCESS-CREATE | Functional in memory |
| PRD-020 | Process Canvas | WS-PROCESS-CANVAS | Functional in memory |
| PRD-021 | Actions Live Kanban | WS-ACTIONS | Runtime-derived in memory |
| PRD-022 | Actions Run History | WS-ACTIONS | Runtime-derived in memory |
| PRD-023 | Action Details and Retry | WS-ACTIONS | Functional in memory |
| PRD-024 | Durable Workstation Adapters | Workstation backend | Next |
| PRD-079 | Unused Backend Cleanup | Backend, Docs | Embedded CML cleanup completed |

## Acceptance rules

- Authenticated routes remain organization-scoped and use App Shell and breadcrumb.
- Creation/configuration uses Dialogs/Modals and React Hook Form + Zod.
- UI components consume Workstation services/hooks, not fixture files.
- RBAC uses capabilities; role names do not spread through the UI.
- Menus/actions without permission are hidden when appropriate; internal denials use default Sonner.
- No domain data is persisted in localStorage.
- Real persistence must implement the existing ports and preserve UI contracts.
- CML integration is server-only through the official external SDK.