---
id: redrise-root-operations
version: 1.0.0
authority: operational-source
scope: .
owner_role: delivery-director
status: active
last_reviewed: 2026-07-18
---

# Fonte operacional — RedRise

## Relação com a Ghauss

RedRise é um app atendido pela Ghauss. Este arquivo descreve regras do RedRise; não define a identidade, o portfólio ou as políticas gerais da Ghauss. Outro cliente ou produto deve manter seu próprio `.ghauss/operations.yaml` e seus próprios arquivos `OPERATIONS.md`.

O protocolo genérico que transforma uma PR em Work Order e tasks pertence à Ghauss e está em:

```text
D:\02_labs\ghaus\projects\operating-system\PR_INTAKE_AND_PROJECTION.md
```

## Outcome do app

Concluir e evoluir o RedRise com funcionalidades reais, integrações verificáveis, execução confiável de processos, segurança proporcional ao risco e evidência suficiente para lançamento e operação.

O roteamento padrão no Paperclip é o projeto `launch-redrise` e o goal `Launch RedRise`. Isso é um default deste app, não uma regra para outros trabalhos da Ghauss.

## Fontes ativas

Depois deste arquivo, ler somente o necessário para a demanda:

1. `AGENTS.md`;
2. `memory/BOOT.md` e `memory/INDEX.md`;
3. o módulo relevante em `memory/modules/`;
4. `docs/product/01_PRODUCT_ARCHITECTURE_MAP_v1.md`;
5. `docs/product/02_UI_BLOCKS_REFERENCE_MAP_v1.md`;
6. `docs/product/03_ROADMAP_v1.md`;
7. `docs/product/04_PRD_INDEX_v1.md` e o PRD ativo relacionado;
8. código e testes do escopo.

Decisões canônicas aplicáveis em `D:\00_docs` e políticas/Work Orders da Ghauss mantêm precedência. Graphify é apenas índice de descoberta.

## Roteamento de execução

| Responsabilidade | Cargo padrão |
|---|---|
| Business owner | `delivery-director` |
| Validação de produto | `forward-deployed-product-lead` |
| Coordenação técnica | `engineering-manager` |
| Implementação | `senior-full-stack-engineer` |
| Arquitetura/review | `chief-technology-officer` ou delegado elegível |
| QA independente | `quality-risk-director` |
| Plataforma/release | `platform-sre-engineer` |

Executor, reviewer técnico e QA devem ser distintos em mudança material. A atribuição final depende de capabilities, disponibilidade, risco e conflito de interesse.

## Skills candidatas

Selecionar apenas as necessárias para a Work Order:

- `redrise-product-scope-and-discovery`;
- `redrise-architecture-and-adr`;
- `redrise-fullstack-delivery`;
- `redrise-supabase-multitenancy-rls`;
- `redrise-ai-process-runtime`;
- `redrise-integrations-and-models`;
- `redrise-cml-consumer-integration`;
- `redrise-quality-security-release-gates`;
- `redrise-platform-sre-production`;
- `redrise-go-to-market-enablement`.

Se houver uma lacuna, registrá-la no Execution Alignment. Não criar skill automaticamente durante o intake de uma PR.

## Decomposição

Uma demanda cria ou atualiza uma issue principal com Work Order. Subtasks somente quando houver:

- migration/dados bloqueadores;
- entrega vertical independente;
- integração externa com contrato próprio;
- infraestrutura ou ambiente separado;
- teste transversal com corpus e aceite próprios;
- handover/documentação com aceite próprio;
- ação R3 que exija etapa ou Work Order e HITL separados.

Uma tela comum deve permanecer numa entrega vertical que inclua comportamento, contrato/persistência necessária, permissões, estados, erros e testes. Não decompor por arquivo ou camada.

## Artifacts condicionais

| Condição | Artifact esperado |
|---|---|
| Toda PR | Work Order e Execution Alignment |
| Decisão estrutural | ADR |
| Mudança material/regressão | Test Plan e evidências |
| Dados/migration | plano de migration, validação e rollback |
| Integração externa | contrato, smoke test e estratégia de falha |
| Review e QA | parecer técnico, QA Report e risco residual |
| Release | Release Plan, Rollback e aprovação HITL |
| Mudança operacional | documentação e Handover/Training Plan |

## Rotinas

Uma PR isolada não cria rotina. Usar tasks e estados da issue. Rotina só pode ser proposta quando a fonte do escopo declarar recorrência real; nasce desabilitada e exige owner, trigger, input, output, custo, comportamento de falha e execução manual observada.

## Validação candidata

Confirmar os scripts reais em `package.json` e escolher os checks proporcionais ao escopo:

```powershell
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Registrar comando, ambiente e resultado. Produção, publicação externa, credenciais, gastos e ações destrutivas são `R3`; parar antes da ação e solicitar HITL.

## Limites

- Não considerar mock, UI existente ou migration antiga como prova de funcionalidade real.
- Não persistir dados de domínio em `localStorage`.
- Não acessar CML por tabelas internas ou service-role.
- Não expor `.env.local`, tokens ou valores de segredo em issues, logs ou artifacts.
- Não limpar, resetar ou sobrescrever mudanças existentes no worktree.
- Não ampliar a PR para refactor ou dívida adjacente sem revisar a Work Order ou criar nova issue.
- Não criar project, goal, agent, skill ou routine quando uma entidade existente já atender ao trabalho.

## Branch e PR

- Branch: `work/<PAPERCLIP-ISSUE-ID>-<slug>`.
- Título: `[<PAPERCLIP-ISSUE-ID>] <resultado observável>`.
- Corpo: link da issue/Work Order, outcome, escopo/fora de escopo, mudanças, risco/dados, validação, evidências, rollback, reviewers e QA.
- A PR é evidência e mecanismo de integração; não substitui a Work Order.
