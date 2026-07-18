# Correnth Ecosystem Strategy v1

Status: Draft v1  
Owner: Grupo Correnth  
Purpose: definir a arquitetura estratégica do ecossistema Correnth, seus produtos, prioridades, relações internas e telas de gestão.

---

## 1. Premissa central

O ecossistema deve ser organizado como um grupo empresarial com uma matriz institucional e múltiplas unidades/produtos derivados.

```text
Grupo Correnth
├── www.correnth.com — institucional / matriz
├── RedRose — ERP Agêntico
├── RedRise — IA para automações B2B
├── Findfee — CRM
├── ADGency — agência de marketing no-human
└── RedScale — orquestrador próprio de agentes
```

A lógica operacional é:

```text
Correnth = matriz / holding / management
Projetos = filiais / unidades de produto / marcas operacionais
```

Cada construção deve possuir identidade, equipe, backlog, operação e roadmap próprios, mas todas devem apontar institucionalmente para o Grupo Correnth.

---

## 2. Papel do site institucional Correnth

Domínio principal:

```text
www.correnth.com
```

Função:

- apresentar o Grupo Correnth;
- explicar a visão do ecossistema;
- direcionar usuários para cada produto/serviço;
- concentrar credibilidade institucional;
- organizar cases, documentação pública, contato e posicionamento do grupo;
- futuramente servir como portal de login ou roteamento para os produtos.

Não deve ser, inicialmente, um produto operacional complexo. Deve ser a matriz institucional e comercial.

---

## 3. Produtos do ecossistema

### 3.1 RedRose — ERP Agêntico

Função futura:

- sistema empresarial agêntico;
- organizar processos, pessoas, agentes, dados, integrações, custos, aprovações e decisões;
- operar como um ERP nativo para empresas com workforce humana + workforce agêntica.

Natureza:

```text
Produto estratégico de longo prazo.
```

Não deve ser a primeira construção vendável, salvo se houver capacidade técnica e comercial suficiente.

---

### 3.2 RedRise — IA para automações B2B

Função inicial:

- adicionar IA a processos B2B;
- criar processos determinísticos com IA;
- reduzir retrabalho, gargalos e dependência manual;
- operar em espaços, processos, nodes, actions, agentes, modelos, integrações e analytics.

Natureza:

```text
Produto vendável inicial mais claro.
```

Deve continuar nichado na dor inicial, mas arquitetado para futuramente conversar com RedRose e RedScale.

---

### 3.3 Findfee — CRM

Função:

- CRM do ecossistema;
- gestão de leads, contatos, oportunidades, propostas, pipeline comercial e relacionamento;
- pode nascer como ferramenta interna para vender RedRise, ADGency e demais produtos;
- futuramente pode se tornar SaaS próprio.

Natureza:

```text
Ferramenta comercial interna primeiro; produto externo depois.
```

---

### 3.4 ADGency — agência de marketing no-human

Função:

- agência de marketing baseada em agentes;
- criação de campanhas, criativos, copy, posts, landing pages, análise de concorrentes, anúncios e relatórios;
- foco inicial: atender o próprio Grupo Correnth e seus produtos;
- depois: vender serviços para clientes.

Natureza:

```text
Unidade de geração de demanda e receita.
```

Pode ajudar a vender RedRise e Findfee.

---

### 3.5 RedScale — orquestrador próprio de agentes

Função:

- equivalente interno a uma camada tipo Paperclip;
- organizar workforce agêntica;
- receber objetivos do operador humano;
- quebrar objetivos em Work Orders;
- acionar agentes especializados;
- acompanhar execução, custos, memória, revisão, QA e entrega;
- inicialmente usado para desenvolver o próprio ecossistema Correnth.

Natureza:

```text
Infraestrutura interna de alavancagem.
```

Pode futuramente virar produto, mas a primeira missão é acelerar a construção do próprio grupo.

---

## 4. Prioridade de construção

A ordem estratégica não deve seguir a ordem de nomes. Deve seguir alavancagem.

Critério:

```text
Construir primeiro o que ajuda a construir, testar, documentar, vender ou operar os demais.
```

### Prioridade recomendada

| Prioridade | Produto / Camada | Motivo |
|---:|---|---|
| 1 | RedScale interno | Alavanca desenvolvimento dos demais produtos com agentes |
| 2 | Context Memory Layer | Permite agentes consultarem decisões, docs e histórico sem desperdiçar contexto |
| 3 | RedRise | Produto B2B mais vendável e já documentado |
| 4 | Correnth institucional | Base pública, credibilidade e roteamento comercial |
| 5 | ADGency interna | Geração de demanda, campanhas e conteúdo para RedRise/Correnth |
| 6 | Findfee interno | Gestão comercial dos leads gerados |
| 7 | RedRose | Evolução para ERP agêntico após validação operacional e comercial |

