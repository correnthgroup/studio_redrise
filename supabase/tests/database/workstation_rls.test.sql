-- PRD-024 Fase 1 — testes negativos/positivos de RLS e isolamento (gate: "isolamento validado")
-- Executar com: npx supabase test db  (requer Docker/local stack)

begin;

create extension if not exists pgtap with schema extensions;

set local search_path = public, extensions;

select plan(29);

-- ---------------------------------------------------------------------------
-- Helpers de sessão simulada
-- ---------------------------------------------------------------------------

create function pg_temp.login(uid uuid) returns void
language plpgsql as $fn$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end;
$fn$;

create function pg_temp.logout() returns void
language plpgsql as $fn$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
end;
$fn$;

-- ---------------------------------------------------------------------------
-- Seed (como postgres, dono das tabelas — bypassa RLS por definição)
-- ---------------------------------------------------------------------------

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin-a@test.local',  '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'staff-a@test.local',  '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'user-a@test.local',   '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'viewer-a@test.local', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'admin-b@test.local',  '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

insert into public.organizations (id, slug, name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'org-a', 'Org A'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'org-b', 'Org B');

insert into public.organization_members (id, organization_id, user_id, role, display_name, email) values
  ('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Admin',  'Admin A',  'admin-a@test.local'),
  ('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Staff',  'Staff A',  'staff-a@test.local'),
  ('a3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'User',   'User A',   'user-a@test.local'),
  ('a4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Viewer', 'Viewer A', 'viewer-a@test.local'),
  ('b1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'Admin',  'Admin B',  'admin-b@test.local');

insert into public.spaces (id, organization_id, name) values
  ('ca000000-0000-0000-0000-0000000000a1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Space A1'),
  ('ca000000-0000-0000-0000-0000000000a2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Space A2'),
  ('cb000000-0000-0000-0000-0000000000b1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Space B1');

-- Staff/User/Viewer atribuídos somente ao Space A1
insert into public.space_members (organization_id, space_id, member_id, space_role) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca000000-0000-0000-0000-0000000000a1', 'a2222222-2222-2222-2222-222222222222', 'Staff'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca000000-0000-0000-0000-0000000000a1', 'a3333333-3333-3333-3333-333333333333', 'User'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca000000-0000-0000-0000-0000000000a1', 'a4444444-4444-4444-4444-444444444444', 'Viewer');

insert into public.processes (id, organization_id, space_id, name) values
  ('da000000-0000-0000-0000-0000000000a1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca000000-0000-0000-0000-0000000000a1', 'Process A1'),
  ('da000000-0000-0000-0000-0000000000a2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca000000-0000-0000-0000-0000000000a2', 'Process A2'),
  ('db000000-0000-0000-0000-0000000000b1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cb000000-0000-0000-0000-0000000000b1', 'Process B1');

insert into public.process_nodes (id, organization_id, space_id, process_id, node_type, title) values
  ('ea000000-0000-0000-0000-0000000000a1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca000000-0000-0000-0000-0000000000a1', 'da000000-0000-0000-0000-0000000000a1', 'llm', 'Node A1');

insert into public.process_runs (id, organization_id, space_id, process_id, status) values
  ('fa000000-0000-0000-0000-0000000000a1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca000000-0000-0000-0000-0000000000a1', 'da000000-0000-0000-0000-0000000000a1', 'completed');

insert into public.node_runs (id, organization_id, space_id, process_id, process_run_id, node_id, node_title, node_type, status, stage) values
  ('fb000000-0000-0000-0000-0000000000a1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca000000-0000-0000-0000-0000000000a1', 'da000000-0000-0000-0000-0000000000a1', 'fa000000-0000-0000-0000-0000000000a1', 'ea000000-0000-0000-0000-0000000000a1', 'Node A1', 'llm', 'completed', 'result');

-- ---------------------------------------------------------------------------
-- 1. anon não lê nada
-- ---------------------------------------------------------------------------

set local role anon;

select throws_ok($$ select count(*) from public.organizations $$, '42501', null, 'anon: select em organizations negado');

reset role;

-- ---------------------------------------------------------------------------
-- 2-10. Admin da Org A: visão org-wide, mas nenhuma escrita direta
-- ---------------------------------------------------------------------------

select pg_temp.login('11111111-1111-1111-1111-111111111111');

select is((select count(*)::int from public.organizations), 1, 'admin A: vê apenas a própria organização');
select is((select count(*)::int from public.spaces), 2, 'admin A: vê todos os Spaces da org (org-wide)');
select is((select count(*)::int from public.processes), 2, 'admin A: vê todos os Processes da org');
select is((select count(*)::int from public.node_runs), 1, 'admin A: vê Node Runs da org');
select throws_ok($$ insert into public.spaces (organization_id, name) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'X') $$, '42501', null, 'admin A: insert direto em spaces negado (escrita só via RPC)');
select throws_ok($$ update public.processes set name = 'X' $$, '42501', null, 'admin A: update direto em processes negado');
select throws_ok($$ select count(*) from public.outbox_events $$, '42501', null, 'admin A: outbox_events invisível para clientes');
select throws_ok($$ select count(*) from public.audit_log $$, '42501', null, 'admin A: audit_log invisível para clientes');
select throws_ok($$ select count(*) from public.idempotency_keys $$, '42501', null, 'admin A: idempotency_keys invisível para clientes');

select pg_temp.logout();

-- ---------------------------------------------------------------------------
-- 11-15. Staff da Org A: escopo restrito ao Space atribuído
-- ---------------------------------------------------------------------------

select pg_temp.login('22222222-2222-2222-2222-222222222222');

select is((select count(*)::int from public.spaces), 1, 'staff A: vê somente o Space atribuído');
select is((select name from public.spaces), 'Space A1', 'staff A: o Space visível é o A1');
select is((select count(*)::int from public.processes), 1, 'staff A: não vê Process de Space não atribuído');
select is((select count(*)::int from public.process_runs), 1, 'staff A: vê Runs do Space atribuído');
select throws_ok($$ delete from public.process_nodes $$, '42501', null, 'staff A: delete direto em process_nodes negado');

select pg_temp.logout();

-- ---------------------------------------------------------------------------
-- 16-17. User da Org A
-- ---------------------------------------------------------------------------

select pg_temp.login('33333333-3333-3333-3333-333333333333');

select is((select count(*)::int from public.spaces), 1, 'user A: vê somente o Space atribuído');
select throws_ok($$ insert into public.space_members (organization_id, space_id, member_id, space_role) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca000000-0000-0000-0000-0000000000a1', 'a3333333-3333-3333-3333-333333333333', 'Admin') $$, '42501', null, 'user A: não gerencia membros de Space');

select pg_temp.logout();

-- ---------------------------------------------------------------------------
-- 18-19. Viewer da Org A: somente leitura no escopo
-- ---------------------------------------------------------------------------

select pg_temp.login('44444444-4444-4444-4444-444444444444');

select is((select count(*)::int from public.node_runs), 1, 'viewer A: lê Actions do Space atribuído');
select throws_ok($$ insert into public.process_runs (organization_id, space_id, process_id) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca000000-0000-0000-0000-0000000000a1', 'da000000-0000-0000-0000-0000000000a1') $$, '42501', null, 'viewer A: não inicia Runs por escrita direta');

select pg_temp.logout();

-- ---------------------------------------------------------------------------
-- 20-23. Admin da Org B: zero visibilidade cross-org
-- ---------------------------------------------------------------------------

select pg_temp.login('55555555-5555-5555-5555-555555555555');

select is((select count(*)::int from public.organizations where slug = 'org-a'), 0, 'admin B: não enxerga a Org A');
select is((select count(*)::int from public.spaces), 1, 'admin B: vê apenas Spaces da própria org');
select is((select count(*)::int from public.processes where organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 0, 'admin B: não enxerga Processes da Org A');
select is((select count(*)::int from public.node_runs), 0, 'admin B: não enxerga Node Runs da Org A');

select pg_temp.logout();

-- ---------------------------------------------------------------------------
-- 24-25. Constraints impedem referência cross-org mesmo sem RLS (FK composta)
-- ---------------------------------------------------------------------------

select throws_ok(
  $$ insert into public.processes (organization_id, space_id, name) values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ca000000-0000-0000-0000-0000000000a1', 'Cross-org') $$,
  '23503', null, 'FK composta: Process da Org B não referencia Space da Org A');

select throws_ok(
  $$ insert into public.space_members (organization_id, space_id, member_id, space_role) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca000000-0000-0000-0000-0000000000a1', 'b1111111-1111-1111-1111-111111111111', 'User') $$,
  '23503', null, 'FK composta: membro da Org B não entra em Space da Org A');

-- ---------------------------------------------------------------------------
-- 26-27. Unicidade de idempotência (organization_id, actor_id, idempotency_key)
-- ---------------------------------------------------------------------------

select lives_ok(
  $$ insert into public.idempotency_keys (organization_id, actor_id, idempotency_key, command_type, payload_hash, expires_at) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'space.create', 'hash-1', now() + interval '30 days') $$,
  'idempotência: primeira reserva da chave aceita');

select throws_ok(
  $$ insert into public.idempotency_keys (organization_id, actor_id, idempotency_key, command_type, payload_hash, expires_at) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'space.create', 'hash-2', now() + interval '30 days') $$,
  '23505', null, 'idempotência: mesma chave nunca duplica');

-- ---------------------------------------------------------------------------
-- 28-29. Excluir Node preserva histórico de Actions (ADR-001 §13)
-- ---------------------------------------------------------------------------

select lives_ok(
  $$ delete from public.process_nodes where id = 'ea000000-0000-0000-0000-0000000000a1' $$,
  'node: exclusão do Node do canvas é permitida ao dono do schema');

select is(
  (select count(*)::int from public.node_runs where id = 'fb000000-0000-0000-0000-0000000000a1' and node_id is null and node_title = 'Node A1'),
  1,
  'node runs: histórico sobrevive à exclusão do Node com denormalização preservada');

select * from finish();

rollback;
