import { Head, Link, router, usePage } from "@inertiajs/react"
import { ArrowLeft, Copy, Edit, Save, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"
import AppLayout from "@/layouts/app-layout"
import { insightPath, insightsPath } from "@/routes"
import type { BreadcrumbItem, SharedData } from "@/types"

interface InsightPayload {
  id: string
  name: string
  queryType: string
  customQuery?: string
  perspective?: string
  dateRangeStart: string
  dateRangeEnd: string
  projectIds: string[]
  personIds: string[]
  status: string
  resultPayload?: {
    stats?: {
      total_entries?: number
      date_range_days?: number
      current_streak?: number
      project_breakdown?: Record<string, number>
    }
  }
  content?: string
  resultModel?: string
  promptTokens?: number
  completionTokens?: number
  errorMessage?: string
  completedAt?: string
  createdAt: string
}

type PageProps = SharedData & {
  insight: InsightPayload
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

export default function InsightShow() {
  const { insight } = usePage<PageProps>().props

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [currentContent, setCurrentContent] = useState(insight.content || "")
  const [editedContent, setEditedContent] = useState(insight.content || "")
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const isCompleted = insight.status === "completed"

  useEffect(() => {
    setCurrentContent(insight.content || "")
    setEditedContent(insight.content || "")
  }, [insight.content])

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Insights", href: insightsPath() },
    { title: insight.name, href: insightPath(insight.id) },
  ]

  const handleDelete = () => {
    router.delete(insightPath(insight.id), {
      onSuccess: () => {
        setDeleteOpen(false)
      },
    })
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
            content: editedContent,
          },
        }),
      })

      if (response.ok) {
        setEditing(false)
        setCurrentContent(editedContent)
      }
    } catch (error) {
      console.error("Failed to save insight", error)
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={insight.name} />

      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {/* Back link */}
        <Link
          href={insightsPath()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Insights
        </Link>

        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground">
                {insight.name}
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{formatDateRange(insight.dateRangeStart, insight.dateRangeEnd)}</span>
                <span>·</span>
                <span>Generated {formatDate(insight.createdAt)}</span>
                {insight.status !== "completed" && (
                  <>
                    <span>·</span>
                    <Badge variant={getStatusVariant(insight.status)}>
                      {getStatusLabel(insight.status)}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        {isCompleted && currentContent ? (
          <section className="space-y-4">
            {editing ? (
              <div className="space-y-4">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[400px] font-sans text-base leading-relaxed"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving || editedContent === currentContent}>
                    <Save className="size-4 mr-1.5" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
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
              <div className="rounded-xl border border-border bg-surface p-6">
                <article className="prose prose-neutral max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-foreground bg-transparent p-0 m-0 border-none">
                    {currentContent}
                  </pre>
                </article>
              </div>
            )}

            {/* Actions */}
            {!editing && (
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={handleCopy}>
                    <Copy className="size-4 mr-1.5" />
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                    <Edit className="size-4 mr-1.5" />
                    Edit
                  </Button>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="size-4 mr-1.5" />
                  Delete
                </Button>
              </div>
            )}
          </section>
        ) : insight.status === "failed" ? (
          <section className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <p className="text-sm text-destructive">{insight.errorMessage || "Generation failed"}</p>
          </section>
        ) : (
          <section className="rounded-xl border border-border bg-surface p-6">
            <p className="text-center text-muted-foreground">
              {insight.status === "generating" ? "Generating insight..." : "Waiting to start..."}
            </p>
          </section>
        )}

        {/* Sources */}
        {insight.resultPayload?.stats?.project_breakdown &&
          Object.keys(insight.resultPayload.stats.project_breakdown).length > 0 && (
            <section className="space-y-3 border-t border-border-subtle pt-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Sources
              </h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(insight.resultPayload.stats.project_breakdown).map(
                  ([project, count]) => (
                    <span
                      key={project}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
                    >
                      <span className="font-medium text-foreground">#{project}</span>
                      <span>·</span>
                      <span>{count} {count === 1 ? "note" : "notes"}</span>
                    </span>
                  )
                )}
              </div>
            </section>
          )}
      </div>

      {/* Delete Dialog */}
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
    </AppLayout>
  )
}
