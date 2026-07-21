"use server"

import { createHash } from "node:crypto"

import type { CreateProcessInput } from "@/domains/workstation/process/schemas/process.schemas"
import type { AddSpaceMemberInput, CreateSpaceInput } from "@/domains/workstation/spaces/schemas/space.schemas"
import type { LoadedWorkstationSnapshot } from "@/domains/workstation/server/load-snapshot"
import { loadWorkstationSnapshot } from "@/domains/workstation/server/load-snapshot"
import { resolveOrganizationSession } from "@/domains/workstation/server/organization-session"
import { mapRpcError, toSerializableError } from "@/domains/workstation/server/rpc-errors"
import { isWorkstationDurableEnabledForOrganization } from "@/lib/flags"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { WorkstationDomainError } from "@/domains/workstation/core/workstation"

type CommandResult<T> =
  | { ok: true; data: T; loaded: LoadedWorkstationSnapshot }
  | { ok: false; error: { code: string; message: string } }

function payloadHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex")
}

async function withSession(organizationSlug: string) {
  if (!isWorkstationDurableEnabledForOrganization(organizationSlug)) {
    throw new WorkstationDomainError("unavailable", "Durable workstation backend is disabled for this organization.")
  }

  const sessionResult = await resolveOrganizationSession(organizationSlug)
  if (sessionResult.status === "unauthenticated") {
    throw new WorkstationDomainError("permission_denied", "Authentication required.")
  }
  if (sessionResult.status === "not_member") {
    throw new WorkstationDomainError("permission_denied", "Not a member of this organization.")
  }
  if (sessionResult.status === "unavailable") {
    throw new WorkstationDomainError("unavailable", "Workstation durable backend is unavailable.")
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new WorkstationDomainError("unavailable", "Supabase is not configured.")

  return { session: sessionResult.session, supabase }
}

async function runCommand<T>(
  organizationSlug: string,
  execute: (ctx: Awaited<ReturnType<typeof withSession>>) => Promise<T>,
): Promise<CommandResult<T>> {
  try {
    const ctx = await withSession(organizationSlug)
    const data = await execute(ctx)
    const loaded = await loadWorkstationSnapshot(ctx.session)
    if (!loaded) {
      throw new WorkstationDomainError("unavailable", "Failed to reload workstation snapshot.")
    }
    return { ok: true, data, loaded }
  } catch (error) {
    return { ok: false, error: toSerializableError(error) }
  }
}

async function rpc<T>(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  fn: string,
  args: Record<string, unknown>,
): Promise<T> {
  if (!supabase) throw new WorkstationDomainError("unavailable", "Supabase is not configured.")
  // RPC signatures are added in migration 052; local Database types lag until regenerated.
  const { data, error } = await (supabase as unknown as {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: T; error: { message?: string; details?: string } | null }>
  }).rpc(fn, args)
  if (error) mapRpcError(error)
  return data
}

export async function refreshWorkstationSnapshotAction(organizationSlug: string): Promise<CommandResult<null>> {
  return runCommand(organizationSlug, async () => null)
}

export async function createSpaceAction(
  organizationSlug: string,
  idempotencyKey: string,
  input: CreateSpaceInput,
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash(input)
    return rpc(supabase, "ws_create_space", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_name: input.name,
      p_description: input.description,
      p_members: input.members,
    })
  })
}

export async function updateSpaceAction(
  organizationSlug: string,
  idempotencyKey: string,
  id: string,
  expectedRevision: number,
  patch: { name: string; description: string },
): Promise<CommandResult<{ id: string; revision: number }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash({ id, expectedRevision, patch })
    return rpc(supabase, "ws_update_space", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_space_id: id,
      p_expected_revision: expectedRevision,
      p_name: patch.name,
      p_description: patch.description,
    })
  })
}

export async function archiveSpaceAction(
  organizationSlug: string,
  idempotencyKey: string,
  id: string,
  expectedRevision: number,
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash({ id, expectedRevision })
    return rpc(supabase, "ws_archive_space", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_space_id: id,
      p_expected_revision: expectedRevision,
    })
  })
}

