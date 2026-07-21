# PR-A6 — Rollout canário do Workstation durável

**Branch:** `pr-a6-canary-rollout`  
**Trilha:** A (Workstation)  
**Depende de:** A5  
**PRD-024:** Fase 7

## Objetivo

Habilitar o Workstation durável gradualmente por organização, com SLO estável e rollback por flag.

## Escopo

- Checklist de rollout por org: seed, flag, smoke, monitoramento, rollback.
- `WORKSTATION_DURABLE_ORGS` ou storage server-side equivalente para allowlist.
- Smoke canário: Space → Process → Canvas → Run → Actions → Retry.
- SLO 24h: comandos persistidos, início de execução, zero duplicação comprovada.
- Plano de rollback sem apagar Runs aceitas.
- Registro final em memória/docs de que PRD-024 saiu de milestone para operável.

## Fora de escopo

- Expandir features visuais.
- Billing ou Settings.

## Arquivos prováveis

- `docs/runbooks/workstation-rollout.md`
- `.env.example`
- `memory/TASK_LOG.md`
- Playwright smoke durable

## Gate de aceite

- [ ] Canário roda por 24h sem P0/P1.
- [ ] Rollback por flag testado.
- [ ] E2E durable passa.
- [ ] SLOs medidos e registrados.
- [ ] PRD-024 aceito como concluído para Workstation v1.
