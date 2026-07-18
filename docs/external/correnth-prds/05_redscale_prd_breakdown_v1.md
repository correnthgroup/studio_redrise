# RedScale PRD Breakdown v1

Status: Draft v1  
Owner: Correnth / RedScale  
Purpose: Break the RedScale roadmap into small, implementable PRDs.

---

## PRD-RS-001 — RedScale App Shell and Navigation

### Objective

Create the initial RedScale internal app shell with navigation for Work Orders, Agents, Runs, Review, Context and Settings.

### Scope

- Global authenticated layout.
- Sidebar/navigation.
- Breadcrumb.
- Empty placeholder pages.
- Route structure.

### Out of Scope

- Real agent execution.
- Context retrieval.
- Cost analytics.

### Screens

- RS-ROOT.
- RS-WORK-ORDERS.
- RS-AGENTS.
- RS-RUNS.
- RS-REVIEW.
- RS-CONTEXT.
- RS-SETTINGS.

### Acceptance Criteria

- All routes are reachable.
- Breadcrumb works on all pages.
- No dead links.
- Layout follows Correnth/RedScale identity.

### Tests

- Playwright navigation test.
- Sidebar route test.
- Breadcrumb rendering test.

---

## PRD-RS-002 — Work Order Data Model

### Objective

Create the database model for Work Orders.

### Scope

Tables:

- work_orders;
- work_order_context_items;
- work_order_deliverables;
- work_order_events.

Core fields:

- id;
- organization_id;
- product_key;
- domain_key;
- screen_id;
- objective;
- context_summary;
- scope;
- out_of_scope;
- acceptance_criteria;
- tests_required;
- status;
- priority;
- assigned_agent_id;
- created_by;
- reviewed_by;
- created_at;
- updated_at.

### Statuses

- draft;
- ready;
- assigned;
- running;
- blocked;
- review;
- accepted;
- rejected;
- archived.

### Acceptance Criteria

- Work Order can be stored.
- Work Order status transitions are validated.
- Work Order events are logged.

### Tests

- Migration test.
- RLS test.
- Status transition test.

---

## PRD-RS-003 — Work Orders List

### Objective

Create the Work Orders list UI.

### Scope

- Table with Work Orders.
- Filtering.
- Sorting.
- Pagination.
- Row actions.
- Status badges.

### Columns

- Work Order;
- Product;
- Domain/Screen;
- Status;
- Priority;
- Assigned Agent;
- Updated At;
- Actions.

### Row Actions

- Open;
- Assign;
- Start Run;
- Send to Review;
- Archive.

### Acceptance Criteria

- User can list and filter Work Orders.
- Row actions open dialogs, not side panels.
- Status badges are clear.

### Tests

- Render table.
- Filter by status/product.
- Row action dialog opens.
- Pagination works.

---

## PRD-RS-004 — Create Work Order Dialog

### Objective

Create a dialog wizard for creating Work Orders.

### Reference

Use the `dialog-11` style pattern.

### Steps

1. Target Product.
2. Objective.
3. Scope and Out of Scope.
4. Context Requirements.
5. Acceptance Criteria.
6. Review.

### Fields

- product_key;
- domain_key;
- screen_id;
- objective;
- scope;
- out_of_scope;
- files_to_inspect;
- files_likely_to_edit;
- acceptance_criteria;
- tests_required.

### Acceptance Criteria

- User can create a Work Order from UI.
- Required fields validate locally.
- Sonner appears on success/error.

### Tests

- Required validation.
- Successful create.
- Error handling.

---

## PRD-RS-005 — Context Pack Builder Integration

### Objective

Connect Work Orders to the Context Memory Layer.

### Scope

- Generate context pack from Work Order fields.
- Attach selected context chunks to Work Order.
- Store retrieval query and selected context.
- Allow manual refresh of context pack.

### Acceptance Criteria

- User can click `Generate Context Pack`.
- System retrieves relevant project docs.
- Context pack is saved to Work Order.
- Context pack can be copied into external agents.

### Tests

- Context pack generation.
- Empty result state.
- Manual refresh.

---

## PRD-RS-006 — Agent Registry

### Objective

Create the registry of agents available to RedScale.

### Scope

Tables:

- agents;
- agent_capabilities;
- agent_provider_configs;
- agent_events.

Fields:

- name;
- role;
- adapter_type;
- provider;
- model;
- capabilities;
- max_cost_per_run;
- requires_review;
- status;
- last_heartbeat_at.

