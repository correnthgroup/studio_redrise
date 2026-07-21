# PRD-024 — Adaptadores Duráveis do Workstation v1

**Status:** Planejada — próxima milestone  
**Domínio:** Workstation backend  
**Dependência:** contratos atuais de UI preservados  
**Decisão central:** substituir a execução em memória por adaptadores Supabase/PostgreSQL e worker durável, sem reescrever as telas.

## 1. Resultado esperado

Usuários autorizados poderão operar Spaces, Processes, Nodes e Connections, iniciar/cancelar/repetir Runs e observar Actions após refresh, nova sessão ou reinício de worker. Cada mudança será isolada por organização, autorizada no banco, auditável e protegida contra duplicação.

O adaptador em memória continuará para desenvolvimento visual, testes determinísticos e cenários sem infraestrutura; nunca será fonte de verdade em produção.

## 2. Escopo

Incluído: PostgreSQL/Supabase por organização; RLS equivalente às capabilities; adaptadores persistentes de `WorkstationRepository` e `ExecutionRuntime`; outbox transacional; worker com leases, retry, cancelamento e recuperação; auditoria; Realtime de Actions; observabilidade, runbooks e rollout controlado.

Excluído: mudanças visuais/de rotas; `localStorage`; triggers recorrentes, versionamento, token analytics; RedScale; CML embutido ou fallback local; integrações externas além do executor determinístico seguro.

## 3. Contratos e invariantes

- A UI continua usando `WorkstationRepository`, `ExecutionRuntime` e `AuthorizationPolicy` através de `WorkstationProvider`.
- Capabilities: `space.read`, `space.manage`, `space.members.manage`, `process.read`, `process.manage`, `process.run`, `run.read`, `run.retry`.
- Process Run: `queued → running → completed | failed | cancelled`.
- Node Run: `queued → planning → preparing → executing → completed | failed | skipped | cancelled`.
- Retry cria novo Node Run, incrementa `attempt` e preserva `retriedFromNodeRunId`.
- O banco é a barreira final de autorização; toda mutação usa chave de idempotência.

## 4. Arquitetura alvo

```text
UI / WorkstationProvider
  → Server action ou route handler (sessão, schema, capability, idempotency key)
  → SupabaseWorkstationRepository → PostgreSQL + RLS + audit_log
  → outbox_events (na mesma transação)
  → Worker durável (lease, retry, backoff, cancelamento)
  → process_runs / node_runs / run_events
  → Supabase Realtime → invalidar/refetch de snapshot → WS-ACTIONS
```

Nenhuma chamada ao worker acontece antes de estado e outbox serem confirmados na mesma transação.

## 5. Dados e isolamento

Tabelas mínimas: `organizations`, `organization_members`, `spaces`, `space_members`, `processes`, `process_nodes`, `node_connections`, `process_runs`, `node_runs`, `run_events`, `outbox_events`, `idempotency_keys`, `worker_leases`, `dead_letter_events` e `audit_log`.

Todas carregam `organization_id` quando aplicável; FKs/constraints impedem referências entre organizações. Índices obrigatórios: listas por `(organization_id, updated_at desc)`, execução por `(process_id, status)` e `(process_run_id, status)`, outbox por `(status, available_at)` e unicidade em `(organization_id, actor_id, idempotency_key)`.

Snapshots de input/output são `jsonb` limitado e redigido. Segredos, credenciais e tokens não entram em audit log, eventos, Realtime ou UI.

## 6. RLS e autorização

1. O servidor resolve usuário autenticado e organização pela sessão/rota; cliente não é autoridade de escopo.
2. Browser usa RLS; service role fica apenas no servidor/worker.
3. RLS exige membro ativo na organização e associação ao Space para Staff/User/Viewer.
4. Domínio valida capability para erro claro; RLS bloqueia bypass.
5. Funções privilegiadas são schema-qualified, têm `search_path` fixo e autorização explícita.

Admin/Owner/Board atuam em todos os Spaces; Staff gerencia/executa Spaces atribuídos; User lê/executa no escopo atribuído; Viewer somente lê o permitido. Cada combinação deve ter teste positivo e negativo.

## 7. Idempotência e concorrência

Todo comando mutável recebe `Idempotency-Key`: CRUD de Space/Process/Node/Connection, member assignment, start/cancel/retry.

1. Cliente gera UUID por intenção do usuário.
2. Servidor valida sessão, Zod, capability e `expectedRevision` em edições.
3. A transação reserva a chave com hash de payload; hash igual devolve resposta original, hash diferente devolve `409`.
4. Executa mutação, incrementa revisão, grava auditoria e outbox quando assíncrono.
5. Grava resposta final e confirma.

Chaves ficam por 30 dias; Start/Retry por 90. Cancelamento é idempotente. Edições conflituosas retornam a revisão atual. Nunca usar read-then-write sem condição de estado.

## 8. Worker, retry e recuperação

O worker adquire outbox com lock/lease atômico (`FOR UPDATE SKIP LOCKED` ou RPC), processa fora da transação curta e revalida lease/cancelamento antes de cada efeito. O executor inicial preserva Plan → Prepare → Execute → Result e persiste `run_events` por etapa.

