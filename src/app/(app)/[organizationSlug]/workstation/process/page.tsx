import { ProcessPage as ProcessDomainPage } from "@/domains/workstation/process/components/process-page"

export default async function ProcessPage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params

  return <ProcessDomainPage organizationSlug={organizationSlug} />
}
