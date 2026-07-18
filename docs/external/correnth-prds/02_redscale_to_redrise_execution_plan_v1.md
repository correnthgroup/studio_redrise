# RedScale to RedRise Execution Plan v1

Status: Draft v1  
Purpose: definir como RedScale deve concluir, testar e evoluir o app RedRise.

---

## 1. Objetivo

O RedScale deve ser usado inicialmente para concluir o RedRise.

Objetivo prático:

```text
Transformar a documentação existente do RedRise em Work Orders executáveis por agentes especializados, com revisão, testes e entrega controlada.
```

---

## 2. Escopo inicial do RedRise

RedRise deve permanecer nichado na proposta inicial:

```text
Adicionar IA a automações B2B por meio de processos determinísticos, Spaces, Process Canvas, Nodes, Actions, Agents, Integrations e Analytics.
```

Não transformar RedRise agora em ERP agêntico completo. Essa visão pertence ao RedRose/RedScale/RedRose futuro.

---

## 3. O que RedScale deve fazer pelo RedRise

### 3.1 Ler e indexar documentação

RedScale deve consultar e indexar:

- Product Architecture Map;
- UI Blocks Reference Map;
- Roadmap;
- PRD Index;
- WS Actions Spec;
- Agent Operating System;
- decisões tomadas em conversa;
- novos documentos do ecossistema Correnth.

---

### 3.2 Gerar Work Orders por tela/domínio

Cada tela/domínio vira uma Work Order.

Exemplos:

```text
WO-RR-001 — Implement APP-SHELL Breadcrumb
WO-RR-002 — Implement WS-ROOT
WO-RR-003 — Implement WS-SPACES
WO-RR-004 — Implement WS-PROCESS-LIST
WO-RR-005 — Implement WS-PROCESS-CANVAS
WO-RR-006 — Implement WS-ACTIONS
WO-RR-007 — Implement AG-ROOT
WO-RR-008 — Implement AG-MODELS
WO-RR-009 — Implement AG-ENGINE
WO-RR-010 — Implement AG-ANALYTICS
```

---

### 3.3 Gerar PRD micro por Work Order

Cada Work Order deve conter:

- objetivo;
- contexto recuperado;
- escopo;
- fora de escopo;
- arquivos a inspecionar;
- arquivos prováveis de edição;
- regras de UI;
- regras de RBAC;
- regras de banco/RLS;
- acceptance criteria;
- testes obrigatórios;
- entregáveis.

---

### 3.4 Acionar agentes especializados

Fluxo mínimo:

```text
RedScale Orchestrator
↓
Product/PRD Agent
↓
Architecture Agent
↓
Frontend Agent
↓
Backend/Supabase Agent, se necessário
↓
QA Agent
↓
Reviewer Agent
↓
Documentation Agent
```

---

### 3.5 Atualizar documentação após entrega

Depois de cada Work Order:

- atualizar docs relevantes;
- registrar decisão;
- atualizar changelog;
- reindexar documentos;
- gerar resumo para memória.

---

## 4. Roadmap operacional RedScale → RedRise

### Phase 0 — Context Bootstrapping

Objetivo:

- organizar documentos;
- indexar contexto;
- montar retrieval;
- criar templates de Work Order.

Saída:

```text
Context Memory Layer operacional + Work Order Template v1
```

---

### Phase 1 — RedRise UI Foundation

Telas:

- APP-SHELL;
- breadcrumb global;
- WS-ROOT;
- layout responsivo;
- Sonner global.

---

### Phase 2 — Workstation Core

Telas:

- WS-SPACES;
- WS-SPACE-CREATE;
- WS-PROCESS-LIST;
- WS-PROCESS-CREATE;
- WS-PROCESS-CANVAS;
- WS-NODE-CREATE;
- WS-ACTIONS.

---

### Phase 3 — Agents Domain

Telas:

- AG-ROOT;
- AG-MODELS;
- AG-ENGINE;
- AG-ANALYTICS.

---

### Phase 4 — Settings / Documentation / Projects

Telas:

