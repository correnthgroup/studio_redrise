import { CreateProcessDialog } from "@/domains/workstation/process/dialogs/create-process-dialog"
import { mockProcesses } from "@/domains/workstation/process/data/mock-processes"
import { ProcessTable } from "@/domains/workstation/process/components/process-table"

export function ProcessPage({ organizationSlug }: { organizationSlug: string }) {
  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">WS-PROCESS-LIST</p>
          <h1 className="text-3xl font-semibold tracking-tight">Process</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Manage operational flows, inspect node counts and open the canvas for structured node design.
          </p>
        </div>
        <CreateProcessDialog />
      </div>
      <ProcessTable processes={mockProcesses} organizationSlug={organizationSlug} />
    </section>
  )
}
