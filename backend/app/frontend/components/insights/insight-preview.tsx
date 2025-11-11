import { FileText, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

import type { PreviewData } from "./types"
import { Card, CardContent } from "@/components/ui/card"

interface InsightPreviewProps {
  dateRangeStart?: Date
  dateRangeEnd?: Date
  projectIds: string[]
}

export function InsightPreview({
  dateRangeStart,
  dateRangeEnd,
  projectIds,
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
  }, [dateRangeStart, dateRangeEnd, projectIds])

  if (!dateRangeStart || !dateRangeEnd) {
    return null
  }

  if (loading) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Loader2 className="h-5 w-5 text-primary mt-0.5 animate-spin" />
            <div className="space-y-2 flex-1">
              <p className="font-medium">Analyzing notes from this selection...</p>
              <div className="text-sm">
                <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preview || preview.totalNotes === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-start gap-3 p-4">
          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
          <p className="text-sm text-muted-foreground">
            No entries found for the selected filters. Try adjusting your date range or project selection.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-primary/5 border-primary/20 pt-3 pb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="font-medium">Analyzing {preview.totalNotes} notes from this selection</p>

            {Object.keys(preview.breakdown).length > 0 && (
              <div className="text-sm">
                <p className="font-medium mb-1">Breakdown:</p>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  {Object.entries(preview.breakdown).map(([project, count]) => (
                    <li key={project}>
                      {project}: {count} notes
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {preview.topCollaborators.length > 0 && (
              <div className="text-sm">
                <p className="font-medium mb-1">Top collaborators:</p>
                <p className="text-muted-foreground">
                  {preview.topCollaborators.map((c) => `${c.name} (${c.count})`).join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
