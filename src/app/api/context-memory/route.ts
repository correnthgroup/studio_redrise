import { NextResponse } from "next/server"
import {
  buildContextPack,
  listEntities,
  listIndexedDocuments,
  listRelations,
  searchContext,
} from "@/domains/context/server/service"
import type {
  ProductKey,
  SourceType,
} from "@/domains/context/types"

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function resolveWorkspace(value: string | null): string {
  if (!value) {
    throw new Error("workspaceId is required")
  }
  return value
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const organizationSlug = url.searchParams.get("organizationSlug")
  const workspaceId = resolveWorkspace(organizationSlug)
  try {
    const [documents, entities, relations] = await Promise.all([
      listIndexedDocuments({ workspaceId }),
      listEntities({ workspaceId }),
      listRelations({ workspaceId }),
    ])
    const chunkCount = documents.reduce((acc, d) => acc + d.chunk_count, 0)
    return NextResponse.json({
      documentCount: documents.length,
      chunkCount,
      entityCount: entities.length,
      relationCount: relations.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    organizationSlug?: string
    query?: string
    product_key?: ProductKey
    filters?: { source_type?: SourceType[]; screen_id?: string | null }
    limit?: number
    objective?: string
    screen_id?: string
    domain_key?: string
    token_budget?: number
  } | null
  if (!body) return badRequest("Invalid JSON body")
  if (!body.organizationSlug) return badRequest("organizationSlug is required")
  if (!body.product_key) return badRequest("product_key is required")
  if (!body.query && !body.objective) {
    return badRequest("query or objective is required")
  }
  try {
    if (body.objective) {
      const pack = await buildContextPack(
        {
          objective: body.objective,
          product_key: body.product_key,
          screen_id: body.screen_id ?? null,
          domain_key: body.domain_key ?? null,
          token_budget: body.token_budget ?? 8000,
        },
        { workspaceId: body.organizationSlug },
      )
      return NextResponse.json(pack)
    }
    const result = await searchContext(
      {
        query: body.query!,
        product_key: body.product_key,
        filters: body.filters,
        limit: body.limit ?? 20,
      },
      { workspaceId: body.organizationSlug },
    )
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}