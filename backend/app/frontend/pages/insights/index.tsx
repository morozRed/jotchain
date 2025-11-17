import { Head, Link, router, usePage } from "@inertiajs/react"
import { AlertCircle, Lightbulb, Sparkles, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { InsightForm } from "@/components/insights/insight-form"
import { InsightItem } from "@/components/insights/insight-item"
import { InsightModal } from "@/components/insights/insight-modal"
import { InsightPreview } from "@/components/insights/insight-preview"
import { InsightTemplateCards } from "@/components/insights/insight-template-cards"
import type { InsightRequest, InsightsMeta, PaginationData } from "@/components/insights/types"
import { PageBody } from "@/components/page/page-body"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
              Insights
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Generate AI-powered insights from your entries
            </p>
          </div>

          {/* Quota Display - Desktop */}
          <div className="hidden lg:block">
            <div className="rounded-lg border bg-card p-4 text-sm min-w-[200px]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Monthly Quota
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {remainingGenerations} left
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        limitReached ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {generationLimit - remainingGenerations} / {generationLimit} used
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Generation Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>Generate New Insight</CardTitle>
                <CardDescription>
                  Choose your date range and projects, then select a template
                </CardDescription>
              </div>
              <InsightForm
                meta={meta}
                dateRangeStart={dateRangeStart}
                dateRangeEnd={dateRangeEnd}
                selectedProjects={selectedProjects}
                onDateRangeStartChange={setDateRangeStart}
                onDateRangeEndChange={setDateRangeEnd}
                onProjectsChange={setSelectedProjects}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quota Display - Mobile */}
            <div className="lg:hidden rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monthly quota:</span>
                <span className="font-semibold">
                  {remainingGenerations} / {generationLimit} remaining
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    limitReached ? "bg-destructive" : "bg-primary"
                  }`}
                style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>

          {!hasInsightAccess && (
            <UpgradeBanner
              description={subscriptionMessage}
              href={billingPath()}
            />
          )}

          {alertMessage && (
            <InlineAlert message={alertMessage} onDismiss={() => setAlertMessage(null)} />
          )}

            <InsightTemplateCards
              meta={meta}
              dateRangeStart={dateRangeStart}
              dateRangeEnd={dateRangeEnd}
              projectIds={selectedProjects}
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
            />
          </CardContent>
        </Card>

        {/* All Insights Section */}
        {insightList.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Insights</h2>
              {paginationData?.totalCount ? (
                <p className="text-sm text-muted-foreground">
                  {paginationData.totalCount}{" "}
                  {paginationData.totalCount === 1 ? "insight" : "insights"} total
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
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
          </>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Generate your first insight by selecting a date range and template above
              </p>
            </CardContent>
          </Card>
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
    <Card className="border-orange-500/40 bg-orange-500/10 dark:border-orange-500/50 dark:bg-orange-500/5">
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-orange-600 dark:text-orange-400" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">{description}</p>
            <p className="text-xs text-orange-800/80 dark:text-orange-200/80">
              Upgrade now to unlock unlimited AI-generated insights.
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="sm:shrink-0">
          <Link href={href}>Upgrade</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function InlineAlert({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Card className="border-destructive/40 bg-destructive/10">
      <CardContent className="flex items-start gap-3 py-4">
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
      </CardContent>
    </Card>
  )
}
