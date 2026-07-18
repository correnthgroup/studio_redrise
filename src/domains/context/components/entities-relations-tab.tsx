"use client"

import * as React from "react"
import { toast } from "sonner"

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
import type { EntityRow, RelationRow } from "../types"

export function EntitiesRelationsTab({ ctx }: { ctx: ContextMemoryState }) {
  const [entities, setEntities] = React.useState<EntityRow[]>([])
  const [relations, setRelations] = React.useState<RelationRow[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [e, r] = await Promise.all([ctx.listEntities(), ctx.listRelations()])
        if (cancelled) return
        setEntities(e)
        setRelations(r)
      } catch (error) {
        toast.error("Failed to load graph", {
          description: error instanceof Error ? error.message : String(error),
        })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [ctx])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entities ({entities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : entities.length === 0 ? (
            <Empty>
              <EmptyTitle>No entities extracted yet</EmptyTitle>
              <EmptyDescription>
                Entities appear here once extraction is enabled.
              </EmptyDescription>
            </Empty>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Product</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell className="font-medium">{entity.canonical_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entity.entity_type}</Badge>
                      </TableCell>
                      <TableCell>{entity.product_key}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Relations ({relations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : relations.length === 0 ? (
            <Empty>
              <EmptyTitle>No relations extracted yet</EmptyTitle>
              <EmptyDescription>
                Relations link two entities with a typed edge.
              </EmptyDescription>
            </Empty>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source → Target</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relations.map((relation) => (
                    <TableRow key={relation.id}>
                      <TableCell className="font-mono text-xs">
                        {relation.source_entity_id.slice(0, 8)} → {relation.target_entity_id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{relation.relation_type}</Badge>
                      </TableCell>
                      <TableCell>{relation.confidence.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}