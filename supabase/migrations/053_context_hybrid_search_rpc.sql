-- 053_context_hybrid_search_rpc.sql
-- RPC functions used by the hybrid search client.
-- Implemented in PL/pgSQL because LANGUAGE SQL with RETURNS TABLE
-- fails to infer the jsonb type when the source tables are empty.
-- Column ordering in RETURN QUERY SELECTs is positional and must match
-- RETURNS TABLE exactly.

create or replace function public.context_vector_search(
  p_workspace_id text,
  p_organization_id uuid,
  p_product_key text,
  p_query_embedding public.vector(1536),
  p_source_types text[] default null,
  p_screen_id text default null,
  p_limit int default 20
)
returns table (
  chunk_id uuid,
  document_id uuid,
  title text,
  heading_path text,
  content text,
  metadata jsonb,
  vector_score real
)
language plpgsql
stable
as $$
begin
  return query
  select
    c.id,
    c.document_id,
    d.title,
    c.heading_path,
    c.content,
    c.metadata,
    (1 - (c.embedding <=> p_query_embedding))::real
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  where c.workspace_id = p_workspace_id
    and c.organization_id = p_organization_id
    and c.product_key = p_product_key
    and c.embedding is not null
    and (
      p_source_types is null
      or d.source_type = any(p_source_types)
    )
    and (
      p_screen_id is null
      or coalesce(c.metadata->>'screen_id', '') = p_screen_id
    )
  order by c.embedding <=> p_query_embedding
  limit greatest(coalesce(p_limit, 20), 1);
end;
$$;

create or replace function public.context_text_search(
  p_workspace_id text,
  p_organization_id uuid,
  p_product_key text,
  p_query text,
  p_source_types text[] default null,
  p_screen_id text default null,
  p_limit int default 20
)
returns table (
  chunk_id uuid,
  document_id uuid,
  title text,
  heading_path text,
  content text,
  metadata jsonb,
  text_score real
)
language plpgsql
stable
as $$
declare
  tsq tsquery;
begin
  tsq := websearch_to_tsquery('english', p_query);
  return query
  select
    c.id,
    c.document_id,
    d.title,
    c.heading_path,
    c.content,
    c.metadata,
    ts_rank_cd(c.search_vector_en, tsq)::real
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  where c.workspace_id = p_workspace_id
    and c.organization_id = p_organization_id
    and c.product_key = p_product_key
    and c.search_vector_en @@ tsq
    and (
      p_source_types is null
      or d.source_type = any(p_source_types)
    )
    and (
      p_screen_id is null
      or coalesce(c.metadata->>'screen_id', '') = p_screen_id
    )
  order by ts_rank_cd(c.search_vector_en, tsq) desc
  limit greatest(coalesce(p_limit, 20), 1);
end;
$$;

create or replace function public.context_hybrid_search(
  p_workspace_id text,
  p_organization_id uuid,
  p_product_key text,
  p_query text,
  p_query_embedding public.vector(1536),
  p_vector_limit int default 40,
  p_text_limit int default 40,
  p_final_limit int default 20,
  p_source_types text[] default null,
  p_screen_id text default null,
  p_vector_weight real default 0.55,
  p_text_weight real default 0.30,
  p_metadata_weight real default 0.15
)
returns table (
  chunk_id uuid,
  document_id uuid,
  title text,
  heading_path text,
  content text,
  metadata jsonb,
  vector_score real,
  text_score real,
  metadata_boost real,
  combined_score real
)
language plpgsql
stable
as $$
begin
  return query
  with vec as (
    select * from public.context_vector_search(
      p_workspace_id, p_organization_id, p_product_key,
      p_query_embedding, p_source_types, p_screen_id, p_vector_limit
    )
  ),
  txt as (
    select * from public.context_text_search(
      p_workspace_id, p_organization_id, p_product_key,
      p_query, p_source_types, p_screen_id, p_text_limit
    )
  ),
  merged as (
    select
      coalesce(v.chunk_id, t.chunk_id) as chunk_id,
      coalesce(v.document_id, t.document_id) as document_id,
      coalesce(v.title, t.title) as title,
      coalesce(v.heading_path, t.heading_path) as heading_path,
      coalesce(v.content, t.content) as content,
      coalesce(v.metadata, t.metadata) as metadata,
      coalesce(v.vector_score, 0)::real as vector_score,
      coalesce(t.text_score, 0)::real as text_score
    from vec v
    full outer join txt t on t.chunk_id = v.chunk_id
  ),
  scored as (
    select
      m.*,
      (
        case when m.title ilike '%' || p_query || '%' then 0.5 else 0 end
      + case when m.heading_path ilike '%' || p_query || '%' then 0.4 else 0 end
      + case when coalesce(m.metadata->>'product_key', '') = p_product_key then 0.2 else 0 end
      + case when p_screen_id is not null
              and coalesce(m.metadata->>'screen_id', '') = p_screen_id
             then 0.3 else 0 end
      )::real as metadata_boost,
      (
        p_vector_weight * m.vector_score
      + p_text_weight * m.text_score
      + p_metadata_weight * (
          case when m.title ilike '%' || p_query || '%' then 0.5 else 0 end
        + case when m.heading_path ilike '%' || p_query || '%' then 0.4 else 0 end
        + case when coalesce(m.metadata->>'product_key', '') = p_product_key then 0.2 else 0 end
        + case when p_screen_id is not null
                and coalesce(m.metadata->>'screen_id', '') = p_screen_id
               then 0.3 else 0 end
        )
      )::real as combined_score
    from merged m
  )
  select
    s.chunk_id, s.document_id, s.title, s.heading_path, s.content, s.metadata,
    s.vector_score, s.text_score, s.metadata_boost, s.combined_score
  from scored s
  order by s.combined_score desc
  limit greatest(coalesce(p_final_limit, 20), 1);
end;
$$;