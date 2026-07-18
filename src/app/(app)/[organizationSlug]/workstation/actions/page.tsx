import { ActionsPage as ActionsDomainPage } from "@/domains/workstation/actions/components/actions-page"

export default async function ActionsPage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params

  return <ActionsDomainPage organizationSlug={organizationSlug} />
}
