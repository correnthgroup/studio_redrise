"use client"

import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { RedRiseNode } from "@/domains/workstation/process/types/process.types"

function JsonPreview({ value }: { value?: Record<string, unknown> }) {
  return (
    <pre className="max-h-32 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
      {JSON.stringify(value ?? {}, null, 2)}
    </pre>
  )
}

export function ProcessNodeConfigDialog({
  node,
  open,
  onOpenChange,
}: {
  node: RedRiseNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{node ? `Configure ${node.title}` : "Configure Node"}</DialogTitle>
        </DialogHeader>
        {node ? (
          <div className="grid max-h-[70dvh] gap-4 overflow-y-auto pr-1 md:grid-cols-2">
            <section className="grid gap-3 rounded-xl border p-4">
              <div>
                <h3 className="font-medium">Identity</h3>
                <p className="text-xs text-muted-foreground">Core node identity and ownership.</p>
              </div>
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input defaultValue={node.title} />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea defaultValue={node.description} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">{node.nodeType}</Badge>
                <Badge variant={node.enabled ? "default" : "secondary"}>{node.enabled ? "enabled" : "disabled"}</Badge>
              </div>
            </section>

            <section className="grid gap-3 rounded-xl border p-4">
              <div>
                <h3 className="font-medium">Instruction</h3>
                <p className="text-xs text-muted-foreground">Prompt or execution directive.</p>
              </div>
              <Textarea defaultValue={node.instruction} className="min-h-32" />
            </section>

            <section className="grid gap-3 rounded-xl border p-4">
              <div>
                <h3 className="font-medium">Input</h3>
                <p className="text-xs text-muted-foreground">Input mode and mapping contract.</p>
              </div>
              <div className="grid gap-2">
                <Label>Input mode</Label>
                <Input defaultValue={node.inputMode} />
              </div>
              <JsonPreview value={node.inputMapping} />
            </section>

            <section className="grid gap-3 rounded-xl border p-4">
              <div>
                <h3 className="font-medium">Tool/Execution</h3>
                <p className="text-xs text-muted-foreground">Node-specific config. Runtime execution is outside this MVP.</p>
              </div>
              <JsonPreview value={node.config} />
            </section>

            <section className="grid gap-3 rounded-xl border p-4">
              <div>
                <h3 className="font-medium">Output</h3>
                <p className="text-xs text-muted-foreground">Expected output type and contract.</p>
              </div>
              <div className="grid gap-2">
                <Label>Output type</Label>
                <Input defaultValue={node.outputType} />
              </div>
              <JsonPreview value={node.outputContract} />
            </section>

            <section className="grid gap-3 rounded-xl border p-4">
              <div>
                <h3 className="font-medium">Error Handling</h3>
                <p className="text-xs text-muted-foreground">Failure path behavior for node connections.</p>
              </div>
              <Input defaultValue={node.failureBehavior} />
            </section>

            <section className="grid gap-3 rounded-xl border p-4 md:col-span-2">
              <div>
                <h3 className="font-medium">Review</h3>
                <p className="text-xs text-muted-foreground">Audit fields kept for future persistence.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="grid gap-1 text-xs"><span className="text-muted-foreground">Created by</span><span>{node.createdBy}</span></div>
                <div className="grid gap-1 text-xs"><span className="text-muted-foreground">Updated by</span><span>{node.updatedBy}</span></div>
                <div className="grid gap-1 text-xs"><span className="text-muted-foreground">Created</span><span>{node.createdAt}</span></div>
                <div className="grid gap-1 text-xs"><span className="text-muted-foreground">Updated</span><span>{node.updatedAt}</span></div>
              </div>
            </section>

            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="button" onClick={() => {
                toast.success("Node configuration saved locally.", { description: "Persistence will be wired in a later PRD." })
                onOpenChange(false)
              }}>Save changes</Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
