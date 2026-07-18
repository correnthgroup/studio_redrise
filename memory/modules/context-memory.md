# Context Memory Layer (PRD-CML-001)

> Source-of-truth module for the Correnth Context Memory Layer. Read this
> before touching `src/domains/context/`, `supabase/migrations/048_*.sql`
> onwards, or the RS-CONTEXT screen.

## Purpose

Index Correnth project documents (`.md`, PRDs, decisions, UI specs,
roadmaps) into Supabase + pgvector and expose hybrid retrieval (vector +
full-text + weighted rerank) so RedScale agents can pull a compact
**Context Pack** instead of stuffing every prompt with the whole repo.

## Scope (v1)

- Supabase schema: documents, document_chunks, document_summaries,
  entities, relations, context_queries, context_packs.
- Markdown ingestion with heading-first chunking (800-1200 tokens).
- Embedding provider via OpenAI-compatible endpoint (OpenRouter /
  MiniMax). 1536-dim, pluggable.
- Hybrid search with weighted rerank (no cross-encoder in v1).
- Context Pack Builder (markdown format, token budget respected).
- MCP tool interface (`correnth-context.mjs`) for external agents.
- RS-CONTEXT screen with 6 tabs (Dialogs + Sonner, no side panels).
- RLS scoped by `organization_id`.

## Out of Scope

- Autonomous code editing.
- Fine-tuning models.
- Qdrant / Weaviate migration (interface ready, not implemented).
- Binary ingestion beyond Markdown.
- Cross-encoder / LLM-judge rerankers.

## Entry Points

| Concern | Location |
|---|---|
| TS types | `src/domains/context/types.ts` |
| Markdown reader | `src/domains/context/ingestion/markdown-reader.ts` |
| Chunker | `src/domains/context/ingestion/chunker.ts` |
| Hash | `src/domains/context/ingestion/hash.ts` |
| Embedding provider (interface) | `src/domains/context/embeddings/provider.ts` |
| OpenRouter impl | `src/domains/context/embeddings/openrouter.ts` |
| Hybrid search | `src/domains/context/search/hybrid-search.ts` |
| Hybrid search SQL | `supabase/migrations/049_create_context_memory.sql` |
| Context pack builder | `src/domains/context/context-pack/builder.ts` |
| MCP tools | `src/domains/context/mcp/tools.ts` |
| MCP CLI wrapper | `scripts/mcp/correnth-context.mjs` |
| Ingestion CLI | `scripts/ingest-markdown.mjs` |
| UI shell | `src/app/(app)/[organizationSlug]/context/page.tsx` |
| Sidebar entry | `src/components/layout/app-sidebar.tsx` (RedScale > Context Memory) |

## Invariants

- Every row carries `organization_id`; RLS is mandatory.
- `product_key` is the second axis for filtering (redrise / redscale /
  redrose / findfee / adgency / correnth).
- Embedding model: 1536-dim; `vector(1536)` column. If you change
  dimensions, ship a migration that drops/recreates the vector index.
- Chunker targets 800-1200 tokens per chunk; chunk index is monotonic
  per document.
- `content_hash` is SHA-256 of the source markdown. Idempotent ingest:
  same hash = no-op.
- Reranking is **weighted** only (vector + ts_rank + metadata_boost).
  No external reranker model in v1.
- TSVector uses **English** as default. PT-BR mirrors exist as a
  secondary column for the in-app language toggle; queries default to
  English and fall back to simple.
- UI: Dialogs/Modals only — never side panels. Sonner default styling.
  No `localStorage` for indexed data; the cache layer (if added) must
  be server-side.
- Secrets and credentials are excluded from ingestion by path globs
  (see `scripts/ingest-markdown.mjs` deny list).

## Config (env)

```text
CTX_EMBEDDING_PROVIDER=openrouter          # only one in v1
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=sk-or-...
OPENAI_EMBEDDING_MODEL=openai/text-embedding-3-small
CTX_GENERATE_SUMMARIES=false               # gate LLM cost in v1
CTX_CHUNK_MIN_TOKENS=800
CTX_CHUNK_MAX_TOKENS=1200
CTX_CHUNK_OVERLAP_TOKENS=80
CTX_DEFAULT_TOKEN_BUDGET=8000
```

## Common Tasks

**Reindex a single document:**
```bash
npm run ingest:ctx -- docs/01_PRODUCT_ARCHITECTURE_MAP_v1.md
```

**Reindex everything (org-scoped):**
```bash
npm run reindex:ctx -- redrise
```

**Open MCP tools for an external agent:**
```bash
node scripts/mcp/correnth-context.mjs
# JSON-RPC over stdio: search_context, get_context_pack,
# get_document, list_project_decisions, register_decision
```

**Run tests:**
```bash
npm run test -- context-memory   # unit (chunker, hybrid score, formatter)
npm run test:e2e -- context      # Playwright
```

## When To Update This Module

- After any schema change in migrations 048+.
- After adding a new summary_type.
- After introducing a new embedding provider implementation.
- After changing reranking weights.