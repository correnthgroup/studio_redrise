# Handoff — série de PRs RedRise (Workstation + follow-ups)

**Local canônico:** `docs/handoff/`  
**Repo:** `https://github.com/correnthgroup/studio_redrise` (confirmar `git remote -v`)  
**Milestone ativa:** viabilizar o menu **Workstation** em produção (PRD-024).  
**Depois:** Trilha B (shell/org, E2E, cleanup, CML, settings).

## Como usar

1. A empresa abre **um PR no GitHub por arquivo** desta pasta (exceto este README e `VENDOR_ENGAGEMENT.md`).
2. Branch sugerida = nome do arquivo sem `.md` (ex.: `pr-a1-bootstrap-org-middleware`).
3. O corpo do PR GitHub deve copiar o conteúdo do arquivo correspondente.
4. Ordem obrigatória na Trilha A: **A1 → A2 → A3 → A4 → A5 → A6**.
5. Trilha B só após **A1** (B1–B3 preferencialmente após A3; B4–B6 após A6 ou em paralelo controlado).

## Índice

| ID | Arquivo | Foco | Depende de |
|---|---|---|---|
| — | [VENDOR_ENGAGEMENT.md](./VENDOR_ENGAGEMENT.md) | Regras, stack, o que não fazer | — |
| A1 | [PR-A1-bootstrap-org-middleware.md](./PR-A1-bootstrap-org-middleware.md) | Seed org, middleware, drift migrations | main atual |
| A2 | [PR-A2-redaction-audit-hardening.md](./PR-A2-redaction-audit-hardening.md) | redactPayload + limites (Fase 3) | A1 |
| A3 | [PR-A3-durable-worker.md](./PR-A3-durable-worker.md) | Worker outbox (Fase 4) | A2 |
| A4 | [PR-A4-realtime-actions.md](./PR-A4-realtime-actions.md) | Realtime Actions (Fase 5) | A3 |
| A5 | [PR-A5-ops-hardening.md](./PR-A5-ops-hardening.md) | DLQ, reconciler, alertas (Fase 6) | A4 |
| A6 | [PR-A6-canary-rollout.md](./PR-A6-canary-rollout.md) | Rollout canário (Fase 7) | A5 |
| B1 | [PR-B1-org-switcher-real-data.md](./PR-B1-org-switcher-real-data.md) | Org switcher real | A1 |
| B2 | [PR-B2-e2e-durable-path.md](./PR-B2-e2e-durable-path.md) | Playwright durable | A3+ |
| B3 | [PR-B3-generated-db-types.md](./PR-B3-generated-db-types.md) | Types gerados no CI | A1 |
| B4 | [PR-B4-legacy-backend-cleanup.md](./PR-B4-legacy-backend-cleanup.md) | PRD-079 cleanup | A6 recomendado |
| B5 | [PR-B5-cml-sdk-live.md](./PR-B5-cml-sdk-live.md) | CML SDK live | independente (server-only) |
| B6 | [PR-B6-settings-team-billing-v1.md](./PR-B6-settings-team-billing-v1.md) | Settings/Team/Billing | pós-Workstation |
| C1 | [PR-C1-ci-definition-of-done.md](./PR-C1-ci-definition-of-done.md) | CI + DoD | A1 |

## Fontes de verdade

1. `docs/external/correnth-prds/06_PRD_024_DURABLE_WORKSTATION_ADAPTERS_v1.md`
2. `docs/adr/ADR-001` … `ADR-005`
3. `docs/product/01` … `04`
4. Código/migrations/testes (hierarquia PRD > ADR > migrations > código)

## Estado já entregue (não refazer)

- UI Workstation PRD-014–023 (contratos de porta)
- PRD-024 Fases 0–2: ADRs, migrations `050`–`053`, RLS + pgTAP, RPCs `ws_*`, `SupabaseWorkstationAdapter`, flag `WORKSTATION_DURABLE`
