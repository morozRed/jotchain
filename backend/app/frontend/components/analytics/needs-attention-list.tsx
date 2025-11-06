import { AlertCircle, Tag } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsNeedsAttention } from "@/types"

interface NeedsAttentionListProps {
  data: AnalyticsNeedsAttention
  onStaleProjectClick?: (projectId: number) => void
  onUntaggedClick?: () => void
}

export function NeedsAttentionList({ data, onStaleProjectClick, onUntaggedClick }: NeedsAttentionListProps) {
  const hasStaleProjects = data.staleProjects.length > 0
  const hasUntagged = data.untaggedShare > 0

  if (!hasStaleProjects && !hasUntagged) {
    return (
      <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader>
          <CardTitle>Needs Attention</CardTitle>
          <CardDescription>Projects and entries that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">Everything looks good!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle>Needs Attention</CardTitle>
        <CardDescription>Projects and entries that need your attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hasStaleProjects && (
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Stale Projects
              </h4>
              <div className="space-y-2">
                {data.staleProjects.map((project) => (
                  <button
                    key={project.projectId}
                    onClick={() => onStaleProjectClick?.(project.projectId)}
                    className="flex w-full items-center justify-between rounded-lg border border-border/30 bg-surface-card p-3 text-left transition-colors hover:bg-muted/30"
                  >
                    <span className="font-medium">{project.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {project.daysSinceLast} {project.daysSinceLast === 1 ? "day" : "days"} ago
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasUntagged && (
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Tag className="h-4 w-4 text-blue-500" />
                Untagged Entries
              </h4>
              <button
                onClick={onUntaggedClick}
                className="flex w-full items-center justify-between rounded-lg border border-border/30 bg-surface-card p-3 text-left transition-colors hover:bg-muted/30"
              >
                <span>Entries without project tags</span>
                <span className="text-sm text-muted-foreground">{(data.untaggedShare * 100).toFixed(1)}% of total</span>
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
