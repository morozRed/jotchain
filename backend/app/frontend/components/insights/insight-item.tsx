import { Link, router } from "@inertiajs/react"
import { Eye, MoreVertical, Trash2 } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { insightPath } from "@/routes"

export interface InsightItemProps {
  id: string
  name: string
  queryType: string
  status: string
  dateRangeStart: string
  dateRangeEnd: string
  createdAt: string
  content?: string
  errorMessage?: string
  resultPayload?: {
    stats?: {
      project_breakdown?: Record<string, number>
    }
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const endStr = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return `${startStr} – ${endStr}`
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default"
    case "failed":
      return "destructive"
    case "generating":
      return "outline"
    case "pending":
      return "secondary"
    default:
      return "outline"
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "Completed"
    case "failed":
      return "Failed"
    case "generating":
      return "Generating..."
    case "pending":
      return "Pending"
    default:
      return status
  }
}

export function InsightItem({
  id,
  name,
  status,
  dateRangeStart,
  dateRangeEnd,
  createdAt,
  content,
  errorMessage,
}: InsightItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isCompleted = status === "completed"

  const handleDelete = () => {
    router.delete(insightPath(id), {
      onSuccess: () => {
        setDeleteOpen(false)
      },
    })
  }

  return (
    <>
      <div className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-foreground truncate">{name}</h3>
              <Badge variant={getStatusVariant(status)} className="shrink-0 text-xs">
                {getStatusLabel(status)}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formatDateRange(dateRangeStart, dateRangeEnd)}</span>
              <span>·</span>
              <span>{formatDate(createdAt)}</span>
            </div>
            {errorMessage && (
              <p className="text-xs text-destructive mt-1">{errorMessage}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isCompleted && content && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={insightPath(id)}>
                  <Eye className="size-4 mr-1" />
                  View
                </Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDeleteOpen(true)} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete insight?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the insight "{name}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
