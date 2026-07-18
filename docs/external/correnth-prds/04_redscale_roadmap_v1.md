# RedScale Roadmap v1

Status: Draft v1  
Owner: Correnth / RedScale  
Purpose: Define the phased construction path for RedScale, the internal agent orchestration platform of Grupo Correnth.

---

## 1. Strategic Position

RedScale is the internal orchestration layer for building, testing, documenting and evolving Correnth products.

It is not the first commercial SaaS product. It is an internal production system whose first customer is Correnth itself.

Initial products supported:

- RedRise — B2B AI automation platform.
- RedRose — future Agentic ERP.
- Findfee — future CRM.
- ADGency — future no-human marketing agency.
- Correnth institutional site and group management layer.

Core principle:

```text
RedScale must first make the team more capable of shipping RedRise.
Only after it proves internal utility should it become a productized agent orchestration platform.
```

---

## 2. Product Definition

RedScale is the Correnth agent orchestration system.

It must coordinate:

- work orders;
- agents;
- LLM providers;
- tools;
- repository context;
- project memory;
- reviews;
- tests;
- approvals;
- execution logs;
- costs;
- final deliverables.

RedScale is not an autonomous free-for-all. It is a governed work execution layer.

---

## 3. Relationship With External Agents

RedScale should not initially compete with Codex, Hermes, Claude Code, OpenCode, Aider or similar agents.

RedScale should orchestrate them through adapters.

```text
RedScale = control plane
External agents = workers
Context Memory Layer = shared memory / retrieval substrate
GitHub/Supabase/Vercel/etc. = execution surfaces
```

Initial adapters:

1. Manual Agent Adapter — human copies Work Order into an external agent and pastes results back.
2. Codex Adapter — when OpenAI/Codex usage is available.
3. Hermes Adapter — for interim/alternative execution.
4. CLI Adapter — generic local command runner for Aider/OpenCode/OpenHands-like tools.
5. Future API Adapter — direct integration where APIs exist.

---

## 4. Roadmap Philosophy

Do not build a full Paperclip clone before shipping RedRise.

Build the minimum RedScale control plane that can:

1. transform RedRise documentation into work orders;
2. assign work orders to agents;
3. provide context packs;
4. capture outputs;
5. require review;
6. generate tests/checklists;
7. update memory after accepted work.

---

## 5. Roadmap Phases

### Phase 0 — Foundation / Documentation Alignment

Goal: Establish the operating model before coding.

Deliverables:

- RedScale product boundaries.
- Agent roles.
- Work Order template.
- Context Memory Layer PRD.
- RedScale to RedRise execution plan.
- Initial UI screen map.

Exit criteria:

- Every RedScale work item can be expressed as a Work Order.
- Every Work Order has owner, scope, context, acceptance criteria and tests.

---

### Phase 1 — Context Memory Layer

Goal: Make project memory queryable by LLMs and agents.

Deliverables:

- Supabase schema for documents, chunks, summaries, entities and relations.
- Markdown ingestion pipeline.
- Hybrid search: pgvector + full-text search.
- Context pack builder.
- MCP/tool interface for retrieval.
- Reranking placeholder/interface.
- Compression strategy.

Exit criteria:

- An agent can request context for a screen/domain and receive a compact, cited context pack.
- Project decisions in Markdown can be indexed and retrieved.

---

### Phase 2 — RedScale Work Orders

Goal: Create the first operational surface of RedScale.

Screens:

- RS-ROOT — RedScale Overview.
- RS-WORK-ORDERS — Work Orders List.
- RS-WORK-ORDER-CREATE — Create Work Order.
- RS-WORK-ORDER-DETAIL — Work Order Detail.

Capabilities:

- Create work order.
- Attach target product: RedRise, RedRose, Findfee, ADGency, Correnth.
- Select domain/screen/module.
- Generate context pack from Context Memory Layer.
- Assign to agent.
- Track status.
- Capture deliverables.

Exit criteria:

- Correnth can manage RedRise development tasks through RedScale work orders.

---

### Phase 3 — Agent Registry and Adapters

Goal: Let RedScale manage multiple workers without being tightly coupled to one provider.

Screens:

- RS-AGENTS — Agent Registry.
- RS-AGENT-DETAIL — Agent Detail.
- RS-ADAPTERS — Agent Adapters.

Capabilities:

- Register agents.
- Define agent role/capability.
- Define provider/adapter.
- Define cost and usage limits.
- Define allowed tools.
- Define approval requirements.
- Record heartbeat/status.

Initial agent types:

- Orchestrator Agent.
- Product/PRD Agent.
- Frontend Agent.
- Backend/Supabase Agent.
- QA Agent.
- Reviewer Agent.
- Documentation Agent.
- Research Agent.

Exit criteria:

- RedScale can assign a Work Order to Hermes, Codex or manual execution while preserving the same operating model.

---

### Phase 4 — Execution Runs

Goal: Track actual work execution from start to reviewed deliverable.

Screens:

- RS-RUNS — Execution Runs.
- RS-RUN-DETAIL — Run Details.
- RS-REVIEW — Review Queue.

Capabilities:

- Start a run from a Work Order.
- Store prompt sent to agent.
- Store context pack used.
- Store outputs/diffs/test results.
- Capture errors.
- Require Reviewer approval.
- Mark accepted/rejected/needs changes.

Exit criteria:

- Every agent execution is auditable.
- No output is considered final without review.

---

### Phase 5 — RedRise Development Automation

Goal: Use RedScale to complete RedRise screens and flows.

Capabilities:

- Generate PRDs from RedRise documentation.
- Create Work Orders by screen/domain.
- Generate coding prompts for Codex/Hermes.
- Generate test plans.
- Record output and update project memory.

Target flow:

```text
Human CEO Objective
↓
RedScale Work Order
↓
Context Pack
↓
Agent Execution
↓
QA
↓
Review
↓
Accepted Deliverable
↓
Memory Update
```

Exit criteria:

- RedScale is used to ship at least one real RedRise module end-to-end.

---

### Phase 6 — Governance, Costs and Limits

Goal: Prevent uncontrolled spending, unsafe changes and context drift.

Capabilities:

- Budget by project.
- Budget by agent.
- Usage/cost dashboard.
- Required approval for high-risk tasks.
- Tool allowlist.
- Repo/file allowlist.
- Secrets policy.
- Failure analytics.

Exit criteria:

- Agent work is governed like an internal workforce, not ad hoc prompts.

---

### Phase 7 — Productization Candidate

Goal: Decide whether RedScale should become an external product.

Criteria:

- Internal usage proves repeatable value.
- Work Orders and adapters stabilize.
- Context Memory Layer is reliable.
- Multiple products have been supported.
- At least one non-Correnth pilot use case exists.

Decision:

```text
If internal value is high and repeatable, RedScale can become a product.
If not, keep RedScale internal.
```

---

## 6. Priority Order

Immediate priority:

1. Context Memory Layer.
2. Work Order schema and UI.
3. Agent Registry.
4. Manual/Hermes/Codex adapter model.
5. RedRise execution pipeline.
6. Review and QA loop.
7. Costs and governance.

---

## 7. Screen Roadmap

### Core Screens

| Screen ID | Screen | Priority |
|---|---|---:|
| RS-ROOT | RedScale Overview | P1 |
| RS-WORK-ORDERS | Work Orders List | P1 |
| RS-WORK-ORDER-CREATE | Create Work Order | P1 |
| RS-WORK-ORDER-DETAIL | Work Order Detail | P1 |
| RS-AGENTS | Agent Registry | P1 |
| RS-ADAPTERS | Agent Adapters | P2 |
| RS-RUNS | Execution Runs | P2 |
| RS-RUN-DETAIL | Run Detail | P2 |
| RS-REVIEW | Review Queue | P2 |
| RS-CONTEXT | Context Memory Console | P1 |
| RS-COSTS | Costs and Usage | P3 |
| RS-SETTINGS | Governance Settings | P3 |

---

## 8. Definition of Done

RedScale v1 is considered operational when:

- a human can create a Work Order;
- RedScale can retrieve the correct context;
- a selected agent can receive the work package;
- output can be captured;
- QA can validate it;
- Reviewer can approve or reject;
- accepted output updates project memory;
- RedRise development becomes faster and more reliable.