### Initial Adapter Types

- manual;
- codex;
- hermes;
- cli;
- api_future.

### Acceptance Criteria

- User can register an agent.
- Agent can be assigned to Work Order.
- Agent status is visible.

### Tests

- Create agent.
- Filter by role/status.
- Assign agent to Work Order.

---

## PRD-RS-007 — Manual Agent Adapter

### Objective

Allow RedScale to work before direct integrations exist.

### Scope

- Generate agent-ready prompt package.
- User copies prompt into external agent.
- User pastes output back into RedScale.
- Output becomes deliverable.

### Acceptance Criteria

- Work Order can produce a copyable prompt.
- Output can be pasted and stored.
- Deliverable can be sent to review.

### Tests

- Generate prompt.
- Save pasted output.
- Send to review.

---

## PRD-RS-008 — Hermes Adapter v0

### Objective

Integrate Hermes as an execution worker at a controlled level.

### Scope

- Store Hermes adapter configuration.
- Generate Hermes-compatible prompt.
- Optionally call local CLI/API if available.
- Capture output manually or via adapter.

### Out of Scope

- Full autonomous repository writes without review.
- Secret exposure.
- Production deployment automation.

### Acceptance Criteria

- Work Order can be assigned to Hermes.
- Hermes prompt includes objective, context pack, rules and deliverable format.
- Output can be captured and reviewed.

### Tests

- Hermes prompt generation.
- Adapter config validation.
- Deliverable capture.

---

## PRD-RS-009 — Execution Runs

### Objective

Track every agent execution attempt.

### Scope

Tables:

- agent_runs;
- agent_run_logs;
- agent_run_artifacts.

Fields:

- work_order_id;
- agent_id;
- status;
- prompt_snapshot;
- context_snapshot;
- output_snapshot;
- error_message;
- started_at;
- completed_at;
- cost_estimate.

### Statuses

- queued;
- running;
- completed;
- failed;
- cancelled;
- review_required.

### Acceptance Criteria

- Every execution creates a run record.
- Prompt/context/output are auditable.
- Failed runs show error reason.

### Tests

- Create run.
- Complete run.
- Fail run.
- View run detail.

---

## PRD-RS-010 — Review Queue

### Objective

Create a mandatory review loop for agent outputs.

### Scope

- Review queue page.
- Accept/reject/request changes.
- Reviewer notes.
- Link deliverables to Work Order.

### Acceptance Criteria

- Agent output is not accepted automatically.
- Reviewer can approve or reject.
- Accepted output triggers memory update task.

### Tests

- Submit to review.
- Approve.
- Reject.
- Request changes.

---

## PRD-RS-011 — RedRise Work Order Generator

### Objective

Generate Work Orders from existing RedRise documentation and screen backlog.

### Scope

- Parse RedRise docs.
- Identify domains/screens.
- Create draft Work Orders.
- Group by priority.

### Acceptance Criteria

- System can create draft Work Orders for remaining RedRise screens.
- Human can review and activate Work Orders.

### Tests

- Generate drafts from docs.
- Reject duplicate Work Orders.
- Approve selected Work Orders.

---

## PRD-RS-012 — Cost and Governance Baseline

### Objective

Prevent uncontrolled agent usage.

### Scope

- Cost estimate field.
- Agent run budget.
- High-risk action flag.
- Required review flag.
- Tool allowlist.

### Acceptance Criteria

- Agent cannot run if budget exceeded.
- High-risk Work Orders require reviewer.
- Tool access is explicit.

### Tests

- Budget exceeded.
- Required review.
- Tool denylist/allowlist.

---

# Implementation Order

1. PRD-RS-001 — App Shell.
2. PRD-RS-002 — Work Order Data Model.
3. PRD-RS-004 — Create Work Order Dialog.
4. PRD-RS-003 — Work Orders List.
5. PRD-RS-006 — Agent Registry.
6. PRD-RS-007 — Manual Agent Adapter.
7. PRD-CML-001 — Context Memory Layer Foundation.
8. PRD-RS-005 — Context Pack Builder Integration.
9. PRD-RS-008 — Hermes Adapter v0.
10. PRD-RS-009 — Execution Runs.
11. PRD-RS-010 — Review Queue.
12. PRD-RS-011 — RedRise Work Order Generator.
13. PRD-RS-012 — Cost and Governance Baseline.
