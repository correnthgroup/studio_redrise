"use client"

import { ActivityIcon, CopyIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { ActionNodeRun, ActionStage } from "@/domains/workstation/actions/types/action.types"

function JsonPreview({ value }: { value?: Record<string, unknown> }) {
  return (
    <pre className="max-h-40 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
      {JSON.stringify(value ?? {}, null, 2)}
    </pre>
  )
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid gap-1 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span>{value || "Not available"}</span>
    </div>
  )
}

function stageSummary(action: ActionNodeRun, stage: ActionStage) {
  if (stage === "plan") return action.planSummary
  if (stage === "prepare") return action.prepareSummary
  if (stage === "execute") return action.executeSummary
  return action.resultSummary
}

export function ActionDetailsDialog({
  action,
  open,
  onOpenChange,
}: {
  action: ActionNodeRun | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const resultText = action?.resultSummary ?? action?.errorMessage ?? "No result available yet."

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-visible p-0 sm:max-w-5xl">
        <DialogHeader className="mb-0 border-b px-6 py-4">
          <DialogTitle>Action Details</DialogTitle>
        </DialogHeader>

        {action ? (
          <div className="flex max-h-[78dvh] flex-col-reverse overflow-y-auto md:flex-row">
            <div className="flex flex-col justify-between md:w-80 md:border-r">
              <div className="flex-1 grow">
                <div className="border-t p-6 md:border-none">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex shrink-0 items-center justify-center rounded-sm bg-muted p-3">
                      <ActivityIcon className="size-5 text-foreground" aria-hidden />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-balance text-sm font-medium text-foreground">{action.nodeTitle}</h3>
                      <p className="text-pretty text-sm text-muted-foreground">{action.processName} / {action.spaceName}</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid gap-4">
                    <DetailRow label="Status" value={action.status} />
                    <DetailRow label="Trigger" value={action.triggerType} />
                    <DetailRow label="Model" value={action.modelName} />
                    <DetailRow label="Duration" value={action.duration} />
                  </div>
                  {action.errorMessage ? (
                    <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                      {action.errorMessage}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-between border-t p-4">
                <DialogClose render={<Button type="button" variant="ghost" />}>Close</DialogClose>
                <Button type="button" size="sm" onClick={() => { navigator.clipboard?.writeText(resultText); toast.success("Result copied.") }}>
                  <CopyIcon />
                  Copy result
                </Button>
              </div>
            </div>

            <div className="flex-1 space-y-5 p-6 md:px-6 md:pb-8 md:pt-6">
              <section className="grid gap-3 rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium">Overview</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{action.nodeType}</Badge>
                    <Badge variant={action.status === "failed" ? "destructive" : action.status === "completed" ? "outline" : "secondary"}>{action.status}</Badge>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <DetailRow label="Run ID" value={action.processRunId} />
                  <DetailRow label="Node Run ID" value={action.id} />
                  <DetailRow label="Triggered by" value={action.triggeredBy} />
                  <DetailRow label="Started at" value={action.startedAt} />
                  <DetailRow label="Completed at" value={action.completedAt} />
                  <DetailRow label="Failed stage" value={action.failedStage} />
                </div>
              </section>

              <section className="grid gap-3 rounded-xl border p-4">
                <h3 className="font-medium">Steps</h3>
                <div className="grid gap-3 md:grid-cols-4">
                  {(["plan", "prepare", "execute", "result"] as ActionStage[]).map((stage) => (
                    <div key={stage} className="grid gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                      <div className="font-medium capitalize">{stage}</div>
                      <div className="text-xs leading-5 text-muted-foreground">{stageSummary(action, stage) ?? "Waiting for runtime update."}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-3 rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium">Result</h3>
                  <Badge variant="outline">{action.outputType}</Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{resultText}</p>
                {action.errorMessage ? (
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <span className="font-medium">Suggested next action: </span>{action.suggestedNextAction}
                  </div>
                ) : null}
                <JsonPreview value={action.outputSnapshot} />
              </section>

              <section className="grid gap-3 rounded-xl border p-4">
                <h3 className="font-medium">Metadata</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <JsonPreview value={action.inputSnapshot} />
                  <JsonPreview value={action.metadata} />
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
