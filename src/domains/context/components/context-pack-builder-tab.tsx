"use client"

import * as React from "react"
import { CopyIcon, SparklesIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PRODUCT_KEYS, type ProductKey } from "../types"
import type { ContextMemoryState } from "../hooks/use-context-memory"

export function ContextPackBuilderTab({ ctx }: { ctx: ContextMemoryState }) {
  const [objective, setObjective] = React.useState("")
  const [productKey, setProductKey] = React.useState<ProductKey>("redrise")
  const [screenId, setScreenId] = React.useState("")
  const [domainKey, setDomainKey] = React.useState("")
  const [tokenBudget, setTokenBudget] = React.useState(8000)
  const [loading, setLoading] = React.useState(false)
  const [pack, setPack] = React.useState<{
    context_pack: string
    selected_chunk_ids: string[]
    token_estimate: number
    compression_strategy: string
    query_id: string | null
  } | null>(null)

  async function generate() {
    if (!objective.trim()) {
      toast.error("Objective is required")
      return
    }
    setLoading(true)
    try {
      const result = await ctx.buildPack({
        objective,
        product_key: productKey,
        screen_id: screenId.trim() || "",
        domain_key: domainKey.trim() || "",
        token_budget: tokenBudget,
      })
      setPack(result)
      toast.success("Context pack generated")
    } catch (error) {
      toast.error("Failed to generate pack", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  async function copyPack() {
    if (!pack) return
    try {
      await navigator.clipboard.writeText(pack.context_pack)
      toast.success("Copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy", {
        description: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Build Context Pack</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="ctx-pack-objective">Objective</Label>
            <Input
              id="ctx-pack-objective"
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              placeholder="Implement WS-ACTIONS run history table"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ctx-pack-product">Product</Label>
            <NativeSelect
              id="ctx-pack-product"
              value={productKey}
              onChange={(event) => setProductKey(event.target.value as ProductKey)}
            >
              {PRODUCT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ctx-pack-screen">Screen ID</Label>
            <Input
              id="ctx-pack-screen"
              value={screenId}
              onChange={(event) => setScreenId(event.target.value)}
              placeholder="WS-ACTIONS"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ctx-pack-domain">Domain</Label>
            <Input
              id="ctx-pack-domain"
              value={domainKey}
              onChange={(event) => setDomainKey(event.target.value)}
              placeholder="workstation.actions"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ctx-pack-budget">Token budget</Label>
            <Input
              id="ctx-pack-budget"
              type="number"
              min={256}
              max={32000}
              value={tokenBudget}
              onChange={(event) => setTokenBudget(Number(event.target.value))}
            />
          </div>
          <Button onClick={generate} disabled={loading}>
            <SparklesIcon />
            {loading ? "Generating…" : "Generate"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Output</CardTitle>
          {pack ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                ~{pack.token_estimate} tokens
              </Badge>
              <Badge variant="secondary">{pack.compression_strategy}</Badge>
              <Button size="sm" variant="outline" onClick={copyPack}>
                <CopyIcon />
                Copy
              </Button>
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          {pack ? (
            <>
              <ScrollArea className="max-h-[60vh] rounded-md border bg-muted/30 p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {pack.context_pack}
                </pre>
              </ScrollArea>
              <p className="mt-3 text-xs text-muted-foreground">
                {pack.selected_chunk_ids.length} chunk(s) referenced. Query ID:{" "}
                <code>{pack.query_id ?? "(pending)"}</code>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Configure the objective on the left and press Generate.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}