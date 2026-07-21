-- PRD-024 Fase 1 — Base durável do Workstation
-- ADR-001 (schema), ADR-003 (idempotência), ADR-004 (limites de payload).
-- Aditiva: não toca em nenhum objeto legado (workspaces/flows/tasks).

-- ---------------------------------------------------------------------------
-- Schema utilitário (funções ficam aqui; tabelas ficam em public — ADR-001 §1-2)
-- ---------------------------------------------------------------------------

create schema if not exists workstation;

grant usage on schema workstation to authenticated;
grant usage on schema workstation to service_role;

create or replace function workstation.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- organizations / organization_members
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  name text not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('Admin', 'Owner', 'Board', 'Staff', 'User', 'Viewer')),
  status text not null default 'accepted' check (status in ('accepted', 'pending', 'declined', 'revoked')),
  display_name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (organization_id, id)
);

create index organization_members_user_id_idx on public.organization_members (user_id);
create index organization_members_org_updated_idx on public.organization_members (organization_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- spaces / space_members
-- ---------------------------------------------------------------------------

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text not null default '',
  status text not null default 'Active' check (status in ('Active', 'Draft', 'Archived')),
  revision bigint not null default 1 check (revision >= 1),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create index spaces_org_updated_idx on public.spaces (organization_id, updated_at desc);

create table public.space_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  space_id uuid not null,
  member_id uuid not null,
  space_role text not null check (space_role in ('Admin', 'Owner', 'Board', 'Staff', 'User', 'Viewer')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  -- FKs compostas: impossível referenciar Space ou membro de outra organização (ADR-001 §8-9)
  foreign key (organization_id, space_id) references public.spaces (organization_id, id) on delete cascade,
  foreign key (organization_id, member_id) references public.organization_members (organization_id, id) on delete cascade,
  unique (space_id, member_id)
);

create index space_members_space_idx on public.space_members (space_id);
create index space_members_member_idx on public.space_members (member_id);

-- ---------------------------------------------------------------------------
-- processes / process_nodes / node_connections
-- ---------------------------------------------------------------------------

create table public.processes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  space_id uuid not null,
  name text not null,
  description text not null default '',
  owner text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  frequency text not null default 'manual' check (frequency in ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  revision bigint not null default 1 check (revision >= 1),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, space_id) references public.spaces (organization_id, id) on delete restrict
);

create index processes_org_updated_idx on public.processes (organization_id, updated_at desc);
create index processes_space_idx on public.processes (space_id);

create table public.process_nodes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  space_id uuid not null,
  process_id uuid not null,
  node_type text not null check (node_type in (
    'llm', 'api', 'browser', 'file', 'email', 'database',
    'webhook', 'human_approval', 'condition', 'integration', 'call_process'
  )),
  title text not null default '',
  description text,
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  enabled boolean not null default true,
  instruction text not null default '',
  input_mode text not null default 'previous_node' check (input_mode in ('previous_node', 'manual', 'attachment', 'integration', 'mixed')),
  input_mapping jsonb not null default '{}'::jsonb,
  output_type text not null default 'text' check (output_type in ('text', 'markdown', 'json', 'file', 'email', 'boolean', 'external_action_result')),
  output_contract jsonb,
  config jsonb not null default '{}'::jsonb,
  failure_behavior text not null default 'stop_process' check (failure_behavior in ('stop_process', 'follow_failure_path')),
  revision bigint not null default 1 check (revision >= 1),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, space_id) references public.spaces (organization_id, id) on delete restrict,
  foreign key (organization_id, process_id) references public.processes (organization_id, id) on delete cascade
);

create index process_nodes_process_idx on public.process_nodes (process_id);
create index process_nodes_org_updated_idx on public.process_nodes (organization_id, updated_at desc);

