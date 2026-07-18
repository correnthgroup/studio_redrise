#!/usr/bin/env node
/**
 * MCP wrapper for the Context Memory Layer.
 *
 * Speaks JSON-RPC 2.0 over stdio (one request per line). Designed to be
 * consumed by Codex/Hermes/OpenCode CLI adapters.
 *
 * Tools:
 *   search_context
 *   get_context_pack
 *   get_document
 *   list_project_decisions
 *   register_decision
 *
 * Env:
 *   SUPABASE_URL          — Supabase URL.
 *   SUPABASE_SERVICE_ROLE — Service role key. REQUIRED (server-side tool).
 *   WORKSPACE_ID          — Workspace scope.
 *   ORGANIZATION_ID       — Optional organization UUID.
 *   OPENAI_API_KEY        — For query embeddings.
 *   OPENAI_BASE_URL       — Defaults to OpenRouter.
 *   OPENAI_EMBEDDING_MODEL
 */

import { createClient } from "@supabase/supabase-js";

const TOOLS = [
  toolSearchContext(),
  toolGetContextPack(),
  toolGetDocument(),
  toolListProjectDecisions(),
  toolRegisterDecision(),
];

if (process.argv.includes("--self-test")) {
  selfTest();
  process.exit(0);
}

const url = requireEnv("SUPABASE_URL");
const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE");
const workspaceId = requireEnv("WORKSPACE_ID");
const organizationId = process.env.ORGANIZATION_ID ?? "00000000-0000-0000-0000-000000000000";

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let newlineIndex = buffer.indexOf("\n");
  while (newlineIndex >= 0) {
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    if (line.length > 0) handleLine(line).catch((err) => sendError(null, err));
    newlineIndex = buffer.indexOf("\n");
  }
});

process.stdin.on("end", () => {
  if (buffer.trim().length > 0) {
    handleLine(buffer.trim()).catch((err) => sendError(null, err));
  }
});

async function handleLine(line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    sendError(null, { code: -32700, message: "Parse error" });
    return;
  }
  const { id, method, params } = message;
  if (method === "initialize") {
    respond(id, {
      protocolVersion: "2024-11-05",
      serverInfo: { name: "correnth-context", version: "1.0.0" },
      capabilities: { tools: {} },
    });
    return;
  }
  if (method === "tools/list") {
    respond(id, {
      tools: TOOLS.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      })),
    });
    return;
  }
  if (method === "tools/call") {
    const toolName = params?.name;
    const args = params?.arguments ?? {};
    const tool = TOOLS.find((t) => t.name === toolName);
    if (!tool) {
      sendError(id, { code: -32602, message: `Unknown tool: ${toolName}` });
      return;
    }
    try {
      const result = await tool.handler(args);
      respond(id, { content: [{ type: "json", json: result }] });
    } catch (error) {
      sendError(id, { code: -32603, message: error?.message ?? String(error) });
    }
    return;
  }
  sendError(id, { code: -32601, message: `Unknown method: ${method}` });
}

function respond(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

function sendError(id, error) {
  process.stdout.write(
    JSON.stringify({
      jsonrpc: "2.0",
      id,
      error: { code: error?.code ?? -32000, message: error?.message ?? "Unknown error" },
    }) + "\n",
  );
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    process.stderr.write(`Missing env: ${name}\n`);
    process.exit(2);
  }
  return value;
}

function toolSearchContext() {
  return {
    name: "search_context",
    description: "Hybrid retrieval over the Context Memory Layer.",
    inputSchema: {
      type: "object",
      required: ["query", "product_key"],
      properties: {
        query: { type: "string" },
        product_key: { type: "string" },
        filters: { type: "object" },
        limit: { type: "integer" },
      },
    },
    handler: async (args) => {
      const embedding = await embedQuery(args.query);
      const { data, error } = await supabase.rpc("context_hybrid_search", {
        p_workspace_id: workspaceId,
        p_organization_id: organizationId,
        p_product_key: args.product_key,
        p_query: args.query,
        p_query_embedding: embedding,
        p_vector_limit: 40,
        p_text_limit: 40,
        p_final_limit: args.limit ?? 20,
        p_source_types: args.filters?.source_type ?? null,
        p_screen_id: args.filters?.screen_id ?? null,
      });
      if (error) throw new Error(error.message);
      return { query: args.query, results: data ?? [] };
    },
  };
}

function toolGetContextPack() {
  return {
    name: "get_context_pack",
    description: "Build a Context Pack for an objective.",
    inputSchema: {
      type: "object",
      required: ["objective", "product_key"],
      properties: {
        objective: { type: "string" },
        product_key: { type: "string" },
        screen_id: { type: "string" },
        domain_key: { type: "string" },
        token_budget: { type: "integer" },
      },
    },
    handler: async (args) => {
      const embedding = await embedQuery(args.objective);
      const { data, error } = await supabase.rpc("context_hybrid_search", {
        p_workspace_id: workspaceId,
        p_organization_id: organizationId,
        p_product_key: args.product_key,
        p_query: args.objective,
        p_query_embedding: embedding,
        p_vector_limit: 80,
        p_text_limit: 80,
        p_final_limit: 40,
        p_source_types: null,
        p_screen_id: args.screen_id ?? null,
      });
      if (error) throw new Error(error.message);
      const selected = (data ?? []).slice(0, 20);
      const pack = buildPack(args, selected);
      const { data: qRow } = await supabase
        .from("context_queries")
        .insert({
          workspace_id: workspaceId,
          organization_id: organizationId,
          product_key: args.product_key,
          query: args.objective,
          filters: args.screen_id ? { screen_id: args.screen_id } : {},
          requested_by: "mcp",
          consumer_type: "mcp",
          result_count: selected.length,
        })
        .select("id")
        .single();
      const queryId = qRow?.id ?? null;
      if (queryId) {
        await supabase.from("context_packs").insert({
          workspace_id: workspaceId,
          organization_id: organizationId,
          product_key: args.product_key,
          query_id: queryId,
          context_pack: pack.context_pack,
          selected_chunk_ids: pack.selected_chunk_ids,
          compression_strategy: pack.compression_strategy,
          token_estimate: pack.token_estimate,
        });
      }
      return { ...pack, query_id: queryId };
    },
  };
}

