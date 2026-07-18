"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { RedRiseNode } from "@/domains/workstation/process/types/process.types"

const jsonText = z.string().refine((value) => { try { JSON.parse(value); return true } catch { return false } }, "Enter valid JSON.")
const nodeFormSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string(),
  instruction: z.string().trim().min(3),
  inputMode: z.string().trim().min(1),
  inputMapping: jsonText,
  config: jsonText,
  outputType: z.string().trim().min(1),
  outputContract: jsonText,
  failureBehavior: z.string().trim().min(1),
  enabled: z.boolean(),
})
type NodeForm = z.infer<typeof nodeFormSchema>

function values(node: RedRiseNode): NodeForm {
  return {
    title: node.title,
    description: node.description ?? "",
    instruction: node.instruction,
    inputMode: node.inputMode,
    inputMapping: JSON.stringify(node.inputMapping, null, 2),
    config: JSON.stringify(node.config, null, 2),
    outputType: node.outputType,
    outputContract: JSON.stringify(node.outputContract, null, 2),
    failureBehavior: node.failureBehavior,
    enabled: node.enabled,
  }
}

export function ProcessNodeConfigDialog({ node, open, onOpenChange, onSave }: { node: RedRiseNode | null; open: boolean; onOpenChange: (open: boolean) => void; onSave: (nodeId: string, patch: Partial<RedRiseNode>) => Promise<void> }) {
  const form = useForm<NodeForm>({ resolver: zodResolver(nodeFormSchema), values: node ? values(node) : undefined })

  async function submit(input: NodeForm) {
    if (!node) return
    try {
      await onSave(node.id, {
        title: input.title,
        description: input.description,
        instruction: input.instruction,
        inputMode: input.inputMode as RedRiseNode["inputMode"],
        inputMapping: JSON.parse(input.inputMapping) as Record<string, unknown>,
        config: JSON.parse(input.config) as Record<string, unknown>,
        outputType: input.outputType as RedRiseNode["outputType"],
        outputContract: JSON.parse(input.outputContract) as Record<string, unknown>,
        failureBehavior: input.failureBehavior as RedRiseNode["failureBehavior"],
        enabled: input.enabled,
      })
      toast.success("Node configuration saved in memory.")
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save Node.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader><DialogTitle>{node ? "Configure " + node.title : "Configure Node"}</DialogTitle></DialogHeader>
        {node ? <form className="grid max-h-[72dvh] gap-4 overflow-y-auto pr-1 md:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
          <section className="grid gap-3 rounded-xl border p-4">
            <h3 className="font-medium">Identity</h3>
            <Label>Title</Label><Input {...form.register("title")} />
            <Label>Description</Label><Textarea {...form.register("description")} />
            <div className="flex gap-2"><Badge variant="outline">{node.nodeType}</Badge><label className="flex items-center gap-2 text-sm"><Checkbox checked={form.watch("enabled")} onCheckedChange={(value) => form.setValue("enabled", Boolean(value))} />Enabled</label></div>
          </section>
          <section className="grid gap-3 rounded-xl border p-4"><h3 className="font-medium">Instruction</h3><Textarea {...form.register("instruction")} className="min-h-32" /></section>
          <section className="grid gap-3 rounded-xl border p-4"><h3 className="font-medium">Input</h3><Label>Mode</Label><Input {...form.register("inputMode")} /><Label>Mapping JSON</Label><Textarea {...form.register("inputMapping")} className="font-mono text-xs" /></section>
          <section className="grid gap-3 rounded-xl border p-4"><Label htmlFor="node-execution-config">Execution config JSON</Label><Textarea id="node-execution-config" {...form.register("config")} className="min-h-36 font-mono text-xs" /><p className="text-xs text-muted-foreground">Set simulateFailure to true to exercise retry.</p></section>
          <section className="grid gap-3 rounded-xl border p-4"><h3 className="font-medium">Output</h3><Label>Type</Label><Input {...form.register("outputType")} /><Label>Contract JSON</Label><Textarea {...form.register("outputContract")} className="font-mono text-xs" /></section>
          <section className="grid gap-3 rounded-xl border p-4"><h3 className="font-medium">Error handling</h3><Label>Behavior</Label><Input {...form.register("failureBehavior")} /></section>
          <div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit">Save changes</Button></div>
        </form> : null}
      </DialogContent>
    </Dialog>
  )
}
