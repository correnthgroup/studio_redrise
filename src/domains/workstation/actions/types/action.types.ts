export const actionStages = ["plan", "prepare", "execute", "result"] as const
export const processRunStatuses = ["queued", "running", "completed", "failed", "cancelled"] as const
export const actionNodeRunStatuses = ["queued", "planning", "preparing", "executing", "completed", "failed", "skipped", "cancelled"] as const
export const actionTriggerTypes = ["manual", "schedule", "webhook", "integration", "process"] as const

export type ActionStage = (typeof actionStages)[number]
export type ProcessRunStatus = (typeof processRunStatuses)[number]
export type ActionNodeRunStatus = (typeof actionNodeRunStatuses)[number]
export type ActionTriggerType = (typeof actionTriggerTypes)[number]

export type ProcessRun = {
  id: string
  organizationId: string
  spaceId: string
  spaceName: string
  processId: string
  processName: string
  triggerType: ActionTriggerType
  triggeredBy: string
  status: ProcessRunStatus
  startedAt?: string
  completedAt?: string
  duration: string
}

export type ActionStageSummary = {
  status: ActionNodeRunStatus
  startedAt?: string
  completedAt?: string
  summary: string
}

export type ActionNodeRun = {
  id: string
  processRunId: string
  nodeId: string
  nodeTitle: string
  nodeType: string
  processId: string
  processName: string
  spaceId: string
  spaceName: string
  status: ActionNodeRunStatus
  stage: ActionStage
  startedAt?: string
  completedAt?: string
  duration: string
  modelName: string
  triggerType: ActionTriggerType
  triggeredBy: string
  planSummary?: string
  prepareSummary?: string
  executeSummary?: string
  resultSummary?: string
  inputSnapshot?: Record<string, unknown>
  outputSnapshot?: Record<string, unknown>
  outputType: "text" | "markdown" | "json" | "file" | "email" | "boolean" | "external_action_result"
  errorMessage?: string
  failedStage?: ActionStage
  suggestedNextAction?: string
  metadata: Record<string, unknown>
}

export type ActionFilters = {
  spaceId: string
  processId: string
  status: string
  dateRange: string
  search: string
}
