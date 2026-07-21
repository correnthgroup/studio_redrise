# ADR-005 — SLOs e observabilidade

- Status: Proposto (gate Fase 0 da PRD-024)
- Data: 2026-07-21
- Fonte: PRD-024 §12; fallback defensivo/ofensivo §9

## Contexto

A milestone exige correlação ponta a ponta e alertas operacionais antes do rollout. A stack atual não tem telemetria estruturada para o Workstation.

## Decisão

### Correlação

1. Todo comando gera `request_id` (servidor) e propaga `command_id`, `idempotency_key`, `organization_id`, `process_run_id`, `node_run_id`, `outbox_event_id`, `worker_id` por logs, `audit_log`, `run_events` e DLQ.
2. Logs de servidor e worker são JSON estruturado com esses campos; nada de payload sensível (ADR-004).

### SLOs (PRD §12)

| SLO | Alvo | Medição |
|---|---|---|
| Persistência de comando | 99% ≤ 2 s | duração da RPC de comando (server timing) |
| Início de execução | 99% dos eventos elegíveis iniciam ≤ 60 s | `outbox_events.created_at → node_runs.started_at` |
| Duplicação | zero comprovada | testes de retry + verificação por `idempotency_key` em auditoria |

### Alertas

- Backlog de outbox com `available_at` vencido há > 5 min.
- Lease de outbox/worker vencido há > 2 min sem retomada.
- `dead_letter_events` não vazia.
- Taxa de erro de comandos > 5% por 10 min.
- Lag/desconexão de Realtime detectada pelo cliente (Fase 5) → UI degrada para "último estado confirmado" + Refresh manual, nunca inventa sucesso.

Fonte inicial dos alertas: views SQL de saúde (`workstation.health_*`) consultáveis por monitor externo/cron; plataforma de alerta definitiva acompanha a decisão pendente de deploy do worker (PRD §15, antes da Fase 4).

### Métricas mínimas persistidas/deriváveis

- Backlog e idade do outbox (`status = pending`), contagem `processing` com lease vencido.
- Contagem DLQ e idade do item mais antigo.
- Duração de runs por status; taxa de falha por processo.
- Discrepâncias de reconciliação (runs `running` sem heartbeat > N min).

### Runbooks (entregues na Fase 6, esqueleto na Fase 4)

- Backlog crescente / worker parado.
- Lease órfão e retomada com fence.
- Replay de DLQ (autorização, motivo, nova chave).
- Rollback por flag sem perda de Runs aceitas (PRD §13).

## Alternativas rejeitadas

- Adotar APM completo (OpenTelemetry + vendor) nesta fase: decisão de plataforma do worker ainda pendente; views SQL + logs estruturados cobrem os gates das Fases 1–5 sem lock-in.

## Consequências

- As views de saúde entram junto com a migration do outbox/worker (Fase 4), não na base (Fase 1).
- `request_id`/`command_id` entram no contrato interno das server actions desde a Fase 2.
