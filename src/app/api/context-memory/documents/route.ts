import { NextResponse } from "next/server"
import { listIndexedDocuments } from "@/domains/context/server/service"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const organizationSlug = url.searchParams.get("organizationSlug")
  if (!organizationSlug) {
    return NextResponse.json({ error: "organizationSlug required" }, { status: 400 })
  }
  try {
    const documents = await listIndexedDocuments({ workspaceId: organizationSlug })
    return NextResponse.json(documents)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}