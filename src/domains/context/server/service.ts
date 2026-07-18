import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { hybridSearch } from "../search/hybrid-search";
import { createEmbeddingProvider } from "../embeddings/openrouter";
import { buildContextPackFromInput } from "../context-pack/builder";
import { mcpTools } from "../mcp/tools";
import type {
  ContextPackInput,
  ContextPackOutput,
  DocumentRow,
  DocumentChunkRow,
  EntityRow,
  HybridSearchInput,
  HybridSearchResult,
  ProductKey,
  RelationRow,
} from "../types";

export interface ContextMemoryServiceOptions {
  workspaceId: string;
  organizationId?: string;
}

export interface IndexedDocumentSummary {
  id: string;
  title: string;
  product_key: ProductKey;
  source_type: DocumentRow["source_type"];
  status: DocumentRow["status"];
  chunk_count: number;
  embeddings_present: boolean;
  summary_count: number;
  indexed_at: string | null;
}

function resolveOrganizationId(value: string | undefined | null): string {
  if (!value) {
    // Fallback UUID v5-ish deterministic value so the schema stays happy in
    // local dev. Production callers must pass the real organization_id.
    return "00000000-0000-0000-0000-000000000000";
  }
  return value;
}

async function loadSupabase() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase server client not configured");
  }
  return supabase;
}

export async function searchContext(
  input: HybridSearchInput,
  options: ContextMemoryServiceOptions,
): Promise<HybridSearchResult> {
  const supabase = await loadSupabase();
  return hybridSearch(input, {
    supabase,
    embeddingProvider: createEmbeddingProvider(),
    workspaceId: options.workspaceId,
    organizationId: resolveOrganizationId(options.organizationId),
  });
}

export async function buildContextPack(
  input: ContextPackInput,
  options: ContextMemoryServiceOptions,
): Promise<ContextPackOutput> {
  const supabase = await loadSupabase();
  const organizationId = resolveOrganizationId(options.organizationId);
  const result = await hybridSearch(
    {
      query: input.objective,
      product_key: input.product_key,
      filters: input.screen_id ? { screen_id: input.screen_id } : undefined,
      limit: 40,
    },
    {
      supabase,
      embeddingProvider: createEmbeddingProvider(),
      workspaceId: options.workspaceId,
      organizationId,
    },
  );
  const pack = buildContextPackFromInput(input, result.results);
  const { data: queryRow } = await supabase
    .from("context_queries")
    .insert({
      workspace_id: options.workspaceId,
      organization_id: organizationId,
      product_key: input.product_key,
      query: input.objective,
      filters: input.screen_id ? { screen_id: input.screen_id } : {},
      requested_by: "",
      consumer_type: "human",
      result_count: result.results.length,
    })
    .select("id")
    .single();
  const queryId = queryRow?.id ?? null;
  if (queryId) {
    await supabase.from("context_packs").insert({
      workspace_id: options.workspaceId,
      organization_id: organizationId,
      product_key: input.product_key,
      query_id: queryId,
      context_pack: pack.context_pack,
      selected_chunk_ids: pack.selected_chunk_ids,
      compression_strategy: pack.compression_strategy,
      token_estimate: pack.token_estimate,
    });
  }
  return { ...pack, query_id: queryId };
}

export async function listIndexedDocuments(
  options: ContextMemoryServiceOptions,
): Promise<IndexedDocumentSummary[]> {
  const supabase = await loadSupabase();
  const organizationId = resolveOrganizationId(options.organizationId);
  const { data, error } = await supabase
    .from("v_documents_pending")
    .select(
      "id, product_key, source_type, title, status, chunk_count, embeddings_present, summary_count, indexed_at",
    )
    .eq("workspace_id", options.workspaceId)
    .eq("organization_id", organizationId)
    .order("indexed_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    title: String(row.title ?? "Untitled"),
    product_key: String(row.product_key) as ProductKey,
    source_type: String(row.source_type) as DocumentRow["source_type"],
    status: String(row.status ?? "pending") as DocumentRow["status"],
    chunk_count: Number(row.chunk_count ?? 0),
    embeddings_present: Boolean(row.embeddings_present),
    summary_count: Number(row.summary_count ?? 0),
    indexed_at: (row.indexed_at as string | null) ?? null,
  }));
}

export async function listDocumentChunks(
  documentId: string,
  options: ContextMemoryServiceOptions,
): Promise<DocumentChunkRow[]> {
  const supabase = await loadSupabase();
  const organizationId = resolveOrganizationId(options.organizationId);
  const { data, error } = await supabase
    .from("document_chunks")
    .select(
      "id, document_id, workspace_id, organization_id, product_key, chunk_index, heading_path, content, content_tokens, content_hash, embedding, metadata, created_at, updated_at",
    )
    .eq("document_id", documentId)
    .eq("workspace_id", options.workspaceId)
    .eq("organization_id", organizationId)
    .order("chunk_index", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    document_id: String(row.document_id),
    workspace_id: String(row.workspace_id),
    organization_id: String(row.organization_id),
    product_key: String(row.product_key) as ProductKey,
    chunk_index: Number(row.chunk_index ?? 0),
    heading_path: String(row.heading_path ?? ""),
    content: String(row.content ?? ""),
    content_tokens: Number(row.content_tokens ?? 0),
    content_hash: String(row.content_hash ?? ""),
    embedding: Array.isArray(row.embedding)
      ? (row.embedding as number[]).map((n) => Number(n))
      : null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  }));
}

export async function listEntities(
  options: ContextMemoryServiceOptions,
): Promise<EntityRow[]> {
  const supabase = await loadSupabase();
  const organizationId = resolveOrganizationId(options.organizationId);
  const { data, error } = await supabase
    .from("entities")
    .select(
      "id, workspace_id, organization_id, product_key, entity_type, name, canonical_name, description, aliases, metadata, created_at, updated_at",
    )
    .eq("workspace_id", options.workspaceId)
    .eq("organization_id", organizationId)
    .order("canonical_name", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as EntityRow[];
}

export async function listRelations(
  options: ContextMemoryServiceOptions,
): Promise<RelationRow[]> {
  const supabase = await loadSupabase();
  const organizationId = resolveOrganizationId(options.organizationId);
  const { data, error } = await supabase
    .from("relations")
    .select("*")
    .eq("workspace_id", options.workspaceId)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RelationRow[];
}

export async function runMcpTool(
  toolName: string,
  args: unknown,
  options: ContextMemoryServiceOptions,
): Promise<unknown> {
  const tool = mcpTools.find((t) => t.name === toolName);
  if (!tool) throw new Error(`Unknown MCP tool: ${toolName}`);
  const supabase = await loadSupabase();
  return tool.handler(args, {
    supabase,
    workspaceId: options.workspaceId,
    organizationId: resolveOrganizationId(options.organizationId),
    consumerType: "mcp",
  });
}