import type { SupabaseClient } from "@supabase/supabase-js";
import { hybridSearch } from "../search/hybrid-search";
import { createEmbeddingProvider } from "../embeddings/openrouter";
import { buildContextPackFromInput } from "../context-pack/builder";
import type {
  CompressionStrategy,
  ContextPackInput,
  ContextPackOutput,
  ConsumerType,
  HybridSearchInput,
  HybridSearchResult,
  ProductKey,
  SourceType,
} from "../types";
import { PRODUCT_KEYS } from "../types";

export interface McpToolContext {
  supabase: SupabaseClient;
  workspaceId: string;
  organizationId: string;
  requestedBy?: string;
  consumerType?: ConsumerType;
}

export interface SearchContextArgs {
  query: string;
  product_key: ProductKey;
  filters?: {
    source_type?: SourceType[];
    screen_id?: string | null;
  };
  limit?: number;
}

export interface GetContextPackArgs extends ContextPackInput {}

export interface GetDocumentArgs {
  document_id: string;
}

export interface ListProjectDecisionsArgs {
  product_key: ProductKey;
  topic?: string | null;
}

export interface RegisterDecisionArgs {
  product_key: ProductKey;
  title: string;
  decision: string;
  rationale: string;
  source: string;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: unknown, ctx: McpToolContext) => Promise<unknown>;
}

function isProductKey(value: unknown): value is ProductKey {
  return typeof value === "string" && PRODUCT_KEYS.includes(value as ProductKey);
}

