import { Head, useForm, usePage } from "@inertiajs/react"
import {
  CalendarDays,
  Inbox,
  PencilLine,
  Send,
  Sparkles,
} from "lucide-react"

import InputError from "@/components/input-error"
import AppLayout from "@/layouts/app-layout"
import type { SharedData } from "@/types"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { dashboardPath } from "@/routes"

type DashboardEntry = {
  id: number
  body: string
  tag?: string | null
  loggedAt?: string | null
  loggedAtLabel?: string | null
  createdAtAgo: string
  createdAt: string
}

type EntryStats = {
  count: number
  lastLoggedAt?: string | null
  currentStreak?: number
}

type PageProps = SharedData & {
  entries: DashboardEntry[]
  entryStats: EntryStats
}

type EntryFormState = {
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
  const { entries, entryStats } = props

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

  const submitEntry: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    entryForm.post("/entries", {
      preserveScroll: true,
      onSuccess: () => {
        entryForm.setData("entry", { body: "", tag: "" })
        entryForm.clearErrors()
      },
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="flex h-full flex-1 flex-col gap-3 px-4 pb-10 pt-6 md:px-6">
        <header className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
                Walk into every stand-up prepared
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
                Capture daily wins, tune your meeting cadence, and let JotChain shape the AI brief that hits your inbox before every conversation.
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

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PencilLine className="size-5 text-primary" />
              Quick entry
            </CardTitle>
            <CardDescription>
              Log what moved today. Summaries pull directly from this feed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitEntry} className="flex flex-col gap-4">
              <div className="space-y-3">
                <Label htmlFor="entry-body">What did you work on?</Label>
                <Textarea
                  id="entry-body"
                  value={entryForm.data.entry.body}
                  onChange={(event) =>
                    handleEntryChange("body", event.target.value)
                  }
                  placeholder="Ship, fix, support, coach. Capture details your future self will need."
                  aria-invalid={Boolean(entryForm.errors.body)}
                  autoFocus
                />
                <InputError message={entryForm.errors.body} />
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex-1 space-y-3">
                  <Label htmlFor="entry-tag">Tag with project or area</Label>
                  <Input
                    id="entry-tag"
                    value={entryForm.data.entry.tag}
                    onChange={(event) =>
                      handleEntryChange("tag", event.target.value)
                    }
                    placeholder="ex: Billing revamp, Platform, Hiring"
                    aria-invalid={Boolean(entryForm.errors.tag)}
                  />
                  <InputError message={entryForm.errors.tag} />
                </div>
                <Button
                  type="submit"
                  className="mt-2 w-full md:mt-6 md:w-auto"
                  disabled={entryForm.processing}
                >
                  {entryForm.processing && (
                    <Send className="mr-2 size-4 animate-spin" />
                  )}
                  Save entry
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="border-t bg-muted/30 text-xs text-muted-foreground">
            <div className="flex w-full flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <span>
                Tips: aim for 2-4 bullet thoughts, include impact, blockers,
                and recognitions.
              </span>
              {entryStats.lastLoggedAt && (
                <span className="font-medium text-foreground">
                  Last logged:{" "}
                  {new Date(entryStats.lastLoggedAt).toLocaleString()}
                </span>
              )}
            </div>
          </CardFooter>
        </Card>

        <EntriesCard entries={entries} />
      </div>
    </AppLayout>
  )
}

function EntriesCard({ entries }: { entries: DashboardEntry[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Inbox className="size-5 text-primary" />
          Recent entries
        </CardTitle>
        <CardDescription>
          Yesterday&apos;s notes fuel tomorrow&apos;s stand-up summary.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {entries.length === 0 && (
          <EmptyState
            icon={<Sparkles className="size-5 text-primary" />}
            title="No entries yet"
            subtitle="Add your first note above to kick off the chain. We’ll keep it organized."
          />
        )}

        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-lg border border-border/60 bg-background/40 p-4 shadow-xs transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
          </article>
        ))}
      </CardContent>
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
