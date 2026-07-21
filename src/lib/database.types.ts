/**
 * Tipos do banco durável do Workstation (PRD-024, Fase 1).
 *
 * Mantidos à mão e conferidos contra `supabase/migrations/050_*.sql` e
 * `051_*.sql` (ADR-001). Quando Docker/CLI estiverem disponíveis, este arquivo
 * pode ser conferido/regenerado com `npx supabase gen types typescript --local`.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type OrganizationRow = {
  id: string
  slug: string
  name: string
  status: "active" | "suspended" | "archived"
  created_at: string
  updated_at: string
}

export type OrganizationMemberRow = {
  id: string
  organization_id: string
  user_id: string
  role: "Admin" | "Owner" | "Board" | "Staff" | "User" | "Viewer"
  status: "accepted" | "pending" | "declined" | "revoked"
  display_name: string
  email: string
  created_at: string
  updated_at: string
}

export type SpaceRow = {
  id: string
  organization_id: string
  name: string
  description: string
  status: "Active" | "Draft" | "Archived"
  revision: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type SpaceMemberRow = {
  id: string
  organization_id: string
  space_id: string
  member_id: string
  space_role: "Admin" | "Owner" | "Board" | "Staff" | "User" | "Viewer"
  created_by: string | null
  created_at: string
}

export type ProcessRow = {
  id: string
  organization_id: string
  space_id: string
  name: string
  description: string
  owner: string
  status: "draft" | "active" | "paused" | "archived"
  frequency: "realtime" | "hourly" | "daily" | "weekly" | "manual"
  revision: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type ProcessNodeRow = {
  id: string
  organization_id: string
  space_id: string
  process_id: string
  node_type:
    | "llm"
    | "api"
    | "browser"
    | "file"
    | "email"
    | "database"
    | "webhook"
    | "human_approval"
    | "condition"
    | "integration"
    | "call_process"
  title: string
  description: string | null
  position_x: number
  position_y: number
  enabled: boolean
  instruction: string
  input_mode: "previous_node" | "manual" | "attachment" | "integration" | "mixed"
  input_mapping: Json
  output_type: "text" | "markdown" | "json" | "file" | "email" | "boolean" | "external_action_result"
  output_contract: Json | null
  config: Json
  failure_behavior: "stop_process" | "follow_failure_path"
  revision: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type NodeConnectionRow = {
  id: string
  organization_id: string
  space_id: string
  process_id: string
  source_node_id: string
  target_node_id: string
  connection_type: "success" | "failure" | "default"
  created_by: string | null
  created_at: string
}

export type ProcessRunRow = {
  id: string
  organization_id: string
  space_id: string
  process_id: string
  status: "queued" | "running" | "completed" | "failed" | "cancelled"
  trigger_type: "manual" | "schedule" | "webhook" | "integration" | "process"
  triggered_by: string
  triggered_by_member_id: string | null
  queued_at: string
  started_at: string | null
  finished_at: string | null
  cancel_requested_at: string | null
  cancel_requested_by: string | null
  heartbeat_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export type NodeRunRow = {
  id: string
  organization_id: string
  space_id: string
  process_id: string
  process_run_id: string
  node_id: string | null
  node_title: string
  node_type: string
  output_type: string
  model_name: string
  status: "queued" | "planning" | "preparing" | "executing" | "completed" | "failed" | "skipped" | "cancelled"
  stage: "plan" | "prepare" | "execute" | "result"
  attempt: number
  retried_from_node_run_id: string | null
  plan_summary: string | null
  prepare_summary: string | null
  execute_summary: string | null
  result_summary: string | null
  input_snapshot: Json | null
  output_snapshot: Json | null
  error_message: string | null
  failed_stage: "plan" | "prepare" | "execute" | "result" | null
  suggested_next_action: string | null
  metadata: Json
  queued_at: string
  started_at: string | null
  finished_at: string | null
  heartbeat_at: string | null
  created_at: string
  updated_at: string
}

export type RunEventRow = {
  id: number
  organization_id: string
  process_run_id: string | null
  node_run_id: string | null
  event_type: string
  payload: Json
  created_at: string
}

export type OutboxEventRow = {
  id: string
  organization_id: string
  event_type: string
  payload: Json
  status: "pending" | "processing" | "completed" | "failed" | "dead"
  available_at: string
  attempts: number
  max_attempts: number
  lease_id: string | null
  leased_by: string | null
  lease_expires_at: string | null
  fence: number
  last_error: string | null
  dedupe_key: string | null
  created_at: string
  updated_at: string
}

export type IdempotencyKeyRow = {
  id: string
  organization_id: string
  actor_id: string
  idempotency_key: string
  command_type: string
  payload_hash: string
  status: "in_progress" | "completed" | "failed"
  response_status: number | null
  response_body: Json | null
  expires_at: string
  created_at: string
  updated_at: string
}

export type WorkerLeaseRow = {
  lease_key: string
  holder: string | null
  fence: number
  expires_at: string | null
  updated_at: string
}

export type DeadLetterEventRow = {
  id: string
  organization_id: string
  outbox_event_id: string | null
  event_type: string
  payload: Json
  failure_reason: string
  attempts: number
  replayed_at: string | null
  replayed_by: string | null
  replay_reason: string | null
  replay_new_event_id: string | null
  created_at: string
}

export type AuditLogRow = {
  id: number
  organization_id: string
  actor_user_id: string | null
  actor_member_id: string | null
  request_id: string | null
  command_id: string | null
  idempotency_key: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  before_state: Json | null
  after_state: Json | null
  created_at: string
}

type TableDefinition<Row, RequiredInsert extends keyof Row> = {
  Row: Row
  Insert: Pick<Row, RequiredInsert> & Partial<Omit<Row, RequiredInsert>>
  Update: Partial<Row>
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      organizations: TableDefinition<OrganizationRow, "slug" | "name">
      organization_members: TableDefinition<OrganizationMemberRow, "organization_id" | "user_id" | "role">
      spaces: TableDefinition<SpaceRow, "organization_id" | "name">
      space_members: TableDefinition<SpaceMemberRow, "organization_id" | "space_id" | "member_id" | "space_role">
      processes: TableDefinition<ProcessRow, "organization_id" | "space_id" | "name">
      process_nodes: TableDefinition<ProcessNodeRow, "organization_id" | "space_id" | "process_id" | "node_type">
      node_connections: TableDefinition<
        NodeConnectionRow,
        "organization_id" | "space_id" | "process_id" | "source_node_id" | "target_node_id"
      >
      process_runs: TableDefinition<ProcessRunRow, "organization_id" | "space_id" | "process_id">
      node_runs: TableDefinition<NodeRunRow, "organization_id" | "space_id" | "process_id" | "process_run_id">
      run_events: TableDefinition<RunEventRow, "organization_id" | "event_type">
      outbox_events: TableDefinition<OutboxEventRow, "organization_id" | "event_type">
      idempotency_keys: TableDefinition<
        IdempotencyKeyRow,
        "organization_id" | "actor_id" | "idempotency_key" | "command_type" | "payload_hash" | "expires_at"
      >
      worker_leases: TableDefinition<WorkerLeaseRow, "lease_key">
      dead_letter_events: TableDefinition<DeadLetterEventRow, "organization_id" | "event_type" | "failure_reason">
      audit_log: TableDefinition<AuditLogRow, "organization_id" | "action">
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