export const mcpTools: McpToolDefinition[] = [
  {
    name: "search_context",
    description:
      "Hybrid retrieval (vector + full-text + metadata boost) over the Context Memory Layer.",
    inputSchema: {
      type: "object",
      required: ["query", "product_key"],
      properties: {
        query: { type: "string" },
        product_key: { type: "string", enum: [...PRODUCT_KEYS] },
        filters: {
          type: "object",
          properties: {
            source_type: { type: "array", items: { type: "string" } },
            screen_id: { type: ["string", "null"] },
          },
        },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      },
    },
    handler: async (args, ctx) => {
      const parsed = args as SearchContextArgs;
      if (!parsed.query || !isProductKey(parsed.product_key)) {
        throw new Error("search_context requires query and a valid product_key");
      }
      const input: HybridSearchInput = {
        query: parsed.query,
        product_key: parsed.product_key,
        filters: parsed.filters,
        limit: parsed.limit ?? 20,
      };
      const result: HybridSearchResult = await hybridSearch(input, {
        supabase: ctx.supabase,
        embeddingProvider: createEmbeddingProvider(),
        workspaceId: ctx.workspaceId,
        organizationId: ctx.organizationId,
      });
      await logQuery(ctx, parsed.query, parsed.product_key, parsed.filters, result.results.length);
      return result;
    },
  },
  {
    name: "get_context_pack",
    description:
      "Compress a hybrid search into a Context Pack for a specific objective, screen or domain.",
    inputSchema: {
      type: "object",
      required: ["objective", "product_key"],
      properties: {
        objective: { type: "string" },
        product_key: { type: "string", enum: [...PRODUCT_KEYS] },
        screen_id: { type: ["string", "null"] },
        domain_key: { type: ["string", "null"] },
        token_budget: { type: "integer", minimum: 256, maximum: 32000 },
      },
    },
    handler: async (args, ctx) => {
      const parsed = args as GetContextPackArgs;
      if (!parsed.objective || !isProductKey(parsed.product_key)) {
        throw new Error("get_context_pack requires objective and product_key");
      }
      const result = await hybridSearch(
        {
          query: parsed.objective,
          product_key: parsed.product_key,
          filters: parsed.screen_id ? { screen_id: parsed.screen_id } : undefined,
          limit: 40,
        },
        {
          supabase: ctx.supabase,
          embeddingProvider: createEmbeddingProvider(),
          workspaceId: ctx.workspaceId,
          organizationId: ctx.organizationId,
        },
      );
      const pack: ContextPackOutput = buildContextPackFromInput(
        parsed,
        result.results,
      );
      const { data: queryRow } = await ctx.supabase
        .from("context_queries")
        .insert({
          workspace_id: ctx.workspaceId,
          organization_id: ctx.organizationId,
          product_key: parsed.product_key,
          query: parsed.objective,
          filters: parsed.screen_id ? { screen_id: parsed.screen_id } : {},
          requested_by: ctx.requestedBy ?? "",
          consumer_type: ctx.consumerType ?? "mcp",
          result_count: result.results.length,
        })
        .select("id")
        .single();
      const queryId = queryRow?.id ?? null;
      if (queryId) {
        await ctx.supabase.from("context_packs").insert({
          workspace_id: ctx.workspaceId,
          organization_id: ctx.organizationId,
          product_key: parsed.product_key,
          query_id: queryId,
          context_pack: pack.context_pack,
          selected_chunk_ids: pack.selected_chunk_ids,
          compression_strategy: pack.compression_strategy,
          token_estimate: pack.token_estimate,
        });
      }
      return { ...pack, query_id: queryId };
    },
  },
  {
    name: "get_document",
    description: "Fetch a single indexed document and its chunks.",
    inputSchema: {
      type: "object",
      required: ["document_id"],
      properties: { document_id: { type: "string" } },
    },
    handler: async (args, ctx) => {
      const parsed = args as GetDocumentArgs;
      if (!parsed.document_id) throw new Error("document_id is required");
      const { data: doc, error } = await ctx.supabase
        .from("documents")
        .select("*")
        .eq("id", parsed.document_id)
        .eq("workspace_id", ctx.workspaceId)
        .single();
      if (error || !doc) throw new Error(`Document not found: ${parsed.document_id}`);
      const { data: chunks } = await ctx.supabase
        .from("document_chunks")
        .select(
          "id, chunk_index, heading_path, content, content_tokens, metadata",
        )
        .eq("document_id", parsed.document_id)
        .order("chunk_index", { ascending: true });
      return { document: doc, chunks: chunks ?? [] };
    },
  },
  {
    name: "list_project_decisions",
    description:
      "List project decisions (summaries + registered decisions) for a product.",
    inputSchema: {
      type: "object",
      required: ["product_key"],
      properties: {
        product_key: { type: "string", enum: [...PRODUCT_KEYS] },
        topic: { type: ["string", "null"] },
      },
    },
    handler: async (args, ctx) => {
      const parsed = args as ListProjectDecisionsArgs;
      if (!isProductKey(parsed.product_key)) {
        throw new Error("list_project_decisions requires product_key");
      }
      let query = ctx.supabase
        .from("document_summaries")
        .select("id, document_id, summary_type, summary, created_at")
        .eq("product_key", parsed.product_key)
        .eq("workspace_id", ctx.workspaceId)
        .eq("summary_type", "decision")
        .order("created_at", { ascending: false })
        .limit(50);
      if (parsed.topic) {
        query = query.ilike("summary", `%${parsed.topic}%`);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  },
  {
    name: "register_decision",
    description:
      "Register a project decision. Writes a `decision` summary row attached to a synthetic source document.",
    inputSchema: {
      type: "object",
      required: ["product_key", "title", "decision", "rationale", "source"],
      properties: {
        product_key: { type: "string", enum: [...PRODUCT_KEYS] },
        title: { type: "string" },
        decision: { type: "string" },
        rationale: { type: "string" },
        source: { type: "string" },
      },
    },
    handler: async (args, ctx) => {
      const parsed = args as RegisterDecisionArgs;
      if (!isProductKey(parsed.product_key)) {
        throw new Error("register_decision requires product_key");
      }
      const sourceUri = `decision://${ctx.workspaceId}/${slug(parsed.title)}`;
      const { data: doc, error: docError } = await ctx.supabase
        .from("documents")
        .upsert(
          {
            workspace_id: ctx.workspaceId,
            organization_id: ctx.organizationId,
            product_key: parsed.product_key,
            source_type: "conversation_decision",
            source_uri: sourceUri,
            title: parsed.title,
            slug: slug(parsed.title),
            content_hash: hashDecision(parsed),
            status: "indexed",
            indexed_at: new Date().toISOString(),
            metadata: { source: parsed.source },
          },
          { onConflict: "workspace_id,product_key,source_uri" },
        )
        .select("id")
        .single();
      if (docError || !doc) {
        throw new Error(docError?.message ?? "Failed to upsert decision document");
      }
      const summary =
        `# ${parsed.title}\n\n` +
        `**Decision:** ${parsed.decision}\n\n` +
        `**Rationale:** ${parsed.rationale}\n\n` +
        `**Source:** ${parsed.source}`;
      const { data: row, error } = await ctx.supabase
        .from("document_summaries")
        .upsert(
          {
            document_id: doc.id,
            workspace_id: ctx.workspaceId,
            organization_id: ctx.organizationId,
            product_key: parsed.product_key,
            summary_type: "decision",
            summary,
            model_used: "mcp:register_decision",
          },
          { onConflict: "document_id,summary_type,model_used" },
        )
        .select("id")
        .single();
      if (error || !row) throw new Error(error?.message ?? "Failed to store decision");
      return { id: row.id, document_id: doc.id };
    },
  },
];

async function logQuery(
  ctx: McpToolContext,
  query: string,
  productKey: ProductKey,
  filters: Record<string, unknown> | undefined,
  resultCount: number,
): Promise<void> {
  await ctx.supabase.from("context_queries").insert({
    workspace_id: ctx.workspaceId,
    organization_id: ctx.organizationId,
    product_key: productKey,
    query,
    filters: filters ?? {},
    requested_by: ctx.requestedBy ?? "",
    consumer_type: ctx.consumerType ?? "mcp",
    result_count: resultCount,
  });
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function hashDecision(input: RegisterDecisionArgs): string {
  // Stable hash for idempotency. Uses Web Crypto when available, otherwise a
  // simple FNV-1a style hash so the same decision overwrites itself.
  const payload = JSON.stringify({
    p: input.product_key,
    t: input.title,
    d: input.decision,
    r: input.rationale,
    s: input.source,
  });
  return fallbackHash(payload);
}

function fallbackHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export type CompressionStrategyArg = CompressionStrategy;