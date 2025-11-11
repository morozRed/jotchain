import { Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

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

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{scheduleName}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {formatWindow(windowStart, windowEnd)}
            </p>
          </div>
          <Badge variant={getStatusVariant(status)} className="shrink-0">
            {getStatusLabel(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Occurrence:</span>
            <span className="text-foreground font-medium">{formatDateTime(occurrenceAt)}</span>
          </div>
          {deliveredAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Delivered:</span>
              <span className="text-foreground font-medium">{formatDateTime(deliveredAt)}</span>
            </div>
          )}
          {errorMessage && (
            <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">{errorMessage}</p>
            </div>
          )}
        </div>
      </CardContent>
      {hasSummary && (
        <CardFooter className="pt-3 border-t">
          <Button variant="outline" size="sm" onClick={onViewSummary} className="w-full">
            <Eye className="size-4 mr-2" />
            View Summary
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

