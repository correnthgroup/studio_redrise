import type { ReactNode } from "react"
import {
  BellIcon,
  BookOpenIcon,
  BotIcon,
  BrainCircuitIcon,
  ChartNoAxesCombinedIcon,
  CpuIcon,
  DatabaseIcon,
  FolderKanbanIcon,
  Layers3Icon,
  LifeBuoyIcon,
  MessageSquareTextIcon,
  PanelsTopLeftIcon,
  PuzzleIcon,
  SettingsIcon,
  UserRoundIcon,
  UsersRoundIcon,
  WorkflowIcon,
  ZapIcon,
} from "lucide-react"

export type SidebarRoute = {
  title: string
  href: string
  icon: ReactNode
  visible: boolean
  items?: Array<{
    title: string
    href: string
    visible: boolean
  }>
}

export function getSidebarRoutes(organizationSlug: string): SidebarRoute[] {
  const base = `/${organizationSlug}`

  return [
    {
      title: "Workstation",
      href: `${base}/workstation`,
      icon: <WorkflowIcon />,
      visible: true,
      items: [
        { title: "Spaces", href: `${base}/workstation/spaces`, visible: true },
        { title: "Process", href: `${base}/workstation/process`, visible: true },
        { title: "Actions", href: `${base}/workstation/actions`, visible: true },
      ],
    },
    {
      title: "Agents",
      href: `${base}/agents`,
      icon: <BotIcon />,
      visible: true,
      items: [
        { title: "Models", href: `${base}/agents/models`, visible: true },
        { title: "Engine", href: `${base}/agents/engine`, visible: true },
        { title: "Analytics", href: `${base}/agents/analytics`, visible: true },
      ],
    },
    {
      title: "RedScale",
      href: `${base}/redscale`,
      icon: <BotIcon />,
      visible: true,
      items: [
        { title: "Context Memory", href: `${base}/context`, visible: true },
      ],
    },
    {
      title: "Documentation",
      href: `${base}/documentation`,
      icon: <BookOpenIcon />,
      visible: true,
      items: [
        { title: "Onboarding", href: `${base}/documentation/onboarding`, visible: true },
        { title: "Tutorials", href: `${base}/documentation/tutorials`, visible: true },
        { title: "Changelog", href: `${base}/documentation/changelog`, visible: true },
      ],
    },
    {
      title: "Settings",
      href: `${base}/settings`,
      icon: <SettingsIcon />,
      visible: true,
      items: [
        { title: "Profile", href: `${base}/settings/profile`, visible: true },
        { title: "Team", href: `${base}/settings/team`, visible: true },
        { title: "Notification", href: `${base}/settings/notification`, visible: true },
        { title: "Integration", href: `${base}/settings/integration`, visible: true },
      ],
    },
    {
      title: "Projects",
      href: `${base}/projects`,
      icon: <FolderKanbanIcon />,
      visible: true,
      items: [
        { title: "New Project", href: `${base}/projects/new`, visible: true },
        { title: "Design Engineer", href: `${base}/projects/design-engineer`, visible: true },
      ],
    },
    {
      title: "Support",
      href: `${base}/support`,
      icon: <LifeBuoyIcon />,
      visible: true,
    },
    {
      title: "Feedbacks",
      href: `${base}/feedbacks`,
      icon: <MessageSquareTextIcon />,
      visible: true,
    },
  ]
}

export const routeLabels: Record<string, { label: string; icon?: ReactNode }> = {
  workstation: { label: "Workstation", icon: <WorkflowIcon /> },
  spaces: { label: "Spaces", icon: <Layers3Icon /> },
  process: { label: "Process", icon: <PuzzleIcon /> },
  canvas: { label: "Canvas" },
  actions: { label: "Actions", icon: <ZapIcon /> },
  agents: { label: "Agents", icon: <BotIcon /> },
  models: { label: "Models", icon: <BrainCircuitIcon /> },
  engine: { label: "Engine", icon: <CpuIcon /> },
  analytics: { label: "Analytics", icon: <ChartNoAxesCombinedIcon /> },
  documentation: { label: "Documentation", icon: <BookOpenIcon /> },
  onboarding: { label: "Onboarding" },
  tutorials: { label: "Tutorials" },
  changelog: { label: "Changelog" },
  settings: { label: "Settings", icon: <SettingsIcon /> },
  profile: { label: "Profile", icon: <UserRoundIcon /> },
  team: { label: "Team", icon: <UsersRoundIcon /> },
  notification: { label: "Notification", icon: <BellIcon /> },
  integration: { label: "Integration" },
  projects: { label: "Projects", icon: <PanelsTopLeftIcon /> },
  new: { label: "New Project" },
  "design-engineer": { label: "Design Engineer" },
  support: { label: "Support", icon: <LifeBuoyIcon /> },
  feedbacks: { label: "Feedbacks", icon: <MessageSquareTextIcon /> },
  redscale: { label: "RedScale", icon: <BotIcon /> },
  context: { label: "Context Memory", icon: <DatabaseIcon /> },
}
