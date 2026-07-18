import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EmbeddingProvider,
  EmbeddingProviderError,
} from "../embeddings/provider";
import type {
  HybridSearchFilters,
  HybridSearchInput,
  HybridSearchResult,
  HybridSearchResultItem,
  ProductKey,
} from "../types";
import {
  METADATA_WEIGHT,
  TEXT_WEIGHT,
  VECTOR_WEIGHT,
} from "./weights";

export interface HybridSearchClientOptions {
  supabase: SupabaseClient;
  embeddingProvider: EmbeddingProvider;
  workspaceId: string;
  organizationId: string;
}

interface HybridRpcRow {
  chunk_id: string;
  document_id: string;
  title: string;
  heading_path: string;
  content: string;
  metadata: Record<string, unknown>;
  vector_score: number;
  text_score: number;
  metadata_boost: number;
  combined_score: number;
}

interface VectorRow {
  chunk_id: string;
  document_id: string;
  title: string;
  heading_path: string;
  content: string;
  metadata: Record<string, unknown>;
  vector_score: number;
}

interface TextRow {
  chunk_id: string;
  document_id: string;
  title: string;
  heading_path: string;
  content: string;
  metadata: Record<string, unknown>;
  text_score: number;
}

export async function hybridSearch(
  input: HybridSearchInput,
  options: HybridSearchClientOptions,
): Promise<HybridSearchResult> {
  const { query, product_key, filters, limit } = input;
  const safeLimit = clampLimit(limit ?? 20);
  const embedding = await embedQuery(query, options.embeddingProvider);
  const rpcRows = await tryRpc(
    options,
    query,
    product_key,
    embedding,
    filters,
    safeLimit,
  );
  const rows =
    rpcRows ??
    (await fallbackMerge(
      options,
      query,
      product_key,
      embedding,
      filters,
      safeLimit,
    ));

  const filtered = filters?.entity_types?.length
    ? rows.filter((row) => {
        const t = (row.metadata as { entity_type?: string }).entity_type;
        return t ? filters.entity_types!.includes(t as never) : false;
      })
    : rows;

  return {
    query,
    results: filtered.slice(0, safeLimit),
  };
}

export function clampLimit(value: number): number {
  if (!Number.isFinite(value)) return 20;
  return Math.max(1, Math.min(100, Math.floor(value)));
}

async function embedQuery(
  query: string,
  provider: EmbeddingProvider,
): Promise<number[]> {
  try {
    const [vector] = await provider.embed([query]);
    if (!vector) {
      throw new EmbeddingProviderError("Empty embedding returned");
    }
    return vector;
  } catch (error) {
    throw new EmbeddingProviderError(
      "Failed to embed query for hybrid search",
      error,
    );
  }
}

async function tryRpc(
  options: HybridSearchClientOptions,
  query: string,
  productKey: ProductKey,
  embedding: number[],
  filters: HybridSearchFilters | undefined,
  limit: number,
): Promise<HybridSearchResultItem[] | null> {
  const { data, error } = await options.supabase.rpc("context_hybrid_search", {
    p_workspace_id: options.workspaceId,
    p_organization_id: options.organizationId,
    p_product_key: productKey,
    p_query: query,
    p_query_embedding: embedding,
    p_vector_limit: Math.max(limit * 2, 40),
    p_text_limit: Math.max(limit * 2, 40),
    p_final_limit: limit,
    p_source_types: filters?.source_type ?? null,
    p_screen_id: filters?.screen_id ?? null,
    p_vector_weight: VECTOR_WEIGHT,
    p_text_weight: TEXT_WEIGHT,
    p_metadata_weight: METADATA_WEIGHT,
  });
  if (error || !data) return null;
  return (data as HybridRpcRow[]).map((row) => ({
    chunk_id: String(row.chunk_id),
    document_id: String(row.document_id),
    title: String(row.title ?? "Untitled"),
    heading_path: String(row.heading_path ?? ""),
    content: String(row.content ?? ""),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    vector_score: Number(row.vector_score ?? 0),
    text_score: Number(row.text_score ?? 0),
    metadata_boost: Number(row.metadata_boost ?? 0),
    combined_score: Number(row.combined_score ?? 0),
  }));
}

async function fallbackMerge(
  options: HybridSearchClientOptions,
  query: string,
  productKey: ProductKey,
  embedding: number[],
  filters: HybridSearchFilters | undefined,
  limit: number,
): Promise<HybridSearchResultItem[]> {
  const safeLimit = Math.max(limit * 2, 40);
  const [vectorRows, textRows] = await Promise.all([
    fetchVectorFallback(
      options.supabase,
      embedding,
      productKey,
      options.workspaceId,
      options.organizationId,
      filters,
      safeLimit,
    ),
    fetchTextFallback(
      options.supabase,
      query,
      productKey,
      options.workspaceId,
      options.organizationId,
      filters,
      safeLimit,
    ),
  ]);
  return mergeResults(vectorRows, textRows, query, productKey);
}

