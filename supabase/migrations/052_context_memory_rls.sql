-- 052_context_memory_rls.sql
-- RLS policies for the Context Memory Layer.
-- Membership is derived from public.workspace_members (existing schema).
-- Workspace text id is the scope of access; organization_id is preserved
-- alongside for cross-tenant analytics.

-- Helper: returns true when the current auth user belongs to the given workspace.
create or replace function public.is_workspace_member(ws_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = ws_id
      and wm.user_id = auth.uid()
  );
$$;

-- Helper: returns true when the current auth user has write access to
-- the context memory layer in the given workspace. v1 grants write access
-- to admins and owners. Once PRD-RS-006 (agent registry) ships, extend
-- with capability checks for `context_writer`.
create or replace function public.is_context_writer(ws_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = ws_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
  );
$$;

-- Enable RLS on every context memory table.
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.document_summaries enable row level security;
alter table public.entities enable row level security;
alter table public.relations enable row level security;
alter table public.context_queries enable row level security;
alter table public.context_packs enable row level security;

-- documents: members can read; context_writer can insert/update; nobody deletes
-- from the client (deletions must go through service role).
drop policy if exists documents_select_member on public.documents;
create policy documents_select_member
  on public.documents for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists documents_insert_writer on public.documents;
create policy documents_insert_writer
  on public.documents for insert
  with check (public.is_context_writer(workspace_id));

drop policy if exists documents_update_writer on public.documents;
create policy documents_update_writer
  on public.documents for update
  using (public.is_context_writer(workspace_id))
  with check (public.is_context_writer(workspace_id));

-- document_chunks: same model.
drop policy if exists document_chunks_select_member on public.document_chunks;
create policy document_chunks_select_member
  on public.document_chunks for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists document_chunks_insert_writer on public.document_chunks;
create policy document_chunks_insert_writer
  on public.document_chunks for insert
  with check (public.is_context_writer(workspace_id));

drop policy if exists document_chunks_update_writer on public.document_chunks;
create policy document_chunks_update_writer
  on public.document_chunks for update
  using (public.is_context_writer(workspace_id))
  with check (public.is_context_writer(workspace_id));

-- document_summaries: members read; writers write.
drop policy if exists document_summaries_select_member on public.document_summaries;
create policy document_summaries_select_member
  on public.document_summaries for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists document_summaries_insert_writer on public.document_summaries;
create policy document_summaries_insert_writer
  on public.document_summaries for insert
  with check (public.is_context_writer(workspace_id));

drop policy if exists document_summaries_update_writer on public.document_summaries;
create policy document_summaries_update_writer
  on public.document_summaries for update
  using (public.is_context_writer(workspace_id))
  with check (public.is_context_writer(workspace_id));

-- entities / relations: members read; writers write.
drop policy if exists entities_select_member on public.entities;
create policy entities_select_member
  on public.entities for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists entities_insert_writer on public.entities;
create policy entities_insert_writer
  on public.entities for insert
  with check (public.is_context_writer(workspace_id));

drop policy if exists entities_update_writer on public.entities;
create policy entities_update_writer
  on public.entities for update
  using (public.is_context_writer(workspace_id))
  with check (public.is_context_writer(workspace_id));

drop policy if exists relations_select_member on public.relations;
create policy relations_select_member
  on public.relations for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists relations_insert_writer on public.relations;
create policy relations_insert_writer
  on public.relations for insert
  with check (public.is_context_writer(workspace_id));

drop policy if exists relations_update_writer on public.relations;
create policy relations_update_writer
  on public.relations for update
  using (public.is_context_writer(workspace_id))
  with check (public.is_context_writer(workspace_id));

-- context_queries: members can insert (audit); members can read.
drop policy if exists context_queries_select_member on public.context_queries;
create policy context_queries_select_member
  on public.context_queries for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists context_queries_insert_member on public.context_queries;
create policy context_queries_insert_member
  on public.context_queries for insert
  with check (public.is_workspace_member(workspace_id));

-- context_packs: members can read; members can insert their own packs;
-- writers can update.
drop policy if exists context_packs_select_member on public.context_packs;
create policy context_packs_select_member
  on public.context_packs for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists context_packs_insert_member on public.context_packs;
create policy context_packs_insert_member
  on public.context_packs for insert
  with check (public.is_workspace_member(workspace_id));

drop policy if exists context_packs_update_writer on public.context_packs;
create policy context_packs_update_writer
  on public.context_packs for update
  using (public.is_context_writer(workspace_id))
  with check (public.is_context_writer(workspace_id));