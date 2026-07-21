# ADR-001 — Schema durável do Workstation

- Status: Proposto (gate Fase 0 da PRD-024)
- Data: 2026-07-21
- Fonte: `docs/external/correnth-prds/06_PRD_024_DURABLE_WORKSTATION_ADAPTERS_v1.md` §4–§5

## Contexto

O Workstation roda hoje sobre `InMemoryWorkstationAdapter` (`src/domains/workstation/core/workstation.ts`), sem persistência. A PRD-024 exige adaptadores Supabase/PostgreSQL preservando os contratos `WorkstationRepository`, `ExecutionRuntime` e `AuthorizationPolicy`. As migrations legadas 001–047 pertencem ao modelo anterior (workspaces/flows/tasks) e não são reutilizadas.

## Decisão

### Localização e nomenclatura

1. Tabelas de domínio no schema `public`, nomes exatamente como a PRD §5: `organizations`, `organization_members`, `spaces`, `space_members`, `processes`, `process_nodes`, `node_connections`, `process_runs`, `node_runs`, `run_events`, `outbox_events`, `idempotency_keys`, `worker_leases`, `dead_letter_events`, `audit_log`. Nenhum nome colide com tabelas legadas (`audit_logs` legado ≠ `audit_log` novo).
2. Funções de apoio e de autorização vivem no schema dedicado `workstation` (schema-qualified, `search_path` fixo — ver ADR-002).
3. Colunas em `snake_case`; a projeção para os tipos de UI (`camelCase`, campos humanizados como `duration`, `lastActivity`, contadores) é responsabilidade do adaptador/selectors, nunca do banco.

### Identidade, tempo e enums

4. PK `uuid` com `gen_random_uuid()` (exceto tabelas de eventos append-only, que usam `bigint generated always as identity` para ordenação barata: `run_events`, `audit_log`).
5. Todos os timestamps são `timestamptz`; `created_at`/`updated_at` com default `now()` e trigger `workstation.set_updated_at()`.
6. Enums como `text + CHECK` (não `CREATE TYPE`), para evolução aditiva sem lock de tipo. Valores espelham os literais de `process.types.ts`, `action.types.ts` e `space.types.ts`:
   - roles: `Admin|Owner|Board|Staff|User|Viewer`;
   - process status: `draft|active|paused|archived`; frequency: `realtime|hourly|daily|weekly|manual`;
   - process run: `queued|running|completed|failed|cancelled`;
   - node run: `queued|planning|preparing|executing|completed|failed|skipped|cancelled`; stage: `plan|prepare|execute|result`;
   - connection: `success|failure|default`; failure behavior: `stop_process|follow_failure_path`.

### Isolamento por organização

7. Toda tabela de domínio carrega `organization_id uuid not null` com FK para `organizations`.
8. Referências entre entidades usam FKs compostas com `organization_id` para tornar referência cross-org impossível por constraint, não só por RLS. Para isso cada tabela "pai" tem `unique (organization_id, id)` e cada filho declara `foreign key (organization_id, <parent_id>) references parent (organization_id, id)`.
9. `space_members.member_id` referencia `organization_members` pela FK composta — impossível associar membro de outra organização.

### Entidades e pontos de fidelidade ao contrato

