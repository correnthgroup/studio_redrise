/**
 * Flags de rollout do backend durável do Workstation (PRD-024 §13).
 *
 * Server-side apenas. O rollout por organização (Fase 7) estende
 * `WORKSTATION_DURABLE_ORGS` com uma allowlist de slugs; até lá o flag
 * booleano controla o ambiente inteiro e o default é desligado.
 */

export function isWorkstationDurableEnabled(): boolean {
  return process.env.WORKSTATION_DURABLE === "true"
}

export function isWorkstationDurableEnabledForOrganization(organizationSlug: string): boolean {
  if (!isWorkstationDurableEnabled()) return false

  const allowlist = process.env.WORKSTATION_DURABLE_ORGS
  if (!allowlist || allowlist.trim() === "" || allowlist.trim() === "*") return true

  return allowlist
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .includes(organizationSlug)
}
