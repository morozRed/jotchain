import { Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export interface DeliveryItemProps {
  id: string
  status: string
  deliveredAt: string | null
  occurrenceAt: string
  windowStart: string
  windowEnd: string
  scheduleName: string
  summaryPayload: Record<string, unknown> | null
  errorMessage: string | null
  onViewSummary: () => void
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

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "delivered":
      return "default"
    case "failed":
      return "destructive"
    case "skipped":
      return "secondary"
    case "pending":
    case "generating":
    case "delivering":
      return "outline"
    default:
      return "outline"
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "delivered":
      return "Delivered"
    case "failed":
      return "Failed"
    case "skipped":
      return "Skipped"
    case "pending":
      return "Pending"
    case "generating":
      return "Generating"
    case "delivering":
      return "Delivering"
    default:
      return status
  }
}

export function DeliveryItem({
  status,
  deliveredAt,
  occurrenceAt,
  windowStart,
  windowEnd,
  scheduleName,
  summaryPayload,
  errorMessage,
  onViewSummary,
}: DeliveryItemProps) {
  const hasSummary = summaryPayload !== null && Object.keys(summaryPayload).length > 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-foreground truncate">{scheduleName}</h3>
              <Badge variant={getStatusVariant(status)} className="shrink-0 text-xs">
                {getStatusLabel(status)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatWindow(windowStart, windowEnd)}</span>
              {deliveredAt && (
                <>
                  <span>•</span>
                  <span>Delivered {formatDate(deliveredAt)}</span>
                </>
              )}
              {!deliveredAt && (
                <>
                  <span>•</span>
                  <span>Occurrence: {formatDate(occurrenceAt)}</span>
                </>
              )}
            </div>
            {errorMessage && (
              <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive">{errorMessage}</p>
              </div>
            )}
          </div>
          {hasSummary && (
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={onViewSummary}>
                <Eye className="size-4 mr-2" />
                View Summary
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

