import { Head, router, usePage } from "@inertiajs/react"
import { Lightbulb } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { InsightForm } from "@/components/insights/insight-form"
import { InsightItem } from "@/components/insights/insight-item"
import { InsightModal } from "@/components/insights/insight-modal"
import { InsightPreview } from "@/components/insights/insight-preview"
import { InsightTemplateCards } from "@/components/insights/insight-template-cards"
import type { InsightRequest, InsightsMeta, PaginationData } from "@/components/insights/types"
import { PageBody } from "@/components/page/page-body"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import AppLayout from "@/layouts/app-layout"
import { insightsPath } from "@/routes"
import type { BreadcrumbItem, SharedData } from "@/types"

type PageProps = SharedData & {
  insights: InsightRequest[]
  pagination: PaginationData
  hasActiveInsights: boolean
  meta: InsightsMeta
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Insights",
    href: insightsPath(),
  },
]

export default function Insights() {
  const page = usePage<PageProps>()
  const { insights, pagination, hasActiveInsights: initialHasActiveInsights, meta } =
    page.props as PageProps

  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>()
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>()
  const [selectedProjects, setSelectedProjects] = useState<string[]>(["all"])
  const [selectedInsight, setSelectedInsight] = useState<InsightRequest | null>(null)
  const [hasActiveInsights, setHasActiveInsights] = useState(initialHasActiveInsights)
  const [insightList, setInsightList] = useState<InsightRequest[]>(insights)
  const [paginationData, setPaginationData] = useState<PaginationData>(pagination)

  const generationLimit = meta.monthlyGenerationLimit ?? 20
  const initialUsage = meta.monthlyGenerationUsage ?? 0
  const initialRemainingQuota = useMemo(
    () => Math.max(generationLimit - initialUsage, 0),
    [generationLimit, initialUsage],
  )
  const [remainingGenerations, setRemainingGenerations] = useState(initialRemainingQuota)
  const limitReached = remainingGenerations <= 0

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
                      style={{
                        width: `${Math.min(
                          (generationLimit - remainingGenerations) / generationLimit * 100,
                          100,
                        )}%`,
                      }}
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
                  style={{
                    width: `${Math.min(
                      (generationLimit - remainingGenerations) / generationLimit * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            <InsightTemplateCards
              meta={meta}
              dateRangeStart={dateRangeStart}
              dateRangeEnd={dateRangeEnd}
              projectIds={selectedProjects}
              hasActiveInsights={hasActiveInsights}
              generationLimit={generationLimit}
              remainingGenerations={remainingGenerations}
              onQuotaConsumed={() =>
                setRemainingGenerations((prev) => Math.max(prev - 1, 0))
              }
              onInsightQueued={upsertInsight}
              onInsightGenerated={(insight) => {
                upsertInsight(insight)
                setSelectedInsight(insight)
              }}
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
