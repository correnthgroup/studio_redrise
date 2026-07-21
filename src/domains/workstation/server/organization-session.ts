import { createSupabaseServerClient } from "@/lib/supabase-server"

import type { OrganizationRole } from "../spaces/types/space.types"

/**
 * Resolução autoritativa de sessão + organização (PRD-024 §6.1, Fase 1).
 *
 * O cliente nunca é autoridade de escopo: o slug da rota só vira
 * `organizationId` depois de validado contra membership ativa no banco,
 * sob RLS (o usuário só enxerga organizações das quais é membro aceito).
 */

export type OrganizationSession = {
  userId: string
  organizationId: string
  organizationSlug: string
  organizationName: string
  memberId: string
  organizationRole: OrganizationRole
  assignedSpaceIds: readonly string[]
}

export type OrganizationSessionResult =
  | { status: "ok"; session: OrganizationSession }
  | { status: "unauthenticated" }
  | { status: "not_member" }
  | { status: "unavailable" }

/**
 * Falha fechado (PRD-024 §9): banco/env indisponível resulta em
 * `unavailable`, nunca em fallback local mutável.
 */
export async function resolveOrganizationSession(organizationSlug: string): Promise<OrganizationSessionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { status: "unavailable" }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { status: "unauthenticated" }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id, slug, name, status")
    .eq("slug", organizationSlug)
    .maybeSingle()

  if (organizationError) return { status: "unavailable" }
  // RLS oculta organizações sem membership: ausência e não-membership são indistinguíveis por design.
  if (!organization || organization.status !== "active") return { status: "not_member" }

  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("id, role, status")
    .eq("organization_id", organization.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (memberError) return { status: "unavailable" }
  if (!member || member.status !== "accepted") return { status: "not_member" }

  const { data: spaceMembers, error: spaceMembersError } = await supabase
    .from("space_members")
    .select("space_id")
    .eq("organization_id", organization.id)
    .eq("member_id", member.id)

  if (spaceMembersError) return { status: "unavailable" }

  return {
    status: "ok",
    session: {
      userId: user.id,
      organizationId: organization.id,
      organizationSlug: organization.slug,
      organizationName: organization.name,
      memberId: member.id,
      organizationRole: member.role,
      assignedSpaceIds: (spaceMembers ?? []).map((row) => row.space_id),
    },
  }
}
