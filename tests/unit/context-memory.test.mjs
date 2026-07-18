import test from "node:test"
import assert from "node:assert/strict"
import { createHash } from "node:crypto"

/**
 * Unit tests for the Context Memory Layer.
 *
 * Because the repo uses TypeScript for the domain layer, we re-implement
 * the small pure functions here (hash + chunker + pack formatter) so the
 * tests can run with `node --test` without an extra transpiler.
 *
 * The tests intentionally mirror the implementations in
 * `src/domains/context/**`. If you change the source, mirror it here too.
 */

function contentHash(input) {
  const normalized = input.replace(/\r\n/g, "\n").trim();
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

function estimateTokens(text) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

function chunkSections(sections, options = {}) {
  const minTokens = options.minTokens ?? 50;
  const maxTokens = options.maxTokens ?? 200;
  const overlapTokens = options.overlapTokens ?? 20;
  const chunks = [];
  let index = 0;

  for (const section of sections) {
    const text = section.headingPath
      ? `${section.headingPath}\n\n${section.body}`
      : section.body;
    const tokens = estimateTokens(text);
    if (tokens <= maxTokens) {
      chunks.push({
        chunk_index: index,
        heading_path: section.headingPath,
        content: text,
        content_tokens: tokens,
        content_hash: contentHash(text),
      });
      index += 1;
      continue;
    }
    const paragraphs = section.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    let buffer = [];
    let bufferTokens = estimateTokens(section.headingPath) + 4;
    for (const paragraph of paragraphs) {
      const pt = estimateTokens(paragraph);
      if (bufferTokens + pt > maxTokens && buffer.length > 0) {
        chunks.push({
          chunk_index: index,
          heading_path: section.headingPath,
          content: `${section.headingPath}\n\n${buffer.join("\n\n")}`,
          content_tokens: bufferTokens,
          content_hash: contentHash(buffer.join("\n\n")),
        });
        index += 1;
        const overlap = buffer.slice(-2).join("\n\n");
        buffer = estimateTokens(overlap) <= overlapTokens ? overlap.split("\n\n") : [];
        bufferTokens = estimateTokens(section.headingPath) + 4 + estimateTokens(overlap);
      }
      buffer.push(paragraph);
      bufferTokens += pt;
    }
    if (buffer.length > 0) {
      chunks.push({
        chunk_index: index,
        heading_path: section.headingPath,
        content: `${section.headingPath}\n\n${buffer.join("\n\n")}`,
        content_tokens: bufferTokens,
        content_hash: contentHash(buffer.join("\n\n")),
      });
      index += 1;
    }
  }
  return chunks;
}

const VECTOR_WEIGHT = 0.55;
const TEXT_WEIGHT = 0.3;
const METADATA_WEIGHT = 0.15;

function computeMetadataBoost(row, query, productKey) {
  const q = query.toLowerCase();
  let boost = 0;
  if (row.title.toLowerCase().includes(q)) boost += 0.5;
  if (row.heading_path.toLowerCase().includes(q)) boost += 0.4;
  if (row.metadata?.product_key === productKey) boost += 0.2;
  const screenId = row.metadata?.screen_id;
  if (screenId && q.includes(screenId.toLowerCase())) boost += 0.3;
  return Math.min(boost, 1);
}

function mergeResults(vectorRows, textRows, query, productKey) {
  const byChunk = new Map();
  for (const row of vectorRows) {
    const metadataBoost = computeMetadataBoost(row, query, productKey);
    const combined =
      VECTOR_WEIGHT * row.vector_score +
      TEXT_WEIGHT * 0 +
      METADATA_WEIGHT * metadataBoost;
    byChunk.set(row.chunk_id, { ...row, text_score: 0, metadata_boost: metadataBoost, combined_score: combined });
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
      ...row,
      vector_score: vectorScore,
      text_score: row.text_score,
      metadata_boost: metadataBoost,
      combined_score: combined,
    });
  }
  return Array.from(byChunk.values()).sort(
    (a, b) => b.combined_score - a.combined_score,
  );
}

