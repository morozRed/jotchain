import { Head, Link, usePage } from "@inertiajs/react"
import { Lightbulb } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { InsightItem } from "@/components/insights/insight-item"
import InsightsSubmenu from "@/components/insights/insights-submenu"
import type { InsightRequest, PaginationData } from "@/components/insights/types"
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Insights History" />

      <div className="space-y-6 px-4 pb-10 pt-6 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">History</h1>
            <p className="text-muted-foreground mt-2">
              View all generated insights from your entries
            </p>
          </div>
        </div>

        <InsightsSubmenu />

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

            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                perPage={pagination.perPage}
                baseUrl={historyInsightsPath()}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
