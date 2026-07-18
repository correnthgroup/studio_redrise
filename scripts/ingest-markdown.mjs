#!/usr/bin/env node
/**
 * Ingest markdown files into the Context Memory Layer.
 *
 * Usage:
 *   node scripts/ingest-markdown.mjs <file|dir> [...more]
 *   node scripts/ingest-markdown.mjs --product redrise <file>
 *
 * Env:
 *   SUPABASE_URL          — Supabase project URL.
 *   SUPABASE_SERVICE_ROLE — Service role key. REQUIRED for writes.
 *   WORKSPACE_ID          — Target workspace id (text).
 *   CTX_CHUNK_MIN_TOKENS, CTX_CHUNK_MAX_TOKENS, CTX_CHUNK_OVERLAP_TOKENS
 *   CTX_EMBEDDING_DISABLED=1   — Skip embedding generation (chunks still created).
 *   OPENAI_BASE_URL, OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL
 */

import { readFile, stat } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const DENY_PATTERNS = [
  /(^|\/)\.env(\..*)?$/i,
  /\.key$/i,
  /(^|\/)secrets?\//i,
  /(service[-_]?role|private[-_]?key|api[-_]?key)/i,
  /(^|\/)supabase\/\.temp\//i,
];

const SOURCE_TYPE_BY_PATH = [
  { match: /(^|\/)prd\//i, type: "prd" },
  { match: /(^|\/)roadmap\//i, type: "roadmap" },
  { match: /(^|\/)architecture\//i, type: "architecture_doc" },
  { match: /(^|\/)ui[-_ ]?(spec|block|map)\//i, type: "ui_spec" },
];

const args = parseArgs(process.argv.slice(2));
if (args.paths.length === 0) {
  console.error(
    "Usage: node scripts/ingest-markdown.mjs [--product <key>] <file|dir> [...more]",
  );
  process.exit(1);
}

const productKey = args.product ?? "redrise";
const url = required("SUPABASE_URL");
const serviceKey = required("SUPABASE_SERVICE_ROLE");
const workspaceId = required("WORKSPACE_ID");
const organizationId = process.env.ORGANIZATION_ID ?? null;
const skipEmbeddings = process.env.CTX_EMBEDDING_DISABLED === "1";

const minTokens = intEnv("CTX_CHUNK_MIN_TOKENS", 800);
const maxTokens = intEnv("CTX_CHUNK_MAX_TOKENS", 1200);
const overlapTokens = intEnv("CTX_CHUNK_OVERLAP_TOKENS", 80);

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const embeddingProvider = skipEmbeddings
  ? null
  : createOpenAICompatibleProvider();

const files = await expandPaths(args.paths);
if (files.length === 0) {
  console.error("No markdown files found.");
  process.exit(2);
}

const stats = { indexed: 0, skipped: 0, failed: 0 };
for (const file of files) {
  if (shouldDeny(file)) {
    console.warn(`deny: ${file}`);
    stats.skipped += 1;
    continue;
  }
  try {
    const raw = await readFile(file, "utf8");
    const contentHash = sha256(raw);
    const title = inferTitle(raw, file);
    const sourceUri = relative(process.cwd(), file).split(sep).join("/");
    const sourceType = inferSourceType(sourceUri);

    const { data: existing } = await supabase
      .from("documents")
      .select("id, content_hash, status")
      .eq("workspace_id", workspaceId)
      .eq("product_key", productKey)
      .eq("source_uri", sourceUri)
      .maybeSingle();

    if (existing && existing.content_hash === contentHash && existing.status === "indexed") {
      console.log(`unchanged: ${file}`);
      stats.skipped += 1;
      continue;
    }

    const documentId = await upsertDocument({
      supabase,
      workspaceId,
      organizationId,
      productKey,
      sourceType,
      sourceUri,
      title,
      contentHash,
    });

    await replaceChunks({
      supabase,
      workspaceId,
      organizationId,
      productKey,
      documentId,
      raw,
      minTokens,
      maxTokens,
      overlapTokens,
      embeddingProvider,
    });

    await supabase
      .from("documents")
      .update({ status: "indexed", indexed_at: new Date().toISOString() })
      .eq("id", documentId);

    console.log(`indexed: ${file}`);
    stats.indexed += 1;
  } catch (error) {
    console.error(`failed: ${file} — ${error?.message ?? error}`);
    stats.failed += 1;
  }
}

console.log("\nDone.", stats);

function parseArgs(argv) {
  const out = { product: null, paths: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--product" || arg === "-p") {
      out.product = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--product=")) {
      out.product = arg.split("=")[1];
    } else {
      out.paths.push(arg);
    }
  }
  return out;
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing env: ${name}`);
    process.exit(2);
  }
  return value;
}

function intEnv(name, fallback) {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function expandPaths(inputs) {
  const out = [];
  for (const input of inputs) {
    const abs = resolve(input);
    const stats = await stat(abs).catch(() => null);
    if (!stats) continue;
    if (stats.isDirectory()) {
      const { readdir } = await import("node:fs/promises");
      for await (const file of walk(abs)) out.push(file);
    } else {
      out.push(abs);
    }
  }
  return out.filter((p) => /\.mdx?$/i.test(p));
}

async function* walk(dir) {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".") continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (/\.mdx?$/i.test(entry.name)) {
      yield path;
    }
  }
}

function shouldDeny(path) {
  return DENY_PATTERNS.some((re) => re.test(path));
}

function inferSourceType(sourceUri) {
  for (const rule of SOURCE_TYPE_BY_PATH) {
    if (rule.match.test(sourceUri)) return rule.type;
  }
  return "markdown";
}

function inferTitle(raw, file) {
  const match = raw.match(/^#\s+(.+?)\s*$/m);
  if (match) return match[1].trim();
  return file.split(/[\\/]/).pop().replace(/\.mdx?$/i, "");
}

function sha256(input) {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

async function upsertDocument({
  supabase,
  workspaceId,
  organizationId,
  productKey,
  sourceType,
  sourceUri,
  title,
  contentHash,
}) {
  const slug = sourceUri
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase()
    .slice(0, 80);
  const { data, error } = await supabase
    .from("documents")
    .upsert(
      {
        workspace_id: workspaceId,
        organization_id: organizationId ?? "00000000-0000-0000-0000-000000000000",
        product_key: productKey,
        source_type: sourceType,
        source_uri: sourceUri,
        title,
        slug,
        content_hash: contentHash,
        status: "indexing",
      },
      { onConflict: "workspace_id,product_key,source_uri" },
    )
    .select("id")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to upsert document");
  }
  return data.id;
}

async function replaceChunks({
  supabase,
  workspaceId,
  organizationId,
  productKey,
  documentId,
  raw,
  minTokens,
  maxTokens,
  overlapTokens,
  embeddingProvider,
}) {
  await supabase.from("document_chunks").delete().eq("document_id", documentId);
  const sections = splitSections(raw);
  const chunks = buildChunks(sections, { minTokens, maxTokens, overlapTokens });
  if (chunks.length === 0) return;

  let embeddings = [];
  if (embeddingProvider) {
    embeddings = await embeddingProvider.embed(chunks.map((c) => c.content));
  }

  const rows = chunks.map((chunk, index) => ({
    document_id: documentId,
    workspace_id: workspaceId,
    organization_id: organizationId ?? "00000000-0000-0000-0000-000000000000",
    product_key: productKey,
    chunk_index: chunk.chunk_index ?? index,
    heading_path: chunk.heading_path,
    content: chunk.content,
    content_tokens: chunk.content_tokens,
    content_hash: chunk.content_hash,
    embedding: embeddings[index] ?? null,
    metadata: chunk.metadata ?? {},
  }));

  const { error } = await supabase.from("document_chunks").insert(rows);
  if (error) throw new Error(error.message);
}

function splitSections(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const sections = [];
  const lines = normalized.split("\n");
  let current = { heading: "(root)", headingPath: "", body: [] };
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (match) {
      if (current.body.length > 0 || current.heading !== "(root)") {
        sections.push({ ...current, body: current.body.join("\n").trim() });
      }
      const level = match[1].length;
      const heading = match[2].trim();
      current = {
        heading,
        headingPath: heading,
        body: [],
        level,
      };
    } else {
      current.body.push(line);
    }
  }
  if (current.body.length > 0 || current.heading !== "(root)") {
    sections.push({ ...current, body: current.body.join("\n").trim() });
  }
  return sections;
}

function buildChunks(sections, options) {
  const chunks = [];
  let index = 0;
  for (const section of sections) {
    const body = section.body.length > 0 ? `${section.headingPath}\n\n${section.body}` : section.headingPath;
    const tokens = estimateTokens(body);
    if (tokens <= options.maxTokens) {
      chunks.push(makeChunk(index, section.headingPath, body));
      index += 1;
      continue;
    }
    const paragraphs = section.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    let buffer = [];
    let bufferTokens = estimateTokens(section.headingPath) + 4;
    for (const paragraph of paragraphs) {
      const paragraphTokens = estimateTokens(paragraph);
      if (bufferTokens + paragraphTokens > options.maxTokens && buffer.length > 0) {
        chunks.push(makeChunk(index, section.headingPath, `${section.headingPath}\n\n${buffer.join("\n\n")}`));
        index += 1;
        const overlapText = buffer.slice(-2).join("\n\n");
        if (estimateTokens(overlapText) <= options.overlapTokens) {
          buffer = overlapText.split("\n\n");
          bufferTokens = estimateTokens(section.headingPath) + 4 + estimateTokens(overlapText);
        } else {
          buffer = [];
          bufferTokens = estimateTokens(section.headingPath) + 4;
        }
      }
      buffer.push(paragraph);
      bufferTokens += paragraphTokens;
    }
    if (buffer.length > 0) {
      chunks.push(makeChunk(index, section.headingPath, `${section.headingPath}\n\n${buffer.join("\n\n")}`));
      index += 1;
    }
  }
  return chunks;
}

function makeChunk(index, headingPath, content) {
  return {
    chunk_index: index,
    heading_path: headingPath,
    content,
    content_tokens: estimateTokens(content),
    content_hash: sha256(content),
  };
}

function estimateTokens(text) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

function createOpenAICompatibleProvider() {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.OPENROUTER_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://openrouter.ai/api/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY (or OPENROUTER_API_KEY) is required for embeddings");
  }
  return {
    name: `openrouter:${model}`,
    dimensions: 1536,
    async embed(texts) {
      const response = await fetch(`${baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, input: texts, encoding_format: "float" }),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Embedding failed (${response.status}): ${body.slice(0, 200)}`);
      }
      const payload = await response.json();
      return (payload.data ?? [])
        .sort((a, b) => a.index - b.index)
        .map((row) => row.embedding);
    },
  };
}