"use client"

import * as React from "react"
import Link from "next/link"
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Node,
  type NodeProps,
  useEdgesState,
  useNodesState,
} from "@xyflow/react"
import { MoreHorizontalIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProcessCanvasToolbar } from "@/domains/workstation/process/components/process-canvas-toolbar"
import { ProcessNodeConfigDialog } from "@/domains/workstation/process/components/process-node-config-dialog"
import {
  type CanvasNodeData,
  getCanvasEdges,
  getCanvasNodes,
  mockProcesses,
} from "@/domains/workstation/process/data/mock-processes"
import type { RedRiseNode } from "@/domains/workstation/process/types/process.types"

type RedRiseFlowNode = Node<CanvasNodeData, "redriseNode">

function RedRiseCanvasNode({ data, selected }: NodeProps<RedRiseFlowNode>) {
  const runStatus = data.run?.status ?? (data.node.enabled ? "queued" : "skipped")
  const preview = data.node.instruction.length > 92 ? `${data.node.instruction.slice(0, 92)}...` : data.node.instruction

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="size-3 border-background bg-primary" />
      <Card className={`w-72 shadow-sm ${selected ? "ring-2 ring-primary" : ""}`}>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-3">
          <div className="grid gap-2">
            <Badge variant="outline" className="w-fit">{data.node.nodeType}</Badge>
            <CardTitle className="text-base">{data.node.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" aria-label={`Open node actions for ${data.node.title}`} />}>
              <MoreHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => toast("Select this node and use Node > Edit.")}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Node duplicated locally in a later canvas iteration.")}>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => toast("Select this node and use Node > Delete.")}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="grid gap-3 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={runStatus === "failed" ? "destructive" : runStatus === "completed" ? "outline" : "secondary"}>{runStatus}</Badge>
          </div>
          <p className="text-pretty leading-5 text-muted-foreground">{preview}</p>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Input: {data.node.inputMode}</span>
            <span>Output: {data.node.outputType}</span>
          </div>
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Right} className="size-3 border-background bg-primary" />
    </div>
  )
}

const nodeTypes = {
  redriseNode: RedRiseCanvasNode,
}

export function ProcessCanvasPage({ organizationSlug, processId }: { organizationSlug: string; processId: string }) {
  const process = mockProcesses.find((item) => item.id === processId) ?? mockProcesses[0]
  const [nodes, setNodes, onNodesChange] = useNodesState<RedRiseFlowNode>(getCanvasNodes() as RedRiseFlowNode[])
  const [edges, setEdges, onEdgesChange] = useEdgesState(getCanvasEdges())
  const [menuOpen, setMenuOpen] = React.useState(true)
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(nodes[0]?.id ?? null)
  const [configOpen, setConfigOpen] = React.useState(false)
  const selectedNode = React.useMemo(
    () => nodes.find((node) => node.id === selectedNodeId)?.data.node ?? null,
    [nodes, selectedNodeId],
  )

  function handleNewNode() {
    const id = `node-${Date.now()}`
    const newNode: RedRiseNode = {
      id,
      organizationId: "org-redrise",
      spaceId: process.spaceId,
      processId: process.id,
      nodeType: "llm",
      title: "New LLM Node",
      description: "Draft node created locally.",
      position: { x: 220 + nodes.length * 80, y: 360 },
      enabled: true,
      instruction: "Describe what this node should plan, prepare, execute and return.",
      inputMode: "previous_node",
      inputMapping: {},
      outputType: "markdown",
      outputContract: {},
      config: { model: "default" },
      failureBehavior: "stop_process",
      createdBy: "Current user",
      updatedBy: "Current user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setNodes((current) => [
      ...current,
      {
        id,
        type: "redriseNode",
        position: newNode.position,
        data: { node: newNode },
      },
    ])
    setSelectedNodeId(id)
    toast.success("Node created locally.")
  }

  function handleDeleteNode() {
    if (!selectedNodeId) {
      toast("Select a node before deleting.")
      return
    }

    setNodes((current) => current.filter((node) => node.id !== selectedNodeId))
    setEdges((current) => current.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId))
    setSelectedNodeId(null)
    toast.success("Node removed from the local canvas.")
  }

  function handleEditNode() {
    if (!selectedNode) {
      toast("Select a node before editing.")
      return
    }
    setConfigOpen(true)
  }

  function handleSelectAll() {
    setNodes((current) => current.map((node) => ({ ...node, selected: true })))
    toast("All visible nodes selected.")
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">WS-PROCESS-CANVAS</p>
          <h1 className="text-3xl font-semibold tracking-tight">{process.name} Canvas</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Design nodes and success/failure paths. Node runs, token cost and analytics are represented as mock status only.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${organizationSlug}/workstation/process`}>Back to Process</Link>
          </Button>
          <Button type="button" onClick={handleNewNode}><PlusIcon /> New Node</Button>
        </div>
      </div>

      <div className="relative h-[680px] overflow-hidden rounded-xl border bg-muted/20">
        <ProcessCanvasToolbar
          open={menuOpen}
          onOpenChange={setMenuOpen}
          onNewNode={handleNewNode}
          onDeleteNode={handleDeleteNode}
          onEditNode={handleEditNode}
          onSelectAll={handleSelectAll}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onSelectionChange={({ nodes: selectedNodes }) => setSelectedNodeId(selectedNodes[0]?.id ?? null)}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>

      <ProcessNodeConfigDialog node={selectedNode} open={configOpen} onOpenChange={setConfigOpen} />
    </section>
  )
}
