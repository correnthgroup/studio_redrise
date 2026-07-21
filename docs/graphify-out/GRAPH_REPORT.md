# Graph Report - redrise v2  (2026-07-21)

## Corpus Check
- 304 files · ~113,310 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1652 nodes · 2983 edges · 181 communities (118 shown, 63 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- cn
- user-profile.ts
- route-skeleton.tsx
- compilerOptions
- actions-page.tsx
- button.tsx
- TASK_LOG
- i18n-context.tsx
- task-executions.ts
- process-table.tsx
- utils.ts
- actions-kanban.tsx
- sidebar.tsx
- create-process-dialog.tsx
- menubar.tsx
- InMemoryWorkstationAdapter
- logAuditEvent
- app-sidebar.tsx
- team-members.ts
- flow-runs.ts
- command.tsx
- workstation-provider.tsx
- workstation-overview.tsx
- process.types.ts
- flow-cards.ts
- tasks.ts
- components.json
- PRD-024 — Adaptadores Duráveis do Workstation v1
- WorkstationRepository
- AGENTS
- space.types.ts
- RedRise - Product Architecture Map v1
- react
- useWorkstation
- auth-layout.tsx
- workstation.ts
- supabase.ts
- spaces-table.tsx
- role-assignment-dialog.tsx
- projects.ts
- integrations.ts
- agents.ts
- notifications.ts
- billing.ts
- app.ts
- scripts
- app-breadcrumb.tsx
- teams.ts
- 05 — WS-ACTIONS Session Spec v1
- devDependencies
- Fonte operacional — RedRise
- redrise-ops.mjs
- app-shell.tsx
- alert-dialog.tsx
- chart.tsx
- index.ts
- index.ts
- index.ts
- dependencies
- RedRise - UI Blocks Reference Map v1
- RedRise - Roadmap v1
- api-keys.ts
- BOOT
- RedRise
- input-group.tsx
- cml-server.ts
- index.ts
- audit-logs.ts
- team-invites.ts
- 11. Action Details Dialog
- INDEX
- orbiting-circles-01.tsx
- settings.ts
- index.ts
- index.ts
- 19. Test Checklist
- Workstation
- useSidebar
- useIsMobile
- index.ts
- global-setup.ts
- 15. RBAC / Visibility
- 4. Header
- Auth
- Settings And App Shell
- Supabase
- Testing And Deploy
- package.json
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
- analytics.ts
- cities.ts
- index.ts
- 12. Data Dependencies
- 6. Kanban Columns
- 8. Kanban Behavior
- next.config.ts
- page.tsx
- ProcessCanvasPage
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
- jsdom
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
- tailwindcss
- @tailwindcss/postcss
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
4. `Button` - 29 edges
5. `InMemoryWorkstationAdapter` - 29 edges
6. `supabase` - 29 edges
7. `TASK_LOG` - 25 edges
8. `useWorkstation()` - 22 edges
9. `05 — WS-ACTIONS Session Spec v1` - 21 edges
10. `RouteSkeleton()` - 19 edges

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

## Communities (181 total, 63 thin omitted)

### Community 0 - "cn"
Cohesion: 0.06
Nodes (46): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), DialogOverlay(), DrawerContent() (+38 more)

### Community 1 - "user-profile.ts"
Cohesion: 0.07
Nodes (39): useWorkspaces(), createDefaultProfile(), decodeJwtPayload(), ensureCurrentUserTeamMember(), fromSupabaseProfile(), getSessionLocation(), getSupabaseSessionId(), loadRememberedSessions() (+31 more)

### Community 3 - "compilerOptions"
Cohesion: 0.06
Nodes (34): dom, dom.iterable, esnext, graphify-out, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+26 more)

### Community 4 - "actions-page.tsx"
Cohesion: 0.11
Nodes (23): ActionsFilters(), defaultActionFilters, ActionsPage(), actionProcesses, actionSpaces, filterActions(), filterProcessRuns(), mockActionNodeRuns (+15 more)

### Community 5 - "button.tsx"
Cohesion: 0.15
Nodes (19): Button, ButtonProps, Input, Label, labelVariants, RequiredLabel(), RequiredLabelProps, Spinner() (+11 more)

