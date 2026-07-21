# 05 — WS-ACTIONS Session Spec v1

**Product:** RedRise  
**Domain:** Workstation  
**Screen ID:** `WS-ACTIONS`  
**Screen:** `Workstation > Actions`  
**Purpose:** Control Center para acompanhar execuções de Processes e Nodes em tempo real.

---

## 1. Objective

`WS-ACTIONS` deve ser a tela de observabilidade operacional do RedRise. Ela não cria Processes, não edita Nodes e não configura Triggers. Ela mostra o que está sendo executado, em qual etapa, com qual status e qual resultado foi produzido.

A tela deve responder:

```text
O que está rodando?
Em qual etapa está?
Qual node está executando?
Qual Process/Space gerou isso?
Quem acionou?
Qual model/agent executou?
O que falhou?
Qual foi o resultado?
```

---

## 2. Selected UI References

### 2.1 Kanban

**Command:**

```bash
npx shadcn@latest add @reui/c-kanban-5
```

**Use for:**

- Kanban principal de execução;
- colunas `Plan`, `Prepare`, `Execute`, `Result`;
- cards representando `node_runs`;
- movimentação visual em tempo real conforme o status avança.

**Important adaptation:**

O exemplo original usa colunas de roadmap/features (`Planned`, `Building`, `Testing`, `Shipped`). No RedRise, as colunas devem ser:

```text
Plan
Prepare
Execute
Result
```

---

### 2.2 Runs / Actions Table

**Reference:** reutilizar o modelo `table-02` já definido para `WS-PROCESS-LIST`.

**Use for:**

- lista de execuções / run history;
- ações por linha;
- filtros;
- paginação;
- sorting;
- visibility;
- row selection;
- componentes reutilizáveis.

**Required features:**

```text
Row Action
Pagination
Sorting
Filtering
Visibility
Row Selection
Reusable Components
```

---

### 2.3 Action Details Dialog

**Reference:** reutilizar o formato `dialog-11`.

**Use for:**

- visualizar detalhes de uma Action / Node Run;
- inspecionar Overview, Steps, Result, Logs e Metadata;
- manter consistência com `WS-SPACE-CREATE` e `WS-PROCESS-CREATE`.

**Rule:** não usar side panels/drawers. Detalhes devem abrir em `Dialog` ou `Modal`.

---

## 3. Screen Composition

```text
WS-ACTIONS
├── Breadcrumb
├── Header
├── Filters
├── Live Kanban
├── Run History Table
└── Action Details Dialog
```

---

## 4. Header

### Breadcrumb

```text
Workstation / Actions
```

### Title

```text
Actions
```

### Description

```text
Monitor node execution, review results and inspect process runs in real time.
```

### Primary rule

`Actions` não possui botão de criação. Ela observa e inspeciona execuções.

Optional actions:

```text
Refresh
Export — future
```

---

## 5. Filters

Filtros mínimos para MVP:

```text
Space
Process
Status
Date Range
Search
```

Filtros recomendados para evolução:

```text
Execution / Run
Node
Responsible
Triggered by
Trigger type
Model
```

### Filter behavior

- Os filtros devem afetar Kanban e Run History Table.
- Quando o usuário abrir Actions a partir de um Process específico, a tela pode vir pré-filtrada por `process_id`.
- Quando abrir Actions a partir de um erro, pode vir pré-filtrada por `run_id` ou `node_run_id`.

---

## 6. Kanban Columns

Colunas finais:

```text
Plan
Prepare
Execute
Result
```

### Status-to-column mapping

| Node Run Status | Column |
|---|---|
| `planning` | Plan |
| `preparing` | Prepare |
| `executing` | Execute |
| `completed` | Result |
| `failed` | Result |
| `skipped` | Result |
| `cancelled` | Result |
| `queued` | Plan or waiting area, depending on UI implementation |

### Column metadata

Suggested initial mapping:

```ts
const COLUMNS = {
  plan: { title: "Plan", color: "bg-blue-500" },
  prepare: { title: "Prepare", color: "bg-yellow-500" },
  execute: { title: "Execute", color: "bg-purple-500" },
  result: { title: "Result", color: "bg-green-500" },
}
```

Colors are implementation placeholders. Final colors must respect RedRise design tokens.

---

## 7. Kanban Card

Each Kanban card represents one `node_run`.

### Required card fields

```text
node_run_id
node_title
node_type
process_name
space_name
status
stage
started_at
model_name
trigger_type
```

