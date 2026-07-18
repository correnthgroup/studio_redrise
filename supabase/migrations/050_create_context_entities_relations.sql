-- 050_create_context_entities_relations.sql
-- Entities and relations tables for the Context Memory Layer.
-- Workspace-scoped to match the rest of RedRise.
-- Entity extraction is opt-in (CTX_GENERATE_SUMMARIES-style gate lives in app code).

create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.workspaces(id) on delete cascade,
  organization_id uuid not null,
  product_key text not null check (product_key in ('redrise','redscale','redrose','findfee','adgency','correnth')),
  entity_type text not null check (entity_type in (
    'product','screen_id','domain','role','component','table','workflow','agent','integration','concept'
  )),
  name text not null,
  canonical_name text not null,
  description text not null default '',
  aliases text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, product_key, canonical_name)
);

create index if not exists entities_workspace_id_idx on public.entities (workspace_id);
create index if not exists entities_organization_id_idx on public.entities (organization_id);
create index if not exists entities_product_key_idx on public.entities (product_key);
create index if not exists entities_entity_type_idx on public.entities (entity_type);
create index if not exists entities_canonical_name_idx on public.entities (canonical_name);
create index if not exists entities_aliases_gin_idx on public.entities using gin (aliases);

create table if not exists public.relations (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.workspaces(id) on delete cascade,
  organization_id uuid not null,
  product_key text not null,
  source_entity_id uuid not null references public.entities(id) on delete cascade,
  target_entity_id uuid not null references public.entities(id) on delete cascade,
  relation_type text not null check (relation_type in (
    'defines','uses','depends_on','implements','replaces','references','belongs_to','blocks','unblocks'
  )),
  evidence_chunk_id uuid references public.document_chunks(id) on delete set null,
  confidence real not null default 1.0 check (confidence >= 0 and confidence <= 1),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_entity_id, target_entity_id, relation_type, evidence_chunk_id)
);

create index if not exists relations_workspace_id_idx on public.relations (workspace_id);
create index if not exists relations_organization_id_idx on public.relations (organization_id);
create index if not exists relations_product_key_idx on public.relations (product_key);
create index if not exists relations_source_entity_idx on public.relations (source_entity_id);
create index if not exists relations_target_entity_idx on public.relations (target_entity_id);
create index if not exists relations_type_idx on public.relations (relation_type);
create index if not exists relations_evidence_chunk_idx on public.relations (evidence_chunk_id);

drop trigger if exists entities_touch_updated_at on public.entities;
create trigger entities_touch_updated_at
  before update on public.entities
  for each row execute function public.touch_updated_at();

drop trigger if exists relations_touch_updated_at on public.relations;
create trigger relations_touch_updated_at
  before update on public.relations
  for each row execute function public.touch_updated_at();