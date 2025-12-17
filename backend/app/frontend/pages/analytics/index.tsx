import { Head, router } from "@inertiajs/react"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

import { DayOfWeekChart } from "@/components/analytics/day-of-week-chart"
import { FilterBar } from "@/components/analytics/filter-bar"
import { HeatmapCalendar } from "@/components/analytics/heatmap-calendar"
import { HourOfDayChart } from "@/components/analytics/hour-of-day-chart"
import { KpiCards } from "@/components/analytics/kpi-cards"
import { NeedsAttentionList } from "@/components/analytics/needs-attention-list"
import { ProjectDonut } from "@/components/analytics/project-donut"
import { TopPeopleBar } from "@/components/analytics/top-people-bar"
import AppLayout from "@/layouts/app-layout"
import { analyticsPath } from "@/routes"
import type { AnalyticsData, BreadcrumbItem } from "@/types"

interface Project {
  id: string
  name: string
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Analytics",
    href: analyticsPath(),
  },
]

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState<"week" | "month" | "year">("week")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch projects on mount
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Failed to fetch projects:", err))
  }, [])

  // Fetch analytics data when filters change
  useEffect(() => {
    fetchAnalytics()
  }, [selectedProject, selectedRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        range: selectedRange,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })

      if (selectedProject) {
        params.append("project_id", selectedProject)
      }

      const response = await fetch(`/api/analytics?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const data = (await response.json()) as AnalyticsData
      setAnalyticsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = (date: string) => {
    const params = new URLSearchParams({ date })
    if (selectedProject) {
      params.append("project_id", selectedProject)
    }
    router.visit(`/dashboard?${params.toString()}`)
  }

  const handleHourClick = (hour: number) => {
    const params = new URLSearchParams({ hour: hour.toString(), range: selectedRange })
    if (selectedProject) {
      params.append("project_id", selectedProject)
    }
    router.visit(`/dashboard?${params.toString()}`)
  }

  const handleDayClick = (dow: number) => {
    const params = new URLSearchParams({ dow: dow.toString(), range: selectedRange })
    if (selectedProject) {
      params.append("project_id", selectedProject)
    }
    router.visit(`/dashboard?${params.toString()}`)
  }

  const handleProjectClick = (projectId: number) => {
    setSelectedProject(projectId)
  }

  const handlePersonClick = (personId: number) => {
    const params = new URLSearchParams({ person_id: personId.toString(), range: selectedRange })
    router.visit(`/dashboard?${params.toString()}`)
  }

  const handleStaleProjectClick = (projectId: number) => {
    setSelectedProject(projectId)
  }

  const handleUnmentionedClick = () => {
    const params = new URLSearchParams({ unmentioned: "true", range: selectedRange })
    router.visit(`/dashboard?${params.toString()}`)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Analytics" />
      <div className="space-y-6 px-4 pb-10 pt-6 md:px-6">
        {/* Page header - calm and clear */}
        <header>
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Patterns from your entries over time.
          </p>
        </header>

        <FilterBar
              projects={projects}
              selectedProject={selectedProject}
              selectedRange={selectedRange}
              onProjectChange={setSelectedProject}
              onRangeChange={setSelectedRange}
            />

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!loading && analyticsData?.cards.totalEntries === 0 && <EmptyState />}

        {!loading && analyticsData && (
          <div className="space-y-6">
            {/* Text insight summary - text leads, charts support */}
            <TextInsightSummary data={analyticsData} range={selectedRange} />

            {/* KPI Cards */}
            <div>
              <KpiCards data={analyticsData.cards} />
            </div>

            {/* Activity Heatmap - Full Width */}
            <HeatmapCalendar data={analyticsData.heatmap} onDateClick={handleDateClick} />

            {/* Time Distribution Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <HourOfDayChart data={analyticsData.hourly} onHourClick={handleHourClick} />
              <DayOfWeekChart data={analyticsData.dow} onDayClick={handleDayClick} />
            </div>

            {/* Project and People */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ProjectDonut data={analyticsData.projects} onProjectClick={handleProjectClick} />
              <TopPeopleBar data={analyticsData.people} onPersonClick={handlePersonClick} />
            </div>

            {/* Needs Attention */}
            <NeedsAttentionList
              data={analyticsData.needsAttention}
              onStaleProjectClick={handleStaleProjectClick}
              onUnmentionedClick={handleUnmentionedClick}
            />
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export function EmptyState() {
  return (
    <section className="py-12 text-center">
      <p className="text-muted-foreground mb-4">
        Once you&apos;ve logged a few days, patterns will show up here.
      </p>
      <a
        href="/dashboard"
        className="text-sm font-medium text-primary hover:text-primary/80"
      >
        Log an entry →
      </a>
    </section>
  )
}

// Text-first insight summary - per UX direction, text leads, charts support
function TextInsightSummary({ data, range }: { data: AnalyticsData; range: string }) {
  const { cards, hourly, dow } = data

  // Find peak hour
  const peakHour = hourly.reduce((max, h) => (h.count > max.count ? h : max), hourly[0])
  const peakHourLabel = peakHour?.hour !== undefined
    ? new Date(2000, 0, 1, peakHour.hour).toLocaleTimeString([], { hour: 'numeric' })
    : null

  // Find best day
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const bestDay = dow.reduce((max, d) => (d.count > max.count ? d : max), dow[0])
  const bestDayLabel = bestDay?.dow !== undefined ? dayNames[bestDay.dow] : null

  // Build insight text
  const rangeLabel = range === 'week' ? 'this week' : range === 'month' ? 'this month' : 'this year'

  if (cards.totalEntries === 0) return null

  const insights: string[] = []

  if (cards.totalEntries > 0) {
    insights.push(`You logged ${cards.totalEntries} ${cards.totalEntries === 1 ? 'entry' : 'entries'} ${rangeLabel}`)
  }

  if (peakHourLabel && peakHour.count > 0) {
    insights.push(`most around ${peakHourLabel}`)
  }

  if (bestDayLabel && bestDay.count > 0 && insights.length < 3) {
    insights.push(`${bestDayLabel}s are your most active day`)
  }

  if (insights.length === 0) return null

  return (
    <p className="text-foreground">
      {insights.slice(0, 2).join(', ')}{insights.length > 2 ? `. ${insights[2]}.` : '.'}
    </p>
  )
}
