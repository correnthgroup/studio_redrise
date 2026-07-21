-- PRD-024 Fase 2 â€” RPCs de comando do Workstation (CRUD + start/cancel/retry enfileirados)
-- ADR-002 (SECURITY DEFINER), ADR-003 (idempotÃªncia + revision).

-- ---------------------------------------------------------------------------
-- Erros de domÃ­nio e helpers de autorizaÃ§Ã£o
-- ---------------------------------------------------------------------------

create or replace function workstation.raise(code text, message text)
returns void
language plpgsql
set search_path = ''
as $$
begin
  raise exception using errcode = 'P0001', message = message, detail = code;
end;
$$;

create or replace function workstation.require_active_member(org uuid)
returns public.organization_members
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  m public.organization_members;
begin
  select * into m
  from public.organization_members om
  where om.organization_id = org
    and om.user_id = (select auth.uid())
    and om.status = 'accepted';
  if not found then
    perform workstation.raise('permission_denied', 'Not an active organization member.');
  end if;
  return m;
end;
$$;

create or replace function workstation.assert_can_manage_space(org uuid, space uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not workstation.can_manage_space(org, space) then
    perform workstation.raise('permission_denied', 'Missing space.manage capability for this Space.');
  end if;
end;
$$;

create or replace function workstation.assert_can_manage_members(org uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not workstation.is_org_admin(org) then
    perform workstation.raise('permission_denied', 'Missing space.members.manage capability.');
  end if;
end;
$$;

create or replace function workstation.assert_can_run(org uuid, space uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  role text;
begin
  if not workstation.has_space_access(org, space) then
    perform workstation.raise('permission_denied', 'Missing process.run capability for this Space.');
  end if;
  role := workstation.org_role(org);
  if role is null or role = 'Viewer' then
    perform workstation.raise('permission_denied', 'Missing process.run capability.');
  end if;
end;
$$;

create or replace function workstation.assert_can_retry(org uuid, space uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not workstation.can_manage_space(org, space) then
    perform workstation.raise('permission_denied', 'Missing run.retry capability for this Space.');
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- IdempotÃªncia: reserva e conclusÃ£o
-- ---------------------------------------------------------------------------

create or replace function workstation.reserve_idempotency(
  p_org uuid,
  p_actor uuid,
  p_key uuid,
  p_command text,
  p_payload_hash text,
  p_ttl interval
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing public.idempotency_keys;
begin
  if p_key is null then
    perform workstation.raise('invalid_input', 'Idempotency-Key is required.');
  end if;

  insert into public.idempotency_keys (
    organization_id, actor_id, idempotency_key, command_type, payload_hash, status, expires_at
  ) values (
    p_org, p_actor, p_key, p_command, p_payload_hash, 'in_progress', now() + p_ttl
  )
  on conflict (organization_id, actor_id, idempotency_key) do nothing;

  select * into existing
  from public.idempotency_keys k
  where k.organization_id = p_org
    and k.actor_id = p_actor
    and k.idempotency_key = p_key;

  if existing.payload_hash is distinct from p_payload_hash then
    perform workstation.raise('idempotency_conflict', 'Idempotency-Key already used with a different payload.');
  end if;

  if existing.status = 'completed' then
    return jsonb_build_object(
      'replay', true,
      'response_status', existing.response_status,
      'response_body', existing.response_body
    );
  end if;

  if existing.status = 'failed' then
    perform workstation.raise('idempotency_conflict', 'Idempotency-Key previously failed; use a new key.');
  end if;

  return jsonb_build_object('replay', false, 'id', existing.id);
end;
$$;

create or replace function workstation.complete_idempotency(
  p_org uuid,
  p_actor uuid,
  p_key uuid,
  p_status integer,
  p_body jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.idempotency_keys
  set status = 'completed',
      response_status = p_status,
      response_body = p_body,
      updated_at = now()
  where organization_id = p_org
    and actor_id = p_actor
    and idempotency_key = p_key;
end;
$$;

create or replace function workstation.write_audit(
  p_org uuid,
  p_actor_user uuid,
  p_actor_member uuid,
  p_key uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_before jsonb,
  p_after jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_log (
    organization_id, actor_user_id, actor_member_id, idempotency_key,
    action, entity_type, entity_id, before_state, after_state
  ) values (
    p_org, p_actor_user, p_actor_member, p_key::text,
    p_action, p_entity_type, p_entity_id, p_before, p_after
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Spaces
-- ---------------------------------------------------------------------------

create or replace function workstation.create_space(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_name text,
  p_description text,
  p_members jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  space_row public.spaces;
  item jsonb;
  member_row public.organization_members;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);
  if not (workstation.is_org_admin(p_organization_id) or actor.role = 'Staff') then
    perform workstation.raise('permission_denied', 'Missing space.manage capability.');
  end if;

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'space.create', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  if coalesce(length(trim(p_name)), 0) < 2 then
    perform workstation.raise('invalid_input', 'Name is required.');
  end if;

  insert into public.spaces (organization_id, name, description, status, created_by, updated_by)
  values (p_organization_id, trim(p_name), coalesce(p_description, ''), 'Draft', actor.user_id, actor.user_id)
  returning * into space_row;

  for item in select * from jsonb_array_elements(coalesce(p_members, '[]'::jsonb))
  loop
    select * into member_row
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.id = (item->>'memberId')::uuid
      and om.status = 'accepted';
    if found then
      insert into public.space_members (organization_id, space_id, member_id, space_role, created_by)
      values (p_organization_id, space_row.id, member_row.id, coalesce(item->>'role', 'User'), actor.user_id)
      on conflict (space_id, member_id) do update set space_role = excluded.space_role;
    end if;
  end loop;

  body := jsonb_build_object('id', space_row.id, 'organizationId', space_row.organization_id, 'revision', space_row.revision);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'space.create', 'space', space_row.id, null, body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

create or replace function workstation.update_space(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_space_id uuid,
  p_expected_revision bigint,
  p_name text,
  p_description text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  before_row public.spaces;
  after_row public.spaces;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);
  perform workstation.assert_can_manage_space(p_organization_id, p_space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'space.update', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  select * into before_row from public.spaces s where s.organization_id = p_organization_id and s.id = p_space_id;
  if not found then
    perform workstation.raise('not_found', 'Space not found.');
  end if;
  if before_row.revision is distinct from p_expected_revision then
    perform workstation.raise('revision_conflict', format('Space revision conflict (current=%s).', before_row.revision));
  end if;

  update public.spaces
  set name = trim(p_name),
      description = coalesce(p_description, ''),
      revision = revision + 1,
      updated_by = actor.user_id,
      updated_at = now()
  where id = p_space_id and organization_id = p_organization_id and revision = p_expected_revision
  returning * into after_row;

  if not found then
    perform workstation.raise('revision_conflict', 'Space revision conflict.');
  end if;

  body := jsonb_build_object('id', after_row.id, 'revision', after_row.revision);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'space.update', 'space', after_row.id,
    jsonb_build_object('name', before_row.name, 'description', before_row.description, 'revision', before_row.revision), body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

create or replace function workstation.archive_space(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_space_id uuid,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  before_row public.spaces;
  after_row public.spaces;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);
  perform workstation.assert_can_manage_space(p_organization_id, p_space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'space.archive', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  select * into before_row from public.spaces s where s.organization_id = p_organization_id and s.id = p_space_id;
  if not found then
    perform workstation.raise('not_found', 'Space not found.');
  end if;
  if before_row.revision is distinct from p_expected_revision then
    perform workstation.raise('revision_conflict', format('Space revision conflict (current=%s).', before_row.revision));
  end if;

  update public.spaces
  set status = 'Archived', revision = revision + 1, updated_by = actor.user_id, updated_at = now()
  where id = p_space_id and organization_id = p_organization_id and revision = p_expected_revision
  returning * into after_row;

  body := jsonb_build_object('id', after_row.id, 'revision', after_row.revision, 'status', after_row.status);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'space.archive', 'space', after_row.id,
    jsonb_build_object('status', before_row.status, 'revision', before_row.revision), body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

create or replace function workstation.add_space_member(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_space_id uuid,
  p_member_id uuid,
  p_space_role text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  member_row public.organization_members;
  sm public.space_members;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);
  perform workstation.assert_can_manage_members(p_organization_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'space.member.add', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  if not exists (select 1 from public.spaces s where s.organization_id = p_organization_id and s.id = p_space_id) then
    perform workstation.raise('not_found', 'Space not found.');
  end if;

  select * into member_row
  from public.organization_members om
  where om.organization_id = p_organization_id and om.id = p_member_id and om.status = 'accepted';
  if not found then
    perform workstation.raise('invalid_input', 'Select an accepted organization member.');
  end if;

  if p_space_role not in ('Admin', 'Owner', 'Board', 'Staff', 'User', 'Viewer') then
    perform workstation.raise('invalid_input', 'Invalid space role.');
  end if;

  insert into public.space_members (organization_id, space_id, member_id, space_role, created_by)
  values (p_organization_id, p_space_id, p_member_id, p_space_role, actor.user_id)
  on conflict (space_id, member_id) do update set space_role = excluded.space_role
  returning * into sm;

  body := jsonb_build_object('id', sm.id, 'spaceId', sm.space_id, 'memberId', sm.member_id, 'spaceRole', sm.space_role);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'space.member.add', 'space_member', sm.id, null, body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

-- ---------------------------------------------------------------------------
-- Processes / nodes / connections
-- ---------------------------------------------------------------------------

create or replace function workstation.create_process(
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
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  process_row public.processes;
  node_row public.process_nodes;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);
  perform workstation.assert_can_manage_space(p_organization_id, p_space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'process.create', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  if not exists (select 1 from public.spaces s where s.organization_id = p_organization_id and s.id = p_space_id) then
    perform workstation.raise('not_found', 'Space not found.');
  end if;

  insert into public.processes (organization_id, space_id, name, description, owner, status, frequency, created_by, updated_by)
  values (p_organization_id, p_space_id, trim(p_name), coalesce(p_description, ''), coalesce(p_owner, ''), 'draft', coalesce(p_frequency, 'manual'), actor.user_id, actor.user_id)
  returning * into process_row;

  insert into public.process_nodes (
    organization_id, space_id, process_id, node_type, title, position_x, position_y, enabled,
    instruction, input_mode, output_type, config, failure_behavior, created_by, updated_by
  ) values (
    p_organization_id, p_space_id, process_row.id, coalesce(p_initial_node_type, 'llm'),
    format('Initial %s node', coalesce(p_initial_node_type, 'llm')), 160, 160, true,
    'Describe what this node should plan, prepare, execute and return.', 'manual', 'markdown',
    '{}'::jsonb, 'stop_process', actor.user_id, actor.user_id
  ) returning * into node_row;

  body := jsonb_build_object('id', process_row.id, 'nodeId', node_row.id, 'revision', process_row.revision);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'process.create', 'process', process_row.id, null, body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

create or replace function workstation.update_process(
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
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  before_row public.processes;
  after_row public.processes;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);

  select * into before_row from public.processes p where p.organization_id = p_organization_id and p.id = p_process_id;
  if not found then
    perform workstation.raise('not_found', 'Process not found.');
  end if;
  perform workstation.assert_can_manage_space(p_organization_id, before_row.space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'process.update', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  if before_row.revision is distinct from p_expected_revision then
    perform workstation.raise('revision_conflict', format('Process revision conflict (current=%s).', before_row.revision));
  end if;

  update public.processes
  set name = trim(p_name),
      description = coalesce(p_description, ''),
      owner = coalesce(p_owner, ''),
      frequency = coalesce(p_frequency, before_row.frequency),
      revision = revision + 1,
      updated_by = actor.user_id,
      updated_at = now()
  where id = p_process_id and organization_id = p_organization_id and revision = p_expected_revision
  returning * into after_row;

  body := jsonb_build_object('id', after_row.id, 'revision', after_row.revision);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'process.update', 'process', after_row.id, null, body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

create or replace function workstation.set_process_status(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_process_id uuid,
  p_expected_revision bigint,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  before_row public.processes;
  after_row public.processes;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);

  select * into before_row from public.processes p where p.organization_id = p_organization_id and p.id = p_process_id;
  if not found then
    perform workstation.raise('not_found', 'Process not found.');
  end if;
  perform workstation.assert_can_manage_space(p_organization_id, before_row.space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'process.set_status', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  if p_status not in ('draft', 'active', 'paused', 'archived') then
    perform workstation.raise('invalid_input', 'Invalid process status.');
  end if;
  if before_row.revision is distinct from p_expected_revision then
    perform workstation.raise('revision_conflict', format('Process revision conflict (current=%s).', before_row.revision));
  end if;

  update public.processes
  set status = p_status, revision = revision + 1, updated_by = actor.user_id, updated_at = now()
  where id = p_process_id and organization_id = p_organization_id and revision = p_expected_revision
  returning * into after_row;

  body := jsonb_build_object('id', after_row.id, 'status', after_row.status, 'revision', after_row.revision);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'process.set_status', 'process', after_row.id,
    jsonb_build_object('status', before_row.status), body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

create or replace function workstation.create_node(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_process_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  process_row public.processes;
  node_count int;
  node_row public.process_nodes;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);

  select * into process_row from public.processes p where p.organization_id = p_organization_id and p.id = p_process_id;
  if not found then
    perform workstation.raise('not_found', 'Process not found.');
  end if;
  perform workstation.assert_can_manage_space(p_organization_id, process_row.space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'node.create', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  select count(*)::int into node_count from public.process_nodes n where n.process_id = p_process_id;

  insert into public.process_nodes (
    organization_id, space_id, process_id, node_type, title, description, position_x, position_y, enabled,
    instruction, input_mode, output_type, config, failure_behavior, created_by, updated_by
  ) values (
    p_organization_id, process_row.space_id, p_process_id, 'llm', 'New LLM Node', 'Draft node.',
    220 + node_count * 80, 360, true,
    'Describe what this node should plan, prepare, execute and return.', 'previous_node', 'markdown',
    jsonb_build_object('model', 'default'), 'stop_process', actor.user_id, actor.user_id
  ) returning * into node_row;

  update public.processes set updated_at = now(), updated_by = actor.user_id where id = p_process_id;

  body := jsonb_build_object('id', node_row.id, 'processId', node_row.process_id, 'revision', node_row.revision);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'node.create', 'process_node', node_row.id, null, body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

create or replace function workstation.update_node(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_node_id uuid,
  p_expected_revision bigint,
  p_patch jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  before_row public.process_nodes;
  after_row public.process_nodes;
  body jsonb;
  pos jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);

  select * into before_row from public.process_nodes n where n.organization_id = p_organization_id and n.id = p_node_id;
  if not found then
    perform workstation.raise('not_found', 'Node not found.');
  end if;
  perform workstation.assert_can_manage_space(p_organization_id, before_row.space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'node.update', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  if before_row.revision is distinct from p_expected_revision then
    perform workstation.raise('revision_conflict', format('Node revision conflict (current=%s).', before_row.revision));
  end if;

  pos := p_patch->'position';

  update public.process_nodes
  set title = coalesce(p_patch->>'title', title),
      description = case when p_patch ? 'description' then p_patch->>'description' else description end,
      node_type = coalesce(p_patch->>'nodeType', node_type),
      position_x = coalesce((pos->>'x')::double precision, position_x),
      position_y = coalesce((pos->>'y')::double precision, position_y),
      enabled = coalesce((p_patch->>'enabled')::boolean, enabled),
      instruction = coalesce(p_patch->>'instruction', instruction),
      input_mode = coalesce(p_patch->>'inputMode', input_mode),
      input_mapping = coalesce(p_patch->'inputMapping', input_mapping),
      output_type = coalesce(p_patch->>'outputType', output_type),
      output_contract = case when p_patch ? 'outputContract' then p_patch->'outputContract' else output_contract end,
      config = coalesce(p_patch->'config', config),
      failure_behavior = coalesce(p_patch->>'failureBehavior', failure_behavior),
      revision = revision + 1,
      updated_by = actor.user_id,
      updated_at = now()
  where id = p_node_id and organization_id = p_organization_id and revision = p_expected_revision
  returning * into after_row;

  body := jsonb_build_object('id', after_row.id, 'revision', after_row.revision);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'node.update', 'process_node', after_row.id, null, body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

create or replace function workstation.duplicate_node(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_node_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  source public.process_nodes;
  copy_row public.process_nodes;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);

  select * into source from public.process_nodes n where n.organization_id = p_organization_id and n.id = p_node_id;
  if not found then
    perform workstation.raise('not_found', 'Node not found.');
  end if;
  perform workstation.assert_can_manage_space(p_organization_id, source.space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'node.duplicate', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  insert into public.process_nodes (
    organization_id, space_id, process_id, node_type, title, description, position_x, position_y, enabled,
    instruction, input_mode, input_mapping, output_type, output_contract, config, failure_behavior, created_by, updated_by
  ) values (
    source.organization_id, source.space_id, source.process_id, source.node_type, source.title || ' copy', source.description,
    source.position_x + 48, source.position_y + 48, source.enabled, source.instruction, source.input_mode, source.input_mapping,
    source.output_type, source.output_contract, source.config, source.failure_behavior, actor.user_id, actor.user_id
  ) returning * into copy_row;

  body := jsonb_build_object('id', copy_row.id, 'processId', copy_row.process_id, 'revision', copy_row.revision);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'node.duplicate', 'process_node', copy_row.id, null, body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

create or replace function workstation.delete_node(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_node_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  node_row public.process_nodes;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);

  select * into node_row from public.process_nodes n where n.organization_id = p_organization_id and n.id = p_node_id;
  if not found then
    perform workstation.raise('not_found', 'Node not found.');
  end if;
  perform workstation.assert_can_manage_space(p_organization_id, node_row.space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'node.delete', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  delete from public.node_connections
  where organization_id = p_organization_id
    and (source_node_id = p_node_id or target_node_id = p_node_id);

  delete from public.process_nodes
  where organization_id = p_organization_id and id = p_node_id;

  body := jsonb_build_object('id', p_node_id, 'deleted', true);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'node.delete', 'process_node', p_node_id, null, body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

create or replace function workstation.connect_nodes(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_process_id uuid,
  p_source_node_id uuid,
  p_target_node_id uuid,
  p_connection_type text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  process_row public.processes;
  conn public.node_connections;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);

  select * into process_row from public.processes p where p.organization_id = p_organization_id and p.id = p_process_id;
  if not found then
    perform workstation.raise('not_found', 'Process not found.');
  end if;
  perform workstation.assert_can_manage_space(p_organization_id, process_row.space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'node.connect', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  if p_source_node_id = p_target_node_id then
    perform workstation.raise('invalid_input', 'Cannot connect a node to itself.');
  end if;

  if not exists (
    select 1 from public.process_nodes n
    where n.organization_id = p_organization_id and n.id = p_source_node_id and n.process_id = p_process_id
  ) or not exists (
    select 1 from public.process_nodes n
    where n.organization_id = p_organization_id and n.id = p_target_node_id and n.process_id = p_process_id
  ) then
    perform workstation.raise('invalid_input', 'Both nodes must belong to the Process.');
  end if;

  insert into public.node_connections (
    organization_id, space_id, process_id, source_node_id, target_node_id, connection_type, created_by
  ) values (
    p_organization_id, process_row.space_id, p_process_id, p_source_node_id, p_target_node_id,
    coalesce(nullif(p_connection_type, ''), 'default'), actor.user_id
  )
  on conflict (source_node_id, target_node_id, connection_type) do update
    set created_at = public.node_connections.created_at
  returning * into conn;

  body := jsonb_build_object(
    'id', conn.id, 'processId', conn.process_id,
    'sourceNodeId', conn.source_node_id, 'targetNodeId', conn.target_node_id,
    'connectionType', conn.connection_type
  );
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'node.connect', 'node_connection', conn.id, null, body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

-- ---------------------------------------------------------------------------
-- Runtime commands (persist queued state; worker is Phase 4)
-- ---------------------------------------------------------------------------

create or replace function workstation.start_process(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_process_id uuid,
  p_triggered_by text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  process_row public.processes;
  run_row public.process_runs;
  node_row public.process_nodes;
  body jsonb;
  trigger_label text;
begin
  actor := workstation.require_active_member(p_organization_id);

  select * into process_row from public.processes p where p.organization_id = p_organization_id and p.id = p_process_id;
  if not found then
    perform workstation.raise('not_found', 'Process not found.');
  end if;
  perform workstation.assert_can_run(p_organization_id, process_row.space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'process.start', p_payload_hash, interval '90 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  if process_row.status in ('archived', 'paused') then
    perform workstation.raise('invalid_transition', 'Activate the Process before running it.');
  end if;

  trigger_label := coalesce(nullif(trim(p_triggered_by), ''), nullif(actor.display_name, ''), actor.email, 'user');

  insert into public.process_runs (
    organization_id, space_id, process_id, status, trigger_type, triggered_by, triggered_by_member_id, queued_at
  ) values (
    p_organization_id, process_row.space_id, p_process_id, 'queued', 'manual', trigger_label, actor.id, now()
  ) returning * into run_row;

  for node_row in
    select * from public.process_nodes n
    where n.organization_id = p_organization_id and n.process_id = p_process_id and n.enabled = true
    order by n.created_at
  loop
    insert into public.node_runs (
      organization_id, space_id, process_id, process_run_id, node_id, node_title, node_type, output_type,
      model_name, status, stage, attempt, metadata, queued_at
    ) values (
      p_organization_id, process_row.space_id, p_process_id, run_row.id, node_row.id, node_row.title, node_row.node_type,
      node_row.output_type, coalesce(node_row.config->>'model', 'default'), 'queued', 'plan', 1,
      jsonb_build_object('attempts', 1), now()
    );
  end loop;

  insert into public.outbox_events (organization_id, event_type, payload, status, available_at, dedupe_key)
  values (
    p_organization_id,
    'process_run.execute',
    jsonb_build_object('processRunId', run_row.id, 'processId', p_process_id),
    'pending',
    now(),
    'process_run.execute:' || run_row.id::text
  );

  body := jsonb_build_object('id', run_row.id, 'status', run_row.status, 'processId', p_process_id);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'process.start', 'process_run', run_row.id, null, body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

create or replace function workstation.cancel_run(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_process_run_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  run_row public.process_runs;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);

  select * into run_row from public.process_runs r where r.organization_id = p_organization_id and r.id = p_process_run_id;
  if not found then
    perform workstation.raise('not_found', 'Run not found.');
  end if;
  perform workstation.assert_can_run(p_organization_id, run_row.space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'run.cancel', p_payload_hash, interval '30 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  -- Idempotent: terminal cancel already done returns current state.
  if run_row.status = 'cancelled' then
    body := jsonb_build_object('id', run_row.id, 'status', run_row.status);
    perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
    return body;
  end if;

  if run_row.status not in ('queued', 'running') then
    perform workstation.raise('invalid_transition', 'Only queued or running Runs can be cancelled.');
  end if;

  update public.process_runs
  set status = 'cancelled',
      cancel_requested_at = now(),
      cancel_requested_by = actor.user_id,
      finished_at = now(),
      updated_at = now()
  where id = p_process_run_id and organization_id = p_organization_id
  returning * into run_row;

  update public.node_runs
  set status = 'cancelled', stage = 'result', finished_at = now(), updated_at = now()
  where process_run_id = p_process_run_id
    and organization_id = p_organization_id
    and status not in ('completed', 'failed', 'cancelled');

  body := jsonb_build_object('id', run_row.id, 'status', run_row.status);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'run.cancel', 'process_run', run_row.id, null, body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

create or replace function workstation.retry_node_run(
  p_organization_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_node_run_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.organization_members;
  reserved jsonb;
  previous public.node_runs;
  retry_row public.node_runs;
  body jsonb;
begin
  actor := workstation.require_active_member(p_organization_id);

  select * into previous from public.node_runs nr where nr.organization_id = p_organization_id and nr.id = p_node_run_id;
  if not found then
    perform workstation.raise('not_found', 'Node Run not found.');
  end if;
  perform workstation.assert_can_retry(p_organization_id, previous.space_id);

  reserved := workstation.reserve_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 'run.retry', p_payload_hash, interval '90 days');
  if (reserved->>'replay')::boolean then
    return reserved->'response_body';
  end if;

  if previous.status <> 'failed' then
    perform workstation.raise('invalid_transition', 'Only failed Node Runs can be retried.');
  end if;

  insert into public.node_runs (
    organization_id, space_id, process_id, process_run_id, node_id, node_title, node_type, output_type,
    model_name, status, stage, attempt, retried_from_node_run_id, metadata, queued_at
  ) values (
    previous.organization_id, previous.space_id, previous.process_id, previous.process_run_id, previous.node_id,
    previous.node_title, previous.node_type, previous.output_type, previous.model_name, 'queued', 'plan',
    previous.attempt + 1, previous.id, jsonb_build_object('attempts', previous.attempt + 1), now()
  ) returning * into retry_row;

  update public.process_runs
  set status = 'running', finished_at = null, updated_at = now(), heartbeat_at = now()
  where id = previous.process_run_id and organization_id = p_organization_id;

  insert into public.outbox_events (organization_id, event_type, payload, status, available_at, dedupe_key)
  values (
    p_organization_id,
    'node_run.retry',
    jsonb_build_object('nodeRunId', retry_row.id, 'processRunId', previous.process_run_id),
    'pending',
    now(),
    'node_run.retry:' || retry_row.id::text
  );

  body := jsonb_build_object('id', retry_row.id, 'attempt', retry_row.attempt, 'retriedFromNodeRunId', previous.id, 'status', retry_row.status);
  perform workstation.write_audit(p_organization_id, actor.user_id, actor.id, p_idempotency_key, 'run.retry', 'node_run', retry_row.id, null, body);
  perform workstation.complete_idempotency(p_organization_id, actor.user_id, p_idempotency_key, 200, body);
  return body;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

revoke all on function
  workstation.raise(text, text),
  workstation.require_active_member(uuid),
  workstation.assert_can_manage_space(uuid, uuid),
  workstation.assert_can_manage_members(uuid),
  workstation.assert_can_run(uuid, uuid),
  workstation.assert_can_retry(uuid, uuid),
  workstation.reserve_idempotency(uuid, uuid, uuid, text, text, interval),
  workstation.complete_idempotency(uuid, uuid, uuid, integer, jsonb),
  workstation.write_audit(uuid, uuid, uuid, uuid, text, text, uuid, jsonb, jsonb)
from public, anon, authenticated;

grant execute on function
  workstation.create_space(uuid, uuid, text, text, text, jsonb),
  workstation.update_space(uuid, uuid, text, uuid, bigint, text, text),
  workstation.archive_space(uuid, uuid, text, uuid, bigint),
  workstation.add_space_member(uuid, uuid, text, uuid, uuid, text),
  workstation.create_process(uuid, uuid, text, uuid, text, text, text, text, text),
  workstation.update_process(uuid, uuid, text, uuid, bigint, text, text, text, text),
  workstation.set_process_status(uuid, uuid, text, uuid, bigint, text),
  workstation.create_node(uuid, uuid, text, uuid),
  workstation.update_node(uuid, uuid, text, uuid, bigint, jsonb),
  workstation.duplicate_node(uuid, uuid, text, uuid),
  workstation.delete_node(uuid, uuid, text, uuid),
  workstation.connect_nodes(uuid, uuid, text, uuid, uuid, uuid, text),
  workstation.start_process(uuid, uuid, text, uuid, text),
  workstation.cancel_run(uuid, uuid, text, uuid),
  workstation.retry_node_run(uuid, uuid, text, uuid)
to authenticated, service_role;
