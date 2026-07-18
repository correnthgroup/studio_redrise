import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { resolveWorkspaceId } from "@/domains/context/client"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const url = new URL(request.url)
  const organizationSlug = url.searchParams.get("organizationSlug")
  if (!organizationSlug) {
    return NextResponse.json({ error: "organizationSlug required" }, { status: 400 })
  }
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
  }
  const { id } = await context.params
  try {
    const { error } = await supabase
      .from("documents")
      .update({
        status: "pending",
        indexed_at: null,
      })
      .eq("id", id)
      .eq("workspace_id", resolveWorkspaceId(organizationSlug))
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}