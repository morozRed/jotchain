import { Head, router, useForm, usePage } from "@inertiajs/react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react"
import { type ReactNode, useState } from "react"

import InputError from "@/components/input-error"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import AppLayout from "@/layouts/app-layout"
import { dashboardPath, entryPath } from "@/routes"
import type { SharedData } from "@/types"

interface DashboardEntry {
  id: number
  body: string
  tag?: string | null
  loggedAt?: string | null
  loggedAtLabel?: string | null
  createdAtAgo: string
  createdAt: string
}

interface EntryStats {
  count: number
  lastLoggedAt?: string | null
  currentStreak?: number
}

type PageProps = SharedData & {
  entries: DashboardEntry[]
  entryStats: EntryStats
  selectedDate: string
  previousDate: string
  nextDate: string
  isToday: boolean
  selectedDateFormatted: string
}

interface EntryFormState {
  entry: {
    body: string
    tag: string
  }
}

const breadcrumbs = [
  {
    title: "Dashboard",
    href: dashboardPath(),
  },
]

export default function Dashboard() {
  const { props } = usePage<PageProps>()
  const {
    entries,
    entryStats,
    selectedDate,
    previousDate,
    nextDate,
    isToday,
    selectedDateFormatted,
  } = props

  const entryForm = useForm<EntryFormState>({
    entry: {
      body: "",
      tag: "",
    },
  })

  const handleEntryChange = (field: keyof EntryFormState["entry"], value: string) => {
    entryForm.setData("entry", {
      ...entryForm.data.entry,
      [field]: value,
    })
  }

  const submitEntryRequest = () => {
    if (entryForm.processing) {
      return
    }

    entryForm.post("/entries", {
      preserveScroll: true,
      onSuccess: () => {
        entryForm.setData("entry", { body: "", tag: "" })
        entryForm.clearErrors()
      },
    })
  }

  const submitEntry: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    submitEntryRequest()
  }

  const handleEntryShortcut: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      submitEntryRequest()
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="flex h-full flex-1 flex-col gap-6 px-4 pb-10 pt-6 md:px-6">
        <header className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
                Keep track of what you're building
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
                Jot down your daily wins, challenges, and ideas. Stay organized and never forget what you worked on.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-primary/30 px-4 py-3 text-sm text-primary">
              <Sparkles className="size-4" />
              <span>
                {entryStats.count ? (
                  <>
                    {pluralize(entryStats.count, "entry")} logged
                    {entryStats.currentStreak && entryStats.currentStreak > 0 ? (
                      <>
                        {" • "}
                        {pluralize(entryStats.currentStreak, "day")} streak
                      </>
                    ) : null}
                  </>
                ) : (
                  "First note creates your personal timeline"
                )}
              </span>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
          <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col">
            <CardHeader className="pb-5">
              <CardTitle className="text-lg font-semibold">
                What did you work on today?
              </CardTitle>
              <CardDescription className="text-sm">
                Capture wins, blockers, and progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <form onSubmit={submitEntry} className="flex flex-1 flex-col gap-5">
                <div className="relative flex flex-1 flex-col space-y-3">
                  <div className="relative flex flex-1">
                    <Textarea
                      id="entry-body"
                      value={entryForm.data.entry.body}
                      onChange={(event) =>
                        handleEntryChange("body", event.target.value)
                      }
                      onKeyDown={handleEntryShortcut}
                      placeholder="Shipped auth refactor, fixed API timeout issues, reviewed @backend PRs..."
                      aria-invalid={Boolean(entryForm.errors.body)}
                      aria-label="Entry content"
                      autoFocus
                      className="min-h-0 flex-1 resize-none border-border/30 bg-background px-4 py-3 pb-16 text-[15px] leading-relaxed shadow-sm transition-all duration-200 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                    <Button
                      type="submit"
                      className="absolute bottom-3 right-3 shadow-md transition-all duration-200"
                      disabled={entryForm.processing}
                      size="sm"
                    >
                      {entryForm.processing && (
                        <Send className="mr-2 size-4 animate-spin" />
                      )}
                      Save entry
                    </Button>
                  </div>
                  <InputError message={entryForm.errors.body} />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="entry-tag" className="text-xs font-normal text-muted-foreground">
                      Tag (optional)
                    </Label>
                    <Input
                      id="entry-tag"
                      value={entryForm.data.entry.tag}
                      onChange={(event) =>
                        handleEntryChange("tag", event.target.value)
                      }
                      placeholder="Backend, Platform, Hiring..."
                      aria-invalid={Boolean(entryForm.errors.tag)}
                      className="border-border/30 bg-background shadow-sm transition-all duration-200 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                    <InputError message={entryForm.errors.tag} />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t border-border/30 bg-muted/20 text-xs text-muted-foreground">
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="leading-relaxed">
                  💡 Aim for 2-4 key points • Include impact and blockers
                </span>
                {entryStats.lastLoggedAt && (
                  <span className="font-medium text-foreground/80">
                    Last entry {formatTimeAgo(entryStats.lastLoggedAt)}
                  </span>
                )}
              </div>
            </CardFooter>
          </Card>

          <EntriesCard
            entries={entries}
            selectedDateFormatted={selectedDateFormatted}
            previousDate={previousDate}
            nextDate={nextDate}
            isToday={isToday}
          />
        </div>
      </div>
    </AppLayout>
  )
}

function EntriesCard({
  entries,
  selectedDateFormatted,
  previousDate,
  nextDate,
  isToday,
}: {
  entries: DashboardEntry[]
  selectedDateFormatted: string
  previousDate: string
  nextDate: string
  isToday: boolean
}) {
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null)

  const navigateToDate = (date: string) => {
    router.visit(dashboardPath({ date }), {
      preserveUrl: true,
      preserveScroll: true,
      only: ["entries", "selectedDate", "previousDate", "nextDate", "isToday", "selectedDateFormatted"],
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
              className="flex size-8 items-center justify-center rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Next day</span>
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {entries.length === 0 && (
          <EmptyState
            icon={<Sparkles className="size-5 text-primary" />}
            title="No entries for this day"
            subtitle="Add a note above to capture what you worked on."
          />
        )}

        {entries.map((entry) => (
          <article
            key={entry.id}
            className="group relative rounded-lg border border-border/30 bg-background/40 p-4 shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-background/60 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex flex-wrap justify-between align-center gap-3 text-xs text-muted-foreground">
                  {entry.loggedAtLabel && (
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <CalendarDays className="size-4 text-primary" />
                      {entry.loggedAtLabel}
                    </span>
                  )}
                  <span aria-hidden className="hidden text-border md:inline">
                    ·
                  </span>
                  <span>{entry.createdAtAgo} ago</span>
                  {entry.tag && (
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-xs dark:bg-primary/20 dark:border-primary/40"
                    >
                      #{entry.tag}
                    </Badge>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {entry.body}
                </p>
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
        ))}
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

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-primary/40 bg-background/40 p-4 text-left">
      <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

function pluralize(count: number, noun: string, suffix = "s") {
  return `${count} ${noun}${Math.abs(count) === 1 ? "" : suffix}`
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60)
    return `${mins}m ago`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  }
  return date.toLocaleDateString()
}