export async function addSpaceMemberAction(
  organizationSlug: string,
  idempotencyKey: string,
  spaceId: string,
  input: AddSpaceMemberInput,
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash({ spaceId, input })
    return rpc(supabase, "ws_add_space_member", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_space_id: spaceId,
      p_member_id: input.memberId,
      p_space_role: input.role,
    })
  })
}

export async function createProcessAction(
  organizationSlug: string,
  idempotencyKey: string,
  input: CreateProcessInput,
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash(input)
    return rpc(supabase, "ws_create_process", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_space_id: input.spaceId,
      p_name: input.name,
      p_description: input.description,
      p_owner: input.owner,
      p_frequency: input.frequency,
      p_initial_node_type: input.initialNodeType,
    })
  })
}

export async function updateProcessAction(
  organizationSlug: string,
  idempotencyKey: string,
  id: string,
  expectedRevision: number,
  patch: { name: string; description: string; owner: string; frequency: string },
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash({ id, expectedRevision, patch })
    return rpc(supabase, "ws_update_process", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_process_id: id,
      p_expected_revision: expectedRevision,
      p_name: patch.name,
      p_description: patch.description,
      p_owner: patch.owner,
      p_frequency: patch.frequency,
    })
  })
}

export async function setProcessStatusAction(
  organizationSlug: string,
  idempotencyKey: string,
  id: string,
  expectedRevision: number,
  status: string,
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash({ id, expectedRevision, status })
    return rpc(supabase, "ws_set_process_status", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_process_id: id,
      p_expected_revision: expectedRevision,
      p_status: status,
    })
  })
}

export async function createNodeAction(
  organizationSlug: string,
  idempotencyKey: string,
  processId: string,
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash({ processId })
    return rpc(supabase, "ws_create_node", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_process_id: processId,
    })
  })
}

export async function updateNodeAction(
  organizationSlug: string,
  idempotencyKey: string,
  nodeId: string,
  expectedRevision: number,
  patch: Record<string, unknown>,
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash({ nodeId, expectedRevision, patch })
    return rpc(supabase, "ws_update_node", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_node_id: nodeId,
      p_expected_revision: expectedRevision,
      p_patch: patch,
    })
  })
}

export async function duplicateNodeAction(
  organizationSlug: string,
  idempotencyKey: string,
  nodeId: string,
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash({ nodeId })
    return rpc(supabase, "ws_duplicate_node", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_node_id: nodeId,
    })
  })
}

export async function deleteNodeAction(
  organizationSlug: string,
  idempotencyKey: string,
  nodeId: string,
): Promise<CommandResult<null>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash({ nodeId })
    await rpc(supabase, "ws_delete_node", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_node_id: nodeId,
    })
    return null
  })
}

export async function connectNodesAction(
  organizationSlug: string,
  idempotencyKey: string,
  input: {
    processId: string
    sourceNodeId: string
    targetNodeId: string
    connectionType: string
  },
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash(input)
    return rpc(supabase, "ws_connect_nodes", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_process_id: input.processId,
      p_source_node_id: input.sourceNodeId,
      p_target_node_id: input.targetNodeId,
      p_connection_type: input.connectionType,
    })
  })
}

export async function startProcessAction(
  organizationSlug: string,
  idempotencyKey: string,
  processId: string,
  triggeredBy?: string,
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash({ processId, triggeredBy })
    return rpc(supabase, "ws_start_process", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_process_id: processId,
      p_triggered_by: triggeredBy ?? null,
    })
  })
}

export async function cancelRunAction(
  organizationSlug: string,
  idempotencyKey: string,
  processRunId: string,
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash({ processRunId })
    return rpc(supabase, "ws_cancel_run", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_process_run_id: processRunId,
    })
  })
}

export async function retryNodeRunAction(
  organizationSlug: string,
  idempotencyKey: string,
  nodeRunId: string,
): Promise<CommandResult<{ id: string }>> {
  return runCommand(organizationSlug, async ({ session, supabase }) => {
    const hash = payloadHash({ nodeRunId })
    return rpc(supabase, "ws_retry_node_run", {
      p_organization_id: session.organizationId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: hash,
      p_node_run_id: nodeRunId,
    })
  })
}
