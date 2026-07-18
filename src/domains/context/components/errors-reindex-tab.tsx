"use client"

import * as React from "react"
import { toast } from "sonner"
import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ContextMemoryState } from "../hooks/use-context-memory"
import type { IndexedDocumentSummary } from "../server/service"

export function ErrorsReindexTab({ ctx }: { ctx: ContextMemoryState }) {
  const [documents, setDocuments] = React.useState<IndexedDocumentSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [busy, setBusy] = React.useState(false)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    try {
      const rows = await ctx.listIndexedDocuments()
      const pending = rows.filter(
        (row) =>
          row.status !== "indexed" ||
          row.chunk_count === 0 ||
          !row.embeddings_present ||
          row.summary_count === 0,
      )
      setDocuments(pending)
    } catch (error) {
      toast.error("Failed to load pending items", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }, [ctx])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function reindexSelected() {
    if (selected.size === 0) {
      toast.error("Select at least one document")
      return
    }
    setBusy(true)
    try {
      for (const id of selected) {
        await ctx.reindexDocument(id)
      }
      toast.success(`Queued ${selected.size} document(s) for reindex`)
      setSelected(new Set())
      await refresh()
    } catch (error) {
      toast.error("Reindex failed", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Pending ({documents.length})</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCwIcon />
            Refresh
          </Button>
          <Button size="sm" disabled={busy} onClick={reindexSelected}>
            Reindex selected
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : documents.length === 0 ? (
          <Empty>
            <EmptyTitle>All clean</EmptyTitle>
            <EmptyDescription>
              No documents are pending indexing or summaries.
            </EmptyDescription>
          </Empty>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Chunks</TableHead>
                  <TableHead>Embeddings</TableHead>
                  <TableHead>Summaries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(doc.id)}
                        onChange={() => toggle(doc.id)}
                        aria-label={`Select ${doc.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{doc.status}</Badge>
                    </TableCell>
                    <TableCell>{doc.chunk_count}</TableCell>
                    <TableCell>
                      <Badge variant={doc.embeddings_present ? "default" : "destructive"}>
                        {doc.embeddings_present ? "ok" : "missing"}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.summary_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}