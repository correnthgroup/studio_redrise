"use client"

import type { ReactNode } from "react"

import { AppBreadcrumb } from "@/components/layout/app-breadcrumb"
import { AppSidebar } from "@/components/layout/app-sidebar"
import type { ActiveOrganization } from "@/components/layout/organization-switcher"
import {
  WorkstationProvider,
  type WorkstationProviderProps,
} from "@/domains/workstation/core/workstation-provider"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type AppShellProps = {
  children: ReactNode
  organizationSlug: string
  organizationName?: string
  workstationMode?: WorkstationProviderProps["mode"]
  initialDurable?: WorkstationProviderProps["initialDurable"]
}

export function AppShell({
  children,
  organizationSlug,
  organizationName,
  workstationMode = "memory",
  initialDurable,
}: AppShellProps) {
  const activeOrganization: ActiveOrganization = {
    name: organizationName ?? "My Business",
    slug: organizationSlug,
    plan: "Free",
    role: "Owner",
  }

  return (
    <WorkstationProvider
      organizationSlug={organizationSlug}
      mode={workstationMode}
      initialDurable={initialDurable}
    >
      <SidebarProvider>
        <AppSidebar organizationSlug={organizationSlug} activeOrganization={activeOrganization} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-3 px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <AppBreadcrumb />
          </header>
          <main className="flex flex-1 flex-col gap-6 px-4 pb-8 md:px-6 lg:px-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </WorkstationProvider>
  )
}