### Community 6 - "TASK_LOG"
Cohesion: 0.07
Nodes (28): 2026-07-06 - Foundation through WS-SPACES, 2026-07-07 - Memory Economics, 2026-07-07 - WS-ACTIONS, 2026-07-07 - WS-PROCESS, 2026-07-08 - Semantic Layer Migration, 2026-07-09 - Context Memory Layer Functional Rollout, 2026-07-09 - Context Memory Layer (PRD-CML-001), 2026-07-18 - Dev 404 and authenticated Workstation E2E (+20 more)

### Community 7 - "i18n-context.tsx"
Cohesion: 0.10
Nodes (18): geist, metadata, AppProviders(), I18nContext, I18nContextValue, I18nProvider(), SonnerProvider(), BackButton() (+10 more)

### Community 8 - "task-executions.ts"
Cohesion: 0.10
Nodes (17): addMessage(), addOutput(), createExecution(), generateMessageId(), generateOutputId(), generateShortExecId(), loadLatestApprovedOutput(), resolveUpstreamContext() (+9 more)

### Community 9 - "process-table.tsx"
Cohesion: 0.18
Nodes (21): NotificationPopoverProps, notifications, organizations, Checkbox(), DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem() (+13 more)

### Community 10 - "utils.ts"
Cohesion: 0.08
Nodes (19): AccordionContent, AccordionItem, AccordionTrigger, Alert, AlertDescription, AlertTitle, alertVariants, BackgroundGradient() (+11 more)

### Community 11 - "actions-kanban.tsx"
Cohesion: 0.16
Nodes (18): Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle, Progress, ActionsKanban() (+10 more)

### Community 12 - "sidebar.tsx"
Cohesion: 0.10
Nodes (19): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), SidebarContext (+11 more)

### Community 13 - "create-process-dialog.tsx"
Cohesion: 0.18
Nodes (16): Dialog(), DialogClose(), DialogContent(), DialogHeader(), DialogTitle(), DialogTrigger(), Separator, Textarea() (+8 more)

### Community 14 - "menubar.tsx"
Cohesion: 0.10
Nodes (19): DropdownMenuCheckboxItem(), DropdownMenuPortal(), DropdownMenuRadioGroup(), DropdownMenuRadioItem(), DropdownMenuShortcut(), DropdownMenuSub(), DropdownMenuSubContent(), DropdownMenuSubTrigger() (+11 more)

### Community 15 - "InMemoryWorkstationAdapter"
Cohesion: 0.17
Nodes (3): getActionStage(), duration(), InMemoryWorkstationAdapter

### Community 16 - "logAuditEvent"
Cohesion: 0.18
Nodes (22): useFlows(), logAuditEvent(), approveFlow(), createFlow(), deleteFlow(), generateShortId(), generateUniqueId(), invalidateFlowOfficialStatus() (+14 more)

### Community 17 - "app-sidebar.tsx"
Cohesion: 0.11
Nodes (21): AppSidebar(), AppSidebarProps, isRouteActive(), NotificationPopover(), OrganizationSwitcher(), getSidebarRoutes(), Collapsible(), CollapsibleContent() (+13 more)

### Community 18 - "team-members.ts"
Cohesion: 0.11
Nodes (13): AccessRole, AgentAccessContext, displayName(), isOnline(), loadCurrentTeamAssignment(), loadTeamMembers(), normalizeTeamName(), ProfileRow (+5 more)

### Community 19 - "flow-runs.ts"
Cohesion: 0.11
Nodes (10): addFlowRunStep(), createFlowRun(), generateShortId(), generateStepId(), CreateFlowRunInput, CreateFlowRunStepInput, FlowRun, FlowRunStatus (+2 more)

### Community 20 - "command.tsx"
Cohesion: 0.14
Nodes (18): MultiSelect(), MultiSelectProps, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem() (+10 more)

### Community 21 - "workstation-provider.tsx"
Cohesion: 0.14
Nodes (9): ProcessRun, AuthorizationPolicy, ExecutionRuntime, FixtureAuthorizationPolicy, WorkstationContext, WorkstationContextValue, WorkstationSnapshot, OrganizationRole (+1 more)

### Community 22 - "workstation-overview.tsx"
Cohesion: 0.14
Nodes (14): WorkstationPageProps, WorkstationLiveActionsTable(), WorkstationOverview(), WorkstationShortcuts(), WorkstationSummaryCards(), WorkstationUsageChart(), workstationLiveActions, workstationOperationalSummary (+6 more)

