# Correnth Context Memory Architecture v1

Status: Draft v1  
Scope: camada de contexto/memória para RedScale, RedRise e todo o Grupo Correnth.

---

## 1. Objetivo

Criar uma camada robusta de contexto para que agentes e LLMs possam consultar decisões, documentos, PRDs, specs, histórico e relações do ecossistema sem depender de prompts gigantes.

Objetivo prático:

```text
Reduzir perda de contexto, reduzir custo de tokens e aumentar consistência das decisões e implementações.
```

---

## 2. Stack inicial

```text
Supabase + Postgres + pgvector
```

Motivo:

- já está alinhado ao stack do RedRise;
- permite RLS;
- permite full-text search;
- permite embeddings com pgvector;
- reduz complexidade inicial.

Migração futura possível:

```text
Qdrant ou Weaviate
```

Mas apenas se houver necessidade real de escala, performance, filtros vetoriais avançados ou workload dedicado.

---

## 3. Entidades mínimas

### documents

Representa um arquivo/documento de origem.

Campos:

- id;
- organization_id;
- product_key;
- title;
- source_type;
- source_path;
- content_hash;
- status;
- created_at;
- updated_at;
- indexed_at.

---

### chunks

Representa pedaços do documento para busca vetorial e textual.

Campos:

- id;
- document_id;
- organization_id;
- product_key;
- chunk_index;
- content;
- content_tsvector;
- embedding;
- token_count;
- metadata;
- created_at.

---

### summaries

Representa resumos em múltiplos níveis.

Campos:

- id;
- document_id;
- chunk_id nullable;
- summary_type: chunk, document, project, decision;
- content;
- model_used;
- created_at.

---

### entities

Representa entidades extraídas.

Exemplos:

- RedRise;
- RedScale;
- WS-ACTIONS;
- APP-SHELL;
- Supabase;
- Work Order;
- Node;
- Process;
- Agent.

Campos:

- id;
- organization_id;
- product_key;
- name;
- entity_type;
- description;
- aliases;
- created_at;
- updated_at.

---

### relations

Representa relações entre entidades.

Exemplos:

```text
RedScale develops RedRise
WS-ACTIONS observes Node Runs
Process contains Nodes
Node Run belongs to Process Run
```

Campos:

- id;
- source_entity_id;
- target_entity_id;
- relation_type;
- confidence;
- evidence_chunk_id;
- created_at.

---

### decisions

Representa decisões tomadas.

Campos:

- id;
- organization_id;
- product_key;
- title;
- decision;
- rationale;
- alternatives_considered;
- status;
- decided_by;
- decided_at;
- source_refs.

---

### retrieval_logs

Auditoria de buscas feitas por agentes.

Campos:

- id;
- agent_id;
- work_order_id;
- query;
- retrieved_chunk_ids;
- reranked_chunk_ids;
- compressed_context;
- created_at.

---

## 4. Busca híbrida

A busca deve combinar:

```text
Vector search + full-text search + metadata filters
```

Pipeline:

```text
User/Agent Query
↓
Query expansion
↓
Vector search using embeddings
↓
Full-text search using Postgres tsvector
↓
Merge results
↓
Reranking
↓
Context compression
↓
Return compact context to LLM
```

---

## 5. Reranking

Reranking deve reorganizar os resultados por relevância real ao objetivo atual.

Critérios:

- similaridade vetorial;
- correspondência lexical;
- recência;
- product_key;
- document type;
- screen id;
- decision status;
- relação com Work Order atual.

---

## 6. Compressão de contexto

Após recuperar chunks, não enviar tudo diretamente para a LLM.

Aplicar compressão:

```text
Retrieved chunks
↓
Deduplicate
↓
Summarize by topic
↓
Extract decisions
↓
Extract constraints
↓
Return compact context pack
```

Formato de resposta para agentes:

```md
# Context Pack

## Relevant Decisions

## Required Constraints

## Related Screens / Modules

## Data Model Notes

## UI Rules

## Open Questions

## Source References
```

---

## 7. MCP / Tool para consulta

Deve existir uma ferramenta consultável por agentes.

Nome sugerido:

```text
correnth_context.search
```

Funções mínimas:

```text
search(query, product_key, filters)
get_document(document_id)
get_decisions(product_key, screen_id)
get_context_pack(work_order_id)
index_document(path)
reindex_all(product_key)
```

---

## 8. Indexação dos documentos `.md`

Documentos a indexar inicialmente:

- arquitetura do produto;
- UI block maps;
- roadmaps;
- PRDs;
- specs de tela;
- Agent Operating System;
- Correnth Ecosystem Strategy;
- RedScale Spec;
- RedScale to RedRise Plan.

Processo:

```text
Detect file
↓
Read markdown
↓
Normalize headings
↓
Chunk by section
↓
Generate summary
↓
Generate embedding
↓
Extract entities
↓
Extract relations
↓
Store
```

---

## 9. UI da memória

### SCREEN-ID: CTX-ROOT — Context Memory Root

Função:

- visão geral da camada de memória.

Layout:

```text
CTX-ROOT
├── Breadcrumb
├── Header
├── Documents Indexed
├── Chunk Count
├── Entity Count
├── Relation Count
├── Last Indexing Run
├── Failed Indexing Jobs
└── Retrieval Quality Summary
```

---

### SCREEN-ID: CTX-DOCUMENTS

Tabela de documentos.

Colunas:

- Title;
- Product;
- Source type;
- Path;
- Status;
- Chunks;
- Last indexed;
- Actions.

Ações:

- View;
- Reindex;
- Disable;
- Delete from index.

---

### SCREEN-ID: CTX-SEARCH

Busca manual para testar retrieval.

Campos:

- Query;
- Product;
- Document type;
- Screen ID;
- Date range;
- Search mode: vector, full-text, hybrid.

Resultado:

- ranked chunks;
- source document;
- score;
- summary;
- copy context pack.

---

### SCREEN-ID: CTX-ENTITIES

Visualização de entidades e relações.

Pode evoluir para grafo.

---

### SCREEN-ID: CTX-RETRIEVAL-LOGS

Auditoria das consultas feitas por agentes.

Colunas:

- Agent;
- Work Order;
- Query;
- Results count;
- Rerank status;
- Created at.

---

## 10. Regras de qualidade

1. Toda decisão importante deve virar `decision`.
2. Todo documento precisa de hash para evitar reindexação desnecessária.
3. Todo chunk deve manter referência ao documento e heading original.
4. Toda busca de agente deve ser logada.
5. Nenhum agente deve implementar com contexto vazio.
6. Context pack deve ser compacto e rastreável.
7. Reranking deve ser obrigatório em tarefas críticas.

---

## 11. Migração futura para Qdrant/Weaviate

Critérios para migrar:

- volume alto de chunks;
- performance insuficiente no Postgres;
- necessidade de filtros vetoriais avançados;
- necessidade de cluster dedicado;
- necessidade de busca multi-tenant mais performática;
- custo/latência do pgvector se torna problema.

Até lá:

```text
Supabase + pgvector é suficiente e mais simples.
```

---

## 12. Decisão final

A camada de contexto/memória é pré-requisito para RedScale funcionar bem.

Sem ela, os agentes continuam dependendo de prompts longos, frágeis e repetitivos.

Com ela, o fluxo passa a ser:

```text
Work Order → Context Retrieval → Agent Execution → Review → Delivery → Memory Update
```
