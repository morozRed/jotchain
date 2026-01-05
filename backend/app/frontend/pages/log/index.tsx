import { Head } from "@inertiajs/react"
import { CalendarDays, Check, ChevronDown, ChevronUp, X } from "lucide-react"
import { useMemo, useRef, useState } from "react"

import { AppHeader } from "@/components/app-header"
import { TiptapContent } from "@/components/tiptap-content"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Project {
  id: number
  name: string
  color?: string | null
}

interface Person {
  id: number
  name: string
}

interface EntryMentions {
  projects: Project[]
  persons: Person[]
}

interface Entry {
  id: number
  body: string
  bodyFormat: string
  tag?: string | null
  loggedAt?: string | null
  loggedAtLabel?: string | null
  createdAt: string
  mentions: EntryMentions
}

interface Filters {
  projectId: number | null
  personId: number | null
  q?: string | null
}

interface Pagination {
  total: number
  page: number
  perPage: number
  hasMore: boolean
}

interface LogProps {
  entries: Entry[]
  projects: Project[]
  persons: Person[]
  filters: Filters
  pagination: Pagination
}

// Helper to get date string in YYYY-MM-DD format
function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Helper to format date for display
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

// Helper to get start of week (Sunday)
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper to get start of current week
function getThisWeekStart(): Date {
  return getStartOfWeek(new Date())
}