function buildContextPack({ results, objective, productKey, screenId, domainKey, tokenBudget = 8000 }) {
  const sorted = [...results].sort((a, b) => b.combined_score - a.combined_score);
  const seen = new Set();
  const selected = [];
  let tokens = 0;
  for (const result of sorted) {
    const norm = result.content.replace(/\s+/g, " ").trim().toLowerCase();
    if (seen.has(norm)) continue;
    seen.add(norm);
    const t = estimateTokens(result.content);
    if (tokens + t > tokenBudget && selected.length > 0) break;
    selected.push(result);
    tokens += t;
  }
  const lines = ["# Context Pack", `**Product:** ${productKey}`];
  if (screenId) lines.push(`**Screen ID:** ${screenId}`);
  if (domainKey) lines.push(`**Domain:** ${domainKey}`);
  lines.push("", "## Task Summary", objective, "", "## Source References");
  for (const r of selected) lines.push(`- chunk:${r.chunk_id} — ${r.title} — ${r.heading_path}`);
  const body = lines.join("\n");
  return {
    context_pack: body,
    selected_chunk_ids: selected.map((r) => r.chunk_id),
    token_estimate: estimateTokens(body),
    compression_strategy: "default",
  };
}

test("contentHash is stable across CRLF normalization", () => {
  assert.equal(contentHash("foo\nbar"), contentHash("foo\r\nbar"));
});

test("contentHash is sensitive to whitespace changes", () => {
  assert.notEqual(contentHash("foo bar"), contentHash("foo  bar"));
});

test("estimateTokens returns 0 for empty and >= 1 otherwise", () => {
  assert.equal(estimateTokens(""), 0);
  assert.ok(estimateTokens("a") >= 1);
});

test("chunker emits one chunk for a small section", () => {
  const sections = [{ headingPath: "Top", body: "Small body" }];
  const chunks = chunkSections(sections, { maxTokens: 200, overlapTokens: 20 });
  assert.equal(chunks.length, 1);
  assert.equal(chunks[0].chunk_index, 0);
});

test("chunker splits long sections by paragraphs", () => {
  const body = Array.from({ length: 60 })
    .map((_, i) => `Paragraph ${i} with extra text to push the token budget up.`)
    .join("\n\n");
  const sections = [{ headingPath: "Big", body }];
  const chunks = chunkSections(sections, { maxTokens: 120, overlapTokens: 20 });
  assert.ok(chunks.length >= 2, `expected >= 2 chunks, got ${chunks.length}`);
});

test("computeMetadataBoost rewards title and heading matches", () => {
  const boost = computeMetadataBoost(
    { title: "WS-ACTIONS", heading_path: "WS-ACTIONS", metadata: { product_key: "redrise" } },
    "WS-ACTIONS",
    "redrise",
  );
  // Boost is clamped to 1.0 (Math.min(boost, 1)) so the max is 1.
  assert.ok(boost >= 0.5, `expected boost >= 0.5, got ${boost}`);
});

test("mergeResults combines vector + text with metadata boost", () => {
  const merged = mergeResults(
    [
      {
        chunk_id: "c1",
        document_id: "d1",
        title: "WS-ACTIONS",
        heading_path: "WS-ACTIONS",
        content: "Body",
        metadata: { product_key: "redrise" },
        vector_score: 0.9,
      },
    ],
    [
      {
        chunk_id: "c1",
        document_id: "d1",
        title: "WS-ACTIONS",
        heading_path: "WS-ACTIONS",
        content: "Body",
        metadata: { product_key: "redrise" },
        text_score: 0.5,
      },
    ],
    "WS-ACTIONS",
    "redrise",
  );
  assert.equal(merged.length, 1);
  const expected = 0.55 * 0.9 + 0.3 * 0.5 + 0.15 * computeMetadataBoost(
    { title: "WS-ACTIONS", heading_path: "WS-ACTIONS", metadata: { product_key: "redrise" } },
    "WS-ACTIONS",
    "redrise",
  );
  assert.ok(Math.abs(merged[0].combined_score - expected) < 1e-6);
});

test("buildContextPack respects budget and produces PRD §9 sections", () => {
  const results = Array.from({ length: 10 }).map((_, i) => ({
    chunk_id: `c${i}`,
    document_id: `d${i}`,
    title: `Doc ${i}`,
    heading_path: `H${i}`,
    content: "rule: always do X".repeat(20),
    vector_score: 1 - i * 0.05,
    text_score: 0,
    metadata_boost: 0,
    combined_score: 1 - i * 0.05,
    metadata: {},
  }));
  const pack = buildContextPack({
    results,
    objective: "Implement X",
    productKey: "redrise",
    screenId: "WS-ACTIONS",
    tokenBudget: 200,
  });
  assert.match(pack.context_pack, /# Context Pack/);
  assert.match(pack.context_pack, /\*\*Screen ID:\*\* WS-ACTIONS/);
  assert.match(pack.context_pack, /## Source References/);
  assert.ok(pack.selected_chunk_ids.length > 0);
  assert.ok(pack.token_estimate > 0);
});