async function fetchVectorFallback(
  supabase: SupabaseClient,
  embedding: number[],
  productKey: ProductKey,
  workspaceId: string,
  organizationId: string,
  filters: HybridSearchFilters | undefined,
  limit: number,
): Promise<VectorRow[]> {
  const { data, error } = await supabase.rpc("context_vector_search", {
    p_workspace_id: workspaceId,
    p_organization_id: organizationId,
    p_product_key: productKey,
    p_query_embedding: embedding,
    p_source_types: filters?.source_type ?? null,
    p_screen_id: filters?.screen_id ?? null,
    p_limit: limit,
  });
  if (error || !data) return [];
  return (data as VectorRow[]).map((row) => ({
    chunk_id: String(row.chunk_id),
    document_id: String(row.document_id),
    title: String(row.title ?? "Untitled"),
    heading_path: String(row.heading_path ?? ""),
    content: String(row.content ?? ""),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    vector_score: Number(row.vector_score ?? 0),
  }));
}

async function fetchTextFallback(
  supabase: SupabaseClient,
  query: string,
  productKey: ProductKey,
  workspaceId: string,
  organizationId: string,
  filters: HybridSearchFilters | undefined,
  limit: number,
): Promise<TextRow[]> {
  const { data, error } = await supabase.rpc("context_text_search", {
    p_workspace_id: workspaceId,
    p_organization_id: organizationId,
    p_product_key: productKey,
    p_query: query,
    p_source_types: filters?.source_type ?? null,
    p_screen_id: filters?.screen_id ?? null,
    p_limit: limit,
  });
  if (error || !data) return [];
  return (data as TextRow[]).map((row) => ({
    chunk_id: String(row.chunk_id),
    document_id: String(row.document_id),
    title: String(row.title ?? "Untitled"),
    heading_path: String(row.heading_path ?? ""),
    content: String(row.content ?? ""),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    text_score: Number(row.text_score ?? 0),
  }));
}

export function mergeResults(
  vectorRows: VectorRow[],
  textRows: TextRow[],
  query: string,
  productKey: ProductKey,
): HybridSearchResultItem[] {
  const byChunk = new Map<string, HybridSearchResultItem>();

  for (const row of vectorRows) {
    const metadataBoost = computeMetadataBoost(row, query, productKey);
    const combined =
      VECTOR_WEIGHT * row.vector_score +
      TEXT_WEIGHT * 0 +
      METADATA_WEIGHT * metadataBoost;
    byChunk.set(row.chunk_id, {
      document_id: row.document_id,
      chunk_id: row.chunk_id,
      title: row.title,
      heading_path: row.heading_path,
      content: row.content,
      vector_score: row.vector_score,
      text_score: 0,
      metadata_boost: metadataBoost,
      combined_score: combined,
      metadata: row.metadata,
    });
  }

  for (const row of textRows) {
    const existing = byChunk.get(row.chunk_id);
    const metadataBoost = computeMetadataBoost(row, query, productKey);
    const vectorScore = existing?.vector_score ?? 0;
    const combined =
      VECTOR_WEIGHT * vectorScore +
      TEXT_WEIGHT * row.text_score +
      METADATA_WEIGHT * metadataBoost;
    byChunk.set(row.chunk_id, {
      document_id: row.document_id,
      chunk_id: row.chunk_id,
      title: row.title,
      heading_path: row.heading_path,
      content: row.content,
      vector_score: vectorScore,
      text_score: row.text_score,
      metadata_boost: metadataBoost,
      combined_score: combined,
      metadata: row.metadata,
    });
  }

  return Array.from(byChunk.values()).sort(
    (a, b) => b.combined_score - a.combined_score,
  );
}

export function computeMetadataBoost(
  row: {
    title: string;
    heading_path: string;
    metadata: Record<string, unknown>;
  },
  query: string,
  productKey: ProductKey,
): number {
  const q = query.toLowerCase();
  let boost = 0;
  if (row.title.toLowerCase().includes(q)) boost += 0.5;
  if (row.heading_path.toLowerCase().includes(q)) boost += 0.4;
  if (
    row.metadata &&
    (row.metadata as { product_key?: string }).product_key === productKey
  ) {
    boost += 0.2;
  }
  const screenId = (row.metadata as { screen_id?: string } | null)
    ?.screen_id;
  if (screenId && q.includes(screenId.toLowerCase())) boost += 0.3;
  return Math.min(boost, 1);
}