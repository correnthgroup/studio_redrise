import { ContextMemoryConsole } from "@/domains/context/components/context-memory-console"

type ContextPageProps = {
  params: Promise<{ organizationSlug: string }>
}

export default async function ContextMemoryPage({ params }: ContextPageProps) {
  const { organizationSlug } = await params
  return <ContextMemoryConsole organizationSlug={organizationSlug} />
}