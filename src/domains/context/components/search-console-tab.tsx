"use client"

import * as React from "react"
import { SearchIcon, SparklesIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PRODUCT_KEYS, type ProductKey, type SourceType } from "../types"
import type { ContextMemoryState } from "../hooks/use-context-memory"

const SOURCE_OPTIONS: SourceType[] = [
  "markdown",
  "conversation_decision",
  "architecture_doc",
  "prd",
  "roadmap",
  "ui_spec",
  "code_file",
  "external_reference",
]

export function SearchConsoleTab({ ctx }: { ctx: ContextMemoryState }) {
  const [query, setQuery] = React.useState("")
  const [productKey, setProductKey] = React.useState<ProductKey>("redrise")
  const [sourceType, setSourceType] = React.useState<SourceType | "">("")
  const [screenId, setScreenId] = React.useState("")
  const [limit, setLimit] = React.useState(20)
  const [results, setResults] = React.useState<Array<{
    chunk_id: string
    document_id: string
    title: string
    heading_path: string
    content: string
    combined_score: number
    vector_score: number
    text_score: number
    metadata_boost: number
    metadata: Record<string, unknown>
  }> | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [openChunk, setOpenChunk] = React.useState<{
    title: string
    heading: string
    content: string
  } | null>(null)

  async function run() {
    if (!query.trim()) {
      toast.error("Query is required")
      return
    }
    setLoading(true)
    try {
      const filters: { source_type?: SourceType[]; screen_id?: string | null } = {}
      if (sourceType) filters.source_type = [sourceType]
      if (screenId.trim()) filters.screen_id = screenId.trim()
      const rows = await ctx.search({
        query,
        product_key: productKey,
        filters,
        limit,
      })
      setResults(rows)
      if (rows.length === 0) {
        toast.info("No matches found")
      }
    } catch (error) {
      toast.error("Search failed", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="ctx-search-query">Query</Label>
            <Input
              id="ctx-search-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="WS-ACTIONS required fields"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ctx-search-product">Product</Label>
            <NativeSelect
              id="ctx-search-product"
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
            <Label htmlFor="ctx-search-source">Source Type</Label>
            <NativeSelect
              id="ctx-search-source"
              value={sourceType}
              onChange={(event) => setSourceType(event.target.value as SourceType | "")}
            >
              <option value="">Any</option>
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ctx-search-screen">Screen ID</Label>
            <Input
              id="ctx-search-screen"
              value={screenId}
              onChange={(event) => setScreenId(event.target.value)}
              placeholder="WS-ACTIONS"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ctx-search-limit">Limit</Label>
            <Input
              id="ctx-search-limit"
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
            />
          </div>
          <Button onClick={run} disabled={loading}>
            <SearchIcon />
            {loading ? "Searching…" : "Search"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : results === null ? (
            <Empty>
              <EmptyTitle>Run a search</EmptyTitle>
              <EmptyDescription>
                Configure filters on the left and press Search.
              </EmptyDescription>
            </Empty>
          ) : results.length === 0 ? (
            <Empty>
              <EmptyTitle>No matches</EmptyTitle>
              <EmptyDescription>
                Try removing filters or simplifying the query.
              </EmptyDescription>
            </Empty>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="flex flex-col gap-2">
                {results.map((row) => (
                  <button
                    key={row.chunk_id}
                    type="button"
                    onClick={() =>
                      setOpenChunk({
                        title: row.title,
                        heading: row.heading_path,
                        content: row.content,
                      })
                    }
                    className="rounded-md border p-3 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="size-4 text-muted-foreground" />
                        <span className="font-medium">{row.title}</span>
                      </div>
                      <Badge variant="outline">
                        score {row.combined_score.toFixed(3)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.heading_path || "(root)"}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-foreground/80">
                      {row.content}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      <span>vec {row.vector_score.toFixed(3)}</span>
                      <span>text {row.text_score.toFixed(3)}</span>
                      <span>boost {row.metadata_boost.toFixed(3)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={openChunk !== null}
        onOpenChange={(open) => !open && setOpenChunk(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{openChunk?.title}</DialogTitle>
            <DialogDescription>{openChunk?.heading}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {openChunk?.content}
            </pre>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenChunk(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}