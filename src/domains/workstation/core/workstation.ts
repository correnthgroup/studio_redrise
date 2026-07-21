import type { ActionNodeRun, ProcessRun } from "@/domains/workstation/actions/types/action.types"
import { mockActionNodeRuns, mockProcessRuns } from "@/domains/workstation/actions/data/mock-actions"
import { getActionStage } from "@/domains/workstation/core/selectors"
import type { CreateProcessInput } from "@/domains/workstation/process/schemas/process.schemas"
import type { NodeConnection, RedRiseNode, RedRiseProcess } from "@/domains/workstation/process/types/process.types"
import { mockCanvasNodes, mockNodeConnections, mockProcesses } from "@/domains/workstation/process/data/mock-processes"
import type { CreateSpaceInput, AddSpaceMemberInput } from "@/domains/workstation/spaces/schemas/space.schemas"
import type { OrganizationMember, OrganizationRole, Space, SpaceRole } from "@/domains/workstation/spaces/types/space.types"
import { mockOrganizationMembers, mockSpaces } from "@/domains/workstation/spaces/data/mock-spaces"

export type WorkstationCapability =
  | "space.read"
  | "space.manage"
  | "space.members.manage"
  | "process.read"
  | "process.manage"
  | "process.run"
  | "run.read"
  | "run.retry"

export type DomainErrorCode =
  | "not_found"
  | "permission_denied"
  | "invalid_transition"
  | "invalid_input"
  | "revision_conflict"
  | "idempotency_conflict"
  | "unavailable"

export class WorkstationDomainError extends Error {
  constructor(readonly code: DomainErrorCode, message: string) {
    super(message)
    this.name = "WorkstationDomainError"
  }
}

export interface WorkstationSnapshot {
  readonly organizationId: string
  readonly currentUser: OrganizationMember
  readonly members: readonly OrganizationMember[]
  readonly spaces: readonly Space[]
  readonly processes: readonly RedRiseProcess[]
  readonly nodes: readonly RedRiseNode[]
  readonly connections: readonly NodeConnection[]
  readonly processRuns: readonly ProcessRun[]
  readonly nodeRuns: readonly ActionNodeRun[]
  readonly revision: number
}

export interface WorkstationRepository {
  getSnapshot(): WorkstationSnapshot
  subscribe(listener: () => void): () => void
  createSpace(input: CreateSpaceInput): Promise<Space>
  updateSpace(id: string, patch: Pick<Space, "name" | "description">): Promise<Space>
  archiveSpace(id: string): Promise<Space>
  addSpaceMember(spaceId: string, input: AddSpaceMemberInput): Promise<Space>
  createProcess(input: CreateProcessInput): Promise<RedRiseProcess>
  updateProcess(id: string, patch: Pick<RedRiseProcess, "name" | "description" | "owner" | "frequency">): Promise<RedRiseProcess>
  setProcessStatus(id: string, status: RedRiseProcess["status"]): Promise<RedRiseProcess>
  createNode(processId: string): Promise<RedRiseNode>
  updateNode(nodeId: string, patch: Partial<RedRiseNode>): Promise<RedRiseNode>
  duplicateNode(nodeId: string): Promise<RedRiseNode>
  deleteNode(nodeId: string): Promise<void>
  connectNodes(input: Omit<NodeConnection, "id" | "organizationId" | "spaceId" | "createdAt">): Promise<NodeConnection>
}

export interface ExecutionRuntime {
  startProcess(processId: string, triggeredBy?: string): Promise<ProcessRun>
  cancelRun(processRunId: string): Promise<ProcessRun>
  retryNodeRun(nodeRunId: string): Promise<ActionNodeRun>
}

export interface AuthorizationPolicy {
  capabilitiesFor(role: OrganizationRole | SpaceRole): ReadonlySet<WorkstationCapability>
  can(capability: WorkstationCapability, spaceId?: string): boolean
}

const ROLE_CAPABILITIES: Record<OrganizationRole, readonly WorkstationCapability[]> = {
  Admin: ["space.read", "space.manage", "space.members.manage", "process.read", "process.manage", "process.run", "run.read", "run.retry"],
  Owner: ["space.read", "space.manage", "space.members.manage", "process.read", "process.manage", "process.run", "run.read", "run.retry"],
  Board: ["space.read", "space.manage", "space.members.manage", "process.read", "process.manage", "process.run", "run.read", "run.retry"],
  Staff: ["space.read", "space.manage", "process.read", "process.manage", "process.run", "run.read", "run.retry"],
  User: ["space.read", "process.read", "process.run", "run.read"],
  Viewer: ["space.read", "process.read", "run.read"],
}

