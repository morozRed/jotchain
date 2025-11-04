import { router } from "@inertiajs/react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
} from "lucide-react"
import { useState } from "react"

import { EmptyState } from "@/components/empty-state"
import { TiptapContent } from "@/components/tiptap-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { dashboardPath, entryPath } from "@/routes"

export interface DashboardEntry {
  id: number
  body: string
  bodyFormat: string
  tag?: string | null
  loggedAt?: string | null
  loggedAtLabel?: string | null
  createdAtAgo: string
  createdAt: string
}

interface DashboardEntriesCardProps {
  entries: DashboardEntry[]
  selectedDateFormatted: string
  previousDate: string
  nextDate: string
  isToday: boolean
}

export function DashboardEntriesCard({
  entries,
  selectedDateFormatted,
  previousDate,
  nextDate,
  isToday,
}: DashboardEntriesCardProps) {
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null)

  const navigateToDate = (date: string) => {
    router.visit(dashboardPath({ date }), {
      preserveUrl: true,
      preserveScroll: true,
      only: [
        "entries",
        "selectedDate",
        "previousDate",
        "nextDate",
        "isToday",
        "selectedDateFormatted",
      ],
    })
  }

  const handleDeleteEntry = () => {
    if (entryToDelete) {
      router.delete(entryPath(entryToDelete), {
        preserveUrl: true,
        preserveScroll: true,
        onSuccess: () => {
          setEntryToDelete(null)
        },
      })
    }
  }

  return (
    <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:flex lg:h-[580px] lg:flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="size-5 text-primary" />
              {selectedDateFormatted}
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Your daily progress and wins
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToDate(previousDate)}
              className="flex size-8 items-center justify-center rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground"
              type="button"
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Previous day</span>
            </button>
            <button
              onClick={() => navigateToDate(nextDate)}
              disabled={isToday}
              className="flex size-8 items-center justify-center rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50"
              type="button"
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Next day</span>
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {entries.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="size-5 text-primary" />}
            title="No entries for this day"
            description="Add a note above to capture what you worked on."
          />
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="group relative rounded-lg border border-border/30 bg-background/40 p-4 shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-background/60 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    {entry.loggedAtLabel ? (
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        <CalendarDays className="size-4 text-primary" />
                        {entry.loggedAtLabel}
                      </span>
                    ) : null}
                    <span aria-hidden className="hidden text-border md:inline">
                      ·
                    </span>
                    <span>{entry.createdAtAgo} ago</span>
                    {entry.tag ? (
                      <Badge
                        variant="outline"
                        className="border-primary/30 bg-primary/10 text-xs dark:border-primary/40 dark:bg-primary/20"
                      >
                        #{entry.tag}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-3">
                    <TiptapContent
                      content={entry.body}
                      className="text-sm leading-relaxed text-foreground"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 p-0 text-muted-foreground opacity-0 transition-all duration-200 hover:text-destructive group-hover:opacity-70 hover:opacity-100"
                  onClick={() => setEntryToDelete(entry.id)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete entry</span>
                </Button>
              </div>
            </article>
          ))
        )}
      </CardContent>

      <Dialog open={entryToDelete !== null} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete entry?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your entry.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEntry}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
