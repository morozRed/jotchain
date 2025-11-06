import type { LucideIcon } from "lucide-react"

export interface Auth {
  user: User
  session: Pick<Session, "id">
}

export interface BreadcrumbItem {
  title: string
  href: string
}

export interface NavItem {
  title: string
  href: string
  icon?: LucideIcon | null
  isActive?: boolean
}

export interface Flash {
  alert?: string
  notice?: string
}

export interface SharedData {
  auth: Auth
  flash: Flash
  [key: string]: unknown
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  verified: boolean
  created_at: string
  updated_at: string
  [key: string]: unknown // This allows for additional properties...
}

export interface Session {
  id: string
  user_agent: string
  ip_address: string
  created_at: string
}

// Insights types
export interface InsightsMeta {
  range: "week" | "month" | "year"
  projectId: number | null
  tz: string
  from: string
  to: string
}

export interface InsightsCards {
  totalEntries: number
  activeDays: number
  currentStreak: number
  longestStreak: number
  avgPerActiveDay: number
  focusScore: number
  untaggedShare: number
}

export interface ActivityDataPoint {
  date: string
  count: number
}

export interface HourlyDataPoint {
  hour: number
  count: number
}

export interface DowDataPoint {
  isoDow: number
  count: number
}

export interface ProjectBreakdown {
  id: number
  name: string
  count: number
  share: number
}

export interface PersonBreakdown {
  id: number
  name: string
  count: number
}

export interface StaleProject {
  projectId: number
  name: string
  daysSinceLast: number
}

export interface InsightsProjectsData {
  top: ProjectBreakdown[]
  otherCount: number
  focusScore: number
  stale: StaleProject[]
}

export interface InsightsPeopleData {
  top: PersonBreakdown[]
  otherCount: number
}

export interface InsightsNeedsAttention {
  staleProjects: StaleProject[]
  untaggedShare: number
}

export interface InsightsData {
  meta: InsightsMeta
  cards: InsightsCards
  activity: ActivityDataPoint[]
  rolling7: ActivityDataPoint[]
  heatmap: ActivityDataPoint[]
  hourly: HourlyDataPoint[]
  dow: DowDataPoint[]
  projects: InsightsProjectsData
  people: InsightsPeopleData
  needsAttention: InsightsNeedsAttention
}
