import { projectWorkstationSnapshot, type EntityRevisions } from "@/domains/workstation/server/project-snapshot"
import type { WorkstationSnapshot } from "@/domains/workstation/core/workstation"
import { createSupabaseServerClient } from "@/lib/supabase-server"

import type { OrganizationSession } from "./organization-session"

export type LoadedWorkstationSnapshot = {
  snapshot: WorkstationSnapshot
  revisions: EntityRevisions
}

export async function loadWorkstationSnapshot(session: OrganizationSession): Promise<LoadedWorkstationSnapshot | null> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const orgId = session.organizationId

  const [
    membersResult,
    spacesResult,
    spaceMembersResult,
    processesResult,
    nodesResult,
    connectionsResult,
    processRunsResult,
    nodeRunsResult,
  ] = await Promise.all([
    supabase.from("organization_members").select("*").eq("organization_id", orgId).order("created_at", { ascending: true }),
    supabase.from("spaces").select("*").eq("organization_id", orgId).order("updated_at", { ascending: false }),
    supabase.from("space_members").select("*").eq("organization_id", orgId),
    supabase.from("processes").select("*").eq("organization_id", orgId).order("updated_at", { ascending: false }),
    supabase.from("process_nodes").select("*").eq("organization_id", orgId),
    supabase.from("node_connections").select("*").eq("organization_id", orgId),
    supabase.from("process_runs").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(200),
    supabase.from("node_runs").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(500),
  ])

  const firstError =
    membersResult.error ||
    spacesResult.error ||
    spaceMembersResult.error ||
    processesResult.error ||
    nodesResult.error ||
    connectionsResult.error ||
    processRunsResult.error ||
    nodeRunsResult.error

  if (firstError) return null

  return projectWorkstationSnapshot({
    organizationId: orgId,
    currentUserId: session.userId,
    members: membersResult.data ?? [],
    spaces: spacesResult.data ?? [],
    spaceMembers: spaceMembersResult.data ?? [],
    processes: processesResult.data ?? [],
    nodes: nodesResult.data ?? [],
    connections: connectionsResult.data ?? [],
    processRuns: processRunsResult.data ?? [],
    nodeRuns: nodeRunsResult.data ?? [],
  })
}
