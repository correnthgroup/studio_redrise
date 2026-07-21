-- PRD-024 Fase 2 — wrappers public.* para PostgREST (supabase.rpc).

create or replace function public.ws_create_space(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_name text,
  p_description text,
  p_members jsonb default '[]'::jsonb
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.create_space(
    p_organization_id, p_idempotency_key, p_payload_hash, p_name, p_description, p_members
  );
$$;

create or replace function public.ws_update_space(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_space_id uuid,
  p_expected_revision bigint,
  p_name text,
  p_description text
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.update_space(
    p_organization_id, p_idempotency_key, p_payload_hash, p_space_id, p_expected_revision, p_name, p_description
  );
$$;

create or replace function public.ws_archive_space(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_space_id uuid,
  p_expected_revision bigint
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.archive_space(
    p_organization_id, p_idempotency_key, p_payload_hash, p_space_id, p_expected_revision
  );
$$;

create or replace function public.ws_add_space_member(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_space_id uuid,
  p_member_id uuid,
  p_space_role text
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.add_space_member(
    p_organization_id, p_idempotency_key, p_payload_hash, p_space_id, p_member_id, p_space_role
  );
$$;

create or replace function public.ws_create_process(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_space_id uuid,
  p_name text,
  p_description text,
  p_owner text,
  p_frequency text,
  p_initial_node_type text
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.create_process(
    p_organization_id, p_idempotency_key, p_payload_hash, p_space_id, p_name, p_description,
    p_owner, p_frequency, p_initial_node_type
  );
$$;

create or replace function public.ws_update_process(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_process_id uuid,
  p_expected_revision bigint,
  p_name text,
  p_description text,
  p_owner text,
  p_frequency text
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.update_process(
    p_organization_id, p_idempotency_key, p_payload_hash, p_process_id, p_expected_revision,
    p_name, p_description, p_owner, p_frequency
  );
$$;

create or replace function public.ws_set_process_status(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_process_id uuid,
  p_expected_revision bigint,
  p_status text
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.set_process_status(
    p_organization_id, p_idempotency_key, p_payload_hash, p_process_id, p_expected_revision, p_status
  );
$$;

create or replace function public.ws_create_node(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_process_id uuid
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.create_node(p_organization_id, p_idempotency_key, p_payload_hash, p_process_id);
$$;

create or replace function public.ws_update_node(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_node_id uuid,
  p_expected_revision bigint,
  p_patch jsonb
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.update_node(
    p_organization_id, p_idempotency_key, p_payload_hash, p_node_id, p_expected_revision, p_patch
  );
$$;

create or replace function public.ws_duplicate_node(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_node_id uuid
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.duplicate_node(p_organization_id, p_idempotency_key, p_payload_hash, p_node_id);
$$;

create or replace function public.ws_delete_node(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_node_id uuid
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.delete_node(p_organization_id, p_idempotency_key, p_payload_hash, p_node_id);
$$;

create or replace function public.ws_connect_nodes(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_process_id uuid,
  p_source_node_id uuid,
  p_target_node_id uuid,
  p_connection_type text
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.connect_nodes(
    p_organization_id, p_idempotency_key, p_payload_hash, p_process_id,
    p_source_node_id, p_target_node_id, p_connection_type
  );
$$;

create or replace function public.ws_start_process(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_process_id uuid,
  p_triggered_by text default null
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.start_process(
    p_organization_id, p_idempotency_key, p_payload_hash, p_process_id, p_triggered_by
  );
$$;

create or replace function public.ws_cancel_run(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_process_run_id uuid
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.cancel_run(p_organization_id, p_idempotency_key, p_payload_hash, p_process_run_id);
$$;

create or replace function public.ws_retry_node_run(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_node_run_id uuid
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select workstation.retry_node_run(p_organization_id, p_idempotency_key, p_payload_hash, p_node_run_id);
$$;

revoke all on function
  public.ws_create_space(uuid, uuid, text, text, text, jsonb),
  public.ws_update_space(uuid, uuid, text, uuid, bigint, text, text),
  public.ws_archive_space(uuid, uuid, text, uuid, bigint),
  public.ws_add_space_member(uuid, uuid, text, uuid, uuid, text),
  public.ws_create_process(uuid, uuid, text, uuid, text, text, text, text, text),
  public.ws_update_process(uuid, uuid, text, uuid, bigint, text, text, text, text),
  public.ws_set_process_status(uuid, uuid, text, uuid, bigint, text),
  public.ws_create_node(uuid, uuid, text, uuid),
  public.ws_update_node(uuid, uuid, text, uuid, bigint, jsonb),
  public.ws_duplicate_node(uuid, uuid, text, uuid),
  public.ws_delete_node(uuid, uuid, text, uuid),
  public.ws_connect_nodes(uuid, uuid, text, uuid, uuid, uuid, text),
  public.ws_start_process(uuid, uuid, text, uuid, text),
  public.ws_cancel_run(uuid, uuid, text, uuid),
  public.ws_retry_node_run(uuid, uuid, text, uuid)
from public, anon;

grant execute on function
  public.ws_create_space(uuid, uuid, text, text, text, jsonb),
  public.ws_update_space(uuid, uuid, text, uuid, bigint, text, text),
  public.ws_archive_space(uuid, uuid, text, uuid, bigint),
  public.ws_add_space_member(uuid, uuid, text, uuid, uuid, text),
  public.ws_create_process(uuid, uuid, text, uuid, text, text, text, text, text),
  public.ws_update_process(uuid, uuid, text, uuid, bigint, text, text, text, text),
  public.ws_set_process_status(uuid, uuid, text, uuid, bigint, text),
  public.ws_create_node(uuid, uuid, text, uuid),
  public.ws_update_node(uuid, uuid, text, uuid, bigint, jsonb),
  public.ws_duplicate_node(uuid, uuid, text, uuid),
  public.ws_delete_node(uuid, uuid, text, uuid),
  public.ws_connect_nodes(uuid, uuid, text, uuid, uuid, uuid, text),
  public.ws_start_process(uuid, uuid, text, uuid, text),
  public.ws_cancel_run(uuid, uuid, text, uuid),
  public.ws_retry_node_run(uuid, uuid, text, uuid)
to authenticated, service_role;
