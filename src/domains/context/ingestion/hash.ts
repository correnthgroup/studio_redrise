import { createHash } from "node:crypto";

/**
 * Stable SHA-256 content hash used as the idempotency key for ingestion.
 * Same content (after CRLF normalization) => same hash => no-op on re-ingest.
 */
export function contentHash(input: string): string {
  const normalized = input.replace(/\r\n/g, "\n").trim();
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}