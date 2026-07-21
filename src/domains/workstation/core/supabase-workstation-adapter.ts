import type { ActionNodeRun, ProcessRun } from "@/domains/workstation/actions/types/action.types"
import {
  WorkstationDomainError,
  type ExecutionRuntime,
  type WorkstationRepository,
  type WorkstationSnapshot,
} from "@/domains/workstation/core/workstation"
import type { CreateProcessInput } from "@/domains/workstation/process/schemas/process.schemas"
import type { NodeConnection, RedRiseNode, RedRiseProcess } from "@/domains/workstation/process/types/process.types"
import type { EntityRevisions } from "@/domains/workstation/server/project-snapshot"
import type { AddSpaceMemberInput, CreateSpaceInput } from "@/domains/workstation/spaces/schemas/space.schemas"
import type { Space } from "@/domains/workstation/spaces/types/space.types"
import {
  addSpaceMemberAction,
  archiveSpaceAction,
  cancelRunAction,
  connectNodesAction,
  createNodeAction,
  createProcessAction,
  createSpaceAction,
  deleteNodeAction,
  duplicateNodeAction,
  refreshWorkstationSnapshotAction,
  retryNodeRunAction,
  setProcessStatusAction,
  startProcessAction,
  updateNodeAction,
  updateProcessAction,
  updateSpaceAction,
} from "@/domains/workstation/server/commands"

type CommandOutcome<T> =
  | { ok: true; data: T; loaded: { snapshot: WorkstationSnapshot; revisions: EntityRevisions } }
  | { ok: false; error: { code: string; message: string } }

function newKey() {
  return crypto.randomUUID()
}

export class SupabaseWorkstationAdapter implements WorkstationRepository, ExecutionRuntime {
  private readonly listeners = new Set<() => void>()
  private snapshot: WorkstationSnapshot
  private revisions: EntityRevisions
  private readonly organizationSlug: string

  constructor(organizationSlug: string, initial: { snapshot: WorkstationSnapshot; revisions: EntityRevisions }) {
    this.organizationSlug = organizationSlug
    this.snapshot = initial.snapshot
    this.revisions = initial.revisions
  }

