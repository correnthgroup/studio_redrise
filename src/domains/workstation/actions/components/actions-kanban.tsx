"use client"

import { AlertTriangleIcon, CopyIcon, ExternalLinkIcon, MoreHorizontalIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import type { ActionNodeRun, ActionStage } from "@/domains/workstation/actions/types/action.types"

const columns: Array<{ id: ActionStage; title: string; indicator: string; progress: number }> = [
  { id: "plan", title: "Plan", indicator: "bg-blue-500", progress: 25 },
  { id: "prepare", title: "Prepare", indicator: "bg-yellow-500", progress: 50 },
  { id: "execute", title: "Execute", indicator: "bg-purple-500", progress: 75 },
  { id: "result", title: "Result", indicator: "bg-green-500", progress: 100 },
]

function statusVariant(status: ActionNodeRun["status"]): "default" | "secondary" | "outline" | "destructive" {
  if (status === "failed") return "destructive"
  if (status === "completed") return "outline"
  if (status === "executing") return "default"
  return "secondary"
}

function getPreview(action: ActionNodeRun) {
  return action.errorMessage ?? action.resultSummary ?? action.executeSummary ?? action.prepareSummary ?? action.planSummary ?? "Waiting for runtime update."
}

export function ActionsKanban({
  actions,
  onViewDetails,
}: {
  actions: ActionNodeRun[]
  onViewDetails: (action: ActionNodeRun) => void
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {columns.map((column) => {
        const columnActions = actions.filter((action) => action.stage === column.id)

        return (
          <Card key={column.id} className="min-h-[360px]">
            <CardHeader className="gap-2 pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className={`size-2.5 rounded-full ${column.indicator}`} />
                  {column.title}
                </CardTitle>
                <Badge variant="secondary">{columnActions.length}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Runtime controls movement. Manual drag is disabled in MVP.</p>
            </CardHeader>
            <CardContent className="grid gap-3">
              {columnActions.length ? columnActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onViewDetails(action)}
                  className="rounded-xl border bg-background p-3 text-left shadow-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <p className="font-medium leading-5">{action.nodeTitle}</p>
                      <p className="text-xs text-muted-foreground">{action.processName} / {action.spaceName}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon" className="size-8" onClick={(event) => event.stopPropagation()} aria-label={`Open actions for ${action.nodeTitle}`} />}>
                        <MoreHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={(event) => { event.stopPropagation(); onViewDetails(action) }}>View details</DropdownMenuItem>
                        <DropdownMenuItem onClick={(event) => { event.stopPropagation(); toast("Open Process routes to the Process Canvas in this MVP.") }}>
                          <ExternalLinkIcon />
                          Open Process
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(event) => { event.stopPropagation(); navigator.clipboard?.writeText(getPreview(action)); toast.success("Summary copied.") }}>
                          <CopyIcon />
                          Copy summary
                        </DropdownMenuItem>
                        {action.status === "failed" ? <DropdownMenuSeparator /> : null}
                        {action.status === "failed" ? <DropdownMenuItem variant="destructive" onClick={(event) => { event.stopPropagation(); onViewDetails(action) }}>View error</DropdownMenuItem> : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">{action.nodeType}</Badge>
                    <Badge variant={statusVariant(action.status)}>{action.status}</Badge>
                  </div>
                  <Progress value={column.progress} className="mt-3 h-2" />
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {action.status === "failed" ? <AlertTriangleIcon className="mr-1 inline size-3" /> : null}
                    {getPreview(action)}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{action.modelName}</span>
                    <span>{action.duration}</span>
                  </div>
                </button>
              )) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No node runs in {column.title}.</div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
