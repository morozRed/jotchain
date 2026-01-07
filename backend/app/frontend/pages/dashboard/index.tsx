import { Head, Link, router, useForm, usePage } from "@inertiajs/react"
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  FileText,
  Plus,
  RefreshCw,
  Settings,
  Target,
} from "lucide-react"
import { useEffect, useState } from "react"

import { AppHeader } from "@/components/app-header"
import { type DashboardEntry } from "@/components/dashboard/entries-card"
import InputError from "@/components/input-error"
import { TiptapEditor } from "@/components/tiptap-editor"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  CommandDialog,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { getEmptyTiptapDocument } from "@/lib/tiptap-utils"
import type { SharedData } from "@/types"

// Signal types
interface SignalEntry {
  id: number
  role: string
  excerpt: string
  loggedAt: string | null
}

interface Signal {
  id: number
  signalType: string
  entityName: string
  title: string
  status: string
  confidence: number
  entryCount: number
  sentiment: "negative" | "positive"
  label: string
  isNew: boolean
  entries: SignalEntry[]
  entities: Array<{ entityType: string; name: string; count: number }>
  lastDetectedAt?: string | null
}

interface SignalsData {
  summary: {
    total_active: number
    unseen_count: number
    negative_count: number
    positive_count: number
  }
  signals: Signal[]
  history: Signal[]
  counts: Record<string, number>
}

interface EntryStats {
  count: number
  lastLoggedAt?: string | null
  currentStreak?: number
}

type PageProps = SharedData & {
  entries: DashboardEntry[]
  entryStats: EntryStats
  signals: SignalsData
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

// Fixed diagnostic categories with observational empty states
const DIAGNOSTIC_CATEGORIES = [
  {
    id: "interruptions",
    label: "Interruptions",
    icon: AlertCircle,
    signalTypes: ["blockers", "time_sinks"],
    emptyText: "Not observed in recent notes",
  },
  {
    id: "unplanned_help",
    label: "Unplanned help",
    icon: RefreshCw,
    signalTypes: ["recurring_issues", "impact"],
    emptyText: "No recurring instances detected",
  },
  {
    id: "deep_work",
    label: "Deep work",
    icon: Target,
    signalTypes: ["wins", "learnings"],
    emptyText: "Not observed in recent notes",
  },
] as const

// Format relative time
function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Format time anchor for history
function formatTimeAnchor(dateString: string | null): string {
  if (!dateString) return "Previously"
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 3) return "Earlier this week"
  if (diffDays < 7) return "This week"
  if (diffDays < 14) return "Last 14 days"
  return "Previously"
}

// Format timestamp for notes
function formatNoteTime(dateString: string | null): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

// Extract one-line excerpt from tiptap content
function extractExcerpt(body: string, maxLength: number = 80): string {
  try {
    const parsed = JSON.parse(body)
    const texts: string[] = []
    const traverse = (nodes: any[]) => {
      if (!nodes) return
      for (const node of nodes) {
        if (node.type === "text" && node.text) {
          texts.push(node.text)
        }
        if (node.type === "mention" && node.attrs?.label) {
          texts.push(`@${node.attrs.label}`)
        }
        if (node.content) traverse(node.content)
      }
    }
    traverse(parsed.content || [])
    const text = texts.join(" ").trim()
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + "…"
  } catch {
    const text = body.trim()
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + "…"
  }
}

// Render plain text with highlighted person names
function renderTextWithEntities(
  text: string,
  entities: Array<{ entityType: string; name: string }> = []
): React.ReactNode[] {
  const personNames = entities
    .filter((e) => e.entityType === "person")
    .map((e) => e.name)
    .filter(Boolean)

  if (personNames.length === 0) return [text]

  const escapedNames = personNames.map((name) =>
    name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  )
  const regex = new RegExp(`(${escapedNames.join("|")})`, "gi")
  const parts = text.split(regex)
  const lowerNames = personNames.map((n) => n.toLowerCase())

  return parts.map((part, idx) => {
    if (lowerNames.includes(part.toLowerCase())) {
      return (
        <span key={idx} className="font-medium text-primary">
          {part}
        </span>
      )
    }
    return <span key={idx}>{part}</span>
  })
}

