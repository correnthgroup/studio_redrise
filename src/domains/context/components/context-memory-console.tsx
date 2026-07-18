"use client"

import * as React from "react"
import { DatabaseIcon } from "lucide-react"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IndexedDocumentsTab } from "./indexed-documents-tab"
import { SearchConsoleTab } from "./search-console-tab"
import { ContextPackBuilderTab } from "./context-pack-builder-tab"
import { EntitiesRelationsTab } from "./entities-relations-tab"
import { IngestionJobsTab } from "./ingestion-jobs-tab"
import { ErrorsReindexTab } from "./errors-reindex-tab"
import { useContextMemory } from "../hooks/use-context-memory"

interface ContextMemoryConsoleProps {
  organizationSlug: string
}

export function ContextMemoryConsole({ organizationSlug }: ContextMemoryConsoleProps) {
  const ctx = useContextMemory({ organizationSlug })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <DatabaseIcon className="size-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">Context Memory</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Inspect the indexed knowledge base, run hybrid retrieval, build
          context packs and manage ingestion jobs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Indexed Documents" value={ctx.stats.documentCount} />
        <StatCard label="Chunks" value={ctx.stats.chunkCount} />
        <StatCard label="Entities" value={ctx.stats.entityCount} />
        <StatCard label="Relations" value={ctx.stats.relationCount} />
      </div>

      <Tabs defaultValue="indexed">
        <TabsList>
          <TabsTrigger value="indexed">Indexed Documents</TabsTrigger>
          <TabsTrigger value="search">Search Console</TabsTrigger>
          <TabsTrigger value="pack">Context Pack Builder</TabsTrigger>
          <TabsTrigger value="entities">Entities &amp; Relations</TabsTrigger>
          <TabsTrigger value="jobs">Ingestion Jobs</TabsTrigger>
          <TabsTrigger value="errors">Errors / Reindex</TabsTrigger>
        </TabsList>
        <TabsContent value="indexed">
          <IndexedDocumentsTab ctx={ctx} />
        </TabsContent>
        <TabsContent value="search">
          <SearchConsoleTab ctx={ctx} />
        </TabsContent>
        <TabsContent value="pack">
          <ContextPackBuilderTab ctx={ctx} />
        </TabsContent>
        <TabsContent value="entities">
          <EntitiesRelationsTab ctx={ctx} />
        </TabsContent>
        <TabsContent value="jobs">
          <IngestionJobsTab ctx={ctx} />
        </TabsContent>
        <TabsContent value="errors">
          <ErrorsReindexTab ctx={ctx} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        Updated live from the Context Memory Layer.
      </CardContent>
    </Card>
  )
}