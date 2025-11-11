import { AlertCircle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SummaryPayload {
  status?: string
  window?: { start: string; end: string }
  sections?: Array<{
    title: string
    project?: { name: string; color?: string }
    bullets?: string[]
  }>
  stats?: {
    current_streak?: number
    total_notes?: number
    most_productive_day?: string
  }
  projects?: Array<{
    id: string
    name: string
    color?: string
    entry_count?: number
  }>
  top_collaborators?: Array<{
    id: string
    name: string
    mention_count?: number
  }>
}

interface SummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  summaryPayload: SummaryPayload | null
  errorMessage: string | null
  windowStart: string
  windowEnd: string
  scheduleName: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatWindow(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const endStr = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return `${startStr} - ${endStr}`
}

export function SummaryDialog({
  open,
  onOpenChange,
  summaryPayload,
  errorMessage,
  windowStart,
  windowEnd,
  scheduleName,
}: SummaryDialogProps) {
  if (errorMessage && !summaryPayload) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Summary Error</DialogTitle>
            <DialogDescription>An error occurred while generating this summary.</DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!summaryPayload) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Summary</DialogTitle>
            <DialogDescription>No summary content available.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const sections = summaryPayload.sections || []
  const stats = summaryPayload.stats
  const projects = summaryPayload.projects || []
  const collaborators = summaryPayload.top_collaborators || []
  const window = summaryPayload.window || { start: windowStart, end: windowEnd }

  // Group sections by project
  const sectionsByProject: Record<string, typeof sections> = {}
  sections.forEach((section) => {
    const projectName = section.project?.name || "General"
    if (!sectionsByProject[projectName]) {
      sectionsByProject[projectName] = []
    }
    sectionsByProject[projectName].push(section)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Summary: {scheduleName}</DialogTitle>
          <DialogDescription>
            Covering {formatWindow(window.start, window.end)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                {stats.current_streak !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground">Current Streak</p>
                    <p className="text-lg font-semibold">{stats.current_streak} days</p>
                  </div>
                )}
                {stats.total_notes !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground">Total Notes</p>
                    <p className="text-lg font-semibold">{stats.total_notes}</p>
                  </div>
                )}
                {stats.most_productive_day && (
                  <div>
                    <p className="text-xs text-muted-foreground">Most Productive Day</p>
                    <p className="text-lg font-semibold">{stats.most_productive_day}</p>
                  </div>
                )}
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Projects</h3>
                <div className="flex flex-wrap gap-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border"
                      style={{
                        borderColor: project.color ? `${project.color}40` : undefined,
                        backgroundColor: project.color ? `${project.color}10` : undefined,
                      }}
                    >
                      {project.color && (
                        <div
                          className="size-2 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                      )}
                      <span className="text-sm font-medium">{project.name}</span>
                      {project.entry_count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({project.entry_count})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sections by Project */}
            {Object.entries(sectionsByProject).map(([projectName, projectSections]) => {
              const firstSection = projectSections[0]
              const projectColor = firstSection?.project?.color

              return (
                <div key={projectName} className="space-y-4">
                  {projectName !== "General" && (
                    <div
                      className="flex items-center gap-2 pb-2 border-b-2"
                      style={{ borderColor: projectColor || undefined }}
                    >
                      <h3
                        className="text-base font-semibold"
                        style={{ color: projectColor || undefined }}
                      >
                        {projectName}
                      </h3>
                    </div>
                  )}

                  {projectSections.map((section, idx) => (
                    <div key={idx} className="p-4 rounded-lg border bg-card">
                      <h4 className="text-sm font-semibold mb-3">{section.title}</h4>
                      {section.bullets && section.bullets.length > 0 ? (
                        <ul className="space-y-2 list-disc list-inside">
                          {section.bullets.map((bullet, bulletIdx) => (
                            <li key={bulletIdx} className="text-sm text-muted-foreground">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No items</p>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}

            {/* Collaborators */}
            {collaborators.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Top Collaborators
                </h3>
                <div className="flex flex-wrap gap-2">
                  {collaborators.map((collab) => (
                    <div
                      key={collab.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card"
                    >
                      <span className="text-sm font-medium">{collab.name}</span>
                      {collab.mention_count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({collab.mention_count} mentions)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {sections.length === 0 && projects.length === 0 && collaborators.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No summary content available.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

