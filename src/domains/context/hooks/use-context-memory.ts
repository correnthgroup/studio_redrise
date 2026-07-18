"use client"

import * as React from "react"

import type {
  DocumentChunkRow,
  DocumentRow,
  EntityRow,
  ProductKey,
  RelationRow,
  SourceType,
} from "../types"
import type { IndexedDocumentSummary } from "../server/service"

export interface UseContextMemoryArgs {
  organizationSlug: string
}

export interface ContextMemoryStats {
  documentCount: number
  chunkCount: number
  entityCount: number
  relationCount: number
}

export interface SearchResultRow {
  chunk_id: string
  document_id: string
  title: string
  heading_path: string
  content: string
  combined_score: number
  vector_score: number
  text_score: number
  metadata_boost: number
  metadata: Record<string, unknown>
}

export interface ContextPackDraft {
  objective: string
  product_key: ProductKey
  screen_id: string
  domain_key: string
  token_budget: number
}

export interface ContextPackResult {
  context_pack: string
  selected_chunk_ids: string[]
  token_estimate: number
  compression_strategy: string
  query_id: string | null
}

export interface ContextMemoryApi {
  listIndexedDocuments(): Promise<IndexedDocumentSummary[]>
  listChunks(documentId: string): Promise<DocumentChunkRow[]>
  search(input: {
    query: string
    product_key: ProductKey
    filters?: { source_type?: SourceType[]; screen_id?: string | null }
    limit?: number
  }): Promise<SearchResultRow[]>
  buildPack(input: ContextPackDraft): Promise<ContextPackResult>
  listEntities(): Promise<EntityRow[]>
  listRelations(): Promise<RelationRow[]>
  reindexDocument(documentId: string): Promise<{ ok: true }>
  archiveDocument(documentId: string): Promise<{ ok: true }>
}

export interface ContextMemoryState extends ContextMemoryApi {
  organizationSlug: string
  stats: ContextMemoryStats
  refresh(): Promise<void>
  refreshStats(): Promise<void>
}

const EMPTY_STATS: ContextMemoryStats = {
  documentCount: 0,
  chunkCount: 0,
  entityCount: 0,
  relationCount: 0,
}

const API_ENDPOINT = "/api/context-memory"

export function useContextMemory(args: UseContextMemoryArgs): ContextMemoryState {
  const [stats, setStats] = React.useState<ContextMemoryStats>(EMPTY_STATS)

  const refreshStats = React.useCallback(async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINT}/stats?organizationSlug=${encodeURIComponent(args.organizationSlug)}`,
      )
      if (!response.ok) throw new Error(`stats ${response.status}`)
      const payload = (await response.json()) as ContextMemoryStats
      setStats(payload)
    } catch {
      setStats(EMPTY_STATS)
    }
  }, [args.organizationSlug])

  React.useEffect(() => {
    void refreshStats()
  }, [refreshStats])

  const refresh = refreshStats

  const api: ContextMemoryApi = React.useMemo(
    () => ({
      async listIndexedDocuments() {
        const response = await fetch(
          `${API_ENDPOINT}/documents?organizationSlug=${encodeURIComponent(args.organizationSlug)}`,
        )
        if (!response.ok) throw new Error(`documents ${response.status}`)
        return (await response.json()) as IndexedDocumentSummary[]
      },
      async listChunks(documentId) {
        const response = await fetch(
          `${API_ENDPOINT}/documents/${documentId}/chunks?organizationSlug=${encodeURIComponent(args.organizationSlug)}`,
        )
        if (!response.ok) throw new Error(`chunks ${response.status}`)
        return (await response.json()) as DocumentChunkRow[]
      },
      async search(input) {
        const response = await fetch(`${API_ENDPOINT}/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationSlug: args.organizationSlug,
            ...input,
          }),
        })
        if (!response.ok) throw new Error(`search ${response.status}`)
        const payload = (await response.json()) as { results: SearchResultRow[] }
        return payload.results
      },
      async buildPack(input) {
        const response = await fetch(`${API_ENDPOINT}/packs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationSlug: args.organizationSlug,
            ...input,
          }),
        })
        if (!response.ok) throw new Error(`packs ${response.status}`)
        return (await response.json()) as ContextPackResult
      },
      async listEntities() {
        const response = await fetch(
          `${API_ENDPOINT}/entities?organizationSlug=${encodeURIComponent(args.organizationSlug)}`,
        )
        if (!response.ok) throw new Error(`entities ${response.status}`)
        return (await response.json()) as EntityRow[]
      },
      async listRelations() {
        const response = await fetch(
          `${API_ENDPOINT}/relations?organizationSlug=${encodeURIComponent(args.organizationSlug)}`,
        )
        if (!response.ok) throw new Error(`relations ${response.status}`)
        return (await response.json()) as RelationRow[]
      },
      async reindexDocument(documentId) {
        const response = await fetch(
          `${API_ENDPOINT}/documents/${documentId}/reindex`,
          { method: "POST" },
        )
        if (!response.ok) throw new Error(`reindex ${response.status}`)
        return { ok: true }
      },
      async archiveDocument(documentId) {
        const response = await fetch(
          `${API_ENDPOINT}/documents/${documentId}/archive`,
          { method: "POST" },
        )
        if (!response.ok) throw new Error(`archive ${response.status}`)
        return { ok: true }
      },
    }),
    [args.organizationSlug],
  )

  return {
    organizationSlug: args.organizationSlug,
    stats,
    refresh,
    refreshStats,
    ...api,
  }
}

export type { DocumentRow }