function toolGetDocument() {
  return {
    name: "get_document",
    description: "Fetch a single document and its chunks.",
    inputSchema: {
      type: "object",
      required: ["document_id"],
      properties: { document_id: { type: "string" } },
    },
    handler: async (args) => {
      const { data: doc, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", args.document_id)
        .eq("workspace_id", workspaceId)
        .single();
      if (error || !doc) throw new Error("Document not found");
      const { data: chunks } = await supabase
        .from("document_chunks")
        .select("id, chunk_index, heading_path, content, content_tokens")
        .eq("document_id", args.document_id)
        .order("chunk_index", { ascending: true });
      return { document: doc, chunks: chunks ?? [] };
    },
  };
}

function toolListProjectDecisions() {
  return {
    name: "list_project_decisions",
    description: "List registered project decisions for a product.",
    inputSchema: {
      type: "object",
      required: ["product_key"],
      properties: {
        product_key: { type: "string" },
        topic: { type: "string" },
      },
    },
    handler: async (args) => {
      let q = supabase
        .from("document_summaries")
        .select("id, document_id, summary, created_at")
        .eq("workspace_id", workspaceId)
        .eq("product_key", args.product_key)
        .eq("summary_type", "decision")
        .order("created_at", { ascending: false })
        .limit(50);
      if (args.topic) q = q.ilike("summary", `%${args.topic}%`);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  };
}

function toolRegisterDecision() {
  return {
    name: "register_decision",
    description: "Register a project decision.",
    inputSchema: {
      type: "object",
      required: ["product_key", "title", "decision", "rationale", "source"],
      properties: {
        product_key: { type: "string" },
        title: { type: "string" },
        decision: { type: "string" },
        rationale: { type: "string" },
        source: { type: "string" },
      },
    },
    handler: async (args) => {
      const slug = args.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const sourceUri = `decision://${workspaceId}/${slug}`;
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .upsert(
          {
            workspace_id: workspaceId,
            organization_id: organizationId,
            product_key: args.product_key,
            source_type: "conversation_decision",
            source_uri: sourceUri,
            title: args.title,
            slug,
            content_hash: simpleHash(JSON.stringify(args)),
            status: "indexed",
            indexed_at: new Date().toISOString(),
            metadata: { source: args.source },
          },
          { onConflict: "workspace_id,product_key,source_uri" },
        )
        .select("id")
        .single();
      if (docError) throw new Error(docError.message);
      const summary =
        `# ${args.title}\n\n**Decision:** ${args.decision}\n\n**Rationale:** ${args.rationale}\n\n**Source:** ${args.source}`;
      const { data: row, error } = await supabase
        .from("document_summaries")
        .upsert(
          {
            document_id: doc.id,
            workspace_id: workspaceId,
            organization_id: organizationId,
            product_key: args.product_key,
            summary_type: "decision",
            summary,
            model_used: "mcp:register_decision",
          },
          { onConflict: "document_id,summary_type,model_used" },
        )
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: row.id, document_id: doc.id };
    },
  };
}

async function embedQuery(query) {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.OPENROUTER_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://openrouter.ai/api/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY / OPENROUTER_API_KEY");
  const response = await fetch(`${baseUrl}/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, input: [query], encoding_format: "float" }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Embedding failed (${response.status}): ${body.slice(0, 200)}`);
  }
  const payload = await response.json();
  return payload.data?.[0]?.embedding ?? [];
}

function buildPack(args, results) {
  const budget = args.token_budget ?? 8000;
  const selected = [];
  let tokens = 0;
  for (const r of results) {
    const t = Math.ceil((r.content?.length ?? 0) / 4);
    if (tokens + t > budget && selected.length > 0) break;
    selected.push(r);
    tokens += t;
  }
  const body = [
    "# Context Pack",
    `**Product:** ${args.product_key}`,
    args.screen_id ? `**Screen ID:** ${args.screen_id}` : "",
    args.domain_key ? `**Domain:** ${args.domain_key}` : "",
    "",
    "## Task Summary",
    args.objective,
    "",
    "## Source References",
    ...selected.map((r) => `- chunk:${r.chunk_id} — ${r.title} — ${r.heading_path}`),
  ]
    .filter(Boolean)
    .join("\n");
  return {
    context_pack: body,
    selected_chunk_ids: selected.map((r) => r.chunk_id),
    token_estimate: Math.ceil(body.length / 4),
    compression_strategy: "default",
  };
}

function simpleHash(input) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function selfTest() {
  const summary = TOOLS.map((t) => t.name);
  process.stdout.write(JSON.stringify({ ok: true, tools: summary }) + "\n");
}