# RedScale Agent Orchestrator Spec v1

Status: Draft v1  
Product: RedScale  
Role in ecosystem: orquestrador próprio de agentes do Grupo Correnth  
Initial purpose: desenvolver, testar, documentar e evoluir RedRise e os demais produtos do ecossistema.

---

## 1. Definição

RedScale é a camada interna de orquestração de agentes do Grupo Correnth.

Ele deve funcionar como uma combinação de:

```text
agent workforce + work order system + context retrieval + execution tracking + review/QA gate + delivery pipeline
```

Não deve começar como produto externo. Deve começar como ferramenta interna para aumentar a capacidade operacional do grupo.

---

## 2. Missão inicial

A missão inicial do RedScale é:

```text
Receber objetivos do operador humano, decompor em work orders, acionar agentes especializados, acompanhar execução, revisar resultados e entregar mudanças funcionais nos produtos do ecossistema.
```

Primeiro alvo:

```text
RedRise
```

Depois:

```text
Correnth institucional
ADGency
Findfee
RedRose
```

---

## 3. Princípio operacional

O RedScale não deve operar com prompt solto.

Ele deve operar com:

```text
Objective → Work Order → Agent Tasks → Review → Tests → Delivery → Memory Update
```

Fluxo:

```text
Human Operator / CEO
↓
RedScale Orchestrator
↓
Work Order Generator
↓
Specialized Agents
↓
Reviewer Agent
↓
QA Agent
↓
Delivery / PR / Patch
↓
Context Memory Update
```

---

## 4. Papéis mínimos de agentes

### 4.1 Human Operator / CEO

Responsável por:

- definir objetivos;
- aprovar prioridades;
- decidir trade-offs;
- aprovar entregas críticas.

Não deve microgerenciar implementação quando houver Work Order suficiente.

---

### 4.2 RedScale Orchestrator Agent

Responsável por:

- receber objetivo macro;
- recuperar contexto relevante;
- decompor objetivo em work orders;
- escolher agentes adequados;
- definir sequência de execução;
- controlar dependências;
- acompanhar progresso;
- acionar revisão.

---

### 4.3 Product / PRD Agent

Responsável por:

- transformar objetivo em PRD;
- definir escopo, fora de escopo, critérios de aceite e testes;
- alinhar com documentação existente.

---

### 4.4 Architecture Agent

Responsável por:

- verificar aderência à arquitetura;
- evitar decisões incompatíveis;
- sugerir estrutura de arquivos;
- mapear impacto em banco, RLS, UI e integrações.

---

### 4.5 Frontend Agent

Responsável por:

- implementar telas;
- criar componentes;
- adaptar shadcn/blocks/reui;
- respeitar App Shell, breadcrumb, dialogs, Sonner, responsive layout e domínio.

---

### 4.6 Backend / Supabase Agent

Responsável por:

- migrations;
- RLS;
- Edge Functions;
- services;
- hooks;
- queries;
- integração com contexto/memória.

---

### 4.7 QA Agent

Responsável por:

- Playwright;
- Vitest;
- teste de RBAC;
- teste de actions/dialogs/forms;
- regressão por domínio.

---

### 4.8 Reviewer Agent

Responsável por:

- revisar diffs;
- validar aderência ao PRD;
- verificar riscos;
- rejeitar entregas incompletas;
- liberar para merge/deploy.

---

### 4.9 Documentation Agent

Responsável por:

- atualizar `.md`;
- registrar decisões;
- criar changelog;
- atualizar indexação de contexto.

---

## 5. Entidades principais

### 5.1 Agent

```ts
type Agent = {
  id: string
  name: string
  role: string
  provider: "openai" | "anthropic" | "minimax" | "local" | "other"
  model: string
  status: "available" | "busy" | "limited" | "offline" | "disabled"
  capabilities: string[]
  cost_profile: "free" | "low" | "medium" | "high"
  context_access_level: "none" | "read" | "write" | "admin"
  created_at: string
  updated_at: string
}
```

---

### 5.2 Work Order

```ts
type WorkOrder = {
  id: string
  ecosystem_product: "redrise" | "redscale" | "redrose" | "findfee" | "adgency" | "correnth"
  title: string
  objective: string
  context_query: string
  scope: string[]
  out_of_scope: string[]
  acceptance_criteria: string[]
  required_tests: string[]
  assigned_agents: string[]
  status: "draft" | "ready" | "running" | "review" | "changes_requested" | "approved" | "delivered" | "failed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  created_by: string
  approved_by?: string
  created_at: string
  updated_at: string
}
```

---

### 5.3 Agent Task