export class FixtureAuthorizationPolicy implements AuthorizationPolicy {
  constructor(private readonly role: OrganizationRole, private readonly assignedSpaceIds: ReadonlySet<string>) {}

  capabilitiesFor(role: OrganizationRole | SpaceRole) {
    return new Set(ROLE_CAPABILITIES[role])
  }

  can(capability: WorkstationCapability, spaceId?: string) {
    if (!ROLE_CAPABILITIES[this.role].includes(capability)) return false
    if (!spaceId || ["Admin", "Owner", "Board"].includes(this.role)) return true
    return this.assignedSpaceIds.has(spaceId)
  }
}

export interface WorkstationAdapterOptions {
  organizationId?: string
  idFactory?: () => string
  now?: () => Date
  delay?: (milliseconds: number) => Promise<void>
}

const clone = <T>(value: T): T => structuredClone(value)
const duration = (start?: string, end?: string) => start && end ? `${Math.max(1, Math.round((Date.parse(end) - Date.parse(start)) / 1000))}s` : "Running"

export class InMemoryWorkstationAdapter implements WorkstationRepository, ExecutionRuntime {
  private readonly listeners = new Set<() => void>()
  private readonly organizationId: string
  private readonly idFactory: () => string
  private readonly now: () => Date
  private readonly delay: (milliseconds: number) => Promise<void>
  private revision = 0
  private snapshotCache?: WorkstationSnapshot
  private members = clone(mockOrganizationMembers)
  private spaces = clone(mockSpaces)
  private processes = clone(mockProcesses)
  private nodes = clone(mockCanvasNodes)
  private connections = clone(mockNodeConnections)
  private processRuns = clone(mockProcessRuns)
  private nodeRuns: ActionNodeRun[] = clone(mockActionNodeRuns).map((run) => ({ ...run, attempt: Number(run.metadata.attempts ?? 1) }))

