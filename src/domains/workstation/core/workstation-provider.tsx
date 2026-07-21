"use client"

import * as React from "react"

import {
  FixtureAuthorizationPolicy,
  InMemoryWorkstationAdapter,
  type AuthorizationPolicy,
  type ExecutionRuntime,
  type WorkstationCapability,
  type WorkstationRepository,
  type WorkstationSnapshot,
} from "@/domains/workstation/core/workstation"
import { SupabaseWorkstationAdapter } from "@/domains/workstation/core/supabase-workstation-adapter"
import type { EntityRevisions } from "@/domains/workstation/server/project-snapshot"

interface WorkstationContextValue {
  repository: WorkstationRepository
  runtime: ExecutionRuntime
  authorization: AuthorizationPolicy
  snapshot: WorkstationSnapshot
  mode: "memory" | "durable"
  can(capability: WorkstationCapability, spaceId?: string): boolean
}

const WorkstationContext = React.createContext<WorkstationContextValue | null>(null)

export type WorkstationProviderProps = {
  children: React.ReactNode
  organizationSlug: string
  mode?: "memory" | "durable"
  initialDurable?: {
    snapshot: WorkstationSnapshot
    revisions: EntityRevisions
  }
}

export function WorkstationProvider({
  children,
  organizationSlug,
  mode = "memory",
  initialDurable,
}: WorkstationProviderProps) {
  const [adapter] = React.useState(() => {
    if (mode === "durable") {
      if (!initialDurable) {
        throw new Error("Durable WorkstationProvider requires initialDurable snapshot.")
      }
      return new SupabaseWorkstationAdapter(organizationSlug, initialDurable)
    }
    return new InMemoryWorkstationAdapter({ organizationId: organizationSlug })
  })

  const snapshot = React.useSyncExternalStore(
    adapter.subscribe.bind(adapter),
    adapter.getSnapshot.bind(adapter),
    adapter.getSnapshot.bind(adapter),
  )

  const assignedSpaces = React.useMemo(
    () =>
      new Set(
        snapshot.spaces
          .filter((space) => space.members.some((member) => member.memberId === snapshot.currentUser.id))
          .map((space) => space.id),
      ),
    [snapshot],
  )

  const authorization = React.useMemo(
    () => new FixtureAuthorizationPolicy(snapshot.currentUser.organizationRole, assignedSpaces),
    [snapshot.currentUser.organizationRole, assignedSpaces],
  )

  const value = React.useMemo<WorkstationContextValue>(
    () => ({
      repository: adapter,
      runtime: adapter,
      authorization,
      snapshot,
      mode,
      can: authorization.can.bind(authorization),
    }),
    [adapter, authorization, mode, snapshot],
  )

  return <WorkstationContext.Provider value={value}>{children}</WorkstationContext.Provider>
}

export function useWorkstation() {
  const context = React.useContext(WorkstationContext)
  if (!context) throw new Error("useWorkstation must be used within WorkstationProvider")
  return context
}