---

## 5. Estratégia de uso interno primeiro

Todos os produtos devem nascer com a seguinte lógica:

```text
Internal-first → Controlled external pilots → Paid external use → Scalable product
```

Isso evita construir baseado em abstrações comerciais não testadas.

### Aplicação prática

- RedScale começa desenvolvendo RedRise.
- RedRise começa automatizando processos internos do Grupo Correnth e clientes-piloto.
- ADGency começa fazendo marketing do próprio grupo.
- Findfee começa gerindo pipeline comercial interno.
- RedRose nasce depois como consolidação das necessidades reais observadas.

---

## 6. Relação entre os produtos

```text
RedScale
↓ desenvolve / opera / coordena agentes
RedRise
↓ automatiza processos B2B
Findfee
↓ organiza vendas e relacionamento
ADGency
↓ gera demanda e ativos de marketing
RedRose
↓ consolida processos empresariais agênticos
Correnth
↓ apresenta, governa e direciona tudo
```

---

## 7. Arquitetura de gestão do ecossistema

O Grupo Correnth precisa de uma tela interna de management.

### SCREEN-ID: CORRENTH-ROOT

Função:

- visão geral do ecossistema;
- status de cada produto;
- prioridade atual;
- saúde operacional;
- backlog por produto;
- agentes alocados;
- custos;
- deployments;
- blockers.

### Layout esperado

```text
CORRENTH-ROOT
├── Breadcrumb
├── Header
│   ├── Correnth Ecosystem
│   └── Overview institucional e operacional
├── Product Cards
│   ├── RedScale
│   ├── RedRise
│   ├── RedRose
│   ├── Findfee
│   └── ADGency
├── Priority Board
├── Agent Workforce Summary
├── Context/Memory Health
├── Deployments / Environments
└── Recent Decisions / Changelog
```

### Product Card fields

| Field | Description |
|---|---|
| Product name | Nome da unidade |
| Type | SaaS, CRM, Agency, Orchestrator, ERP |
| Stage | Internal, Pilot, Paid, Scaling |
| Priority | Current priority level |
| Owner | Humano/agente responsável |
| Active agents | Agentes alocados |
| Current work orders | Work orders em andamento |
| Last deployment | Último deploy |
| Health | Healthy, Warning, Blocked |

---

## 8. Telas de gestão mínimas

### CORRENTH-ROOT — Ecosystem Overview

Resumo de todos os produtos e prioridades.

### CORRENTH-PRODUCTS — Products Registry

Cadastro e gestão de produtos/unidades.

### CORRENTH-ROADMAP — Ecosystem Roadmap

Roadmap consolidado por produto.

### CORRENTH-DECISIONS — Decision Registry

Registro das decisões estratégicas e técnicas.

### CORRENTH-CONTEXT — Context Memory Health

Status da camada de memória/indexação.

### CORRENTH-DEPLOYMENTS — Deployment Overview

Ambientes, builds, branches, releases e status.

---

## 9. Regras de governança

1. Toda decisão importante deve virar documento `.md`.
2. Todo documento `.md` deve ser indexado na camada de memória.
3. Todo agente deve receber Work Order, não prompt solto.
4. Todo produto deve ter tela própria de gestão.
5. Toda execução deve gerar log, resumo e resultado auditável.
6. Toda implementação deve passar por Reviewer/QA antes de merge/deploy.
7. Toda automação deve começar em uso interno antes de virar oferta externa.

---

## 10. Relação com a camada de contexto/memória

A camada de contexto é transversal a todo o ecossistema.

Ela deve indexar:

- documentos `.md`;
- decisões;
- PRDs;
- UI specs;
- roadmaps;
- prompts;
- work orders;
- resultados de agentes;
- changelogs;
- logs relevantes;
- entidades e relações do ecossistema.

Resumo técnico:

```text
Supabase + pgvector
├── documents
├── chunks
├── summaries
├── entities
├── relations
├── decisions
├── work_orders
└── retrieval_logs
```

Busca:

```text
Hybrid retrieval = vector search + full-text search + reranking + context compression
```

---

## 11. Decisão final deste documento

O Grupo Correnth deve ser planejado como matriz institucional e operacional.

O primeiro objetivo não é construir todos os produtos para o mercado ao mesmo tempo. O primeiro objetivo é construir uma máquina interna capaz de:

```text
planejar → desenvolver → testar → documentar → lançar → vender → aprender → melhorar
```

Essa máquina interna começa com:

```text
RedScale + Context Memory Layer + RedRise
```

Depois expande para:

```text
ADGency + Findfee + RedRose
```
