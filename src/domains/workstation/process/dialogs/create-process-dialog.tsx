"use client"

import * as React from "react"
import { RouteIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { mockProcessOwners } from "@/domains/workstation/process/data/mock-processes"
import { createProcessSchema } from "@/domains/workstation/process/schemas/process.schemas"
import type { ProcessFrequency, RedRiseNodeType } from "@/domains/workstation/process/types/process.types"
import { nodeTypes, processFrequencies } from "@/domains/workstation/process/types/process.types"
import { mockSpaces } from "@/domains/workstation/spaces/data/mock-spaces"

export function CreateProcessDialog() {
  const [open, setOpen] = React.useState(false)
  const [spaceId, setSpaceId] = React.useState(mockSpaces[0]?.id ?? "")
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [frequency, setFrequency] = React.useState<ProcessFrequency>("manual")
  const [owner, setOwner] = React.useState(mockProcessOwners[0] ?? "")
  const [initialNodeType, setInitialNodeType] = React.useState<RedRiseNodeType>("llm")
  const [error, setError] = React.useState<string | null>(null)

  function reset() {
    setSpaceId(mockSpaces[0]?.id ?? "")
    setName("")
    setDescription("")
    setFrequency("manual")
    setOwner(mockProcessOwners[0] ?? "")
    setInitialNodeType("llm")
    setError(null)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) reset()
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = createProcessSchema.safeParse({
      spaceId,
      name,
      description,
      frequency,
      owner,
      initialNodeType,
    })

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Review the Process details."
      setError(message)
      toast.error(message)
      return
    }

    toast.success(`Process ${parsed.data.name} created.`, {
      description: "Mocked locally for WS-PROCESS. Persistence and RBAC come later.",
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" />}>New Process</DialogTrigger>
      <DialogContent className="gap-0 overflow-visible p-0 sm:max-w-2xl">
        <DialogHeader className="mb-0 border-b px-6 py-4">
          <DialogTitle>Create Process</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col-reverse md:flex-row">
            <div className="flex flex-col justify-between md:w-80 md:border-r">
              <div className="flex-1 grow">
                <div className="border-t p-6 md:border-none">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex shrink-0 items-center justify-center rounded-sm bg-muted p-3">
                      <RouteIcon className="size-5 text-foreground" aria-hidden />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-balance text-sm font-medium text-foreground">Process Starter</h3>
                      <p className="text-pretty text-sm text-muted-foreground">Configure the first operational flow.</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <h4 className="text-balance text-sm font-medium text-foreground">Description</h4>
                  <p className="text-pretty mt-1 text-sm leading-6 text-muted-foreground">
                    Processes connect nodes, triggers and reviewers inside a Space.
                  </p>
                  <h4 className="text-balance mt-6 text-sm font-medium text-foreground">MVP rule</h4>
                  <p className="text-pretty mt-1 text-sm leading-6 text-muted-foreground">
                    This creates a mocked Process shell with one initial node. Node runs and cost analytics stay outside this PRD.
                  </p>
                  {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
                </div>
              </div>
              <div className="flex items-center justify-between border-t p-4">
                <DialogClose render={<Button type="button" variant="ghost" />}>Cancel</DialogClose>
                <Button type="submit" size="sm">Create</Button>
              </div>
            </div>

            <div className="flex-1 space-y-6 p-6 md:px-6 md:pb-8 md:pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">1</div>
                  <Label htmlFor="process-space" className="text-sm font-medium text-foreground">Select Space</Label>
                </div>
                <Select value={spaceId} onValueChange={(value) => setSpaceId(value ?? "")}>
                  <SelectTrigger id="process-space" name="space" className="w-full">
                    <SelectValue placeholder="Select Space" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSpaces.map((space) => (
                      <SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">2</div>
                  <Label htmlFor="process-name" className="text-sm font-medium text-foreground">Process Identity</Label>
                </div>
                <Input id="process-name" name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Invoice Exception Review" />
                <Textarea id="process-description" name="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe what this Process coordinates." />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">3</div>
                  <Label htmlFor="process-frequency" className="text-sm font-medium text-foreground">Trigger & Owner</Label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select value={frequency} onValueChange={(value) => setFrequency((value ?? "manual") as ProcessFrequency)}>
                    <SelectTrigger id="process-frequency" name="frequency" className="w-full">
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {processFrequencies.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={owner} onValueChange={(value) => setOwner(value ?? "")}>
                    <SelectTrigger id="process-owner" name="owner" className="w-full">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProcessOwners.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">4</div>
                  <Label htmlFor="initial-node" className="text-sm font-medium text-foreground">Initial Node</Label>
                </div>
                <p className="text-pretty text-xs text-muted-foreground">Choose the first node type. Detailed node configuration happens in the canvas dialog.</p>
                <Select value={initialNodeType} onValueChange={(value) => setInitialNodeType((value ?? "llm") as RedRiseNodeType)}>
                  <SelectTrigger id="initial-node" name="initialNodeType" className="mt-4 w-full">
                    <SelectValue placeholder="Select node type" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeTypes.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