  getSnapshot(): WorkstationSnapshot {
    return this.snapshot
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private publish(loaded: { snapshot: WorkstationSnapshot; revisions: EntityRevisions }) {
    this.snapshot = loaded.snapshot
    this.revisions = loaded.revisions
    this.listeners.forEach((listener) => listener())
  }

  private async apply<T>(result: Promise<CommandOutcome<T>>): Promise<T> {
    const outcome = await result
    if (!outcome.ok) {
      throw new WorkstationDomainError(
        (outcome.error.code as WorkstationDomainError["code"]) || "unavailable",
        outcome.error.message,
      )
    }
    this.publish(outcome.loaded)
    return outcome.data
  }

  private requireSpace(id: string) {
    const space = this.snapshot.spaces.find((item) => item.id === id)
    if (!space) throw new WorkstationDomainError("not_found", "Space not found.")
    return space
  }

  private requireProcess(id: string) {
    const process = this.snapshot.processes.find((item) => item.id === id)
    if (!process) throw new WorkstationDomainError("not_found", "Process not found.")
    return process
  }

  private revisionOf(kind: keyof EntityRevisions, id: string) {
    return this.revisions[kind][id] ?? 1
  }

  async refresh() {
    await this.apply(refreshWorkstationSnapshotAction(this.organizationSlug))
  }

  async createSpace(input: CreateSpaceInput): Promise<Space> {
    await this.apply(createSpaceAction(this.organizationSlug, newKey(), input))
    const created = this.snapshot.spaces.find((space) => space.name === input.name)
    if (!created) throw new WorkstationDomainError("unavailable", "Space created but missing from snapshot.")
    return created
  }

  async updateSpace(id: string, patch: Pick<Space, "name" | "description">): Promise<Space> {
    this.requireSpace(id)
    await this.apply(updateSpaceAction(this.organizationSlug, newKey(), id, this.revisionOf("spaces", id), patch))
    return this.requireSpace(id)
  }

  async archiveSpace(id: string): Promise<Space> {
    this.requireSpace(id)
    await this.apply(archiveSpaceAction(this.organizationSlug, newKey(), id, this.revisionOf("spaces", id)))
    return this.requireSpace(id)
  }

  async addSpaceMember(spaceId: string, input: AddSpaceMemberInput): Promise<Space> {
    this.requireSpace(spaceId)
    await this.apply(addSpaceMemberAction(this.organizationSlug, newKey(), spaceId, input))
    return this.requireSpace(spaceId)
  }

  async createProcess(input: CreateProcessInput): Promise<RedRiseProcess> {
    await this.apply(createProcessAction(this.organizationSlug, newKey(), input))
    const created = this.snapshot.processes.find((process) => process.name === input.name && process.spaceId === input.spaceId)
    if (!created) throw new WorkstationDomainError("unavailable", "Process created but missing from snapshot.")
    return created
  }

  async updateProcess(
    id: string,
    patch: Pick<RedRiseProcess, "name" | "description" | "owner" | "frequency">,
  ): Promise<RedRiseProcess> {
    this.requireProcess(id)
    await this.apply(updateProcessAction(this.organizationSlug, newKey(), id, this.revisionOf("processes", id), patch))
    return this.requireProcess(id)
  }

  async setProcessStatus(id: string, status: RedRiseProcess["status"]): Promise<RedRiseProcess> {
    this.requireProcess(id)
    await this.apply(setProcessStatusAction(this.organizationSlug, newKey(), id, this.revisionOf("processes", id), status))
    return this.requireProcess(id)
  }

  async createNode(processId: string): Promise<RedRiseNode> {
    this.requireProcess(processId)
    await this.apply(createNodeAction(this.organizationSlug, newKey(), processId))
    const nodes = this.snapshot.nodes.filter((node) => node.processId === processId)
    const created = nodes[nodes.length - 1]
    if (!created) throw new WorkstationDomainError("unavailable", "Node created but missing from snapshot.")
    return created
  }

  async updateNode(nodeId: string, patch: Partial<RedRiseNode>): Promise<RedRiseNode> {
    const current = this.snapshot.nodes.find((node) => node.id === nodeId)
    if (!current) throw new WorkstationDomainError("not_found", "Node not found.")
    const payload: Record<string, unknown> = {}
    if (patch.title !== undefined) payload.title = patch.title
    if (patch.description !== undefined) payload.description = patch.description
    if (patch.nodeType !== undefined) payload.nodeType = patch.nodeType
    if (patch.position !== undefined) payload.position = patch.position
    if (patch.enabled !== undefined) payload.enabled = patch.enabled
    if (patch.instruction !== undefined) payload.instruction = patch.instruction
    if (patch.inputMode !== undefined) payload.inputMode = patch.inputMode
    if (patch.inputMapping !== undefined) payload.inputMapping = patch.inputMapping
    if (patch.outputType !== undefined) payload.outputType = patch.outputType
    if (patch.outputContract !== undefined) payload.outputContract = patch.outputContract
    if (patch.config !== undefined) payload.config = patch.config
    if (patch.failureBehavior !== undefined) payload.failureBehavior = patch.failureBehavior
    await this.apply(updateNodeAction(this.organizationSlug, newKey(), nodeId, this.revisionOf("nodes", nodeId), payload))
    const updated = this.snapshot.nodes.find((node) => node.id === nodeId)
    if (!updated) throw new WorkstationDomainError("not_found", "Node not found.")
    return updated
  }

  async duplicateNode(nodeId: string): Promise<RedRiseNode> {
    const current = this.snapshot.nodes.find((node) => node.id === nodeId)
    if (!current) throw new WorkstationDomainError("not_found", "Node not found.")
    await this.apply(duplicateNodeAction(this.organizationSlug, newKey(), nodeId))
    const copy = this.snapshot.nodes.find((node) => node.processId === current.processId && node.title === `${current.title} copy`)
    if (!copy) throw new WorkstationDomainError("unavailable", "Node duplicated but missing from snapshot.")
    return copy
  }

  async deleteNode(nodeId: string): Promise<void> {
    if (!this.snapshot.nodes.some((node) => node.id === nodeId)) {
      throw new WorkstationDomainError("not_found", "Node not found.")
    }
    await this.apply(deleteNodeAction(this.organizationSlug, newKey(), nodeId))
  }

  async connectNodes(
    input: Omit<NodeConnection, "id" | "organizationId" | "spaceId" | "createdAt">,
  ): Promise<NodeConnection> {
    this.requireProcess(input.processId)
    await this.apply(
      connectNodesAction(this.organizationSlug, newKey(), {
        processId: input.processId,
        sourceNodeId: input.sourceNodeId,
        targetNodeId: input.targetNodeId,
        connectionType: input.connectionType,
      }),
    )
    const connection = this.snapshot.connections.find(
      (item) =>
        item.processId === input.processId &&
        item.sourceNodeId === input.sourceNodeId &&
        item.targetNodeId === input.targetNodeId &&
        item.connectionType === input.connectionType,
    )
    if (!connection) throw new WorkstationDomainError("unavailable", "Connection created but missing from snapshot.")
    return connection
  }

  async startProcess(processId: string, triggeredBy?: string): Promise<ProcessRun> {
    this.requireProcess(processId)
    await this.apply(startProcessAction(this.organizationSlug, newKey(), processId, triggeredBy))
    const run = this.snapshot.processRuns.find((item) => item.processId === processId)
    if (!run) throw new WorkstationDomainError("unavailable", "Process run created but missing from snapshot.")
    return run
  }

  async cancelRun(processRunId: string): Promise<ProcessRun> {
    await this.apply(cancelRunAction(this.organizationSlug, newKey(), processRunId))
    const run = this.snapshot.processRuns.find((item) => item.id === processRunId)
    if (!run) throw new WorkstationDomainError("not_found", "Run not found.")
    return run
  }

  async retryNodeRun(nodeRunId: string): Promise<ActionNodeRun> {
    await this.apply(retryNodeRunAction(this.organizationSlug, newKey(), nodeRunId))
    const retry = this.snapshot.nodeRuns.find((item) => item.retriedFromNodeRunId === nodeRunId)
    if (!retry) throw new WorkstationDomainError("unavailable", "Retry created but missing from snapshot.")
    return retry
  }
}
