"use client"

import { RotateCcwIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { actionProcesses, actionSpaces } from "@/domains/workstation/actions/data/mock-actions"
import type { ActionFilters } from "@/domains/workstation/actions/types/action.types"

export const defaultActionFilters: ActionFilters = {
  spaceId: "all",
  processId: "all",
  status: "all",
  dateRange: "all",
  search: "",
}

export function ActionsFilters({
  filters,
  onFiltersChange,
}: {
  filters: ActionFilters
  onFiltersChange: (filters: ActionFilters) => void
}) {
  function updateFilter(key: keyof ActionFilters, value: string) {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto] lg:items-center">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Search node, process or run..."
          className="pl-9"
        />
      </div>
      <Select value={filters.spaceId} onValueChange={(value) => updateFilter("spaceId", value ?? "all")}>
        <SelectTrigger className="w-full"><SelectValue placeholder="Space" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Spaces</SelectItem>
          {actionSpaces.map((space) => <SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.processId} onValueChange={(value) => updateFilter("processId", value ?? "all")}>
        <SelectTrigger className="w-full"><SelectValue placeholder="Process" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Processes</SelectItem>
          {actionProcesses.map((process) => <SelectItem key={process.id} value={process.id}>{process.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(value) => updateFilter("status", value ?? "all")}>
        <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="queued">Queued</SelectItem>
          <SelectItem value="planning">Planning</SelectItem>
          <SelectItem value="preparing">Preparing</SelectItem>
          <SelectItem value="executing">Executing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Select value={filters.dateRange} onValueChange={(value) => updateFilter("dateRange", value ?? "all")}>
          <SelectTrigger className="w-full lg:w-[132px]"><SelectValue placeholder="Date" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7d</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" size="icon" onClick={() => onFiltersChange(defaultActionFilters)} aria-label="Reset filters">
          <RotateCcwIcon />
        </Button>
      </div>
    </div>
  )
}
