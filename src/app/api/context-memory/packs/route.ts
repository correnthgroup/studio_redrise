import { NextResponse } from "next/server"
import { buildContextPack } from "@/domains/context/server/service"
import type { ProductKey } from "@/domains/context/types"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    organizationSlug?: string
    objective?: string
    product_key?: ProductKey
    screen_id?: string | null
    domain_key?: string | null
    token_budget?: number
  } | null
  if (!body || !body.organizationSlug || !body.product_key || !body.objective) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  try {
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
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}