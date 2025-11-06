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

// Analytics types
export interface AnalyticsMeta {
  range: "week" | "month" | "year"
  projectId: number | null
  tz: string
  from: string
  to: string
}

export interface AnalyticsCards {
  totalEntries: number
  activeDays: number
  currentStreak: number
  longestStreak: number
  avgPerActiveDay: number
  focusScore: number
  unmentionedShare: number
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

export interface AnalyticsProjectsData {
  top: ProjectBreakdown[]
  otherCount: number
  focusScore: number
  stale: StaleProject[]
}

export interface AnalyticsPeopleData {
  top: PersonBreakdown[]
  otherCount: number
}

export interface AnalyticsNeedsAttention {
  staleProjects: StaleProject[]
  unmentionedShare: number
}

export interface AnalyticsData {
  meta: AnalyticsMeta
  cards: AnalyticsCards
  activity: ActivityDataPoint[]
  rolling7: ActivityDataPoint[]
  heatmap: ActivityDataPoint[]
  hourly: HourlyDataPoint[]
  dow: DowDataPoint[]
  projects: AnalyticsProjectsData
  people: AnalyticsPeopleData
  needsAttention: AnalyticsNeedsAttention
}
