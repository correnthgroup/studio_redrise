# PRD-CML-001 — Correnth Context Memory Layer v1

Status: Draft v1  
Owner: Correnth / RedScale  
Target Consumer: RedScale, RedRise development agents, future Correnth products  
Purpose: Build the robust context/memory substrate required for agentic development and project continuity.

---

## 1. Objective

Create a Context Memory Layer that indexes Correnth project documents, RedRise decisions, Markdown specs, PRDs, UI decisions and implementation notes, then exposes them to LLMs/agents through hybrid retrieval and context compression.

The first use case is internal: help RedScale and external agents retrieve accurate context to continue RedRise development.

---

## 2. Problem

Current project knowledge is distributed across:

- Markdown files;
- conversation decisions;
- UI block references;
- architecture maps;
- roadmap files;
- implementation notes;
- future codebase files.

Agents lose context when sessions end, token limits are hit, or different tools are used.

This causes:

- repeated explanations;
- inconsistent implementation;
- hallucinated decisions;
- wasted tokens;
- weak continuity between agents.

---

## 3. Solution

Implement a memory/retrieval system using:

1. Supabase + pgvector.
2. Tables for documents, chunks, summaries, entities and relations.
3. Indexation of Markdown files and project decisions.
4. Hybrid search: vector + full-text.
5. Reranking.
6. Context compression.
7. MCP/tool interface for LLM access.
8. Future migration path to Qdrant or Weaviate if required.

---

## 4. Scope

### In Scope

- Supabase database schema.
- pgvector setup.
- Markdown ingestion pipeline.
- Chunking strategy.
- Embedding generation abstraction.
- Full-text search indexes.
- Hybrid search RPC/function.
- Summaries table.
- Entities table.
- Relations table.
- Context pack builder.
- MCP/tool interface spec.
- Admin/developer UI for inspecting indexed content.

### Out of Scope

- Full autonomous code editing.
- Fine-tuning models.
- Qdrant/Weaviate migration implementation.
- Large binary file ingestion beyond Markdown in v1.
- End-user commercial memory features.

---

## 5. Data Model

### 5.1 documents

Stores source-level files or decision documents.

Fields:

```text
id
organization_id
product_key
source_type
source_uri
title
slug
content_hash
status
metadata
created_at
updated_at
indexed_at
```

Recommended `source_type` values:

```text
markdown
conversation_decision
architecture_doc
prd
roadmap
ui_spec
code_file
external_reference
```

---

### 5.2 document_chunks

Stores chunked content and vector embeddings.

Fields:

```text
id
document_id
organization_id
product_key
chunk_index
heading_path
content
content_tokens
content_hash
embedding
metadata
created_at
updated_at
```

Indexes:

- vector index on embedding;
- full-text index on content;
- btree on document_id;
- btree on product_key;
- btree on source_type if denormalized into metadata or materialized view.

---

### 5.3 document_summaries

Stores summaries at different levels.

Fields:

```text
id
document_id
organization_id
product_key
summary_type
summary
model_used
created_at
updated_at
```

Summary types:

```text
document
section
decision
implementation
agent_context
```

---

### 5.4 entities

Stores extracted named entities and system concepts.

Fields:

```text
id
organization_id
product_key
entity_type
name
canonical_name
description
metadata
created_at
updated_at
```

Entity types:

```text
product
screen_id
domain
role
component
table
workflow
agent
integration
concept
```

Examples:

```text
RedRise
RedScale
WS-ACTIONS
APP-SHELL
Work Order
Context Pack
Agent Registry
```

---

### 5.5 relations

Stores relationships between entities/documents/chunks.

Fields:

```text
id
organization_id
product_key
source_entity_id
target_entity_id
relation_type
evidence_chunk_id
confidence
metadata
created_at
updated_at
```

Relation types:

```text
defines
uses
depends_on
implements
replaces
references
belongs_to
blocks
unblocks
```

---

### 5.6 context_queries