### Community 23 - "process.types.ts"
Cohesion: 0.11
Nodes (18): createProcessSchema, connectionTypes, failureBehaviors, inputModes, NodeConnectionType, NodeRun, NodeRunStatus, nodeRunStatuses (+10 more)

### Community 24 - "flow-cards.ts"
Cohesion: 0.19
Nodes (13): useFlowCards(), createFlowCard(), createFlowEdge(), generateEdgeShortId(), generateShortId(), loadFlowCards(), loadFlowEdges(), syncFlowEditor() (+5 more)

### Community 25 - "tasks.ts"
Cohesion: 0.18
Nodes (15): useTasks(), createTask(), deleteTask(), generateShortId(), generateUniqueId(), isIdUnique(), loadTasks(), updateTaskStatus() (+7 more)

### Community 26 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 27 - "PRD-024 — Adaptadores Duráveis do Workstation v1"
Cohesion: 0.11
Nodes (18): 10. Realtime, 11. Plano de entrega e microgerenciamento, 12. Observabilidade e SLOs, 13. Rollout e rollback, 14. Critérios de aceite, 15. Pendências de decisão, 1. Resultado esperado, 2. Escopo (+10 more)

### Community 28 - "WorkstationRepository"
Cohesion: 0.15
Nodes (5): WorkstationRepository, CreateProcessInput, RedRiseNode, RedRiseProcess, Space

### Community 29 - "AGENTS"
Cohesion: 0.11
Nodes (17): Active Sources Of Truth, AGENTS, Backend policy, Cache protection, Commands, Current Entry Points, Current Invariants, Current Stack (+9 more)

### Community 30 - "space.types.ts"
Cohesion: 0.14
Nodes (15): acceptedOrganizationMembers, mockOrganizationMembers, mockSpaces, spacesMetrics, spacesUsageCards, AddSpaceMemberInput, addSpaceMemberSchema, CreateSpaceInput (+7 more)

### Community 31 - "RedRise - Product Architecture Map v1"
Cohesion: 0.12
Nodes (16): Actions, App Shell, Auth Domain, Backend Status, Current Code Organization, Current Navigation, Implemented Screen IDs, Next Scope Boundary (+8 more)

### Community 32 - "react"
Cohesion: 0.14
Nodes (16): react, react, ContextMenu(), ContextMenuContent(), ContextMenuContentProps, ContextMenuContext, ContextMenuItem(), ContextMenuItemProps (+8 more)

### Community 33 - "useWorkstation"
Cohesion: 0.20
Nodes (10): useWorkstation(), WorkstationCapability, ProcessPage(), getColumns(), ProcessTable(), CreateProcessDialog(), SpacesMetricsStrip(), SpacesPage() (+2 more)

### Community 34 - "auth-layout.tsx"
Cohesion: 0.15
Nodes (7): AuthGradientVisual(), GradientBlinds(), AuthLayout(), ForgotPasswordForm(), ResetPasswordForm(), SignInForm(), SignUpForm()

### Community 35 - "workstation.ts"
Cohesion: 0.15
Nodes (12): clone(), DomainErrorCode, ROLE_CAPABILITIES, WorkstationAdapterOptions, WorkstationDomainError, CanvasNodeData, mockCanvasNodes, mockNodeConnections (+4 more)

### Community 36 - "supabase.ts"
Cohesion: 0.14
Nodes (8): AnalyticsData, AgentProviderAuthMethod, AgentProviderId, ChatCompletionResponse, ChatMessage, TaskExecuteContext, TaskExecuteResult, supabase

### Community 37 - "spaces-table.tsx"
Cohesion: 0.36
Nodes (11): Badge(), badgeVariants, CardDescription, Table(), TableBody(), TableCell(), TableHead(), TableHeader() (+3 more)