### Visual content

Suggested card content:

```text
Node title
Process / Space
Stage badge
Status badge
Time running or completed time
Model name
Short result/error preview when available
```

### Adaptation from `@reui/c-kanban-5`

The original `FeatureCard` has:

```text
title
description
progress
votes
```

RedRise card should map this to:

| Original | RedRise |
|---|---|
| `feature.title` | `node_run.node_title` |
| `feature.description` | `process_name / space_name / short summary` |
| `progress` | stage progress or elapsed execution progress |
| `votes` | optional: duration, attempts, or omitted |

For MVP, `Progress` can represent the stage completion:

```text
Plan = 25%
Prepare = 50%
Execute = 75%
Result = 100%
```

This is visual progress only; it should not imply exact runtime completion unless runtime can calculate it.

---

## 8. Kanban Behavior

### Realtime movement

The card moves automatically when `node_run.status` changes.

```text
planning  → Plan
preparing → Prepare
executing → Execute
completed → Result
failed    → Result
```

### Drag and drop

The selected Kanban component supports drag/drop. For `WS-ACTIONS`, manual drag should be disabled or ignored for status changes, because status is controlled by runtime.

Recommended rule:

```text
Runtime controls movement.
User cannot manually move execution cards between stages.
```

If the component requires drag behavior, keep it visually stable but do not persist manual movement.

---

## 9. Kanban Card Actions

Each card should allow:

```text
View details
Open Process
View Result
Copy summary
```

For failed cards:

```text
View error
Open failed node
View input
View output
```

Not in MVP:

```text
Retry
Manual status change
Edit node directly from Actions
```

Reason: retry semantics and editing behavior need separate runtime rules.

---

## 10. Run History Table

The table below or alongside the Kanban should show process-level executions.

### Required columns

```text
Run ID
Process
Space
Trigger
Started by
Started at
Completed at
Duration
Status
Actions
```

### Required table features

```text
Row Action
Pagination
Sorting
Filtering
Visibility
Row Selection
Reusable Components
```

### Row actions

```text
View Run
View Actions
Open Process
Copy Run ID
```

For failed runs:

```text
View Error
Open Related Integration
Open Related Model
Open Actions Filtered by Run
```

---

## 11. Action Details Dialog

Reference: `dialog-11` structure.

### Dialog layout

Use the same split layout pattern:

```text
Dialog Header
├── Title: Action Details

Dialog Body
├── Left info panel
│   ├── Node / Process summary
│   ├── Status
│   ├── Trigger
│   ├── Model
│   └── Timing
└── Right content area
    ├── Overview
    ├── Steps
    ├── Result
    ├── Logs
    └── Metadata
```

### Tabs or sections

For MVP:

```text
Overview
Steps
Result
Metadata
```

For future:

```text
Overview
Plan
Prepare
Execute
Result
Logs
Metadata
```

### Overview fields

```text
Node title
Node type
Process
Space
Run ID
Node Run ID
Status
Started at
Completed at
Duration
Triggered by
Trigger type
Model
```

### Steps content

Each execution stage should show:

```text
Plan summary
Prepare summary
Execute summary
Result summary
```

Each stage should include:

```text
status
started_at
completed_at
summary
```

### Result content

```text
Result summary
Output type
Output preview
Copy result
```

If output is large:

```text
Show summary by default
Allow expand
Do not render huge payload by default
```

### Error content

For failed Actions:

```text
Error message
Failed stage
Node name
Process name
Input summary
Suggested next action
```

Examples:

```text
Gmail credential expired. Reconnect the integration in Settings > Integration.
Local device is offline. Open Rise Insider on the authorized device.
```

---

## 12. Data Dependencies

`WS-ACTIONS` reads from:

```text
process_runs
node_runs
nodes
processes
spaces
models
organization_members
```

### process_runs

```ts
type ProcessRun = {
  id: string
  organization_id: string
  space_id: string
  process_id: string
  trigger_type: string
  triggered_by?: string
  status: "queued" | "running" | "completed" | "failed" | "cancelled"
  started_at?: string
  completed_at?: string
}
```

### node_runs

```ts
type NodeRun = {
  id: string
  process_run_id: string
  node_id: string

  status:
    | "queued"
    | "planning"
    | "preparing"
    | "executing"
    | "completed"
    | "failed"
    | "skipped"
    | "cancelled"

  plan_summary?: string
  prepare_summary?: string
  execute_summary?: string
  result_summary?: string

  input_snapshot?: Record<string, unknown>
  output_snapshot?: Record<string, unknown>

  error_message?: string

  started_at?: string
  completed_at?: string
}
```

