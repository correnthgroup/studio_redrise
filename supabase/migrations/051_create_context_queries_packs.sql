-- 051_create_context_queries_packs.sql
-- Retrieval audit and composed context packs.
-- A query is one retrieval request; a pack is the compressed response delivered
-- to an agent. The link to a Work Order is optional until PRD-RS-005 ships.

create table if not exists public.context_queries (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.workspaces(id) on delete cascade,
  organization_id uuid not null,
  product_key text not null check (product_key in ('redrise','redscale','redrose','findfee','adgency','correnth')),
  query text not null,
  filters jsonb not null default '{}'::jsonb,
  requested_by text not null default '',
  consumer_type text not null default 'human' check (consumer_type in ('human','agent','cli','mcp','system')),
  result_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists context_queries_workspace_id_idx on public.context_queries (workspace_id);
create index if not exists context_queries_organization_id_idx on public.context_queries (organization_id);
create index if not exists context_queries_product_key_idx on public.context_queries (product_key);
create index if not exists context_queries_created_at_idx on public.context_queries (created_at desc);

create table if not exists public.context_packs (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.workspaces(id) on delete cascade,
  organization_id uuid not null,
  product_key text not null,
  query_id uuid references public.context_queries(id) on delete set null,
  work_order_id text,
  context_pack text not null,
  selected_chunk_ids uuid[] not null default '{}'::uuid[],
  compression_strategy text not null default 'default' check (compression_strategy in ('default','aggressive','minimal')),
  token_estimate int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists context_packs_workspace_id_idx on public.context_packs (workspace_id);
create index if not exists context_packs_organization_id_idx on public.context_packs (organization_id);
create index if not exists context_packs_product_key_idx on public.context_packs (product_key);
create index if not exists context_packs_query_id_idx on public.context_packs (query_id);
create index if not exists context_packs_work_order_id_idx on public.context_packs (work_order_id);
create index if not exists context_packs_created_at_idx on public.context_packs (created_at desc);