10. `spaces.status` usa os literais da UI `Active|Draft|Archived`.
11. `processes.owner` permanece `text` (contrato atual da UI); normalizar para membro é mudança futura e aditiva.
12. `process_nodes` persiste `title`, `description`, `node_type`, `position_x/position_y`, `enabled`, `instruction`, `input_mode`, `input_mapping jsonb`, `output_type`, `output_contract jsonb`, `config jsonb`, `failure_behavior` — 1:1 com `RedRiseNode`.
13. `node_runs` denormaliza `node_title` e `node_type` no momento do run e usa `on delete set null` em `node_id`: excluir um Node do canvas nunca apaga nem quebra o histórico de Actions.
14. `node_runs` persiste `stage`, `attempt` (default 1), `retried_from_node_run_id` (FK para `node_runs`), summaries por stage, `input_snapshot/output_snapshot jsonb` (limites na ADR-004), `error_message`, `failed_stage`, `suggested_next_action`, `metadata jsonb`.
15. `process_runs` persiste `trigger_type`, `triggered_by`, `queued_at/started_at/finished_at`, `cancel_requested_at` e `heartbeat_at` (recuperação de worker, PRD §8).
16. Entidades editáveis (`spaces`, `processes`, `process_nodes`) têm `revision bigint not null default 1`, incrementada a cada mutação (concorrência otimista — ADR-003).

### Infraestrutura de execução

17. `outbox_events`: `status pending|processing|completed|failed|dead`, `available_at`, `attempts`, `max_attempts` (default 5), `lease_id`, `leased_by`, `lease_expires_at`, `fence bigint` (fencing token incrementado a cada aquisição), `last_error`, `dedupe_key` único opcional. Gravada sempre na mesma transação da mutação que a origina (PRD §4).
18. `idempotency_keys`: unicidade `(organization_id, actor_id, idempotency_key)`, `payload_hash`, `command_type`, `status in_progress|completed|failed`, `response_status`, `response_body jsonb`, `expires_at` (30 dias; 90 para start/retry — ADR-003).
19. `worker_leases`: `lease_key text` PK, `holder`, `fence bigint`, `expires_at` — coordenação de workers com fencing.
20. `dead_letter_events`: snapshot do evento esgotado + `failure_reason`, `attempts`, campos de replay auditado (`replayed_at`, `replayed_by`, `replay_reason`, `replay_new_event_id`).
21. `audit_log`: `actor_user_id`, `actor_member_id`, correlação (`request_id`, `command_id`, `idempotency_key`), `action`, `entity_type`, `entity_id`, `before/after jsonb` já redigidos (ADR-004).
22. `run_events`: trilha append-only por etapa do executor (Plan→Prepare→Execute→Result) correlacionada a `process_run_id`/`node_run_id`.

### Índices obrigatórios (PRD §5)

- Listas: `(organization_id, updated_at desc)` em `spaces`, `processes`, `process_runs`, `node_runs`.
- Execução: `(process_id, status)` em `process_runs`; `(process_run_id, status)` em `node_runs`.
- Outbox: `(status, available_at)`.
- Idempotência: unique `(organization_id, actor_id, idempotency_key)`.
- Apoio: `run_events (process_run_id, id)`, `run_events (node_run_id, id)`, `audit_log (organization_id, created_at desc)`, `space_members (space_id)`, `organization_members (user_id)`.

### Migrations

- Aditivas e numeradas em sequência (`050_...`, `051_...`; o remoto já tinha `048_project_plan_limits`), sem tocar em objetos legados.
- Rollback operacional = desligar flag (`WORKSTATION_DURABLE`), nunca `drop` automatizado (PRD §13).

## Alternativas rejeitadas

- Schema Postgres separado (`workstation.*`) para as tabelas: complica PostgREST/Realtime/types no Supabase sem ganho de isolamento real (RLS + FKs compostas já garantem). Funções ficam em schema dedicado; tabelas não.
- Postgres `ENUM` types: bloqueiam evolução aditiva simples.
- `organization_id` implícito via join: violaria o requisito da PRD §5 de coluna explícita e índices por organização.

## Consequências

- O adaptador durável projeta campos denormalizados da UI (`spaceName`, `processName`, `duration`, contadores) via selects/joins ou snapshot builder — sem colunas calculadas no banco além das citadas.
- Geração oficial de types via `supabase gen types` fica disponível quando houver Docker/CLI linkado; até lá os types são mantidos à mão (`src/lib/database.types.ts`) e conferidos contra as migrations em revisão.
