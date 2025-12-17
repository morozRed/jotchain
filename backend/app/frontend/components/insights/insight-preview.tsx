import { FileText, FolderOpen, Loader2, Users } from "lucide-react"
import { useEffect, useState } from "react"

import type { PreviewData } from "./types"

interface InsightPreviewProps {
  dateRangeStart?: Date
  dateRangeEnd?: Date
  projectIds: string[]
  personIds: string[]
}

export function InsightPreview({
  dateRangeStart,
  dateRangeEnd,
  projectIds,
  personIds,
}: InsightPreviewProps) {
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!dateRangeStart || !dateRangeEnd) {
      setPreview(null)
      return
    }

    const fetchPreview = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          date_range_start: dateRangeStart.toISOString(),
          date_range_end: dateRangeEnd.toISOString(),
        })

        projectIds.forEach((id) => {
          params.append("project_ids[]", id)
        })

        const filteredPersonIds = personIds.includes("all") ? [] : personIds
        filteredPersonIds.forEach((id) => {
          params.append("person_ids[]", id)
        })

        const response = await fetch(`/api/insights/preview?${params}`)
        const data = await response.json()
        setPreview(data)
      } catch (error) {
        console.error("Failed to fetch preview", error)
      } finally {
        setLoading(false)
      }
    }

    const timeout = setTimeout(fetchPreview, 500) // Debounce
    return () => clearTimeout(timeout)
  }, [dateRangeStart, dateRangeEnd, projectIds, personIds])

  if (!dateRangeStart || !dateRangeEnd) {
    return null
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border-subtle bg-subtle/30 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Analyzing your notes...</span>
        </div>
      </div>
    )
  }

  if (!preview) {
    return null
  }

  if (preview.totalNotes === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-subtle p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            No entries found for the selected filters. Try adjusting your date range or project selection.
          </p>
        </div>
      </div>
    )
  }

  // Build the summary items
  const projectNames = Object.keys(preview.breakdown || {})
  const collaboratorNames = (preview.topCollaborators || []).slice(0, 3).map((c) => c.name)

  return (
    <div className="rounded-lg border border-border-subtle bg-subtle/30 p-4">
      <p className="text-sm text-muted-foreground mb-3">This draft will be based on:</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{preview.totalNotes}</span>
          <span className="text-muted-foreground">{preview.totalNotes === 1 ? "note" : "notes"}</span>
        </div>

        {projectNames.length > 0 && (
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{projectNames.length}</span>
            <span className="text-muted-foreground">{projectNames.length === 1 ? "project" : "projects"}</span>
          </div>
        )}

        {collaboratorNames.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Mentions of</span>
            <span className="text-foreground">{collaboratorNames.join(", ")}</span>
            {(preview.topCollaborators?.length || 0) > 3 && (
              <span className="text-muted-foreground">+{(preview.topCollaborators?.length || 0) - 3} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
