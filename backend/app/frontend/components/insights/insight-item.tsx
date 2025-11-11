import { router } from "@inertiajs/react"
import { Copy, Edit, Eye, MoreVertical, Save, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
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
import { Textarea } from "@/components/ui/textarea"
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
  return `${startStr} - ${endStr}`
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
  resultPayload,
}: InsightItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [currentContent, setCurrentContent] = useState(content || "")
  const [editedContent, setEditedContent] = useState(content || "")
  const [saving, setSaving] = useState(false)
  const isCompleted = status === "completed"

  useEffect(() => {
    setCurrentContent(content || "")
    setEditedContent(content || "")
  }, [content])

  const handleDelete = () => {
    router.delete(insightPath(id), {
      onSuccess: () => {
        setDeleteOpen(false)
      },
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(insightPath(id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || "",
        },
        body: JSON.stringify({
          insight_request: {
            content: editedContent,
          },
        }),
      })

      if (response.ok) {
        setEditing(false)
        setCurrentContent(editedContent)
        alert("Saved successfully!")
      }
    } catch (error) {
      console.error("Failed to save insight", error)
      alert("Failed to save insight")
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentContent)
    alert("Copied to clipboard!")
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-foreground truncate">{name}</h3>
                  <Badge variant={getStatusVariant(status)} className="shrink-0 text-xs">
                    {getStatusLabel(status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDateRange(dateRangeStart, dateRangeEnd)}</span>
                  <span>•</span>
                  <span>Created {formatDate(createdAt)}</span>
                </div>
                {errorMessage && (
                  <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                    <p className="text-xs text-destructive">{errorMessage}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isCompleted && currentContent && (
                  <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
                    <Eye className="size-4 mr-2" />
                    {expanded ? "Hide" : "View"}
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
                    <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>

          {isCompleted && currentContent && (
            <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-up data-[state=open]:slide-in-down duration-200">
              <CardContent className="pt-0 pb-4 px-4 border-t">
                <div className="space-y-4 mt-4">
                  {editing ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} disabled={saving || editedContent === currentContent}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(false)
                            setEditedContent(currentContent)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-muted/20">
                        <pre className="whitespace-pre-wrap font-sans text-sm">{currentContent}</pre>
                      </div>
                      {resultPayload?.stats?.project_breakdown &&
                        Object.keys(resultPayload.stats.project_breakdown).length > 0 && (
                          <div className="p-4 border rounded-lg bg-muted/20">
                            <h4 className="font-semibold text-sm mb-2">Project Breakdown</h4>
                            <ul className="text-sm space-y-1">
                              {Object.entries(resultPayload.stats.project_breakdown).map(
                                ([project, count]) => (
                                  <li key={project} className="text-muted-foreground">
                                    • {project}: {count} notes
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={handleCopy}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          )}
        </Collapsible>
      </Card>

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
