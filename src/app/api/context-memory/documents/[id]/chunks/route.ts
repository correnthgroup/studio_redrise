import { NextResponse } from "next/server"
import { listDocumentChunks } from "@/domains/context/server/service"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const url = new URL(request.url)
  const organizationSlug = url.searchParams.get("organizationSlug")
  if (!organizationSlug) {
    return NextResponse.json({ error: "organizationSlug required" }, { status: 400 })
  }
  const { id } = await context.params
  try {
    const chunks = await listDocumentChunks(id, { workspaceId: organizationSlug })
    return NextResponse.json(chunks)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}