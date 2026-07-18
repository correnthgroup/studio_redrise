"use client"

import { ChevronRightIcon, Edit3Icon, MousePointer2Icon, PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

type ProcessCanvasToolbarProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNewNode: () => void
  onDeleteNode: () => void
  onEditNode: () => void
  onSelectAll: () => void
}

export function ProcessCanvasToolbar({
  open,
  onOpenChange,
  onNewNode,
  onDeleteNode,
  onEditNode,
  onSelectAll,
}: ProcessCanvasToolbarProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className={cn("absolute left-4 top-4 z-10 rounded-xl border bg-background/95 shadow-sm backdrop-blur", open ? "w-64" : "w-12")}>
        <div className="flex items-center justify-between p-2">
          {open ? <p className="px-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Canvas Menu</p> : null}
          <CollapsibleTrigger render={<Button type="button" variant="ghost" size="icon" className="size-8" />}>
            <ChevronRightIcon className={cn("size-4 transition-transform", open ? "rotate-180" : "rotate-0")} />
            <span className="sr-only">Toggle canvas menu</span>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="border-t p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Node</p>
            <div className="grid gap-1">
              <Button type="button" variant="ghost" className="justify-start" onClick={onNewNode}>
                <PlusIcon />
                New
                <Kbd className="ml-auto">N</Kbd>
              </Button>
              <Button type="button" variant="ghost" className="justify-start" onClick={onDeleteNode}>
                <Trash2Icon />
                Delete
                <Kbd className="ml-auto">Del</Kbd>
              </Button>
              <Button type="button" variant="ghost" className="justify-start" onClick={onEditNode}>
                <Edit3Icon />
                Edit
                <Kbd className="ml-auto">E</Kbd>
              </Button>
              <Button type="button" variant="ghost" className="justify-start" onClick={onSelectAll}>
                <MousePointer2Icon />
                Select
                <Kbd className="ml-auto">A</Kbd>
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
