import { describe, expect, it } from "vitest"

import { WorkstationDomainError } from "@/domains/workstation/core/workstation"
import { mapRpcError, toSerializableError } from "@/domains/workstation/server/rpc-errors"

describe("rpc error mapping", () => {
  it("maps detail codes from Postgres raise()", () => {
    expect(() => mapRpcError({ message: "Space not found.", details: "not_found" })).toThrowError(
      WorkstationDomainError,
    )
    try {
      mapRpcError({ message: "Space not found.", details: "not_found" })
    } catch (error) {
      expect(error).toMatchObject({ code: "not_found", message: "Space not found." })
    }
  })

  it("serializes domain and unknown errors", () => {
    expect(toSerializableError(new WorkstationDomainError("revision_conflict", "stale"))).toEqual({
      code: "revision_conflict",
      message: "stale",
    })
    expect(toSerializableError(new Error("boom"))).toEqual({ code: "unavailable", message: "boom" })
  })
})
