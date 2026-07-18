import { z } from "zod"

import { nodeTypes, processFrequencies } from "@/domains/workstation/process/types/process.types"

export const createProcessSchema = z.object({
  spaceId: z.string().min(1, "Select a Space."),
  name: z.string().trim().min(2, "Process name is required."),
  description: z.string().trim().min(6, "Description is required."),
  frequency: z.enum(processFrequencies, { message: "Select a trigger frequency." }),
  owner: z.string().min(1, "Select an owner."),
  initialNodeType: z.enum(nodeTypes, { message: "Select an initial node type." }),
})

export type CreateProcessInput = z.infer<typeof createProcessSchema>
