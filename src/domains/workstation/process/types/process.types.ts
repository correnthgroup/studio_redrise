export const processStatuses = ["draft", "active", "paused", "archived"] as const

export const processFrequencies = ["realtime", "hourly", "daily", "weekly", "manual"] as const

export const nodeTypes = [
  "llm",
  "api",
  "browser",
  "file",
  "email",
  "database",
  "webhook",
  "human_approval",
  "condition",
  "integration",
  "call_process",
] as const

export const inputModes = ["previous_node", "manual", "attachment", "integration", "mixed"] as const

export const outputTypes = ["text", "markdown", "json", "file", "email", "boolean", "external_action_result"] as const

export const failureBehaviors = ["stop_process", "follow_failure_path"] as const

export const connectionTypes = ["success", "failure", "default"] as const

export const nodeRunStatuses = ["queued", "planning", "preparing", "executing", "completed", "failed", "skipped", "cancelled"] as const

export type ProcessStatus = (typeof processStatuses)[number]
export type ProcessFrequency = (typeof processFrequencies)[number]
export type RedRiseNodeType = (typeof nodeTypes)[number]
export type RedRiseInputMode = (typeof inputModes)[number]
export type RedRiseOutputType = (typeof outputTypes)[number]
export type RedRiseFailureBehavior = (typeof failureBehaviors)[number]
export type NodeConnectionType = (typeof connectionTypes)[number]
export type NodeRunStatus = (typeof nodeRunStatuses)[number]

export type RedRiseProcess = {
  id: string
  organizationId: string
  spaceId: string
  spaceName: string
  name: string
  description: string
  owner: string
  status: ProcessStatus
  frequency: ProcessFrequency
  nodesCount: number
  actionsCount: number
  lastRun: string
  updatedAt: string
}

export type RedRiseNode = {
  id: string
  organizationId: string
  spaceId: string
  processId: string
  nodeType: RedRiseNodeType
  title: string
  description?: string
  position: {
    x: number
    y: number
  }
  enabled: boolean
  instruction: string
  inputMode: RedRiseInputMode
  inputMapping: Record<string, unknown>
  outputType: RedRiseOutputType
  outputContract?: Record<string, unknown>
  config: Record<string, unknown>
  failureBehavior: RedRiseFailureBehavior
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export type NodeConnection = {
  id: string
  organizationId: string
  spaceId: string
  processId: string
  sourceNodeId: string
  targetNodeId: string
  connectionType: NodeConnectionType
  createdAt: string
}

export type NodeRun = {
  id: string
  processRunId: string
  nodeId: string
  status: NodeRunStatus
  planSummary?: string
  prepareSummary?: string
  executeSummary?: string
  resultSummary?: string
  inputSnapshot?: Record<string, unknown>
  outputSnapshot?: Record<string, unknown>
  errorMessage?: string
  startedAt?: string
  completedAt?: string
}
