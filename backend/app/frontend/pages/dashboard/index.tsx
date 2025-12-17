import { Head, useForm, usePage } from "@inertiajs/react"
import { Command, CornerDownLeft, Send } from "lucide-react"

import { DashboardEntriesCard, type DashboardEntry } from "@/components/dashboard/entries-card"
import InputError from "@/components/input-error"
import { TiptapEditor } from "@/components/tiptap-editor"
import { Button } from "@/components/ui/button"
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
    title: "Log",
    href: dashboardPath(),
  },
]

export default function Dashboard() {
  const { props: pageProps } = usePage<PageProps>()
  const {
    entries,
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
      <Head title="Log" />

      <div className="flex h-full flex-1 flex-col gap-6 px-4 pb-10 pt-6 md:px-6">
        {/* Page header - simple and quiet */}
        <header>
          <h1 className="text-2xl font-semibold text-foreground">
            Log today&apos;s work
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            A few notes now save time later.
          </p>
        </header>

        {/* Main content: Editor + Right rail */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_320px]">
          {/* Editor section - document page style */}
          <section className="flex flex-col">
            <form onSubmit={submitEntry} className="flex flex-1 flex-col">
              <div className="relative flex flex-1 flex-col rounded-xl border border-border-subtle bg-surface p-5">
                <TiptapEditor
                  value={entryForm.data.entry.body}
                  onChange={handleEntryBodyChange}
                  onKeyDown={handleEntryShortcut}
                  placeholder="Shipped auth refactor, fixed API timeout issues, reviewed @backend PRs..."
                  autoFocus
                  className="min-h-[280px] flex-1 pb-14 text-[15px] leading-relaxed"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    2-4 short notes are usually enough
                  </span>
                  <Button
                    type="submit"
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
              </div>
              <InputError message={entryForm.errors.body as string | undefined} className="mt-2" />
            </form>
          </section>

          {/* Right rail - calm context */}
          <aside className="flex flex-col gap-6">
            {/* Where this shows up */}
            <div className="rounded-xl border border-border-subtle bg-surface p-4">
              <p className="text-sm font-medium text-foreground mb-3">This will show up in</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Weekly update
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Next 1:1
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Review
                </li>
              </ul>
            </div>

            {/* Previous entries */}
            <DashboardEntriesCard
              entries={entries}
              selectedDateFormatted={selectedDateFormatted}
              previousDate={previousDate}
              nextDate={nextDate}
              isToday={isToday}
            />
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}
