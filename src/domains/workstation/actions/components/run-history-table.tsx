"use client"

import * as React from "react"
import Link from "next/link"
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { CopyIcon, ExternalLinkIcon, MoreHorizontalIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTableColumnHeader } from "@/domains/workstation/components/data-table-column-header"
import { DataTablePagination } from "@/domains/workstation/components/data-table-pagination"
import { DataTableViewOptions } from "@/domains/workstation/components/data-table-view-options"
import type { ActionNodeRun, ProcessRun, ProcessRunStatus } from "@/domains/workstation/actions/types/action.types"

const statusVariant: Record<ProcessRunStatus, "default" | "secondary" | "outline" | "destructive"> = {
  queued: "secondary",
  running: "default",
  completed: "outline",
  failed: "destructive",
  cancelled: "secondary",
}

const columnLabels: Record<string, string> = {
  id: "Run ID",
  processName: "Process",
  spaceName: "Space",
  triggerType: "Trigger",
  triggeredBy: "Started by",
  startedAt: "Started at",
  completedAt: "Completed at",
  duration: "Duration",
  status: "Status",
}

function getColumns({
  organizationSlug,
  onViewRun,
}: {
  organizationSlug: string
  onViewRun: (run: ProcessRun) => void
}): ColumnDef<ProcessRun>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))} aria-label="Select all runs" />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(Boolean(value))} aria-label={`Select ${row.original.id}`} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="Run ID" />, cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "processName", header: ({ column }) => <DataTableColumnHeader column={column} title="Process" /> },
    { accessorKey: "spaceName", header: ({ column }) => <DataTableColumnHeader column={column} title="Space" /> },
    { accessorKey: "triggerType", header: ({ column }) => <DataTableColumnHeader column={column} title="Trigger" />, cell: ({ row }) => <span className="capitalize">{row.original.triggerType}</span> },
    { accessorKey: "triggeredBy", header: ({ column }) => <DataTableColumnHeader column={column} title="Started by" /> },
    { accessorKey: "startedAt", header: ({ column }) => <DataTableColumnHeader column={column} title="Started at" /> },
    { accessorKey: "completedAt", header: ({ column }) => <DataTableColumnHeader column={column} title="Completed at" />, cell: ({ row }) => row.original.completedAt ?? "In progress" },
    { accessorKey: "duration", header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" /> },
    { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />, cell: ({ row }) => <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge> },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const run = row.original
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={`Open actions for ${run.id}`} />}>
                <MoreHorizontalIcon className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Run actions</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onViewRun(run)}>View Run</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast("Actions are already filtered by the active screen filters.")}>View Actions</DropdownMenuItem>
                <DropdownMenuItem render={<Link href={`/${organizationSlug}/workstation/process/${run.processId}/canvas`} />}>
                  <ExternalLinkIcon />
                  Open Process
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigator.clipboard?.writeText(run.id); toast.success("Run ID copied.") }}>
                  <CopyIcon />
                  Copy Run ID
                </DropdownMenuItem>
                {run.status === "failed" ? <DropdownMenuSeparator /> : null}
                {run.status === "failed" ? <DropdownMenuItem variant="destructive" onClick={() => onViewRun(run)}>View Error</DropdownMenuItem> : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

export function RunHistoryTable({
  runs,
  nodeRuns,
  organizationSlug,
  onViewAction,
}: {
  runs: ProcessRun[]
  nodeRuns: ActionNodeRun[]
  organizationSlug: string
  onViewAction: (action: ActionNodeRun) => void
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns = React.useMemo(() => getColumns({
    organizationSlug,
    onViewRun: (run) => {
      const relatedAction = nodeRuns.find((action) => action.processRunId === run.id && (action.status === "failed" || action.stage === "result")) ?? nodeRuns.find((action) => action.processRunId === run.id)
      if (relatedAction) onViewAction(relatedAction)
    },
  }), [nodeRuns, onViewAction, organizationSlug])

  const table = useReactTable({
    data: runs,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: 5 } },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Card>
      <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-1.5">
          <CardTitle>Run History</CardTitle>
          <CardDescription>Process-level executions with row actions and reusable table controls.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Filter run IDs..."
            value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("id")?.setFilterValue(event.target.value)}
            className="h-8 md:max-w-xs"
          />
          <DataTableViewOptions table={table} labels={columnLabels} />
        </div>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">No runs found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </CardContent>
    </Card>
  )
}
