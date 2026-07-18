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
import { MoreHorizontalIcon, RouteIcon } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTableColumnHeader } from "@/domains/workstation/components/data-table-column-header"
import { DataTablePagination } from "@/domains/workstation/components/data-table-pagination"
import { DataTableViewOptions } from "@/domains/workstation/components/data-table-view-options"
import type { ProcessStatus, RedRiseProcess } from "@/domains/workstation/process/types/process.types"

const statusVariant: Record<ProcessStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  paused: "outline",
  archived: "secondary",
}

const columnLabels: Record<string, string> = {
  name: "Process",
  spaceName: "Space",
  status: "Status",
  frequency: "Frequency",
  owner: "Owner",
  nodesCount: "Nodes",
  actionsCount: "Actions",
  lastRun: "Last run",
  updatedAt: "Updated",
}

function getColumns(organizationSlug: string): ColumnDef<RedRiseProcess>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label={`Select ${row.original.name}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Process" />,
      cell: ({ row }) => (
        <div className="grid gap-1">
          <span className="font-medium">{row.original.name}</span>
          <span className="max-w-[340px] truncate text-xs text-muted-foreground">{row.original.description}</span>
        </div>
      ),
    },
    {
      accessorKey: "spaceName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Space" />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>,
    },
    {
      accessorKey: "frequency",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trigger" />,
      cell: ({ row }) => <span className="capitalize">{row.original.frequency}</span>,
    },
    {
      accessorKey: "owner",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
    },
    {
      accessorKey: "nodesCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nodes" className="justify-end" />,
      cell: ({ row }) => <div className="text-right tabular-nums">{row.original.nodesCount}</div>,
    },
    {
      accessorKey: "actionsCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" className="justify-end" />,
      cell: ({ row }) => <div className="text-right tabular-nums">{row.original.actionsCount}</div>,
    },
    {
      accessorKey: "lastRun",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last run" />,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const process = row.original
        const canvasHref = `/${organizationSlug}/workstation/process/${process.id}/canvas`

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={`Open actions for ${process.name}`} />}>
                <MoreHorizontalIcon className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuItem render={<Link href={canvasHref} />}>
                  <RouteIcon />
                  Open canvas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast("Process details are mocked for this PRD.")}>View details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast("Edit will be wired with persistence and RBAC.")}>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => toast("Archive is blocked until Process persistence is implemented.")}>Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

export function ProcessTable({ processes, organizationSlug }: { processes: RedRiseProcess[]; organizationSlug: string }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const columns = React.useMemo(() => getColumns(organizationSlug), [organizationSlug])

  const table = useReactTable({
    data: processes,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
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
          <CardTitle>Process List</CardTitle>
          <CardDescription>Mocked processes with table-02 behavior and TanStack controls.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input
            placeholder="Filter processes..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="h-8 lg:max-w-xs"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:ml-auto">
            <Select
              value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
              onValueChange={(value) => table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value)}
            >
              <SelectTrigger className="h-8 w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <DataTableViewOptions table={table} labels={columnLabels} />
          </div>
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No Process found.
                  </TableCell>
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
