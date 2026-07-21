# PR-A3 — Worker durável do Workstation

**Branch:** `pr-a3-durable-worker`  
**Trilha:** A (Workstation)  
**Depende de:** A2  
**PRD-024:** Fase 4

## Objetivo

Executar `outbox_events` de forma durável, idempotente e recuperável, preservando Plan → Prepare → Execute → Result.

## Escopo

- Worker Node/TypeScript separado do browser, usando service role somente no processo server/worker.
- Aquisição de eventos com lease, `fence`, `available_at`, `attempts` e `FOR UPDATE SKIP LOCKED` ou RPC equivalente.
- Backoff transiente: 1 min, 5 min, 15 min, 1 h, 4 h.
- Falha permanente sem retry; esgotado → `dead_letter_events`.
- Heartbeat em `process_runs`/`node_runs`.
- Cancelamento consistente antes de cada etapa.
- Executor determinístico seguro para preservar o comportamento atual enquanto integrações externas não existem.
- Logs estruturados com `request_id`, `command_id`, `organization_id`, `process_run_id`, `node_run_id`, `outbox_event_id`, `worker_id`.

## Fora de escopo

- Realtime client.
- Reconciliador completo/DLQ replay UI (A5).
- Integrações externas não-idempotentes.

## Arquivos prováveis

- `src/domains/workstation/worker/*` ou `worker/workstation/*` (novo)
- `scripts/workstation-worker.*` ou package script dedicado
- `supabase/migrations/*` para RPC de claim/complete/retry se necessário
- `tests/unit/*worker*.test.ts`
- Docs/runbook inicial

## Gate de aceite

- [ ] `startProcess` sai de `queued` e chega a terminal sem refresh manual obrigatório.
- [ ] Reiniciar worker no meio de run não perde nem duplica execução.
- [ ] Cancelamento em voo para antes da próxima etapa.
- [ ] Falha transitória aplica backoff; falha permanente vai para terminal correto.
- [ ] DLQ recebe eventos esgotados.
- [ ] Unit/integration tests para lease/fence/retry/cancel.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`.
