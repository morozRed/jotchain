import { Head, usePage } from "@inertiajs/react"
import { Lightbulb } from "lucide-react"
import { useState } from "react"

import { InsightForm } from "@/components/insights/insight-form"
import { InsightModal } from "@/components/insights/insight-modal"
import { InsightPreview } from "@/components/insights/insight-preview"
import { InsightTemplateCards } from "@/components/insights/insight-template-cards"
import InsightsSubmenu from "@/components/insights/insights-submenu"
import type { InsightRequest, InsightsMeta } from "@/components/insights/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AppLayout from "@/layouts/app-layout"
import { insightsPath } from "@/routes"
import type { BreadcrumbItem, SharedData } from "@/types"

type PageProps = SharedData & {
  recentInsights: InsightRequest[]
  meta: InsightsMeta
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Insights",
    href: insightsPath(),
  },
]

export default function Insights() {
  const { recentInsights, meta } = usePage<PageProps>().props

  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>()
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>()
  const [selectedProjects, setSelectedProjects] = useState<string[]>(["all"])
  const [selectedInsight, setSelectedInsight] = useState<InsightRequest | null>(null)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Insights" />

      <div className="space-y-6 px-4 pb-10 pt-6 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
            <p className="text-muted-foreground mt-2">
              Generate AI-powered insights from your entries
            </p>
          </div>
        </div>

        <InsightsSubmenu />

        <Card>
          <CardHeader>
            <CardTitle>Generate Insights</CardTitle>
            <CardDescription>
              Select filters and choose a template to generate insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <InsightForm
              meta={meta}
              dateRangeStart={dateRangeStart}
              dateRangeEnd={dateRangeEnd}
              selectedProjects={selectedProjects}
              onDateRangeStartChange={setDateRangeStart}
              onDateRangeEndChange={setDateRangeEnd}
              onProjectsChange={setSelectedProjects}
            />

            <InsightPreview
              dateRangeStart={dateRangeStart}
              dateRangeEnd={dateRangeEnd}
              projectIds={selectedProjects}
            />

            <InsightTemplateCards
              meta={meta}
              dateRangeStart={dateRangeStart}
              dateRangeEnd={dateRangeEnd}
              projectIds={selectedProjects}
              onInsightGenerated={setSelectedInsight}
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
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
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
      </div>
    </AppLayout>
  )
}
