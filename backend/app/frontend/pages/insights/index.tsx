import { router, usePage } from "@inertiajs/react"
import { AlertCircle, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"

import { ActivityLineChart } from "@/components/insights/activity-line-chart"
import { DayOfWeekChart } from "@/components/insights/day-of-week-chart"
import { FilterBar } from "@/components/insights/filter-bar"
import { HeatmapCalendar } from "@/components/insights/heatmap-calendar"
import { HourOfDayChart } from "@/components/insights/hour-of-day-chart"
import { KpiCards } from "@/components/insights/kpi-cards"
import { NeedsAttentionList } from "@/components/insights/needs-attention-list"
import { ProjectDonut } from "@/components/insights/project-donut"
import { TopPeopleBar } from "@/components/insights/top-people-bar"
import { Card, CardContent } from "@/components/ui/card"
import type { InsightsData, SharedData } from "@/types"

interface Project {
  id: number
  name: string
}

interface InsightsPageProps extends SharedData {
  projects?: Project[]
}

export default function InsightsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [selectedRange, setSelectedRange] = useState<"week" | "month" | "year">("week")
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch projects on mount
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Failed to fetch projects:", err))
  }, [])

  // Fetch insights data when filters change
  useEffect(() => {
    fetchInsights()
  }, [selectedProject, selectedRange])

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        range: selectedRange,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })

      if (selectedProject) {
        params.append("project_id", selectedProject.toString())
      }

      const response = await fetch(`/api/insights?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch insights")
      }

      const data = await response.json()
      setInsightsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = (date: string) => {
    const params = new URLSearchParams({ date })
    if (selectedProject) {
      params.append("project_id", selectedProject.toString())
    }
    router.visit(`/dashboard?${params.toString()}`)
  }

  const handleHourClick = (hour: number) => {
    const params = new URLSearchParams({ hour: hour.toString(), range: selectedRange })
    if (selectedProject) {
      params.append("project_id", selectedProject.toString())
    }
    router.visit(`/dashboard?${params.toString()}`)
  }

  const handleDayClick = (dow: number) => {
    const params = new URLSearchParams({ dow: dow.toString(), range: selectedRange })
    if (selectedProject) {
      params.append("project_id", selectedProject.toString())
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

  const handleUntaggedClick = () => {
    const params = new URLSearchParams({ untagged: "true", range: selectedRange })
    router.visit(`/dashboard?${params.toString()}`)
  }

  // Zero-data state
  if (!loading && insightsData?.cards.totalEntries === 0) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Insights</h1>
          <p className="text-muted-foreground">Analytics and trends from your entries</p>
        </div>

        <Card className="border-border/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No data yet</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Start logging entries to see your insights and analytics
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
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Insights</h1>
        <p className="text-muted-foreground">Analytics and trends from your entries</p>
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

      {!loading && insightsData && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <KpiCards data={insightsData.cards} />

          {/* Primary Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ActivityLineChart
              activity={insightsData.activity}
              rolling7={insightsData.rolling7}
              onDateClick={handleDateClick}
            />
            <HeatmapCalendar data={insightsData.heatmap} onDateClick={handleDateClick} />
          </div>

          {/* Time Distribution Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <HourOfDayChart data={insightsData.hourly} onHourClick={handleHourClick} />
            <DayOfWeekChart data={insightsData.dow} onDayClick={handleDayClick} />
          </div>

          {/* Project and People */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProjectDonut data={insightsData.projects} onProjectClick={handleProjectClick} />
            <TopPeopleBar data={insightsData.people} onPersonClick={handlePersonClick} />
          </div>

          {/* Needs Attention */}
          <NeedsAttentionList
            data={insightsData.needsAttention}
            onStaleProjectClick={handleStaleProjectClick}
            onUntaggedClick={handleUntaggedClick}
          />
        </div>
      )}
    </div>
  )
}
