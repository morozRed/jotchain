import { Head, useForm, usePage } from "@inertiajs/react"
import { Command, CornerDownLeft, Flame, Lightbulb, Send, Sparkles } from "lucide-react"

import { DashboardEntriesCard, type DashboardEntry } from "@/components/dashboard/entries-card"
import InputError from "@/components/input-error"
import { TiptapEditor } from "@/components/tiptap-editor"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import AppLayout from "@/layouts/app-layout"
import { getEmptyTiptapDocument } from "@/lib/tiptap-utils"
import { dashboardPath } from "@/routes"
import type { SharedData } from "@/types"

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
  }
}

const breadcrumbs = [
  {
    title: "Dashboard",
    href: dashboardPath(),
  },
]

export default function Dashboard() {
  const { props: pageProps } = usePage<PageProps>()
  const {
    entries,
    entryStats,
    previousDate,
    nextDate,
    isToday,
    selectedDateFormatted,
  } = pageProps

  const entryForm = useForm<EntryFormState>({
    entry: {
      body: getEmptyTiptapDocument(),
    },
  })

  const handleEntryBodyChange = (value: string) => {
    entryForm.setData("entry", {
      ...entryForm.data.entry,
      body: value,
    })
  }

  const submitEntryRequest = () => {
    if (entryForm.processing) {
      return
    }

    entryForm.post("/entries", {
      data: {
        entry: {
          ...entryForm.data.entry,
          body_format: "tiptap",
        },
      },
      preserveScroll: true,
      onSuccess: () => {
        entryForm.setData("entry", { body: getEmptyTiptapDocument() })
        entryForm.clearErrors()
      },
    })
  }

  const submitEntry: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    submitEntryRequest()
  }

  const handleEntryShortcut: React.KeyboardEventHandler = (event) => {
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
                Keep track of what you&apos;re building
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
                Jot down your daily wins, challenges, and ideas. Stay organized and never forget what you worked on.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent px-5 py-4 text-sm shadow-sm">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-12 h-36 w-36 rounded-full bg-primary/30 opacity-60 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-primary/20 opacity-50 blur-3xl"
              />
              <div className="relative flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-full border border-primary/40 bg-background/80 text-primary shadow-sm">
                  <Sparkles className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                    Daily momentum
                  </span>
                  {entryStats.count ? (
                    <>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-primary">
                        <span className="text-base font-semibold text-foreground">
                          {pluralize(entryStats.count, "entry", "entries")}
                        </span>
                        <span className="text-sm text-primary/80">logged</span>
                        {entryStats.currentStreak && entryStats.currentStreak > 0 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            <Flame aria-hidden className="size-3.5" />
                            {pluralize(entryStats.currentStreak, "day")}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs text-primary/70">Keep stacking wins.</span>
                    </>
                  ) : (
                    <span className="text-sm text-primary">
                      First note creates your personal timeline — start today.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
          <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col">
            <CardHeader className="pb-5">
              <CardTitle className="text-lg font-semibold">
                What did you work on today?
              </CardTitle>
              <CardDescription className="text-sm">
                Capture wins, blockers, and progress — mention people or projects, just start typing with @.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <form onSubmit={submitEntry} className="flex flex-1 flex-col gap-5">
                <div className="relative flex flex-1 flex-col space-y-3">
                  <div className="relative flex flex-1">
                    <TiptapEditor
                      value={entryForm.data.entry.body}
                      onChange={handleEntryBodyChange}
                      onKeyDown={handleEntryShortcut}
                      placeholder="Shipped auth refactor, fixed API timeout issues, reviewed @backend PRs..."
                      autoFocus
                      className="min-h-0 flex-1 pb-12 text-[15px] leading-relaxed"
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
                      <span>Save</span>
                      <div className="flex items-center gap-0.5 text-xs opacity-60">
                        <Command className="size-3" />
                        <CornerDownLeft className="size-3" />
                      </div>
                    </Button>
                  </div>
                  <InputError message={entryForm.errors.body as string | undefined} />
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t border-border/30 bg-muted/20 text-xs text-muted-foreground">
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-1.5 leading-relaxed">
                  <Lightbulb className="size-3.5" aria-hidden />
                  Aim for 2-4 key points • Include impact and blockers
                </span>
                {entryStats.lastLoggedAt && (
                  <span className="font-medium text-foreground/80">
                    Last entry {formatTimeAgo(entryStats.lastLoggedAt)}
                  </span>
                )}
              </div>
            </CardFooter>
          </Card>

          <DashboardEntriesCard
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

function pluralize(count: number, singular: string, plural?: string) {
  if (Math.abs(count) === 1) {
    return `${count} ${singular}`
  }

  const computedPlural = plural ?? `${singular}s`
  return `${count} ${computedPlural}`
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
