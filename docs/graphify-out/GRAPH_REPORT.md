# Graph Report - redrise v2  (2026-07-21)

## Corpus Check
- 340 files · ~132,677 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1911 nodes · 3498 edges · 200 communities (138 shown, 62 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1181f590`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- project-snapshot.ts
- user-profile.ts
- actions-kanban.tsx
- sidebar.tsx
- route-skeleton.tsx
- button.tsx
- TASK_LOG
- compilerOptions
- supabase.ts
- utils.ts
- InMemoryWorkstationAdapter
- supabase-workstation-adapter.ts
- i18n-context.tsx
- process-table.tsx
- workstation.ts
- process.types.ts
- task-executions.ts
- workstation-provider.tsx
- action.types.ts
- SupabaseWorkstationAdapter
- logAuditEvent
- command.tsx
- menubar.tsx
- team-members.ts
- react
- flow-runs.ts
- spaces-table.tsx
- flow-cards.ts
- tasks.ts
- components.json
- PRD-024 — Adaptadores Duráveis do Workstation v1
- AGENTS
- RedRise - Product Architecture Map v1
- auth-layout.tsx
- WorkstationRepository
- projects.ts
- integrations.ts
- devDependencies
- scripts
- agents.ts
- notifications.ts
- app.ts
- app-breadcrumb.tsx
- teams.ts
- Decisão
- 05 — WS-ACTIONS Session Spec v1
- Fonte operacional — RedRise
- redrise-ops.mjs
- alert-dialog.tsx
- chart.tsx
- index.ts
- index.ts
- index.ts
- dependencies
- Decisão
- Decisão
- sheet.tsx
- RedRise - UI Blocks Reference Map v1
- RedRise - Roadmap v1
- process-canvas-toolbar.tsx
- api-keys.ts
- ADR-003 — Idempotência e concorrência
- ADR-004 — Payload, snapshots e redação
- Vendor engagement — RedRise Workstation
- BOOT
- RedRise
- cml-server.ts
- index.ts
- process-node-config-dialog.tsx
- audit-logs.ts
- team-invites.ts
- 11. Action Details Dialog
- PR-A1 — Bootstrap org, membership e middleware
- PR-A2 — Redaction e audit hardening
- PR-A3 — Worker durável do Workstation
- PR-A4 — Realtime Actions
- PR-A5 — Hardening operacional, DLQ e runbooks
- PR-A6 — Rollout canário do Workstation durável
- INDEX
- Workstation
- orbiting-circles-01.tsx
- toggle-group.tsx
- settings.ts
- index.ts
- index.ts
- 19. Test Checklist
- README.md
- Handoff — série de PRs RedRise (Workstation + follow-ups)
- pg-exec.mjs
- tabs.tsx
- index.ts
- global-setup.ts
- 15. RBAC / Visibility
- 4. Header
- PR-B2 — E2E do caminho durável
- PR-B3 — Types gerados do Supabase
- PR-B4 — Cleanup do backend legado (PRD-079)
- PR-B5 — CML SDK live server-only
- PR-B6 — Settings, Team e Billing v1
- PR-C1 — CI e Definition of Done para vendor
- Auth
- Settings And App Shell
- Supabase
- Testing And Deploy
- package.json
- alert.tsx
- member-functions.ts
- timezones.ts
- index.ts
- 10. Run History Table
- 2. Selected UI References
- 7. Kanban Card
- RedRise - PRD Index v1
- DECISIONS
- clean-next.mjs
- copy-spa-fallback.mjs
- accordion.tsx
- analytics.ts
- cities.ts
- index.ts
- 12. Data Dependencies
- 6. Kanban Columns
- 8. Kanban Behavior
- next.config.ts
- page.tsx
- scroll-area.tsx
- settings-keys.ts
- class-variance-authority
- clsx
- cmdk
- date-fns
- @dnd-kit/core
- @dnd-kit/modifiers
- @dnd-kit/sortable
- @dnd-kit/utilities
- @eslint/js
- eslint-plugin-react-refresh
- globals
- @hookform/resolvers
- lucide-react
- next
- next-env.d.ts
- @radix-ui/react-alert-dialog
- @radix-ui/react-avatar
- @radix-ui/react-checkbox
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-popover
- @radix-ui/react-progress
- @radix-ui/react-scroll-area
- @radix-ui/react-separator
- @radix-ui/react-slider
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-tabs
- react-day-picker
- react-dom
- react-is
- recharts
- sonner
- @supabase/ssr
- @supabase/supabase-js
- @tabler/icons-react
- tailwind-merge
- @tanstack/react-table
- tw-animate-css
- vaul
- @xyflow/react
- zod
- shadcn
- tailwindcss
- @testing-library/dom
- @testing-library/jest-dom
- @types/node
- @types/react
- @types/react-dom
- typescript
- vitest
- postcss.config.mjs
- graphify-semantic.sh script
- redrise

## God Nodes (most connected - your core abstractions)
1. `cn()` - 214 edges
2. `logAuditEvent()` - 33 edges
3. `react` - 31 edges
4. `SupabaseWorkstationAdapter` - 30 edges
5. `Button` - 29 edges
6. `InMemoryWorkstationAdapter` - 29 edges
7. `supabase` - 29 edges
8. `TASK_LOG` - 28 edges
9. `useWorkstation()` - 22 edges
10. `05 — WS-ACTIONS Session Spec v1` - 21 edges

## Surprising Connections (you probably didn't know these)
- `AppSidebar()` --references--> `react`  [EXTRACTED]
  src/components/layout/app-sidebar.tsx → package.json
- `MultiSelect()` --references--> `react`  [EXTRACTED]
  src/components/multi-select.tsx → package.json
- `ChartContainer()` --references--> `react`  [EXTRACTED]
  src/components/ui/chart.tsx → package.json
- `ChartTooltipContent()` --references--> `react`  [EXTRACTED]
  src/components/ui/chart.tsx → package.json
- `useChart()` --references--> `react`  [EXTRACTED]
  src/components/ui/chart.tsx → package.json

## Import Cycles
- None detected.

## Communities (200 total, 62 thin omitted)

### Community 0 - "cn"
Cohesion: 0.05
Nodes (52): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), BackgroundGradient(), BackgroundGradientProps (+44 more)

### Community 1 - "project-snapshot.ts"
Cohesion: 0.06
Nodes (41): ADR-0001, OrganizationLayout(), OrganizationLayoutProps, Home(), FixtureAuthorizationPolicy, withSession(), LoadedWorkstationSnapshot, loadWorkstationSnapshot() (+33 more)

### Community 2 - "user-profile.ts"
Cohesion: 0.07
Nodes (39): useWorkspaces(), createDefaultProfile(), decodeJwtPayload(), ensureCurrentUserTeamMember(), fromSupabaseProfile(), getSessionLocation(), getSupabaseSessionId(), loadRememberedSessions() (+31 more)

### Community 3 - "actions-kanban.tsx"
Cohesion: 0.09
Nodes (31): WorkstationPageProps, Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle, Progress (+23 more)

### Community 4 - "sidebar.tsx"
Cohesion: 0.08
Nodes (39): AppShell(), AppShellProps, AppSidebar(), AppSidebarProps, isRouteActive(), ActiveOrganization, OrganizationSwitcher(), getSidebarRoutes() (+31 more)

### Community 6 - "button.tsx"
Cohesion: 0.15
Nodes (22): Button, ButtonProps, Dialog(), DialogClose(), DialogContent(), DialogFooter(), DialogHeader(), DialogTitle() (+14 more)

### Community 7 - "TASK_LOG"
Cohesion: 0.06
Nodes (35): 2026-07-06 - Foundation through WS-SPACES, 2026-07-07 - Memory Economics, 2026-07-07 - WS-ACTIONS, 2026-07-07 - WS-PROCESS, 2026-07-08 - Semantic Layer Migration, 2026-07-09 - Context Memory Layer Functional Rollout, 2026-07-09 - Context Memory Layer (PRD-CML-001), 2026-07-18 - Dev 404 and authenticated Workstation E2E (+27 more)

### Community 8 - "compilerOptions"
Cohesion: 0.06
Nodes (34): dom, dom.iterable, esnext, graphify-out, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+26 more)

### Community 9 - "supabase.ts"
Cohesion: 0.08
Nodes (18): AnalyticsData, AgentProviderAuthMethod, AgentProviderId, ChatCompletionResponse, ChatMessage, TaskExecuteContext, TaskExecuteResult, BillingPlan (+10 more)

### Community 10 - "utils.ts"
Cohesion: 0.15
Nodes (18): InputGroupButton(), inputGroupButtonVariants, Input, Label, labelVariants, RequiredLabelProps, Spinner(), emailSchema (+10 more)

### Community 11 - "InMemoryWorkstationAdapter"
Cohesion: 0.14
Nodes (4): getActionStage(), clone(), duration(), InMemoryWorkstationAdapter

### Community 12 - "supabase-workstation-adapter.ts"
Cohesion: 0.23
Nodes (25): CommandOutcome, WorkstationDomainError, addSpaceMemberAction(), archiveSpaceAction(), cancelRunAction(), CommandResult, connectNodesAction(), createNodeAction() (+17 more)

### Community 13 - "i18n-context.tsx"
Cohesion: 0.10
Nodes (18): geist, metadata, AppProviders(), I18nContext, I18nContextValue, I18nProvider(), SonnerProvider(), BackButton() (+10 more)

### Community 14 - "process-table.tsx"
Cohesion: 0.19
Nodes (22): NotificationPopover(), NotificationPopoverProps, notifications, organizations, DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup() (+14 more)

### Community 15 - "workstation.ts"
Cohesion: 0.12
Nodes (22): ActionNodeRun, DomainErrorCode, ROLE_CAPABILITIES, WorkstationAdapterOptions, WorkstationSnapshot, NodeConnection, acceptedOrganizationMembers, mockOrganizationMembers (+14 more)

### Community 16 - "process.types.ts"
Cohesion: 0.08
Nodes (24): CanvasNodeData, mockCanvasNodes, mockNodeConnections, mockNodeRuns, mockProcesses, mockProcessOwners, createProcessSchema, connectionTypes (+16 more)

### Community 17 - "task-executions.ts"
Cohesion: 0.10
Nodes (17): addMessage(), addOutput(), createExecution(), generateMessageId(), generateOutputId(), generateShortExecId(), loadLatestApprovedOutput(), resolveUpstreamContext() (+9 more)

### Community 18 - "workstation-provider.tsx"
Cohesion: 0.11
Nodes (16): ActionsPage(), AuthorizationPolicy, useWorkstation(), WorkstationContext, WorkstationContextValue, WorkstationCapability, CanvasNodeData, nodeTypes (+8 more)

### Community 19 - "action.types.ts"
Cohesion: 0.10
Nodes (20): actionProcesses, actionSpaces, filterActions(), filterProcessRuns(), mockActionNodeRuns, mockProcessRuns, ActionNodeRunStatus, actionNodeRunStatuses (+12 more)

### Community 20 - "SupabaseWorkstationAdapter"
Cohesion: 0.22
Nodes (3): newKey(), SupabaseWorkstationAdapter, EntityRevisions

### Community 21 - "logAuditEvent"
Cohesion: 0.18
Nodes (22): useFlows(), logAuditEvent(), approveFlow(), createFlow(), deleteFlow(), generateShortId(), generateUniqueId(), invalidateFlowOfficialStatus() (+14 more)

### Community 22 - "command.tsx"
Cohesion: 0.12
Nodes (20): MultiSelect(), MultiSelectProps, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem() (+12 more)

### Community 23 - "menubar.tsx"
Cohesion: 0.09
Nodes (17): DropdownMenuPortal(), DropdownMenuRadioGroup(), DropdownMenuShortcut(), DropdownMenuSub(), DropdownMenuSubContent(), DropdownMenuSubTrigger(), Menubar(), MenubarCheckboxItem() (+9 more)

### Community 24 - "team-members.ts"
Cohesion: 0.11
Nodes (13): AccessRole, AgentAccessContext, displayName(), isOnline(), loadCurrentTeamAssignment(), loadTeamMembers(), normalizeTeamName(), ProfileRow (+5 more)

### Community 25 - "react"
Cohesion: 0.12
Nodes (20): react, react, ContextMenu(), ContextMenuContent(), ContextMenuContentProps, ContextMenuContext, ContextMenuItem(), ContextMenuItemProps (+12 more)

### Community 26 - "flow-runs.ts"
Cohesion: 0.11
Nodes (10): addFlowRunStep(), createFlowRun(), generateShortId(), generateStepId(), CreateFlowRunInput, CreateFlowRunStepInput, FlowRun, FlowRunStatus (+2 more)

### Community 27 - "spaces-table.tsx"
Cohesion: 0.25
Nodes (15): Badge(), badgeVariants, CardDescription, DialogDescription(), Table(), TableBody(), TableCaption(), TableCell() (+7 more)

### Community 28 - "flow-cards.ts"
Cohesion: 0.19
Nodes (13): useFlowCards(), createFlowCard(), createFlowEdge(), generateEdgeShortId(), generateShortId(), loadFlowCards(), loadFlowEdges(), syncFlowEditor() (+5 more)

### Community 29 - "tasks.ts"
Cohesion: 0.18
Nodes (15): useTasks(), createTask(), deleteTask(), generateShortId(), generateUniqueId(), isIdUnique(), loadTasks(), updateTaskStatus() (+7 more)

### Community 30 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 31 - "PRD-024 — Adaptadores Duráveis do Workstation v1"
Cohesion: 0.11
Nodes (18): 10. Realtime, 11. Plano de entrega e microgerenciamento, 12. Observabilidade e SLOs, 13. Rollout e rollback, 14. Critérios de aceite, 15. Pendências de decisão, 1. Resultado esperado, 2. Escopo (+10 more)

### Community 32 - "AGENTS"
Cohesion: 0.11
Nodes (17): Active Sources Of Truth, AGENTS, Backend policy, Cache protection, Commands, Current Entry Points, Current Invariants, Current Stack (+9 more)

### Community 33 - "RedRise - Product Architecture Map v1"
Cohesion: 0.12
Nodes (16): Actions, App Shell, Auth Domain, Backend Status, Current Code Organization, Current Navigation, Implemented Screen IDs, Next Scope Boundary (+8 more)

### Community 34 - "auth-layout.tsx"
Cohesion: 0.15
Nodes (7): AuthGradientVisual(), GradientBlinds(), AuthLayout(), ForgotPasswordForm(), ResetPasswordForm(), SignInForm(), SignUpForm()

### Community 35 - "WorkstationRepository"
Cohesion: 0.16
Nodes (4): WorkstationRepository, CreateProcessInput, RedRiseNode, RedRiseProcess

### Community 36 - "projects.ts"
Cohesion: 0.27
Nodes (12): useProjects(), createProject(), deleteProject(), generateShortId(), generateUniqueId(), isIdUnique(), loadProjects(), updateProject() (+4 more)

### Community 37 - "integrations.ts"
Cohesion: 0.13
Nodes (8): createIntegration(), CreateIntegrationInput, deleteIntegration(), generateShortId(), Integration, IntegrationSetupDetail, IntegrationSetupSummary, IntegrationStatus

### Community 38 - "devDependencies"
Cohesion: 0.13
Nodes (15): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, @playwright/test (+7 more)

### Community 39 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, clean:next, dev, dev:clean, dev:webpack, lint, mcp:redrise-ops (+7 more)

### Community 40 - "agents.ts"
Cohesion: 0.26
Nodes (11): useAgents(), createAgent(), deleteAgent(), generateShortId(), generateUniqueId(), isIdUnique(), loadAgents(), updateAgent() (+3 more)

### Community 41 - "notifications.ts"
Cohesion: 0.26
Nodes (12): useNotifications(), createNotification(), generateShortId(), loadNotifications(), markNotificationRead(), markNotificationUnread(), resolveNotification(), CreateNotificationInput (+4 more)

### Community 42 - "app.ts"
Cohesion: 0.27
Nodes (5): openSettings(), openAuthenticatedApp(), openSidebarModule(), openTopbarAction(), SidebarModule

### Community 43 - "app-breadcrumb.tsx"
Cohesion: 0.23
Nodes (11): AppBreadcrumb(), getCrumbs(), routeLabels, SidebarRoute, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+3 more)

### Community 44 - "teams.ts"
Cohesion: 0.20
Nodes (11): addTeamAssignments(), AssignmentRow, createTeam(), generateShortId(), loadCurrentTeamAssignments(), loadTeams(), mapTeam(), normalizeFallbackTeam() (+3 more)

### Community 45 - "Decisão"
Cohesion: 0.15
Nodes (12): ADR-001 — Schema durável do Workstation, Alternativas rejeitadas, Consequências, Contexto, Decisão, Entidades e pontos de fidelidade ao contrato, Identidade, tempo e enums, Infraestrutura de execução (+4 more)

### Community 46 - "05 — WS-ACTIONS Session Spec v1"
Cohesion: 0.15
Nodes (12): 05 — WS-ACTIONS Session Spec v1, 13. Realtime Requirements, 14. Sonner Usage, 16. Out of Scope for WS-ACTIONS MVP, 17. MVP Layout, 18. Acceptance Criteria, 1. Objective, 20. Implementation Notes (+4 more)

### Community 47 - "Fonte operacional — RedRise"
Cohesion: 0.15
Nodes (12): Artifacts condicionais, Branch e PR, Decomposição, Fonte operacional — RedRise, Fontes ativas, Limites, Outcome do app, Relação com a Ghauss (+4 more)

### Community 48 - "redrise-ops.mjs"
Cohesion: 0.23
Nodes (10): __dirname, handle(), processMessage(), projectRoot, shell(), startServer(), toolList(), tools (+2 more)

### Community 49 - "alert-dialog.tsx"
Cohesion: 0.17
Nodes (11): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+3 more)

### Community 50 - "chart.tsx"
Cohesion: 0.21
Nodes (11): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+3 more)

### Community 51 - "index.ts"
Cohesion: 0.23
Nodes (10): adapterResponse(), buildStructuredResult(), DEFAULT_ALLOWED_ORIGINS, endpointLabel(), generateAdapterRunId(), getAllowedOrigins(), getCorsHeaders(), providerCandidates() (+2 more)

### Community 52 - "index.ts"
Cohesion: 0.29
Nodes (10): activeStatus(), auditId(), handleCheckoutCompleted(), planFromMetadata(), StripeObject, timingSafeEqual(), toHex(), unixToIso() (+2 more)

### Community 53 - "index.ts"
Cohesion: 0.21
Nodes (6): ALLOWED_EXTENSIONS, DEFAULT_ALLOWED_ORIGINS, extensionOf(), getAllowedOrigins(), getCorsHeaders(), safePath()

### Community 54 - "dependencies"
Cohesion: 0.18
Nodes (11): @base-ui/react, next-themes, dependencies, @base-ui/react, next-themes, @radix-ui/react-select, @radix-ui/react-tooltip, react-hook-form (+3 more)

### Community 55 - "Decisão"
Cohesion: 0.18
Nodes (10): ADR-002 — RLS e autorização do Workstation, Alternativas rejeitadas, Consequências, Contexto, Decisão, Funções helper, Matriz capability → RLS (leitura), Matriz capability → RPC (escrita, Fases 2–4) (+2 more)

### Community 56 - "Decisão"
Cohesion: 0.18
Nodes (10): ADR-005 — SLOs e observabilidade, Alertas, Alternativas rejeitadas, Consequências, Contexto, Correlação, Decisão, Métricas mínimas persistidas/deriváveis (+2 more)

### Community 57 - "sheet.tsx"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 58 - "RedRise - UI Blocks Reference Map v1"
Cohesion: 0.20
Nodes (9): Actions, App Shell, Auth, Global Rules, Process, RedRise - UI Blocks Reference Map v1, Spaces, Status (+1 more)

### Community 59 - "RedRise - Roadmap v1"
Cohesion: 0.20
Nodes (9): Completed, Current validation baseline, Foundation and shell, Functional Workstation reference, Next milestone, Out of scope for RedRise, RedRise - Roadmap v1, RedScale and embedded CML cleanup (+1 more)

### Community 60 - "process-canvas-toolbar.tsx"
Cohesion: 0.29
Nodes (7): Collapsible(), CollapsibleContent(), CollapsibleTrigger(), Kbd(), KbdGroup(), ProcessCanvasToolbar(), ProcessCanvasToolbarProps

### Community 61 - "api-keys.ts"
Cohesion: 0.27
Nodes (8): ApiKey, createApiKey(), CreateApiKeyInput, deleteApiKey(), generateApiKeySecret(), generateShortId(), revokeApiKey(), sha256Hex()

### Community 62 - "ADR-003 — Idempotência e concorrência"
Cohesion: 0.22
Nodes (8): ADR-003 — Idempotência e concorrência, Alternativas rejeitadas, Chaves, Concorrência de execução, Consequências, Contexto, Decisão, Pipeline transacional de comando

### Community 63 - "ADR-004 — Payload, snapshots e redação"
Cohesion: 0.22
Nodes (8): ADR-004 — Payload, snapshots e redação, Alternativas rejeitadas, Consequências, Contexto, Contrato de exibição, Decisão, Limites, Redação

### Community 64 - "Vendor engagement — RedRise Workstation"
Cohesion: 0.22
Nodes (8): Como rodar, Contato de autoridade, Contratos que não podem quebrar, Definition of Done (todo PR), Objetivo do engajamento, Regras duras, Stack, Vendor engagement — RedRise Workstation

### Community 65 - "BOOT"
Cohesion: 0.22
Nodes (8): Active Sources Of Truth, BOOT, Commands, Current Entry Points, Current Invariants, Current Stack, Implemented Scope, Known Blockers

### Community 66 - "RedRise"
Cohesion: 0.22
Nodes (8): Architecture, Commands, Current Scope, Environment, Notes, RedRise, Source Of Truth, Stack

### Community 67 - "cml-server.ts"
Cohesion: 0.25
Nodes (7): CmlAdapterError, CmlAdapterErrorCode, GlobalContextStatus, loadClient(), OfficialSdk, RedRiseGlobalContextResult, searchRedRiseGlobalContext()

### Community 68 - "index.ts"
Cohesion: 0.25
Nodes (4): DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins(), getCorsHeaders(), InvitePayload

### Community 69 - "process-node-config-dialog.tsx"
Cohesion: 0.32
Nodes (6): Checkbox(), jsonText, NodeForm, nodeFormSchema, ProcessNodeConfigDialog(), values()

### Community 70 - "audit-logs.ts"
Cohesion: 0.25
Nodes (5): AuditAction, AuditEntityType, AuditLog, generateShortId(), LogInput

### Community 71 - "team-invites.ts"
Cohesion: 0.32
Nodes (6): InviteRow, loadPendingTeamInvites(), profileName(), ProfileRow, singleRelation(), TeamInviteNotification

### Community 72 - "11. Action Details Dialog"
Cohesion: 0.29
Nodes (7): 11. Action Details Dialog, Dialog layout, Error content, Overview fields, Result content, Steps content, Tabs or sections

### Community 73 - "PR-A1 — Bootstrap org, membership e middleware"
Cohesion: 0.29
Nodes (6): Arquivos prováveis, Escopo, Fora de escopo, Gate de aceite, Objetivo, PR-A1 — Bootstrap org, membership e middleware

### Community 74 - "PR-A2 — Redaction e audit hardening"
Cohesion: 0.29
Nodes (6): Arquivos prováveis, Escopo, Fora de escopo, Gate de aceite, Objetivo, PR-A2 — Redaction e audit hardening

### Community 75 - "PR-A3 — Worker durável do Workstation"
Cohesion: 0.29
Nodes (6): Arquivos prováveis, Escopo, Fora de escopo, Gate de aceite, Objetivo, PR-A3 — Worker durável do Workstation

### Community 76 - "PR-A4 — Realtime Actions"
Cohesion: 0.29
Nodes (6): Arquivos prováveis, Escopo, Fora de escopo, Gate de aceite, Objetivo, PR-A4 — Realtime Actions

### Community 77 - "PR-A5 — Hardening operacional, DLQ e runbooks"
Cohesion: 0.29
Nodes (6): Arquivos prováveis, Escopo, Fora de escopo, Gate de aceite, Objetivo, PR-A5 — Hardening operacional, DLQ e runbooks

### Community 78 - "PR-A6 — Rollout canário do Workstation durável"
Cohesion: 0.29
Nodes (6): Arquivos prováveis, Escopo, Fora de escopo, Gate de aceite, Objetivo, PR-A6 — Rollout canário do Workstation durável

### Community 79 - "INDEX"
Cohesion: 0.29
Nodes (6): Always Read, Documentation Policy, Domain Routing, End Of Work, INDEX, Memory Economics

### Community 80 - "Workstation"
Cohesion: 0.29
Nodes (6): Core files, Current behavior, Durable files, Durable milestone (PRD-024) progress, State transitions, Workstation

### Community 81 - "orbiting-circles-01.tsx"
Cohesion: 0.29
Nodes (5): circle1Icons, circle2Icons, IconData, OrbitingCirclesDemo(), OrbitingCirclesProps

### Community 82 - "toggle-group.tsx"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 83 - "settings.ts"
Cohesion: 0.29
Nodes (6): NotificationSettings, OrganizationMemberRow, SettingsIntegration, SettingsMember, SettingsMemberStatus, SettingsRole

### Community 84 - "index.ts"
Cohesion: 0.33
Nodes (4): DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins(), getCorsHeaders(), PLAN_PRICE_ENV

### Community 85 - "index.ts"
Cohesion: 0.33
Nodes (3): DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins(), getCorsHeaders()

### Community 86 - "19. Test Checklist"
Cohesion: 0.33
Nodes (6): 19. Test Checklist, Dialog, Filters, Kanban, RBAC, Run History Table

### Community 87 - "README.md"
Cohesion: 0.33
Nodes (4): Escopo, Gate de aceite, Objetivo, PR-B1 — Organization Switcher com dados reais

### Community 88 - "Handoff — série de PRs RedRise (Workstation + follow-ups)"
Cohesion: 0.33
Nodes (6): Como usar, Estado já entregue (não refazer), Fontes de verdade, Fronteira CML vs backend RedRise, Handoff — série de PRs RedRise (Workstation + follow-ups), Índice

### Community 89 - "pg-exec.mjs"
Cohesion: 0.33
Nodes (4): args, client, sanitizedUrl, sql

### Community 90 - "tabs.tsx"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 91 - "index.ts"
Cohesion: 0.40
Nodes (3): DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins(), getCorsHeaders()

### Community 92 - "global-setup.ts"
Cohesion: 0.33
Nodes (3): __dirname, env, __filename

### Community 93 - "15. RBAC / Visibility"
Cohesion: 0.40
Nodes (5): 15. RBAC / Visibility, Admin / Owner / Board, Staff, User, Viewer

### Community 94 - "4. Header"
Cohesion: 0.40
Nodes (5): 4. Header, Breadcrumb, Description, Primary rule, Title

### Community 95 - "PR-B2 — E2E do caminho durável"
Cohesion: 0.40
Nodes (4): Escopo, Gate de aceite, Objetivo, PR-B2 — E2E do caminho durável

### Community 96 - "PR-B3 — Types gerados do Supabase"
Cohesion: 0.40
Nodes (4): Escopo, Gate de aceite, Objetivo, PR-B3 — Types gerados do Supabase

### Community 97 - "PR-B4 — Cleanup do backend legado (PRD-079)"
Cohesion: 0.40
Nodes (4): Escopo, Gate de aceite, Objetivo, PR-B4 — Cleanup do backend legado (PRD-079)

### Community 98 - "PR-B5 — CML SDK live server-only"
Cohesion: 0.40
Nodes (4): Escopo, Gate de aceite, Objetivo, PR-B5 — CML SDK live server-only

### Community 99 - "PR-B6 — Settings, Team e Billing v1"
Cohesion: 0.40
Nodes (4): Escopo, Gate de aceite, Objetivo, PR-B6 — Settings, Team e Billing v1

### Community 100 - "PR-C1 — CI e Definition of Done para vendor"
Cohesion: 0.40
Nodes (4): Escopo, Gate de aceite, Objetivo, PR-C1 — CI e Definition of Done para vendor

### Community 101 - "Auth"
Cohesion: 0.40
Nodes (4): Auth, Current Behavior, Pending, Source Files

### Community 102 - "Settings And App Shell"
Cohesion: 0.40
Nodes (4): Current Behavior, Pending, Settings And App Shell, Source Files

### Community 103 - "Supabase"
Cohesion: 0.40
Nodes (4): Current Behavior, Pending, Source Files, Supabase

### Community 104 - "Testing And Deploy"
Cohesion: 0.40
Nodes (4): Commands, Current Validation Baseline, Known Blockers, Testing And Deploy

### Community 105 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 106 - "alert.tsx"
Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 107 - "member-functions.ts"
Cohesion: 0.50
Nodes (3): MEMBER_FUNCTIONS, MemberFunction, normalizeMemberFunction()

### Community 108 - "timezones.ts"
Cohesion: 0.40
Nodes (4): TIMEZONE_OPTIONS, TIMEZONE_REGIONS, TimezoneOption, TimezoneRegion

### Community 109 - "index.ts"
Cohesion: 0.50
Nodes (3): DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins(), getCorsHeaders()

### Community 110 - "10. Run History Table"
Cohesion: 0.50
Nodes (4): 10. Run History Table, Required columns, Required table features, Row actions

### Community 111 - "2. Selected UI References"
Cohesion: 0.50
Nodes (4): 2.1 Kanban, 2.2 Runs / Actions Table, 2.3 Action Details Dialog, 2. Selected UI References

### Community 112 - "7. Kanban Card"
Cohesion: 0.50
Nodes (4): 7. Kanban Card, Adaptation from `@reui/c-kanban-5`, Required card fields, Visual content

### Community 113 - "RedRise - PRD Index v1"
Cohesion: 0.50
Nodes (3): Acceptance rules, RedRise - PRD Index v1, Status

### Community 114 - "DECISIONS"
Cohesion: 0.50
Nodes (3): Active Decisions, DECISIONS, Implemented Decisions

### Community 115 - "clean-next.mjs"
Cohesion: 0.50
Nodes (3): nextDevOutput, nextOutputRoot, workspaceRoot

### Community 116 - "copy-spa-fallback.mjs"
Cohesion: 0.50
Nodes (3): distDir, fallbackPath, indexPath

### Community 117 - "accordion.tsx"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 120 - "index.ts"
Cohesion: 0.67
Nodes (3): DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins(), getCorsHeaders()

### Community 121 - "12. Data Dependencies"
Cohesion: 0.67
Nodes (3): 12. Data Dependencies, node_runs, process_runs

### Community 122 - "6. Kanban Columns"
Cohesion: 0.67
Nodes (3): 6. Kanban Columns, Column metadata, Status-to-column mapping

### Community 123 - "8. Kanban Behavior"
Cohesion: 0.67
Nodes (3): 8. Kanban Behavior, Drag and drop, Realtime movement

## Knowledge Gaps
- **661 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `css` (+656 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `class-variance-authority`, `clsx`, `cmdk`, `date-fns`, `@dnd-kit/core`, `@dnd-kit/modifiers`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@hookform/resolvers`, `lucide-react`, `next`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-scroll-area`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `react`, `react-day-picker`, `react-dom`, `react-is`, `recharts`, `sonner`, `@supabase/ssr`, `@supabase/supabase-js`, `@tabler/icons-react`, `tailwind-merge`, `@tanstack/react-table`, `tw-animate-css`, `vaul`, `@xyflow/react`, `zod`, `package.json`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `auth-layout.tsx`, `actions-kanban.tsx`, `sidebar.tsx`, `process-table.tsx`, `chart.tsx`, `toggle-group.tsx`, `workstation-provider.tsx`, `dependencies`, `command.tsx`, `spaces-table.tsx`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `actions-kanban.tsx`, `sidebar.tsx`, `button.tsx`, `utils.ts`, `process-table.tsx`, `command.tsx`, `menubar.tsx`, `react`, `spaces-table.tsx`, `auth-layout.tsx`, `app-breadcrumb.tsx`, `alert-dialog.tsx`, `chart.tsx`, `sheet.tsx`, `process-canvas-toolbar.tsx`, `process-node-config-dialog.tsx`, `orbiting-circles-01.tsx`, `toggle-group.tsx`, `tabs.tsx`, `alert.tsx`, `accordion.tsx`, `scroll-area.tsx`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _661 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.049107142857142856 - nodes in this community are weakly interconnected._
- **Should `project-snapshot.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06493506493506493 - nodes in this community are weakly interconnected._
- **Should `user-profile.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06862745098039216 - nodes in this community are weakly interconnected._