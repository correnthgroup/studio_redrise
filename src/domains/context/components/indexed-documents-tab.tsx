"use client"

import * as React from "react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { EyeIcon, RefreshCwIcon, ArchiveIcon, FileTextIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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

export function IndexedDocumentsTab({ ctx }: { ctx: ContextMemoryState }) {
  const [documents, setDocuments] = React.useState<IndexedDocumentSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [chunksDocumentId, setChunksDocumentId] = React.useState<string | null>(null)
  const [chunks, setChunks] = React.useState<Array<{
    chunk_index: number
    heading_path: string
    content: string
    content_tokens: number
  }> | null>(null)
  const [chunksLoading, setChunksLoading] = React.useState(false)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    try {
      const rows = await ctx.listIndexedDocuments()
      setDocuments(rows)
    } catch (error) {
      toast.error("Failed to load indexed documents", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }, [ctx])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  async function openChunks(documentId: string) {
    setChunksDocumentId(documentId)
    setChunksLoading(true)
    try {
      const rows = await ctx.listChunks(documentId)
      setChunks(
        rows.map((row) => ({
          chunk_index: row.chunk_index,
          heading_path: row.heading_path,
          content: row.content,
          content_tokens: row.content_tokens,
        })),
      )
    } catch (error) {
      toast.error("Failed to load chunks", {
        description: error instanceof Error ? error.message : String(error),
      })
      setChunks(null)
    } finally {
      setChunksLoading(false)
    }
  }

  async function reindex(documentId: string) {
    try {
      await ctx.reindexDocument(documentId)
      toast.success("Reindex job queued")
      await refresh()
    } catch (error) {
      toast.error("Failed to reindex", {
        description: error instanceof Error ? error.message : String(error),
      })
    }
  }

  async function archive(documentId: string) {
    try {
      await ctx.archiveDocument(documentId)
      toast.success("Document archived")
      await refresh()
    } catch (error) {
      toast.error("Failed to archive", {
        description: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {documents.length} indexed document(s)
        </p>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCwIcon />
          Refresh
        </Button>
      </div>
      <IndexedDocumentsTable
        documents={documents}
        loading={loading}
        onOpenChunks={openChunks}
        onReindex={reindex}
        onArchive={archive}
      />

      <Dialog
        open={chunksDocumentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setChunksDocumentId(null)
            setChunks(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document chunks</DialogTitle>
            <DialogDescription>
              {chunks?.length ?? 0} chunk(s) for document {chunksDocumentId}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {chunksLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : chunks && chunks.length > 0 ? (
              <div className="flex flex-col gap-3">
                {chunks.map((chunk) => (
                  <div
                    key={`${chunk.chunk_index}-${chunk.heading_path}`}
                    className="rounded-md border p-3 text-sm"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        #{chunk.chunk_index} — {chunk.heading_path || "(root)"}
                      </span>
                      <span>{chunk.content_tokens} tokens</span>
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap font-sans">
                      {chunk.content}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyTitle>No chunks yet</EmptyTitle>
                <EmptyDescription>Trigger a reindex from the table.</EmptyDescription>
              </Empty>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChunksDocumentId(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface IndexedDocumentsTableProps {
  documents: IndexedDocumentSummary[]
  loading: boolean
  onOpenChunks(id: string): void
  onReindex(id: string): void
  onArchive(id: string): void
}

function IndexedDocumentsTable({
  documents,
  loading,
  onOpenChunks,
  onReindex,
  onArchive,
}: IndexedDocumentsTableProps) {
  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }
  if (documents.length === 0) {
    return (
      <Empty>
        <EmptyTitle>No documents indexed</EmptyTitle>
        <EmptyDescription>
          Run <code>npm run ingest:ctx -- docs/</code> to start indexing.
        </EmptyDescription>
      </Empty>
    )
  }
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Source Type</TableHead>
            <TableHead>Chunks</TableHead>
            <TableHead>Last Indexed</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="size-4 text-muted-foreground" />
                  {doc.title}
                </div>
              </TableCell>
              <TableCell>{doc.product_key}</TableCell>
              <TableCell>
                <Badge variant="outline">{doc.source_type}</Badge>
              </TableCell>
              <TableCell>{doc.chunk_count}</TableCell>
              <TableCell>
                {doc.indexed_at
                  ? formatDistanceToNow(new Date(doc.indexed_at), {
                      addSuffix: true,
                    })
                  : "—"}
              </TableCell>
              <TableCell>
                <Badge variant={doc.status === "indexed" ? "default" : "secondary"}>
                  {doc.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onOpenChunks(doc.id)}
                    aria-label="View chunks"
                  >
                    <EyeIcon />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onReindex(doc.id)}
                    aria-label="Reindex"
                  >
                    <RefreshCwIcon />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onArchive(doc.id)}
                    aria-label="Archive"
                  >
                    <ArchiveIcon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}