```ts
type AgentTask = {
  id: string
  work_order_id: string
  agent_id: string
  title: string
  instructions: string
  input_context: string
  expected_output: string
  status: "queued" | "running" | "completed" | "failed" | "blocked"
  result_summary?: string
  artifact_refs?: string[]
  started_at?: string
  completed_at?: string
}
```

---

### 5.4 Review

```ts
type Review = {
  id: string
  work_order_id: string
  reviewer_agent_id: string
  status: "approved" | "rejected" | "changes_requested"
  findings: string[]
  risk_level: "low" | "medium" | "high"
  created_at: string
}
```

---

## 6. Status operacional

### Work Order statuses

```text
Draft
Ready
Running
Review
Changes Requested
Approved
Delivered
Failed
Cancelled
```

### Agent statuses

```text
Available
Busy
Limited
Offline
Disabled
```

`Limited` é importante porque alguns agentes/modelos têm limite de uso semanal ou mensal.

---

## 7. Context retrieval obrigatório

Antes de qualquer execução relevante, o agente deve consultar a camada de contexto.

Fluxo:

```text
Work Order
↓
Context Query
↓
Hybrid Retrieval
↓
Reranking
↓
Context Compression
↓
Agent Execution
```

O agente não deve depender apenas do prompt humano.

---

## 8. Política de segurança

RedScale deve ter governança rígida.

Regras:

1. Agente não faz merge direto sem Reviewer.
2. Agente não deleta arquivos críticos sem aprovação humana.
3. Agente não altera RLS sem QA específico.
4. Agente não altera billing/auth sem revisão humana.
5. Agente não expõe secrets.
6. Agente não inventa decisões; consulta contexto.
7. Agente deve registrar tudo que alterou.

---

## 9. UI de RedScale

### SCREEN-ID: RS-ROOT — RedScale Root

Função:

- visão geral da workforce agêntica;
- work orders em andamento;
- agentes disponíveis/limitados;
- custos;
- blockers;
- entregas recentes.

Layout:

```text
RS-ROOT
├── Breadcrumb
├── Header
├── Agent Workforce Cards
├── Active Work Orders
├── Execution Board
├── Context Memory Health
├── Cost / Usage Summary
└── Recent Deliveries
```

---

### SCREEN-ID: RS-WORKFORCE — Agent Workforce

Função:

- cadastrar/gerenciar agentes;
- definir role, modelo, provider, capacidade e custo;
- verificar disponibilidade/limite.

Campos:

- Agent name;
- Role;
- Provider;
- Model;
- Capabilities;
- Status;
- Cost profile;
- Context access;
- Last run.

---

### SCREEN-ID: RS-WORK-ORDERS — Work Orders

Função:

- criar, revisar e acompanhar Work Orders.

Tabela:

- Title;
- Product;
- Priority;
- Status;
- Assigned agents;
- Created by;
- Updated at;
- Actions.

Ações:

- View;
- Start;
- Pause;
- Request Review;
- Approve;
- Cancel;
- Duplicate.

---

### SCREEN-ID: RS-WORK-ORDER-CREATE

Dialog Wizard:

```text
Create Work Order
├── Step 1 — Objective
├── Step 2 — Product / Scope
├── Step 3 — Context Sources
├── Step 4 — Agents
├── Step 5 — Acceptance Criteria
└── Step 6 — Review
```

---

### SCREEN-ID: RS-EXECUTION-BOARD

Kanban:

```text
Plan | Build | Review | Test | Deliver
```

Cards representam Agent Tasks.

---

### SCREEN-ID: RS-CONTEXT

Função:

- ver o status da memória;
- documentos indexados;
- chunks;
- summaries;
- entities;
- retrieval logs;
- falhas de indexação.

---

## 10. Integrações previstas

RedScale deve poder se integrar com:

- GitHub;
- filesystem local/sandbox;
- Supabase;
- Vercel;
- OpenAI/Codex;
- Hermes/local agents;
- MiniMax/OpenRouter ou outros modelos baratos;
- Context Memory MCP;
- documentação `.md`.

---

## 11. Relação com RedRise

RedScale desenvolve RedRise.

Mas futuramente RedRise pode acionar RedScale como workforce agêntica para executar processos complexos.

Separação inicial:

```text
RedScale = ferramenta interna de desenvolvimento e orquestração de agentes
RedRise = produto B2B de automação com IA
```

---

## 12. Entrega mínima do RedScale v1

RedScale v1 deve ter:

```text
1. Registro de agentes
2. Registro de Work Orders
3. Work Order Wizard
4. Context retrieval obrigatório
5. Execução por agente externo/manual
6. Review/QA gate
7. Histórico de entregas
8. Tela de status da memória
```

Não precisa, no começo, executar tudo 100% autônomo.

O objetivo inicial é padronizar o trabalho dos agentes e reduzir dependência do operador humano.
