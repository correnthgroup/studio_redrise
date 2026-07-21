# PR-A5 — Hardening operacional, DLQ e runbooks

**Branch:** `pr-a5-ops-hardening`  
**Trilha:** A (Workstation)  
**Depende de:** A4  
**PRD-024:** Fase 6

## Objetivo

Tornar o Workstation operável sob falhas reais: backlog, lease vencido, DLQ, reconciliador e runbooks.

## Escopo

- Views/RPCs de saúde: backlog, idade do outbox, leases vencidos, DLQ, erro por janela.
- Reconciliador periódico para reprogramar somente ações comprovadamente seguras.
- Replay de DLQ com operador autorizado, motivo, escopo, nova idempotency key e audit.
- Circuit breaker por executor/integração (mesmo que só determinístico v1).
- Runbooks: worker parado, lease órfão, DLQ replay, rollback por flag, Realtime degradado.
- Alertas baseados nos limiares da PRD-024 §12.

## Fora de escopo

- Dashboards completos de BI.
- Integrações externas avançadas.

## Arquivos prováveis

- `supabase/migrations/*health*`
- `src/domains/workstation/worker/*reconciler*`
- `docs/runbooks/workstation-*.md`
- `scripts/*health*` ou endpoint server-only

## Gate de aceite

- [ ] Backlog > 5 min detectável.
- [ ] Lease vencido > 2 min detectável e retomável.
- [ ] DLQ não vazia detectável.
- [ ] Replay exige motivo e gera audit.
- [ ] Runbooks cobrem rollback sem apagar Runs aceitas.
- [ ] Teste de caos básico documentado.
