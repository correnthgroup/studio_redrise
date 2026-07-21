import { notFound, redirect } from "next/navigation"
import type { ReactNode } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { loadWorkstationSnapshot } from "@/domains/workstation/server/load-snapshot"
import { resolveOrganizationSession } from "@/domains/workstation/server/organization-session"
import { isWorkstationDurableEnabledForOrganization } from "@/lib/flags"
import { createSupabaseServerClient } from "@/lib/supabase-server"

type OrganizationLayoutProps = {
  children: ReactNode
  params: Promise<{ organizationSlug: string }>
}

export default async function OrganizationLayout({ children, params }: OrganizationLayoutProps) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) redirect("/sign-in")

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { organizationSlug } = await params
  const durable = isWorkstationDurableEnabledForOrganization(organizationSlug)

  if (!durable) {
    return <AppShell organizationSlug={organizationSlug} workstationMode="memory">{children}</AppShell>
  }

  const result = await resolveOrganizationSession(organizationSlug)
  if (result.status === "unauthenticated") redirect("/sign-in")
  if (result.status === "not_member") notFound()
  if (result.status === "unavailable") {
    throw new Error("Workstation durable backend is unavailable; failing closed by policy (PRD-024).")
  }

  const loaded = await loadWorkstationSnapshot(result.session)
  if (!loaded) {
    throw new Error("Failed to load durable workstation snapshot; failing closed by policy (PRD-024).")
  }

  return (
    <AppShell
      organizationSlug={organizationSlug}
      organizationName={result.session.organizationName}
      workstationMode="durable"
      initialDurable={loaded}
    >
      {children}
    </AppShell>
  )
}
