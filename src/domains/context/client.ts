import type { SupabaseClient } from "@supabase/supabase-js";

export type ContextSupabaseClient = SupabaseClient;

export type ContextClientOptions = {
  workspaceId: string;
  organizationId?: string | null;
  /** "server" = service role or user session; "browser" = anon client. */
  environment: "server" | "browser";
};

export function resolveWorkspaceId(value: string | null | undefined): string {
  if (!value) {
    throw new Error(
      "Context Memory Layer requires a workspaceId. Pass it explicitly when calling from server actions.",
    );
  }
  return value;
}