create table public.node_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  space_id uuid not null,
  process_id uuid not null,
  source_node_id uuid not null,
  target_node_id uuid not null,
  connection_type text not null default 'default' check (connection_type in ('success', 'failure', 'default')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (source_node_id <> target_node_id),
  foreign key (organization_id, space_id) references public.spaces (organization_id, id) on delete restrict,
  foreign key (organization_id, process_id) references public.processes (organization_id, id) on delete cascade,
  foreign key (organization_id, source_node_id) references public.process_nodes (organization_id, id) on delete cascade,
  foreign key (organization_id, target_node_id) references public.process_nodes (organization_id, id) on delete cascade,
  unique (source_node_id, target_node_id, connection_type)
);

create index node_connections_process_idx on public.node_connections (process_id);

-- ---------------------------------------------------------------------------
-- process_runs / node_runs / run_events
-- ---------------------------------------------------------------------------

create table public.process_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  space_id uuid not null,
  process_id uuid not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  trigger_type text not null default 'manual' check (trigger_type in ('manual', 'schedule', 'webhook', 'integration', 'process')),
  triggered_by text not null default '',
  triggered_by_member_id uuid,
  queued_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  cancel_requested_at timestamptz,
  cancel_requested_by uuid references auth.users (id) on delete set null,
  heartbeat_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, space_id) references public.spaces (organization_id, id) on delete restrict,
  foreign key (organization_id, process_id) references public.processes (organization_id, id) on delete restrict,
  foreign key (organization_id, triggered_by_member_id) references public.organization_members (organization_id, id) on delete set null (triggered_by_member_id)
);

create index process_runs_org_updated_idx on public.process_runs (organization_id, updated_at desc);
create index process_runs_process_status_idx on public.process_runs (process_id, status);

create table public.node_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  space_id uuid not null,
  process_id uuid not null,
  process_run_id uuid not null,
  node_id uuid,
  -- Denormalização defensiva: histórico de Actions sobrevive à exclusão do Node (ADR-001 §13)
  node_title text not null default '',
  node_type text not null default '',
  output_type text not null default 'text',
  model_name text not null default '',
  status text not null default 'queued' check (status in ('queued', 'planning', 'preparing', 'executing', 'completed', 'failed', 'skipped', 'cancelled')),
  stage text not null default 'plan' check (stage in ('plan', 'prepare', 'execute', 'result')),
  attempt integer not null default 1 check (attempt >= 1),
  retried_from_node_run_id uuid references public.node_runs (id) on delete set null,
  plan_summary text,
  prepare_summary text,
  execute_summary text,
  result_summary text,
  input_snapshot jsonb check (input_snapshot is null or pg_column_size(input_snapshot) <= 32768),
  output_snapshot jsonb check (output_snapshot is null or pg_column_size(output_snapshot) <= 32768),
  error_message text,
  failed_stage text check (failed_stage is null or failed_stage in ('plan', 'prepare', 'execute', 'result')),
  suggested_next_action text,
  metadata jsonb not null default '{}'::jsonb check (pg_column_size(metadata) <= 16384),
  queued_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  heartbeat_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, space_id) references public.spaces (organization_id, id) on delete restrict,
  foreign key (organization_id, process_id) references public.processes (organization_id, id) on delete restrict,
  foreign key (organization_id, process_run_id) references public.process_runs (organization_id, id) on delete cascade,
  foreign key (organization_id, node_id) references public.process_nodes (organization_id, id) on delete set null (node_id)
);

create index node_runs_org_updated_idx on public.node_runs (organization_id, updated_at desc);
create index node_runs_run_status_idx on public.node_runs (process_run_id, status);
create index node_runs_retried_from_idx on public.node_runs (retried_from_node_run_id) where retried_from_node_run_id is not null;

create table public.run_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  process_run_id uuid,
  node_run_id uuid,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb check (pg_column_size(payload) <= 16384),
  created_at timestamptz not null default now(),
  foreign key (organization_id, process_run_id) references public.process_runs (organization_id, id) on delete cascade,
  foreign key (organization_id, node_run_id) references public.node_runs (organization_id, id) on delete cascade
);

create index run_events_process_run_idx on public.run_events (process_run_id, id);
create index run_events_node_run_idx on public.run_events (node_run_id, id);

