import {
  WorkstationDomainError,
  type DomainErrorCode,
} from "@/domains/workstation/core/workstation"

const KNOWN_CODES = new Set<DomainErrorCode>([
  "not_found",
  "permission_denied",
  "invalid_transition",
  "invalid_input",
  "revision_conflict",
  "idempotency_conflict",
  "unavailable",
])

export function mapRpcError(error: { message?: string; details?: string; code?: string } | null | undefined): never {
  const detail = (error?.details || "").trim()
  const message = (error?.message || "Workstation command failed.").trim()
  const code = (KNOWN_CODES.has(detail as DomainErrorCode) ? detail : "invalid_input") as DomainErrorCode
  throw new WorkstationDomainError(code, message)
}

export function toSerializableError(error: unknown): { code: DomainErrorCode; message: string } {
  if (error instanceof WorkstationDomainError) {
    return { code: error.code, message: error.message }
  }
  if (error instanceof Error) {
    return { code: "unavailable", message: error.message }
  }
  return { code: "unavailable", message: "Unknown workstation error." }
}