### Community 38 - "role-assignment-dialog.tsx"
Cohesion: 0.23
Nodes (11): DialogFooter(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator() (+3 more)

### Community 39 - "projects.ts"
Cohesion: 0.27
Nodes (12): useProjects(), createProject(), deleteProject(), generateShortId(), generateUniqueId(), isIdUnique(), loadProjects(), updateProject() (+4 more)

### Community 40 - "integrations.ts"
Cohesion: 0.13
Nodes (8): createIntegration(), CreateIntegrationInput, deleteIntegration(), generateShortId(), Integration, IntegrationSetupDetail, IntegrationSetupSummary, IntegrationStatus

### Community 41 - "agents.ts"
Cohesion: 0.26
Nodes (11): useAgents(), createAgent(), deleteAgent(), generateShortId(), generateUniqueId(), isIdUnique(), loadAgents(), updateAgent() (+3 more)

### Community 42 - "notifications.ts"
Cohesion: 0.26
Nodes (12): useNotifications(), createNotification(), generateShortId(), loadNotifications(), markNotificationRead(), markNotificationUnread(), resolveNotification(), CreateNotificationInput (+4 more)

### Community 43 - "billing.ts"
Cohesion: 0.16
Nodes (10): BillingPlan, BillingStatus, BillingSubscription, BillingSubscriptionRow, defaultBillingSubscription(), fromRow(), loadBillingSubscription(), PLAN_LIMITS (+2 more)

### Community 44 - "app.ts"
Cohesion: 0.27
Nodes (5): openSettings(), openAuthenticatedApp(), openSidebarModule(), openTopbarAction(), SidebarModule

### Community 45 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, clean:next, dev, dev:clean, dev:webpack, lint, mcp:redrise-ops (+6 more)

### Community 46 - "app-breadcrumb.tsx"
Cohesion: 0.23
Nodes (11): AppBreadcrumb(), getCrumbs(), routeLabels, SidebarRoute, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+3 more)

### Community 47 - "teams.ts"
Cohesion: 0.20
Nodes (11): addTeamAssignments(), AssignmentRow, createTeam(), generateShortId(), loadCurrentTeamAssignments(), loadTeams(), mapTeam(), normalizeFallbackTeam() (+3 more)

### Community 48 - "05 — WS-ACTIONS Session Spec v1"
Cohesion: 0.15
Nodes (12): 05 — WS-ACTIONS Session Spec v1, 13. Realtime Requirements, 14. Sonner Usage, 16. Out of Scope for WS-ACTIONS MVP, 17. MVP Layout, 18. Acceptance Criteria, 1. Objective, 20. Implementation Notes (+4 more)

### Community 49 - "devDependencies"
Cohesion: 0.15
Nodes (13): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, @playwright/test, shadcn, @testing-library/react (+5 more)

### Community 50 - "Fonte operacional — RedRise"
Cohesion: 0.15
Nodes (12): Artifacts condicionais, Branch e PR, Decomposição, Fonte operacional — RedRise, Fontes ativas, Limites, Outcome do app, Relação com a Ghauss (+4 more)

### Community 51 - "redrise-ops.mjs"
Cohesion: 0.23
Nodes (10): __dirname, handle(), processMessage(), projectRoot, shell(), startServer(), toolList(), tools (+2 more)

### Community 52 - "app-shell.tsx"
Cohesion: 0.22
Nodes (9): OrganizationLayout(), OrganizationLayoutProps, Home(), AppShell(), AppShellProps, ActiveOrganization, SidebarInset(), WorkstationProvider() (+1 more)

### Community 53 - "alert-dialog.tsx"
Cohesion: 0.17
Nodes (11): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+3 more)

### Community 54 - "chart.tsx"
Cohesion: 0.21
Nodes (11): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+3 more)

### Community 55 - "index.ts"
Cohesion: 0.23
Nodes (10): adapterResponse(), buildStructuredResult(), DEFAULT_ALLOWED_ORIGINS, endpointLabel(), generateAdapterRunId(), getAllowedOrigins(), getCorsHeaders(), providerCandidates() (+2 more)

### Community 56 - "index.ts"
Cohesion: 0.29
Nodes (10): activeStatus(), auditId(), handleCheckoutCompleted(), planFromMetadata(), StripeObject, timingSafeEqual(), toHex(), unixToIso() (+2 more)

### Community 57 - "index.ts"
Cohesion: 0.21
Nodes (6): ALLOWED_EXTENSIONS, DEFAULT_ALLOWED_ORIGINS, extensionOf(), getAllowedOrigins(), getCorsHeaders(), safePath()

### Community 58 - "dependencies"
Cohesion: 0.18
Nodes (11): @base-ui/react, next-themes, dependencies, @base-ui/react, next-themes, @radix-ui/react-select, @radix-ui/react-tooltip, react-hook-form (+3 more)

### Community 59 - "RedRise - UI Blocks Reference Map v1"
Cohesion: 0.20
Nodes (9): Actions, App Shell, Auth, Global Rules, Process, RedRise - UI Blocks Reference Map v1, Spaces, Status (+1 more)