- SET-ROOT;
- SET-PROFILE;
- SET-TEAM;
- SET-NOTIFICATION;
- SET-INTEGRATION;
- DOC-ROOT;
- DOC-ONBOARDING;
- DOC-TUTORIALS;
- DOC-CHANGELOG;
- PRJ-ROOT;
- PRJ-NEW;
- PRJ-DESIGN-ENGINEER.

---

### Phase 5 — Runtime / Realtime / QA

Objetivo:

- conectar banco;
- RLS;
- realtime Actions;
- process runs;
- node runs;
- triggers;
- QA por domínio.

---

## 5. UI: RedScale to RedRise Command Center

### SCREEN-ID: RS2RR-ROOT

Função:

- central de execução do RedScale para o RedRise;
- mostrar progresso de implementação do RedRise;
- criar Work Orders;
- acompanhar agentes;
- ver blockers, testes e entregas.

Layout:

```text
RS2RR-ROOT
├── Breadcrumb
├── Header
│   ├── RedScale → RedRise
│   └── Build RedRise through managed agent work orders
├── Progress Summary
│   ├── Screens planned
│   ├── Screens implemented
│   ├── Work Orders running
│   ├── Blockers
│   └── Tests passing
├── Work Order Kanban
│   ├── Backlog
│   ├── Ready
│   ├── Running
│   ├── Review
│   ├── Testing
│   └── Delivered
├── Work Orders Table
├── Agent Activity Feed
├── Context Coverage Panel
└── Delivery / Deployment Panel
```

---

### SCREEN-ID: RS2RR-WORK-ORDER

Detalhe de Work Order.

Campos:

- objective;
- screen/domain;
- context sources;
- assigned agents;
- scope;
- acceptance criteria;
- test checklist;
- generated artifacts;
- status;
- review notes.

---

### SCREEN-ID: RS2RR-CONTEXT-COVERAGE

Função:

- verificar se os agentes possuem contexto suficiente antes da implementação.

Indicadores:

- docs indexed;
- related chunks found;
- decisions found;
- missing context;
- confidence score;
- suggested docs to read.

---

## 6. Template de Work Order para RedRise

```md
# Work Order: <ID> — <Title>

## Objective

## Product
RedRise

## Related Screen ID

## Context Sources

## Scope

## Out of Scope

## Files to Inspect

## Files Likely to Edit

## UI Rules

## RBAC Rules

## Data / RLS Rules

## Realtime Rules

## Acceptance Criteria

## Tests Required

## Deliverables

## Reviewer Notes
```

---

## 7. Regras de execução

1. Nenhum agente implementa sem consultar contexto.
2. Nenhum agente altera arquitetura sem registrar decisão.
3. Nenhuma tela é considerada pronta sem acceptance criteria.
4. Nenhuma alteração de RLS entra sem teste.
5. Nenhum fluxo crítico entra sem Playwright.
6. Toda entrega gera resumo e é reindexada.
7. Toda divergência com documentação volta para Review.

---

## 8. Prioridade imediata

A prioridade inicial de RedScale para RedRise deve ser:

```text
1. Context Memory Layer
2. Work Order Template
3. APP-SHELL / Breadcrumb validation
4. WS-SPACES validation
5. WS-PROCESS-LIST validation
6. WS-ACTIONS validation
7. AG-ROOT planning
```

A razão: já existe muita decisão tomada; o risco agora não é falta de ideia, é perda de contexto e implementação desalinhada.

---

## 9. Definição de pronto

Uma Work Order RedRise só é considerada pronta quando:

- build passa;
- lint passa;
- testes obrigatórios passam;
- UI segue o padrão definido;
- RBAC respeitado;
- Sonner aplicado em ações relevantes;
- Dialogs usados onde definido;
- breadcrumb presente;
- documentação atualizada;
- memória/indexação atualizada.

---

## 10. Resultado esperado

RedScale deve permitir que o desenvolvimento do RedRise deixe de depender de prompts humanos longos e passe a operar com uma cadeia auditável:

```text
Objective → Context → Work Order → Agents → Tests → Review → Delivery → Memory Update
```
