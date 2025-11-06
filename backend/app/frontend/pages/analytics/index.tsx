import { Head, router } from "@inertiajs/react"
import { AlertCircle, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"

import { ActivityLineChart } from "@/components/analytics/activity-line-chart"
import { DayOfWeekChart } from "@/components/analytics/day-of-week-chart"
import { FilterBar } from "@/components/analytics/filter-bar"
import { HeatmapCalendar } from "@/components/analytics/heatmap-calendar"
import { HourOfDayChart } from "@/components/analytics/hour-of-day-chart"
import { KpiCards } from "@/components/analytics/kpi-cards"
import { NeedsAttentionList } from "@/components/analytics/needs-attention-list"
import { ProjectDonut } from "@/components/analytics/project-donut"
import { TopPeopleBar } from "@/components/analytics/top-people-bar"
import { Card, CardContent } from "@/components/ui/card"
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

  const rangeDescriptions: Record<typeof selectedRange, string> = {
    week: "Last 7 days",
    month: "Last 30 days",
    year: "Last 12 months",
  }

  const activeProjectLabel = selectedProject
    ? projects.find((project) => project.id === selectedProject)?.name ?? "Selected project"
    : "All Projects"

  const rangeText = rangeDescriptions[selectedRange]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Analytics" />
      <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
        <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-background via-card/70 to-muted/40 px-6 py-10 shadow-[0_30px_80px_-60px_rgba(8,15,30,0.75)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.18),_transparent_60%)]" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/70">
                  Analytics Overview
                </span>
                <div className="space-y-2">
                  <h1 className="text-4xl font-semibold tracking-tight text-foreground">Analytics</h1>
                  <p className="max-w-2xl text-base text-muted-foreground/90">
                    Metrics and trends from your entries. Explore where time goes, when you work best, and which projects need attention.
                  </p>
                </div>
              </div>

              {analyticsData && (
                <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
                  <div className="rounded-2xl border border-border/40 bg-background/70 px-5 py-4 shadow-inner shadow-black/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">Project</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{activeProjectLabel}</p>
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-background/70 px-5 py-4 shadow-inner shadow-black/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">Range</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{rangeText}</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">Timezone adjusts automatically</p>
                  </div>
                </div>
              )}
            </div>

            <FilterBar
              projects={projects}
              selectedProject={selectedProject}
              selectedRange={selectedRange}
              onProjectChange={setSelectedProject}
              onRangeChange={setSelectedRange}
            />
          </div>
        </section>

        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-primary border-t-transparent" />
          </div>
        )}

        {!loading && analyticsData?.cards.totalEntries === 0 && <EmptyState />}

        {!loading && analyticsData && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div>
              <KpiCards data={analyticsData.cards} />
            </div>

            {/* Activity Timeline - Full Width */}
            <ActivityLineChart
              activity={analyticsData.activity}
              rolling7={analyticsData.rolling7}
              onDateClick={handleDateClick}
            />

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
    <Card className="border-border/30">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <BarChart3 className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-medium">No data yet</h3>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Start logging entries to see your analytics dashboards
        </p>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-accent-primary">→</span>
            <span>Add your first entry</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent-primary">→</span>
            <span>Tag a project or person</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
