import { NextResponse } from "next/server"
import { searchContext } from "@/domains/context/server/service"
import type { ProductKey, SourceType } from "@/domains/context/types"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    organizationSlug?: string
    query?: string
    product_key?: ProductKey
    filters?: { source_type?: SourceType[]; screen_id?: string | null }
    limit?: number
  } | null
  if (!body || !body.organizationSlug || !body.product_key || !body.query) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  try {
    const result = await searchContext(
      {
        query: body.query,
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