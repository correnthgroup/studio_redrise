"use client"

import * as React from "react"
import { RefreshCcwIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ActionDetailsDialog } from "@/domains/workstation/actions/components/action-details-dialog"
import { ActionsFilters, defaultActionFilters } from "@/domains/workstation/actions/components/actions-filters"
import { ActionsKanban } from "@/domains/workstation/actions/components/actions-kanban"
import { RunHistoryTable } from "@/domains/workstation/actions/components/run-history-table"
import {
  filterActions,
  filterProcessRuns,
  mockActionNodeRuns,
  mockProcessRuns,
} from "@/domains/workstation/actions/data/mock-actions"
import type { ActionFilters, ActionNodeRun } from "@/domains/workstation/actions/types/action.types"

export function ActionsPage({ organizationSlug }: { organizationSlug: string }) {
  const [filters, setFilters] = React.useState<ActionFilters>(defaultActionFilters)
  const [selectedAction, setSelectedAction] = React.useState<ActionNodeRun | null>(null)
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [lastUpdated, setLastUpdated] = React.useState("Just now")

  const filteredActions = React.useMemo(() => filterActions(mockActionNodeRuns, filters), [filters])
  const filteredRuns = React.useMemo(() => filterProcessRuns(mockProcessRuns, mockActionNodeRuns, filters), [filters])

  const handleViewDetails = React.useCallback((action: ActionNodeRun) => {
    setSelectedAction(action)
    setDetailsOpen(true)
  }, [])

  function handleRefresh() {
    setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    toast.success("Actions refreshed.", {
      description: "Realtime wiring is mocked in this PRD; manual refresh updates the timestamp only.",
    })
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">WS-ACTIONS</p>
          <h1 className="text-3xl font-semibold tracking-tight">Actions</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Monitor node execution, review results and inspect process runs in real time.
          </p>
          <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
        <Button type="button" variant="outline" onClick={handleRefresh}>
          <RefreshCcwIcon />
          Refresh
        </Button>
      </div>

      <ActionsFilters filters={filters} onFiltersChange={setFilters} />
      <ActionsKanban actions={filteredActions} onViewDetails={handleViewDetails} />
      <RunHistoryTable runs={filteredRuns} nodeRuns={filteredActions} organizationSlug={organizationSlug} onViewAction={handleViewDetails} />
      <ActionDetailsDialog action={selectedAction} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </section>
  )
}