export default function Log({
  entries,
  projects,
  persons,
  pagination,
}: LogProps) {
  const [loadingMore, setLoadingMore] = useState(false)

  // Accumulate entries across pages (append on load more)
  const [allEntries, setAllEntries] = useState<Entry[]>(entries)
  const lastPageRef = useRef(1)

  // Local multi-select filter state (no URL changes)
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([])
  const [selectedPersonIds, setSelectedPersonIds] = useState<number[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const hasFilters =
    selectedProjectIds.length > 0 ||
    selectedPersonIds.length > 0 ||
    selectedDate !== null

  // Toggle project selection
  const toggleProject = (projectId: number) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    )
  }

  // Toggle person selection
  const togglePerson = (personId: number) => {
    setSelectedPersonIds((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId]
    )
  }

  // Remove single filter
  const removeProjectFilter = (projectId: number) => {
    setSelectedProjectIds((prev) => prev.filter((id) => id !== projectId))
  }

  const removePersonFilter = (personId: number) => {
    setSelectedPersonIds((prev) => prev.filter((id) => id !== personId))
  }

  const removeDateFilter = () => {
    setSelectedDate(null)
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedProjectIds([])
    setSelectedPersonIds([])
    setSelectedDate(null)
  }

  // Build entry count by date for heatmap
  const entriesByDate = useMemo(() => {
    const counts: Record<string, number> = {}
    allEntries.forEach((entry) => {
      if (entry.loggedAt) {
        const dateKey = toDateKey(new Date(entry.loggedAt))
        counts[dateKey] = (counts[dateKey] || 0) + 1
      }
    })
    return counts
  }, [allEntries])

  // Calculate max entries per day for intensity scaling
  const maxEntriesPerDay = useMemo(() => {
    const values = Object.values(entriesByDate)
    return values.length > 0 ? Math.max(...values) : 1
  }, [entriesByDate])

  // Waveform window offset (0 = most recent 15 days)
  const [waveformOffset, setWaveformOffset] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null)
  const WAVEFORM_WINDOW_SIZE = 15
  const MAX_WAVEFORM_DAYS = 90 // Total days we can navigate through

  const navigateWaveform = (direction: "up" | "down") => {
    if (isScrolling) return
    // Up = go back in time (older), Down = go forward in time (newer)
    if (direction === "up" && !canGoOlder) return
    if (direction === "down" && !canGoNewer) return

    setScrollDirection(direction)
    setIsScrolling(true)

    // Change data immediately, animation handles the visual
    setWaveformOffset((prev) => (direction === "up" ? prev + 1 : prev - 1))

    // Reset after animation completes
    setTimeout(() => {
      setIsScrolling(false)
      setScrollDirection(null)
    }, 250)
  }

  const isAnimating = isScrolling

  // Calculate date range for current window
  const windowDateRange = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOffset = waveformOffset * WAVEFORM_WINDOW_SIZE
    const endOffset = startOffset + WAVEFORM_WINDOW_SIZE - 1

    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - endOffset)

    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() - startOffset)

    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    return `${formatDate(startDate)} – ${formatDate(endDate)}`
  }, [waveformOffset])

  // Generate waveform data (15 days window, navigable)
  const waveformData = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayKey = toDateKey(today)

    const days: Array<{
      date: Date
      dateKey: string
      count: number
      isToday: boolean
      dayOfWeek: number
      label: string
    }> = []

    const startOffset = waveformOffset * WAVEFORM_WINDOW_SIZE

    for (let i = 0; i < WAVEFORM_WINDOW_SIZE; i++) {
      const daysAgo = startOffset + i
      const date = new Date(today)
      date.setDate(date.getDate() - daysAgo)
      const dateKey = toDateKey(date)
      const dayOfWeek = date.getDay()

      // Generate label
      let label = ""
      if (daysAgo === 0) {
        label = "Today"
      } else if (daysAgo === 1) {
        label = "Yesterday"
      } else if (dayOfWeek === 1 || i === 0) {
        // Monday or first day of window - show date
        label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      }

      days.push({
        date,
        dateKey,
        count: entriesByDate[dateKey] || 0,
        isToday: dateKey === todayKey,
        dayOfWeek,
        label,
      })
    }

    return days
  }, [entriesByDate, waveformOffset])

  const canGoNewer = waveformOffset > 0
  const canGoOlder = waveformOffset < Math.floor(MAX_WAVEFORM_DAYS / WAVEFORM_WINDOW_SIZE) - 1

  // This week stats
  const thisWeekStats = useMemo(() => {
    const weekStart = getThisWeekStart()
    const weekEntries = allEntries.filter((entry) => {
      if (!entry.loggedAt) return false
      const entryDate = new Date(entry.loggedAt)
      return entryDate >= weekStart
    })

    const uniquePersonIds = new Set<number>()
    const uniqueProjectIds = new Set<number>()
    const projectMentionCounts: Record<number, number> = {}

    weekEntries.forEach((entry) => {
      entry.mentions.persons.forEach((p) => uniquePersonIds.add(p.id))
      entry.mentions.projects.forEach((p) => {
        uniqueProjectIds.add(p.id)
        projectMentionCounts[p.id] = (projectMentionCounts[p.id] || 0) + 1
      })
    })

    // Find most active project
    let mostActiveProject: Project | null = null
    let maxMentions = 0
    Object.entries(projectMentionCounts).forEach(([projectId, count]) => {
      if (count > maxMentions) {
        maxMentions = count
        mostActiveProject =
          projects.find((p) => p.id === Number(projectId)) || null
      }
    })

    return {
      entryCount: weekEntries.length,
      personCount: uniquePersonIds.size,
      projectCount: uniqueProjectIds.size,
      mostActiveProject,
    }
  }, [allEntries, projects])

  // Filter entries client-side (use accumulated entries)
  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      // Check date filter first
      if (selectedDate) {
        if (!entry.loggedAt) return false
        const entryDateKey = toDateKey(new Date(entry.loggedAt))
        if (entryDateKey !== selectedDate) return false
      }

      // If no project/person filters, pass through
      if (selectedProjectIds.length === 0 && selectedPersonIds.length === 0) {
        return true
      }

      // Check project filter (OR logic within projects)
      const matchesProject =
        selectedProjectIds.length === 0 ||
        entry.mentions.projects.some((p) => selectedProjectIds.includes(p.id))

      // Check person filter (OR logic within persons)
      const matchesPerson =
        selectedPersonIds.length === 0 ||
        entry.mentions.persons.some((p) => selectedPersonIds.includes(p.id))

      // AND logic between project and person filters
      return matchesProject && matchesPerson
    })
  }, [allEntries, selectedProjectIds, selectedPersonIds, selectedDate])

  // Get selected filter objects for chips
  const selectedProjects = projects.filter((p) =>
    selectedProjectIds.includes(p.id)
  )
  const selectedPersons = persons.filter((p) =>
    selectedPersonIds.includes(p.id)
  )

  // Check if there are more entries to load
  const hasMoreEntries = allEntries.length < pagination.total

  const loadMore = async () => {
    if (loadingMore || !hasMoreEntries) return

    setLoadingMore(true)
    const nextPage = lastPageRef.current + 1

    try {
      const response = await fetch(`/log.json?page=${nextPage}`, {
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAllEntries((prev) => [...prev, ...data.entries])
        lastPageRef.current = nextPage
      }
    } catch (error) {
      console.error("Failed to load more entries:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Group filtered entries by date
  const groupedEntries = filteredEntries.reduce(
    (groups, entry) => {
      const date = entry.loggedAt
        ? new Date(entry.loggedAt).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })
        : "Unknown date"

      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(entry)
      return groups
    },
    {} as Record<string, Entry[]>
  )

  return (
    <>
      <Head title="Log" />

      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8 lg:py-12">
            <div className="flex gap-8">
              {/* Main Content */}
              <div className="min-w-0 flex-1">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
                    Log
                  </h1>
                  <p className="mt-1 text-[14px] text-muted-foreground">
                    {hasFilters ? (
                      <>
                        {filteredEntries.length} of {allEntries.length}{" "}
                        {allEntries.length === 1 ? "entry" : "entries"}
                      </>
                    ) : (
                      <>
                        {pagination.total}{" "}
                        {pagination.total === 1 ? "entry" : "entries"}
                      </>
                    )}
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="mb-6 space-y-3">
                  {/* Filter Dropdowns */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Project filter dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-8 gap-1.5 text-[13px]",
                            selectedProjectIds.length > 0 &&
                              "border-primary/40 bg-primary/5 text-primary"
                          )}
                        >
                          Projects
                          {selectedProjectIds.length > 0 && (
                            <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-medium">
                              {selectedProjectIds.length}
                            </span>
                          )}
                          <ChevronDown className="ml-0.5 size-3.5 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-52">
                        <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Filter by project
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {projects.length === 0 ? (
                          <div className="px-2 py-3 text-center text-[13px] text-muted-foreground">
                            No projects yet
                          </div>
                        ) : (
                          projects.map((project) => {
                            const isSelected = selectedProjectIds.includes(
                              project.id
                            )
                            return (
                              <DropdownMenuItem
                                key={project.id}
                                onClick={(e) => {
                                  e.preventDefault()
                                  toggleProject(project.id)
                                }}
                                className="gap-2 text-[13px]"
                              >
                                <span
                                  className={cn(
                                    "flex size-4 items-center justify-center rounded border transition-colors",
                                    isSelected
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border"
                                  )}
                                >
                                  {isSelected && <Check className="size-3" />}
                                </span>
                                {project.color && (
                                  <span
                                    className="size-2 rounded-full"
                                    style={{ backgroundColor: project.color }}
                                  />
                                )}
                                <span className="flex-1">{project.name}</span>
                              </DropdownMenuItem>
                            )
                          })
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Person filter dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-8 gap-1.5 text-[13px]",
                            selectedPersonIds.length > 0 &&
                              "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-500"
                          )}
                        >
                          People
                          {selectedPersonIds.length > 0 && (
                            <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-medium">
                              {selectedPersonIds.length}
                            </span>
                          )}
                          <ChevronDown className="ml-0.5 size-3.5 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-52">
                        <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Filter by person
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {persons.length === 0 ? (
                          <div className="px-2 py-3 text-center text-[13px] text-muted-foreground">
                            No people yet
                          </div>
                        ) : (
                          persons.map((person) => {
                            const isSelected = selectedPersonIds.includes(
                              person.id
                            )
                            return (
                              <DropdownMenuItem
                                key={person.id}
                                onClick={(e) => {
                                  e.preventDefault()
                                  togglePerson(person.id)
                                }}
                                className="gap-2 text-[13px]"
                              >
                                <span
                                  className={cn(
                                    "flex size-4 items-center justify-center rounded border transition-colors",
                                    isSelected
                                      ? "border-amber-500 bg-amber-500 text-white"
                                      : "border-border"
                                  )}
                                >
                                  {isSelected && <Check className="size-3" />}
                                </span>
                                <span className="flex-1">{person.name}</span>
                              </DropdownMenuItem>
                            )
                          })
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Clear all button */}
                    {hasFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3.5" />
                        Clear all
                      </Button>
                    )}
                  </div>

                  {/* Active Filter Chips */}
                  {hasFilters && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Date chip */}
                      {selectedDate && (
                        <button
                          onClick={removeDateFilter}
                          className="group inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[12px] text-emerald-700 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/10 dark:text-emerald-500"
                        >
                          <CalendarDays className="size-3" />
                          {formatDateLabel(new Date(selectedDate))}
                          <X className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
                        </button>
                      )}

                      {/* Project chips */}
                      {selectedProjects.map((project) => (
                        <button
                          key={`project-${project.id}`}
                          onClick={() => removeProjectFilter(project.id)}
                          className="group inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[12px] text-primary transition-colors hover:border-primary/30 hover:bg-primary/10"
                        >
                          {project.color && (
                            <span
                              className="size-1.5 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                          )}
                          {project.name}
                          <X className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
                        </button>
                      ))}

                      {/* Person chips */}
                      {selectedPersons.map((person) => (
                        <button
                          key={`person-${person.id}`}
                          onClick={() => removePersonFilter(person.id)}
                          className="group inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-1 text-[12px] text-amber-700 transition-colors hover:border-amber-500/30 hover:bg-amber-500/10 dark:text-amber-500"
                        >
                          {person.name}
                          <X className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Entries */}
                {filteredEntries.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-[15px] text-muted-foreground">
                      {hasFilters
                        ? "No entries match your filters"
                        : "No entries yet"}
                    </p>
                    {hasFilters && (
                      <Button
                        variant="link"
                        onClick={clearFilters}
                        className="mt-2 text-[13px]"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(groupedEntries).map(
                      ([date, dateEntries]) => (
                        <section key={date}>
                          {/* Date header */}
                          <h2 className="mb-4 text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
                            {date}
                          </h2>

                          {/* Entries for this date */}
                          <div className="space-y-4">
                            {dateEntries.map((entry) => (
                              <article
                                key={entry.id}
                                className="group relative rounded-lg border border-border/50 bg-background p-4 transition-colors hover:border-border"
                              >
                                {/* Time and mentions */}
                                <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px]">
                                  {entry.loggedAt && (
                                    <time className="tabular-nums text-muted-foreground">
                                      {new Date(
                                        entry.loggedAt
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      })}
                                    </time>
                                  )}

                                  {/* Project mentions */}
                                  {entry.mentions.projects.map((project) => (
                                    <button
                                      key={project.id}
                                      onClick={() => toggleProject(project.id)}
                                      className={cn(
                                        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors",
                                        "bg-primary/5 text-primary hover:bg-primary/10",
                                        selectedProjectIds.includes(
                                          project.id
                                        ) && "ring-1 ring-primary/30"
                                      )}
                                    >
                                      {project.color && (
                                        <span
                                          className="size-1.5 rounded-full"
                                          style={{
                                            backgroundColor: project.color,
                                          }}
                                        />
                                      )}
                                      {project.name}
                                    </button>
                                  ))}

                                  {/* Person mentions */}
                                  {entry.mentions.persons.map((person) => (
                                    <button
                                      key={person.id}
                                      onClick={() => togglePerson(person.id)}
                                      className={cn(
                                        "inline-flex items-center rounded-md px-1.5 py-0.5 transition-colors",
                                        "bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-500",
                                        selectedPersonIds.includes(person.id) &&
                                          "ring-1 ring-amber-500/30"
                                      )}
                                    >
                                      {person.name}
                                    </button>
                                  ))}

                                  {/* Tag */}
                                  {entry.tag && (
                                    <span className="text-muted-foreground">
                                      #{entry.tag}
                                    </span>
                                  )}
                                </div>

                                {/* Content */}
                                <TiptapContent
                                  content={entry.body}
                                  className="text-[14px] leading-relaxed text-foreground"
                                />
                              </article>
                            ))}
                          </div>
                        </section>
                      )
                    )}

                    {/* Load more */}
                    {hasMoreEntries && (
                      <div className="pt-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadMore}
                          disabled={loadingMore}
                          className="text-[13px]"
                        >
                          {loadingMore ? "Loading..." : "Load more"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <aside className="hidden w-64 shrink-0 lg:block">
                <div className="sticky top-24 space-y-6">
                  {/* Activity Waveform */}
                  <div className="rounded-lg border border-border/50 bg-background p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Activity
                      </h3>
                      <div className="flex items-center gap-1.5">
                        {/* Date range */}
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {windowDateRange}
                        </span>

                        {/* Vertical navigation */}
                        <div className="flex flex-col">
                          <button
                            onClick={() => navigateWaveform("up")}
                            disabled={!canGoOlder || isAnimating}
                            className={cn(
                              "flex size-4 items-center justify-center rounded-sm transition-colors",
                              canGoOlder && !isAnimating
                                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                                : "cursor-not-allowed text-muted-foreground/30"
                            )}
                            title="Older"
                          >
                            <ChevronUp className="size-3" />
                          </button>
                          <button
                            onClick={() => navigateWaveform("down")}
                            disabled={!canGoNewer || isAnimating}
                            className={cn(
                              "flex size-4 items-center justify-center rounded-sm transition-colors",
                              canGoNewer && !isAnimating
                                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                                : "cursor-not-allowed text-muted-foreground/30"
                            )}
                            title="Newer"
                          >
                            <ChevronDown className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Waveform visualization with scroll animation */}
                    <div className="relative overflow-hidden">
                      <div
                        className="space-y-px"
                        style={{
                          animation: isScrolling
                            ? scrollDirection === "up"
                              ? "scrollInFromBottom 250ms ease-out"
                              : "scrollInFromTop 250ms ease-out"
                            : "none",
                        }}
                      >
                        {/* Inline keyframes for scroll animation */}
                        <style>{`
                          @keyframes scrollInFromBottom {
                            0% { transform: translateY(30px); opacity: 0; }
                            100% { transform: translateY(0); opacity: 1; }
                          }
                          @keyframes scrollInFromTop {
                            0% { transform: translateY(-30px); opacity: 0; }
                            100% { transform: translateY(0); opacity: 1; }
                          }
                        `}</style>
                        {waveformData.map((day) => {
                          const barWidth =
                            day.count > 0
                              ? Math.max(
                                  8,
                                  (day.count / maxEntriesPerDay) * 100
                                )
                              : 0
                          const isSelected = selectedDate === day.dateKey

                          return (
                            <button
                              key={day.dateKey}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedDate(null)
                                } else {
                                  setSelectedDate(day.dateKey)
                                }
                              }}
                              title={`${formatDateLabel(day.date)}: ${day.count} ${day.count === 1 ? "entry" : "entries"}`}
                              className={cn(
                                "group flex h-5 w-full items-center gap-2 rounded-sm px-1 transition-colors",
                                isSelected
                                  ? "bg-primary/10"
                                  : "hover:bg-muted/50"
                              )}
                            >
                              {/* Date label */}
                              <span
                                className={cn(
                                  "w-16 shrink-0 text-left text-[10px] tabular-nums",
                                  day.isToday
                                    ? "font-medium text-foreground"
                                    : day.label
                                      ? "text-muted-foreground"
                                      : "text-transparent"
                                )}
                              >
                                {day.label || "—"}
                              </span>

                              {/* Bar container */}
                              <div className="relative flex h-3 flex-1 items-center">
                                {/* Bar */}
                                {day.count > 0 ? (
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all",
                                      isSelected
                                        ? "bg-primary"
                                        : "bg-primary/40 group-hover:bg-primary/60",
                                      day.isToday && !isSelected && "bg-primary/60"
                                    )}
                                    style={{ width: `${barWidth}%` }}
                                  />
                                ) : (
                                  <div className="h-px w-2 rounded-full bg-border" />
                                )}
                              </div>

                              {/* Count */}
                              <span
                                className={cn(
                                  "w-4 shrink-0 text-right text-[10px] tabular-nums",
                                  day.count > 0
                                    ? isSelected
                                      ? "font-medium text-primary"
                                      : "text-muted-foreground"
                                    : "text-transparent"
                                )}
                              >
                                {day.count || "0"}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* This Week Stats */}
                  <div className="rounded-lg border border-border/50 bg-background p-4">
                    <h3 className="mb-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      This week
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] text-muted-foreground">
                          Entries
                        </span>
                        <span className="text-[15px] font-medium tabular-nums text-foreground">
                          {thisWeekStats.entryCount}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] text-muted-foreground">
                          People
                        </span>
                        <span className="text-[15px] font-medium tabular-nums text-foreground">
                          {thisWeekStats.personCount}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] text-muted-foreground">
                          Projects
                        </span>
                        <span className="text-[15px] font-medium tabular-nums text-foreground">
                          {thisWeekStats.projectCount}
                        </span>
                      </div>

                      {thisWeekStats.mostActiveProject && (
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-muted-foreground">
                            Top project
                          </span>
                          <div className="flex items-center gap-1.5">
                            {thisWeekStats.mostActiveProject.color && (
                              <span
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    thisWeekStats.mostActiveProject.color,
                                }}
                              />
                            )}
                            <span className="text-[13px] font-medium text-foreground">
                              {thisWeekStats.mostActiveProject.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