- Transiente: até 5 tentativas com jitter (1 min, 5 min, 15 min, 1 h, 4 h).
- Permanente (validação/autorização): falhar sem retry.
- Lease vencido: reassumir apenas com fence/versão válida.
- Reinício: recuperar outbox `processing` vencido e Runs sem heartbeat.
- Esgotado: DLQ, Run failed, alerta; replay somente por operador autorizado com nova chave.

## 9. Fallback defensivo e ofensivo

### Defensivo

| Cenário | Resposta segura |
|---|---|
| Requisição repetida/time-out | retornar efeito original/`accepted`; não duplicar |
| Banco ou RLS indisponível | falhar fechado; sem cache mutável local |
| Worker indisponível | Run permanece `queued`, atraso explícito e backlog monitorado |
| Realtime indisponível | último estado confirmado, reconexão/backoff e Refresh manual |
| Evento duplicado | handler idempotente e deduplicado por sequência/chave |
| Timeout de efeito externo | `reconciliation_required`; nunca repetir automaticamente |
| Cancelamento em voo | parar antes da próxima etapa e reconciliar efeito em voo |
| Payload sensível/grande | redigir/truncar e publicar apenas dados seguros |

### Ofensivo

- Monitorar backlog, idade, lease vencido, DLQ, taxa de falhas, lag Realtime e discrepâncias.
- Reconciliador periódico reprograma somente ações comprovadamente seguras.
- Replay de DLQ exige motivo, escopo, nova chave e auditoria.
- Circuit breaker por executor/integração abre em erro recorrente e volta por probes seguros.
- Actions expõe `Queued — execution delayed`; nunca inventa sucesso.
- Falha de CML é explícita; não existe fallback local de corpus, embeddings ou retrieval.

Nenhum fallback ofensivo repete efeito externo não comprovadamente idempotente.

## 10. Realtime

Publicar: `process_run.created`, `process_run.status_changed`, `node_run.created`, `node_run.stage_changed`, `node_run.completed`, `node_run.failed`, `node_run.cancelled` e terminais de Process Run. Eventos são mínimos e obedecem RLS. Cliente invalida/refaz snapshot, não transiciona estado como autoridade. Reconnect faz catch-up por cursor/`updated_at`.

## 11. Plano de entrega e microgerenciamento

| Fase | Entrega | Gate |
|---|---|---|
| 0. Discovery | ADRs de schema, RLS, idempotência, payload e SLO | segurança aprova |
| 1. Base | migrations, tipos DB, sessão/org, RLS e testes negativos | isolamento validado |
| 2. Repositório | CRUD durável + revision/conflict | UI atual passa contra Supabase |
| 3. Auditoria | audit log, idempotency, logs correlacionados | repetição não duplica |
| 4. Runtime | outbox, leases, worker, executor | restart/cancel passam |
| 5. Actions | projeção, Realtime, catch-up/degradação | atualização sem refresh obrigatório |
| 6. Hardening | DLQ, reconciliador, alertas, caos/rollback | recuperação ensaiada |
| 7. Rollout | flags por organização e canário | SLO estável por 24 h |

Cada fase exige: PR pequena, migration aditiva/reversível, revisão de segurança/RLS, testes, staging, checklist de deploy e decisão explícita de avançar/pausar. P0/P1 bloqueia a fase seguinte.

## 12. Observabilidade e SLOs

Correlacionar `request_id`, `command_id`, `idempotency_key`, `organization_id`, `process_run_id`, `node_run_id`, `outbox_event_id` e `worker_id`.

- 99% dos comandos persistidos em até 2 s.
- 99% dos eventos elegíveis iniciam em até 60 s.
- Zero duplicação comprovada por retry/idempotência.
- Alertar: backlog >5 min, lease >2 min, DLQ não vazia ou erro >5% por 10 min.

## 13. Rollout e rollback

Ativar schema/RLS sem tráfego, testar leitura no ambiente interno, habilitar escrita+worker para canário, comparar estados/auditoria e expandir gradualmente por organização. Migrations são aditivas; rollback desliga flag e interrompe novos despachos, mas não apaga Runs aceitas. Reversão destrutiva requer aprovação humana e plano separado.

## 14. Critérios de aceite

- Refresh e nova sessão preservam todo o Workstation no escopo correto.
- RLS impede leitura/mutação cross-org e cross-space.
- Mesma chave e payload nunca duplicam; mesma chave e payload distinto dá conflito.
- Reinício do worker não perde nem duplica execução; cancelamento é consistente.
- Falhas transitórias aplicam backoff, permanentes/DLQ ficam operáveis.
- Actions atualiza em realtime, recupera desconexão e mantém Refresh manual.
- Toda mutação possui audit log saneado e correlacionado.
- `npm run lint`, `npm run typecheck`, testes unit/integration/e2e e migrations/RLS passam; Graphify atualiza quando Python estiver disponível.

## 15. Pendências de decisão

| Decisão | Antes de |
|---|---|
| Plataforma/deploy do worker | Fase 4 |
| Limite e armazenamento de snapshots | Fase 3 |
| Política de retenção/compliance | rollout externo |
| SDK e permissões oficiais CML | qualquer função CML |

Pendências não justificam persistência local ou quebra de contrato da UI: a funcionalidade fica desabilitada por flag e apresenta estado explícito até ser segura.
