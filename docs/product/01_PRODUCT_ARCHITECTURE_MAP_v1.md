# RedRise - Product Architecture Map v1

## Status

Active architecture baseline through the functional in-memory Workstation reference.

## Platform boundary

- CML is an external shared Correnth platform and never a RedRise administration domain.
- RedRise may access global context only through the official server-side SDK with product identity and context.read.
- Graphify owns repository-specific code/document relationships and short-lived product context.
- CML outages are explicit; RedRise must not create local retrieval, embeddings, or database fallbacks.
- Customer-specific or sensitive content is denied from the global corpus by default.

## Workstation execution architecture

UI components -> WorkstationProvider/Store -> async ports -> InMemoryWorkstationAdapter.

The in-memory adapter is the executable reference for CRUD, capabilities, runtime transitions, Actions projections, and retry. Supabase/PostgreSQL and the durable runtime are the next adapters.

## Product Vision

RedRise structures deterministic AI operations for organizations. The product cycle is:

```txt
Configure -> Build -> Activate -> Execute -> Observe -> Improve
```

## Current Navigation

```txt
Auth
├── Sign In
├── Sign Up
├── Forgot Password
└── Reset Password

App Shell / :organizationSlug
├── Workstation
│   ├── Spaces
│   ├── Process
│   └── Actions
├── Agents
│   ├── Models
│   ├── Engine
│   └── Analytics
├── Documentation
│   ├── Onboarding
│   ├── Tutorials
│   └── Changelog
├── Settings
│   ├── Profile
│   ├── Team
│   ├── Notification
│   └── Integration
├── Projects
│   ├── New Project
│   └── Design Engineer
├── Support
└── Feedbacks
```

## Implemented Screen IDs

| Screen ID | Status | Route |
|---|---|---|
| AUTH-SIGNIN | Implemented | `/sign-in` |
| AUTH-SIGNUP | Implemented | `/sign-up` |
| AUTH-FORGOT | Implemented | `/forgot-password` |
| AUTH-RESET | Implemented | `/reset-password` |
| APP-SHELL | Implemented | `/:organizationSlug/*` |
| WS-ROOT | Functional with in-memory adapter | `/:organizationSlug/workstation` |
| WS-SPACES | Functional with in-memory adapter | `/:organizationSlug/workstation/spaces` |
| WS-PROCESS-LIST | Functional with in-memory adapter | `/:organizationSlug/workstation/process` |
| WS-PROCESS-CREATE | Functional with in-memory adapter | `/:organizationSlug/workstation/process` |
| WS-PROCESS-CANVAS | Functional with in-memory adapter | `/:organizationSlug/workstation/process/:processId/canvas` |
| WS-ACTIONS | Functional with in-memory adapter | `/:organizationSlug/workstation/actions` |

Skeleton route coverage exists for Agents, Documentation, Settings, Projects, Support, and Feedbacks.

## Auth Domain

- Supabase Auth e-mail/password foundation is reused.
- Social login/signup are removed.
- Sign In copy: `Welcome back` and `Login to your RedRise account`.
- Sign Up copy: `Create your RedRise account` and `Start building your AI workstation`.
- Forgot and Reset screens use the same split auth visual pattern.
- Auth visual side uses a local RedRise implementation of the React Bits GradientBlinds reference.
- Validation uses Zod.
- Action feedback uses default Sonner styling.

## App Shell

- Authenticated routes are organization-scoped: `/:organizationSlug/...`.
- App Shell owns sidebar, breadcrumb, notification popover, organization switcher, and content inset.
- Sidebar is based on the `@blocks-so/sidebar-03` direction and uses RedRise navigation only.
- Collapsed sidebar shows icons with tooltips; clicking the RedRise logo expands it.
- Breadcrumb is global and reflects the route path.
- No visible Separator is allowed between breadcrumb/header and content.

## Workstation Root

Route: `/:organizationSlug/workstation`.

Implemented sections:

- Shortcut blocks for Spaces, Process, and Actions.
- Operational summary cards.
- Organization summary cards.
- Usage chart with 3d, 7d, and 30d filters.
- Live actions table with typed mock data.

Out of scope for current state:

- Realtime execution persistence.

## Spaces

Route: `/:organizationSlug/workstation/spaces`.

Implemented sections:

- Header with `Spaces` and `New Workspace` CTA.
- Plan/usage cards.
- Compact metrics strip.
- Spaces table with mocked rows and action menu.
- Members list inside a Dialog.
- Create Space Dialog Wizard with 3 steps.
- Add Member and Role Assignment Dialogs.

Space roles:

```txt
Admin, Owner, Board, Staff, User, Viewer
```

Rules implemented in UI foundation:

- Only accepted organization members appear in member assignment mock data.
- Space Role does not alter Organization Role.
- Actions use Dialogs/Modals, not side panels.
- Relevant actions trigger Sonner feedback.

## Process

Routes:

```txt
/:organizationSlug/workstation/process
/:organizationSlug/workstation/process/:processId/canvas
```

Implemented sections:

- Process List table based on `table-02` behavior and shadcn/TanStack Data Table guidance.
- Row actions, pagination, sorting, filtering, column visibility, and row selection.
- Create Process Dialog using the `dialog-11` layout direction.
- ReactFlow Process Canvas with typed mock nodes and node connections.
- Internal collapsible canvas menu with Node actions: New, Delete, Edit, Select.
- Node card shows title, type, status, prompt preview, handles, and action menu.
- Node configuration Dialog separates Identity, Instruction, Input, Tool/Execution, Output, Error Handling, and Review.

Process data model decisions:

- Nodes are modeled separately from connections and runs.
- Node connections support `success`, `failure`, and `default` paths.
- Node runs and plan/prepare/execute/result logs are represented as mock status only in this PRD.
- Token cost and Agents Analytics are outside the Process Canvas MVP.
- Versioning is outside the MVP.

## Actions

Route: `/:organizationSlug/workstation/actions`.

Implemented sections:

- Observability-only Actions screen; no creation CTA.
- Header with manual Refresh and last-updated timestamp.
- Filters for Space, Process, Status, Date Range, and Search.
- Live Kanban-style board with Plan, Prepare, Execute, and Result columns.
- Kanban cards represent node runs and move by runtime status mapping.
- Manual drag/status changes are not implemented; runtime owns movement.
- Run History table with row actions, pagination, sorting, filtering, visibility, and row selection.
- Action Details Dialog using the `dialog-11` split layout direction.
- Details sections include Overview, Steps, Result, and Metadata.
- Failed actions show error message and suggested next action.

Actions data model decisions:

- `WS-ACTIONS` reads mocked `process_runs` and `node_runs` joined with Process and Space metadata.
- Sonner is used only for user-triggered actions such as refresh, copy result, and copy Run ID.
- Retry, manual status transition, edit node, edit model, edit integration, and configure trigger are outside this MVP.

## Current Code Organization

```txt
src/
├── app/
│   ├── (auth)/
│   └── (app)/[organizationSlug]/
├── components/
│   ├── layout/
│   ├── providers/
│   └── ui/
└── domains/
    ├── auth/
    └── workstation/
        ├── actions/
        ├── process/
        └── spaces/
```

## Backend Status

- Supabase Auth is active for auth foundation.
- Business persistence for Spaces, Process, Actions, and Workstation is not implemented yet.
- Legacy migrations/functions/libs remain preserved but are not active product truth unless explicitly reused.
- A later cleanup PRD must remove unused backend artifacts.

## Next Scope Boundary

Next implementation starts after WS-ACTIONS and should not assume realtime persistence, retries, manual runtime transitions, token cost analytics, or RBAC is wired.