Stores retrieval requests from agents/users.

Fields:

```text
id
organization_id
product_key
query
filters
requested_by
consumer_type
created_at
```

---

### 5.7 context_packs

Stores composed context packs delivered to agents.

Fields:

```text
id
organization_id
product_key
query_id
work_order_id
context_pack
selected_chunk_ids
compression_strategy
token_estimate
created_at
```

---

## 6. Ingestion Pipeline

### Step 1 — Source Registration

Register source file/document:

```text
source_uri
title
product_key
source_type
content_hash
```

### Step 2 — Content Read

Read Markdown content from local path, upload, repo, or future connector.

### Step 3 — Chunking

Chunk by:

- headings first;
- then token budget;
- preserve heading path;
- preserve source line/section metadata when available.

Recommended chunk size:

```text
800–1,200 tokens per chunk
```

### Step 4 — Embedding

Generate vector embedding through configurable embedding provider.

Embedding provider must be abstracted.

Initial likely option:

```text
OpenAI embeddings or another OpenAI-compatible embedding provider
```

### Step 5 — Full-Text Indexing

Store content in Postgres with tsvector support.

### Step 6 — Summary Generation

Generate document-level and section-level summaries.

### Step 7 — Entity Extraction

Extract important project entities and relations.

### Step 8 — Validation

Validate:

- document indexed;
- chunk count;
- embedding present;
- summaries present;
- hash stored;
- no duplicate active documents unless versioned.

---

## 7. Hybrid Search

The retrieval function must combine:

1. Vector similarity.
2. Full-text search.
3. Metadata filters.
4. Optional entity filters.
5. Reranking.

Input:

```json
{
  "query": "What are the required fields for WS-ACTIONS?",
  "product_key": "redrise",
  "filters": {
    "source_type": ["architecture_doc", "ui_spec", "prd"],
    "screen_id": "WS-ACTIONS"
  },
  "limit": 20
}
```

Output:

```json
{
  "query": "...",
  "results": [
    {
      "document_id": "...",
      "chunk_id": "...",
      "title": "...",
      "heading_path": "...",
      "content": "...",
      "vector_score": 0.82,
      "text_score": 0.71,
      "combined_score": 0.78,
      "metadata": {}
    }
  ]
}
```

---

## 8. Reranking

v1 may implement reranking as an interface with a simple fallback.

### MVP Reranking

- Weighted score = vector_score + text_score + metadata_boost.
- Boost exact matches for Screen ID, product_key, file title and entity names.

### Future Reranking

- Dedicated reranker model.
- Cross-encoder reranking.
- LLM-based relevance scoring for small result sets.

---

## 9. Context Compression

The Context Pack Builder must compress retrieved content into agent-ready context.

Compression format:

```text
Context Pack
├── Task Summary
├── Relevant Decisions
├── Relevant UI Rules
├── Relevant Data Model
├── Relevant RBAC Rules
├── Files/Docs to Inspect
├── Open Questions
└── Source References
```

Compression rules:

- Do not include every retrieved chunk verbatim.
- Preserve decisions and constraints.
- Keep citations/source references.
- Prefer concise summaries with links to full source chunks.
- Include hard requirements separately from suggestions.

---

## 10. MCP / Tool Interface

Create a tool interface for agents.

Required tool functions:

### search_context

```json
{
  "query": "string",
  "product_key": "redrise|redscale|redrose|findfee|adgency|correnth",
  "filters": {},
  "limit": 10
}
```

### get_context_pack

```json
{
  "objective": "string",
  "product_key": "string",
  "screen_id": "string|null",
  "domain_key": "string|null",
  "token_budget": 8000
}
```

### get_document

```json
{
  "document_id": "string"
}
```

### list_project_decisions

```json
{
  "product_key": "string",
  "topic": "string|null"
}
```

### register_decision

```json
{
  "product_key": "string",
  "title": "string",
  "decision": "string",
  "rationale": "string",
  "source": "string"
}
```

---

