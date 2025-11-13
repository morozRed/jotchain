import { Head, router, usePage } from "@inertiajs/react"
import { Lightbulb } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { InsightForm } from "@/components/insights/insight-form"
import { InsightModal } from "@/components/insights/insight-modal"
import { InsightPreview } from "@/components/insights/insight-preview"
import { InsightTemplateCards } from "@/components/insights/insight-template-cards"
import type { InsightRequest, InsightsMeta } from "@/components/insights/types"
import { PageBody } from "@/components/page/page-body"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AppLayout from "@/layouts/app-layout"
import { insightsPath } from "@/routes"
import type { BreadcrumbItem, SharedData } from "@/types"

type PageProps = SharedData & {
  recentInsights: InsightRequest[]
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
  const { recentInsights, hasActiveInsights: initialHasActiveInsights, meta } =
    page.props as PageProps

  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>()
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>()
  const [selectedProjects, setSelectedProjects] = useState<string[]>(["all"])
  const [selectedInsight, setSelectedInsight] = useState<InsightRequest | null>(null)
  const [hasActiveInsights, setHasActiveInsights] = useState(initialHasActiveInsights)

  const generationLimit = meta.monthlyGenerationLimit ?? 20
  const initialUsage = meta.monthlyGenerationUsage ?? 0
  const initialRemainingQuota = useMemo(
    () => Math.max(generationLimit - initialUsage, 0),
    [generationLimit, initialUsage],
  )
  const [remainingGenerations, setRemainingGenerations] = useState(initialRemainingQuota)
  const limitReached = remainingGenerations <= 0

  useEffect(() => {
    setRemainingGenerations(initialRemainingQuota)
  }, [initialRemainingQuota])

  // Poll for active insights on page load
  useEffect(() => {
    if (!hasActiveInsights) return

    const activeInsights = recentInsights.filter(
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
            router.reload({ only: ["recentInsights", "hasActiveInsights"] })
          }
        } catch (error) {
          console.error("Failed to poll insight status", error)
        }
      }, 2000)
    })

    return () => {
      intervals.forEach((interval) => clearInterval(interval))
    }
  }, [hasActiveInsights, recentInsights])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Insights" />

      <PageBody>
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
            Insights
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Generate AI-powered insights from your entries
          </p>
        </header>

        <Card>
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between">
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <CardTitle>Generate Insights</CardTitle>
                <CardDescription>
                  Select filters and choose a template to generate insights
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
            <div className="hidden rounded-lg border border-dashed border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground lg:block lg:w-[18rem] lg:self-start space-y-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-primary">Quota</p>
                <p className="font-semibold text-foreground">AI generations</p>
                <p className="text-2xl font-bold text-primary">
                  {generationLimit - remainingGenerations}
                  <span className="text-base text-muted-foreground"> / {generationLimit} used</span>
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full rounded-full bg-primary/15">
                  <div
                    className={`h-full rounded-full ${
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
                {limitReached && (
                  <p className="text-xs font-medium text-destructive">Monthly limit reached</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
              onInsightGenerated={(insight) => {
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

        {recentInsights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentInsights.map((insight) => (
                  <button
                    key={insight.id}
                    onClick={() => setSelectedInsight(insight)}
                    className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lightbulb className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{insight.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(insight.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
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