-- ---------------------------------------------------------------------------
-- Infraestrutura: outbox, idempotência, leases, DLQ, auditoria
-- ---------------------------------------------------------------------------

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb check (pg_column_size(payload) <= 16384),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'dead')),
  available_at timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 5 check (max_attempts >= 1),
  lease_id uuid,
  leased_by text,
  lease_expires_at timestamptz,
  fence bigint not null default 0,
  last_error text,
  dedupe_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index outbox_events_dispatch_idx on public.outbox_events (status, available_at);
create unique index outbox_events_dedupe_idx on public.outbox_events (organization_id, dedupe_key) where dedupe_key is not null;

create table public.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid not null,
  idempotency_key uuid not null,
  command_type text not null,
  payload_hash text not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'failed')),
  response_status integer,
  response_body jsonb check (response_body is null or pg_column_size(response_body) <= 16384),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, actor_id, idempotency_key)
);

create index idempotency_keys_expiry_idx on public.idempotency_keys (expires_at);

create table public.worker_leases (
  lease_key text primary key,
  holder text,
  fence bigint not null default 0,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.dead_letter_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  outbox_event_id uuid references public.outbox_events (id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb check (pg_column_size(payload) <= 16384),
  failure_reason text not null,
  attempts integer not null default 0,
  replayed_at timestamptz,
  replayed_by uuid references auth.users (id) on delete set null,
  replay_reason text,
  replay_new_event_id uuid references public.outbox_events (id) on delete set null,
  created_at timestamptz not null default now()
);

create index dead_letter_events_org_idx on public.dead_letter_events (organization_id, created_at desc);

create table public.audit_log (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_user_id uuid,
  actor_member_id uuid,
  request_id text,
  command_id text,
  idempotency_key text,
  action text not null,
  entity_type text,
  entity_id uuid,
  before_state jsonb check (before_state is null or pg_column_size(before_state) <= 16384),
  after_state jsonb check (after_state is null or pg_column_size(after_state) <= 16384),
  created_at timestamptz not null default now()
);

create index audit_log_org_created_idx on public.audit_log (organization_id, created_at desc);
create index audit_log_entity_idx on public.audit_log (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Triggers de updated_at
-- ---------------------------------------------------------------------------

create trigger set_updated_at before update on public.organizations
  for each row execute function workstation.set_updated_at();
create trigger set_updated_at before update on public.organization_members
  for each row execute function workstation.set_updated_at();
create trigger set_updated_at before update on public.spaces
  for each row execute function workstation.set_updated_at();
create trigger set_updated_at before update on public.processes
  for each row execute function workstation.set_updated_at();
create trigger set_updated_at before update on public.process_nodes
  for each row execute function workstation.set_updated_at();
create trigger set_updated_at before update on public.process_runs
  for each row execute function workstation.set_updated_at();
create trigger set_updated_at before update on public.node_runs
  for each row execute function workstation.set_updated_at();
create trigger set_updated_at before update on public.outbox_events
  for each row execute function workstation.set_updated_at();
create trigger set_updated_at before update on public.idempotency_keys
  for each row execute function workstation.set_updated_at();

-- ---------------------------------------------------------------------------
-- Privilégios: default-deny para clientes; escrita só via RPC/service role (ADR-002)
-- ---------------------------------------------------------------------------

revoke all on table
  public.organizations,
  public.organization_members,
  public.spaces,
  public.space_members,
  public.processes,
  public.process_nodes,
  public.node_connections,
  public.process_runs,
  public.node_runs,
  public.run_events,
  public.outbox_events,
  public.idempotency_keys,
  public.worker_leases,
  public.dead_letter_events,
  public.audit_log
from anon, authenticated;

-- Leitura de domínio para usuários autenticados (filtrada por RLS na migration 049)
grant select on table
  public.organizations,
  public.organization_members,
  public.spaces,
  public.space_members,
  public.processes,
  public.process_nodes,
  public.node_connections,
  public.process_runs,
  public.node_runs
to authenticated;
