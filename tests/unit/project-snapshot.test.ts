import { describe, expect, it } from "vitest"

import { projectWorkstationSnapshot } from "@/domains/workstation/server/project-snapshot"

describe("projectWorkstationSnapshot", () => {
  it("projects durable rows into the UI WorkstationSnapshot contract", () => {
    const { snapshot, revisions } = projectWorkstationSnapshot({
      organizationId: "org-1",
      currentUserId: "user-1",
      members: [
        {
          id: "mem-1",
          organization_id: "org-1",
          user_id: "user-1",
          role: "Admin",
          status: "accepted",
          display_name: "Ada",
          email: "ada@example.com",
          created_at: "2026-07-21T00:00:00.000Z",
          updated_at: "2026-07-21T00:00:00.000Z",
        },
      ],
      spaces: [
        {
          id: "space-1",
          organization_id: "org-1",
          name: "Ops",
          description: "Operations",
          status: "Active",
          revision: 3,
          created_by: "user-1",
          updated_by: "user-1",
          created_at: "2026-07-21T00:00:00.000Z",
          updated_at: "2026-07-21T01:00:00.000Z",
        },
      ],
      spaceMembers: [
        {
          id: "sm-1",
          organization_id: "org-1",
          space_id: "space-1",
          member_id: "mem-1",
          space_role: "Admin",
          created_by: "user-1",
          created_at: "2026-07-21T00:00:00.000Z",
        },
      ],
      processes: [
        {
          id: "proc-1",
          organization_id: "org-1",
          space_id: "space-1",
          name: "Intake",
          description: "Intake process",
          owner: "Ada",
          status: "active",
          frequency: "manual",
          revision: 2,
          created_by: "user-1",
          updated_by: "user-1",
          created_at: "2026-07-21T00:00:00.000Z",
          updated_at: "2026-07-21T01:00:00.000Z",
        },
      ],
      nodes: [
        {
          id: "node-1",
          organization_id: "org-1",
          space_id: "space-1",
          process_id: "proc-1",
          node_type: "llm",
          title: "Classify",
          description: null,
          position_x: 10,
          position_y: 20,
          enabled: true,
          instruction: "Classify",
          input_mode: "manual",
          input_mapping: {},
          output_type: "markdown",
          output_contract: null,
          config: { model: "x" },
          failure_behavior: "stop_process",
          revision: 1,
          created_by: "user-1",
          updated_by: "user-1",
          created_at: "2026-07-21T00:00:00.000Z",
          updated_at: "2026-07-21T00:00:00.000Z",
        },
      ],
      connections: [],
      processRuns: [
        {
          id: "run-1",
          organization_id: "org-1",
          space_id: "space-1",
          process_id: "proc-1",
          status: "queued",
          trigger_type: "manual",
          triggered_by: "Ada",
          triggered_by_member_id: "mem-1",
          queued_at: "2026-07-21T02:00:00.000Z",
          started_at: null,
          finished_at: null,
          cancel_requested_at: null,
          cancel_requested_by: null,
          heartbeat_at: null,
          error_message: null,
          created_at: "2026-07-21T02:00:00.000Z",
          updated_at: "2026-07-21T02:00:00.000Z",
        },
      ],
      nodeRuns: [
        {
          id: "nr-1",
          organization_id: "org-1",
          space_id: "space-1",
          process_id: "proc-1",
          process_run_id: "run-1",
          node_id: "node-1",
          node_title: "Classify",
          node_type: "llm",
          output_type: "markdown",
          model_name: "x",
          status: "queued",
          stage: "plan",
          attempt: 1,
          retried_from_node_run_id: null,
          plan_summary: null,
          prepare_summary: null,
          execute_summary: null,
          result_summary: null,
          input_snapshot: null,
          output_snapshot: null,
          error_message: null,
          failed_stage: null,
          suggested_next_action: null,
          metadata: { attempts: 1 },
          queued_at: "2026-07-21T02:00:00.000Z",
          started_at: null,
          finished_at: null,
          heartbeat_at: null,
          created_at: "2026-07-21T02:00:00.000Z",
          updated_at: "2026-07-21T02:00:00.000Z",
        },
      ],
    })

    expect(snapshot.currentUser).toMatchObject({ id: "mem-1", name: "Ada", organizationRole: "Admin" })
    expect(snapshot.spaces[0]).toMatchObject({
      name: "Ops",
      membersCount: 1,
      processesCount: 1,
      actionsCount: 1,
      rolesSummary: "Admin",
    })
    expect(snapshot.processes[0]).toMatchObject({ spaceName: "Ops", nodesCount: 1, actionsCount: 1 })
    expect(snapshot.nodes[0]).toMatchObject({ title: "Classify", position: { x: 10, y: 20 } })
    expect(snapshot.processRuns[0]).toMatchObject({ status: "queued", duration: "Queued", processName: "Intake" })
    expect(snapshot.nodeRuns[0]).toMatchObject({ nodeTitle: "Classify", attempt: 1, stage: "plan" })
    expect(revisions).toEqual({
      spaces: { "space-1": 3 },
      processes: { "proc-1": 2 },
      nodes: { "node-1": 1 },
    })
  })
})