## 11. UI Requirements

### Screen ID: RS-CONTEXT

Purpose: inspect and operate the Context Memory Layer.

Sections:

1. Indexed Documents.
2. Search Console.
3. Context Pack Builder.
4. Entities & Relations.
5. Ingestion Jobs.
6. Errors / Reindex Queue.

### Indexed Documents Table

Columns:

- Title;
- Product;
- Source Type;
- Chunks;
- Last Indexed;
- Status;
- Actions.

Actions:

- View;
- Reindex;
- Generate Summary;
- Extract Entities;
- Archive.

### Search Console

Fields:

- Query;
- Product;
- Source Type;
- Screen ID;
- Limit;
- Search.

Results:

- Document;
- Heading;
- Score;
- Snippet;
- Open chunk.

### Context Pack Builder

Fields:

- Objective;
- Product;
- Domain;
- Screen ID;
- Token budget;
- Generate.

Output:

- compressed context pack;
- selected chunks;
- token estimate;
- copy button.

---

## 12. Security and RLS

Rules:

- Every row must have organization_id.
- Product access must be scoped.
- Secrets must never be indexed.
- Raw credentials must be excluded from ingestion.
- Agent access should be read-only by default.
- Only approved tools can register new decisions.

---

## 13. Acceptance Criteria

The PRD is complete when:

- Supabase schema exists.
- pgvector is enabled.
- Markdown docs can be indexed.
- Chunks are stored with embeddings.
- Full-text search works.
- Hybrid search works.
- Context Pack Builder returns compact context.
- MCP/tool interface is specified or implemented.
- RS-CONTEXT UI can inspect indexed documents and search results.
- A RedScale Work Order can attach a context pack.

---

## 14. Test Checklist

### Unit Tests

- chunking function;
- content hash function;
- hybrid score function;
- metadata filtering;
- context compression formatter.

### Integration Tests

- ingest Markdown file;
- generate embeddings;
- insert chunks;
- run vector search;
- run full-text search;
- run hybrid search;
- generate context pack.

### E2E Tests

- upload/register document;
- index document;
- search context;
- build context pack;
- attach context pack to Work Order.

---

## 15. LLM Implementation Prompt

Use this prompt for an implementation agent:

```text
You are implementing PRD-CML-001 — Correnth Context Memory Layer v1.

Objective:
Build the Supabase/Postgres + pgvector memory layer that indexes Markdown project documents and exposes hybrid retrieval + context pack generation for RedScale agents.

Read and follow:
- 03_CORRENTH_CONTEXT_MEMORY_ARCHITECTURE_v1.md
- 04_REDSCALE_ROADMAP_v1.md
- 05_REDSCALE_PRD_BREAKDOWN_v1.md
- existing RedRise architecture and UI documentation files.

Implement in small commits:
1. Supabase migrations for documents, document_chunks, document_summaries, entities, relations, context_queries and context_packs.
2. RLS policies scoped by organization_id.
3. TypeScript types for the memory layer.
4. Markdown ingestion utility.
5. Chunking utility.
6. Embedding provider interface.
7. Hybrid search RPC/function or service.
8. Context Pack Builder service.
9. RS-CONTEXT UI shell with Indexed Documents, Search Console and Context Pack Builder.
10. Tests for chunking, ingestion, search and context pack generation.

Rules:
- Do not index secrets or credentials.
- Do not hardcode provider-specific embedding logic directly into the database layer.
- Keep provider abstraction replaceable.
- Use pgvector first; leave Qdrant/Weaviate as future migration paths.
- Every document, chunk and context pack must be scoped by organization_id and product_key.
- Use Sonner for user-triggered success/error actions.
- Use Dialogs/Modals for detailed actions; avoid side panels unless the product spec explicitly permits them.

Deliverables:
- Migrations.
- Types.
- Ingestion service.
- Search service.
- Context pack builder.
- RS-CONTEXT UI shell.
- Tests.
- Short implementation notes.
```
