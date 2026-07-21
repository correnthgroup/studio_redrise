import type { ActionNodeRun, ProcessRun } from "@/domains/workstation/actions/types/action.types"
import type { WorkstationSnapshot } from "@/domains/workstation/core/workstation"
import type {
  NodeConnection,
  RedRiseNode,
  RedRiseProcess,
} from "@/domains/workstation/process/types/process.types"
import type {
  OrganizationMember,
  OrganizationRole,
  Space,
  SpaceMember,
  SpaceRole,
} from "@/domains/workstation/spaces/types/space.types"
import type {
  NodeConnectionRow,
  NodeRunRow,
  OrganizationMemberRow,
  ProcessNodeRow,
  ProcessRow,
  ProcessRunRow,
  SpaceMemberRow,
  SpaceRow,
} from "@/lib/database.types"

export type SnapshotSourceRows = {
  organizationId: string
  currentUserId: string
  members: OrganizationMemberRow[]
  spaces: SpaceRow[]
  spaceMembers: SpaceMemberRow[]
  processes: ProcessRow[]
  nodes: ProcessNodeRow[]
  connections: NodeConnectionRow[]
  processRuns: ProcessRunRow[]
  nodeRuns: NodeRunRow[]
}

export type EntityRevisions = {
  spaces: Record<string, number>
  processes: Record<string, number>
  nodes: Record<string, number>
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>
  return {}
}

function durationLabel(startedAt?: string | null, finishedAt?: string | null, status?: string) {
  if (startedAt && finishedAt) {
    const seconds = Math.max(1, Math.round((Date.parse(finishedAt) - Date.parse(startedAt)) / 1000))
    return `${seconds}s`
  }
  if (status === "queued") return "Queued"
  if (status === "running" || status === "planning" || status === "preparing" || status === "executing") return "Running"
  return "—"
}

