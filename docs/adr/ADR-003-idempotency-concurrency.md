# ADR-003 — Idempotência e concorrência

- Status: Proposto (gate Fase 0 da PRD-024)
- Data: 2026-07-21
- Fonte: PRD-024 §7, §8

## Contexto

Todo comando mutável (CRUD de Space/Process/Node/Connection, member assignment, start/cancel/retry) deve ser idempotente, auditável e livre de duplicação, mesmo com retries de rede, double-click ou reinício de worker.

## Decisão

### Pipeline transacional de comando

Toda mutação executa dentro de **uma única transação Postgres** via RPC `workstation.*` (`SECURITY DEFINER` — ADR-002), na ordem:

1. Resolver identidade (`auth.uid()`), membership e capability; falha → `permission_denied`, sem efeitos.
2. Validar entrada (Zod no servidor antes da RPC; constraints/CHECKs no banco como última linha).
3. Reservar a chave: `insert into idempotency_keys (organization_id, actor_id, idempotency_key, command_type, payload_hash, status, expires_at) ... on conflict do nothing`; em conflito, ler a linha existente:
   - mesmo `payload_hash` e `status = completed` → devolver `response_status`/`response_body` originais, sem reexecução;
   - mesmo `payload_hash` e `status = in_progress` → `409 retry_in_progress` (cliente reenvia depois);
   - `payload_hash` diferente → `409 idempotency_conflict`.
4. Em edições, checar `expectedRevision`: `update ... where id = $id and revision = $expected` retornando a linha; zero linhas → `409 revision_conflict` com a revisão atual no corpo. Nunca read-then-write sem condição de estado.
5. Aplicar a mutação e incrementar `revision`.
6. Gravar `audit_log` (payload redigido — ADR-004).
7. Se o comando é assíncrono (start/cancel/retry), gravar `outbox_events` **na mesma transação**; nenhum despacho ao worker antes do commit (PRD §4).
8. Gravar `response_status`/`response_body` na chave (`status = completed`) e commitar.

### Chaves

- Cliente gera um UUID por intenção do usuário (um clique = uma chave; retry automático de rede reusa a mesma chave).
- Header/argumento `Idempotency-Key` obrigatório em todo comando mutável; ausência → `400`.
- `payload_hash = sha256` do payload canônico (JSON com chaves ordenadas), calculado no servidor.
- Retenção: `expires_at = now() + 30 dias`; comandos `process.start` e `run.retry` usam 90 dias (PRD §7). Limpeza por job posterior (Fase 6); expiração nunca é pré-condição de correção, apenas higiene.

### Concorrência de execução

- `cancelRun` é idempotente: cancelar um run já terminal devolve o estado atual sem erro; cancelar em voo grava `cancel_requested_at` e o worker para antes da próxima etapa (PRD §9).
- Retry cria **novo** `node_run` com `attempt + 1` e `retried_from_node_run_id`; o run falho permanece imutável (contrato atual da UI).
- Worker adquire eventos com `for update skip locked` + lease (`lease_id`, `lease_expires_at`, `fence`); antes de cada efeito revalida lease e cancelamento. Lease vencido só é retomado com `fence` maior (fencing token) — escrita de worker antigo com fence menor é rejeitada.
- Recuperação pós-reinício: eventos `processing` com lease vencido voltam a `pending`; runs `running` sem `heartbeat_at` recente entram em reconciliação. Efeito externo com timeout → `reconciliation_required`, nunca repetição automática (PRD §9).
- Backoff transiente com jitter: 1 min, 5 min, 15 min, 1 h, 4 h (5 tentativas); erro permanente (validação/autorização) falha sem retry; esgotado → `dead_letter_events` + run `failed` + alerta. Replay de DLQ exige operador autorizado, motivo e **nova** chave de idempotência.

## Alternativas rejeitadas

- Idempotência na camada Node (cache em memória/Redis): não sobrevive a reinício nem a múltiplas instâncias; o banco já é o ponto de serialização.
- `advisory locks` para edição: `revision` otimista é suficiente, não bloqueia leitores e devolve conflito acionável para a UI.
- Deduplicação apenas por unique constraint no efeito: não devolve a resposta original nem detecta payload divergente.

## Consequências

- O `WorkstationRepository` durável recebe `idempotencyKey` e `expectedRevision` por baixo do contrato atual (o provider gera a chave por intenção); a assinatura pública da UI não muda.
- `409` estruturado (`code`, `currentRevision`) vira parte do contrato de erro do adaptador e mapeia para `WorkstationDomainError`.
