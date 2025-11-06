import { Head, useForm, usePage } from "@inertiajs/react"
import { Command, CornerDownLeft, Send, Sparkles } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
      data: {
        entry: {
          ...entryForm.data.entry,
          body_format: "tiptap",
        },
      },
      preserveScroll: true,
      onSuccess: () => {
        entryForm.setData("entry", { body: getEmptyTiptapDocument(), tag: "" })
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
                    <TiptapEditor
                      value={entryForm.data.entry.body}
                      onChange={(value) => handleEntryChange("body", value)}
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
                    <InputError message={entryForm.errors.tag as string | undefined} />
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