---

## 13. Realtime Requirements

Realtime is mandatory for this screen.

Expected events:

```text
node_run.created
node_run.status_changed
node_run.stage_changed
node_run.completed
node_run.failed
process_run.completed
process_run.failed
```

Visual updates:

```text
Kanban card moves columns
Status badge updates
Run table row updates
Result becomes available
Error becomes visible
```

Fallback if realtime fails:

```text
Manual refresh
Last updated timestamp
Sonner on manual refresh result
```

---

## 14. Sonner Usage

Use Sonner for user-triggered actions only.

Use Sonner for:

```text
Copy result
Copy Run ID
Manual refresh
Export result — future
Open failed integration redirect
```

Do not use Sonner for every realtime status change. That would create notification noise.

---

## 15. RBAC / Visibility

### Admin / Owner / Board

Can see:

```text
All Actions in the organization
All Spaces
All Processes
All Runs
```

### Staff

Can see:

```text
Actions from Spaces where they participate
Actions from Processes under their responsibility
```

### User

Can see:

```text
Actions they executed
Actions from Processes they can access
```

### Viewer

Can see:

```text
Only Result or summary, depending on Space permissions
```

Exact rules must be finalized in the RBAC PRD.

---

## 16. Out of Scope for WS-ACTIONS MVP

Do not implement in this screen:

```text
Create Process
Edit Node
Configure Trigger
Edit Model
Edit Integration
Retry execution
Manual status transition
```

Redirect instead:

```text
Edit Node → WS-PROCESS-CANVAS
Configure Trigger → WS-PROCESS-LIST / Configure Trigger Dialog
Integration Error → Settings > Integration
Model Error → Agents > Models
```

---

## 17. MVP Layout

Recommended first implementation:

```text
Breadcrumb
Header
Filters
Kanban: Plan / Prepare / Execute / Result
Run History Table
Action Details Dialog
```

---

## 18. Acceptance Criteria

- User can filter Actions by Space, Process, Status, Date Range and Search.
- Kanban renders four columns: Plan, Prepare, Execute, Result.
- Each Kanban card represents one Node Run.
- Cards move according to `node_run.status`.
- User cannot manually alter runtime status by dragging cards.
- Run History Table supports row actions, pagination, sorting, filtering, visibility, row selection and reusable components.
- Clicking a Kanban card or table row action opens Action Details Dialog.
- Details Dialog shows Overview, Steps, Result and Metadata.
- Failed actions show clear error message and suggested next action.
- Sonner appears for user-triggered actions, not for every realtime event.
- No side panel/drawer is used.

---

## 19. Test Checklist

### Filters

- Filter by Space.
- Filter by Process.
- Filter by Status.
- Filter by Date Range.
- Search by node/process/run.
- Reset filters.

### Kanban

- Render empty Kanban.
- Render cards in each column.
- Move card from Plan to Prepare via realtime update.
- Move card from Prepare to Execute via realtime update.
- Move card from Execute to Result via realtime update.
- Render failed card in Result.
- Render skipped card in Result.
- Block/ignore manual drag persistence.

### Run History Table

- Sort by started date.
- Sort by status.
- Filter by status.
- Change visible columns.
- Select one row.
- Select all visible rows.
- Paginate.
- Execute row action.

### Dialog

- Open Action Details from Kanban card.
- Open Action Details from table row.
- Show Overview.
- Show Steps.
- Show Result.
- Show Metadata.
- Show error state.
- Copy result.
- Close dialog.

### RBAC

- Admin sees all.
- Owner sees all.
- Board sees all.
- Staff sees scoped Actions.
- User sees permitted Actions.
- Viewer sees restricted Result/summary.

---

## 20. Implementation Notes

- Keep UI references mapped in `02_UI_BLOCKS_REFERENCE_MAP_v1.md` after this session is approved.
- Keep `WS-ACTIONS` as observational screen.
- Do not add edit/configuration logic here.
- Do not use Drawers even if a referenced block includes one.
- Use Dialog/Modal for details.
- Use shared table components to avoid duplicating `table-02` logic across `WS-PROCESS-LIST`, `WS-SPACES`, and `WS-ACTIONS`.
