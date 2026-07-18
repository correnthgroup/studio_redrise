-- 049_create_context_memory.sql
-- Context Memory Layer core tables: documents, document_chunks, document_summaries.
-- All rows are workspace-scoped (matches the rest of RedRise schema).
-- RLS is enabled and policies live in 052.

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.workspaces(id) on delete cascade,
  organization_id uuid not null,
  product_key text not null check (product_key in ('redrise','redscale','redrose','findfee','adgency','correnth')),
  source_type text not null check (source_type in (
    'markdown',
    'conversation_decision',
    'architecture_doc',
    'prd',
    'roadmap',
    'ui_spec',
    'code_file',
    'external_reference'
  )),
  source_uri text not null,
  title text not null,
  slug text not null,
  content_hash text not null,
  status text not null default 'pending' check (status in ('pending','indexing','indexed','failed','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  indexed_at timestamptz,
  unique (workspace_id, product_key, source_uri)
);

create index if not exists documents_workspace_id_idx on public.documents (workspace_id);
create index if not exists documents_organization_id_idx on public.documents (organization_id);
create index if not exists documents_product_key_idx on public.documents (product_key);
create index if not exists documents_status_idx on public.documents (status);
create index if not exists documents_source_type_idx on public.documents (source_type);
create index if not exists documents_content_hash_idx on public.documents (content_hash);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  organization_id uuid not null,
  product_key text not null,
  chunk_index int not null,
  heading_path text not null default '',
  content text not null,
  content_tokens int not null default 0,
  content_hash text not null,
  embedding public.vector(1536),
  search_vector_en tsvector
    generated always as (to_tsvector('english', coalesce(content, '') || ' ' || coalesce(heading_path, ''))) stored,
  search_vector_simple tsvector
    generated always as (to_tsvector('simple', coalesce(content, '') || ' ' || coalesce(heading_path, ''))) stored,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create index if not exists document_chunks_document_id_idx on public.document_chunks (document_id);
create index if not exists document_chunks_workspace_id_idx on public.document_chunks (workspace_id);
create index if not exists document_chunks_organization_id_idx on public.document_chunks (organization_id);
create index if not exists document_chunks_product_key_idx on public.document_chunks (product_key);
create index if not exists document_chunks_content_hash_idx on public.document_chunks (content_hash);
create index if not exists document_chunks_search_vector_en_idx on public.document_chunks using gin (search_vector_en);
create index if not exists document_chunks_search_vector_simple_idx on public.document_chunks using gin (search_vector_simple);

-- Approximate nearest neighbour index on the embedding column.
-- Using hnsw with cosine distance for better recall.
create index if not exists document_chunks_embedding_hnsw_idx
  on public.document_chunks
  using hnsw (embedding public.vector_cosine_ops);

create table if not exists public.document_summaries (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  organization_id uuid not null,
  product_key text not null,
  summary_type text not null check (summary_type in ('document','section','decision','implementation','agent_context')),
  summary text not null,
  model_used text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_id, summary_type, model_used)
);

create index if not exists document_summaries_document_id_idx on public.document_summaries (document_id);
create index if not exists document_summaries_workspace_id_idx on public.document_summaries (workspace_id);
create index if not exists document_summaries_organization_id_idx on public.document_summaries (organization_id);
create index if not exists document_summaries_product_key_idx on public.document_summaries (product_key);
create index if not exists document_summaries_type_idx on public.document_summaries (summary_type);

-- updated_at trigger function (reusable across context memory tables).
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists documents_touch_updated_at on public.documents;
create trigger documents_touch_updated_at
  before update on public.documents
  for each row execute function public.touch_updated_at();

drop trigger if exists document_chunks_touch_updated_at on public.document_chunks;
create trigger document_chunks_touch_updated_at
  before update on public.document_chunks
  for each row execute function public.touch_updated_at();

drop trigger if exists document_summaries_touch_updated_at on public.document_summaries;
create trigger document_summaries_touch_updated_at
  before update on public.document_summaries
  for each row execute function public.touch_updated_at();

-- Helper view: documents that still need attention.
-- Summaries are optional (gate-controlled via CTX_GENERATE_SUMMARIES),
-- so the view does NOT flag missing summaries as pending.
create or replace view public.v_documents_pending as
select d.id,
       d.workspace_id,
       d.organization_id,
       d.product_key,
       d.source_type,
       d.source_uri,
       d.title,
       d.status,
       d.indexed_at,
       coalesce(c.chunk_count, 0) as chunk_count,
       coalesce(c.embeddings_present, false) as embeddings_present,
       coalesce(s.summary_count, 0) as summary_count,
       case
         when d.status = 'failed' then 'failed'
         when coalesce(c.chunk_count, 0) = 0 then 'no_chunks'
         when coalesce(c.embeddings_present, false) = false then 'no_embeddings'
         else 'ok'
       end as reason
from public.documents d
left join (
  select document_id,
         count(*) as chunk_count,
         bool_and(embedding is not null) as embeddings_present
  from public.document_chunks
  group by document_id
) c on c.document_id = d.id
left join (
  select document_id, count(*) as summary_count
  from public.document_summaries
  group by document_id
) s on s.document_id = d.id
where d.status <> 'indexed'
   or coalesce(c.chunk_count, 0) = 0
   or coalesce(c.embeddings_present, false) = false;