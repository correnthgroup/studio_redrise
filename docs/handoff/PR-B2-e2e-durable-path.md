# PR-B2 — E2E do caminho durável

**Branch:** `pr-b2-e2e-durable-path`  
**Trilha:** B (qualidade)  
**Depende de:** A3 recomendado

## Objetivo

Criar cobertura Playwright para o fluxo Workstation contra backend durável.

## Escopo

- Projeto Playwright separado com `WORKSTATION_DURABLE=true`.
- Seed/reset de dados de teste isolado por organização.
- Fluxo: Space → Process → Canvas → Run → Actions → Retry.
- Teste de refresh/nova sessão preservando dados.

## Gate de aceite

- [ ] E2E durable passa no CI/staging.
- [ ] E2E memory continua passando.
- [ ] Dados de teste não contaminam orgs reais.
