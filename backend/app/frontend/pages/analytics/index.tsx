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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Analytics" />
      <div className="space-y-6 px-4 pb-10 pt-6 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">Analytics</h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base mt-2">
                    Metrics and trends from your entries. Explore where time goes, when you work best, and which projects need attention.
                  </p>
                </div>
            </div>

            <FilterBar
              projects={projects}
              selectedProject={selectedProject}
              selectedRange={selectedRange}
              onProjectChange={setSelectedProject}
              onRangeChange={setSelectedRange}
            />

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
          <div className="space-y-6">
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