// Signal category component - clear contrast, readable
function SignalCategory({
  category,
  signals,
}: {
  category: (typeof DIAGNOSTIC_CATEGORIES)[number]
  signals: Signal[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const categorySignals = signals.filter((s) =>
    category.signalTypes.includes(s.signalType)
  )
  const hasSignals = categorySignals.length > 0
  const isNegative = categorySignals.some((s) => s.sentiment === "negative")

  // Collect all entries from all signals, keeping entity info for highlighting
  const allEntries = categorySignals.flatMap((signal) =>
    signal.entries.map((entry) => ({ ...entry, entities: signal.entities }))
  )

  // Deduplicate by entry id, keeping first occurrence (highest relevance)
  const uniqueEntries = allEntries.filter(
    (entry, index, self) => index === self.findIndex((e) => e.id === entry.id)
  )

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "group flex w-full items-start gap-4 py-5 text-left transition-colors",
            hasSignals && "cursor-pointer hover:bg-subtle/50"
          )}
          disabled={!hasSignals}
        >
          {/* Status indicator */}
          <span
            className={cn(
              "mt-1.5 size-2 shrink-0 rounded-full",
              hasSignals && isNegative
                ? "bg-primary"
                : hasSignals
                  ? "bg-emerald-500"
                  : "bg-border"
            )}
          />
          <div className="min-w-0 flex-1">
            <span
              className={cn(
                "block text-[15px] leading-tight",
                hasSignals ? "font-medium text-foreground" : "text-foreground/70"
              )}
            >
              {category.label}
            </span>
            <span className={cn(
              "mt-1 block text-[14px] leading-relaxed",
              hasSignals ? "text-foreground/70" : "text-muted-foreground"
            )}>
              {hasSignals ? categorySignals[0].title : category.emptyText}
            </span>
          </div>
          {hasSignals && (
            <ChevronRight
              className={cn(
                "mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-150",
                isOpen && "rotate-90"
              )}
            />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="mb-4 ml-6 space-y-3 border-l-2 border-border pl-5">
          {uniqueEntries.slice(0, 6).map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 text-[13px]">
              <span className="shrink-0 pt-0.5 tabular-nums text-muted-foreground">
                {formatRelativeTime(entry.loggedAt)}
              </span>
              <span className="text-foreground/80 leading-relaxed">
                {renderTextWithEntities(entry.excerpt, entry.entities)}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// Past signal row - secondary column style, readable
function PastSignalRow({ signal }: { signal: Signal }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="group flex w-full items-start gap-2 py-2 text-left">
          <ChevronRight
            className={cn(
              "mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
              isOpen && "rotate-90"
            )}
          />
          <div className="min-w-0 flex-1">
            <span className="block text-[13px] leading-snug text-foreground/80 group-hover:text-foreground">
              {signal.title}
            </span>
            <span className="mt-0.5 block text-[11px] tabular-nums text-muted-foreground">
              {formatTimeAnchor(signal.lastDetectedAt || null)}
            </span>
          </div>
        </button>
      </CollapsibleTrigger>
      {signal.entries.length > 0 && (
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="mb-2 ml-5 space-y-1.5">
            {signal.entries.slice(0, 2).map((entry) => (
              <p key={entry.id} className="text-[11px] leading-relaxed text-muted-foreground">
                {entry.excerpt}
              </p>
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}

// Summary headline generator
function getSummaryHeadline(signals: SignalsData): {
  headline: string
  description: string
} {
  const { summary } = signals

  if (summary.total_active === 0 || summary.negative_count === 0) {
    return {
      headline: "Recent work appears steady",
      description: "No notable patterns detected in recent notes",
    }
  }

  if (summary.negative_count >= 2) {
    return {
      headline: "Recent work has been fragmented",
      description: `${summary.negative_count} recurring disruptions observed`,
    }
  }

  const negativeSignals = signals.signals.filter((s) => s.sentiment === "negative")
  if (summary.negative_count === 1 && negativeSignals[0]) {
    return {
      headline: negativeSignals[0].title,
      description: "Pattern detected that may need attention",
    }
  }

  return {
    headline: "Recent work appears steady",
    description: "No notable patterns detected in recent notes",
  }
}

export default function Dashboard() {
  const { props: pageProps } = usePage<PageProps>()
  const { signals, auth, entries, selectedDate, previousDate, nextDate, isToday, selectedDateFormatted } = pageProps
  const user = auth.user

  const [editorOpen, setEditorOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [pastSignalsOpen, setPastSignalsOpen] = useState(true)
  const [recentNotesOpen, setRecentNotesOpen] = useState(true)

  const entryForm = useForm<EntryFormState>({
    entry: {
      body: getEmptyTiptapDocument(),
    },
  })

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
      // ⌘. for add note
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault()
        setEditorOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleEntryBodyChange = (value: string) => {
    entryForm.setData("entry", {
      ...entryForm.data.entry,
      body: value,
    })
  }

  const submitEntryRequest = () => {
    if (entryForm.processing) return

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
        setEditorOpen(false)
      },
    })
  }

  const handleEditorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitEntryRequest()
  }

  const handleEntryShortcut: React.KeyboardEventHandler = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      submitEntryRequest()
    }
  }

  const summaryInfo = getSummaryHeadline(signals)
  const updatedAt = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const hasHistory = signals.history && signals.history.length > 0
  const recentNotes = entries.slice(0, 5)
  const hasRecentNotes = recentNotes.length > 0

  return (
    <>
      <Head title="Dashboard" />

      <div className="flex min-h-screen flex-col bg-background">
        {/* Shared header */}
        <AppHeader onCommandOpen={() => setCommandOpen(true)} />

        {/* Main content - asymmetrical two-column layout */}
        <main className="flex flex-1">
          <div className="mx-auto flex w-full max-w-6xl gap-0 px-6 py-6 lg:px-12 lg:py-8">

            {/* ═══════════════════════════════════════════════════════════════════
                PRIMARY COLUMN (65-70%) - Meaning, authority, the system's voice
                ═══════════════════════════════════════════════════════════════════ */}
            <div className="flex-1 pr-8 lg:pr-16">

              {/* Timestamp - small, utilitarian */}
              <div className="mb-6">
                <span className="text-[11px] tabular-nums tracking-wide text-muted-foreground">
                  {updatedAt}
                </span>
              </div>

              {/* Work state headline - confident but not overwhelming */}
              <h1 className="text-[22px] font-semibold leading-[1.2] tracking-tight text-foreground sm:text-[26px] lg:text-[28px]">
                {summaryInfo.headline}
              </h1>

              {/* Explanatory sentence - clear, readable */}
              <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-muted-foreground lg:text-[15px]">
                {summaryInfo.description}
              </p>

              {/* Diagnostics section - generous spacing */}
              <section className="mt-14 lg:mt-20">
                <h2 className="mb-6 text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
                  Diagnostics
                </h2>
                <div className="divide-y divide-border-subtle">
                  {DIAGNOSTIC_CATEGORIES.map((category) => (
                    <SignalCategory
                      key={category.id}
                      category={category}
                      signals={signals.signals}
                    />
                  ))}
                </div>
              </section>

            </div>

            {/* ═══════════════════════════════════════════════════════════════════
                SECONDARY COLUMN (30-35%) - Reference, subordinate but readable
                ═══════════════════════════════════════════════════════════════════ */}
            <aside className="hidden w-72 shrink-0 border-l border-border pl-8 lg:block lg:w-80 lg:pl-10">

              {/* Past signals - collapsed by default */}
              <div className="mb-6">
                <Collapsible open={pastSignalsOpen} onOpenChange={setPastSignalsOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="group flex w-full items-center gap-2 py-2 text-left">
                      <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground">
                        Past signals
                      </span>
                      {hasHistory && (
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          ({signals.history.length})
                        </span>
                      )}
                      <ChevronDown
                        className={cn(
                          "ml-auto size-4 text-muted-foreground transition-transform duration-150",
                          pastSignalsOpen && "rotate-180"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    {hasHistory ? (
                      <div className="mt-2 space-y-0">
                        {signals.history.slice(0, 5).map((signal) => (
                          <PastSignalRow key={signal.id} signal={signal} />
                        ))}
                        {signals.history.length > 5 && (
                          <p className="pt-2 text-[11px] text-muted-foreground">
                            +{signals.history.length - 5} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                        Resolved signals will appear here
                      </p>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Recent notes with day navigation */}
              <div>
                <Collapsible open={recentNotesOpen} onOpenChange={setRecentNotesOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="group flex w-full items-center gap-2 py-2 text-left">
                      <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground">
                        Notes
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        ({recentNotes.length})
                      </span>
                      <ChevronDown
                        className={cn(
                          "ml-auto size-4 text-muted-foreground transition-transform duration-150",
                          recentNotesOpen && "rotate-180"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="mt-2">
                      {/* Day navigation */}
                      <div className="mb-3 flex items-center justify-between">
                        <button
                          onClick={() => router.visit(`/dashboard?date=${previousDate}`)}
                          className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <span className="text-[12px] font-medium text-foreground/70">
                          {isToday ? "Today" : new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <button
                          onClick={() => router.visit(`/dashboard?date=${nextDate}`)}
                          disabled={isToday}
                          className={cn(
                            "flex size-6 items-center justify-center rounded transition-colors",
                            isToday
                              ? "text-muted-foreground/30 cursor-not-allowed"
                              : "text-muted-foreground hover:bg-subtle hover:text-foreground"
                          )}
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>

                      {/* Notes list */}
                      {hasRecentNotes ? (
                        <div className="space-y-2.5">
                          {recentNotes.map((entry) => (
                            <div key={entry.id} className="flex items-start gap-2">
                              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                                {formatNoteTime(entry.loggedAt)}
                              </span>
                              <span className="min-w-0 flex-1 text-[12px] leading-snug text-foreground/70">
                                {extractExcerpt(entry.body, 60)}
                              </span>
                            </div>
                          ))}
                          <Link
                            href="/log"
                            className="mt-3 block text-[11px] text-primary transition-colors hover:text-primary/80"
                          >
                            View all →
                          </Link>
                        </div>
                      ) : (
                        <p className="py-4 text-center text-[12px] text-muted-foreground">
                          No notes for this day
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

            </aside>

          </div>
        </main>

        {/* Floating action */}
        <button
          onClick={() => setEditorOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 transition-all",
            "bg-foreground text-background shadow-lg hover:scale-[1.02] hover:shadow-xl",
            "focus:outline-none focus:ring-2 focus:ring-foreground/30 focus:ring-offset-2"
          )}
        >
          <kbd className="flex items-center gap-0.5 rounded bg-background/20 px-1.5 py-0.5 text-[11px] font-medium">
            <Command className="size-3" />
            <span>.</span>
          </kbd>
          <span className="text-[13px] font-medium">Add note</span>
        </button>

        {/* Editor modal */}
        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="max-w-lg gap-0 p-0" showCloseButton={false}>
            <form onSubmit={handleEditorSubmit}>
              <div className="p-4">
                <p className="mb-3 text-[13px] text-muted-foreground">
                  Add context while it's fresh
                </p>
                <TiptapEditor
                  value={entryForm.data.entry.body}
                  onChange={handleEntryBodyChange}
                  onKeyDown={handleEntryShortcut}
                  placeholder="What's happening with your work right now..."
                  autoFocus
                  className="min-h-[140px] text-[14px]"
                />
                <InputError
                  message={entryForm.errors.body as string | undefined}
                  className="mt-2"
                />
              </div>
              <div className="flex items-center justify-between border-t border-border-subtle bg-subtle/30 px-4 py-3">
                <span className="text-[11px] text-muted-foreground">
                  <Command className="mb-0.5 inline size-3" />
                  +Enter to save
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditorOpen(false)}
                    className="h-7 px-3 text-[12px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={entryForm.processing}
                    className="h-7 px-3 text-[12px]"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Command palette */}
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <CommandList className="py-2">
            <CommandGroup heading="Actions">
              <CommandItem
                onSelect={() => {
                  setCommandOpen(false)
                  setEditorOpen(true)
                }}
              >
                <Plus className="mr-2 size-4" />
                Add context
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() => {
                  setCommandOpen(false)
                  router.visit("/log")
                }}
              >
                <FileText className="mr-2 size-4" />
                Go to Log
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setCommandOpen(false)
                  router.visit("/billing")
                }}
              >
                <CreditCard className="mr-2 size-4" />
                Go to Billing
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Settings">
              <CommandItem
                onSelect={() => {
                  setCommandOpen(false)
                  router.visit("/settings/profile")
                }}
              >
                <Settings className="mr-2 size-4" />
                Settings
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </>
  )
}