  constructor(options: WorkstationAdapterOptions = {}) {
    this.organizationId = options.organizationId ?? "org-redrise"
    this.idFactory = options.idFactory ?? (() => crypto.randomUUID())
    this.now = options.now ?? (() => new Date())
    this.delay = options.delay ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)))
  }

  getSnapshot(): WorkstationSnapshot {
    this.snapshotCache ??= {
      organizationId: this.organizationId,
      currentUser: this.members[0]!,
      members: this.members,
      spaces: this.spaces,
      processes: this.processes,
      nodes: this.nodes,
      connections: this.connections,
      processRuns: this.processRuns,
      nodeRuns: this.nodeRuns,
      revision: this.revision,
    }
    return this.snapshotCache
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private publish() {
    this.revision += 1
    this.snapshotCache = undefined
    this.listeners.forEach((listener) => listener())
  }

  private requireSpace(id: string) {
    const space = this.spaces.find((item) => item.id === id)
    if (!space) throw new WorkstationDomainError("not_found", "Space not found.")
    return space
  }

  private requireProcess(id: string) {
    const process = this.processes.find((item) => item.id === id)
    if (!process) throw new WorkstationDomainError("not_found", "Process not found.")
    return process
  }

  async createSpace(input: CreateSpaceInput) {
    const now = this.now().toISOString()
    const members = input.members.flatMap((assignment) => {
      const member = this.members.find((item) => item.id === assignment.memberId && item.status === "accepted")
      return member ? [{ id: this.idFactory(), memberId: member.id, name: member.name, email: member.email, spaceRole: assignment.role, organizationRole: member.organizationRole, status: "Active" as const }] : []
    })
    const space: Space = {
      id: this.idFactory(), organizationId: this.organizationId, name: input.name, description: input.description,
      membersCount: members.length, rolesSummary: Array.from(new Set(members.map((member) => member.spaceRole))).join(", ") || "No roles",
      processesCount: 0, actionsCount: 0, lastActivity: "Just now", status: "Draft", members,
      createdAt: now, updatedAt: now, createdBy: this.members[0]!.id, updatedBy: this.members[0]!.id,
    }
    this.spaces = [space, ...this.spaces]
    this.publish()
    return space
  }

  async updateSpace(id: string, patch: Pick<Space, "name" | "description">) {
    const current = this.requireSpace(id)
    const updated = { ...current, ...patch, updatedAt: this.now().toISOString(), updatedBy: this.members[0]!.id, lastActivity: "Just now" }
    this.spaces = this.spaces.map((space) => space.id === id ? updated : space)
    this.publish()
    return updated
  }

  async archiveSpace(id: string) {
    const current = this.requireSpace(id)
    const updated = { ...current, status: "Archived" as const, updatedAt: this.now().toISOString(), updatedBy: this.members[0]!.id }
    this.spaces = this.spaces.map((space) => space.id === id ? updated : space)
    this.publish()
    return updated
  }

  async addSpaceMember(spaceId: string, input: AddSpaceMemberInput) {
    const current = this.requireSpace(spaceId)
    const member = this.members.find((item) => item.id === input.memberId && item.status === "accepted")
    if (!member) throw new WorkstationDomainError("invalid_input", "Select an accepted organization member.")
    const nextMember = { id: this.idFactory(), memberId: member.id, name: member.name, email: member.email, spaceRole: input.role, organizationRole: member.organizationRole, status: "Active" as const }
    const members = [...current.members.filter((item) => item.memberId !== member.id), nextMember]
    const updated = { ...current, members, membersCount: members.length, rolesSummary: Array.from(new Set(members.map((item) => item.spaceRole))).join(", "), updatedAt: this.now().toISOString(), updatedBy: this.members[0]!.id }
    this.spaces = this.spaces.map((space) => space.id === spaceId ? updated : space)
    this.publish()
    return updated
  }

  async createProcess(input: CreateProcessInput) {
    const space = this.requireSpace(input.spaceId)
    const now = this.now().toISOString()
    const process: RedRiseProcess = {
      id: this.idFactory(), organizationId: this.organizationId, spaceId: space.id, spaceName: space.name,
      name: input.name, description: input.description, owner: input.owner, status: "draft", frequency: input.frequency,
      nodesCount: 1, actionsCount: 0, lastRun: "Not activated", updatedAt: now, createdAt: now,
      createdBy: this.members[0]!.id, updatedBy: this.members[0]!.id,
    }
    const node: RedRiseNode = {
      id: this.idFactory(), organizationId: this.organizationId, spaceId: space.id, processId: process.id,
      nodeType: input.initialNodeType, title: `Initial ${input.initialNodeType} node`, position: { x: 160, y: 160 }, enabled: true,
      instruction: "Describe what this node should plan, prepare, execute and return.", inputMode: "manual", inputMapping: {},
      outputType: "markdown", outputContract: {}, config: {}, failureBehavior: "stop_process", createdBy: this.members[0]!.name,
      updatedBy: this.members[0]!.name, createdAt: now, updatedAt: now,
    }
    this.processes = [process, ...this.processes]
    this.nodes = [...this.nodes, node]
    this.spaces = this.spaces.map((item) => item.id === space.id ? { ...item, processesCount: item.processesCount + 1, updatedAt: now } : item)
    this.publish()
    return process
  }

  async updateProcess(id: string, patch: Pick<RedRiseProcess, "name" | "description" | "owner" | "frequency">) {
    const current = this.requireProcess(id)
    const updated = { ...current, ...patch, updatedAt: this.now().toISOString(), updatedBy: this.members[0]!.id }
    this.processes = this.processes.map((process) => process.id === id ? updated : process)
    this.publish()
    return updated
  }

  async setProcessStatus(id: string, status: RedRiseProcess["status"]) {
    const current = this.requireProcess(id)
    const updated = { ...current, status, updatedAt: this.now().toISOString(), updatedBy: this.members[0]!.id }
    this.processes = this.processes.map((process) => process.id === id ? updated : process)
    this.publish()
    return updated
  }

  async createNode(processId: string) {
    const process = this.requireProcess(processId)
    const now = this.now().toISOString()
    const node: RedRiseNode = {
      id: this.idFactory(), organizationId: this.organizationId, spaceId: process.spaceId, processId,
      nodeType: "llm", title: "New LLM Node", description: "Draft node.", position: { x: 220 + this.nodes.filter((item) => item.processId === processId).length * 80, y: 360 },
      enabled: true, instruction: "Describe what this node should plan, prepare, execute and return.", inputMode: "previous_node", inputMapping: {},
      outputType: "markdown", outputContract: {}, config: { model: "default" }, failureBehavior: "stop_process",
      createdBy: this.members[0]!.name, updatedBy: this.members[0]!.name, createdAt: now, updatedAt: now,
    }
    this.nodes = [...this.nodes, node]
    this.processes = this.processes.map((item) => item.id === processId ? { ...item, nodesCount: item.nodesCount + 1, updatedAt: now } : item)
    this.publish()
    return node
  }

  async updateNode(nodeId: string, patch: Partial<RedRiseNode>) {
    const current = this.nodes.find((item) => item.id === nodeId)
    if (!current) throw new WorkstationDomainError("not_found", "Node not found.")
    const updated = { ...current, ...patch, id: current.id, organizationId: current.organizationId, processId: current.processId, spaceId: current.spaceId, updatedAt: this.now().toISOString(), updatedBy: this.members[0]!.name }
    this.nodes = this.nodes.map((node) => node.id === nodeId ? updated : node)
    this.publish()
    return updated
  }

  async duplicateNode(nodeId: string) {
    const current = this.nodes.find((item) => item.id === nodeId)
    if (!current) throw new WorkstationDomainError("not_found", "Node not found.")
    const now = this.now().toISOString()
    const duplicate = { ...clone(current), id: this.idFactory(), title: `${current.title} copy`, position: { x: current.position.x + 48, y: current.position.y + 48 }, createdAt: now, updatedAt: now }
    this.nodes = [...this.nodes, duplicate]
    this.processes = this.processes.map((item) => item.id === current.processId ? { ...item, nodesCount: item.nodesCount + 1, updatedAt: now } : item)
    this.publish()
    return duplicate
  }

  async deleteNode(nodeId: string) {
    const current = this.nodes.find((item) => item.id === nodeId)
    if (!current) throw new WorkstationDomainError("not_found", "Node not found.")
    this.nodes = this.nodes.filter((node) => node.id !== nodeId)
    this.connections = this.connections.filter((connection) => connection.sourceNodeId !== nodeId && connection.targetNodeId !== nodeId)
    this.processes = this.processes.map((item) => item.id === current.processId ? { ...item, nodesCount: Math.max(0, item.nodesCount - 1), updatedAt: this.now().toISOString() } : item)
    this.publish()
  }

  async connectNodes(input: Omit<NodeConnection, "id" | "organizationId" | "spaceId" | "createdAt">) {
    const process = this.requireProcess(input.processId)
    const connection: NodeConnection = { ...input, id: this.idFactory(), organizationId: this.organizationId, spaceId: process.spaceId, createdAt: this.now().toISOString() }
    this.connections = [...this.connections, connection]
    this.publish()
    return connection
  }

  async startProcess(processId: string, triggeredBy = this.members[0]!.name) {
    const process = this.requireProcess(processId)
    if (process.status === "archived" || process.status === "paused") throw new WorkstationDomainError("invalid_transition", "Activate the Process before running it.")
    const startedAt = this.now().toISOString()
    const run: ProcessRun = { id: this.idFactory(), organizationId: this.organizationId, spaceId: process.spaceId, spaceName: process.spaceName, processId, processName: process.name, triggerType: "manual", triggeredBy, status: "queued", startedAt, duration: "Queued" }
    const nodes = this.nodes.filter((node) => node.processId === processId && node.enabled)
    const nodeRuns = nodes.map<ActionNodeRun>((node) => ({
      id: this.idFactory(), processRunId: run.id, nodeId: node.id, nodeTitle: node.title, nodeType: node.nodeType,
      processId, processName: process.name, spaceId: process.spaceId, spaceName: process.spaceName, status: "queued", stage: "plan",
      startedAt, duration: "Queued", modelName: String(node.config.model ?? "Deterministic simulator"), triggerType: "manual", triggeredBy,
      outputType: node.outputType, metadata: { attempts: 1, simulator: true }, attempt: 1,
    }))
    this.processRuns = [run, ...this.processRuns]
    this.nodeRuns = [...nodeRuns, ...this.nodeRuns]
    this.publish()
    void this.executeRun(run.id, nodes)
    return run
  }

  private async executeRun(processRunId: string, nodes: readonly RedRiseNode[]) {
    this.processRuns = this.processRuns.map((run) => run.id === processRunId ? { ...run, status: "running", duration: "Running" } : run)
    this.publish()
    for (const node of nodes) {
      for (const status of ["planning", "preparing", "executing"] as const) {
        await this.delay(180)
        this.nodeRuns = this.nodeRuns.map((run) => run.processRunId === processRunId && run.nodeId === node.id && run.status !== "cancelled" ? {
          ...run, status, stage: getActionStage(status), duration: "Running",
          ...(status === "planning" ? { planSummary: `Plan ${node.title} using its configured input contract.` } : {}),
          ...(status === "preparing" ? { prepareSummary: `Prepare ${node.nodeType} execution parameters.` } : {}),
          ...(status === "executing" ? { executeSummary: `Execute ${node.title} with the deterministic adapter.` } : {}),
        } : run)
        this.publish()
      }
      await this.delay(180)
      const completedAt = this.now().toISOString()
      const shouldFail = node.config.simulateFailure === true
      this.nodeRuns = this.nodeRuns.map((run) => run.processRunId === processRunId && run.nodeId === node.id ? {
        ...run, status: shouldFail ? "failed" : "completed", stage: "result", completedAt,
        duration: duration(run.startedAt, completedAt), resultSummary: shouldFail ? "Deterministic failure requested by node configuration." : `${node.title} completed successfully.`,
        outputSnapshot: shouldFail ? { ok: false } : { ok: true, nodeId: node.id },
        ...(shouldFail ? { errorMessage: "Simulated execution failure.", failedStage: "execute" as const, suggestedNextAction: "Review node configuration and retry." } : {}),
      } : run)
      this.publish()
      if (shouldFail && node.failureBehavior === "stop_process") break
    }
    const failed = this.nodeRuns.some((run) => run.processRunId === processRunId && run.status === "failed")
    const completedAt = this.now().toISOString()
    this.processRuns = this.processRuns.map((run) => run.id === processRunId ? { ...run, status: failed ? "failed" : "completed", completedAt, duration: duration(run.startedAt, completedAt) } : run)
    this.publish()
  }

  async cancelRun(processRunId: string) {
    const current = this.processRuns.find((run) => run.id === processRunId)
    if (!current) throw new WorkstationDomainError("not_found", "Run not found.")
    if (!["queued", "running"].includes(current.status)) throw new WorkstationDomainError("invalid_transition", "Only queued or running Runs can be cancelled.")
    const completedAt = this.now().toISOString()
    const updated = { ...current, status: "cancelled" as const, completedAt, duration: duration(current.startedAt, completedAt) }
    this.processRuns = this.processRuns.map((run) => run.id === processRunId ? updated : run)
    this.nodeRuns = this.nodeRuns.map((run) => run.processRunId === processRunId && !["completed", "failed"].includes(run.status) ? { ...run, status: "cancelled", stage: "result", completedAt } : run)
    this.publish()
    return updated
  }

  async retryNodeRun(nodeRunId: string) {
    const previous = this.nodeRuns.find((run) => run.id === nodeRunId)
    if (!previous) throw new WorkstationDomainError("not_found", "Node Run not found.")
    if (previous.status !== "failed") throw new WorkstationDomainError("invalid_transition", "Only failed Node Runs can be retried.")
    const startedAt = this.now().toISOString()
    const attempt = (previous.attempt ?? Number(previous.metadata.attempts ?? 1)) + 1
    const retry: ActionNodeRun = { ...previous, id: this.idFactory(), status: "queued", stage: "plan", startedAt, completedAt: undefined, duration: "Queued", errorMessage: undefined, failedStage: undefined, suggestedNextAction: undefined, resultSummary: undefined, outputSnapshot: undefined, attempt, retriedFromNodeRunId: previous.id, metadata: { ...previous.metadata, attempts: attempt } }
    this.nodeRuns = [retry, ...this.nodeRuns]
    this.processRuns = this.processRuns.map((run) => run.id === previous.processRunId ? { ...run, status: "running", completedAt: undefined, duration: "Running" } : run)
    this.publish()
    void this.executeRetry(retry.id)
    return retry
  }

  private async executeRetry(id: string) {
    for (const status of ["planning", "preparing", "executing", "completed"] as const) {
      await this.delay(180)
      const completedAt = status === "completed" ? this.now().toISOString() : undefined
      this.nodeRuns = this.nodeRuns.map((run) => run.id === id ? { ...run, status, stage: getActionStage(status), completedAt, duration: completedAt ? duration(run.startedAt, completedAt) : "Running", ...(completedAt ? { resultSummary: "Retry completed successfully.", outputSnapshot: { ok: true, retry: true } } : {}) } : run)
      this.publish()
    }
    const retry = this.nodeRuns.find((run) => run.id === id)
    if (!retry) return
    const completedAt = this.now().toISOString()
    this.processRuns = this.processRuns.map((run) => run.id === retry.processRunId ? { ...run, status: "completed", completedAt, duration: duration(run.startedAt, completedAt) } : run)
    this.publish()
  }
}