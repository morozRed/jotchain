import { Head, Link, router, usePage } from "@inertiajs/react"
import { Lightbulb } from "lucide-react"
import { useEffect } from "react"

import { EmptyState } from "@/components/empty-state"
import { InsightItem } from "@/components/insights/insight-item"
import type { InsightRequest, PaginationData } from "@/components/insights/types"
import { PageBody } from "@/components/page/page-body"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import AppLayout from "@/layouts/app-layout"
import { historyInsightsPath, insightsPath } from "@/routes"
import type { BreadcrumbItem, SharedData } from "@/types"

type PageProps = SharedData & {
  insights: InsightRequest[]
  pagination: PaginationData
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Insights",
    href: insightsPath(),
  },
  {
    title: "History",
    href: historyInsightsPath(),
  },
]

export default function InsightsHistory() {
  const { insights, pagination } = usePage<PageProps>().props

  // Poll for active insights
  useEffect(() => {
    const activeInsights = insights.filter(
      (insight) => insight.status === "pending" || insight.status === "generating"
    )

    if (activeInsights.length === 0) return

    const intervals = activeInsights.map((insight) => {
      return setInterval(async () => {
        try {
          const response = await fetch(`/insights/${insight.id}`)
          const updatedInsight: InsightRequest = await response.json()

          if (updatedInsight.status === "completed" || updatedInsight.status === "failed") {
            // Reload page to get updated insights list
            router.reload({ only: ["insights"] })
          }
        } catch (error) {
          console.error("Failed to poll insight status", error)
        }
      }, 2000)
    })

    return () => {
      intervals.forEach((interval) => clearInterval(interval))
    }
  }, [insights])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Insights History" />

      <PageBody>
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
            History
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            View all generated insights from your entries
          </p>
        </header>

        {insights.length === 0 ? (
          <Card className="border-dashed">
            <CardContent>
              <EmptyState
                title="No insights yet"
                description="Generated insights will appear here once you create them."
                className="border-0 bg-transparent p-0"
                icon={<Lightbulb />}
                action={
                  <Link href={insightsPath()}>
                    <Button>Generate Your First Insight</Button>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {insights.map((insight) => (
                <InsightItem key={insight.id} {...insight} />
              ))}
            </div>

            {pagination.totalCount > 0 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                perPage={pagination.perPage}
                baseUrl={historyInsightsPath()}
                itemName="insights"
              />
            )}
          </>
        )}
      </PageBody>
    </AppLayout>
  )
}
