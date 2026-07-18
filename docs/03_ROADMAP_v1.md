# RedRise - Roadmap v1

## Status

Active roadmap through WS-ACTIONS.

## Completed

### Block 1 - Foundation

- PRD-000 Foundation Architecture.
- PRD-001 Auth UI Blocks and Supabase Auth foundation.
- PRD-003 App Shell Navigation.
- PRD-004 Organization Selector.
- PRD-005 Notification Bell Base.
- Authenticated skeleton routes.

### Block 2 - Workstation Root + Spaces

- PRD-014 Workstation Root Overview.
- PRD-015 Spaces List.
- PRD-016 Create Space Wizard.
- PRD-017 Space Members and Space Roles.

### Block 3 - Workstation Process

- WS-PROCESS-LIST.
- WS-PROCESS-CREATE.
- WS-PROCESS-CANVAS.

### Block 4 - Workstation Actions

- WS-ACTIONS.

## Current Validation Baseline

- `npm run typecheck` must pass.
- `npm run build` must pass.
- `python -m graphify update . --force` should run after structural changes when feasible.

## Next Allowed Scope

Next block should start after WS-ACTIONS and may cover Node configuration depth, realtime runtime, or Agents only if explicitly requested.

## Not Implemented Yet

- WS-NODE-CREATE.
- WS-NODE-CONFIG.
- WS-TRIGGER-CONFIG.
- WS-NODE-RUNS.
- WS-ACTIONS-REALTIME.
- WS-ACTIONS-RETRY.
- AGENTS-MODELS.
- AGENTS-ENGINE.
- AGENTS-ANALYTICS.
- SETTINGS-PROFILE.
- SETTINGS-TEAM.
- SETTINGS-NOTIFICATION.
- SETTINGS-INTEGRATION.
- DOCUMENTATION final content.
- PROJECTS final flows.
- SUPPORT final persistence.
- FEEDBACKS final persistence.

## Cleanup Requirement

A late cleanup PRD must remove backend, docs, memory, migrations, queries, functions, and UI code that remain unused after the v1 architecture is implemented.
