-- PRD-024 Fase 1 — RLS e funções de autorização do Workstation
-- ADR-002: browser somente leitura sob RLS; mutações via RPCs (Fases 2+);
-- tabelas internas sem policies (service role apenas).

-- ---------------------------------------------------------------------------
-- Funções helper de autorização (schema-qualified, search_path fixo)
-- ---------------------------------------------------------------------------

create or replace function workstation.member_id(org uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.id
  from public.organization_members m
  where m.organization_id = org
    and m.user_id = (select auth.uid())
    and m.status = 'accepted'
  limit 1;
$$;

create or replace function workstation.is_active_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org
      and m.user_id = (select auth.uid())
      and m.status = 'accepted'
  );
$$;

create or replace function workstation.org_role(org uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select m.role
  from public.organization_members m
  where m.organization_id = org
    and m.user_id = (select auth.uid())
    and m.status = 'accepted'
  limit 1;
$$;

create or replace function workstation.is_org_admin(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(workstation.org_role(org) in ('Admin', 'Owner', 'Board'), false);
$$;

create or replace function workstation.has_space_access(org uuid, space uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select workstation.is_org_admin(org)
    or exists (
      select 1
      from public.space_members sm
      join public.organization_members m
        on m.id = sm.member_id
       and m.organization_id = sm.organization_id
      where sm.organization_id = org
        and sm.space_id = space
        and m.user_id = (select auth.uid())
        and m.status = 'accepted'
    );
$$;

create or replace function workstation.can_manage_space(org uuid, space uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select workstation.is_org_admin(org)
    or (
      workstation.org_role(org) = 'Staff'
      and exists (
        select 1
        from public.space_members sm
        join public.organization_members m
          on m.id = sm.member_id
         and m.organization_id = sm.organization_id
        where sm.organization_id = org
          and sm.space_id = space
          and m.user_id = (select auth.uid())
          and m.status = 'accepted'
      )
    );
$$;

revoke execute on function
  workstation.member_id(uuid),
  workstation.is_active_member(uuid),
  workstation.org_role(uuid),
  workstation.is_org_admin(uuid),
  workstation.has_space_access(uuid, uuid),
  workstation.can_manage_space(uuid, uuid)
from public, anon;

grant execute on function
  workstation.member_id(uuid),
  workstation.is_active_member(uuid),
  workstation.org_role(uuid),
  workstation.is_org_admin(uuid),
  workstation.has_space_access(uuid, uuid),
  workstation.can_manage_space(uuid, uuid)
to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS: habilitar em todas as tabelas do domínio e infraestrutura
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.processes enable row level security;
alter table public.process_nodes enable row level security;
alter table public.node_connections enable row level security;
alter table public.process_runs enable row level security;
alter table public.node_runs enable row level security;
alter table public.run_events enable row level security;
alter table public.outbox_events enable row level security;
alter table public.idempotency_keys enable row level security;
alter table public.worker_leases enable row level security;
alter table public.dead_letter_events enable row level security;
alter table public.audit_log enable row level security;

-- ---------------------------------------------------------------------------
-- Policies de leitura (authenticated). Sem policies de escrita: mutação só via
-- RPC SECURITY DEFINER (Fase 2+) ou service role (worker). Tabelas internas
-- (run_events, outbox, idempotency, leases, DLQ, audit_log) ficam sem policy.
-- ---------------------------------------------------------------------------

create policy organizations_select_member on public.organizations
  for select to authenticated
  using (workstation.is_active_member(id));

create policy organization_members_select_member on public.organization_members
  for select to authenticated
  using (workstation.is_active_member(organization_id));

create policy spaces_select_space_access on public.spaces
  for select to authenticated
  using (workstation.has_space_access(organization_id, id));

create policy space_members_select_space_access on public.space_members
  for select to authenticated
  using (workstation.has_space_access(organization_id, space_id));

create policy processes_select_space_access on public.processes
  for select to authenticated
  using (workstation.has_space_access(organization_id, space_id));

create policy process_nodes_select_space_access on public.process_nodes
  for select to authenticated
  using (workstation.has_space_access(organization_id, space_id));

create policy node_connections_select_space_access on public.node_connections
  for select to authenticated
  using (workstation.has_space_access(organization_id, space_id));

create policy process_runs_select_space_access on public.process_runs
  for select to authenticated
  using (workstation.has_space_access(organization_id, space_id));

create policy node_runs_select_space_access on public.node_runs
  for select to authenticated
  using (workstation.has_space_access(organization_id, space_id));