### Community 60 - "RedRise - Roadmap v1"
Cohesion: 0.20
Nodes (9): Completed, Current validation baseline, Foundation and shell, Functional Workstation reference, Next milestone, Out of scope for RedRise, RedRise - Roadmap v1, RedScale and embedded CML cleanup (+1 more)

### Community 61 - "api-keys.ts"
Cohesion: 0.27
Nodes (8): ApiKey, createApiKey(), CreateApiKeyInput, deleteApiKey(), generateApiKeySecret(), generateShortId(), revokeApiKey(), sha256Hex()

### Community 62 - "BOOT"
Cohesion: 0.22
Nodes (8): Active Sources Of Truth, BOOT, Commands, Current Entry Points, Current Invariants, Current Stack, Implemented Scope, Known Blockers

### Community 63 - "RedRise"
Cohesion: 0.22
Nodes (8): Architecture, Commands, Current Scope, Environment, Notes, RedRise, Source Of Truth, Stack

### Community 64 - "input-group.tsx"
Cohesion: 0.28
Nodes (8): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea()

### Community 65 - "cml-server.ts"
Cohesion: 0.25
Nodes (7): CmlAdapterError, CmlAdapterErrorCode, GlobalContextStatus, loadClient(), OfficialSdk, RedRiseGlobalContextResult, searchRedRiseGlobalContext()

### Community 66 - "index.ts"
Cohesion: 0.25
Nodes (4): DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins(), getCorsHeaders(), InvitePayload

### Community 67 - "audit-logs.ts"
Cohesion: 0.25
Nodes (5): AuditAction, AuditEntityType, AuditLog, generateShortId(), LogInput

### Community 68 - "team-invites.ts"
Cohesion: 0.32
Nodes (6): InviteRow, loadPendingTeamInvites(), profileName(), ProfileRow, singleRelation(), TeamInviteNotification

### Community 69 - "11. Action Details Dialog"
Cohesion: 0.29
Nodes (7): 11. Action Details Dialog, Dialog layout, Error content, Overview fields, Result content, Steps content, Tabs or sections

### Community 70 - "INDEX"
Cohesion: 0.29
Nodes (6): Always Read, Documentation Policy, Domain Routing, End Of Work, INDEX, Memory Economics

### Community 71 - "orbiting-circles-01.tsx"
Cohesion: 0.29
Nodes (5): circle1Icons, circle2Icons, IconData, OrbitingCirclesDemo(), OrbitingCirclesProps

### Community 72 - "settings.ts"
Cohesion: 0.29
Nodes (6): NotificationSettings, OrganizationMemberRow, SettingsIntegration, SettingsMember, SettingsMemberStatus, SettingsRole

### Community 73 - "index.ts"
Cohesion: 0.33
Nodes (4): DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins(), getCorsHeaders(), PLAN_PRICE_ENV

### Community 74 - "index.ts"
Cohesion: 0.33
Nodes (3): DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins(), getCorsHeaders()

### Community 75 - "19. Test Checklist"
Cohesion: 0.33
Nodes (6): 19. Test Checklist, Dialog, Filters, Kanban, RBAC, Run History Table

### Community 76 - "Workstation"
Cohesion: 0.33
Nodes (5): Core files, Current behavior, Next milestone, State transitions, Workstation

### Community 77 - "useSidebar"
Cohesion: 0.33
Nodes (6): useSidebar(), Sidebar(), SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger()

### Community 78 - "useIsMobile"
Cohesion: 0.53
Nodes (5): SidebarProvider(), getServerSnapshot(), getSnapshot(), subscribe(), useIsMobile()

### Community 79 - "index.ts"
Cohesion: 0.40
Nodes (3): DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins(), getCorsHeaders()

### Community 80 - "global-setup.ts"
Cohesion: 0.33
Nodes (3): __dirname, env, __filename

### Community 81 - "15. RBAC / Visibility"
Cohesion: 0.40
Nodes (5): 15. RBAC / Visibility, Admin / Owner / Board, Staff, User, Viewer

### Community 82 - "4. Header"
Cohesion: 0.40
Nodes (5): 4. Header, Breadcrumb, Description, Primary rule, Title

### Community 83 - "Auth"
Cohesion: 0.40
Nodes (4): Auth, Current Behavior, Pending, Source Files

### Community 84 - "Settings And App Shell"
Cohesion: 0.40
Nodes (4): Current Behavior, Pending, Settings And App Shell, Source Files

