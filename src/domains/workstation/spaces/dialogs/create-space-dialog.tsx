"use client"

import * as React from "react"
import { Layers3Icon } from "lucide-react"
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
import { acceptedOrganizationMembers } from "@/domains/workstation/spaces/data/mock-spaces"
import { createSpaceSchema } from "@/domains/workstation/spaces/schemas/space.schemas"
import { spaceRoles, type SpaceRole } from "@/domains/workstation/spaces/types/space.types"

type WizardMember = {
  memberId: string
  role: SpaceRole | ""
}

export function CreateSpaceDialog() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [members, setMembers] = React.useState<WizardMember[]>([{ memberId: "", role: "" }])
  const [error, setError] = React.useState<string | null>(null)

  function reset() {
    setName("")
    setDescription("")
    setMembers([{ memberId: "", role: "" }])
    setError(null)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) reset()
  }

  function validMembers() {
    return members.filter((member) => member.memberId && member.role) as Array<{ memberId: string; role: SpaceRole }>
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = createSpaceSchema.safeParse({ name, description, members: validMembers() })

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Review the Space details."
      setError(message)
      toast.error(message)
      return
    }

    toast.success(`Space ${parsed.data.name} created.`, {
      description: "Mocked locally for this PRD. Supabase persistence comes later.",
    })
    setOpen(false)
    reset()
  }

  function updateMember(index: number, patch: Partial<WizardMember>) {
    setMembers((current) => current.map((member, memberIndex) => memberIndex === index ? { ...member, ...patch } : member))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" />}>New Workspace</DialogTrigger>
      <DialogContent className="gap-0 overflow-visible p-0 sm:max-w-2xl">
        <DialogHeader className="mb-0 border-b px-6 py-4">
          <DialogTitle>Create New Space</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col-reverse md:flex-row">
            <div className="flex flex-col justify-between md:w-80 md:border-r">
              <div className="flex-1 grow">
                <div className="border-t p-6 md:border-none">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex shrink-0 items-center justify-center rounded-sm bg-muted p-3">
                      <Layers3Icon className="size-5 text-foreground" aria-hidden />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-balance text-sm font-medium text-foreground">Space Starter</h3>
                      <p className="text-pretty text-sm text-muted-foreground">Configure an operational boundary.</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <h4 className="text-balance text-sm font-medium text-foreground">Description</h4>
                  <p className="text-pretty mt-1 text-sm leading-6 text-muted-foreground">
                    Spaces group members, roles, Processes and Actions into a controlled Workstation area.
                  </p>
                  <h4 className="text-balance mt-6 text-sm font-medium text-foreground">Info</h4>
                  <p className="text-pretty mt-1 text-sm leading-6 text-muted-foreground">
                    Only accepted organization members are listed. Space Role does not alter Organization Role.
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
                  <Label htmlFor="space-name" className="text-sm font-medium text-foreground">Space Details</Label>
                </div>
                <Input id="space-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Finance Operations" />
                <Textarea id="space-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the work this Space will contain." />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">2</div>
                  <Label className="text-sm font-medium text-foreground">Members & Roles</Label>
                </div>
                <div className="grid gap-3">
                  {members.map((member, index) => (
                    <div key={index} className="grid gap-3 rounded-lg border p-3">
                      <Select value={member.memberId} onValueChange={(value) => updateMember(index, { memberId: value ?? "" })}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select accepted member" /></SelectTrigger>
                        <SelectContent>
                          {acceptedOrganizationMembers.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={member.role} onValueChange={(value) => updateMember(index, { role: (value ?? "") as SpaceRole | "" })}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select Space role" /></SelectTrigger>
                        <SelectContent>{spaceRoles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => setMembers((current) => [...current, { memberId: "", role: "" }])}>Add another member</Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">3</div>
                  <Label className="text-sm font-medium text-foreground">Review</Label>
                </div>
                <div className="grid gap-2 rounded-lg border p-4 text-sm">
                  <div><span className="font-medium">Name:</span> {name || "Not set"}</div>
                  <div><span className="font-medium">Description:</span> {description || "Not set"}</div>
                  <div><span className="font-medium">Members:</span> {validMembers().length || "No initial members"}</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
