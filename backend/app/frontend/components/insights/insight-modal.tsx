import { router } from "@inertiajs/react"
import { Copy, Edit, Save, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import type { InsightRequest } from "./types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { insightPath, insightsPath } from "@/routes"

interface InsightModalProps {
  insight: InsightRequest
  open: boolean
  onClose: () => void
}

export function InsightModal({ insight, open, onClose }: InsightModalProps) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(insight.content || "")
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    setContent(insight.content || "")
    setEditing(false)
    setIsDirty(false)
  }, [insight])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    // Could add toast notification here
    alert("Copied to clipboard!")
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(insightPath(insight.id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || "",
        },
        body: JSON.stringify({
          insight_request: {
            content: content,
          },
        }),
      })

      if (response.ok) {
        setIsDirty(false)
        setEditing(false)
        alert("Saved successfully!")
      }
    } catch (error) {
      console.error("Failed to save insight", error)
      alert("Failed to save insight")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    router.delete(insightPath(insight.id), {
      onSuccess: () => {
        setDeleteOpen(false)
        onClose()
      },
    })
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    setIsDirty(value !== insight.content)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-6xl w-[95vw] sm:w-[90vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{insight.name}</DialogTitle>
          <DialogDescription>
            {new Date(insight.dateRangeStart).toLocaleDateString()} -{" "}
            {new Date(insight.dateRangeEnd).toLocaleDateString()}
            {insight.resultPayload?.stats && (
              <span className="ml-2">• {insight.resultPayload.stats.total_entries} notes analyzed</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {insight.status === "generating" && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-center text-muted-foreground">
                Generating insights... This may take 10-30 seconds.
              </p>
            </div>
          )}

          {insight.status === "failed" && (
            <div className="p-4 border rounded-lg bg-destructive/10 border-destructive">
              <p className="text-sm text-destructive">
                Error: {insight.errorMessage || "Failed to generate insight"}
              </p>
            </div>
          )}

          {insight.status === "completed" && (
            <div className="space-y-4">
              {editing ? (
                <Textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />
              ) : (
                <div className="p-4 border rounded-lg bg-muted/20">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{content}</pre>
                </div>
              )}

              {insight.resultPayload?.stats?.project_breakdown &&
                Object.keys(insight.resultPayload.stats.project_breakdown).length > 0 && (
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-semibold text-sm mb-2">Project Breakdown</h4>
                    <ul className="text-sm space-y-1">
                      {Object.entries(insight.resultPayload.stats.project_breakdown).map(
                        ([project, count]) => (
                          <li key={project} className="text-muted-foreground">
                            • {project}: {count} notes
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!insight.content}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>

            {!editing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                disabled={!insight.content}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={!isDirty || saving}
              >
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete insight?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the insight "{insight.name}".
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
