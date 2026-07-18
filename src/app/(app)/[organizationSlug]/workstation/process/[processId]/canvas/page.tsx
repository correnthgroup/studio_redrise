import { ProcessCanvasPage as ProcessCanvasDomainPage } from "@/domains/workstation/process/components/process-canvas-page"

export default async function ProcessCanvasPage({
  params,
}: {
  params: Promise<{ organizationSlug: string; processId: string }>
}) {
  const { organizationSlug, processId } = await params

  return <ProcessCanvasDomainPage organizationSlug={organizationSlug} processId={processId} />
}