function lastActivityLabel(updatedAt: string) {
  const deltaMs = Date.now() - Date.parse(updatedAt)
  if (!Number.isFinite(deltaMs) || deltaMs < 60_000) return "Just now"
  const minutes = Math.round(deltaMs / 60_000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

function stageFromStatus(status: NodeRunRow["status"]): ActionNodeRun["stage"] {
  if (status === "planning") return "plan"
  if (status === "preparing") return "prepare"
  if (status === "executing") return "execute"
  return "result"
}

function mapMember(row: OrganizationMemberRow): OrganizationMember {
  return {
    id: row.id,
    name: row.display_name || row.email || "Member",
    email: row.email,
    organizationRole: row.role as OrganizationRole,
    status: row.status === "revoked" ? "declined" : row.status,
  }
}

export function projectWorkstationSnapshot(source: SnapshotSourceRows): {
  snapshot: WorkstationSnapshot
  revisions: EntityRevisions
} {
  const members = source.members.map(mapMember)
  const currentMemberRow = source.members.find((row) => row.user_id === source.currentUserId)
  const currentUser = currentMemberRow ? mapMember(currentMemberRow) : members[0]

  if (!currentUser) {
    throw new Error("Workstation snapshot requires an organization member for the current user.")
  }

  const memberById = new Map(source.members.map((row) => [row.id, row]))
  const spaceNameById = new Map(source.spaces.map((space) => [space.id, space.name]))
  const processNameById = new Map(source.processes.map((process) => [process.id, process.name]))
  const processCountBySpace = new Map<string, number>()
  const runCountBySpace = new Map<string, number>()
  const nodeCountByProcess = new Map<string, number>()
  const runCountByProcess = new Map<string, number>()
  const lastRunByProcess = new Map<string, string>()

  for (const process of source.processes) {
    processCountBySpace.set(process.space_id, (processCountBySpace.get(process.space_id) ?? 0) + 1)
  }
  for (const node of source.nodes) {
    nodeCountByProcess.set(node.process_id, (nodeCountByProcess.get(node.process_id) ?? 0) + 1)
  }
  for (const run of source.processRuns) {
    runCountBySpace.set(run.space_id, (runCountBySpace.get(run.space_id) ?? 0) + 1)
    runCountByProcess.set(run.process_id, (runCountByProcess.get(run.process_id) ?? 0) + 1)
    const stamp = run.finished_at ?? run.started_at ?? run.queued_at
    const previous = lastRunByProcess.get(run.process_id)
    if (!previous || Date.parse(stamp) > Date.parse(previous)) lastRunByProcess.set(run.process_id, stamp)
  }

  const spaceMembersBySpace = new Map<string, SpaceMember[]>()
  for (const row of source.spaceMembers) {
    const orgMember = memberById.get(row.member_id)
    if (!orgMember) continue
    const mapped: SpaceMember = {
      id: row.id,
      memberId: row.member_id,
      name: orgMember.display_name || orgMember.email || "Member",
      email: orgMember.email,
      spaceRole: row.space_role as SpaceRole,
      organizationRole: orgMember.role as OrganizationRole,
      status: "Active",
    }
    const list = spaceMembersBySpace.get(row.space_id) ?? []
    list.push(mapped)
    spaceMembersBySpace.set(row.space_id, list)
  }

  const spaces: Space[] = source.spaces.map((space) => {
    const membersForSpace = spaceMembersBySpace.get(space.id) ?? []
    return {
      id: space.id,
      organizationId: space.organization_id,
      name: space.name,
      description: space.description,
      membersCount: membersForSpace.length,
      rolesSummary: Array.from(new Set(membersForSpace.map((member) => member.spaceRole))).join(", ") || "No roles",
      processesCount: processCountBySpace.get(space.id) ?? 0,
      actionsCount: runCountBySpace.get(space.id) ?? 0,
      lastActivity: lastActivityLabel(space.updated_at),
      status: space.status,
      members: membersForSpace,
      createdAt: space.created_at,
      updatedAt: space.updated_at,
      createdBy: space.created_by ?? undefined,
      updatedBy: space.updated_by ?? undefined,
    }
  })

  const processes: RedRiseProcess[] = source.processes.map((process) => ({
    id: process.id,
    organizationId: process.organization_id,
    spaceId: process.space_id,
    spaceName: spaceNameById.get(process.space_id) ?? "Space",
    name: process.name,
    description: process.description,
    owner: process.owner,
    status: process.status,
    frequency: process.frequency,
    nodesCount: nodeCountByProcess.get(process.id) ?? 0,
    actionsCount: runCountByProcess.get(process.id) ?? 0,
    lastRun: lastRunByProcess.has(process.id)
      ? lastActivityLabel(lastRunByProcess.get(process.id)!)
      : "Not activated",
    updatedAt: process.updated_at,
    createdAt: process.created_at,
    createdBy: process.created_by ?? undefined,
    updatedBy: process.updated_by ?? undefined,
  }))

  const nodes: RedRiseNode[] = source.nodes.map((node) => ({
    id: node.id,
    organizationId: node.organization_id,
    spaceId: node.space_id,
    processId: node.process_id,
    nodeType: node.node_type,
    title: node.title,
    description: node.description ?? undefined,
    position: { x: node.position_x, y: node.position_y },
    enabled: node.enabled,
    instruction: node.instruction,
    inputMode: node.input_mode,
    inputMapping: asRecord(node.input_mapping),
    outputType: node.output_type,
    outputContract: node.output_contract ? asRecord(node.output_contract) : undefined,
    config: asRecord(node.config),
    failureBehavior: node.failure_behavior,
    createdBy: node.created_by ?? "system",
    updatedBy: node.updated_by ?? "system",
    createdAt: node.created_at,
    updatedAt: node.updated_at,
  }))

  const connections: NodeConnection[] = source.connections.map((connection) => ({
    id: connection.id,
    organizationId: connection.organization_id,
    spaceId: connection.space_id,
    processId: connection.process_id,
    sourceNodeId: connection.source_node_id,
    targetNodeId: connection.target_node_id,
    connectionType: connection.connection_type,
    createdAt: connection.created_at,
  }))

  const processRuns: ProcessRun[] = source.processRuns.map((run) => ({
    id: run.id,
    organizationId: run.organization_id,
    spaceId: run.space_id,
    spaceName: spaceNameById.get(run.space_id) ?? "Space",
    processId: run.process_id,
    processName: processNameById.get(run.process_id) ?? "Process",
    triggerType: run.trigger_type,
    triggeredBy: run.triggered_by,
    status: run.status,
    startedAt: run.started_at ?? run.queued_at,
    completedAt: run.finished_at ?? undefined,
    duration: durationLabel(run.started_at ?? run.queued_at, run.finished_at, run.status),
  }))

  const nodeRuns: ActionNodeRun[] = source.nodeRuns.map((run) => {
    const processRun = source.processRuns.find((item) => item.id === run.process_run_id)
    return {
      id: run.id,
      processRunId: run.process_run_id,
      nodeId: run.node_id ?? "",
      nodeTitle: run.node_title,
      nodeType: run.node_type,
      processId: run.process_id,
      processName: processNameById.get(run.process_id) ?? "Process",
      spaceId: run.space_id,
      spaceName: spaceNameById.get(run.space_id) ?? "Space",
      status: run.status,
      stage: run.stage || stageFromStatus(run.status),
      startedAt: run.started_at ?? run.queued_at,
      completedAt: run.finished_at ?? undefined,
      duration: durationLabel(run.started_at ?? run.queued_at, run.finished_at, run.status),
      modelName: run.model_name || "default",
      triggerType: processRun?.trigger_type ?? "manual",
      triggeredBy: processRun?.triggered_by ?? "",
      planSummary: run.plan_summary ?? undefined,
      prepareSummary: run.prepare_summary ?? undefined,
      executeSummary: run.execute_summary ?? undefined,
      resultSummary: run.result_summary ?? undefined,
      inputSnapshot: run.input_snapshot ? asRecord(run.input_snapshot) : undefined,
      outputSnapshot: run.output_snapshot ? asRecord(run.output_snapshot) : undefined,
      outputType: (run.output_type as ActionNodeRun["outputType"]) || "text",
      errorMessage: run.error_message ?? undefined,
      failedStage: run.failed_stage ?? undefined,
      suggestedNextAction: run.suggested_next_action ?? undefined,
      metadata: asRecord(run.metadata),
      attempt: run.attempt,
      retriedFromNodeRunId: run.retried_from_node_run_id ?? undefined,
    }
  })

  const revision =
    source.spaces.reduce((max, row) => Math.max(max, Number(row.revision) || 0), 0) +
    source.processes.reduce((max, row) => Math.max(max, Number(row.revision) || 0), 0) +
    source.nodes.reduce((max, row) => Math.max(max, Number(row.revision) || 0), 0) +
    source.processRuns.length +
    source.nodeRuns.length

  return {
    snapshot: {
      organizationId: source.organizationId,
      currentUser,
      members,
      spaces,
      processes,
      nodes,
      connections,
      processRuns,
      nodeRuns,
      revision,
    },
    revisions: {
      spaces: Object.fromEntries(source.spaces.map((row) => [row.id, Number(row.revision)])),
      processes: Object.fromEntries(source.processes.map((row) => [row.id, Number(row.revision)])),
      nodes: Object.fromEntries(source.nodes.map((row) => [row.id, Number(row.revision)])),
    },
  }
}
