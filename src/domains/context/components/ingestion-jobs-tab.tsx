"use client"

import * as React from "react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

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

export function IngestionJobsTab({ ctx }: { ctx: ContextMemoryState }) {
  const [documents, setDocuments] = React.useState<IndexedDocumentSummary[]>([])
  const [loading, setLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    try {
      const rows = await ctx.listIndexedDocuments()
      setDocuments(rows)
    } catch (error) {
      toast.error("Failed to load ingestion jobs", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }, [ctx])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ingestion Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : documents.length === 0 ? (
          <Empty>
            <EmptyTitle>No documents indexed</EmptyTitle>
            <EmptyDescription>
              Run <code>npm run ingest:ctx -- docs/</code> to populate this tab.
            </EmptyDescription>
          </Empty>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Chunks</TableHead>
                  <TableHead>Indexed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>{doc.product_key}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === "indexed" ? "default" : "secondary"}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.chunk_count}</TableCell>
                    <TableCell>
                      {doc.indexed_at
                        ? formatDistanceToNow(new Date(doc.indexed_at), {
                            addSuffix: true,
                          })
                        : "—"}
                    </TableCell>
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