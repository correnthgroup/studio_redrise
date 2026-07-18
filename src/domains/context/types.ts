export const PRODUCT_KEYS = [
  "redrise",
  "redscale",
  "redrose",
  "findfee",
  "adgency",
  "correnth",
] as const;

export type ProductKey = (typeof PRODUCT_KEYS)[number];

export const SOURCE_TYPES = [
  "markdown",
  "conversation_decision",
  "architecture_doc",
  "prd",
  "roadmap",
  "ui_spec",
  "code_file",
  "external_reference",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const DOCUMENT_STATUSES = [
  "pending",
  "indexing",
  "indexed",
  "failed",
  "archived",
] as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const SUMMARY_TYPES = [
  "document",
  "section",
  "decision",
  "implementation",
  "agent_context",
] as const;

export type SummaryType = (typeof SUMMARY_TYPES)[number];

export const ENTITY_TYPES = [
  "product",
  "screen_id",
  "domain",
  "role",
  "component",
  "table",
  "workflow",
  "agent",
  "integration",
  "concept",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export const RELATION_TYPES = [
  "defines",
  "uses",
  "depends_on",
  "implements",
  "replaces",
  "references",
  "belongs_to",
  "blocks",
  "unblocks",
] as const;

export type RelationType = (typeof RELATION_TYPES)[number];

export const CONSUMER_TYPES = [
  "human",
  "agent",
  "cli",
  "mcp",
  "system",
] as const;

export type ConsumerType = (typeof CONSUMER_TYPES)[number];

export const COMPRESSION_STRATEGIES = [
  "default",
  "aggressive",
  "minimal",
] as const;

export type CompressionStrategy = (typeof COMPRESSION_STRATEGIES)[number];

export interface DocumentRow {
  id: string;
  workspace_id: string;
  organization_id: string;
  product_key: ProductKey;
  source_type: SourceType;
  source_uri: string;
  title: string;
  slug: string;
  content_hash: string;
  status: DocumentStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  indexed_at: string | null;
}

export interface DocumentChunkRow {
  id: string;
  document_id: string;
  workspace_id: string;
  organization_id: string;
  product_key: ProductKey;
  chunk_index: number;
  heading_path: string;
  content: string;
  content_tokens: number;
  content_hash: string;
  embedding: number[] | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DocumentSummaryRow {
  id: string;
  document_id: string;
  workspace_id: string;
  organization_id: string;
  product_key: ProductKey;
  summary_type: SummaryType;
  summary: string;
  model_used: string;
  created_at: string;
  updated_at: string;
}

export interface EntityRow {
  id: string;
  workspace_id: string;
  organization_id: string;
  product_key: ProductKey;
  entity_type: EntityType;
  name: string;
  canonical_name: string;
  description: string;
  aliases: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RelationRow {
  id: string;
  workspace_id: string;
  organization_id: string;
  product_key: ProductKey;
  source_entity_id: string;
  target_entity_id: string;
  relation_type: RelationType;
  evidence_chunk_id: string | null;
  confidence: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ContextQueryRow {
  id: string;
  workspace_id: string;
  organization_id: string;
  product_key: ProductKey;
  query: string;
  filters: Record<string, unknown>;
  requested_by: string;
  consumer_type: ConsumerType;
  result_count: number;
  created_at: string;
}

export interface ContextPackRow {
  id: string;
  workspace_id: string;
  organization_id: string;
  product_key: ProductKey;
  query_id: string | null;
  work_order_id: string | null;
  context_pack: string;
  selected_chunk_ids: string[];
  compression_strategy: CompressionStrategy;
  token_estimate: number;
  created_at: string;
}

export interface HybridSearchFilters {
  source_type?: SourceType[];
  screen_id?: string | null;
  entity_types?: EntityType[];
}

export interface HybridSearchInput {
  query: string;
  product_key: ProductKey;
  filters?: HybridSearchFilters;
  limit?: number;
}

export interface HybridSearchResultItem {
  document_id: string;
  chunk_id: string;
  title: string;
  heading_path: string;
  content: string;
  vector_score: number;
  text_score: number;
  metadata_boost: number;
  combined_score: number;
  metadata: Record<string, unknown>;
}

export interface HybridSearchResult {
  query: string;
  results: HybridSearchResultItem[];
}

export interface ContextPackInput {
  objective: string;
  product_key: ProductKey;
  screen_id?: string | null;
  domain_key?: string | null;
  token_budget?: number;
}

export interface ContextPackOutput {
  query_id: string | null;
  context_pack: string;
  selected_chunk_ids: string[];
  token_estimate: number;
  compression_strategy: CompressionStrategy;
}