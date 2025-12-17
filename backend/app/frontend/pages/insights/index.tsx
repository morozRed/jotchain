import { Head, Link, router, usePage } from "@inertiajs/react"
import { AlertCircle, Sparkles, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { InsightForm } from "@/components/insights/insight-form"
import { InsightItem } from "@/components/insights/insight-item"
import { InsightModal } from "@/components/insights/insight-modal"
import { InsightPreview } from "@/components/insights/insight-preview"
import { InsightTemplateCards } from "@/components/insights/insight-template-cards"
import type { InsightRequest, InsightsMeta, PaginationData } from "@/components/insights/types"
import { PageBody } from "@/components/page/page-body"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import AppLayout from "@/layouts/app-layout"
import { billingPath, insightsPath } from "@/routes"
import type { BreadcrumbItem, SharedData } from "@/types"

type PageProps = SharedData & {
  insights: InsightRequest[]
  pagination: PaginationData
  hasActiveInsights: boolean
  meta: InsightsMeta
}

type SubscriptionInfo = {
  status?: string
  daysLeftInTrial?: number | null
  activeSubscription?: boolean
  trialActive?: boolean
  trialExpired?: boolean
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Insights",
    href: insightsPath(),
  },
]

export default function Insights() {
  const page = usePage<PageProps>()
  const {
    insights,
    pagination,
    hasActiveInsights: initialHasActiveInsights,
    meta,
    auth,
  } =
    page.props as PageProps

  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>()
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>()
  const [selectedProjects, setSelectedProjects] = useState<string[]>(["all"])
  const [selectedPersons, setSelectedPersons] = useState<string[]>(["all"])
  const [selectedInsight, setSelectedInsight] = useState<InsightRequest | null>(null)
  const [hasActiveInsights, setHasActiveInsights] = useState(initialHasActiveInsights)
  const [insightList, setInsightList] = useState<InsightRequest[]>(insights)
  const [paginationData, setPaginationData] = useState<PaginationData>(pagination)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const generationLimit = meta.monthlyGenerationLimit ?? 20
  const initialUsage = meta.monthlyGenerationUsage ?? 0
  const initialRemainingQuota = useMemo(
    () => Math.max(generationLimit - initialUsage, 0),
    [generationLimit, initialUsage],
  )
  const [remainingGenerations, setRemainingGenerations] = useState(initialRemainingQuota)
  const limitReached = remainingGenerations <= 0
  const usagePercent =
    generationLimit > 0
      ? Math.min(((generationLimit - remainingGenerations) / generationLimit) * 100, 100)
      : 0
  const subscription = auth.user?.subscription as SubscriptionInfo | undefined
  const hasInsightAccess = Boolean(subscription?.activeSubscription || subscription?.trialActive)
  const subscriptionMessage = subscription?.trialExpired
    ? "Your free trial has ended. Subscribe to continue generating insights."
    : "Upgrade to Pro to generate new insights."

  useEffect(() => {
    setInsightList(insights)
  }, [insights])

  useEffect(() => {
    setPaginationData(pagination)
  }, [pagination])

  useEffect(() => {
    setRemainingGenerations(initialRemainingQuota)
  }, [initialRemainingQuota])

  const upsertInsight = (incomingInsight: InsightRequest) => {
    let alreadyPresent = false

    setInsightList((prev) => {
      const existingIndex = prev.findIndex((insight) => insight.id === incomingInsight.id)
      alreadyPresent = existingIndex !== -1

      if (alreadyPresent) {
        const updated = [...prev]
        updated[existingIndex] = incomingInsight
        return updated
      }

      return [incomingInsight, ...prev]
    })

    if (!alreadyPresent) {
      setPaginationData((prev) => {
        if (!prev) return prev

        const updatedTotal = prev.totalCount + 1
        return {
          ...prev,
          totalCount: updatedTotal,
          totalPages: Math.max(prev.totalPages, Math.ceil(updatedTotal / prev.perPage)),
        }
      })
    }
  }

  // Poll for active insights on page load
  useEffect(() => {
    if (!hasActiveInsights) return

    const activeInsights = insightList.filter(
      (insight) => insight.status === "pending" || insight.status === "generating"
    )

    if (activeInsights.length === 0) {
      setHasActiveInsights(false)
      return
    }

    const intervals = activeInsights.map((insight) => {
      return setInterval(async () => {
        try {
          const response = await fetch(`/insights/${insight.id}`)
          const updatedInsight = (await response.json()) as InsightRequest

          if (updatedInsight.status === "completed" || updatedInsight.status === "failed") {
            // Reload page to get updated insights list
            router.reload({ only: ["insights", "hasActiveInsights", "pagination"] })
          }
        } catch (error) {
          console.error("Failed to poll insight status", error)
        }
      }, 2000)
    })

    return () => {
      intervals.forEach((interval) => clearInterval(interval))
    }
  }, [hasActiveInsights, insightList])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Insights" />

      <PageBody>
        {/* Page header - calm and clear */}
        <header>
          <h1 className="text-2xl font-semibold text-foreground">
            Insights
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Turn past notes into something you can send or use.
          </p>
        </header>

        {/* Generation Section */}
        <section className="space-y-5">
          {/* Filters row */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Sources
            </h2>
            <InsightForm
              meta={meta}
              dateRangeStart={dateRangeStart}
              dateRangeEnd={dateRangeEnd}
              selectedProjects={selectedProjects}
              selectedPersons={selectedPersons}
              onDateRangeStartChange={setDateRangeStart}
              onDateRangeEndChange={setDateRangeEnd}
              onProjectsChange={setSelectedProjects}
              onPersonsChange={setSelectedPersons}
            />
          </div>

          {alertMessage && (
            <InlineAlert message={alertMessage} onDismiss={() => setAlertMessage(null)} />
          )}

          <InsightTemplateCards
            meta={meta}
            dateRangeStart={dateRangeStart}
            dateRangeEnd={dateRangeEnd}
            projectIds={selectedProjects}
            personIds={selectedPersons}
            hasActiveInsights={hasActiveInsights}
            generationLimit={generationLimit}
            remainingGenerations={remainingGenerations}
            canGenerateInsights={hasInsightAccess}
            onQuotaConsumed={() =>
              setRemainingGenerations((prev) => Math.max(prev - 1, 0))
            }
            onInsightQueued={upsertInsight}
            onInsightGenerated={(insight) => {
              upsertInsight(insight)
              setSelectedInsight(insight)
            }}
            onAlert={setAlertMessage}
            onGenerationStarted={() => setHasActiveInsights(true)}
            onGenerationCompleted={() => setHasActiveInsights(false)}
          />

          <InsightPreview
            dateRangeStart={dateRangeStart}
            dateRangeEnd={dateRangeEnd}
            projectIds={selectedProjects}
            personIds={selectedPersons}
          />

          {/* Quota info - very subtle */}
          <p className="text-xs text-muted-foreground/70">
            {remainingGenerations}/{generationLimit} generations this month
          </p>

          {/* Upgrade banner - moved below main content to avoid interruption */}
          {!hasInsightAccess && (
            <UpgradeBanner
              description={subscriptionMessage}
              href={billingPath()}
            />
          )}
        </section>

        {/* All Insights Section */}
        {insightList.length > 0 ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-foreground">Previous insights</h2>
              {paginationData?.totalCount ? (
                <p className="text-xs text-muted-foreground">
                  {paginationData.totalCount}{" "}
                  {paginationData.totalCount === 1 ? "insight" : "insights"}
                </p>
              ) : null}
            </div>

            <div className="divide-y divide-border-subtle">
              {insightList.map((insight) => (
                <InsightItem key={insight.id} {...insight} />
              ))}
            </div>

            {paginationData?.totalPages > 1 && (
              <Pagination
                currentPage={paginationData.currentPage}
                totalPages={paginationData.totalPages}
                totalCount={paginationData.totalCount}
                perPage={paginationData.perPage}
                baseUrl={insightsPath()}
                itemName="insights"
              />
            )}
          </section>
        ) : (
          <section className="py-8 text-center">
            <p className="text-muted-foreground">
              Your generated summaries will appear here.
            </p>
          </section>
        )}

        {selectedInsight && (
          <InsightModal
            insight={selectedInsight}
            open={!!selectedInsight}
            onClose={() => setSelectedInsight(null)}
          />
        )}
      </PageBody>
    </AppLayout>
  )
}

function UpgradeBanner({ description, href }: { description: string; href: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 text-amber-600" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-amber-900">{description}</p>
          <p className="text-xs text-amber-800/80">
            Upgrade to continue generating insights.
          </p>
        </div>
      </div>
      <Button asChild size="sm" variant="secondary" className="sm:shrink-0">
        <Link href={href}>Upgrade</Link>
      </Button>
    </div>
  )
}

function InlineAlert({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
      <p className="flex-1 text-sm text-destructive">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md p-1 text-destructive transition hover:bg-destructive/10"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss alert</span>
      </button>
    </div>
  )
}