### Community 85 - "Supabase"
Cohesion: 0.40
Nodes (4): Current Behavior, Pending, Source Files, Supabase

### Community 86 - "Testing And Deploy"
Cohesion: 0.40
Nodes (4): Commands, Current Validation Baseline, Known Blockers, Testing And Deploy

### Community 87 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 88 - "member-functions.ts"
Cohesion: 0.50
Nodes (3): MEMBER_FUNCTIONS, MemberFunction, normalizeMemberFunction()

### Community 89 - "timezones.ts"
Cohesion: 0.40
Nodes (4): TIMEZONE_OPTIONS, TIMEZONE_REGIONS, TimezoneOption, TimezoneRegion

### Community 90 - "index.ts"
Cohesion: 0.50
Nodes (3): DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins(), getCorsHeaders()

### Community 91 - "10. Run History Table"
Cohesion: 0.50
Nodes (4): 10. Run History Table, Required columns, Required table features, Row actions

### Community 92 - "2. Selected UI References"
Cohesion: 0.50
Nodes (4): 2.1 Kanban, 2.2 Runs / Actions Table, 2.3 Action Details Dialog, 2. Selected UI References

### Community 93 - "7. Kanban Card"
Cohesion: 0.50
Nodes (4): 7. Kanban Card, Adaptation from `@reui/c-kanban-5`, Required card fields, Visual content

### Community 94 - "RedRise - PRD Index v1"
Cohesion: 0.50
Nodes (3): Acceptance rules, RedRise - PRD Index v1, Status

### Community 95 - "DECISIONS"
Cohesion: 0.50
Nodes (3): Active Decisions, DECISIONS, Implemented Decisions

### Community 96 - "clean-next.mjs"
Cohesion: 0.50
Nodes (3): nextDevOutput, nextOutputRoot, workspaceRoot

### Community 97 - "copy-spa-fallback.mjs"
Cohesion: 0.50
Nodes (3): distDir, fallbackPath, indexPath

### Community 100 - "index.ts"
Cohesion: 0.67
Nodes (3): DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins(), getCorsHeaders()

### Community 101 - "12. Data Dependencies"
Cohesion: 0.67
Nodes (3): 12. Data Dependencies, node_runs, process_runs

### Community 102 - "6. Kanban Columns"
Cohesion: 0.67
Nodes (3): 6. Kanban Columns, Column metadata, Status-to-column mapping

### Community 103 - "8. Kanban Behavior"
Cohesion: 0.67
Nodes (3): 8. Kanban Behavior, Drag and drop, Realtime movement

## Knowledge Gaps
- **537 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `css` (+532 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `button.tsx`, `process-table.tsx`, `utils.ts`, `actions-kanban.tsx`, `sidebar.tsx`, `create-process-dialog.tsx`, `menubar.tsx`, `app-sidebar.tsx`, `command.tsx`, `workstation-overview.tsx`, `react`, `auth-layout.tsx`, `spaces-table.tsx`, `role-assignment-dialog.tsx`, `app-breadcrumb.tsx`, `app-shell.tsx`, `alert-dialog.tsx`, `chart.tsx`, `input-group.tsx`, `orbiting-circles-01.tsx`, `useSidebar`, `useIsMobile`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-scroll-area`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `react-day-picker`, `react-dom`, `react-is`, `recharts`, `sonner`, `@supabase/ssr`, `@supabase/supabase-js`, `@tabler/icons-react`, `tailwind-merge`, `@tanstack/react-table`, `tw-animate-css`, `vaul`, `@xyflow/react`, `zod`, `react`, `package.json`, `class-variance-authority`, `clsx`, `cmdk`, `date-fns`, `@dnd-kit/core`, `@dnd-kit/modifiers`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@hookform/resolvers`, `lucide-react`, `next`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `useWorkstation`, `auth-layout.tsx`, `actions-page.tsx`, `process-table.tsx`, `utils.ts`, `ProcessCanvasPage`, `useSidebar`, `useIsMobile`, `app-sidebar.tsx`, `command.tsx`, `app-shell.tsx`, `chart.tsx`, `workstation-overview.tsx`, `dependencies`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _537 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.06077694235588972 - nodes in this community are weakly interconnected._
- **Should `user-profile.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06862745098039216 - nodes in this community are weakly interconnected._
- **Should `route-skeleton.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07557354925775979 - nodes in this community are weakly interconnected._