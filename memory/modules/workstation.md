# Workstation

## Current Behavior

- Workstation is organization-scoped under `/:organizationSlug/workstation`.
- Root overview is implemented with typed mock data.
- Spaces overview is implemented with typed mock data.
- Create Space Wizard validates required fields with Zod.
- Create Space uses the `dialog-11` layout direction.
- Add Member and Role Assignment dialogs list accepted members only.
- Space Role does not alter Organization Role.
- Process List is implemented with typed mock data, TanStack Data Table controls, row actions, sorting, filtering, visibility, pagination, and row selection.
- Create Process uses the `dialog-11` layout direction and validates required fields with Zod.
- Process Canvas is implemented with ReactFlow, typed mock nodes, separate node connections, a collapsible internal Node menu, and a node configuration Dialog.
- Actions is implemented with typed mock data as an observability-only control center.
- Actions includes Space/Process/Status/Date/Search filters, Plan/Prepare/Execute/Result Kanban, Run History table, and Action Details Dialog.

## Source Files

| Concern | Path |
|---|---|
| Workstation routes | `src/app/(app)/[organizationSlug]/workstation/` |
| Workstation components | `src/domains/workstation/components/` |
| Workstation mock data | `src/domains/workstation/data/mock-workstation.tsx` |
| Workstation types | `src/domains/workstation/types/workstation.types.ts` |
| Spaces components | `src/domains/workstation/spaces/components/` |
| Spaces dialogs | `src/domains/workstation/spaces/dialogs/` |
| Spaces mock data | `src/domains/workstation/spaces/data/mock-spaces.ts` |
| Spaces schemas/types | `src/domains/workstation/spaces/schemas/`, `src/domains/workstation/spaces/types/` |
| Process components | `src/domains/workstation/process/components/` |
| Process dialogs | `src/domains/workstation/process/dialogs/` |
| Process mock data | `src/domains/workstation/process/data/mock-processes.ts` |
| Process schemas/types | `src/domains/workstation/process/schemas/`, `src/domains/workstation/process/types/` |
| Actions components | `src/domains/workstation/actions/components/` |
| Actions mock data | `src/domains/workstation/actions/data/mock-actions.ts` |
| Actions types | `src/domains/workstation/actions/types/` |
| Shared Workstation table helpers | `src/domains/workstation/components/data-table-*.tsx` |

## Implemented Routes

- `/:organizationSlug/workstation`
- `/:organizationSlug/workstation/spaces`
- `/:organizationSlug/workstation/process`
- `/:organizationSlug/workstation/process/:processId/canvas`
- `/:organizationSlug/workstation/actions`

## Pending

- Node Create and deeper Node Config flows.
- Node Runs.
- Actions realtime wiring.
- Actions retry/manual runtime transitions.
- Final Supabase persistence.
