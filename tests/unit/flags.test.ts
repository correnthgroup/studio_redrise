import { afterEach, describe, expect, it } from "vitest"

import { isWorkstationDurableEnabled, isWorkstationDurableEnabledForOrganization } from "@/lib/flags"

const originalDurable = process.env.WORKSTATION_DURABLE
const originalOrgs = process.env.WORKSTATION_DURABLE_ORGS

function setEnv(durable: string | undefined, orgs: string | undefined) {
  if (durable === undefined) delete process.env.WORKSTATION_DURABLE
  else process.env.WORKSTATION_DURABLE = durable
  if (orgs === undefined) delete process.env.WORKSTATION_DURABLE_ORGS
  else process.env.WORKSTATION_DURABLE_ORGS = orgs
}

afterEach(() => {
  setEnv(originalDurable, originalOrgs)
})

describe("workstation durable flags (PRD-024 §13)", () => {
  it("fica desligado por padrão", () => {
    setEnv(undefined, undefined)
    expect(isWorkstationDurableEnabled()).toBe(false)
    expect(isWorkstationDurableEnabledForOrganization("acme")).toBe(false)
  })

  it("valores diferentes de 'true' não ligam o flag", () => {
    setEnv("1", undefined)
    expect(isWorkstationDurableEnabled()).toBe(false)
    setEnv("TRUE", undefined)
    expect(isWorkstationDurableEnabled()).toBe(false)
  })

  it("ligado sem allowlist aplica a todas as organizações", () => {
    setEnv("true", undefined)
    expect(isWorkstationDurableEnabledForOrganization("acme")).toBe(true)
  })

  it("'*' aplica a todas as organizações", () => {
    setEnv("true", "*")
    expect(isWorkstationDurableEnabledForOrganization("acme")).toBe(true)
  })

  it("allowlist restringe por slug (rollout canário)", () => {
    setEnv("true", "canario, outra-org")
    expect(isWorkstationDurableEnabledForOrganization("canario")).toBe(true)
    expect(isWorkstationDurableEnabledForOrganization("outra-org")).toBe(true)
    expect(isWorkstationDurableEnabledForOrganization("acme")).toBe(false)
  })

  it("flag global desligado ignora a allowlist", () => {
    setEnv("false", "canario")
    expect(isWorkstationDurableEnabledForOrganization("canario")).toBe(false)
  })
})
